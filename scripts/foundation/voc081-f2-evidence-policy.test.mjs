import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  DESIGNATED_F2_SURFACES,
  F2_RECORD_PATH,
  PROHIBITED_ACTIVE_TEXT_CLAIMS,
} from "./voc081-f2-evidence-policy.mjs";
import {
  inspectF2Document,
  inspectF2Record,
  inspectF2Scripts,
  inspectF2Surface,
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

// This negative-test corpus is intentionally owned by the test module rather
// than generated from the validator's production patterns or examples.
const TEXT_VARIANT_CORPUS = [
  {
    example: "Staging is complete.",
    reason: "active F3/staging claim is prohibited",
  },
  {
    example: "P5 product acceptance passed.",
    reason: "active A1/P1+ acceptance claim is prohibited",
  },
  {
    example: "Production is active.",
    reason: "active production/deployment claim is prohibited",
  },
  {
    example: "Live verification passed.",
    reason: "active live-activation/verification claim is prohibited",
  },
  {
    example: "All VOC-080 holds are released.",
    reason: "VOC-080 hold release claim is prohibited",
  },
  {
    example: "Repository/local F2 is still pending integration.",
    reason: "active repository/local F2 pending claim is prohibited",
  },
];

function repositoryFixture(mutate) {
  const fixture = mkdtempSync(join(tmpdir(), "voc086-f2-evidence-"));
  cpSync(repositoryRoot, fixture, { recursive: true });
  try {
    mutate(fixture);
    return validateF2Evidence(fixture);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

test("the accepted VOC-081 repository/local F2 record is internally consistent", () => {
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

test("stale F2 status, later-gate release, or external effect fails closed", () => {
  const stale = clone(record);
  stale.status = "repository-local-f2-candidate-integration-pending";
  stale.milestone_state.f3_staging = "passed";
  stale.external_effects.deployment_performed = true;
  const errors = inspectF2Record(stale);
  assert.ok(errors.some((error) => error.includes("completion")));
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

test("every designated living F2 surface has a precise active contract", () => {
  for (const surface of DESIGNATED_F2_SURFACES) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    assert.deepEqual(inspectF2Surface(source, surface.path), []);

    for (const marker of surface.required) {
      const mutated = source.replace(
        marker,
        "__VOC086_REQUIRED_MARKER_REMOVED__",
      );
      assert.notEqual(mutated, source);
      const errors = inspectF2Surface(mutated, surface.path);
      assert.ok(
        errors.some((error) => error.includes("missing active F2 marker")),
        `${surface.path} must fail when marker ${marker} is removed`,
      );
    }

    for (const [marker, reason] of surface.stale) {
      const errors = inspectF2Surface(`${source}\n${marker}`, surface.path);
      assert.ok(
        errors.some((error) => error.includes(reason)),
        `${surface.path} must reject stale marker ${marker}`,
      );
    }
  }
});

test("every human-text surface rejects each contradictory active claim", () => {
  for (const surface of DESIGNATED_F2_SURFACES.filter(
    ({ path: surfacePath }) => surfacePath !== F2_RECORD_PATH,
  )) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    for (const claim of PROHIBITED_ACTIVE_TEXT_CLAIMS) {
      const errors = inspectF2Surface(
        `${source}\n${claim.example}`,
        surface.path,
      );
      assert.ok(
        errors.some((error) => error.includes(claim.reason)),
        `${surface.path} must reject ${claim.example}`,
      );
    }
  }
});

test("the independent text variant corpus fails on every human surface", () => {
  for (const surface of DESIGNATED_F2_SURFACES.filter(
    ({ path: surfacePath }) => surfacePath !== F2_RECORD_PATH,
  )) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    for (const variant of TEXT_VARIANT_CORPUS) {
      const errors = inspectF2Surface(
        `${source}\n${variant.example}`,
        surface.path,
      );
      assert.ok(
        errors.some((error) => error.includes(variant.reason)),
        `${surface.path} must reject independent variant ${variant.example}`,
      );
    }
  }
});

test("exact integration evidence fails closed one field at a time", () => {
  for (const field of [
    "pull_request",
    "final_head_sha",
    "merge_sha",
    "review_evidence",
    "hosted_evidence",
    "rollback_failure_evidence",
    "hosted_runs",
    "post_merge_runs",
  ]) {
    const malformed = clone(record);
    delete malformed.current_acceptance[field];
    assert.ok(
      inspectF2Record(malformed).some((error) =>
        error.includes("current acceptance evidence"),
      ),
      `missing current_acceptance.${field} must fail closed`,
    );
  }
});

test("later-gate promotion, hold release, and external effects fail independently", () => {
  for (const field of [
    "f3_staging",
    "a1_authenticated_product_acceptance",
    "p1_plus_product_acceptance",
    "production",
    "live_activation",
  ]) {
    const promoted = clone(record);
    promoted.milestone_state[field] = "passed";
    assert.ok(
      inspectF2Record(promoted).some((error) =>
        error.includes("milestone/hold"),
      ),
      `${field} promotion must fail closed`,
    );
  }

  const released = clone(record);
  released.milestone_state.voc080_holds.pop();
  assert.ok(
    inspectF2Record(released).some((error) => error.includes("milestone/hold")),
  );

  for (const field of [
    "cloudflare_queried_or_mutated",
    "dns_queried_or_mutated",
    "server_queried_or_mutated",
    "sentry_queried",
    "repository_settings_mutated",
    "secret_or_production_data_used",
    "deployment_performed",
    "deployment_url_expected",
  ]) {
    const effect = clone(record);
    effect.external_effects[field] = true;
    assert.ok(
      inspectF2Record(effect).some((error) =>
        error.includes(`external_effects.${field}`),
      ),
      `${field} must fail closed`,
    );
  }
});

test("malformed JSON and omitted designated surfaces fail through the aggregate", () => {
  for (const { path: surfacePath } of DESIGNATED_F2_SURFACES) {
    const missing = repositoryFixture((fixture) => {
      unlinkSync(join(fixture, surfacePath));
    });
    assert.ok(
      missing.some((error) =>
        error.includes(`${surfacePath}: designated F2 surface is missing`),
      ),
      `${surfacePath} omission must fail through the aggregate`,
    );
  }

  const malformed = repositoryFixture((fixture) => {
    writeFileSync(join(fixture, F2_RECORD_PATH), "{ malformed json\n");
  });
  assert.ok(
    malformed.some((error) =>
      error.includes(`${F2_RECORD_PATH}: cannot read valid JSON`),
    ),
  );
});

test("current and historical status conflation fails independently", () => {
  const pendingCurrent = clone(record);
  pendingCurrent.status = "repository-local-f2-candidate-integration-pending";
  assert.ok(
    inspectF2Record(pendingCurrent).some((error) =>
      error.includes("F2 task/status must report repository/local completion"),
    ),
  );

  const completedHistory = clone(record);
  completedHistory.candidate_history.status =
    "repository-local-f2-complete-effective";
  assert.ok(
    inspectF2Record(completedHistory).some((error) =>
      error.includes(
        "candidate-era status and condition must remain historical",
      ),
    ),
  );
});

test("the foundation aggregate cannot omit F2 evidence validation", () => {
  const foundationChain = [
    "pnpm run validate:workspace",
    "pnpm run format:check",
    "pnpm run build:packages",
    "pnpm run ci:retirement",
    "pnpm run ci:final-evidence",
    "pnpm run ci:f2-evidence",
    "pnpm run ci:closure-consistency",
    "pnpm run ci:settings-truth",
    "node --test scripts/foundation/*.test.mjs",
  ];
  const foundation = foundationChain.join(" && ");
  const valid = JSON.stringify({
    scripts: {
      "ci:foundation": foundation,
      "ci:f2-evidence": "node scripts/foundation/voc081-f2-evidence-policy.mjs",
    },
  });
  assert.deepEqual(inspectF2Scripts(valid), []);
  assert.ok(
    inspectF2Scripts(
      valid.replace("pnpm run ci:f2-evidence", "node noop"),
    ).some((error) => error.includes("exactly one executable")),
  );
  assert.ok(
    inspectF2Scripts(valid.replace("voc081-f2-evidence", "noop")).length > 0,
  );
  assert.ok(
    inspectF2Scripts(
      valid.replace(
        "pnpm run ci:f2-evidence",
        "pnpm run ci:f2-evidence && pnpm run ci:f2-evidence",
      ),
    ).some((error) => error.includes("exactly one executable")),
  );
  assert.ok(
    inspectF2Scripts(
      valid.replace("pnpm run ci:f2-evidence", "echo pnpm run ci:f2-evidence"),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
  assert.ok(
    inspectF2Scripts(
      valid.replace("pnpm run ci:f2-evidence", "# pnpm run ci:f2-evidence"),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
  assert.ok(
    inspectF2Scripts(
      valid.replace(
        "pnpm run ci:f2-evidence",
        "pnpm run ci:f2-evidence || true",
      ),
    ).some((error) => error.includes("|| fallback")),
  );
  assert.ok(
    inspectF2Scripts(
      JSON.stringify({
        scripts: {
          "ci:foundation": "# skipped && pnpm run ci:f2-evidence",
          "ci:f2-evidence":
            "node scripts/foundation/voc081-f2-evidence-policy.mjs",
        },
      }),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
  assert.ok(
    inspectF2Scripts(
      JSON.stringify({
        scripts: {
          "ci:foundation": "exit 0 && pnpm run ci:f2-evidence",
          "ci:f2-evidence":
            "node scripts/foundation/voc081-f2-evidence-policy.mjs",
        },
      }),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
  assert.ok(
    inspectF2Scripts(
      JSON.stringify({
        scripts: {
          "ci:foundation": `echo prefix && ${foundation} && echo suffix`,
          "ci:f2-evidence":
            "node scripts/foundation/voc081-f2-evidence-policy.mjs",
        },
      }),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
  const reordered = [...foundationChain];
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  assert.ok(
    inspectF2Scripts(
      JSON.stringify({
        scripts: {
          "ci:foundation": reordered.join(" && "),
          "ci:f2-evidence":
            "node scripts/foundation/voc081-f2-evidence-policy.mjs",
        },
      }),
    ).some((error) => error.includes("canonical ordered command chain")),
  );
});
