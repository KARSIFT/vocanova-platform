/* global AbortSignal, clearTimeout, fetch, setTimeout, TextDecoder, URL */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import {
  LOCAL_D1_PATHS,
  runLocalD1Migrations,
} from "../../apps/api-worker/scripts/local-d1-init.mjs";
import { assertCleanWorkerdOutput } from "../../apps/web/scripts/test-workerd.mjs";
import { LOCAL_DEVELOPMENT_CONTRACT } from "./local-development-policy.mjs";
import {
  READINESS_TIMEOUT_MS,
  SHUTDOWN_GRACE_MS,
  SupervisedChildren,
  assertPortsAvailable,
  buildLocalDevelopmentPlan,
  waitForReadiness,
} from "./local-development-supervisor.mjs";

export const LOCAL_STACK_TIMEOUT_MS = 12 * 60_000;
export const LOCAL_STACK_PROBE_TIMEOUT_MS = 5_000;
export const LOCAL_STACK_PREPARATION_TIMEOUT_MS = 6 * 60_000;
export const LOCAL_STACK_MIGRATION_TIMEOUT_MS = 2 * 60_000;
export const LOCAL_STACK_MARKER = "vocanova-local-stack-v1";
export const LOCAL_STACK_SHUTDOWN_GRACE_MS = SHUTDOWN_GRACE_MS;

const repositoryRoot = resolve(import.meta.dirname, "../..");
const excludedInstructionDirectories = new Set([
  ".git",
  ".next",
  ".open-next",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
]);

function isStrictDescendant(parent, candidate) {
  const child = relative(parent, candidate);
  return child !== "" && !child.startsWith("..") && !isAbsolute(child);
}

function requireDisposableRoot(path) {
  const normalized = resolve(path);
  if (
    !isStrictDescendant(resolve(tmpdir()), normalized) ||
    !normalized.includes("vocanova-local-stack-")
  ) {
    throw new Error(`Refusing non-disposable local-stack root: ${normalized}`);
  }
  return normalized;
}

function replacePersistence(specification, stateDirectory) {
  const args = [...specification.args];
  const index = args.indexOf("--persist-to");
  if (
    index === -1 ||
    args[index + 1] !== LOCAL_D1_PATHS.canonicalStateDirectory
  ) {
    throw new Error(
      `${specification.label} must declare the reviewed canonical persistence argument`,
    );
  }
  args[index + 1] = stateDirectory;
  return Object.freeze({
    ...specification,
    args: Object.freeze(args),
  });
}

export function buildDisposableLocalStackPlan(
  stateDirectory,
  sourceEnvironment = process.env,
) {
  const normalizedState = requireDisposableRoot(stateDirectory);
  const base = buildLocalDevelopmentPlan("workers", sourceEnvironment);
  return Object.freeze({
    ...base,
    api: replacePersistence(base.api, normalizedState),
    stateDirectory: normalizedState,
    web: replacePersistence(base.web, normalizedState),
  });
}

function boundedOutput(value) {
  return String(value ?? "").slice(-16_384);
}

function runPreparation(plan, spawnSyncImpl = spawnSync) {
  for (const step of plan.preparation) {
    const result = spawnSyncImpl(step.command, [...step.args], {
      cwd: step.cwd,
      env: step.env,
      encoding: "utf8",
      maxBuffer: 16 * 1_048_576,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: LOCAL_STACK_PREPARATION_TIMEOUT_MS,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `${step.label} failed with exit code ${String(result.status)}\n${boundedOutput(result.stdout)}\n${boundedOutput(result.stderr)}`,
      );
    }
    process.stdout.write(`${step.label} passed.\n`);
  }
}

function runMigrations(stateDirectory, runMigration = runLocalD1Migrations) {
  const result = runMigration({
    purpose: "test",
    stateDirectory,
    stdio: "pipe",
    timeoutMs: LOCAL_STACK_MIGRATION_TIMEOUT_MS,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `Disposable D1 migration failed with exit code ${String(result.status)}\n${boundedOutput(result.stdout)}\n${boundedOutput(result.stderr)}`,
    );
  }
}

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

export function readDisposableD1Evidence(stateDirectory) {
  const databases = filesUnder(stateDirectory).filter(
    (path) =>
      path.endsWith(".sqlite") &&
      path.includes("/v3/d1/") &&
      !path.endsWith("/metadata.sqlite"),
  );
  if (databases.length !== 1) {
    throw new Error(
      `Expected one disposable D1 database; found ${String(databases.length)}`,
    );
  }
  const database = new DatabaseSync(databases[0], { readOnly: true });
  try {
    return Object.freeze({
      health: database.prepare("PRAGMA quick_check").get().quick_check,
      migrationCount: database
        .prepare("SELECT COUNT(*) AS count FROM d1_migrations")
        .get().count,
    });
  } finally {
    database.close();
  }
}

function instructionFilesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return excludedInstructionDirectories.has(entry.name)
        ? []
        : instructionFilesBelow(path);
    }
    return /^(?:AGENTS|CLAUDE)\.md$/.test(entry.name) ? [path] : [];
  });
}

export function captureRepositoryTree(
  root = repositoryRoot,
  spawnSyncImpl = spawnSync,
) {
  const status = spawnSyncImpl(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
      shell: false,
      timeout: 10_000,
    },
  );
  if (status.error) throw status.error;
  if (status.status !== 0) {
    throw new Error(`Unable to inspect repository tree: ${status.stderr}`);
  }
  return Object.freeze({
    instructions: Object.freeze(
      instructionFilesBelow(root)
        .map((path) => relative(root, path).replaceAll("\\", "/"))
        .sort(),
    ),
    status: status.stdout,
  });
}

export function assertRepositoryTreeUnchanged(before, after) {
  if (before.status !== after.status) {
    throw new Error(
      `Local stack changed the visible repository tree\nbefore:\n${before.status}\nafter:\n${after.status}`,
    );
  }
  if (
    JSON.stringify(before.instructions) !== JSON.stringify(after.instructions)
  ) {
    throw new Error(
      `Local stack changed repository instruction files: ${after.instructions.join(", ")}`,
    );
  }
}

function assertLoopbackUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    url.hostname !== LOCAL_DEVELOPMENT_CONTRACT.host ||
    ![
      LOCAL_DEVELOPMENT_CONTRACT.webPort,
      LOCAL_DEVELOPMENT_CONTRACT.apiPort,
    ].includes(Number(url.port))
  ) {
    throw new Error(
      `Local-stack probe must use canonical loopback HTTP: ${value}`,
    );
  }
}

async function readBoundedText(response, maximumBytes = 1_048_576) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  const deadline = Date.now() + LOCAL_STACK_PROBE_TIMEOUT_MS;
  for (let done = false; !done;) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error("Timed out reading local-stack response");
    const result = await readStreamChunk(reader, remaining);
    done = result.done;
    if (done) return `${text}${decoder.decode()}`;
    const { value } = result;
    received += value.byteLength;
    if (received > maximumBytes) {
      await reader.cancel();
      throw new Error(
        `Local-stack response exceeded ${String(maximumBytes)} bytes`,
      );
    }
    text += decoder.decode(value, { stream: true });
  }
  return text;
}

