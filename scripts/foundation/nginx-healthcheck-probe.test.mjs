// VOC-066-T01 / VOC-066-TEST-03 — regression guard for nginx Docker
// HEALTHCHECK probes that hit the default-server catch-all on port 80.
//
// VOC-032-D03 / VOC-066 Approach A: unrecognized-Host traffic to `/`
// returns 444, so a bare `wget http://127.0.0.1/` probe can never pass.
// Edge nginx compose files must probe the dedicated `/healthz` location
// instead (see infra/nginx-shared/conf.d/05-default.conf and production
// 05-default.conf).
//
// Runs via `pnpm test` → `node --test scripts/foundation/*.test.mjs`.

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const BARE_ROOT_PROBE = /http:\/\/127\.0\.0\.1\/(?=["'\s|]|$)/;
const HEALTHZ_PROBE = /http:\/\/127\.0\.0\.1\/healthz/;

/**
 * @param {string} composeSource
 * @returns {string[]}
 */
function extractNginxHealthcheckCommands(composeSource) {
  const blocks = [];
  const lines = composeSource.split("\n");
  let inNginx = false;
  let current = [];

  for (const line of lines) {
    if (/^  nginx:\s*$/.test(line)) {
      if (inNginx && current.length > 0) {
        blocks.push(current.join("\n"));
      }
      inNginx = true;
      current = [line];
      continue;
    }

    if (!inNginx) {
      continue;
    }

    if (/^  [a-z0-9_-]+:/.test(line) && !line.startsWith("  nginx:")) {
      blocks.push(current.join("\n"));
      inNginx = false;
      current = [];
      continue;
    }

    if (/^[a-z]/.test(line)) {
      blocks.push(current.join("\n"));
      inNginx = false;
      current = [];
      continue;
    }

    current.push(line);
  }

  if (inNginx && current.length > 0) {
    blocks.push(current.join("\n"));
  }

  const commands = [];
  for (const block of blocks) {
    const healthcheckIndex = block.indexOf("healthcheck:");
    if (healthcheckIndex === -1) {
      continue;
    }

    const healthcheckBlock = block.slice(healthcheckIndex);
    const testMatch = healthcheckBlock.match(
      /test:\s*\["CMD-SHELL",\s*"([^"]+)"\]/,
    );
    if (testMatch) {
      commands.push(testMatch[1]);
    }
  }

  return commands;
}

/**
 * @param {string} probeCommand
 * @param {string} [composeLabel]
 */
function assertNginxEdgeProbeUsesHealthz(probeCommand, composeLabel) {
  const label = composeLabel ? `${composeLabel}: ` : "";

  if (!probeCommand.includes("127.0.0.1")) {
    return;
  }

  if (/127\.0\.0\.1:\d+/.test(probeCommand)) {
    return;
  }

  assert.match(
    probeCommand,
    HEALTHZ_PROBE,
    `${label}nginx edge HEALTHCHECK must probe http://127.0.0.1/healthz (VOC-066 Approach A); got: ${probeCommand}`,
  );

  assert.doesNotMatch(
    probeCommand,
    BARE_ROOT_PROBE,
    `${label}nginx edge HEALTHCHECK must not probe bare http://127.0.0.1/ against the 444 catch-all; got: ${probeCommand}`,
  );
}

function listInfraComposeFiles() {
  return readdirSync(path.join(repositoryRoot, "infra"))
    .filter(
      (name) => name.startsWith("docker-compose") && name.endsWith(".yml"),
    )
    .sort()
    .map((name) => path.join("infra", name));
}

test("VOC-066-TEST-03: nginx edge compose files probe /healthz, not bare /", () => {
  const composeFiles = listInfraComposeFiles();
  const checked = [];

  for (const relativePath of composeFiles) {
    const composeSource = readFileSync(
      path.join(repositoryRoot, relativePath),
      "utf8",
    );
    const probeCommands = extractNginxHealthcheckCommands(composeSource);

    for (const probeCommand of probeCommands) {
      assertNginxEdgeProbeUsesHealthz(probeCommand, relativePath);
      checked.push({ relativePath, probeCommand });
    }
  }

  assert.ok(
    checked.length > 0,
    "expected at least one nginx edge HEALTHCHECK in infra/docker-compose*.yml",
  );

  const checkedPaths = [...new Set(checked.map((entry) => entry.relativePath))];
  assert.ok(
    checkedPaths.includes("infra/docker-compose.shared-edge.yml"),
    "shared-edge nginx HEALTHCHECK must remain guarded (VOC-067 shared edge)",
  );
});

test("VOC-066-TEST-03: pre-fix bare root probe is rejected", () => {
  const preFixProbe =
    "wget --quiet --tries=1 -O /dev/null http://127.0.0.1/ || exit 1";

  assert.throws(
    () => assertNginxEdgeProbeUsesHealthz(preFixProbe, "synthetic"),
    (error) => {
      assert.match(String(error), /healthz|bare http:\/\/127\.0\.0\.1\//);
      return true;
    },
  );
});

test("VOC-066-TEST-03: post-fix /healthz probe is accepted", () => {
  const postFixProbe =
    "wget --quiet --tries=1 -O /dev/null http://127.0.0.1/healthz || exit 1";

  assert.doesNotThrow(() =>
    assertNginxEdgeProbeUsesHealthz(postFixProbe, "synthetic"),
  );
});
