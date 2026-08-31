import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
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

const foundationPrefix = [
  "pnpm run validate:workspace",
  "pnpm run format:check",
  "pnpm run build:packages",
  "pnpm run ci:retirement",
  "pnpm run ci:final-evidence",
  "pnpm run ci:f2-evidence",
  "pnpm run ci:closure-consistency",
  "pnpm run ci:settings-truth",
];
const foundationTest = "node --test scripts/foundation/*.test.mjs";
const baselineDefinitions = {
  "validate:workspace": "node scripts/foundation/validate-workspace.mjs",
  "format:check":
    "prettier --check package.json pnpm-workspace.yaml eslint.config.js apps/web apps/api-worker packages scripts/foundation infrastructure docs/development.md",
  "build:packages":
    "tsc -b packages/api-client packages/design-tokens --pretty false",
  "ci:retirement": "node scripts/foundation/server-retirement-policy.mjs",
  "ci:final-evidence":
    "node scripts/foundation/voc080-final-evidence-policy.mjs",
  "ci:f2-evidence": "node scripts/foundation/voc081-f2-evidence-policy.mjs",
  "ci:closure-consistency":
    "node scripts/foundation/voc084-closure-consistency-policy.mjs",
  "ci:settings-truth":
    "node scripts/foundation/voc085-settings-truthfulness-policy.mjs",
};

function scriptFixture({ segments = foundationPrefix, scripts = {} } = {}) {
  return JSON.stringify({
    scripts: {
      ...baselineDefinitions,
      "ci:foundation": [...segments, foundationTest].join(" && "),
      ...scripts,
    },
  });
}

function assertScriptFailure(source, marker, message = marker) {
  const errors = inspectF2Scripts(source);
  assert.ok(
    errors.some((error) => error.includes(marker)),
    `${message}: ${errors.join(" | ")}`,
  );
}

test("the current, exact VOC-105, and two-extension foundation chains pass", () => {
  assert.deepEqual(inspectF2Scripts(scriptFixture()), []);
  assert.deepEqual(
    inspectF2Scripts(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:f3-evidence"],
        scripts: {
          "ci:f3-evidence":
            "node scripts/foundation/voc105-f3-evidence-policy.mjs",
        },
      }),
    ),
    [],
  );
  assert.deepEqual(
    inspectF2Scripts(
      scriptFixture({
        segments: [
          ...foundationPrefix,
          "pnpm run ci:first-check",
          "pnpm run ci:second-check",
        ],
        scripts: {
          "ci:first-check": "node scripts/foundation/alpha-policy.mjs",
          "ci:second-check": "node scripts/foundation/beta-two-policy.mjs",
        },
      }),
    ),
    [],
  );
});

test("every exact prefix segment is independently required once and in order", () => {
  for (const [index, segment] of foundationPrefix.entries()) {
    assertScriptFailure(
      scriptFixture({
        segments: foundationPrefix.filter((_, i) => i !== index),
      }),
      "must occur exactly once",
      `omitting ${segment}`,
    );
    assertScriptFailure(
      scriptFixture({
        segments: [
          ...foundationPrefix.slice(0, index + 1),
          segment,
          ...foundationPrefix.slice(index + 1),
        ],
      }),
      "must occur exactly once",
      `duplicating ${segment}`,
    );
  }
  for (let index = 0; index < foundationPrefix.length - 1; index += 1) {
    const swapped = [...foundationPrefix];
    [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
    assertScriptFailure(
      scriptFixture({ segments: swapped }),
      "prefix position",
      `swapping positions ${index + 1} and ${index + 2}`,
    );
  }
});

test("F2 direct execution, entry point, aliases, and bypasses fail closed", () => {
  const f2Index = foundationPrefix.indexOf("pnpm run ci:f2-evidence");
  const replaceF2 = (replacement) => {
    const segments = [...foundationPrefix];
    segments[f2Index] = replacement;
    return scriptFixture({ segments });
  };
  assertScriptFailure(replaceF2("node noop"), "exactly one executable");
  assertScriptFailure(
    scriptFixture({
      scripts: { "ci:f2-evidence": "node scripts/foundation/noop-policy.mjs" },
    }),
    "entry point is missing or drifted",
  );
  for (const replacement of [
    "echo pnpm run ci:f2-evidence",
    "# pnpm run ci:f2-evidence",
    "exit 0 && pnpm run ci:f2-evidence",
    "pnpm run ci:f2-evidence && echo suffix",
  ]) {
    assertScriptFailure(replaceF2(replacement), "prefix position", replacement);
  }
  assertScriptFailure(
    replaceF2("pnpm run ci:f2-evidence || true"),
    "|| fallback",
  );
  for (const alias of [
    "pnpm run ci:f2-evidence",
    "node scripts/foundation/voc081-f2-evidence-policy.mjs",
  ]) {
    assertScriptFailure(
      scriptFixture({ scripts: { "ci:alias-check": alias } }),
      "must not alias or mention",
      alias,
    );
  }
});

test("extension names, declarations, uniqueness, and placement fail closed", () => {
  for (const name of [
    "Upper",
    "under_score",
    "",
    "-leading",
    "trailing-",
    "double--hyphen",
  ]) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, `pnpm run ci:${name}`],
        scripts: { [`ci:${name}`]: "node scripts/foundation/valid-policy.mjs" },
      }),
      "extension name must use",
      name,
    );
  }
  assertScriptFailure(
    scriptFixture({
      segments: [...foundationPrefix, "pnpm run ci:unknown-check"],
    }),
    "is not declared",
  );
  assertScriptFailure(
    scriptFixture({
      segments: [
        ...foundationPrefix,
        "pnpm run ci:repeat-check",
        "pnpm run ci:repeat-check",
      ],
      scripts: {
        "ci:repeat-check": "node scripts/foundation/repeat-policy.mjs",
      },
    }),
    "duplicate extension name",
  );
  const beforeSettings = [...foundationPrefix];
  beforeSettings.splice(7, 0, "pnpm run ci:early-check");
  assertScriptFailure(
    scriptFixture({
      segments: beforeSettings,
      scripts: { "ci:early-check": "node scripts/foundation/early-policy.mjs" },
    }),
    "prefix position 8",
  );
  const afterTest = JSON.parse(
    scriptFixture({
      scripts: { "ci:late-check": "node scripts/foundation/late-policy.mjs" },
    }),
  );
  afterTest.scripts["ci:foundation"] += " && pnpm run ci:late-check";
  assertScriptFailure(JSON.stringify(afterTest), "exact and terminal");
});

