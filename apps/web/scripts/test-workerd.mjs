/* global URL, console, fetch, process, setTimeout */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";

const HOST = "127.0.0.1";
const START_TIMEOUT_MS = 120_000;
const port = await reservePort();
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

try {
  await waitForReady();

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

  console.log(
    "workerd compatibility: PASS (static, SSR, RSC, assets, middleware, auth redirect, API service binding, Sentry-disabled failure)",
  );
} catch (error) {
  process.stderr.write(`${output.join("")}\n`);
  throw error;
} finally {
  await stopProcess(wrangler);
}

function recordOutput(chunk) {
  output.push(String(chunk));
  if (output.length > 400) output.shift();
}

async function waitForReady() {
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
