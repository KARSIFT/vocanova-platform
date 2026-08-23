/* global AbortSignal, URL, fetch, setTimeout */

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

import {
  EXPECTED_WRANGLER_VERSION,
  LOCAL_D1_PATHS,
  runLocalD1Migrations,
} from "../../apps/api-worker/scripts/local-d1-init.mjs";
import { classifyWorkerdOutput } from "../../apps/web/scripts/test-workerd.mjs";
import { LOCAL_DEVELOPMENT_CONTRACT } from "./local-development-policy.mjs";

export const READINESS_TIMEOUT_MS = 60_000;
export const SHUTDOWN_GRACE_MS = 5_000;
export const FORCE_KILL_WAIT_MS = 2_000;
export const READINESS_POLL_MS = 250;
export const PROBE_TIMEOUT_MS = 2_000;

const EXPECTED_NEXT_VERSION = "16.3.0";
const EXPECTED_OPENNEXT_VERSION = "1.20.2";
const EXPECTED_TYPESCRIPT_VERSION = "6.0.3";
const repositoryRoot = resolve(import.meta.dirname, "../..");
const apiRoot = resolve(repositoryRoot, "apps/api-worker");
const webRoot = resolve(repositoryRoot, "apps/web");
const apiConfigPath = resolve(apiRoot, "wrangler.jsonc");
const webConfigPath = resolve(webRoot, "wrangler.jsonc");
const runtimeIdentity = createHash("sha256")
  .update(repositoryRoot)
  .digest("hex")
  .slice(0, 12);
const runtimeRoot = resolve(
  tmpdir(),
  "vocanova-platform-local",
  runtimeIdentity,
);
const runtimeConfig = resolve(runtimeRoot, "config");
const runtimeCache = resolve(runtimeRoot, "cache");
const runtimePnpmAuthFile = resolve(runtimeConfig, "pnpm-auth.ini");

const repositoryRequire = createRequire(
  resolve(repositoryRoot, "package.json"),
);
const typescriptPackage = JSON.parse(
  readFileSync(repositoryRequire.resolve("typescript/package.json"), "utf8"),
);
const typescriptBin = repositoryRequire.resolve("typescript/bin/tsc");
const webRequire = createRequire(resolve(webRoot, "package.json"));
const nextPackagePath = webRequire.resolve("next/package.json");
const nextPackage = JSON.parse(readFileSync(nextPackagePath, "utf8"));
const nextBin = webRequire.resolve("next/dist/bin/next");
const openNextEntry = webRequire.resolve("@opennextjs/cloudflare");
const openNextRoot = resolve(dirname(openNextEntry), "../..");
const openNextPackage = JSON.parse(
  readFileSync(resolve(openNextRoot, "package.json"), "utf8"),
);
const openNextBin = resolve(openNextRoot, "dist/cli/index.js");
const workerCompatibilityScript = resolve(
  webRoot,
  "scripts/check-worker-compatibility.mjs",
);
const wranglerPackage = JSON.parse(
  readFileSync(
    resolve(dirname(LOCAL_D1_PATHS.wranglerBin), "../package.json"),
    "utf8",
  ),
);
const installedModules = JSON.parse(
  readFileSync(resolve(repositoryRoot, "node_modules/.modules.yaml"), "utf8"),
);
if (typeof installedModules.storeDir !== "string") {
  throw new Error("The frozen pnpm install does not declare its package store");
}

const PASSTHROUGH_ENVIRONMENT_KEYS = Object.freeze([
  "COLORTERM",
  "COMSPEC",
  "FORCE_COLOR",
  "LANG",
  "LC_ALL",
  "NO_COLOR",
  "PATH",
  "PATHEXT",
  "SYSTEMROOT",
  "TEMP",
  "TERM",
  "TMP",
  "TMPDIR",
  "TZ",
  "WINDIR",
]);

const SIGNAL_EXIT_CODES = Object.freeze({ SIGINT: 130, SIGTERM: 143 });

export const LOCAL_DEVELOPMENT_PATHS = Object.freeze({
  apiConfigPath,
  apiRoot,
  nextBin,
  openNextBin,
  workerCompatibilityScript,
  repositoryRoot,
  runtimeCache,
  runtimeConfig,
  runtimePnpmAuthFile,
  runtimeRoot,
  stateDirectory: LOCAL_D1_PATHS.canonicalStateDirectory,
  typescriptBin,
  webConfigPath,
  webRoot,
  wranglerBin: LOCAL_D1_PATHS.wranglerBin,
});

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

