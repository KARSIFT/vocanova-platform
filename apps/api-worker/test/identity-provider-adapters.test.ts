import { describe, expect, it, vi } from "vitest";

import { GoogleOAuthProvider } from "../src/identity/google-oauth-provider.js";
import { HttpEmailSender } from "../src/identity/http-email-sender.js";
import { createIdentityProviderDependencies } from "../src/identity/provider-factory.js";

const redirectUri = "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback";
const endpoints = {
  authorization: "https://accounts.example.test/authorize",
  token: "https://token.example.test/exchange",
  userInfo: "https://identity.example.test/userinfo",
};
const validToken = {
  access_token: "synthetic-access-token",
  token_type: "Bearer",
};
const validUser = {
  sub: "synthetic-google-subject",
  email: "Learner@Example.Test",
  email_verified: true,
  name: "Synthetic Learner",
  picture: "https://avatars.googleusercontent.com/avatar.png",
};

describe("Google OAuth provider", () => {
  it("builds the exact authorization, token, and user-info requests", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(validToken))
      .mockResolvedValueOnce(jsonResponse(validUser));
    const provider = google(fetcher);

    const authorization = new URL(
      provider.authorizationUrl("synthetic-state", redirectUri),
    );
    expect(`${authorization.origin}${authorization.pathname}`).toBe(
      endpoints.authorization,
    );
    expect([...authorization.searchParams.entries()]).toEqual([
      ["client_id", "synthetic-client"],
      ["redirect_uri", redirectUri],
      ["response_type", "code"],
      ["scope", "openid email profile"],
      ["state", "synthetic-state"],
    ]);

    await expect(
      provider.verify("synthetic-code", "synthetic-state", redirectUri),
    ).resolves.toEqual({
      subject: "synthetic-google-subject",
      email: "learner@example.test",
      emailVerified: true,
      displayName: "Synthetic Learner",
      avatarUrl: "https://avatars.googleusercontent.com/avatar.png",
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0]?.[0]).toBe(endpoints.token);
    const tokenInit = fetcher.mock.calls[0]?.[1];
    expect(tokenInit).toMatchObject({ method: "POST", redirect: "error" });
    const tokenHeaders = new Headers(tokenInit?.headers);
    expect(tokenHeaders.get("accept")).toBe("application/json");
    expect(tokenHeaders.get("content-type")).toBe(
      "application/x-www-form-urlencoded",
    );
    expect([...new URLSearchParams(String(tokenInit?.body)).entries()]).toEqual(
      [
        ["code", "synthetic-code"],
        ["client_id", "synthetic-client"],
        ["client_secret", "synthetic-client-secret"],
        ["redirect_uri", redirectUri],
        ["grant_type", "authorization_code"],
      ],
    );
    expect(fetcher.mock.calls[1]?.[0]).toBe(endpoints.userInfo);
    const userInit = fetcher.mock.calls[1]?.[1];
    expect(userInit).toMatchObject({ method: "GET", redirect: "error" });
    expect(new Headers(userInit?.headers).get("authorization")).toBe(
      "Bearer synthetic-access-token",
    );
    expect(userInit?.body).toBeUndefined();
  });

  it("uses only the three literal Google endpoints outside the test seam", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(validToken))
      .mockResolvedValueOnce(jsonResponse(validUser));
    const provider = new GoogleOAuthProvider(
      {
        clientId: "synthetic-client",
        clientSecret: "synthetic-client-secret",
        timeoutMs: 8_000,
      },
      fetcher,
    );
    expect(provider.authorizationUrl("state", redirectUri)).toMatch(
      /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/u,
    );
    await provider.verify("code", "state", redirectUri);
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
      "https://oauth2.googleapis.com/token",
      "https://openidconnect.googleapis.com/v1/userinfo",
    ]);
  });

  it("accepts only the bounded token schema and allowed JSON media type", async () => {
    const accepted = {
      ...validToken,
      token_type: "bEaReR",
      expires_in: 86_400,
      scope: "openid email profile",
      id_token: "synthetic-id-token",
    };
    await expect(
      google(sequence(accepted, validUser)).verify(
        "code",
        "state",
        redirectUri,
      ),
    ).resolves.toMatchObject({ emailVerified: true });
    await expect(
      google(
        sequence(accepted, validUser, "Application/JSON; Charset=UTF-8"),
      ).verify("code", "state", redirectUri),
    ).resolves.toMatchObject({ emailVerified: true });

    for (const token of [
      { ...validToken, refresh_token: "forbidden" },
      { ...validToken, unknown: true },
      { ...validToken, token_type: "Basic" },
      { ...validToken, access_token: "" },
      { ...validToken, access_token: "a".repeat(8_193) },
      { ...validToken, expires_in: 0 },
      { ...validToken, expires_in: 1.5 },
      { ...validToken, scope: "s".repeat(2_049) },
      { ...validToken, id_token: "i".repeat(12_289) },
      null,
      [],
      { access_token: "synthetic-access-token" },
    ]) {
      await expect(
        google(sequence(token, validUser)).verify("code", "state", redirectUri),
      ).rejects.toThrow("OAuth provider request failed");
    }
    await expect(
      google(sequence(validToken, validUser, "text/json")).verify(
        "code",
        "state",
        redirectUri,
      ),
    ).rejects.toThrow("OAuth provider request failed");
  });

  it("enforces declared, streamed, dishonest, and exact byte ceilings", async () => {
    const exactToken = exactJson(
      TOKEN_LIMIT,
      {
        access_token: "a".repeat(2_048),
        token_type: "Bearer",
        scope: "s".repeat(2_048),
        id_token: "",
      },
      "id_token",
    );
    const exactUser = exactJson(
      USER_LIMIT,
      { ...validUser, padding: "" },
      "padding",
    );
    await expect(
      google(
        vi
          .fn<typeof fetch>()
          .mockResolvedValueOnce(rawJsonResponse(exactToken))
          .mockResolvedValueOnce(rawJsonResponse(exactUser)),
      ).verify("code", "state", redirectUri),
    ).resolves.toMatchObject({ subject: validUser.sub });

    await expect(
      google(
        vi.fn<typeof fetch>().mockResolvedValue(
          new Response(null, {
            headers: { "content-type": "application/json" },
          }),
        ),
      ).verify("code", "state", redirectUri),
    ).rejects.toThrow("OAuth provider request failed");

    for (const response of [
      rawJsonResponse(JSON.stringify(validToken), {
        "content-length": String(TOKEN_LIMIT + 1),
      }),
      rawJsonResponse(JSON.stringify(validToken), { "content-length": "01" }),
      rawJsonResponse(JSON.stringify(validToken), {
        "content-length": "invalid",
      }),
      streamedResponse([new Uint8Array(TOKEN_LIMIT), new Uint8Array(1)]),
      streamedResponse([new Uint8Array(TOKEN_LIMIT + 1)], {
        "content-length": String(TOKEN_LIMIT),
      }),
    ]) {
      await expect(
        google(vi.fn<typeof fetch>().mockResolvedValue(response)).verify(
          "code",
          "state",
          redirectUri,
        ),
      ).rejects.toThrow("OAuth provider request failed");
      expect(response.body?.locked).toBe(false);
    }
  });

  it("cancels and releases response readers on success and every response error", async () => {
    const cancel = vi.spyOn(ReadableStreamDefaultReader.prototype, "cancel");
    const release = vi.spyOn(
      ReadableStreamDefaultReader.prototype,
      "releaseLock",
    );
    await expect(
      google(sequence(validToken, validUser)).verify(
        "code",
        "state",
        redirectUri,
      ),
    ).resolves.toMatchObject({ subject: validUser.sub });
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(release).toHaveBeenCalledTimes(2);
    const cases = [
      new Response(JSON.stringify(validToken), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
      new Response("not-json", {
        headers: { "content-type": "application/json" },
      }),
      new Response(JSON.stringify(validToken), {
        headers: { "content-type": "text/plain" },
      }),
      errorResponse(),
    ];
    for (const response of cases) {
      cancel.mockClear();
      release.mockClear();
      await expect(
        google(vi.fn<typeof fetch>().mockResolvedValue(response)).verify(
          "code",
          "state",
          redirectUri,
        ),
      ).rejects.toThrow("OAuth provider request failed");
      expect(cancel).toHaveBeenCalledTimes(1);
      expect(release).toHaveBeenCalledTimes(1);
      expect(response.body?.locked).toBe(false);
    }
    cancel.mockRestore();
    release.mockRestore();
  });

  it("times out once, rejects redirects without forwarding secrets, and redacts failures", async () => {
    vi.useFakeTimers();
    try {
      const timeoutFetch = vi.fn<typeof fetch>().mockImplementation(
        (_input, init) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(new Error("synthetic transport timeout")),
            );
          }),
      );
      const pending = google(timeoutFetch).verify(
        "private-synthetic-code",
        "private-synthetic-state",
        redirectUri,
      );
      const rejection = expect(pending).rejects.toThrow(
        "OAuth provider request failed",
      );
      await vi.advanceTimersByTimeAsync(8_000);
      await rejection;
      expect(timeoutFetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }

    const redirectResponse = new Response("redirect", {
      status: 302,
      headers: { location: "https://target.example.test/capture" },
    });
    const redirectFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(redirectResponse);
    await expect(
      google(redirectFetch).verify(
        "private-synthetic-code",
        "private-synthetic-state",
        redirectUri,
      ),
    ).rejects.not.toThrow(/private|target|302/u);
    expect(redirectFetch).toHaveBeenCalledTimes(1);
    expect(redirectFetch.mock.calls[0]?.[1]?.redirect).toBe("error");
    expect(redirectResponse.body?.locked).toBe(false);
  });

  it("validates identity fields and drops unsafe avatars", async () => {
    for (const user of [
      { ...validUser, sub: "" },
      { ...validUser, sub: "s".repeat(256) },
      { ...validUser, email: "invalid" },
      { ...validUser, email_verified: false },
      { ...validUser, name: "n".repeat(81) },
      { ...validUser, name: "😀".repeat(81) },
      { ...validUser, picture: 42 },
    ]) {
      await expect(
        google(sequence(validToken, user)).verify("code", "state", redirectUri),
      ).rejects.toThrow("OAuth provider request failed");
    }

    for (const picture of [
      "http://avatars.googleusercontent.com/avatar.png",
      "https://evil.example.test/avatar.png",
      "https://user@avatars.googleusercontent.com/avatar.png",
      "https://avatars.googleusercontent.com:8443/avatar.png",
      "https://avatars.googleusercontent.com/avatar.png?token=synthetic",
      "https://avatars.googleusercontent.com/avatar.png#fragment",
      `https://avatars.googleusercontent.com/${"a".repeat(2_100)}`,
    ]) {
      await expect(
        google(sequence(validToken, { ...validUser, picture })).verify(
          "code",
          "state",
          redirectUri,
        ),
      ).resolves.toMatchObject({ avatarUrl: "" });
    }
    await expect(
      google(
        sequence(validToken, { ...validUser, extra_bounded_claim: "ignored" }),
      ).verify("code", "state", redirectUri),
    ).resolves.toMatchObject({ displayName: "Synthetic Learner" });

    const boundaryEmail = `${"a".repeat(241)}@example.test`;
    const avatarPrefix = "https://avatars.googleusercontent.com/";
    const boundaryAvatar = `${avatarPrefix}${"a".repeat(2_048 - avatarPrefix.length)}`;
    await expect(
      google(
        sequence(validToken, {
          ...validUser,
          sub: "s".repeat(255),
          email: boundaryEmail,
          name: "😀".repeat(80),
          picture: boundaryAvatar,
        }),
      ).verify("code", "state", redirectUri),
    ).resolves.toMatchObject({
      subject: "s".repeat(255),
      email: boundaryEmail,
      displayName: "😀".repeat(80),
      avatarUrl: boundaryAvatar,
    });
  });

  it("allows endpoint injection only for clean HTTPS example.test URLs", () => {
    for (const token of [
      "http://token.example.test/exchange",
      "https://user@token.example.test/exchange",
      "https://token.example.test:8443/exchange",
      "https://token.example.test/exchange?query=1",
      "https://token.example.test/exchange#fragment",
      "https://oauth.googleapis.com/token",
    ]) {
      expect(() =>
        google(vi.fn<typeof fetch>(), { ...endpoints, token }),
      ).toThrow("OAuth test endpoint is invalid");
    }
    expect(() =>
      Reflect.construct(GoogleOAuthProvider, [
        {
          clientId: "synthetic-client",
          clientSecret: "synthetic-secret",
          timeoutMs: 7_999,
        },
      ]),
    ).toThrow("OAuth provider configuration is invalid");
  });
});

