import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  LOCAL_DEVELOPMENT_CONTRACT,
  validateBoundedLifecycleSource,
  validateLocalDevelopmentCommand,
  validateLocalDevelopmentRepository,
  validateLocalDevelopmentSources,
  validateLocalListenerCommand,
} from "./local-development-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");

function repositorySources() {
  const paths = {
    apiIdentityFixture: "apps/api-worker/test/identity-parity.test.ts",
    apiLocalD1Init: "apps/api-worker/scripts/local-d1-init.mjs",
    apiPackage: "apps/api-worker/package.json",
    apiTypes: "apps/api-worker/worker-configuration.d.ts",
    apiWrangler: "apps/api-worker/wrangler.jsonc",
    gitignore: ".gitignore",
    localSupervisor: "scripts/foundation/local-development-supervisor.mjs",
    localStackRoute: "apps/web/src/app/api/local-stack/route.ts",
    localStackSmoke: "scripts/foundation/local-stack-smoke.mjs",
    nextConfig: "apps/web/next.config.ts",
    rootPackage: "package.json",
    webEnvironment: "apps/web/src/lib/env.ts",
    webEnvironmentExample: "apps/web/.env.example",
    webPackage: "apps/web/package.json",
    webWrangler: "apps/web/wrangler.jsonc",
  };
  return Object.fromEntries(
    Object.entries(paths).map(([name, path]) => [
      name,
      readFileSync(resolve(repositoryRoot, path), "utf8"),
    ]),
  );
}

function mutatedSources(name, before, after) {
  const sources = repositorySources();
  assert.ok(
    sources[name].includes(before),
    `${name} fixture contains ${before}`,
  );
  sources[name] = sources[name].replaceAll(before, after);
  return sources;
}

test("the canonical local ports, origins, state, binding, and agent policy agree", () => {
  assert.deepEqual(validateLocalDevelopmentRepository(repositoryRoot), []);
  assert.deepEqual(LOCAL_DEVELOPMENT_CONTRACT, {
    host: "127.0.0.1",
    webPort: 3000,
    apiPort: 8080,
    webOrigin: "http://127.0.0.1:3000",
    apiOrigin: "http://127.0.0.1:8080",
    oauthCallback: "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
    oauthReturnAllowlist: [
      "http://127.0.0.1:3000/home",
      "http://127.0.0.1:3000/onboarding",
    ],
    apiWorkerName: "vocanova-api-local",
    webWorkerName: "vocanova-web-local",
    apiBinding: "API",
    databaseBinding: "DB",
    developerStateDirectory: ".wrangler/state/vocanova-local",
    testStateLocation: "os-temporary-directory-per-run",
  });
});

