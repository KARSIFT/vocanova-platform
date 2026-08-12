// VOC-067-T05 — do not retire the production :8443 nginx bridge until
// Cloudflare origin-port remap is API-confirmed absent.
//
// Independent review of T05 attempt 1 (commit 7d5a740) FAILed because
// docker-compose.production.yml dropped vocanova-production-nginx while
// --verify-only had never run with a production token. If Cloudflare still
// remaps to origin :8443, stopping that bridge recreates issue #485 (edge 502
// while the shared-edge :443 stack is healthy).
//
// Machine-readable gate: t05-live-cutover-evidence.md frontmatter field
// `cloudflare_remap_api_status` must be `absent` before the bridge may be
// removed. `unconfirmed` / any other value requires the compose service and
// `8443:443` publish to remain.
//
// Runs via `pnpm test` → `node --test scripts/foundation/*.test.mjs`.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const evidencePath = path.join(
  repositoryRoot,
  "specs/changes/VOC-067-production-outage-root-cause-consider-unifying/t05-live-cutover-evidence.md",
);
const productionComposePath = path.join(
  repositoryRoot,
  "infra/docker-compose.production.yml",
);

function readFrontmatterStatus(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(
    match,
    "t05-live-cutover-evidence.md must start with YAML frontmatter",
  );
  const statusMatch = match[1].match(
    /^cloudflare_remap_api_status:\s*(\S+)\s*$/m,
  );
  assert.ok(
    statusMatch,
    "frontmatter must include cloudflare_remap_api_status",
  );
  return statusMatch[1];
}

test("VOC-067-T05: production :8443 bridge stays until remap API status is absent", () => {
  const evidence = readFileSync(evidencePath, "utf8");
  const status = readFrontmatterStatus(evidence);
  const compose = readFileSync(productionComposePath, "utf8");

  const hasBridgeContainer = /container_name:\s*vocanova-production-nginx/.test(
    compose,
  );
  const publishes8443 = /["']8443:443["']/.test(compose);

  if (status === "absent") {
    return;
  }

  assert.notEqual(
    status,
    "absent",
    "unreachable: non-absent status should keep the bridge",
  );
  assert.ok(
    hasBridgeContainer,
    `cloudflare_remap_api_status=${status}: infra/docker-compose.production.yml must keep vocanova-production-nginx until Cloudflare --verify-only confirms remap absence (VOC-067-AC-06 / issue #485)`,
  );
  assert.ok(
    publishes8443,
    `cloudflare_remap_api_status=${status}: production nginx must keep publishing 8443:443 while remap is unconfirmed`,
  );
});
