/* global AbortSignal, fetch */

import { access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://api-stag.vocanova.site";

export async function resolveStagingWorkerTags(environment, fetchImpl = fetch) {
  validateCloudflareBuild(environment);
  const accountId = environment.CLOUDFLARE_ACCOUNT_ID;
  const token = environment.CLOUDFLARE_API_TOKEN;
  const connectedTag = environment.WRANGLER_CI_MATCH_TAG;
  if (!/^[a-f0-9]{32}$/.test(accountId ?? "") || !token || !connectedTag) {
    throw new Error(
      "Cloudflare build account, API token, and connected Worker tag are required",
    );
  }
  const tags = {};
  for (const [role, name] of [
    ["web", "vocanova-web-staging"],
    ["api", "vocanova-api-staging"],
  ]) {
    const response = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/services/${name}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Cannot verify ${name} identity (HTTP ${response.status})`,
      );
    }
    const metadata = await response.json();
    const tag = metadata.result?.default_environment?.script?.tag;
    if (metadata.success !== true || typeof tag !== "string" || !tag.trim()) {
      throw new Error(`Cloudflare returned no valid identity for ${name}`);
    }
    if (role === "web" && tag !== connectedTag) {
      throw new Error("This build must be connected to vocanova-web-staging");
    }
    tags[role] = tag;
  }
  if (tags.api === tags.web) {
    throw new Error(
      "The staging API and web must have distinct Worker identities",
    );
  }
  return tags;
}

function childEnvironment(baseEnvironment, additions = {}) {
  const environment = { ...baseEnvironment, ...additions };
  delete environment.WRANGLER_CI_OVERRIDE_NAME;
  return environment;
}

export function validateCloudflareBuild(environment) {
  if (environment.WORKERS_CI !== "1") {
    throw new Error(
      "staging delivery must run inside Cloudflare Workers Builds",
    );
  }
  if (environment.WORKERS_CI_BRANCH !== "main") {
    throw new Error("staging delivery accepts only the main branch");
  }
  const release = environment.WORKERS_CI_COMMIT_SHA;
  if (!/^[0-9a-f]{40}$/.test(release ?? "")) {
    throw new Error("Cloudflare must provide a 40-character Git commit SHA");
  }
  return release;
}

export function createBuildPlan(release, baseEnvironment = process.env) {
  return [
    {
      command: "pnpm",
      args: ["validate"],
      env: childEnvironment(baseEnvironment),
    },
    {
      command: "pnpm",
      args: ["--filter", "@vocanova/web", "cloudflare:build"],
      env: childEnvironment(baseEnvironment, {
        API_BASE_URL: API_ORIGIN,
        NEXT_PUBLIC_API_BASE_URL: API_ORIGIN,
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: "staging",
        NEXT_PUBLIC_SENTRY_RELEASE: release,
      }),
    },
  ];
}

export function createDeployPlan(
  release,
  baseEnvironment = process.env,
  workerTags,
) {
  if (
    !workerTags?.api ||
    !workerTags.web ||
    workerTags.api === workerTags.web ||
    workerTags.web !== baseEnvironment.WRANGLER_CI_MATCH_TAG
  ) {
    throw new Error(
      "Verify both staging Worker identities before creating the deploy plan",
    );
  }
  const env = childEnvironment(baseEnvironment);
  const apiEnvironment = childEnvironment(baseEnvironment, {
    WRANGLER_CI_MATCH_TAG: workerTags.api,
  });
  const message = `Cloudflare Builds ${release}`;
  return [
    {
      command: "pnpm",
      args: ["--filter", "@vocanova/api-worker", "dry-run:staging"],
      env: apiEnvironment,
    },
    {
      command: "pnpm",
      args: [
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
      env: apiEnvironment,
    },
    {
      command: "pnpm",
      args: [
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
        message,
        "--var",
        `RELEASE:${release}`,
      ],
      env: apiEnvironment,
    },
    {
      command: "pnpm",
      args: [
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
        message,
      ],
      env,
    },
    {
      command: "node",
      args: ["scripts/foundation/smoke-staging.mjs", release],
      env,
    },
  ];
}

function runPlan(plan) {
  for (const step of plan) {
    const result = spawnSync(step.command, step.args, {
      env: step.env,
      shell: false,
      stdio: "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

async function main() {
  const mode = process.argv[2];
  const release = validateCloudflareBuild(process.env);
  if (mode === "build") {
    runPlan(createBuildPlan(release));
    return;
  }
  if (mode === "deploy") {
    await access("apps/web/.open-next/worker.js");
    const workerTags = await resolveStagingWorkerTags(process.env);
    runPlan(createDeployPlan(release, process.env, workerTags));
    return;
  }
  throw new Error(
    "usage: node scripts/foundation/cloudflare-builds-staging.mjs <build|deploy>",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