test("origin, callback, generated-type, service, remote, and agentRules drift fail closed", () => {
  const fixtures = [
    ["nextConfig", "agentRules: false", "agentRules: true", "agentRules"],
    [
      "webEnvironment",
      "http://127.0.0.1:8080",
      "http://127.0.0.1:8787",
      "web API origin",
    ],
    [
      "apiWrangler",
      "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
      "http://127.0.0.1:8787/api/v1/auth/oauth/google/callback",
      "local API origin contract",
    ],
    [
      "apiIdentityFixture",
      "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
      "http://127.0.0.1:8787/api/v1/auth/oauth/google/callback",
      "identity OAuth callback fixture",
    ],
    [
      "apiTypes",
      "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
      "http://127.0.0.1:8787/api/v1/auth/oauth/google/callback",
      "generated API types",
    ],
    [
      "webWrangler",
      '\"service\": \"vocanova-api-local\"',
      '\"service\": \"vocanova-api-other\"',
      "local API service name",
    ],
    [
      "apiWrangler",
      '\"workers_dev\": false',
      '\"remote\": true',
      "remote binding",
    ],
    [
      "webEnvironmentExample",
      "NEXT_PUBLIC_SENTRY_DSN=",
      "LEGACY_WEB_ORIGIN=http://localhost:3000\nNEXT_PUBLIC_SENTRY_DSN=",
      "canonical 127.0.0.1 ports",
    ],
  ];

  for (const [name, before, after, expected] of fixtures) {
    const errors = validateLocalDevelopmentSources(
      mutatedSources(name, before, after),
    );
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${name} mutation reports ${expected}: ${errors.join("; ")}`,
    );
  }
});

test("unsafe local commands and incomplete D1 initialization fail closed", () => {
  const unsafe = [
    ["remote", "wrangler dev --remote"],
    ["environment", "wrangler dev --env local"],
    ["remote", "wrangler dev --preview"],
    ["remote", "wrangler dev --tunnel"],
    ["deployment", "wrangler deploy"],
    ["provisioning", "wrangler dev --experimental-provision=true"],
    ["credential", "test -n $CLOUDFLARE_API_TOKEN"],
    ["background", "wrangler dev & next dev"],
    ["shell", "bash -c 'wrangler dev'"],
  ];
  for (const [expected, command] of unsafe) {
    const errors = validateLocalDevelopmentCommand("fixture", command);
    assert.ok(
      errors.some((error) => error.toLowerCase().includes(expected)),
      `${command} reports ${expected}: ${errors.join("; ")}`,
    );
  }

  const incomplete = validateLocalDevelopmentCommand(
    "dev:init",
    "wrangler d1 migrations apply DB --local",
  );
  for (const missing of [
    "--config",
    "wrangler.jsonc",
    "--persist-to",
    LOCAL_DEVELOPMENT_CONTRACT.developerStateDirectory,
  ]) {
    assert.ok(incomplete.some((error) => error.includes(missing)));
  }

  const wrongEnvironment = validateLocalDevelopmentCommand(
    "dev:init",
    "wrangler d1 migrations apply DB --local --config wrangler.jsonc --persist-to .wrangler/state/vocanova-local --env staging",
  );
  assert.ok(wrongEnvironment.some((error) => error.includes("environment")));
});

test("local D1 scripts and policy markers cannot drift", () => {
  const fixtures = [
    [
      "rootPackage",
      '"dev:init": "pnpm --filter @vocanova/api-worker run migrate:local"',
      '"dev:init": "wrangler d1 migrations apply DB --remote"',
      "delegate to the API local migration",
    ],
    [
      "apiPackage",
      '"migrate:local": "node scripts/local-d1-init.mjs"',
      '"migrate:local": "wrangler d1 migrations apply DB --remote"',
      "reviewed local D1 initializer",
    ],
    ["apiLocalD1Init", '"--local"', '"--remote"', 'must equal "--local"'],
    [
      "apiLocalD1Init",
      'WRANGLER_SEND_METRICS: "false"',
      'WRANGLER_SEND_METRICS: "true"',
      "WRANGLER_SEND_METRICS",
    ],
    [
      "apiLocalD1Init",
      "validateLocalD1CliArguments(process.argv.slice(2))",
      "validateLocalD1CliArguments([])",
      "process.argv.slice(2)",
    ],
  ];

  for (const [name, before, after, expected] of fixtures) {
    const errors = validateLocalDevelopmentSources(
      mutatedSources(name, before, after),
    );
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${name} mutation reports ${expected}: ${errors.join("; ")}`,
    );
  }
});

