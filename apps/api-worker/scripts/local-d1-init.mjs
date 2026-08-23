import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import process from "node:process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

export const EXPECTED_WRANGLER_VERSION = "4.125.0";
export const LOCAL_D1_BINDING = "DB";

const apiRoot = resolve(import.meta.dirname, "..");
const repositoryRoot = resolve(apiRoot, "../..");
const canonicalConfigPath = resolve(apiRoot, "wrangler.jsonc");
const canonicalStateDirectory = resolve(
  repositoryRoot,
  ".wrangler/state/vocanova-local",
);
const require = createRequire(import.meta.url);
const wranglerPackagePath = require.resolve("wrangler/package.json");
const wranglerPackage = JSON.parse(readFileSync(wranglerPackagePath, "utf8"));
const wranglerBin = resolve(dirname(wranglerPackagePath), "bin/wrangler.js");

const CLOUDFLARE_CREDENTIAL_KEYS = Object.freeze([
  "CLOUDFLARE_API_KEY",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_EMAIL",
  "CF_API_TOKEN",
  "CF_ACCOUNT_ID",
  "WRANGLER_PROFILE",
]);

export const LOCAL_D1_PATHS = Object.freeze({
  apiRoot,
  canonicalConfigPath,
  canonicalStateDirectory,
  wranglerBin,
});

function isStrictDescendant(parent, candidate) {
  const child = relative(parent, candidate);
  return child !== "" && !child.startsWith("..") && !isAbsolute(child);
}

function validateOptions({
  purpose,
  environment,
  remote,
  binding,
  stateDirectory,
  configPath,
}) {
  if (wranglerPackage.version !== EXPECTED_WRANGLER_VERSION) {
    throw new Error(
      `Local D1 initialization requires Wrangler ${EXPECTED_WRANGLER_VERSION}; found ${String(wranglerPackage.version)}`,
    );
  }
  if (environment !== "local") {
    throw new Error("Local D1 initialization rejects non-local environments");
  }
  if (remote !== false) {
    throw new Error(
      "Local D1 initialization rejects remote or preview databases",
    );
  }
  if (binding !== LOCAL_D1_BINDING) {
    throw new Error(
      `Local D1 initialization requires the ${LOCAL_D1_BINDING} binding`,
    );
  }
  if (!isAbsolute(stateDirectory) || !isAbsolute(configPath)) {
    throw new Error("Local D1 config and persistence paths must be absolute");
  }

  if (purpose === "developer") {
    if (stateDirectory !== canonicalStateDirectory) {
      throw new Error(
        "Developer initialization must use .wrangler/state/vocanova-local",
      );
    }
    if (configPath !== canonicalConfigPath) {
      throw new Error(
        "Developer initialization must use the API Wrangler config",
      );
    }
    return;
  }

  if (purpose !== "test") {
    throw new Error(
      "Local D1 initialization purpose must be developer or test",
    );
  }
  if (stateDirectory === canonicalStateDirectory) {
    throw new Error(
      "Test D1 persistence must use a fresh OS-temporary directory",
    );
  }
  if (!isStrictDescendant(resolve(tmpdir()), stateDirectory)) {
    throw new Error(
      "Test D1 persistence must use a fresh OS-temporary directory",
    );
  }
  if (
    configPath !== canonicalConfigPath &&
    !isStrictDescendant(resolve(tmpdir()), configPath)
  ) {
    throw new Error("Test D1 config must be canonical or OS-temporary");
  }
}

export function localOnlyEnvironment(source = process.env) {
  const environment = {
    ...source,
    CI: "true",
    WRANGLER_SEND_METRICS: "false",
  };
  for (const key of CLOUDFLARE_CREDENTIAL_KEYS) delete environment[key];
  return environment;
}

export function buildLocalD1MigrationInvocation({
  purpose = "developer",
  environment = "local",
  remote = false,
  binding = LOCAL_D1_BINDING,
  stateDirectory = canonicalStateDirectory,
  configPath = canonicalConfigPath,
} = {}) {
  const normalizedStateDirectory = resolve(stateDirectory);
  const normalizedConfigPath = resolve(configPath);
  validateOptions({
    purpose,
    environment,
    remote,
    binding,
    stateDirectory: normalizedStateDirectory,
    configPath: normalizedConfigPath,
  });

  return Object.freeze({
    command: process.execPath,
    args: Object.freeze([
      wranglerBin,
      "d1",
      "migrations",
      "apply",
      binding,
      "--local",
      "--config",
      normalizedConfigPath,
      "--persist-to",
      normalizedStateDirectory,
    ]),
    cwd: dirname(normalizedConfigPath),
  });
}

export function runLocalD1Migrations({ stdio = "inherit", ...options } = {}) {
  const invocation = buildLocalD1MigrationInvocation(options);
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: invocation.cwd,
    env: localOnlyEnvironment(),
    encoding: stdio === "pipe" ? "utf8" : undefined,
    stdio,
  });
  if (result.error) throw result.error;
  return result;
}

export function validateLocalD1CliArguments(args) {
  return args.length === 0
    ? []
    : [
        "dev:init accepts no arguments; its local DB, config, migrations, and state are fixed",
      ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argumentErrors = validateLocalD1CliArguments(process.argv.slice(2));
  if (argumentErrors.length > 0) {
    process.stderr.write(`${argumentErrors.join("\n")}\n`);
    process.exitCode = 2;
  } else {
    const result = runLocalD1Migrations();
    if (result.signal) {
      process.stderr.write(
        `Local D1 initialization ended by ${result.signal}\n`,
      );
      process.exitCode = 1;
    } else {
      process.exitCode = result.status ?? 1;
    }
  }
}
