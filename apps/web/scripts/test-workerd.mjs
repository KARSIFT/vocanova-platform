/* global URL, console, fetch, process, setTimeout */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const START_TIMEOUT_MS = 120_000;

export async function runWorkerdSmoke() {
  const port = await reservePort();
  const origin = `http://${HOST}:${port}`;
  const output = [];
  const stickyDiagnostics = [];
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
      env: {
        ...process.env,
        API_BASE_URL: "",
        NEXT_PUBLIC_API_BASE_URL: "",
        NEXT_PUBLIC_SENTRY_DSN: "",
        SENTRY_DSN: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  wrangler.stdout.on("data", recordOutput);
  wrangler.stderr.on("data", recordOutput);

  function recordOutput(chunk) {
    const text = String(chunk);
    const chunkClassification = classifyWorkerdOutput(text);
    stickyDiagnostics.push(...chunkClassification.diagnostics);
    output.push(text);
    if (output.length > 400) output.shift();
  }

  let failure = null;
  try {
    await waitForReady(wrangler, origin);

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
  } catch (error) {
    failure = error;
  } finally {
    await stopProcess(wrangler);
  }
  // The process must be stopped before classifying: shutdown can flush a
  // rejection after the final HTTP assertion.  The sticky chunk diagnostics
  // also prevent a long healthy tail from evicting an earlier failure.
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (failure) {
    process.stderr.write(`${redactAndBound(output.join(""))}\n`);
    throw failure;
  }
  try {
    assertCleanWorkerdOutput(
      "canonical workerd smoke",
      output.join(""),
      stickyDiagnostics,
    );
  } catch (error) {
    process.stderr.write(`${redactAndBound(output.join(""))}\n`);
    throw error;
  }
  console.log(
    "workerd compatibility: PASS (static, SSR, RSC, assets, middleware, auth redirect, API service binding, Sentry-disabled failure, clean bounded logs)",
  );
}

async function waitForReady(wrangler, origin) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (wrangler.exitCode !== null) {
      throw new Error(
        `Wrangler exited before readiness with ${wrangler.exitCode}`,
      );
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

export function classifyWorkerdOutput(value, maximumBytes = 16_384) {
  // Inspect the complete already-bounded record before truncating the returned
  // context.  A long healthy tail must not evict an earlier rejection.
  const raw = stripAnsi(String(value ?? ""));
  const diagnosticLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        (WORKERD_HARD_DIAGNOSTIC.test(line) ||
          (WORKERD_DIAGNOSTIC.test(line) && !ALLOWED_DIAGNOSTIC.test(line))),
    );
  const output = redactAndBound(raw, maximumBytes);
  const diagnostics = diagnosticLines.map((line) =>
    redactAndBound(line, maximumBytes),
  );
  return Object.freeze({
    diagnostics: Object.freeze(diagnostics),
    output,
    pass: diagnostics.length === 0,
  });
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
  return stripAnsi(String(value ?? ""))
    .replaceAll(/https?:\/\/[^@\s]+@/g, "https://[REDACTED]@")
    .replaceAll(
      /(\b(?:dsn|token|authorization|cookie|password|secret|learner|provider|request[_-]?body))\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^,;\n}]*?(?=\s+(?:unhandled(?:promise)?rejection|compileerror|runtimeerror|error|exception)\b|\s+WebAssembly\.|[,;\n}]|$))/gi,
      (_match, key) => `${key}=[REDACTED]`,
    )
    .slice(-maximumBytes);
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

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  const exited = new Promise((resolve) => child.once("exit", resolve));
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, 5_000, "timeout"),
  );
  if ((await Promise.race([exited, timeout])) === "timeout") {
    child.kill("SIGKILL");
    await exited;
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