test("supervised loop entry points, lifecycle markers, and listeners cannot drift", () => {
  const fixtures = [
    [
      "rootPackage",
      '"dev": "node scripts/foundation/local-development-supervisor.mjs fast"',
      '"dev": "pnpm --filter @vocanova/web dev"',
      "fast-loop supervisor",
    ],
    [
      "rootPackage",
      '"dev:workers": "node scripts/foundation/local-development-supervisor.mjs workers"',
      '"dev:workers": "wrangler dev --remote"',
      "two-Worker supervisor",
    ],
    ["apiPackage", "--port 8080", "--port 8787", "port 8080"],
    [
      "webPackage",
      "--hostname 127.0.0.1 --port 3000",
      "--port 3001",
      "canonical host 127.0.0.1 and port 3000",
    ],
    [
      "localSupervisor",
      "SHUTDOWN_GRACE_MS = 5_000",
      "SHUTDOWN_GRACE_MS = Number.POSITIVE_INFINITY",
      "SHUTDOWN_GRACE_MS",
    ],
    [
      "localSupervisor",
      'record.child.kill("SIGKILL")',
      'record.child.kill("SIGTERM")',
      "SIGKILL",
    ],
    ["localSupervisor", "shell: false", "shell: true", "shell: false"],
    [
      "localSupervisor",
      "PNPM_CONFIG_STORE_DIR: installedModules.storeDir",
      'PNPM_CONFIG_STORE_DIR: "/tmp/unlocked-store"',
      "PNPM_CONFIG_STORE_DIR",
    ],
    [
      "localSupervisor",
      "PNPM_CONFIG_NPMRC_AUTH_FILE: runtimePnpmAuthFile",
      'PNPM_CONFIG_NPMRC_AUTH_FILE: "/home/user/.npmrc"',
      "PNPM_CONFIG_NPMRC_AUTH_FILE",
    ],
  ];

  for (const [name, before, after, expected] of fixtures) {
    const errors = validateLocalDevelopmentSources(
      mutatedSources(name, before, after),
    );
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${name} mutation reports ${expected}: ${errors.join("; ")}`,
    );
  }
});

test("disposable local-stack entry points, evidence, and binding marker cannot drift", () => {
  const fixtures = [
    [
      "rootPackage",
      '"test:local-stack": "node scripts/foundation/local-stack-smoke.mjs"',
      '"test:local-stack": "wrangler dev --remote"',
      "reviewed disposable smoke",
    ],
    [
      "rootPackage",
      '"ci:local-stack": "node --test scripts/foundation/local-stack-smoke.test.mjs && pnpm run test:local-stack"',
      '"ci:local-stack": "pnpm run test:local-stack"',
      "lifecycle fixtures and real smoke",
    ],
    [
      "localStackSmoke",
      'purpose: "test"',
      'purpose: "developer"',
      'purpose: "test"',
    ],
    [
      "localStackSmoke",
      "assertRepositoryTreeUnchanged",
      "acceptRepositoryTreeChanges",
      "assertRepositoryTreeUnchanged",
    ],
    ["localStackRoute", "env.API.fetch", "fetch", "env.API.fetch"],
    [
      "localStackRoute",
      'env.ENVIRONMENT !== "local"',
      'env.ENVIRONMENT !== "production"',
      'env.ENVIRONMENT !== "local"',
    ],
  ];

  for (const [name, before, after, expected] of fixtures) {
    const errors = validateLocalDevelopmentSources(
      mutatedSources(name, before, after),
    );
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${name} mutation reports ${expected}: ${errors.join("; ")}`,
    );
  }
});

test("listener commands cannot silently fall back to a different port or host", () => {
  assert.deepEqual(
    validateLocalListenerCommand(
      "web",
      "next dev --hostname 127.0.0.1 --port 3000",
      "web",
    ),
    [],
  );
  assert.deepEqual(
    validateLocalListenerCommand(
      "api",
      "wrangler dev --local --ip 127.0.0.1 --port 8080",
      "api",
    ),
    [],
  );
  const webErrors = validateLocalListenerCommand("web", "next dev", "web");
  assert.ok(webErrors.some((error) => error.includes("bind 127.0.0.1")));
  assert.ok(webErrors.some((error) => error.includes("port 3000")));
  const apiErrors = validateLocalListenerCommand(
    "api",
    "wrangler dev --local --port 8787",
    "api",
  );
  assert.ok(apiErrors.some((error) => error.includes("bind 127.0.0.1")));
  assert.ok(apiErrors.some((error) => error.includes("port 8080")));
});

test("lifecycle fixtures require bounded readiness and shutdown", () => {
  assert.deepEqual(
    validateBoundedLifecycleSource(
      "supervisor",
      "const READINESS_TIMEOUT_MS = 30_000; const SHUTDOWN_GRACE_MS = 5_000; async function readiness() { await spawn(); }",
    ),
    [],
  );
  const errors = validateBoundedLifecycleSource(
    "fixture",
    "async function waitForReadiness() { while (true) await poll(); }",
  );
  assert.ok(errors.some((error) => error.includes("unbounded")));
  assert.ok(errors.some((error) => error.includes("READINESS_TIMEOUT_MS")));
  assert.ok(errors.some((error) => error.includes("SHUTDOWN_GRACE_MS")));
});