test("extension entry points are direct, canonical, distinct, and noncolliding", () => {
  const invalidDefinitions = [
    "node outside/example-policy.mjs",
    "node scripts/foundation/example-policy.js",
    "node scripts/foundation/example.mjs",
    "node scripts/foundation/Upper-policy.mjs",
    "node scripts/foundation/under_score-policy.mjs",
    "node scripts/foundation/double--token-policy.mjs",
    "node scripts/foundation/example-policy.mjs argument",
    "pnpm run ci:other-check",
    "node scripts/foundation/example-policy.mjs && echo compound",
    "node scripts/foundation/example-policy.mjs # comment",
    "node scripts/foundation/example-policy.mjs; echo compound",
    "pnpm run ci:foundation",
  ];
  for (const definition of invalidDefinitions) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:example-check"],
        scripts: { "ci:example-check": definition },
      }),
      "one direct canonical foundation policy entry point",
      definition,
    );
  }
  assertScriptFailure(
    scriptFixture({
      segments: [
        ...foundationPrefix,
        "pnpm run ci:first-check",
        "pnpm run ci:second-check",
      ],
      scripts: {
        "ci:first-check": "node scripts/foundation/shared-policy.mjs",
        "ci:second-check": "node scripts/foundation/shared-policy.mjs",
      },
    }),
    "entry point must be unique",
  );
  for (const [baselineName, definition] of Object.entries(
    baselineDefinitions,
  ).filter(([name]) => name !== "ci:f2-evidence")) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:collision-check"],
        scripts: { "ci:collision-check": definition },
      }),
      `collides with baseline script ${baselineName}`,
      `entry-point collision with ${baselineName}`,
    );
  }
  for (const baselineName of Object.keys(baselineDefinitions).filter(
    (name) => name !== "ci:f2-evidence",
  )) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, `pnpm run ${baselineName}`],
      }),
      `extension name collides with baseline script ${baselineName}`,
      `name collision with ${baselineName}`,
    );
  }
});

test("malformed input and shell-control syntax fail without execution", () => {
  assertScriptFailure("{ malformed", "cannot parse");
  assertScriptFailure(
    JSON.stringify({ scripts: [] }),
    "scripts must be an object",
  );
  assertScriptFailure(
    scriptFixture({ scripts: { "ci:bad-type": 42 } }),
    "must be a string",
  );
  const controls = [
    "",
    "echo; true",
    "echo\ntrue",
    "echo > output",
    "echo < input",
    "echo & true",
    "echo # comment",
    "echo $(uname)",
    "echo `uname`",
  ];
  for (const control of controls) {
    const source = JSON.parse(scriptFixture());
    source.scripts["ci:foundation"] = [
      ...foundationPrefix,
      control,
      foundationTest,
    ].join(" && ");
    assertScriptFailure(
      JSON.stringify(source),
      control === "" ? "empty command segment" : "prohibited shell-control",
      JSON.stringify(control),
    );
  }
  const sentinel = join(tmpdir(), `voc109-no-exec-${process.pid}`);
  rmSync(sentinel, { force: true });
  assertScriptFailure(
    scriptFixture({
      segments: [...foundationPrefix, "pnpm run ci:unsafe-check"],
      scripts: {
        "ci:unsafe-check": `node -e \"require('fs').writeFileSync('${sentinel}','bad')\"`,
      },
    }),
    "one direct canonical foundation policy entry point",
  );
  assert.equal(existsSync(sentinel), false);
});
