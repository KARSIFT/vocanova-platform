import { describe, expect, it, vi } from "vitest";
import { env, exports } from "cloudflare:workers";

import { createApp, createOpenApiDocument } from "../src/app.js";

describe("Worker API", () => {
  it("reports D1 health without exposing configuration", async () => {
    const response = await exports.default.fetch(
      "https://api.example.test/healthz",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    await expect(response.json()).resolves.toMatchObject({
      status: "ok",
      database: "ok",
    });
  });

  it("returns only the non-secret config projection", async () => {
    const response = await exports.default.fetch(
      "https://api.example.test/configz",
    );
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({
      environment: "local",
      release: "local",
      runtime: "cloudflare-workers",
      data: "d1",
      migrationStatus: "full-api-parity",
    });
    expect(text.toLowerCase()).not.toMatch(/token|secret|password|database_id/);
  });

  it("fails closed when runtime configuration is invalid", async () => {
    const response = await createApp().request(
      "https://api.example.test/configz",
      undefined,
      {
        DB: env.DB,
        ENVIRONMENT: "local",
        RELEASE: "local",
        CORS_ALLOWED_ORIGINS: "not a URL",
      } as unknown as CloudflareEnv,
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: 503,
      detail: "runtime configuration is invalid",
    });
  });

  it("reports an unhealthy D1 dependency without leaking an exception", async () => {
    const unhealthy = createApp({
      createPlatformRepository: () => ({
        checkHealth: () => Promise.resolve({ database: "unhealthy" }),
        getMetadata: () => Promise.resolve(null),
        putMetadata: () => Promise.resolve(),
      }),
    });
    const response = await unhealthy.request(
      "https://api.example.test/healthz",
      undefined,
      env,
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      status: 503,
      detail: "database is unreachable",
    });
  });

  it("serves the deterministic Hono-generated OpenAPI migration contract", async () => {
    const response = await exports.default.fetch(
      "https://api.example.test/openapi.json",
    );
    expect(response.status).toBe(200);
    const document = (await response.json()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };
    expect(document.openapi).toBe("3.1.0");
    expect(Object.keys(document.paths).sort()).toEqual([
      "/api/v1/account-deletion-requests",
      "/api/v1/auth/logout",
      "/api/v1/auth/magic-links",
      "/api/v1/auth/magic-links/consume",
      "/api/v1/auth/oauth/google/callback",
      "/api/v1/auth/oauth/google/start",
      "/api/v1/canonical-words/{wordSlug}",
      "/api/v1/daily-mission",
      "/api/v1/journey-situations",
      "/api/v1/journey-situations/{slug}",
      "/api/v1/me",
      "/api/v1/onboarding",
      "/api/v1/progress",
      "/api/v1/reviews/due",
      "/api/v1/reviews/submissions",
      "/api/v1/sentence-feedback",
      "/api/v1/sentence-feedback/{attemptId}/reports",
      "/api/v1/settings",
      "/api/v1/settings/email-change-links",
      "/api/v1/settings/email-change-links/consume",
      "/api/v1/user-words",
      "/api/v1/user-words/{meaningId}",
      "/configz",
      "/healthz",
    ]);
  });

  it("publishes the existing session and CSRF requirements", () => {
    const document = createOpenApiDocument() as {
      components: { securitySchemes: Record<string, unknown> };
      paths: Record<
        string,
        Record<
          string,
          {
            security?: unknown;
            parameters?: Array<{
              name: string;
              in: string;
              required?: boolean;
            }>;
          }
        >
      >;
    };
    expect(document.components.securitySchemes.SessionCookie).toMatchObject({
      type: "apiKey",
      in: "cookie",
      name: "vocanova_session",
    });

    const protectedOperations = [
      ["/api/v1/me", "get"],
      ["/api/v1/auth/logout", "post"],
      ["/api/v1/onboarding", "get"],
      ["/api/v1/onboarding", "post"],
      ["/api/v1/settings", "get"],
      ["/api/v1/settings", "patch"],
      ["/api/v1/settings/email-change-links", "post"],
      ["/api/v1/settings/email-change-links/consume", "post"],
      ["/api/v1/account-deletion-requests", "post"],
      ["/api/v1/journey-situations", "get"],
      ["/api/v1/journey-situations/{slug}", "get"],
      ["/api/v1/canonical-words/{wordSlug}", "get"],
      ["/api/v1/user-words", "get"],
      ["/api/v1/user-words", "post"],
      ["/api/v1/user-words/{meaningId}", "delete"],
      ["/api/v1/reviews/due", "get"],
      ["/api/v1/reviews/submissions", "post"],
      ["/api/v1/daily-mission", "get"],
      ["/api/v1/progress", "get"],
      ["/api/v1/sentence-feedback", "post"],
      ["/api/v1/sentence-feedback/{attemptId}/reports", "post"],
    ] as const;
    for (const [path, method] of protectedOperations)
      expect(document.paths[path]![method]!.security).toEqual([
        { SessionCookie: [] },
      ]);

    const csrfOperations = protectedOperations.filter(([, method]) =>
      ["post", "patch", "delete"].includes(method),
    );
    for (const [path, method] of csrfOperations)
      expect(document.paths[path]![method]!.parameters).toContainEqual({
        name: "X-CSRF-Token",
        in: "header",
        required: true,
        schema: { type: "string" },
      });
  });

  it("publishes AI feedback HTTP problem responses with the shared schema", () => {
    const document = createOpenApiDocument() as {
      paths: Record<
        string,
        {
          post: {
            responses: Record<
              string,
              { content?: Record<string, { schema: unknown }> }
            >;
          };
        }
      >;
    };
    const problemSchema = { $ref: "#/components/schemas/Problem" };
    for (const [path, statuses] of [
      ["/api/v1/sentence-feedback", [400, 401, 403, 404, 409, 422, 500]],
      [
        "/api/v1/sentence-feedback/{attemptId}/reports",
        [400, 401, 403, 404, 422, 500],
      ],
    ] as const) {
      const responses = document.paths[path]!.post.responses;
      for (const status of statuses) {
        expect(
          responses[String(status)]?.content?.["application/problem+json"]
            ?.schema,
          `${path} ${status}`,
        ).toEqual(problemSchema);
      }
    }
  });

  it("allows only configured credentialed CORS origins", async () => {
    const allowed = await exports.default.fetch(
      new Request("https://api.example.test/configz", {
        headers: { Origin: "http://127.0.0.1:3000" },
      }),
    );
    expect(allowed.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:3000",
    );
    expect(allowed.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );

    const denied = await exports.default.fetch(
      new Request("https://api.example.test/configz", {
        headers: { Origin: "https://attacker.example" },
      }),
    );
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();

    const preflight = await exports.default.fetch(
      new Request("https://api.example.test/configz", {
        method: "OPTIONS",
        headers: {
          Origin: "http://127.0.0.1:3000",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type",
        },
      }),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-methods")).toContain(
      "GET",
    );

    const unsafePreflight = await exports.default.fetch(
      new Request("https://api.example.test/api/v1/reviews/submissions", {
        method: "OPTIONS",
        headers: {
          Origin: "http://127.0.0.1:3000",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers":
            "Content-Type, X-CSRF-Token, Idempotency-Key",
        },
      }),
    );
    expect(unsafePreflight.status).toBe(204);
    expect(unsafePreflight.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:3000",
    );
    expect(
      unsafePreflight.headers.get("access-control-allow-credentials"),
    ).toBe("true");
    expect(
      unsafePreflight.headers.get("access-control-allow-methods"),
    ).toContain("POST");
    expect(unsafePreflight.headers.get("access-control-allow-headers")).toBe(
      "Content-Type, X-CSRF-Token, Idempotency-Key",
    );

    const deniedUnsafePreflight = await exports.default.fetch(
      new Request("https://api.example.test/api/v1/reviews/submissions", {
        method: "OPTIONS",
        headers: {
          Origin: "https://attacker.example",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "X-CSRF-Token, Idempotency-Key",
        },
      }),
    );
    expect(deniedUnsafePreflight.status).toBe(204);
    expect(
      deniedUnsafePreflight.headers.get("access-control-allow-origin"),
    ).toBeNull();
    expect(
      deniedUnsafePreflight.headers.get("access-control-allow-credentials"),
    ).toBeNull();
  });

  it("returns redacted problem details and structured allowlisted logs", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await exports.default.fetch(
      "https://api.example.test/private/learner@example.test?token=secret",
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain(
      "application/problem+json",
    );
    const body = await response.text();
    expect(body).not.toContain("learner@example.test");
    expect(body).not.toContain("secret");
    const entry = log.mock.calls.map(([value]) => String(value)).join("\n");
    expect(entry).toContain('"route":"not_found"');
    expect(entry).not.toContain("learner@example.test");
    expect(entry).not.toContain("secret");
    log.mockRestore();
  });

  it("redacts unexpected failures from both responses and logs", async () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const failing = createApp({
      createPlatformRepository: () => ({
        checkHealth: () =>
          Promise.reject(
            new Error("token=secret learner=learner@example.test"),
          ),
        getMetadata: () => Promise.resolve(null),
        putMetadata: () => Promise.resolve(),
      }),
    });
    const response = await failing.request(
      "https://api.example.test/healthz",
      undefined,
      env,
    );
    expect(response.status).toBe(500);
    const responseText = await response.text();
    const logs = [...error.mock.calls, ...log.mock.calls]
      .map(([value]) => String(value))
      .join("\n");
    expect(responseText).toContain("an unexpected error occurred");
    expect(`${responseText}\n${logs}`).not.toContain("learner@example.test");
    expect(`${responseText}\n${logs}`).not.toContain("token=secret");
    expect(logs).toContain('"event":"api_error"');
    expect(logs).toContain('"category":"Error"');
    error.mockRestore();
    log.mockRestore();
  });
});
