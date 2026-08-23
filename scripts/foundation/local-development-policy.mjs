import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const LOCAL_DEVELOPMENT_CONTRACT = Object.freeze({
  host: "127.0.0.1",
  webPort: 3000,
  apiPort: 8080,
  webOrigin: "http://127.0.0.1:3000",
  apiOrigin: "http://127.0.0.1:8080",
  oauthCallback: "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
  oauthReturnAllowlist: Object.freeze([
    "http://127.0.0.1:3000/home",
    "http://127.0.0.1:3000/onboarding",
  ]),
  apiWorkerName: "vocanova-api-local",
  webWorkerName: "vocanova-web-local",
  apiBinding: "API",
  databaseBinding: "DB",
  developerStateDirectory: ".wrangler/state/vocanova-local",
  testStateLocation: "os-temporary-directory-per-run",
});

const LOCAL_SOURCE_FILES = Object.freeze({
  apiIdentityFixture: "apps/api-worker/test/identity-parity.test.ts",
  apiLocalD1Init: "apps/api-worker/scripts/local-d1-init.mjs",
  apiPackage: "apps/api-worker/package.json",
  apiTypes: "apps/api-worker/worker-configuration.d.ts",
  apiWrangler: "apps/api-worker/wrangler.jsonc",
  gitignore: ".gitignore",
  localSupervisor: "scripts/foundation/local-development-supervisor.mjs",
  nextConfig: "apps/web/next.config.ts",
  rootPackage: "package.json",
  webEnvironment: "apps/web/src/lib/env.ts",
  webEnvironmentExample: "apps/web/.env.example",
  webPackage: "apps/web/package.json",
  webWrangler: "apps/web/wrangler.jsonc",
});

const FORBIDDEN_LOCAL_COMMAND_PATTERNS = Object.freeze([
  [
    /(?:^|\s)--(?:remote|preview|tunnel)(?:\s|=|$)/i,
    "remote binding or resource selection",
  ],
  [/(?:^|\s)--env(?:=|\s+)/i, "non-canonical environment selection"],
  [
    /\bwrangler\s+(?:deploy|publish|delete|rollback|secret|tail|versions|deployments)\b/i,
    "Cloudflare deployment or live mutation command",
  ],
  [/\bwrangler\s+d1\s+(?:execute|export)\b/i, "unapproved local D1 command"],
  [
    /--experimental-(?:provision|auto-create)(?:=|\s+)true\b/i,
    "automatic Cloudflare resource provisioning",
  ],
  [
    /\b(?:CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|CF_API_TOKEN|CF_ACCOUNT_ID)\b/,
    "Cloudflare credential access",
  ],
  [
    /\b(?:bash|sh|zsh)\s+-c\b|(?:^|\s)(?:nohup|setsid|disown)\b/i,
    "unsafe shell or detached process launch",
  ],
  [/(^|[^&])&([^&]|$)/, "shell background process launch"],
]);

function readSources(repositoryRoot) {
  return Object.fromEntries(
    Object.entries(LOCAL_SOURCE_FILES).map(([name, path]) => [
      name,
      readFileSync(resolve(repositoryRoot, path), "utf8"),
    ]),
  );
}

function requireLiteral(errors, source, literal, description) {
  if (!source.includes(literal))
    errors.push(`${description} must equal ${literal}`);
}

