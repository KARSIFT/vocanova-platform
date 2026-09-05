import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { URL } from "node:url";

import {
  createBuildPlan,
  createDeployPlan,
  resolveStagingWorkerTags,
  validateCloudflareBuild,
} from "./cloudflare-builds-staging.mjs";

const release = "0123456789012345678901234567890123456789";
const workerTags = { api: "api-staging-tag", web: "web-staging-tag" };
const buildEnvironment = {
  WORKERS_CI: "1",
  WORKERS_CI_BRANCH: "main",
  WORKERS_CI_COMMIT_SHA: release,
  CLOUDFLARE_ACCOUNT_ID: "a".repeat(32),
  CLOUDFLARE_API_TOKEN: "synthetic-build-token",
  WRANGLER_CI_OVERRIDE_NAME: "vocanova-web-staging",
  WRANGLER_CI_MATCH_TAG: workerTags.web,
};

function metadataResponse(tag, success = true) {
  return {
    ok: true,
    json: async () => ({
      success,
      result: { default_environment: { script: { tag } } },
    }),
  };
}

test("resolves existing staging identities with authenticated bounded reads", async () => {
  const urls = [];
  const tags = await resolveStagingWorkerTags(
    buildEnvironment,
    async (url, options) => {
      urls.push(url);
      assert.equal(
        options.headers.Authorization,
        `Bearer ${buildEnvironment.CLOUDFLARE_API_TOKEN}`,
      );
      assert.equal(options.signal.aborted, false);
      return metadataResponse(
        url.endsWith("vocanova-web-staging") ? workerTags.web : workerTags.api,
      );
    },
  );
  assert.deepEqual(tags, workerTags);
  assert.deepEqual(urls, [
    `https://api.cloudflare.com/client/v4/accounts/${buildEnvironment.CLOUDFLARE_ACCOUNT_ID}/workers/services/vocanova-web-staging`,
    `https://api.cloudflare.com/client/v4/accounts/${buildEnvironment.CLOUDFLARE_ACCOUNT_ID}/workers/services/vocanova-api-staging`,
  ]);
});

test("rejects invalid build identity inputs before any network request", async () => {
  for (const overrides of [
    { WORKERS_CI_BRANCH: "feature" },
    { CLOUDFLARE_ACCOUNT_ID: "invalid" },
    { CLOUDFLARE_API_TOKEN: "" },
    { WRANGLER_CI_MATCH_TAG: "" },
  ]) {
    let calls = 0;
    await assert.rejects(
      resolveStagingWorkerTags(
        { ...buildEnvironment, ...overrides },
        async () => {
          calls++;
          return metadataResponse(workerTags.web);
        },
      ),
    );
    assert.equal(calls, 0);
  }
});

test("rejects a build attached to another Worker before looking up the API", async () => {
  let calls = 0;
  await assert.rejects(
    resolveStagingWorkerTags(buildEnvironment, async () => {
      calls++;
      return metadataResponse("another-worker-tag");
    }),
    /must be connected to vocanova-web-staging/,
  );
  assert.equal(calls, 1);
});

test("fails closed when either Worker lookup fails or has invalid metadata", async () => {
  for (const failedRole of ["web", "api"]) {
    for (const response of [
      { ok: false, status: 403 },
      { ok: false, status: 404 },
      metadataResponse(""),
      metadataResponse(undefined),
      metadataResponse(123),
      metadataResponse(workerTags[failedRole], false),
      {
        ok: true,
        json: async () => {
          throw new Error("invalid JSON");
        },
      },
    ]) {
      await assert.rejects(
        resolveStagingWorkerTags(buildEnvironment, async (url) =>
          url.endsWith(`vocanova-${failedRole}-staging`)
            ? response
            : metadataResponse(workerTags.web),
        ),
      );
    }
  }
  await assert.rejects(
    resolveStagingWorkerTags(buildEnvironment, async () => {
      throw new Error("network unavailable");
    }),
    /network unavailable/,
  );
});

test("does not accept the same identity for both Workers or unverified deployment tags", async () => {
  await assert.rejects(
    resolveStagingWorkerTags(buildEnvironment, async () =>
      metadataResponse(workerTags.web),
    ),
    /distinct Worker identities/,
  );
  for (const tags of [
    undefined,
    {},
    { api: workerTags.api },
    { api: workerTags.web, web: workerTags.web },
    { api: workerTags.api, web: "wrong-web" },
  ]) {
    assert.throws(
      () => createDeployPlan(release, buildEnvironment, tags),
      /Verify both staging Worker identities/,
    );
  }
});

test("deploys each Worker with its own CI identity instead of inheriting the web tag", () => {
  const plan = createDeployPlan(release, buildEnvironment, workerTags);
  for (const step of plan.filter(({ args }) =>
    args.includes("@vocanova/api-worker"),
  )) {
    assert.equal(step.env.WRANGLER_CI_MATCH_TAG, workerTags.api);
    assert.equal(
      step.env.CLOUDFLARE_ACCOUNT_ID,
      buildEnvironment.CLOUDFLARE_ACCOUNT_ID,
    );
    assert.equal(
      step.env.CLOUDFLARE_API_TOKEN,
      buildEnvironment.CLOUDFLARE_API_TOKEN,
    );
  }
  const webDeploy = plan.find(({ args }) => args.includes("@vocanova/web"));
  assert.equal(webDeploy.env.WRANGLER_CI_MATCH_TAG, workerTags.web);
  assert(plan.every(({ env }) => !("WRANGLER_CI_OVERRIDE_NAME" in env)));
  assert.equal(buildEnvironment.WRANGLER_CI_MATCH_TAG, workerTags.web);
  assert.equal(
    buildEnvironment.WRANGLER_CI_OVERRIDE_NAME,
    "vocanova-web-staging",
  );
});

test("deploys the prepared web artifact directly and preflights it before migrations", () => {
  const plan = createDeployPlan(release, buildEnvironment, workerTags);
  const webSteps = plan.filter(({ args }) => args.includes("@vocanova/web"));
  assert.equal(webSteps.length, 2);
  for (const step of webSteps) {
    assert.equal(step.env.OPEN_NEXT_DEPLOY, "true");
    assert.equal(step.env.WRANGLER_CI_MATCH_TAG, workerTags.web);
  }
  const preflight = plan.findIndex(({ args }) =>
    args.includes("cloudflare:dry-run:staging"),
  );
  const migration = plan.findIndex(({ args }) => args.includes("migrations"));
  assert(preflight >= 0 && preflight < migration);
  assert(
    plan
      .filter(({ args }) => args.includes("@vocanova/api-worker"))
      .every(({ env }) => env.OPEN_NEXT_DEPLOY === undefined),
  );
});

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
  const plan = createDeployPlan(release, buildEnvironment, workerTags);
  assert.deepEqual(
    plan.map(({ command, args }) => [command, ...args]),
    [
      ["pnpm", "--filter", "@vocanova/api-worker", "dry-run:staging"],
      ["pnpm", "--filter", "@vocanova/web", "cloudflare:dry-run:staging"],
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
