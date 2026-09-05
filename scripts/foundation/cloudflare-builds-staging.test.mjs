import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createBuildPlan,
  createDeployPlan,
  validateCloudflareBuild,
} from "./cloudflare-builds-staging.mjs";

const release = "0123456789012345678901234567890123456789";

test("package scripts expose only the reviewed Cloudflare Builds entry points", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8"),
  );
  assert.equal(
    packageJson.scripts["cloudflare:build:staging"],
    "node scripts/foundation/cloudflare-builds-staging.mjs build",
  );
  assert.equal(
    packageJson.scripts["cloudflare:deploy:staging"],
    "node scripts/foundation/cloudflare-builds-staging.mjs deploy",
  );
});

test("requires a Cloudflare main-branch build with an exact Git SHA", () => {
  assert.equal(
    validateCloudflareBuild({
      WORKERS_CI: "1",
      WORKERS_CI_BRANCH: "main",
      WORKERS_CI_COMMIT_SHA: release,
    }),
    release,
  );

  for (const environment of [
    {},
    {
      WORKERS_CI: "1",
      WORKERS_CI_BRANCH: "feature",
      WORKERS_CI_COMMIT_SHA: release,
    },
    {
      WORKERS_CI: "1",
      WORKERS_CI_BRANCH: "main",
      WORKERS_CI_COMMIT_SHA: "bad",
    },
  ]) {
    assert.throws(() => validateCloudflareBuild(environment));
  }
});

test("builds the validated web release for staging origins", () => {
  const plan = createBuildPlan(release);
  assert.deepEqual(
    plan.map(({ command, args }) => [command, ...args]),
    [
      ["pnpm", "validate"],
      ["pnpm", "--filter", "@vocanova/web", "cloudflare:build"],
    ],
  );
  assert.equal(plan[1].env.API_BASE_URL, "https://api-stag.vocanova.site");
  assert.equal(
    plan[1].env.NEXT_PUBLIC_API_BASE_URL,
    "https://api-stag.vocanova.site",
  );
  assert.equal(plan[1].env.NEXT_PUBLIC_SENTRY_RELEASE, release);
});

test("deploys migrations, API, web, and smoke checks in order", () => {
  const plan = createDeployPlan(release);
  assert.deepEqual(
    plan.map(({ command, args }) => [command, ...args]),
    [
      ["pnpm", "--filter", "@vocanova/api-worker", "dry-run:staging"],
      [
        "pnpm",
        "--filter",
        "@vocanova/api-worker",
        "exec",
        "wrangler",
        "d1",
        "migrations",
        "apply",
        "DB",
        "--remote",
        "--env",
        "staging",
      ],
      [
        "pnpm",
        "--filter",
        "@vocanova/api-worker",
        "exec",
        "wrangler",
        "deploy",
        "--env",
        "staging",
        "--strict",
        "--experimental-provision=false",
        "--experimental-auto-create=false",
        "--tag",
        `sha-${release}`,
        "--message",
        `Cloudflare Builds ${release}`,
        "--var",
        `RELEASE:${release}`,
      ],
      [
        "pnpm",
        "--filter",
        "@vocanova/web",
        "exec",
        "wrangler",
        "deploy",
        "--env",
        "staging",
        "--strict",
        "--experimental-provision=false",
        "--experimental-auto-create=false",
        "--tag",
        `sha-${release}`,
        "--message",
        `Cloudflare Builds ${release}`,
      ],
      ["node", "scripts/foundation/smoke-staging.mjs", release],
    ],
  );
  assert(plan.every(({ env }) => !("WRANGLER_CI_OVERRIDE_NAME" in env)));
});
