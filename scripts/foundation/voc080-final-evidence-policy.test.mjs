import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  inspectDeliveryState,
  inspectFinalEvidenceScripts,
  inspectTransitionRecord,
  inspectTransitionVisual,
  validateFinalEvidence,
} from "./voc080-final-evidence-policy.mjs";
import {
  inspectDeliveryWorkflow,
  validateDeliveryRepository,
} from "./cloudflare-delivery-policy.mjs";

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
const packageFiles = [
  "README.md",
  "change.yaml",
  "specification.md",
  "acceptance-criteria.md",
  "impact-analysis.md",
  "implementation-plan.md",
  "tasks.md",
  "test-plan.md",
  "release-plan.md",
];
const inspect = (candidateRecord = record, candidateDelivery = delivery) =>
  inspectTransitionRecord(
    candidateRecord,
    retirement,
    candidateDelivery,
    validateDeliveryRepository(repositoryRoot, candidateDelivery),
  );

test("the complete VOC-080 repository transition evidence is internally consistent", () => {
  assert.deepEqual(validateFinalEvidence(repositoryRoot), []);
});

test("legacy held evidence and only fully validated prepared staging are accepted", () => {
  assert.deepEqual(inspect(), []);
  const legacy = clone(delivery);
  legacy.status = "held";
  legacy.environments.staging.state = "held";
  assert.deepEqual(
    inspectTransitionRecord(record, retirement, legacy, [
      "ignored legacy drift",
    ]),
    [],
  );
  assert.match(
    inspectTransitionRecord(record, retirement, delivery).join("\n"),
    /complete Cloudflare delivery validator/,
  );
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
  const errors = inspect(activated);
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
    inspect(record, activated).some((error) =>
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

test("every unreviewed top-level/staging state combination fails closed", () => {
  for (const [top, staging] of [
    ["held", "prepared"],
    ["prepared", "held"],
    ["authorized", "authorized"],
    ["active", "active"],
    ["unknown", "unknown"],
  ]) {
    const candidate = clone(delivery);
    candidate.status = top;
    candidate.environments.staging.state = staging;
    assert.match(
      inspectDeliveryState(
        candidate,
        validateDeliveryRepository(repositoryRoot, candidate),
      ).join("\n"),
      /legacy held\/held or validated prepared\/prepared/,
      `${top}/${staging}`,
    );
  }
});

test("prepared staging composes with the complete manifest/config/workflow validator", () => {
  for (const [name, mutate, pattern] of [
    [
      "missing runtime binder",
      (candidate) =>
        delete candidate.environments.staging.prepared_runtime_binder,
      /runtime binder/,
    ],
    [
      "tuple digest drift",
      (candidate) => {
        candidate.environments.staging.prepared_runtime_binder.prepared_staging_tuple_sha256 =
          "0".repeat(64);
      },
      /tuple digest|canonicalization|manifest binding/,
    ],
    [
      "schema digest drift",
      (candidate) => {
        candidate.environments.staging.prepared_runtime_binder.contract_digests.api_envelope_schema_sha256 =
          "0".repeat(64);
      },
      /contract digest|manifest binding/,
    ],
    [
      "generic issue URL fallback",
      (candidate) => {
        candidate.environments.staging.resource_manifest_evidence_url =
          "https://github.com/KARSIFT/vocanova-platform/issues/158";
      },
      /dedicated canonical comments/,
    ],
    [
      "publisher self assertion",
      (candidate) => {
        candidate.environments.staging.prepared_runtime_binder.publisher_trust_root.login =
          "self-asserted";
      },
      /identity, registry, or limits/,
    ],
    [
      "body/envelope conflation",
      (candidate) => {
        candidate.environments.staging.prepared_runtime_binder.contract.record_body_schemas.act04_authority.properties.html_url =
          {
            type: "string",
          };
      },
      /self-asserted envelope|contract digest/,
    ],
    [
      "standing runtime evidence",
      (candidate) => {
        candidate.environments.staging.prepared_runtime_binder.runtime_evidence =
          {};
      },
      /without future evidence/,
    ],
    [
      "nonzero cost",
      (candidate) => {
        candidate.environments.staging.resources.incremental_vocanova_cost_cents = 1;
      },
      /resource, baseline, cost, privacy, or hold tuple/,
    ],
    [
      "paid plan",
      (candidate) => {
        candidate.environments.staging.resources.workers_plan = "Paid";
      },
      /resource, baseline, cost, privacy, or hold tuple/,
    ],
    [
      "production sentinel drift",
      (candidate) => {
        candidate.environments.production.routes.api =
          "https://api-prod.vocanova.site";
      },
      /production held environment or sentinel set/,
    ],
  ]) {
    const candidate = clone(delivery);
    mutate(candidate);
    const errors = inspect(record, candidate);
    assert.match(errors.join("\n"), pattern, name);
    assert.ok(
      errors.some((error) =>
        error.startsWith("prepared staging validation failed:"),
      ),
      `${name} bypassed complete-validator composition`,
    );
  }
});

test("prepared compatibility cannot conceal workflow or production-hold weakening", () => {
  const workflow = readFileSync(
    resolve(repositoryRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  assert.ok(
    inspectDeliveryWorkflow(
      workflow.replace(
        "Recheck live runtime binder before any secret-bearing step",
        "Skipped runtime binder recheck",
      ),
    ).some((error) => error.includes("Recheck live runtime binder")),
  );
  for (const hold of ["VOC-080-HOLD-01", "VOC-080-HOLD-02"]) {
    const weakened = clone(record);
    weakened.action_holds[hold].status = "released";
    assert.ok(
      inspect(weakened).some((error) => error.includes(hold)),
      hold,
    );
  }
});

test("VOC-097 reconciles every VOC-096 and VOC-094 package surface without rewriting history", () => {
  for (const packageName of [
    "VOC-094-f3-staging-activation",
    "VOC-096-voc094-dispatch-binder-transition",
  ]) {
    for (const filename of packageFiles) {
      const source = readFileSync(
        resolve(repositoryRoot, "specs/changes", packageName, filename),
        "utf8",
      );
      assert.match(
        source,
        /VOC-097|voc097_(?:validator_closure|reconciliation)/,
        `${packageName}/${filename}`,
      );
      assert.match(
        source,
        /29(?:-path| core paths)|corrected_core_path_count: 29|pr1_file_count: 29/,
        `${packageName}/${filename}`,
      );
      assert.match(
        source,
        /38 authorized\s+paths|total_authorized_path_count: 38/,
        `${packageName}/${filename}`,
      );
      const preservedHistoricalCount =
        packageName === "VOC-096-voc094-dispatch-binder-transition" &&
        filename === "change.yaml";
      if (!preservedHistoricalCount) {
        assert.doesNotMatch(
          source,
          /(?:27-file|27 files|exactly 27|all 27)/,
          `${packageName}/${filename}`,
        );
      }
    }
  }
  const change = readFileSync(
    resolve(
      repositoryRoot,
      "specs/changes/VOC-096-voc094-dispatch-binder-transition/change.yaml",
    ),
    "utf8",
  );
  assert.match(
    change,
    /Preserved as immutable FAIL history\. The next candidate makes PR1 exactly 27/,
  );
  for (const path of [
    "scripts/foundation/voc080-final-evidence-policy.mjs",
    "scripts/foundation/voc080-final-evidence-policy.test.mjs",
  ]) {
    assert.match(change, new RegExp(path.replaceAll(".", "\\.")));
  }
  for (const filename of [
    "acceptance-criteria.md",
    "implementation-plan.md",
    "tasks.md",
    "release-plan.md",
  ]) {
    const source = readFileSync(
      resolve(
        repositoryRoot,
        "specs/changes/VOC-094-f3-staging-activation",
        filename,
      ),
      "utf8",
    );
    assert.match(source, /29-path[\s\S]*38-authorized-path/, filename);
    assert.doesNotMatch(source, /exact 27-file|27-file PR1/, filename);
  }
});

test("VOC-099 reconciles every VOC-097 and VOC-098 lifecycle surface to completed repository-only authority", () => {
  const lifecycles = {
    "VOC-097-voc096-final-evidence-validator-closure": [
      "814c31deb893c5c72b80f3075c0905fc8ba8c9c5",
      "5443475414",
      "33103467324",
      "eligible: true",
      "reasons: []",
      "45590a0673937f4a9464b57393e026871678b3d4",
      "33103648900",
      "33103648876",
      "33103648935",
      "5443938338",
    ],
    "VOC-098-voc097-effectiveness-pr168-remediation": [
      "6545cbb968a03a7630ccd63de3023c6e6da23ccd",
      "5444345026",
      "33109750265",
      "eligible: true",
      "reasons: []",
      "10e9acf540b9af5ed85cc59a0e053900aec3c359",
      "33109968598",
      "33109968586",
      "33109968546",
      "5444428909",
    ],
  };
  for (const [packageName, facts] of Object.entries(lifecycles)) {
    for (const filename of packageFiles) {
      const source = readFileSync(
        resolve(repositoryRoot, "specs/changes", packageName, filename),
        "utf8",
      );
      for (const fact of facts)
        assert.ok(source.includes(fact), `${packageName}/${filename}: ${fact}`);
      assert.match(
        source,
        /repository-only|repository implementation|repository-implementation/i,
        `${packageName}/${filename}`,
      );
      assert.match(source, /external action|external-action/, filename);
      if (filename === "tasks.md") assert.doesNotMatch(source, /Status: draft/);
      if (filename === "change.yaml") {
        assert.doesNotMatch(source, /authority_effective: false/);
        assert.doesNotMatch(
          source,
          /repository_adoption_status: adopted-pending|^blocking_reasons:/m,
        );
      }
    }
  }
  const voc098Change = readFileSync(
    resolve(
      repositoryRoot,
      "specs/changes/VOC-098-voc097-effectiveness-pr168-remediation/change.yaml",
    ),
    "utf8",
  );
  for (const evidence of [
    "cde0f665031a212b51a45af541a4ebaff23e8f7a",
    "5443876203",
    "5443893558",
    "5443923705",
  ])
    assert.ok(voc098Change.includes(evidence), evidence);
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
