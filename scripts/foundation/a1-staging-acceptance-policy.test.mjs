import assert from "node:assert/strict";
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";

import {
  OPERATIONS_INDEX_PATH,
  REQUIRED_CHECK_IDS,
  REQUIRED_LATER_AUTHORITY_KEYS,
  RUNBOOK_PATH,
  inspectA1StagingAcceptance,
  validateA1StagingAcceptance,
} from "./a1-staging-acceptance-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const runbook = readFileSync(resolve(repositoryRoot, RUNBOOK_PATH), "utf8");
const operationsIndex = readFileSync(
  resolve(repositoryRoot, OPERATIONS_INDEX_PATH),
  "utf8",
);

test("live pending A1 template is complete, indexed, sanitized, and network-free", () => {
  assert.deepEqual(validateA1StagingAcceptance(repositoryRoot), []);
  const policySource = readFileSync(
    resolve(
      repositoryRoot,
      "scripts/foundation/a1-staging-acceptance-policy.mjs",
    ),
    "utf8",
  );
  assert.doesNotMatch(policySource, /\bfetch\s*\(/u);
  assert.doesNotMatch(policySource, /node:child_process/u);
});

test("missing, malformed, duplicate, and unindexed records fail closed", () => {
  const root = fixtureRoot();
  try {
    rmSync(resolve(root, RUNBOOK_PATH));
    assert.match(
      validateA1StagingAcceptance(root).join("\n"),
      /missing or unreadable/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }

  for (const [name, candidateRunbook, candidateIndex, pattern] of [
    [
      "unindexed",
      runbook,
      operationsIndex.replace(
        "(%61%31-%73taging-acceptance.md)",
        "(missing.md)",
      ),
      /exactly one A1 runbook link/u,
    ],
    [
      "duplicate-index",
      runbook,
      `${operationsIndex}\n${indexRow(operationsIndex)}`,
      /exactly one A1 runbook link/u,
    ],
    [
      "wrong-index-status",
      runbook,
      operationsIndex.replace(
        "pending-separate-authority; owner",
        "active; owner",
      ),
      /row is not exact/u,
    ],
    [
      "missing-block",
      runbook.replace("<!-- A1-STAGING-ACCEPTANCE-RECORD-BEGIN -->", ""),
      operationsIndex,
      /exactly one delimited/u,
    ],
    [
      "duplicate-block",
      `${runbook}\n${recordBlock(runbook)}`,
      operationsIndex,
      /exactly one delimited/u,
    ],
    [
      "malformed-json",
      mutateRecordText(runbook, (json) =>
        json.replace('"schema_version"', '"schema_version" "broken"'),
      ),
      operationsIndex,
      /JSON is invalid/u,
    ],
  ]) {
    const errors = inspectA1StagingAcceptance({
      runbook: candidateRunbook,
      operationsIndex: candidateIndex,
    });
    assert.match(errors.join("\n"), pattern, name);
  }
});

test("closed record schema, pending statuses, and exact binding fail one invariant at a time", () => {
  for (const mutate of [
    (record) => (record.schema_version = "wrong"),
    (record) => (record.record_status = "complete"),
    (record) => (record.a1_milestone_status = "accepted"),
    (record) => (record.external_effects_by_voc112 = "live"),
    (record) => (record.unreviewed = true),
    (record) => (record.exact_binding.exact_repository_sha = "PENDING_OTHER"),
    (record) => (record.exact_binding.workflow_run_id = "123"),
    (record) => (record.exact_binding.run_attempt = "1"),
    (record) => (record.exact_binding.action_authority_record = "missing"),
    (record) => (record.provider_status.google_oauth = "success"),
  ]) {
    assert.notDeepEqual(inspect(mutate), []);
  }
});

test("every required check, pending result, evidence, and procedure marker is enforced", () => {
  for (const id of REQUIRED_CHECK_IDS) {
    assert.match(
      inspect((record) => {
        record.checks = record.checks.filter((check) => check.id !== id);
      }).join("\n"),
      /exact ordered required IDs/u,
      id,
    );
    for (const field of ["result", "evidence"]) {
      assert.match(
        inspect((record) => {
          record.checks.find((check) => check.id === id)[field] = "success";
        }).join("\n"),
        new RegExp(`${id} ${field}`),
        `${id} ${field}`,
      );
    }
    assert.match(
      inspect((record) => {
        record.checks.find((check) => check.id === id).procedure =
          "A generic procedure without its required invariant markers.";
      }).join("\n"),
      /missing marker/u,
      `${id} marker`,
    );
  }
});

test("every later authority field and both ordered production holds remain pending", () => {
  for (const key of REQUIRED_LATER_AUTHORITY_KEYS) {
    assert.match(
      inspect((record) => {
        delete record.later_authority[key];
      }).join("\n"),
      /later_authority keys are not exact/u,
      key,
    );
    assert.match(
      inspect((record) => {
        record.later_authority[key] = "approved";
      }).join("\n"),
      new RegExp(key),
      `${key} pending`,
    );
  }
  for (const mutate of [
    (record) => record.production_holds.pop(),
    (record) => record.production_holds.reverse(),
    (record) => (record.production_holds[0].state = "released"),
  ])
    assert.match(inspect(mutate).join("\n"), /exact ordered held pair/u);
});

test("completion, live-result, secret, identity, and exact-run disclosures are rejected", () => {
  const cases = [
    ["A1 is complete-effective.", /completion claim/u],
    ["The staging Worker was deployed.", /live-result claim/u],
    ["The message has been received.", /live-result claim/u],
    ["Google is enabled.", /provider-enablement claim/u],
    ["Result: success.", /completed result/u],
    ["API key: syntheticvalue", /credential-like value/u],
    ["Bearer: syntheticvalue", /credential-like value/u],
    ["OAuth code = syntheticvalue", /credential-like value/u],
    ["Secret: syntheticvalue", /credential-like value/u],
    ["Personal contact is learner@example.test.", /email address/u],
    ["Personal identity: Synthetic Person", /personal identity data/u],
    ["Run ID: 12345678", /run or account identifier/u],
    ["Account ID = 87654321", /run or account identifier/u],
    ["Worker version 11111111-1111-4111-8111-111111111111.", /UUID/u],
    [
      "Exact SHA aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.",
      /exact repository SHA/u,
    ],
  ];
  for (const [addition, pattern] of cases) {
    const errors = inspectA1StagingAcceptance({
      runbook: `${runbook}\n${addition}`,
      operationsIndex,
    });
    assert.match(errors.join("\n"), pattern, addition);
  }
});

function inspect(mutate) {
  const record = parsedRecord();
  mutate(record);
  return inspectA1StagingAcceptance({
    runbook: replaceRecord(runbook, record),
    operationsIndex,
  });
}

function parsedRecord() {
  return JSON.parse(recordJson(runbook));
}

function recordJson(source) {
  return /A1-STAGING-ACCEPTANCE-RECORD-BEGIN -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- A1-STAGING-ACCEPTANCE-RECORD-END/u.exec(
    source,
  )[1];
}

function replaceRecord(source, record) {
  return mutateRecordText(source, () => JSON.stringify(record, null, 2));
}

function mutateRecordText(source, mutate) {
  const current = recordJson(source);
  return source.replace(current, mutate(current));
}

function recordBlock(source) {
  return /<!-- A1-STAGING-ACCEPTANCE-RECORD-BEGIN -->[\s\S]*?<!-- A1-STAGING-ACCEPTANCE-RECORD-END -->/u.exec(
    source,
  )[0];
}

function indexRow(source) {
  return source
    .split("\n")
    .find((line) => line.includes("(%61%31-%73taging-acceptance.md)"));
}

function fixtureRoot() {
  const root = mkdtempSync(resolve(tmpdir(), "vocanova-a1-policy-"));
  for (const path of [RUNBOOK_PATH, OPERATIONS_INDEX_PATH]) {
    const target = resolve(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(resolve(repositoryRoot, path), target);
  }
  return root;
}
