import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  inspectFinalEvidenceScripts,
  inspectTransitionRecord,
  inspectTransitionVisual,
  validateFinalEvidence,
} from "./voc080-final-evidence-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const readJson = (relative) =>
  JSON.parse(readFileSync(resolve(repositoryRoot, relative), "utf8"));
const record = readJson("docs/operations/voc-080-transition-record.json");
const retirement = readJson(
  "infrastructure/cloudflare/server-retirement-manifest.json",
);
const delivery = readJson("infrastructure/cloudflare/delivery-manifest.json");
const visual = readFileSync(
  resolve(repositoryRoot, "docs/operations/voc-080-architecture.html"),
  "utf8",
);

const clone = (value) => structuredClone(value);

test("the complete VOC-080 repository transition evidence is internally consistent", () => {
  assert.deepEqual(validateFinalEvidence(repositoryRoot), []);
});

test("task omissions and exact-revision drift fail closed", () => {
  const missing = clone(record);
  missing.tasks.pop();
  assert.ok(
    inspectTransitionRecord(missing, retirement, delivery).some((error) =>
      error.includes("exactly T00 through T11"),
    ),
  );
  const stale = clone(record);
  stale.tasks[8].exact_sha = "0".repeat(40);
  assert.ok(
    inspectTransitionRecord(stale, retirement, delivery).some((error) =>
      error.includes("T08 exact revision"),
    ),
  );
});

test("activation, live queries, and unreviewed self evidence fail closed", () => {
  const activated = clone(record);
  activated.action_holds["VOC-080-HOLD-00"].status = "released";
  activated.live_activation.live_cloudflare_state_queried = true;
  activated.t12_closure_evidence.exact_sha = "0".repeat(40);
  const errors = inspectTransitionRecord(activated, retirement, delivery);
  assert.ok(errors.some((error) => error.includes("HOLD-00")));
  assert.ok(
    errors.some((error) => error.includes("live_cloudflare_state_queried")),
  );
  assert.ok(errors.some((error) => error.includes("exact_sha")));
});

test("delivery activation and parity-manifest drift fail closed", () => {
  const activated = clone(delivery);
  activated.environments.production.state = "active";
  assert.ok(
    inspectTransitionRecord(record, retirement, activated).some((error) =>
      error.includes("production delivery"),
    ),
  );
  const drifted = clone(retirement);
  drifted.parity_evidence.data_conversion = "0".repeat(40);
  assert.ok(
    inspectTransitionRecord(record, drifted, delivery).some((error) =>
      error.includes("T09 differs"),
    ),
  );
});

test("the architecture visual is self-contained and evidence-bound", () => {
  assert.deepEqual(inspectTransitionVisual(visual, record), []);
  assert.ok(
    inspectTransitionVisual(
      visual.replace(
        "</body>",
        '<script src="https://example.test/app.js"></script></body>',
      ),
      record,
    ).some((error) => error.includes("external resources")),
  );
  assert.ok(
    inspectTransitionVisual(
      visual.replace('id="transition-evidence"', 'id="missing-evidence"'),
      record,
    ).some((error) => error.includes("embedded transition evidence")),
  );
});

test("the foundation aggregate cannot omit final evidence validation", () => {
  const valid = JSON.stringify({
    scripts: {
      "ci:foundation": "pnpm run ci:retirement && pnpm run ci:final-evidence",
      "ci:final-evidence":
        "node scripts/foundation/voc080-final-evidence-policy.mjs",
    },
  });
  assert.deepEqual(inspectFinalEvidenceScripts(valid), []);
  assert.ok(
    inspectFinalEvidenceScripts(
      valid.replace(" && pnpm run ci:final-evidence", ""),
    ).some((error) => error.includes("ci:foundation")),
  );
  assert.ok(
    inspectFinalEvidenceScripts(valid.replace("voc080-final-evidence", "noop"))
      .length > 0,
  );
});
