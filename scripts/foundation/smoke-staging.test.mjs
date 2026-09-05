import assert from "node:assert/strict";
import test from "node:test";

import { smokeStaging } from "./smoke-staging.mjs";

function response(body, status = 200) {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: body === null ? {} : { "content-type": "application/json" },
  });
}

test("accepts healthy staging for the expected release", async () => {
  const requested = [];
  const fetchImpl = async (url) => {
    requested.push(url);
    if (url.endsWith("/healthz")) {
      return response({ status: "ok", database: "ok" });
    }
    if (url.endsWith("/configz")) {
      return response({ environment: "staging", release: "abc123" });
    }
    return response(null);
  };

  await smokeStaging("abc123", fetchImpl);
  assert.deepEqual(requested, [
    "https://api-stag.vocanova.site/healthz",
    "https://api-stag.vocanova.site/configz",
    "https://stag.vocanova.site/",
  ]);
});

test("rejects a deployment whose API reports another release", async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith("/healthz")) {
      return response({ status: "ok", database: "ok" });
    }
    if (url.endsWith("/configz")) {
      return response({ environment: "staging", release: "old-release" });
    }
    return response(null);
  };

  await assert.rejects(
    smokeStaging("expected-release", fetchImpl),
    /expected-release.*old-release/,
  );
});

test("rejects unhealthy endpoints", async () => {
  const fetchImpl = async (url) =>
    url.endsWith("/healthz")
      ? response({ status: "degraded", database: "error" }, 503)
      : response(null);

  await assert.rejects(smokeStaging("abc123", fetchImpl), /healthz.*503/);
});
