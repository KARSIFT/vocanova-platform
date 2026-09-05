import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  const fetchImpl = async (url, options) => {
    requested.push({ url, options });
    if (url.endsWith("/healthz")) {
      return response({ status: "ok", database: "ok" });
    }
    if (url.endsWith("/configz")) {
      return response({ environment: "staging", release: "abc123" });
    }
    return response(null);
  };

  await smokeStaging("abc123", fetchImpl);
  assert.deepEqual(
    requested.map(({ url }) => url),
    [
      "https://api-stag.vocanova.site/healthz",
      "https://api-stag.vocanova.site/configz",
      "https://stag.vocanova.site/",
    ],
  );
  for (const { options } of requested) {
    assert.equal(options.redirect, "error");
    assert(options.signal instanceof AbortSignal);
    assert.equal(options.signal.aborted, false);
  }
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

test("rejects a non-staging environment", async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith("/healthz")) {
      return response({ status: "ok", database: "ok" });
    }
    return response({ environment: "production", release: "abc123" });
  };

  await assert.rejects(
    smokeStaging("abc123", fetchImpl),
    /environment production/,
  );
});

test("rejects an unavailable web origin", async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith("/healthz")) {
      return response({ status: "ok", database: "ok" });
    }
    if (url.endsWith("/configz")) {
      return response({ environment: "staging", release: "abc123" });
    }
    return response(null, 503);
  };

  await assert.rejects(smokeStaging("abc123", fetchImpl), /\/.*503/);
});

test("CLI rejects an invalid SHA before starting smoke requests", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/foundation/smoke-staging.mjs", "invalid"],
    { encoding: "utf8", shell: false },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /40-character-git-sha/);
  assert.doesNotMatch(result.stderr, /fetch|HTTP|healthz|configz/);
});
