import type { OAuthIdentity, OAuthProvider } from "../domain/identity.js";

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_ENDPOINT =
  "https://openidconnect.googleapis.com/v1/userinfo";
const PROVIDER_TIMEOUT_MS = 8_000;
const TOKEN_RESPONSE_LIMIT = 16_384;
const USER_INFO_RESPONSE_LIMIT = 65_536;
const encoder = new TextEncoder();

export interface GoogleOAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  timeoutMs: 8000;
}

export interface GoogleOAuthTestEndpoints {
  authorization: string;
  token: string;
  userInfo: string;
}

/** Google OAuth adapter. Endpoint replacement exists only for synthetic transports. */
export class GoogleOAuthProvider implements OAuthProvider {
  private readonly endpoints: GoogleOAuthTestEndpoints;

  constructor(
    private readonly config: GoogleOAuthProviderConfig,
    private readonly fetcher: typeof fetch = fetch,
    testEndpoints?: GoogleOAuthTestEndpoints,
  ) {
    if (config.timeoutMs !== PROVIDER_TIMEOUT_MS)
      throw new Error("OAuth provider configuration is invalid");
    this.endpoints = testEndpoints
      ? validateTestEndpoints(testEndpoints)
      : {
          authorization: GOOGLE_AUTHORIZATION_ENDPOINT,
          token: GOOGLE_TOKEN_ENDPOINT,
          userInfo: GOOGLE_USER_INFO_ENDPOINT,
        };
  }

  authorizationUrl(state: string, redirectUri: string): string {
    const url = new URL(this.endpoints.authorization);
    url.searchParams.set("client_id", this.config.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    return url.toString();
  }

  async verify(
    code: string,
    _state: string,
    redirectUri: string,
  ): Promise<OAuthIdentity> {
    try {
      const token = await this.exchangeCode(code, redirectUri);
      return await this.readIdentity(token);
    } catch {
      throw new Error("OAuth provider request failed");
    }
  }

  private async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });
    const value = await requestJson(
      this.fetcher,
      this.endpoints.token,
      {
        method: "POST",
        redirect: "error",
        headers: {
          accept: "application/json",
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
      },
      this.config.timeoutMs,
      TOKEN_RESPONSE_LIMIT,
    );
    return parseTokenResponse(value);
  }

  private async readIdentity(accessToken: string): Promise<OAuthIdentity> {
    return parseUserInfo(
      await requestJson(
        this.fetcher,
        this.endpoints.userInfo,
        {
          method: "GET",
          redirect: "error",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        },
        this.config.timeoutMs,
        USER_INFO_RESPONSE_LIMIT,
      ),
    );
  }
}

async function requestJson(
  fetcher: typeof fetch,
  input: string,
  init: RequestInit,
  timeoutMs: number,
  ceiling: number,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(input, {
      ...init,
      signal: controller.signal,
    });
    return await readBoundedJson(response, ceiling);
  } finally {
    clearTimeout(timer);
  }
}

async function readBoundedJson(
  response: Response,
  ceiling: number,
): Promise<unknown> {
  if (!response.body) throw new Error("provider response is invalid");
  const reader = response.body.getReader();
  try {
    if (!response.ok) throw new Error("provider response is invalid");
    const mediaType = response.headers.get("content-type");
    if (!mediaType || !isJsonMediaType(mediaType))
      throw new Error("provider response is invalid");
    const declared = response.headers.get("content-length");
    if (declared !== null) {
      if (!/^(0|[1-9][0-9]*)$/u.test(declared))
        throw new Error("provider response is invalid");
      if (Number(declared) > ceiling)
        throw new Error("provider response is invalid");
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      if (!(result.value instanceof Uint8Array))
        throw new Error("provider response is invalid");
      if (total + result.value.byteLength > ceiling)
        throw new Error("provider response is invalid");
      chunks.push(result.value);
      total += result.value.byteLength;
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes),
    );
  } finally {
    try {
      await reader.cancel();
    } catch {
      // Cancellation is best-effort cleanup; provider failures remain generic.
    } finally {
      reader.releaseLock();
    }
  }
}