async function readStreamChunk(reader, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      reader.read(),
      new Promise((_resolveRead, rejectRead) => {
        timer = setTimeout(
          () => rejectRead(new Error("Timed out reading local-stack response")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function localFetch(path, origin, fetchImpl = fetch, headers = {}) {
  const url = new URL(path, origin).toString();
  assertLoopbackUrl(url);
  return fetchImpl(url, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(LOCAL_STACK_PROBE_TIMEOUT_MS),
  });
}

function parseJson(label, text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${label} did not return JSON`);
  }
}

function requireStatus(label, response, expected) {
  if (response.status !== expected) {
    throw new Error(
      `${label} returned ${String(response.status)}; expected ${String(expected)}`,
    );
  }
}

export async function probeLocalStack(fetchImpl = fetch) {
  const healthResponse = await localFetch(
    "/healthz",
    LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    fetchImpl,
  );
  requireStatus("API health", healthResponse, 200);
  const health = parseJson("API health", await readBoundedText(healthResponse));
  if (health.status !== "ok" || health.database !== "ok") {
    throw new Error("API health did not prove local D1 reachability");
  }

  const configResponse = await localFetch(
    "/configz",
    LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    fetchImpl,
  );
  requireStatus("API config", configResponse, 200);
  const config = parseJson("API config", await readBoundedText(configResponse));
  const expectedConfig = {
    data: "d1",
    environment: "local",
    migrationStatus: "full-api-parity",
    release: "local",
    runtime: "cloudflare-workers",
  };
  for (const [key, value] of Object.entries(expectedConfig)) {
    if (config[key] !== value) throw new Error(`API config drifted at ${key}`);
  }

  const contractResponse = await localFetch(
    "/openapi.json",
    LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    fetchImpl,
  );
  requireStatus("API contract", contractResponse, 200);
  const contract = parseJson(
    "API contract",
    await readBoundedText(contractResponse),
  );
  if (contract.openapi !== "3.1.0" || !contract.paths?.["/healthz"]) {
    throw new Error("Direct API contract evidence is incomplete");
  }

  const currentUser = await localFetch(
    "/api/v1/me",
    LOCAL_DEVELOPMENT_CONTRACT.apiOrigin,
    fetchImpl,
  );
  requireStatus("Direct unauthenticated API", currentUser, 401);
  await readBoundedText(currentUser);

  const staticResponse = await localFetch(
    "/",
    LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    fetchImpl,
  );
  requireStatus("Web static route", staticResponse, 200);
  if (
    !(await readBoundedText(staticResponse)).includes("Vocanova web foundation")
  ) {
    throw new Error("Web static route returned unexpected content");
  }

  const ssrResponse = await localFetch(
    "/signin?returnTo=%2Fhome",
    LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    fetchImpl,
  );
  requireStatus("Web SSR route", ssrResponse, 200);
  if (!(await readBoundedText(ssrResponse)).includes("Sign in to Vocanova")) {
    throw new Error("Web SSR route returned unexpected content");
  }

  const middlewareResponse = await localFetch(
    "/discover",
    LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    fetchImpl,
  );
  requireStatus("Web middleware route", middlewareResponse, 307);
  const location = middlewareResponse.headers.get("location") ?? "";
  if (!location.includes("/signin?returnTo=%2Fdiscover")) {
    throw new Error(`Web middleware redirect drifted: ${location}`);
  }
  await readBoundedText(middlewareResponse);

  const unmarkedBindingResponse = await localFetch(
    "/api/local-stack",
    LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    fetchImpl,
  );
  requireStatus(
    "Unmarked local service-binding route",
    unmarkedBindingResponse,
    404,
  );
  await readBoundedText(unmarkedBindingResponse);

  const bindingResponse = await localFetch(
    "/api/local-stack",
    LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
    fetchImpl,
    { "x-vocanova-local-stack": LOCAL_STACK_MARKER },
  );
  requireStatus("Web service-binding marker", bindingResponse, 200);
  const binding = parseJson(
    "Web service-binding marker",
    await readBoundedText(bindingResponse),
  );
  if (
    bindingResponse.headers.get("x-vocanova-local-stack-marker") !==
      LOCAL_STACK_MARKER ||
    bindingResponse.headers.get("x-vocanova-local-stack-transport") !==
      "service-binding"
  ) {
    throw new Error("Web response did not carry the service-binding marker");
  }
  for (const [key, value] of Object.entries(expectedConfig)) {
    if (binding[key] !== value) {
      throw new Error(`Service-bound API config drifted at ${key}`);
    }
  }

  return Object.freeze({
    apiConfig: expectedConfig,
    bindingMarker: LOCAL_STACK_MARKER,
    middlewareStatus: middlewareResponse.status,
    webStatus: staticResponse.status,
  });
}

export async function runLocalStackCycle(
  plan,
  {
    children = new SupervisedChildren(),
    fetchImpl = fetch,
    probeImpl = probeLocalStack,
    waitForReadinessImpl = waitForReadiness,
  } = {},
) {
  let evidence;
  try {
    const api = children.start(plan.api);
    await waitForReadinessImpl(plan.apiReadiness, {
      childRecord: api,
      fetchImpl,
      readinessTimeoutMs: READINESS_TIMEOUT_MS,
      ports: plan.ports.map(({ port }) => port),
    });
    const web = children.start(plan.web);
    await waitForReadinessImpl(plan.webReadiness, {
      childRecord: web,
      fetchImpl,
      readinessTimeoutMs: READINESS_TIMEOUT_MS,
      ports: plan.ports.map(({ port }) => port),
    });
    evidence = await probeImpl(fetchImpl);
  } finally {
    await children.stopAll("SIGTERM");
  }
  for (const record of children.records) {
    assertCleanWorkerdOutput(
      `${record.label} local-stack smoke`,
      record.output ?? "",
      record.diagnostics ?? [],
    );
  }
  if (children.records.some((record) => !record.settled)) {
    throw new Error("A local-stack child survived bounded shutdown");
  }
  return evidence;
}

export function createLocalStackSignalController({
  processLike = process,
  getChildren,
  onStopError = (error) => process.stderr.write(`${String(error)}\n`),
} = {}) {
  let requestedSignal = null;
  const handle = (signal) => {
    if (requestedSignal) return;
    requestedSignal = signal;
    const children = getChildren?.();
    if (children) {
      void children.stopAll(signal).catch(onStopError);
    }
  };
  const onSigint = () => handle("SIGINT");
  const onSigterm = () => handle("SIGTERM");
  processLike.once("SIGINT", onSigint);
  processLike.once("SIGTERM", onSigterm);
  return Object.freeze({
    dispose() {
      processLike.removeListener("SIGINT", onSigint);
      processLike.removeListener("SIGTERM", onSigterm);
    },
    getRequestedSignal() {
      return requestedSignal;
    },
  });
}

function throwIfInterrupted(controller) {
  const signal = controller.getRequestedSignal();
  if (signal) {
    const error = new Error(`Local-stack smoke interrupted by ${signal}`);
    error.signal = signal;
    throw error;
  }
}

export async function runLocalStackSmoke({
  childFactory = () => new SupervisedChildren(),
  portCheck = assertPortsAvailable,
  runMigration = runLocalD1Migrations,
  spawnSyncImpl = spawnSync,
} = {}) {
  const workspace = requireDisposableRoot(
    mkdtempSync(resolve(tmpdir(), "vocanova-local-stack-")),
  );
  const stateDirectory = resolve(workspace, "state");
  const before = captureRepositoryTree(repositoryRoot, spawnSyncImpl);
  const plan = buildDisposableLocalStackPlan(stateDirectory);
  let activeChildren = null;
  const controller = createLocalStackSignalController({
    getChildren: () => activeChildren,
  });
  const startedAt = Date.now();
  try {
    await portCheck(plan.ports);
    runPreparation(plan, spawnSyncImpl);
    throwIfInterrupted(controller);

    runMigrations(stateDirectory, runMigration);
    runMigrations(stateDirectory, runMigration);
    const initialized = readDisposableD1Evidence(stateDirectory);
    if (initialized.health !== "ok" || initialized.migrationCount < 1) {
      throw new Error("Empty/repeated D1 initialization evidence failed");
    }

    const firstChildren = childFactory();
    activeChildren = firstChildren;
    const first = await runLocalStackCycle(plan, { children: firstChildren });
    activeChildren = null;
    throwIfInterrupted(controller);
    const afterFirstCycle = readDisposableD1Evidence(stateDirectory);

    const secondChildren = childFactory();
    activeChildren = secondChildren;
    const second = await runLocalStackCycle(plan, { children: secondChildren });
    activeChildren = null;
    throwIfInterrupted(controller);
    const afterRestart = readDisposableD1Evidence(stateDirectory);

    if (
      JSON.stringify(initialized) !== JSON.stringify(afterFirstCycle) ||
      JSON.stringify(initialized) !== JSON.stringify(afterRestart)
    ) {
      throw new Error(
        "Disposable D1 migration evidence did not persist across restart",
      );
    }
    if (Date.now() - startedAt > LOCAL_STACK_TIMEOUT_MS) {
      throw new Error(
        `Local-stack smoke exceeded ${String(LOCAL_STACK_TIMEOUT_MS)}ms`,
      );
    }

    await portCheck(plan.ports);
    assertRepositoryTreeUnchanged(
      before,
      captureRepositoryTree(repositoryRoot, spawnSyncImpl),
    );
    process.stdout.write(
      `Disposable local stack passed: migrations=${String(initialized.migrationCount)}; web=${String(first.webStatus)}/${String(second.webStatus)}; middleware=${String(second.middlewareStatus)}; binding=${second.bindingMarker}; restart=persistent; children=stopped; tree=clean.\n`,
    );
    return Object.freeze({
      first,
      initialized,
      second,
    });
  } finally {
    controller.dispose();
    if (activeChildren) await activeChildren.stopAll("SIGTERM");
    await portCheck(plan.ports);
    rmSync(workspace, { force: true, recursive: true });
  }
}

export function validateLocalStackCliArguments(args) {
  return args.length === 0
    ? []
    : [
        "test:local-stack accepts no arguments; topology and disposable state are fixed",
      ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateLocalStackCliArguments(process.argv.slice(2));
  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 2;
  } else {
    try {
      await runLocalStackSmoke();
    } catch (error) {
      process.stderr.write(
        `Disposable local stack failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode =
        error && typeof error === "object" && error.signal === "SIGINT"
          ? 130
          : error && typeof error === "object" && error.signal === "SIGTERM"
            ? 143
            : 1;
    }
  }
}
