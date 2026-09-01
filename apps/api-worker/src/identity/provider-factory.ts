import type { EmailSender, OAuthProvider } from "../domain/identity.js";
import { GoogleOAuthProvider } from "./google-oauth-provider.js";
import { HttpEmailSender } from "./http-email-sender.js";

const PROVIDER_TIMEOUT_LITERAL = "8000";
const PROVIDER_TIMEOUT_MS = 8_000;
const encoder = new TextEncoder();

export interface IdentityProviderEnvironment {
  ENVIRONMENT: unknown;
  OAUTH_REDIRECT_URI: unknown;
  MAGIC_LINK_ENABLED: unknown;
  GOOGLE_OAUTH_ENABLED: unknown;
  EMAIL_PROVIDER_URL?: unknown;
  EMAIL_FROM?: unknown;
  AUTH_PROVIDER_TIMEOUT_MS?: unknown;
  GOOGLE_OAUTH_CLIENT_ID?: unknown;
  /** Externally installed Worker secret; never declared in committed Wrangler vars. */
  EMAIL_PROVIDER_API_KEY?: unknown;
  /** Externally installed Worker secret; never declared in committed Wrangler vars. */
  GOOGLE_OAUTH_CLIENT_SECRET?: unknown;
}

export interface IdentityProviderDependencies {
  email: EmailSender;
  oauth: OAuthProvider | null;
}

export function createIdentityProviderDependencies(
  env: IdentityProviderEnvironment,
  fetcher: typeof fetch = fetch,
): IdentityProviderDependencies {
  return {
    email: createEmailSender(env, fetcher),
    oauth: createOAuthProvider(env, fetcher),
  };
}

function createEmailSender(
  env: IdentityProviderEnvironment,
  fetcher: typeof fetch,
): EmailSender {
  if (env.MAGIC_LINK_ENABLED !== "true") return unavailableEmailSender;
  if (env.AUTH_PROVIDER_TIMEOUT_MS !== PROVIDER_TIMEOUT_LITERAL)
    return unavailableEmailSender;
  if (
    typeof env.EMAIL_PROVIDER_URL !== "string" ||
    typeof env.EMAIL_FROM !== "string" ||
    typeof env.EMAIL_PROVIDER_API_KEY !== "string"
  )
    return unavailableEmailSender;
  try {
    return new HttpEmailSender(
      {
        endpoint: env.EMAIL_PROVIDER_URL,
        from: env.EMAIL_FROM,
        bearerToken: env.EMAIL_PROVIDER_API_KEY,
        timeoutMs: PROVIDER_TIMEOUT_MS,
      },
      fetcher,
    );
  } catch {
    return unavailableEmailSender;
  }
}

function createOAuthProvider(
  env: IdentityProviderEnvironment,
  fetcher: typeof fetch,
): OAuthProvider | null {
  if (env.GOOGLE_OAUTH_ENABLED !== "true") return null;
  if (env.AUTH_PROVIDER_TIMEOUT_MS !== PROVIDER_TIMEOUT_LITERAL) return null;
  if (
    !validCredential(env.GOOGLE_OAUTH_CLIENT_ID) ||
    !validCredential(env.GOOGLE_OAUTH_CLIENT_SECRET) ||
    !validRedirect(env.ENVIRONMENT, env.OAUTH_REDIRECT_URI)
  )
    return null;
  try {
    return new GoogleOAuthProvider(
      {
        clientId: env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        timeoutMs: PROVIDER_TIMEOUT_MS,
      },
      fetcher,
    );
  } catch {
    return null;
  }
}

const unavailableEmailSender: EmailSender = {
  send: () => Promise.reject(new Error("email provider is not configured")),
};

function validCredential(value: unknown): value is string {
  return (
    typeof value === "string" &&
    encoder.encode(value).byteLength >= 1 &&
    encoder.encode(value).byteLength <= 512 &&
    !hasControl(value)
  );
}

function hasControl(value: string): boolean {
  return [...value].some((character) => {
    const code = character.codePointAt(0)!;
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });
}

function validRedirect(environment: unknown, value: unknown): boolean {
  if (typeof value !== "string") return false;
  const expected: Record<string, string> = {
    local: "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
    staging: "https://api-stag.vocanova.site/api/v1/auth/oauth/google/callback",
    production:
      "https://api-production.invalid/api/v1/auth/oauth/google/callback",
  };
  if (typeof environment !== "string" || value !== expected[environment])
    return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}