function assertLockedToolchain() {
  const versions = [
    ["Wrangler", wranglerPackage.version, EXPECTED_WRANGLER_VERSION],
    ["Next", nextPackage.version, EXPECTED_NEXT_VERSION],
    ["OpenNext", openNextPackage.version, EXPECTED_OPENNEXT_VERSION],
    ["TypeScript", typescriptPackage.version, EXPECTED_TYPESCRIPT_VERSION],
  ];
  for (const [name, actual, expected] of versions) {
    if (actual !== expected) {
      throw new Error(
        `${name} ${expected} is required; found ${String(actual)}`,
      );
    }
  }
}

export function buildLocalProcessEnvironment(source = process.env) {
  const environment = {};
  for (const key of PASSTHROUGH_ENVIRONMENT_KEYS) {
    if (typeof source[key] === "string" && source[key] !== "") {
      environment[key] = source[key];
    }
  }
  const sourceHome =
    typeof source.HOME === "string" && source.HOME !== ""
      ? source.HOME
      : runtimeRoot;
  const sourceCache =
    typeof source.XDG_CACHE_HOME === "string" && source.XDG_CACHE_HOME !== ""
      ? source.XDG_CACHE_HOME
      : resolve(sourceHome, ".cache");
  return {
    ...environment,
    API_BASE_URL: LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    CI: "true",
    COREPACK_HOME:
      typeof source.COREPACK_HOME === "string" && source.COREPACK_HOME !== ""
        ? source.COREPACK_HOME
        : resolve(sourceCache, "node/corepack"),
    ENVIRONMENT: "local",
    NEXT_PUBLIC_API_BASE_URL: LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    NEXT_PUBLIC_APP_ORIGIN: LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    NEXT_PUBLIC_SENTRY_DSN: "",
    NEXT_TELEMETRY_DISABLED: "1",
    PNPM_CONFIG_STORE_DIR: installedModules.storeDir,
    PNPM_CONFIG_NPMRC_AUTH_FILE: runtimePnpmAuthFile,
    SENTRY_DSN: "",
    WRANGLER_SEND_METRICS: "false",
    XDG_CACHE_HOME: runtimeCache,
    XDG_CONFIG_HOME: runtimeConfig,
  };
}

function wranglerDevArgs(configPath, port) {
  return [
    LOCAL_D1_PATHS.wranglerBin,
    "dev",
    "--local",
    "--config",
    configPath,
    "--ip",
    LOCAL_DEVELOPMENT_CONTRACT.host,
    "--port",
    String(port),
    "--persist-to",
    LOCAL_D1_PATHS.canonicalStateDirectory,
    "--local-protocol",
    "http",
    "--latest=false",
    "--inspector-port",
    "0",
    "--show-interactive-dev-session=false",
  ];
}