function parseScripts(source, filename, errors) {
  try {
    return JSON.parse(source).scripts ?? {};
  } catch (error) {
    errors.push(
      `${filename} must be parseable JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
    return {};
  }
}

export function validateLocalDevelopmentCommand(name, command) {
  const errors = [];
  if (typeof command !== "string" || command.trim() === "") {
    return [`${name}: local-development command must be a non-empty string`];
  }

  for (const [pattern, capability] of FORBIDDEN_LOCAL_COMMAND_PATTERNS) {
    if (pattern.test(command)) errors.push(`${name}: prohibited ${capability}`);
  }

  if (/\bwrangler\s+d1\s+migrations\s+apply\b/i.test(command)) {
    for (const required of [
      "DB",
      "--local",
      "--config",
      "wrangler.jsonc",
      "--persist-to",
    ]) {
      if (!command.includes(required)) {
        errors.push(`${name}: local D1 migration must include ${required}`);
      }
    }
    if (!command.includes(LOCAL_DEVELOPMENT_CONTRACT.developerStateDirectory)) {
      errors.push(
        `${name}: local D1 migration must use ${LOCAL_DEVELOPMENT_CONTRACT.developerStateDirectory}`,
      );
    }
    if (/(?:^|\s)--env(?:=|\s)/i.test(command)) {
      errors.push(
        `${name}: local D1 migration must use the top-level local config without --env`,
      );
    }
  }

  return errors;
}

export function validateLocalListenerCommand(name, command, role) {
  const errors = validateLocalDevelopmentCommand(name, command);
  const expectedPort =
    role === "web"
      ? LOCAL_DEVELOPMENT_CONTRACT.webPort
      : LOCAL_DEVELOPMENT_CONTRACT.apiPort;
  const hostFlags = role === "web" ? ["--hostname", "-H"] : ["--ip"];
  if (!hostFlags.some((flag) => command.includes(flag))) {
    errors.push(
      `${name}: ${role} listener must bind ${LOCAL_DEVELOPMENT_CONTRACT.host} explicitly`,
    );
  }
  if (
    !new RegExp(`(?:--port|-p)(?:=|\\s+)${expectedPort}(?:\\s|$)`).test(command)
  ) {
    errors.push(`${name}: ${role} listener must reserve port ${expectedPort}`);
  }
  if (!command.includes(LOCAL_DEVELOPMENT_CONTRACT.host)) {
    errors.push(
      `${name}: ${role} listener must use ${LOCAL_DEVELOPMENT_CONTRACT.host}`,
    );
  }
  return errors;
}

export function validateBoundedLifecycleSource(name, source) {
  const errors = [];
  if (/\b(?:while\s*\(\s*true\s*\)|setInterval\s*\()/m.test(source)) {
    errors.push(`${name}: unbounded lifecycle wait is prohibited`);
  }
  if (/\b(?:spawn|readiness|shutdown|waitFor[A-Z]\w*)\b/i.test(source)) {
    for (const marker of ["READINESS_TIMEOUT_MS", "SHUTDOWN_GRACE_MS"]) {
      if (!source.includes(marker)) {
        errors.push(`${name}: lifecycle source must define ${marker}`);
      }
    }
  }
  return errors;
}

export function validateLocalDevelopmentSources(sources) {
  const errors = [];
  const contract = LOCAL_DEVELOPMENT_CONTRACT;

  requireLiteral(
    errors,
    sources.nextConfig,
    "agentRules: false",
    "Next agentRules",
  );
  requireLiteral(
    errors,
    sources.webWrangler,
    `\"name\": \"${contract.webWorkerName}\"`,
    "local web Worker name",
  );
  requireLiteral(
    errors,
    sources.webWrangler,
    `\"binding\": \"${contract.apiBinding}\"`,
    "web API service binding",
  );
  requireLiteral(
    errors,
    sources.webWrangler,
    `\"service\": \"${contract.apiWorkerName}\"`,
    "local API service name",
  );
  requireLiteral(
    errors,
    sources.apiWrangler,
    `\"name\": \"${contract.apiWorkerName}\"`,
    "local API Worker name",
  );
  requireLiteral(
    errors,
    sources.apiWrangler,
    `\"binding\": \"${contract.databaseBinding}\"`,
    "local D1 binding",
  );

  const expectedApiVars = [
    `\"CORS_ALLOWED_ORIGINS\": \"${contract.webOrigin}\"`,
    `\"AUTH_BASE_URL\": \"${contract.webOrigin}\"`,
    `\"OAUTH_REDIRECT_URI\": \"${contract.oauthCallback}\"`,
    `\"OAUTH_RETURN_ALLOWLIST\": \"${contract.oauthReturnAllowlist.join(",")}\"`,
  ];
  for (const variable of expectedApiVars) {
    requireLiteral(
      errors,
      sources.apiWrangler,
      variable,
      "local API origin contract",
    );
  }

  for (const source of [
    sources.webEnvironment,
    sources.webEnvironmentExample,
  ]) {
    requireLiteral(errors, source, contract.apiOrigin, "web API origin");
  }
  for (const source of [
    sources.webEnvironment,
    sources.webEnvironmentExample,
    sources.apiWrangler,
    sources.apiIdentityFixture,
    sources.apiTypes,
  ]) {
    if (
      /http:\/\/localhost:(?:3000|8080|8787)|http:\/\/127\.0\.0\.1:8787/.test(
        source,
      )
    ) {
      errors.push(
        "local web, API, and identity origins must use canonical 127.0.0.1 ports",
      );
    }
  }
  requireLiteral(
    errors,
    sources.webEnvironment,
    contract.webOrigin,
    "web app origin",
  );
  requireLiteral(
    errors,
    sources.apiIdentityFixture,
    contract.oauthCallback,
    "identity OAuth callback fixture",
  );
  requireLiteral(
    errors,
    sources.apiIdentityFixture,
    contract.webOrigin,
    "identity web-origin fixture",
  );
  requireLiteral(
    errors,
    sources.apiTypes,
    contract.oauthCallback,
    "generated API types",
  );
  requireLiteral(
    errors,
    sources.apiTypes,
    contract.webOrigin,
    "generated API types",
  );

  if (/\"remote\"\s*:\s*true/.test(sources.apiWrangler + sources.webWrangler)) {
    errors.push("local Worker configs must not enable a remote binding");
  }
  if (!sources.gitignore.split(/\r?\n/).includes(".wrangler/")) {
    errors.push(".wrangler/ must remain ignored for local developer state");
  }
  if (
    !contract.developerStateDirectory.startsWith(".wrangler/") ||
    contract.developerStateDirectory.includes("..")
  ) {
    errors.push(
      "developer state must be an explicit repository-local .wrangler path",
    );
  }
  if (contract.testStateLocation !== "os-temporary-directory-per-run") {
    errors.push("test state must use a fresh OS-temporary directory per run");
  }

  const rootScripts = parseScripts(sources.rootPackage, "package.json", errors);
  const apiScripts = parseScripts(
    sources.apiPackage,
    "apps/api-worker/package.json",
    errors,
  );
  const webScripts = parseScripts(
    sources.webPackage,
    "apps/web/package.json",
    errors,
  );
  if (
    rootScripts.dev !==
    "node scripts/foundation/local-development-supervisor.mjs fast"
  ) {
    errors.push("dev must use the reviewed fast-loop supervisor mode");
  }
  if (
    rootScripts["dev:init"] !==
    "pnpm --filter @vocanova/api-worker run migrate:local"
  ) {
    errors.push(
      "dev:init must delegate to the API local migration entry point",
    );
  }
  if (apiScripts["migrate:local"] !== "node scripts/local-d1-init.mjs") {
    errors.push(
      "api-worker:migrate:local must use the reviewed local D1 initializer",
    );
  }
  if (
    rootScripts["dev:workers"] !==
    "node scripts/foundation/local-development-supervisor.mjs workers"
  ) {
    errors.push("dev:workers must use the reviewed two-Worker supervisor mode");
  }
  if (webScripts.dev !== "next dev --hostname 127.0.0.1 --port 3000") {
    errors.push("web dev must reserve canonical host 127.0.0.1 and port 3000");
  }
  for (const marker of [
    'EXPECTED_WRANGLER_VERSION = "4.125.0"',
    'LOCAL_D1_BINDING = "DB"',
    '"migrations"',
    '"apply"',
    '"--local"',
    '"--config"',
    '"--persist-to"',
    'WRANGLER_SEND_METRICS: "false"',
    "delete environment[key]",
    "validateLocalD1CliArguments(process.argv.slice(2))",
  ]) {
    requireLiteral(
      errors,
      sources.apiLocalD1Init,
      marker,
      "local D1 initializer",
    );
  }
  for (const marker of [
    "READINESS_TIMEOUT_MS = 60_000",
    "SHUTDOWN_GRACE_MS = 5_000",
    "FORCE_KILL_WAIT_MS = 2_000",
    "PASSTHROUGH_ENVIRONMENT_KEYS",
    'NEXT_TELEMETRY_DISABLED: "1"',
    'WRANGLER_SEND_METRICS: "false"',
    "PNPM_CONFIG_STORE_DIR: installedModules.storeDir",
    "PNPM_CONFIG_NPMRC_AUTH_FILE: runtimePnpmAuthFile",
    'repositoryRequire.resolve("typescript/bin/tsc")',
    '"--local"',
    '"--config"',
    '"--ip"',
    '"--port"',
    '"--persist-to"',
    '"--show-interactive-dev-session=false"',
    "runLocalD1Migrations",
    "assertPortsAvailable",
    "waitForReadiness",
    'process.once("SIGINT"',
    'process.once("SIGTERM"',
    'record.child.kill("SIGKILL")',
    "shell: false",
  ]) {
    requireLiteral(
      errors,
      sources.localSupervisor,
      marker,
      "local development supervisor",
    );
  }
  errors.push(
    ...validateBoundedLifecycleSource(
      "local development supervisor",
      sources.localSupervisor,
    ),
  );
  for (const [name, command] of Object.entries({
    dev: rootScripts.dev,
    "dev:init": rootScripts["dev:init"],
    "dev:workers": rootScripts["dev:workers"],
    "test:local-stack": rootScripts["test:local-stack"],
    "api-worker:dev": apiScripts.dev,
    "api-worker:migrate:local": apiScripts["migrate:local"],
  })) {
    if (command !== undefined) {
      errors.push(...validateLocalDevelopmentCommand(name, command));
    }
  }
  errors.push(
    ...validateLocalListenerCommand("api-worker:dev", apiScripts.dev, "api"),
  );
  errors.push(
    ...validateLocalListenerCommand("web:dev", webScripts.dev, "web"),
  );

  return errors;
}

export function validateLocalDevelopmentRepository(repositoryRoot) {
  return validateLocalDevelopmentSources(readSources(repositoryRoot));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repositoryRoot = resolve(import.meta.dirname, "../..");
  const errors = validateLocalDevelopmentRepository(repositoryRoot);
  if (errors.length) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write("Local development contract validation passed.\n");
  }
}