describe("provider-neutral transactional email", () => {
  it("validates and sends one exact bounded request", async () => {
    const response = new Response("accepted", { status: 202 });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
    const sender = email(fetcher);
    await sender.send({
      to: "learner@example.test",
      subject: "Sign in",
      text: "Use the synthetic link.",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe("https://email.example.test/send");
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      redirect: "error",
    });
    expect(
      new Headers(fetcher.mock.calls[0]?.[1]?.headers).get("authorization"),
    ).toBe("Bearer synthetic-email-key");
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({
      from: "noreply@example.test",
      to: ["learner@example.test"],
      subject: "Sign in",
      text: "Use the synthetic link.",
      html: "",
    });
    expect(response.body?.locked).toBe(false);
  });

  it("rejects unsafe endpoints, credentials, fields, and byte overflow before fetch", async () => {
    const credentialedEndpoint = new URL("https://email.example.test/send");
    credentialedEndpoint.username = "user";
    credentialedEndpoint.password = "pass";
    for (const endpoint of [
      "http://email.example.test/send",
      "https://email.example.test:8443/send",
      credentialedEndpoint.href,
      "https://email.example.test/send?query=1",
      "https://email.example.test/send#fragment",
      `https://email.example.test/${"a".repeat(2_100)}`,
    ]) {
      expect(() => email(vi.fn<typeof fetch>(), { endpoint })).toThrow(
        "endpoint",
      );
    }
    for (const bearerToken of ["", "bad\nkey", "k".repeat(4_097)]) {
      expect(() => email(vi.fn<typeof fetch>(), { bearerToken })).toThrow(
        "token",
      );
    }
    for (const from of [
      "Vocanova <noreply@example.test>",
      "bad\r\n@example.test",
      "x@",
      `${"a".repeat(250)}@example.test`,
    ]) {
      expect(() => email(vi.fn<typeof fetch>(), { from })).toThrow("sender");
    }

    const invalidMessages = [
      { to: "bad address@example.test", subject: "Sign in", text: "body" },
      { to: "learner@example.test\r\n", subject: "Sign in", text: "body" },
      { to: "learner@example.test", subject: "", text: "body" },
      { to: "learner@example.test", subject: "bad\nsubject", text: "body" },
      { to: "learner@example.test", subject: "s".repeat(161), text: "body" },
      { to: "learner@example.test", subject: "Sign in", text: "" },
      {
        to: "learner@example.test",
        subject: "Sign in",
        text: "b".repeat(8_193),
      },
    ];
    for (const message of invalidMessages) {
      const fetcher = vi.fn<typeof fetch>();
      await expect(email(fetcher).send(message)).rejects.toThrow("email");
      expect(fetcher).not.toHaveBeenCalled();
    }

    const oversizedJsonFetcher = vi.fn<typeof fetch>();
    await expect(
      email(oversizedJsonFetcher).send({
        to: "learner@example.test",
        subject: "Sign in",
        text: '"'.repeat(8_192),
      }),
    ).rejects.toThrow("email request is invalid");
    expect(oversizedJsonFetcher).not.toHaveBeenCalled();
  });

  it("accepts each exact endpoint, mailbox, secret, subject, and text boundary", async () => {
    const endpointPrefix = "https://email.example.test/";
    const endpoint = `${endpointPrefix}${"a".repeat(2_048 - endpointPrefix.length)}`;
    const mailbox = `${"a".repeat(241)}@example.test`;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const sender = email(fetcher, {
      endpoint,
      bearerToken: "k".repeat(4_096),
      from: mailbox,
    });
    await expect(
      sender.send({
        to: mailbox,
        subject: "s".repeat(160),
        text: "t".repeat(8_192),
      }),
    ).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0]?.[0]).toBe(endpoint);
  });

  it("uses explicit timeouts, cancels every response, never retries, and redacts failures", async () => {
    for (const status of [200, 299, 300, 500]) {
      const response = new Response("private provider body", { status });
      const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response);
      const operation = email(fetcher).send({
        to: "learner@example.test",
        subject: "Synthetic subject",
        text: "private synthetic magic link",
      });
      if (status < 300) await expect(operation).resolves.toBeUndefined();
      else
        await expect(operation).rejects.not.toThrow(
          /private|learner|synthetic|300|500/u,
        );
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(fetcher.mock.calls[0]?.[1]?.redirect).toBe("error");
      expect(fetcher.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
      expect(response.body?.locked).toBe(false);
    }

    const network = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("private synthetic transport detail"));
    await expect(
      email(network).send({
        to: "learner@example.test",
        subject: "Sign in",
        text: "private synthetic magic link",
      }),
    ).rejects.toThrow("email provider request failed");
    expect(network).toHaveBeenCalledTimes(1);
  });
});

