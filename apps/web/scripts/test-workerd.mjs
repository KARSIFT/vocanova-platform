/* global URL, clearTimeout, console, fetch, process, setTimeout */

import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const START_TIMEOUT_MS = 120_000;
const MAX_START_ATTEMPTS = 3;

export async function runWorkerdSmoke() {
  let activeAttempt = null;
  let failureOutput = [];
  let failure = null;
  try {
    activeAttempt = await startWorkerdWithRetry();
    await exerciseWorkerd(activeAttempt.origin);
  } catch (error) {
    failure = error;
    if (error instanceof WorkerdStartupAttemptError) {
      failureOutput = error.output;
    }
  } finally {
    if (activeAttempt)
      await stopProcess(activeAttempt.wrangler, activeAttempt.closed);
  }
  const output = activeAttempt?.output ?? failureOutput;
  if (failure) {
    process.stderr.write(`${redactAndBound(output.join(""))}\n`);
    throw failure;
  }
  try {
    assertCleanWorkerdOutput(
      "canonical workerd smoke",
      output.join(""),
      activeAttempt.outputCollector.result().diagnostics,
    );
  } catch (error) {
    process.stderr.write(`${redactAndBound(output.join(""))}\n`);
    throw error;
  }
  console.log(
    "workerd compatibility: PASS (static, SSR, RSC, assets, middleware, auth redirect, API service binding, Sentry-disabled failure, clean bounded logs)",
  );
}

async function exerciseWorkerd(origin) {
  const staticResponse = await fetch(origin);
  assert.equal(staticResponse.status, 200);
  assert.match(
    await staticResponse.text(),
    /Vocanova web foundation is running/,
  );

  const signInResponse = await fetch(`${origin}/signin`);
  assert.equal(signInResponse.status, 200);
  assert.match(await signInResponse.text(), /Sign in to Vocanova/);

  const rscResponse = await fetch(`${origin}/signin`, {
    headers: { RSC: "1" },
  });
  assert.equal(rscResponse.status, 200);
  assert.match(
    rscResponse.headers.get("content-type") ?? "",
    /text\/x-component/,
  );
  assert.match(await rscResponse.text(), /Sign in to Vocanova/);

  const assetPath = await findStaticAsset();
  const assetResponse = await fetch(`${origin}/${assetPath}`);
  assert.equal(assetResponse.status, 200);
  assert.ok((await assetResponse.arrayBuffer()).byteLength > 0);

  const anonymousHome = await fetch(`${origin}/home`, { redirect: "manual" });
  assert.equal(anonymousHome.status, 307);
  assert.equal(
    new URL(assertHeader(anonymousHome, "location"), origin).pathname,
    "/signin",
  );

  const authenticatedHome = await fetch(`${origin}/home`, {
    headers: { Cookie: "vocanova_session=workerd-test" },
    redirect: "manual",
  });
  assert.equal(authenticatedHome.status, 200);
  const homeHtml = await authenticatedHome.text();
  assert.match(homeHtml, /Review target: <!-- -->13<!-- --> words/);
  assert.match(homeHtml, /2<!-- --> words due today/);

  const apiFailure = await fetch(`${origin}/home`, {
    headers: { Cookie: "vocanova_session=api-error" },
    redirect: "manual",
  });
  assert.equal(apiFailure.status, 307);
  assert.equal(
    new URL(assertHeader(apiFailure, "location"), origin).pathname,
    "/signin",
  );
}

export async function startWorkerdWithRetry({
  maximumAttempts = MAX_START_ATTEMPTS,
  maximumPortSelections = maximumAttempts * 4,
  selectPort = reservePort,
  startAttempt = startWorkerdAttempt,
} = {}) {
  assert.ok(
    Number.isSafeInteger(maximumAttempts) && maximumAttempts > 0,
    "maximumAttempts must be a positive integer",
  );
  assert.ok(
    Number.isSafeInteger(maximumPortSelections) &&
      maximumPortSelections >= maximumAttempts,
    "maximumPortSelections must be an integer at least as large as maximumAttempts",
  );

  const attemptedPorts = new Set();
  let portSelections = 0;

  for (
    let attemptNumber = 1;
    attemptNumber <= maximumAttempts;
    attemptNumber += 1
  ) {
    let port;
    while (portSelections < maximumPortSelections) {
      portSelections += 1;
      const candidate = await selectPort();
      assert.ok(
        Number.isSafeInteger(candidate) && candidate > 0 && candidate <= 65_535,
        "selected workerd port must be an integer between 1 and 65535",
      );
      if (!attemptedPorts.has(candidate)) {
        port = candidate;
        attemptedPorts.add(candidate);
        break;
      }
    }
    if (port === undefined) {
      throw new Error(
        `Unable to select a fresh workerd port after ${String(maximumPortSelections)} bounded selections`,
      );
    }
    try {
      return await startAttempt(port);
    } catch (error) {
      if (
        !isRetryableLocalBindCollision(error) ||
        attemptNumber === maximumAttempts
      ) {
        throw error;
      }
    }
  }

  throw new Error("unreachable workerd startup retry state");
}

