import { describe, expect, it, vi } from "vitest";
import { env, exports } from "cloudflare:workers";

import { createApp } from "../src/app.js";

describe("Worker API migration target", () => {
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
      migrationStatus: "identity-account-parity",
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
      "/api/v1/me",
      "/api/v1/onboarding",
      "/api/v1/settings",
      "/api/v1/settings/email-change-links",
      "/api/v1/settings/email-change-links/consume",
      "/configz",
      "/healthz",
    ]);
  });

  it("allows only configured credentialed CORS origins", async () => {
    const allowed = await exports.default.fetch(
      new Request("https://api.example.test/configz", {
        headers: { Origin: "http://localhost:3000" },
      }),
    );
    expect(allowed.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:3000",
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
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Headers": "Content-Type",
        },
      }),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-methods")).toContain(
      "GET",
    );
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