describe("identity provider factory", () => {
  it("ignores disabled capability configuration without network fallback", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const providers = createIdentityProviderDependencies(
      environment({
        MAGIC_LINK_ENABLED: "false",
        GOOGLE_OAUTH_ENABLED: "false",
        EMAIL_PROVIDER_URL: "malformed",
        EMAIL_FROM: "malformed",
        AUTH_PROVIDER_TIMEOUT_MS: "malformed",
        GOOGLE_OAUTH_CLIENT_ID: "bad\nclient",
        EMAIL_PROVIDER_API_KEY: "bad\nkey",
        GOOGLE_OAUTH_CLIENT_SECRET: "bad\nsecret",
      }),
      fetcher,
    );
    await expect(
      providers.email.send({
        to: "learner@example.test",
        subject: "Sign in",
        text: "Body",
      }),
    ).rejects.toThrow("not configured");
    expect(providers.oauth).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("requires literal 8000 and keeps malformed capabilities independent", async () => {
    const emailFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const emailOnly = createIdentityProviderDependencies(
      environment({
        MAGIC_LINK_ENABLED: "true",
        GOOGLE_OAUTH_ENABLED: "true",
        GOOGLE_OAUTH_CLIENT_SECRET: "bad\nsecret",
      }),
      emailFetch,
    );
    await expect(
      emailOnly.email.send({
        to: "learner@example.test",
        subject: "Sign in",
        text: "Body",
      }),
    ).resolves.toBeUndefined();
    expect(emailOnly.oauth).toBeNull();

    const googleOnly = createIdentityProviderDependencies(
      environment({
        MAGIC_LINK_ENABLED: "true",
        GOOGLE_OAUTH_ENABLED: "true",
        EMAIL_PROVIDER_URL: "malformed",
      }),
      vi.fn<typeof fetch>(),
    );
    await expect(
      googleOnly.email.send({
        to: "learner@example.test",
        subject: "Sign in",
        text: "Body",
      }),
    ).rejects.toThrow("not configured");
    expect(googleOnly.oauth?.authorizationUrl("state", redirectUri)).toContain(
      "accounts.google.com",
    );

    for (const AUTH_PROVIDER_TIMEOUT_MS of [undefined, "", "7999", "08000"]) {
      const providers = createIdentityProviderDependencies(
        environment({
          MAGIC_LINK_ENABLED: "true",
          GOOGLE_OAUTH_ENABLED: "true",
          AUTH_PROVIDER_TIMEOUT_MS,
        }),
        vi.fn<typeof fetch>(),
      );
      expect(providers.oauth).toBeNull();
      await expect(
        providers.email.send({
          to: "learner@example.test",
          subject: "Sign in",
          text: "Body",
        }),
      ).rejects.toThrow("not configured");
    }

    for (const missing of [
      "EMAIL_PROVIDER_URL",
      "EMAIL_FROM",
      "EMAIL_PROVIDER_API_KEY",
    ]) {
      const incomplete = createIdentityProviderDependencies(
        environment({ MAGIC_LINK_ENABLED: "true", [missing]: undefined }),
        vi.fn<typeof fetch>(),
      );
      await expect(
        incomplete.email.send({
          to: "learner@example.test",
          subject: "Sign in",
          text: "Body",
        }),
      ).rejects.toThrow("not configured");
    }
  });

  it("requires environment-exact redirects and bounded control-free OAuth credentials", () => {
    for (const override of [
      { GOOGLE_OAUTH_CLIENT_ID: "" },
      { GOOGLE_OAUTH_CLIENT_ID: undefined },
      { GOOGLE_OAUTH_CLIENT_SECRET: "" },
      { GOOGLE_OAUTH_CLIENT_SECRET: undefined },
      { GOOGLE_OAUTH_CLIENT_ID: "i".repeat(513) },
      { GOOGLE_OAUTH_CLIENT_SECRET: "s\n" },
      { OAUTH_REDIRECT_URI: "https://api-stag.vocanova.site/wrong" },
      {
        ENVIRONMENT: "staging",
        OAUTH_REDIRECT_URI: redirectUri,
      },
    ]) {
      expect(
        createIdentityProviderDependencies(
          environment({ GOOGLE_OAUTH_ENABLED: "true", ...override }),
          vi.fn<typeof fetch>(),
        ).oauth,
      ).toBeNull();
    }
    expect(
      createIdentityProviderDependencies(
        environment({ GOOGLE_OAUTH_ENABLED: "true" }),
        vi.fn<typeof fetch>(),
      ).oauth,
    ).not.toBeNull();
  });
});

const TOKEN_LIMIT = 16_384;
const USER_LIMIT = 65_536;

function google(
  fetcher: typeof fetch,
  testEndpoints = endpoints,
): GoogleOAuthProvider {
  return new GoogleOAuthProvider(
    {
      clientId: "synthetic-client",
      clientSecret: "synthetic-client-secret",
      timeoutMs: 8_000,
    },
    fetcher,
    testEndpoints,
  );
}

function email(
  fetcher: typeof fetch,
  override: Partial<{
    endpoint: string;
    bearerToken: string;
    from: string;
    timeoutMs: number;
  }> = {},
): HttpEmailSender {
  return new HttpEmailSender(
    {
      endpoint: "https://email.example.test/send",
      bearerToken: "synthetic-email-key",
      from: "noreply@example.test",
      timeoutMs: 100,
      ...override,
    },
    fetcher,
  );
}

function sequence(
  token: unknown,
  user: unknown,
  contentType = "application/json",
): typeof fetch {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(jsonResponse(token, contentType))
    .mockResolvedValueOnce(jsonResponse(user, contentType));
}

function jsonResponse(
  value: unknown,
  contentType = "application/json",
): Response {
  return rawJsonResponse(JSON.stringify(value), {
    "content-type": contentType,
  });
}

function rawJsonResponse(
  body: string,
  headers: Record<string, string> = { "content-type": "application/json" },
): Response {
  return new Response(body, { headers });
}

function streamedResponse(
  chunks: Uint8Array[],
  headers: Record<string, string> = { "content-type": "application/json" },
): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    { headers },
  );
}