function parseTokenResponse(value: unknown): string {
  if (!isRecord(value)) throw new Error("provider token is invalid");
  const allowed = new Set([
    "access_token",
    "token_type",
    "expires_in",
    "scope",
    "id_token",
  ]);
  if (Object.keys(value).some((key) => !allowed.has(key)))
    throw new Error("provider token is invalid");
  if (!boundedString(value.access_token, 1, 8_192))
    throw new Error("provider token is invalid");
  if (
    typeof value.token_type !== "string" ||
    value.token_type.toLowerCase() !== "bearer"
  )
    throw new Error("provider token is invalid");
  if (
    value.expires_in !== undefined &&
    (typeof value.expires_in !== "number" ||
      !Number.isInteger(value.expires_in) ||
      value.expires_in < 1 ||
      value.expires_in > 86_400)
  )
    throw new Error("provider token is invalid");
  if (value.scope !== undefined && !boundedString(value.scope, 0, 2_048))
    throw new Error("provider token is invalid");
  if (value.id_token !== undefined && !boundedString(value.id_token, 1, 12_288))
    throw new Error("provider token is invalid");
  return value.access_token;
}

function isJsonMediaType(value: string): boolean {
  const [type, ...parameters] = value.split(";");
  if (type?.trim().toLowerCase() !== "application/json") return false;
  return parameters.every((parameter) => {
    const trimmed = parameter.trim();
    const separator = trimmed.indexOf("=");
    if (separator <= 0 || separator === trimmed.length - 1) return false;
    const name = trimmed.slice(0, separator).trim();
    const parameterValue = trimmed.slice(separator + 1).trim();
    return (
      /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/u.test(name) &&
      (/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/u.test(parameterValue) ||
        /^"[^"\r\n]*"$/u.test(parameterValue))
    );
  });
}

function parseUserInfo(value: unknown): OAuthIdentity {
  if (!isRecord(value)) throw new Error("provider identity is invalid");
  if (!boundedString(value.sub, 1, 255))
    throw new Error("provider identity is invalid");
  if (typeof value.email !== "string")
    throw new Error("provider identity is invalid");
  const email = value.email.trim().toLowerCase();
  if (
    !boundedString(email, 3, 254) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
  )
    throw new Error("provider identity is invalid");
  if (value.email_verified !== true)
    throw new Error("provider identity is invalid");
  const name = value.name === undefined ? "" : value.name;
  if (
    typeof name !== "string" ||
    [...name].length > 80 ||
    byteLength(name) > 320
  )
    throw new Error("provider identity is invalid");
  if (value.picture !== undefined && typeof value.picture !== "string")
    throw new Error("provider identity is invalid");
  return {
    subject: value.sub,
    email,
    emailVerified: true,
    displayName: name,
    avatarUrl: safeAvatar(value.picture),
  };
}

function safeAvatar(value: string | undefined): string {
  if (!value || byteLength(value) > 2_048) return "";
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash ||
      (url.hostname !== "googleusercontent.com" &&
        !url.hostname.endsWith(".googleusercontent.com"))
    )
      return "";
    return url.toString();
  } catch {
    return "";
  }
}

function validateTestEndpoints(
  endpoints: GoogleOAuthTestEndpoints,
): GoogleOAuthTestEndpoints {
  return {
    authorization: validTestEndpoint(endpoints.authorization),
    token: validTestEndpoint(endpoints.token),
    userInfo: validTestEndpoint(endpoints.userInfo),
  };
}

function validTestEndpoint(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("OAuth test endpoint is invalid");
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".example.test") ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  )
    throw new Error("OAuth test endpoint is invalid");
  return url.toString();
}

function boundedString(
  value: unknown,
  minimumBytes: number,
  maximumBytes: number,
): value is string {
  if (typeof value !== "string") return false;
  const length = byteLength(value);
  return length >= minimumBytes && length <= maximumBytes;
}

function byteLength(value: string): number {
  return encoder.encode(value).byteLength;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
