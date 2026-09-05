import { access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://api-stag.vocanova.site";

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

export function createDeployPlan(release, baseEnvironment = process.env) {
  const env = childEnvironment(baseEnvironment);
  const message = `Cloudflare Builds ${release}`;
  return [
    {
      command: "pnpm",
      args: ["--filter", "@vocanova/api-worker", "dry-run:staging"],
      env,
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
      env,
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
      env,
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
    runPlan(createDeployPlan(release));
    return;
  }
  throw new Error(
    "usage: node scripts/foundation/cloudflare-builds-staging.mjs <build|deploy>",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
