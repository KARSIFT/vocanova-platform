/* global console, process */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const FREE_COMPRESSED_LIMIT_BYTES = 3 * 1024 * 1024;
const STARTUP_LIMIT_MS = 1_000;

const dryRun = runWrangler([
  "deploy",
  "--dry-run",
  "--experimental-provision=false",
  "--env=",
  "--outdir",
  ".wrangler/limits",
]);
const compressedBytes = parseSize(dryRun, /gzip:\s*([\d.]+)\s*(KiB|MiB)/i);
assert.ok(
  compressedBytes <= FREE_COMPRESSED_LIMIT_BYTES,
  `compressed Worker ${compressedBytes} bytes exceeds the ${FREE_COMPRESSED_LIMIT_BYTES}-byte Free-plan target`,
);

const startup = runWrangler(["check", "startup"]);
const startupMs = parseDuration(startup, /Profile window:\s*([\d.]+)\s*ms/i);
assert.ok(
  startupMs < STARTUP_LIMIT_MS,
  `local startup profile ${startupMs}ms exceeds the ${STARTUP_LIMIT_MS}ms platform limit`,
);

console.log(
  `Worker limits: PASS (gzip ${formatBytes(compressedBytes)} <= 3 MiB; local startup profile ${startupMs}ms < 1000ms)`,
);
console.log(
  "Local startup timing is diagnostic; an eventual version upload is the authoritative platform measurement.",
);

function runWrangler(args) {
  const result = spawnSync("pnpm", ["exec", "wrangler", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });
  const combined = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (result.status !== 0) {
    process.stderr.write(combined);
    throw new Error(`wrangler ${args.join(" ")} exited ${result.status}`);
  }
  process.stdout.write(combined);
  return stripAnsi(combined);
}

function parseSize(output, pattern) {
  const match = output.match(pattern);
  assert.ok(match, "Wrangler did not report a compressed bundle size");
  const value = Number(match[1]);
  return value * (match[2].toLowerCase() === "mib" ? 1024 * 1024 : 1024);
}

function parseDuration(output, pattern) {
  const match = output.match(pattern);
  assert.ok(match, "Wrangler did not report a startup profile window");
  return Number(match[1]);
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KiB`;
}

function stripAnsi(value) {
  const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
  return value.replace(ansiPattern, "");
}