export function buildLocalDevelopmentPlan(
  mode,
  sourceEnvironment = process.env,
) {
  assertLockedToolchain();
  if (!["fast", "workers"].includes(mode)) {
    throw new Error("Local development mode must be fast or workers");
  }
  const environment = buildLocalProcessEnvironment(sourceEnvironment);
  const api = Object.freeze({
    label: "api",
    command: process.execPath,
    args: Object.freeze(
      wranglerDevArgs(apiConfigPath, LOCAL_DEVELOPMENT_CONTRACT.apiPort),
    ),
    cwd: apiRoot,
    env: environment,
  });
  const web =
    mode === "fast"
      ? Object.freeze({
          label: "web",
          command: process.execPath,
          args: Object.freeze([
            nextBin,
            "dev",
            "--hostname",
            LOCAL_DEVELOPMENT_CONTRACT.host,
            "--port",
            String(LOCAL_DEVELOPMENT_CONTRACT.webPort),
          ]),
          cwd: webRoot,
          env: environment,
        })
      : Object.freeze({
          label: "web-worker",
          command: process.execPath,
          args: Object.freeze(
            wranglerDevArgs(webConfigPath, LOCAL_DEVELOPMENT_CONTRACT.webPort),
          ),
          cwd: webRoot,
          env: environment,
        });

  return Object.freeze({
    mode,
    preparation: Object.freeze([
      Object.freeze({
        label: "workspace package build",
        command: process.execPath,
        args: Object.freeze([
          typescriptBin,
          "-b",
          resolve(repositoryRoot, "packages/api-client"),
          resolve(repositoryRoot, "packages/design-tokens"),
          "--pretty",
          "false",
        ]),
        cwd: repositoryRoot,
        env: environment,
      }),
      ...(mode === "workers"
        ? [
            Object.freeze({
              label: "OpenNext local build",
              command: process.execPath,
              args: Object.freeze([openNextBin, "build"]),
              cwd: webRoot,
              env: environment,
            }),
            Object.freeze({
              label: "fresh Worker artifact compatibility scan",
              command: process.execPath,
              args: Object.freeze([workerCompatibilityScript]),
              cwd: webRoot,
              env: environment,
            }),
          ]
        : []),
    ]),
    ports: Object.freeze([
      Object.freeze({ label: "web", port: LOCAL_DEVELOPMENT_CONTRACT.webPort }),
      Object.freeze({ label: "api", port: LOCAL_DEVELOPMENT_CONTRACT.apiPort }),
    ]),
    api,
    web,
    apiReadiness: Object.freeze([
      Object.freeze({
        label: "API health",
        url: `${LOCAL_DEVELOPMENT_CONTRACT.apiOrigin}/healthz`,
        verify: verifyApiHealth,
      }),
      Object.freeze({
        label: "API config",
        url: `${LOCAL_DEVELOPMENT_CONTRACT.apiOrigin}/configz`,
        verify: verifyApiConfig,
      }),
    ]),
    webReadiness: Object.freeze([
      Object.freeze({
        label: mode === "fast" ? "Next web" : "web Worker",
        url: LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
        verify: verifyWebReadiness,
      }),
    ]),
  });
}

export function validateSupervisorCliArguments(args) {
  return args.length === 1 && ["fast", "workers"].includes(args[0])
    ? []
    : ["local supervisor requires exactly one mode: fast or workers"];
}

export async function verifyApiHealth(response) {
  if (response.status !== 200) return false;
  const body = await response.json();
  return body.status === "ok" && body.database === "ok";
}

export async function verifyApiConfig(response) {
  if (response.status !== 200) return false;
  const body = await response.json();
  return (
    body.environment === "local" &&
    body.release === "local" &&
    body.runtime === "cloudflare-workers" &&
    body.data === "d1" &&
    body.migrationStatus === "full-api-parity"
  );
}

export async function verifyWebReadiness(response) {
  return response.status === 200;
}

function validateReadinessUrl(value, ports) {
  const url = new URL(value);
  const port = Number(url.port);
  if (
    url.protocol !== "http:" ||
    url.hostname !== LOCAL_DEVELOPMENT_CONTRACT.host ||
    !ports.includes(port)
  ) {
    throw new Error(`Readiness URL must be canonical loopback HTTP: ${value}`);
  }
}