function errorResponse(): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error("synthetic read failure"));
      },
    }),
    { headers: { "content-type": "application/json" } },
  );
}

function exactJson(
  size: number,
  value: Record<string, unknown>,
  paddingKey: string,
): string {
  const initial = JSON.stringify(value);
  const missing = size - new TextEncoder().encode(initial).byteLength;
  if (missing < 0) throw new Error("exact JSON fixture is already oversized");
  return JSON.stringify({ ...value, [paddingKey]: "x".repeat(missing) });
}

function environment(override: Record<string, unknown> = {}): Record<
  string,
  unknown
> & {
  ENVIRONMENT: string;
  OAUTH_REDIRECT_URI: string;
  MAGIC_LINK_ENABLED: string;
  GOOGLE_OAUTH_ENABLED: string;
} {
  return {
    ENVIRONMENT: "local",
    OAUTH_REDIRECT_URI: redirectUri,
    MAGIC_LINK_ENABLED: "false",
    GOOGLE_OAUTH_ENABLED: "false",
    EMAIL_PROVIDER_URL: "https://email.example.test/send",
    EMAIL_FROM: "noreply@example.test",
    AUTH_PROVIDER_TIMEOUT_MS: "8000",
    GOOGLE_OAUTH_CLIENT_ID: "synthetic-client",
    EMAIL_PROVIDER_API_KEY: "synthetic-email-key",
    GOOGLE_OAUTH_CLIENT_SECRET: "synthetic-client-secret",
    ...override,
  };
}
