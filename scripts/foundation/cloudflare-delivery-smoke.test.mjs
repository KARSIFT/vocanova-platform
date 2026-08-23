import assert from "node:assert/strict";
import test from "node:test";

import { runDeliverySmoke } from "./cloudflare-delivery-smoke.mjs";

const release = "a".repeat(40);

test("delivery smoke binds API, D1, contract, web, environment, and exact release", async () => {
  const result = await runDeliverySmoke({
    apiUrl: "https://api-staging.example.com",
    webUrl: "https://web-staging.example.com",
    environment: "staging",
    release,
    attempts: 2,
    timeoutSeconds: 10,
    fetchImpl: passingFetch(),
    delay: () => Promise.resolve(),
  });
  assert.deepEqual(result, {
    status: "pass",
    attempts: 1,
    environment: "staging",
    release,
  });
});

test("delivery smoke retries bounded transient failure", async () => {
  let first = true;
  const fetchImpl = async (url) => {
    if (first) {
      first = false;
      return response(503, {});
    }
    return passingFetch()(url);
  };
  const result = await runDeliverySmoke({
    apiUrl: "https://api-staging.example.com",
    webUrl: "https://web-staging.example.com",
    environment: "staging",
    release,
    attempts: 2,
    timeoutSeconds: 10,
    fetchImpl,
    delay: () => Promise.resolve(),
  });
  assert.equal(result.attempts, 2);
});

test("delivery smoke rejects placeholders, release drift, unhealthy D1, and non-HTML web", async () => {
  const cases = [
    {
      overrides: { apiUrl: "https://api-staging.invalid" },
      pattern: /authorized HTTPS route/,
    },
    { overrides: { release: "main" }, pattern: /exact commit SHA/ },
    {
      fetchImpl: routeFetch({
        health: { status: "ok", database: "unhealthy" },
      }),
      pattern: /health evidence/,
    },
    {
      fetchImpl: routeFetch({ webContentType: "application/json" }),
      pattern: /did not return HTML/,
    },
  ];
  for (const fixture of cases) {
    await assert.rejects(
      runDeliverySmoke({
        apiUrl: "https://api-staging.example.com",
        webUrl: "https://web-staging.example.com",
        environment: "staging",
        release,
        attempts: 1,
        timeoutSeconds: 10,
        fetchImpl: fixture.fetchImpl ?? passingFetch(),
        delay: () => Promise.resolve(),
        ...fixture.overrides,
      }),
      fixture.pattern,
    );
  }
});

function passingFetch() {
  return routeFetch({});
}

function routeFetch(overrides) {
  return async (input) => {
    const url = new URL(input);
    if (url.pathname === "/healthz") {
      return response(
        200,
        overrides.health ?? { status: "ok", database: "ok" },
      );
    }
    if (url.pathname === "/configz") {
      return response(200, {
        environment: "staging",
        release,
        runtime: "cloudflare-workers",
        data: "d1",
        migrationStatus: "full-api-parity",
      });
    }
    if (url.pathname === "/openapi.json") {
      return response(200, { openapi: "3.1.0", paths: { "/healthz": {} } });
    }
    return response(
      200,
      "<html></html>",
      overrides.webContentType ?? "text/html",
    );
  };
}

function response(status, body, contentType = "application/json") {
  return new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}