export async function waitForReadiness(
  checks,
  {
    childRecord,
    fetchImpl = fetch,
    readinessTimeoutMs = READINESS_TIMEOUT_MS,
    pollMs = READINESS_POLL_MS,
    probeTimeoutMs = PROBE_TIMEOUT_MS,
    ports = [
      LOCAL_DEVELOPMENT_CONTRACT.webPort,
      LOCAL_DEVELOPMENT_CONTRACT.apiPort,
    ],
  } = {},
) {
  for (const check of checks) validateReadinessUrl(check.url, ports);
  const deadline = Date.now() + readinessTimeoutMs;
  let lastFailure = "not ready";
  while (Date.now() < deadline) {
    if (childRecord?.settled) {
      throw new Error(
        `${childRecord.label} exited before readiness: ${formatOutcome(childRecord.outcome)}`,
      );
    }
    try {
      let ready = true;
      for (const check of checks) {
        const response = await fetchImpl(check.url, {
          redirect: "manual",
          signal: AbortSignal.timeout(probeTimeoutMs),
        });
        if (!(await check.verify(response))) {
          ready = false;
          lastFailure = `${check.label} returned ${response.status}`;
          break;
        }
      }
      if (ready) return;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
    await delay(Math.min(pollMs, Math.max(0, deadline - Date.now())));
  }
  throw new Error(
    `Timed out after ${readinessTimeoutMs}ms waiting for ${checks.map((check) => check.label).join(" and ")}: ${lastFailure}`,
  );
}

export async function assertPortsAvailable(
  ports,
  { createServerImpl = createServer } = {},
) {
  for (const { label, port } of ports) {
    const server = createServerImpl();
    try {
      await new Promise((resolveListen, rejectListen) => {
        server.once("error", rejectListen);
        server.listen(
          { host: LOCAL_DEVELOPMENT_CONTRACT.host, port, exclusive: true },
          resolveListen,
        );
      });
    } catch (error) {
      const detail =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : String(error);
      throw new Error(
        `Required ${label} port ${port} on ${LOCAL_DEVELOPMENT_CONTRACT.host} is unavailable (${detail}); stop the occupying process and retry`,
        { cause: error },
      );
    } finally {
      if (server.listening) {
        await new Promise((resolveClose, rejectClose) =>
          server.close((error) =>
            error ? rejectClose(error) : resolveClose(),
          ),
        );
      }
    }
  }
}

function boundedOutput(record, chunk) {
  record.output = `${record.output}${String(chunk)}`.slice(-65_536);
}

function formatOutcome(outcome) {
  if (!outcome) return "unknown outcome";
  if (outcome.error) return outcome.error.message;
  if (outcome.signal) return `signal ${outcome.signal}`;
  return `exit code ${String(outcome.code)}`;
}

export class SupervisedChildren {
  constructor({
    spawnImpl = spawn,
    stdout = process.stdout,
    stderr = process.stderr,
    shutdownGraceMs = SHUTDOWN_GRACE_MS,
    forceKillWaitMs = FORCE_KILL_WAIT_MS,
  } = {}) {
    this.spawnImpl = spawnImpl;
    this.stdout = stdout;
    this.stderr = stderr;
    this.shutdownGraceMs = shutdownGraceMs;
    this.forceKillWaitMs = forceKillWaitMs;
    this.records = [];
    this.shutdownPromise = null;
  }

  start(specification) {
    const child = this.spawnImpl(
      specification.command,
      [...specification.args],
      {
        cwd: specification.cwd,
        env: specification.env,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const record = {
      child,
      label: specification.label,
      output: "",
      diagnostics: [],
      outcome: null,
      settled: false,
      exit: null,
    };
    record.exit = new Promise((resolveExit) => {
      let resolved = false;
      const finish = (outcome) => {
        if (resolved) return;
        resolved = true;
        record.outcome = outcome;
        record.settled = true;
        resolveExit(record);
      };
      child.once("error", (error) =>
        finish({ code: null, error, signal: null }),
      );
      child.once("exit", (code, signal) =>
        finish({ code, error: null, signal }),
      );
    });
    child.stdout?.on("data", (chunk) => {
      boundedOutput(record, chunk);
      record.diagnostics.push(
        ...classifyWorkerdOutput(String(chunk)).diagnostics,
      );
      this.stdout.write(`[${record.label}] ${String(chunk)}`);
    });
    child.stderr?.on("data", (chunk) => {
      boundedOutput(record, chunk);
      record.diagnostics.push(
        ...classifyWorkerdOutput(String(chunk)).diagnostics,
      );
      this.stderr.write(`[${record.label}] ${String(chunk)}`);
    });
    this.records.push(record);
    return record;
  }

  waitForFirstExit() {
    if (this.records.length === 0) {
      throw new Error("Cannot wait for child exit before starting a child");
    }
    return Promise.race(this.records.map((record) => record.exit));
  }

  stopAll(signal = "SIGTERM") {
    if (!this.shutdownPromise) this.shutdownPromise = this.#stopAll(signal);
    return this.shutdownPromise;
  }

  async #stopAll(signal) {
    const active = this.records.filter((record) => !record.settled);
    for (const record of active) record.child.kill(signal);
    if (await this.#waitFor(active, this.shutdownGraceMs)) return false;

    for (const record of active) {
      if (!record.settled) record.child.kill("SIGKILL");
    }
    if (!(await this.#waitFor(active, this.forceKillWaitMs))) {
      throw new Error(
        `Children failed to exit after SIGKILL: ${active
          .filter((record) => !record.settled)
          .map((record) => record.label)
          .join(", ")}`,
      );
    }
    return true;
  }

  async #waitFor(records, timeoutMs) {
    if (records.every((record) => record.settled)) return true;
    return Promise.race([
      Promise.all(records.map((record) => record.exit)).then(() => true),
      delay(timeoutMs).then(() => false),
    ]);
  }
}

function prepareRuntimeDirectories() {
  for (const path of [runtimeRoot, runtimeConfig, runtimeCache]) {
    mkdirSync(path, { recursive: true });
  }
}

function runSynchronousStep(step, spawnSyncImpl = spawnSync) {
  const result = spawnSyncImpl(step.command, [...step.args], {
    cwd: step.cwd,
    env: step.env,
    shell: false,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${step.label} failed with exit code ${String(result.status)}`,
    );
  }
}

export async function runLocalDevelopment(
  mode,
  {
    plan = buildLocalDevelopmentPlan(mode),
    children = new SupervisedChildren(),
    fetchImpl = fetch,
    portCheck = assertPortsAvailable,
    runMigration = runLocalD1Migrations,
    spawnSyncImpl = spawnSync,
    stdout = process.stdout,
    stderr = process.stderr,
    readinessTimeoutMs = READINESS_TIMEOUT_MS,
    registerSignals = true,
  } = {},
) {
  let requestedSignal = null;
  let resolveSignal;
  const signalRequest = new Promise((resolveRequest) => {
    resolveSignal = resolveRequest;
  });
  const onSignal = (signal) => {
    if (requestedSignal) return;
    requestedSignal = signal;
    resolveSignal({ kind: "signal", signal });
  };
  const onSigint = () => onSignal("SIGINT");
  const onSigterm = () => onSignal("SIGTERM");
  if (registerSignals) {
    process.once("SIGINT", onSigint);
    process.once("SIGTERM", onSigterm);
  }

  let exitCode;
  try {
    await portCheck(plan.ports);
    prepareRuntimeDirectories();
    for (const step of plan.preparation) {
      runSynchronousStep(step, spawnSyncImpl);
    }
    const migration = runMigration();
    if (migration.status !== 0) {
      throw new Error(
        `Local D1 initialization failed with exit code ${String(migration.status)}`,
      );
    }
    await portCheck(plan.ports);

    const api = children.start(plan.api);
    await Promise.race([
      waitForReadiness(plan.apiReadiness, {
        childRecord: api,
        fetchImpl,
        readinessTimeoutMs,
        ports: plan.ports.map(({ port }) => port),
      }),
      signalRequest,
    ]);
    if (requestedSignal) {
      exitCode = SIGNAL_EXIT_CODES[requestedSignal];
    } else {
      const web = children.start(plan.web);
      await Promise.race([
        waitForReadiness(plan.webReadiness, {
          childRecord: web,
          fetchImpl,
          readinessTimeoutMs,
          ports: plan.ports.map(({ port }) => port),
        }),
        signalRequest,
      ]);
      if (requestedSignal) {
        exitCode = SIGNAL_EXIT_CODES[requestedSignal];
      } else {
        stdout.write(
          `Local ${mode} loop ready: web ${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}; API ${LOCAL_DEVELOPMENT_CONTRACT.apiOrigin}\n`,
        );
        const outcome = await Promise.race([
          children
            .waitForFirstExit()
            .then((record) => ({ kind: "exit", record })),
          signalRequest,
        ]);
        if (outcome.kind === "signal") {
          exitCode = SIGNAL_EXIT_CODES[outcome.signal];
        } else {
          const { record } = outcome;
          stderr.write(
            `${record.label} exited; stopping sibling processes (${formatOutcome(record.outcome)})\n`,
          );
          exitCode = record.outcome?.code ?? 1;
          if (exitCode === 0) exitCode = 1;
        }
      }
    }
  } catch (error) {
    stderr.write(
      `Local ${mode} loop failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    exitCode = requestedSignal ? SIGNAL_EXIT_CODES[requestedSignal] : 1;
  } finally {
    if (registerSignals) {
      process.removeListener("SIGINT", onSigint);
      process.removeListener("SIGTERM", onSigterm);
    }
    try {
      await children.stopAll(requestedSignal ?? "SIGTERM");
    } catch (error) {
      stderr.write(
        `Local child cleanup failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      exitCode = 1;
    }
  }
  return exitCode;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const errors = validateSupervisorCliArguments(args);
  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 2;
  } else {
    process.exitCode = await runLocalDevelopment(args[0]);
  }
}
