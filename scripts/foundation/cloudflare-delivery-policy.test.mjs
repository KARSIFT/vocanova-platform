import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  evaluateDeliveryEvent,
  inspectDeliveryWorkflow,
  loadDeliveryManifest,
  parseJsonc,
  resolveVersionId,
  validateDeliveryRepository,
} from "./cloudflare-delivery-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const exactSha = "a".repeat(40);
const apiVersion = "11111111-1111-4111-8111-111111111111";
const webVersion = "22222222-2222-4222-8222-222222222222";
const evidence =
  "https://github.com/KARSIFT/vocanova-platform/pull/123#issuecomment-456";

test("held delivery manifest, Wrangler environments, workflow, and migration ceiling agree", () => {
  assert.deepEqual(validateDeliveryRepository(repositoryRoot), []);
});

test("JSONC parsing preserves URLs while removing comments and trailing commas", () => {
  assert.deepEqual(
    parseJsonc('{"url":"https://example.invalid/a//b",/* x */"items":[1,],}'),
    { url: "https://example.invalid/a//b", items: [1] },
  );
});

test("pull requests and the currently held manual path cannot deploy", () => {
  const manifest = loadDeliveryManifest(repositoryRoot);
  const pullRequest = evaluateDeliveryEvent(manifest, {
    event_name: "pull_request",
    ref: "refs/pull/1/merge",
    sha: exactSha,
    inputs: {},
  });
  assert.equal(pullRequest.eligible, false);
  assert.match(pullRequest.reasons.join("\n"), /explicit workflow_dispatch/);

  const manual = evaluateDeliveryEvent(manifest, eventFor("staging"));
  assert.equal(manual.eligible, false);
  assert.match(manual.reasons.join("\n"), /VOC-080-HOLD-00 remains active/);
});

test("an exact synthetic staging authorization passes every gate", () => {
  const manifest = authorizedManifest("staging");
  assert.deepEqual(
    evaluateDeliveryEvent(
      manifest,
      eventFor("staging"),
      new Date("2026-08-22T00:00:00Z"),
    ),
    { eligible: true, environment: "staging", reasons: [] },
  );
});

test("stale SHA, missing authority, wrong ref, environment mix-up, and cost fail closed", () => {
  const cases = [
    ["stale SHA", { reviewed_sha: "b".repeat(40) }, /reviewed_sha/],
    ["missing authority", { action_authority_url: "" }, /action authority/],
    ["wrong ref", {}, /requires refs\/heads\/develop/, "refs/heads/main"],
    [
      "environment mix-up",
      { delivery_environment: "production" },
      /VOC-080-HOLD-01/,
    ],
    ["cost", { estimated_cost_cents: "1" }, /cost exceeds/],
    [
      "bad rollback ID",
      { previous_api_version_id: "latest" },
      /version ID is invalid/,
    ],
    ["bad confirmation", { confirmation: "yes" }, /manual confirmation/],
  ];
  for (const [
    name,
    inputChanges,
    pattern,
    ref = "refs/heads/develop",
  ] of cases) {
    const decision = evaluateDeliveryEvent(
      authorizedManifest("staging"),
      {
        ...eventFor("staging"),
        ref,
        inputs: { ...eventFor("staging").inputs, ...inputChanges },
      },
      new Date("2026-08-22T00:00:00Z"),
    );
    assert.equal(decision.eligible, false, name);
    assert.match(decision.reasons.join("\n"), pattern, name);
  }
});

test("production additionally requires matching staging and backup evidence", () => {
  const manifest = authorizedManifest("production");
  const passing = evaluateDeliveryEvent(
    manifest,
    eventFor("production"),
    new Date("2026-08-22T00:00:00Z"),
  );
  assert.equal(passing.eligible, true);

  const missing = eventFor("production");
  missing.inputs.backup_evidence_url = "";
  const blocked = evaluateDeliveryEvent(
    manifest,
    missing,
    new Date("2026-08-22T00:00:00Z"),
  );
  assert.equal(blocked.eligible, false);
  assert.match(blocked.reasons.join("\n"), /backup\/Time Travel evidence/);
});

test("workflow policy rejects PR secret exposure, cancellation, and an unguarded production job", () => {
  const source = readFileSync(
    resolve(repositoryRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  for (const [changed, pattern] of [
    [
      source.replace(
        "cancel-in-progress: ${{ github.event_name != 'workflow_dispatch' }}",
        "cancel-in-progress: true",
      ),
      /must not be cancelled/,
    ],
    [
      source.replace(
        "needs.delivery-gate.outputs.environment == 'production'",
        "github.ref == 'refs/heads/main'",
      ),
      /production delivery job missing/,
    ],
    [
      source.replace(
        "run: pnpm run ci:delivery",
        "env:\n          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n        run: pnpm run ci:delivery",
      ),
      /delivery policy job must be credential-free/,
    ],
    [
      source.replace(
        'test -n "$CLOUDFLARE_API_TOKEN" && test -n "$CLOUDFLARE_ACCOUNT_ID"',
        "true",
      ),
      /staging delivery job missing/,
    ],
  ]) {
    assert.ok(
      inspectDeliveryWorkflow(changed).some((error) => pattern.test(error)),
    );
  }
});

test("version evidence resolves one exact tagged UUID and rejects missing or ambiguous tags", () => {
  const versions = [
    { id: apiVersion, annotations: { "workers/tag": `sha-${exactSha}` } },
    { id: webVersion, annotations: { "workers/tag": "other" } },
  ];
  assert.equal(resolveVersionId(versions, `sha-${exactSha}`), apiVersion);
  assert.throws(() => resolveVersionId(versions, "missing"), /exactly one/);
  assert.throws(
    () => resolveVersionId([...versions, versions[0]], `sha-${exactSha}`),
    /exactly one/,
  );
});

function eventFor(environment) {
  const production = environment === "production";
  return {
    event_name: "workflow_dispatch",
    ref: production ? "refs/heads/main" : "refs/heads/develop",
    sha: exactSha,
    inputs: {
      delivery_environment: environment,
      reviewed_sha: exactSha,
      action_authority_url: evidence,
      estimated_cost_cents: "0",
      previous_api_version_id: apiVersion,
      previous_web_version_id: webVersion,
      confirmation: `DEPLOY ${environment} ${exactSha}`,
      staging_evidence_url: production ? evidence : "",
      backup_evidence_url: production ? evidence : "",
    },
  };
}

function authorizedManifest(environment) {
  const manifest = structuredClone(loadDeliveryManifest(repositoryRoot));
  manifest.status = "authorized";
  const record = manifest.environments[environment];
  record.state = "authorized";
  record.cost_ceiling_cents = 0;
  record.d1.database_id =
    environment === "staging"
      ? "33333333-3333-4333-8333-333333333333"
      : "44444444-4444-4444-8444-444444444444";
  record.routes.api = `https://api-${environment}.example.com`;
  record.routes.web = `https://web-${environment}.example.com`;
  record.authority_evidence_url = evidence;
  record.resource_manifest_evidence_url = evidence;
  record.rollback_rehearsal_url = evidence;
  record.authorization_expires_at = "2026-08-23T00:00:00Z";
  if (environment === "production") {
    record.staging_evidence_url = evidence;
    record.backup_evidence_url = evidence;
  }
  return manifest;
}
