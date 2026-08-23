import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  inspectF2Document,
  inspectF2Record,
  inspectF2Scripts,
  validateF2Evidence,
} from "./voc081-f2-evidence-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const record = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "docs/operations/voc-081-f2-evidence.json"),
    "utf8",
  ),
);
const document = readFileSync(
  resolve(repositoryRoot, "docs/operations/voc-081-f2-evidence.md"),
  "utf8",
);
const clone = (value) => structuredClone(value);

test("the VOC-081 F2 candidate record is internally consistent", () => {
  assert.deepEqual(validateF2Evidence(repositoryRoot), []);
});

test("task omission, stale revision, or noncanonical evidence fails closed", () => {
  const missing = clone(record);
  missing.tasks.pop();
  assert.ok(
    inspectF2Record(missing).some((error) => error.includes("exactly T00")),
  );

  const stale = clone(record);
  stale.tasks[2].exact_sha = "0".repeat(40);
  assert.ok(
    inspectF2Record(stale).some((error) => error.includes("T02 exact")),
  );

  const foreign = clone(record);
  foreign.tasks[3].hosted_evidence = "https://example.test/evidence";
  assert.ok(
    inspectF2Record(foreign).some((error) =>
      error.includes("canonical pull request"),
    ),
  );
});

test("false F2 activation, later-gate release, or external effect fails closed", () => {
  const activated = clone(record);
  activated.status = "accepted";
  activated.milestone_state.f3_staging = "passed";
  activated.external_effects.deployment_performed = true;
  const errors = inspectF2Record(activated);
  assert.ok(errors.some((error) => error.includes("integration-pending")));
  assert.ok(errors.some((error) => error.includes("milestone/hold")));
  assert.ok(errors.some((error) => error.includes("deployment_performed")));
});

test("platform, local-state, command, and rollback drift fails closed", () => {
  const drifted = clone(record);
  drifted.local_contract.native_windows_verified = true;
  drifted.local_contract.developer_state = ".wrangler";
  drifted.validated_commands.pop();
  drifted.rollback.status = "skipped";
  const errors = inspectF2Record(drifted);
  assert.ok(errors.some((error) => error.includes("platform limitation")));
  assert.ok(errors.some((error) => error.includes("commands")));
  assert.ok(errors.some((error) => error.includes("rollback")));
});

test("the human record carries the exact boundary and limitation markers", () => {
  assert.deepEqual(inspectF2Document(document, record), []);
  assert.ok(
    inspectF2Document(
      document.replace(
        "Native Windows behavior is not claimed",
        "Windows passes",
      ),
      record,
    ).some((error) => error.includes("Native Windows")),
  );
});

test("the foundation aggregate cannot omit F2 evidence validation", () => {
  const valid = JSON.stringify({
    scripts: {
      "ci:foundation": "pnpm run ci:f2-evidence",
      "ci:f2-evidence": "node scripts/foundation/voc081-f2-evidence-policy.mjs",
    },
  });
  assert.deepEqual(inspectF2Scripts(valid), []);
  assert.ok(
    inspectF2Scripts(
      valid.replace("pnpm run ci:f2-evidence", "node noop"),
    ).some((error) => error.includes("ci:foundation")),
  );
  assert.ok(
    inspectF2Scripts(valid.replace("voc081-f2-evidence", "noop")).length > 0,
  );
});