async function startWorkerdAttempt(port) {
  const origin = `http://${HOST}:${port}`;
  const output = [];
  const wrangler = spawn(
    "pnpm",
    [
      "exec",
      "wrangler",
      "dev",
      "--local",
      "-c",
      "wrangler.jsonc",
      "-c",
      "tests/workerd/wrangler.mock-api.jsonc",
      "--ip",
      HOST,
      "--port",
      String(port),
    ],
    {
      cwd: process.cwd(),
      env: buildStandaloneWorkerdEnvironment(),
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const { closed, collector: outputCollector } = collectChildWorkerdOutput(
    wrangler,
    { onChunk: recordOutput },
  );

  function recordOutput(chunk) {
    const text = String(chunk);
    output.push(text);
    if (output.length > 400) output.shift();
  }

  try {
    await waitForReady(wrangler, origin, output, port);
  } catch (error) {
    await stopProcess(wrangler, closed);
    throw new WorkerdStartupAttemptError(error, {
      output,
      port,
      stickyDiagnostics: outputCollector.result().diagnostics,
    });
  }

  return {
    closed,
    origin,
    output,
    outputCollector,
    stickyDiagnostics: outputCollector.result().diagnostics,
    wrangler,
  };
}

export function buildStandaloneWorkerdEnvironment(source = process.env) {
  const environment = { ...source };
  for (const key of Object.keys(environment)) {
    if (/^(?:NEXT_PUBLIC_)?SENTRY(?:_|$)/i.test(key)) delete environment[key];
  }
  return {
    ...environment,
    API_BASE_URL: "",
    NEXT_PUBLIC_API_BASE_URL: "",
    NEXT_PUBLIC_SENTRY_DSN: "",
    SENTRY_DSN: "",
    WRANGLER_SEND_METRICS: "false",
  };
}

export class WorkerdStartupAttemptError extends Error {
  constructor(cause, { output, port, stickyDiagnostics }) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    this.name = "WorkerdStartupAttemptError";
    this.output = output;
    this.port = port;
    this.stickyDiagnostics = stickyDiagnostics;
  }
}

export function isRetryableLocalBindCollision(error) {
  return (
    error instanceof WorkerdStartupAttemptError &&
    hasLocalBindCollisionDiagnostic(error.output.join(""), error.port)
  );
}

function hasLocalBindCollisionDiagnostic(value, port) {
  const endpoint = `${HOST}:${port}`;
  return stripAnsi(String(value ?? ""))
    .split(/\r?\n/)
    .some((line) => {
      const nodeBindCollision =
        line.includes(endpoint) &&
        /\bEADDRINUSE\b.*\baddress already in use\b|\baddress already in use\b.*\bEADDRINUSE\b/i.test(
          line,
        );
      const workerdFatalBindCollision =
        line.includes(endpoint) &&
        /\[ERROR\].*Fatal uncaught kj::Exception:.*::bind\(.*\): Address already in use; toString\(\) =/i.test(
          line,
        );
      const wranglerBindCollision =
        line.includes(`Address already in use (${endpoint}).`) &&
        /\[ERROR\].*Please check that you are not already running a server on this address or specify a different port with --port\./i.test(
          line,
        );
      return (
        nodeBindCollision || workerdFatalBindCollision || wranglerBindCollision
      );
    });
}

async function waitForReady(wrangler, origin, output, port) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const currentOutput = output.join("");
    if (hasLocalBindCollisionDiagnostic(currentOutput, port)) {
      throw new Error(`Wrangler could not bind its local port ${port}`);
    }
    if (wrangler.exitCode !== null) {
      throw new Error(
        `Wrangler exited before readiness with ${wrangler.exitCode}`,
      );
    }
    if (!currentOutput.includes(`[wrangler:info] Ready on ${origin}`)) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      continue;
    }
    try {
      const response = await fetch(origin);
      if (response.status > 0) return;
    } catch {
      // Workerd is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for workerd at ${origin}`);
}

const WORKERD_DIAGNOSTIC =
  /\b(?:unhandled(?:promise)?rejection|compileerror|runtimeerror|error|exception)\b/i;
const WORKERD_HARD_DIAGNOSTIC =
  /\b(?:unhandled(?:promise)?rejection|compileerror|runtimeerror)\b|WebAssembly\.(?:compile|compileStreaming|instantiateStreaming|instantiate)\b/i;
// This is the one expected application diagnostic exercised by the smoke: the
// probe deliberately requests an unauthenticated middleware route.  The
// allowlist is exact and cannot match Wasm/rejection diagnostics.
const ALLOWED_DIAGNOSTIC =
  /"event":"middleware_auth_check_failure".*"category":"(?:unauthorized_401|non_ok_response)"/;
const ANSI_ESCAPE_PATTERN = new RegExp(
  `${String.fromCodePoint(0x1b)}\\[[0-?]*[ -/]*[@-~]`,
  "g",
);
const MAXIMUM_DIAGNOSTIC_BYTES = 16_384;
const MAXIMUM_LINE_BYTES = 16_384;
const SPLIT_TOKEN_OVERLAP_BYTES = 128;

function diagnosticForLine(value, maximumBytes = MAXIMUM_DIAGNOSTIC_BYTES) {
  const line = stripAnsi(String(value ?? "")).trim();
  if (
    line.length === 0 ||
    (!WORKERD_HARD_DIAGNOSTIC.test(line) &&
      (!WORKERD_DIAGNOSTIC.test(line) || ALLOWED_DIAGNOSTIC.test(line)))
  ) {
    return null;
  }
  return redactAndBound(line, maximumBytes);
}

export class WorkerdOutputCollector {
  constructor({
    maximumDiagnosticBytes = MAXIMUM_DIAGNOSTIC_BYTES,
    maximumLineBytes = MAXIMUM_LINE_BYTES,
    maximumOutputBytes = 65_536,
  } = {}) {
    for (const [name, value] of [
      ["maximumDiagnosticBytes", maximumDiagnosticBytes],
      ["maximumLineBytes", maximumLineBytes],
      ["maximumOutputBytes", maximumOutputBytes],
    ]) {
      assert.ok(
        Number.isSafeInteger(value) && value > 0,
        `${name} must be a positive integer`,
      );
    }
    this.maximumDiagnosticBytes = maximumDiagnosticBytes;
    this.maximumLineBytes = maximumLineBytes;
    this.maximumOutputBytes = maximumOutputBytes;
    this.channels = new Map();
    this.diagnostics = [];
    this.diagnosticSet = new Set();
    this.diagnosticBytes = 0;
    this.output = "";
  }

  write(channel, chunk) {
    const key = String(channel);
    const state = this.channels.get(key) ?? {
      closed: false,
      pending: "",
      truncated: false,
    };
    assert.equal(
      state.closed,
      false,
      `workerd output channel ${key} is closed`,
    );
    state.pending += String(chunk);
    this.channels.set(key, state);

    for (let newline = state.pending.indexOf("\n"); newline !== -1;) {
      const line = state.pending.slice(0, newline).replace(/\r$/, "");
      state.pending = state.pending.slice(newline + 1);
      this.#recordLine(line, state.truncated, true);
      state.truncated = false;
      newline = state.pending.indexOf("\n");
    }

    if (Buffer.byteLength(state.pending) > this.maximumLineBytes) {
      this.#recordDiagnostic(state.pending);
      this.#appendOutput("[oversized workerd log line redacted]\n");
      state.pending = boundUtf8Tail(
        state.pending,
        Math.min(SPLIT_TOKEN_OVERLAP_BYTES, this.maximumLineBytes),
      );
      state.truncated = true;
    }
  }

  close(channel) {
    const key = String(channel);
    const state = this.channels.get(key) ?? {
      closed: false,
      pending: "",
      truncated: false,
    };
    if (state.closed) return;
    if (state.pending !== "" || state.truncated) {
      this.#recordLine(state.pending, state.truncated, false);
    }
    state.closed = true;
    state.pending = "";
    state.truncated = false;
    this.channels.set(key, state);
  }

  flush() {
    for (const channel of this.channels.keys()) this.close(channel);
  }

  result() {
    let pending = "";
    for (const state of this.channels.values()) {
      if (!state.closed && state.pending !== "") {
        pending += state.truncated
          ? "[oversized workerd log line redacted]"
          : redactAndBound(state.pending, this.maximumLineBytes);
      }
    }
    const output = boundUtf8Tail(
      `${this.output}${pending}`,
      this.maximumOutputBytes,
    );
    return Object.freeze({
      diagnostics: Object.freeze([...this.diagnostics]),
      output,
      pass: this.diagnostics.length === 0,
    });
  }

  #recordLine(line, truncated, newline) {
    this.#recordDiagnostic(line);
    this.#appendOutput(
      `${truncated ? "[oversized workerd log line redacted]" : redactAndBound(line, this.maximumLineBytes)}${newline ? "\n" : ""}`,
    );
  }

  #recordDiagnostic(line) {
    if (this.diagnosticBytes >= this.maximumDiagnosticBytes) return;
    const diagnostic = diagnosticForLine(
      line,
      this.maximumDiagnosticBytes - this.diagnosticBytes,
    );
    if (!diagnostic || this.diagnosticSet.has(diagnostic)) return;
    this.diagnosticSet.add(diagnostic);
    this.diagnostics.push(diagnostic);
    this.diagnosticBytes += Buffer.byteLength(diagnostic);
  }

  #appendOutput(value) {
    this.output = boundUtf8Tail(
      `${this.output}${value}`,
      this.maximumOutputBytes,
    );
  }
}

export function collectChildWorkerdOutput(
  child,
  { collector = new WorkerdOutputCollector(), onChunk = () => {} } = {},
) {
  for (const [channel, stream] of [
    ["stdout", child.stdout],
    ["stderr", child.stderr],
  ]) {
    stream?.on("data", (chunk) => {
      collector.write(channel, chunk);
      onChunk(chunk, channel);
    });
    stream?.once("close", () => collector.close(channel));
  }
  const closed = new Promise((resolve) => {
    child.once("close", (code, signal) => {
      collector.flush();
      resolve({ code, signal });
    });
  });
  return Object.freeze({ closed, collector });
}

export function classifyWorkerdOutput(value, maximumBytes = 16_384) {
  const collector = new WorkerdOutputCollector({
    maximumDiagnosticBytes: maximumBytes,
    maximumOutputBytes: maximumBytes,
  });
  collector.write("complete", value);
  collector.close("complete");
  return collector.result();
}

export function assertCleanWorkerdOutput(label, value, stickyDiagnostics = []) {
  const result = classifyWorkerdOutput(value);
  const diagnostics = [
    ...new Set([...stickyDiagnostics, ...result.diagnostics]),
  ];
  if (diagnostics.length > 0) {
    throw new Error(
      `${label} emitted unexpected workerd diagnostics:\n${diagnostics.join("\n")}`,
    );
  }
  return result;
}

function redactAndBound(value, maximumBytes = 16_384) {
  return boundUtf8Tail(
    stripAnsi(String(value ?? ""))
      .replaceAll(/https?:\/\/[^@\s]+@/g, "https://[REDACTED]@")
      .replaceAll(
        /(\b(?:dsn|token|authorization|cookie|password|secret|learner|provider|request[_-]?body))\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^,;\n}]*?(?=\s+(?:unhandled(?:promise)?rejection|compileerror|runtimeerror|error|exception)\b|\s+WebAssembly\.|[,;\n}]|$))/gi,
        (_match, key) => `${key}=[REDACTED]`,
      ),
    maximumBytes,
  );
}

function boundUtf8Tail(value, maximumBytes) {
  const bytes = Buffer.from(String(value ?? ""));
  return bytes.length <= maximumBytes
    ? bytes.toString()
    : bytes.subarray(bytes.length - maximumBytes).toString();
}

function stripAnsi(value) {
  return value.replaceAll(ANSI_ESCAPE_PATTERN, "");
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HOST, resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const selectedPort = address.port;
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return selectedPort;
}

async function findStaticAsset() {
  const root = path.join(process.cwd(), ".open-next/assets/_next/static");
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const asset = entries.find(
    (entry) => entry.isFile() && entry.name.endsWith(".js"),
  );
  assert.ok(asset, "expected at least one generated static JavaScript asset");
  const absolute = path.join(asset.parentPath, asset.name);
  return path.relative(path.join(process.cwd(), ".open-next/assets"), absolute);
}

function assertHeader(response, name) {
  const value = response.headers.get(name);
  assert.ok(value, `expected ${name} response header`);
  return value;
}

async function stopProcess(child, closed) {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
  }
  if (!(await waitBounded(closed, 5_000))) {
    child.kill("SIGKILL");
    if (!(await waitBounded(closed, 2_000))) {
      throw new Error("Wrangler stdio did not close after SIGKILL");
    }
  }
}

async function waitBounded(promise, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      promise.then(() => true),
      new Promise((resolve) => {
        timer = setTimeout(resolve, timeoutMs, false);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await runWorkerdSmoke();
  } catch (error) {
    process.stderr.write(
      `workerd compatibility failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
