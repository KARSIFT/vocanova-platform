import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const F2_RECORD_PATH = "docs/operations/voc-081-f2-evidence.json";
export const F2_DOCUMENT_PATH = "docs/operations/voc-081-f2-evidence.md";

const EXPECTED_WORKFLOWS = [
  "ci.yml",
  "governance.yml",
  "quality.yml",
  "security.yml",
];

const EXPECTED_TASKS = [
  ["VOC-081-T00", "9b0e90fcd89469763c9874a5b0ef951e4d76149d", 103],
  ["VOC-081-T01", "aae4473d1072517b40e42bbb0dc4e992c37c16b5", 104],
  ["VOC-081-T02", "38d8c27b64557e8e8bc58bb05ea3c2cd858e1136", 106],
  ["VOC-081-T03", "ca7596cb72128e5fa47483a65678773a6968dd79", 107],
];

const EXPECTED_FINAL_HEAD = "a8694932671ad9c44fd2a97c128b14e6089e5faf";
const EXPECTED_MERGE = "36d526bdec83e28b17aa30a6814d42b92f058ec1";
const EXPECTED_PR = "https://github.com/KARSIFT/vocanova-platform/pull/108";
const EXPECTED_REVIEW = `${EXPECTED_PR}#issuecomment-5383790286`;
const EXPECTED_HOSTED_EVIDENCE = `${EXPECTED_PR}#issuecomment-5385582178`;
const EXPECTED_ROLLBACK_EVIDENCE = `${EXPECTED_PR}#issuecomment-5383822937`;
const EXPECTED_HOSTED_RUNS = {
  ci: 32612887965,
  governance: 32634344456,
  quality: 32612888017,
  security: 32612888012,
};
const EXPECTED_POST_MERGE_RUNS = {
  ci: 32634654242,
  governance: 32634654225,
  quality: "not-applicable-push-path-filter",
  security: 32634654343,
};

const EXPECTED_FOUNDATION_PREFIX = [
  "pnpm run validate:workspace",
  "pnpm run format:check",
  "pnpm run build:packages",
  "pnpm run ci:retirement",
  "pnpm run ci:final-evidence",
  "pnpm run ci:f2-evidence",
  "pnpm run ci:closure-consistency",
  "pnpm run ci:settings-truth",
];

const EXPECTED_FOUNDATION_TEST = "node --test scripts/foundation/*.test.mjs";
const F2_SCRIPT_NAME = "ci:f2-evidence";
const F2_ENTRY_POINT = "node scripts/foundation/voc081-f2-evidence-policy.mjs";
const EXPECTED_BASELINE_SCRIPTS = new Map([
  ["validate:workspace", "node scripts/foundation/validate-workspace.mjs"],
  [
    "format:check",
    "prettier --check package.json pnpm-workspace.yaml eslint.config.js apps/web apps/api-worker packages scripts/foundation infrastructure docs/development.md",
  ],
  [
    "build:packages",
    "tsc -b packages/api-client packages/design-tokens --pretty false",
  ],
  ["ci:retirement", "node scripts/foundation/server-retirement-policy.mjs"],
  [
    "ci:final-evidence",
    "node scripts/foundation/voc080-final-evidence-policy.mjs",
  ],
  [F2_SCRIPT_NAME, F2_ENTRY_POINT],
  [
    "ci:closure-consistency",
    "node scripts/foundation/voc084-closure-consistency-policy.mjs",
  ],
  [
    "ci:settings-truth",
    "node scripts/foundation/voc085-settings-truthfulness-policy.mjs",
  ],
]);
const CANONICAL_IDENTIFIER = "[a-z0-9]+(?:-[a-z0-9]+)*";
const EXTENSION_SEGMENT = new RegExp(`^pnpm run ci:(${CANONICAL_IDENTIFIER})$`);
const EXTENSION_ENTRY_POINT = new RegExp(
  `^node scripts/foundation/(${CANONICAL_IDENTIFIER})-policy\\.mjs$`,
);
const PROHIBITED_FOUNDATION_SYNTAX =
  /\|\||[;\n\r<>#`]|\$\(|(?:^|[^&])&(?:[^&]|$)/;

const POSITIVE_COMPLETION_VERBS = [
  "complete",
  "completed",
  "passed",
  "accepted",
  "active",
  "enabled",
  "released",
  "verified",
  "effective",
  "resolved",
];
const F3_COMPLETION_VERBS = POSITIVE_COMPLETION_VERBS.filter(
  (verb) => verb !== "verified",
);
const ACCEPTANCE_VERBS = [
  "complete",
  "completed",
  "passed",
  "accepted",
  "active",
  "effective",
  "resolved",
];
const HOLD_RELEASE_VERBS = [
  "released",
  "cleared",
  "lifted",
  "complete",
  "completed",
  "passed",
  "accepted",
  "active",
  "enabled",
  "effective",
  "resolved",
];
const expression = (terms) => terms.join("|");
const optionalIs = "(?:is\\s+)?";

export const PROHIBITED_ACTIVE_TEXT_CLAIMS = [
  {
    example: "F3 staging is complete.",
    pattern: new RegExp(
      `\\b(?:F3(?:\\s+staging)?|staging)\\s+${optionalIs}(?:${expression(F3_COMPLETION_VERBS)})\\b`,
      "i",
    ),
    reason: "active F3/staging claim is prohibited",
  },
  {
    example: "A1/P1 product acceptance passed.",
    pattern: new RegExp(
      `\\b(?:A1(?:\\/P1\\+?|\\s+authenticated-product)?|P1\\+?|P[2-5](?:-P5)?)\\s+(?:product\\s+)?acceptance\\s+${optionalIs}(?:${expression(ACCEPTANCE_VERBS)})\\b|\\b(?:R1|R2|L1)\\s+acceptance\\s+${optionalIs}(?:${expression(ACCEPTANCE_VERBS)})\\b`,
      "i",
    ),
    reason: "active A1/P1+ acceptance claim is prohibited",
  },
  {
    example: "production deployment completed.",
    pattern: new RegExp(
      `\\b(?:production\\s+)?deployment\\s+${optionalIs}(?:${expression(POSITIVE_COMPLETION_VERBS)})\\b|\\bproduction\\s+${optionalIs}(?:${expression(POSITIVE_COMPLETION_VERBS)})\\b`,
      "i",
    ),
    reason: "active production/deployment claim is prohibited",
  },
  {
    example: "live activation enabled.",
    pattern: new RegExp(
      `\\blive\\s+(?:activation|verification|system|service)\\s+${optionalIs}(?:${expression(POSITIVE_COMPLETION_VERBS)})\\b`,
      "i",
    ),
    reason: "active live-activation/verification claim is prohibited",
  },
  {
    example: "VOC-080-HOLD-00 released.",
    pattern: new RegExp(
      `\\b(?:all\\s+)?VOC-080\\s+holds?\\s+(?:(?:are|is)\\s+)?(?:${expression(HOLD_RELEASE_VERBS)})\\b|\\bVOC-080-HOLD-(?:00|01|02)\\s+${optionalIs}(?:${expression(HOLD_RELEASE_VERBS)})\\b`,
      "i",
    ),
    reason: "VOC-080 hold release claim is prohibited",
  },
  {
    example: "Repository/local F2 is still pending integration.",
    pattern:
      /\bRepository\/local\s+F2\s+(?:(?:is|remains)\s+)?(?:still\s+)?(?:pending(?:\s+integration)?|incomplete|candidate)\b/i,
    reason: "active repository/local F2 pending claim is prohibited",
  },
  ...[
    "product acceptance",
    "production readiness",
    "production traffic",
    "learner[-\\s]data access",
    "public launch",
  ].map((subject) => ({
    example: `${subject.replace("[-\\s]", "-")} is complete.`,
    pattern: new RegExp(
      `\\b${subject}\\s+${optionalIs}(?:${expression(POSITIVE_COMPLETION_VERBS)})\\b`,
      "i",
    ),
    reason: "active later-milestone boundary claim is prohibited",
  })),
];

const PRE_VOC105_MILESTONE_STATE = {
  f2_repository_local: "complete-effective",
  f3_staging: "unresolved-held",
  a1_authenticated_product_acceptance: "unresolved",
  p1_plus_product_acceptance: "unresolved",
  production: "held",
  live_activation: "unresolved-held",
  voc080_holds: ["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"],
};

const VOC105_MILESTONE_STATE = {
  f2_repository_local: "complete-effective",
  f3_staging: "complete-effective-under-voc-105-evidence",
  f3_current_evidence: "docs/operations/voc-105-f3-evidence.json",
  a1_authenticated_product_acceptance: "unresolved",
  p1_plus_product_acceptance: "unresolved",
  production: "held",
  live_activation: "unresolved-held",
  voc080_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
};

function normalizeAsciiWhitespace(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\n\f\v]+/g, " ")
    .replace(/^[ \t\n\f\v]+|[ \t\n\f\v]+$/g, "");
}

function exactJsonValue(value, expected) {
  if (Array.isArray(expected)) {
    return (
      Array.isArray(value) &&
      value.length === expected.length &&
      expected.every((entry, index) => exactJsonValue(value[index], entry))
    );
  }
  if (expected && typeof expected === "object") {
    return (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === Object.keys(expected).length &&
      Object.keys(expected).every(
        (key) =>
          Object.hasOwn(value, key) &&
          exactJsonValue(value[key], expected[key]),
      )
    );
  }
  return value === expected;
}

function currentProfile(record) {
  const milestones = record?.milestone_state;
  if (exactJsonValue(milestones, PRE_VOC105_MILESTONE_STATE))
    return "pre-voc105";
  if (exactJsonValue(milestones, VOC105_MILESTONE_STATE)) return "voc105";
  return null;
}

export const DESIGNATED_F2_SURFACES = [
  {
    path: "docs/README.md",
    profiles: {
      "pre-voc105": {
        required: [
          "[VOC-081's F2 record](operations/voc-081-f2-evidence.md)",
          "complete stack was integrated by PR #108 and passed post-merge revalidation",
          "repository/local F2 is complete and effective",
          "F3/staging, A1/P1+ acceptance",
          "production, deployment, live activation",
          "every inherited live-action hold\n  remain unresolved",
        ],
        prohibited: [
          "The current [VOC-105 record](operations/voc-105-f3-evidence.md) validates every DOC-12 gate item and reports F3 staging foundation complete-effective.",
        ],
      },
      voc105: {
        required: [
          "The current [VOC-105 record](operations/voc-105-f3-evidence.md) validates every DOC-12 gate item and reports F3 staging foundation complete-effective.",
          "A1/P1+ acceptance, production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
        ],
        prohibited: [
          "F3/staging, A1/P1+ acceptance, production, deployment, live activation, and every inherited live-action hold remain unresolved.",
        ],
      },
    },
    stale: [
      [
        "Its candidate state becomes effective only after integration and revalidation",
        "active index must not describe F2 as a candidate gate",
      ],
      [
        "candidate state becomes effective only after integration",
        "active index must not describe F2 as a candidate gate",
      ],
    ],
    prohibited: PROHIBITED_ACTIVE_TEXT_CLAIMS,
  },
  {
    path: "docs/operations/README.md",
    profiles: {
      "pre-voc105": {
        required: [
          "active (repository/local F2 complete)",
          "complete stack was integrated by PR #108 and passed post-merge",
          "repository/local F2 is complete and effective",
          "earlier integration-pending candidate state as history",
          "does not claim F3,",
          "A1/P1+ acceptance, staging, production, deployment, or live activation",
        ],
        prohibited: [
          "| RECORD | [VOC-105 F3 staging-foundation evidence](voc-105-f3-evidence.md) | active (F3 complete-effective) | operator | DOC-12, VOC-105 |",
        ],
      },
      voc105: {
        required: [
          "| RECORD | [VOC-105 F3 staging-foundation evidence](voc-105-f3-evidence.md) | active (F3 complete-effective) | operator | DOC-12, VOC-105 |",
          "The separate VOC-105 record validates every DOC-12 gate item and reports F3 staging foundation complete-effective.",
          "A1/P1+ acceptance remains unresolved and separate.",
          "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
          "VOC-105 later records the exact successful delivery event as one input to the complete F3 gate decision; it performs no new live action.",
        ],
        prohibited: [
          "The record preserves its earlier integration-pending candidate state as history and does not claim F3, A1/P1+ acceptance, staging, production, deployment, or live activation.",
        ],
      },
    },
    stale: [
      [
        "| candidate",
        "operations index must not label the active F2 record candidate",
      ],
      [
        "record is intentionally integration-pending",
        "operations index must not describe F2 as integration-pending",
      ],
    ],
    prohibited: PROHIBITED_ACTIVE_TEXT_CLAIMS,
  },
  {
    path: F2_DOCUMENT_PATH,
    profiles: {
      "pre-voc105": {
        required: [
          "This is the machine-checked active record",
          "Repository/local F2 is complete and effective",
          "## Exact integration evidence",
          "## Historical candidate state",
          "## No-live and later-gate state",
          "F3/staging, A1/P1+ acceptance, production, live",
          "remain unresolved/held",
        ],
        prohibited: [
          "The later [VOC-105 record](voc-105-f3-evidence.md) validates the separate F3 gate and reports F3 staging foundation complete-effective.",
        ],
      },
      voc105: {
        required: [
          "This F2 record does **not by itself** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, or a public launch.",
          "The later [VOC-105 record](voc-105-f3-evidence.md) validates the separate F3 gate and reports F3 staging foundation complete-effective.",
          "A1/P1+ acceptance remains unresolved; production, learner data, and launch remain held or unresolved under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
          "## No-live evidence and current later-gate state",
          "No command or evidence step in this F2 record queried or mutated Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.",
          "No F2 deployment occurred and no F2 deployment URL was expected.",
          "Later exact evidence in VOC-105 reports F3 staging foundation complete-effective.",
          "A1/P1+ acceptance remains unresolved; production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
        ],
        prohibited: [
          "This record does **not** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, a public launch, or a deployment.",
          "`VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held.",
          "## No-live and later-gate state",
          "No command or evidence step queries or mutates Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.",
          "No deployment occurred and no deployment URL is expected.",
          "F3/staging, A1/P1+ acceptance, production, live activation, and every inherited VOC-080 hold remain unresolved/held.",
        ],
      },
    },
    stale: [
      [
        "This is the machine-checked, integration-pending record",
        "F2 evidence document must not present the active record as pending",
      ],
    ],
    prohibited: PROHIBITED_ACTIVE_TEXT_CLAIMS,
  },
  {
    path: "docs/product/README.md",
    profiles: {
      "pre-voc105": {
        required: [
          "VOC-081 supplies the contributor-verifiable F2 foundation",
          "integrated by PR #108 and passed post-merge revalidation",
          "F2 complete and effective",
          "preserving the earlier candidate state as history",
          "F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain",
          "unresolved and are not implied",
        ],
        prohibited: [
          "The [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) separately validates every DOC-12 F3 gate item and reports the F3 staging foundation complete-effective.",
        ],
      },
      voc105: {
        required: [
          "The [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) separately validates every DOC-12 F3 gate item and reports the F3 staging foundation complete-effective.",
          "A1/P1+ acceptance remains unresolved and is a separate future outcome.",
          "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
        ],
        prohibited: [
          "F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain unresolved and are not implied.",
        ],
      },
    },
    stale: [
      [
        "remains integration-pending",
        "product index must not describe F2 as integration-pending",
      ],
      [
        "candidate, whose",
        "product index must not describe the active F2 record as a candidate",
      ],
    ],
    prohibited: PROHIBITED_ACTIVE_TEXT_CLAIMS,
  },
  {
    path: "docs/product/12-mvp-implementation-plan.md",
    profiles: {
      "pre-voc105": {
        required: [
          "PR #108 integrated the complete VOC-081 stack and final evidence",
          "Repository/local\nF2 is therefore complete and effective",
          "candidate-era state remains historical evidence",
          "F3 staging, A1/P1+",
          "product acceptance, production, deployment, live activation, and",
          "remain unresolved/held",
          "`VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held",
        ],
        prohibited: [
          "The current [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) validates every F3 gate item and reports the F3 staging foundation complete-effective.",
        ],
      },
      voc105: {
        required: [
          "The current [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) validates every F3 gate item and reports the F3 staging foundation complete-effective.",
          "A1/P1+ product acceptance remains unresolved and is a separate future outcome.",
          "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `HOLD-02` remain held.",
          "The later exact successful delivery event is recorded separately by VOC-105 and is only one input to its F3 gate decision.",
          "`VOC-080-HOLD-01` and `HOLD-02` remain fully unresolved and unchanged.",
          "VOC-105's separate gate evaluation reports F3 staging foundation complete-effective; the successful delivery run alone did not establish that result.",
          "A1/P1+ acceptance remains unresolved.",
          "Production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
        ],
        prohibited: [
          "At their remaining action boundaries, F3 staging, A1/P1+ product acceptance, production, deployment, live activation, and `VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held.",
          "F3, A1/P1+ acceptance beyond the Phase-1 resource/rollback proof, ordinary staging workflow delivery, production, and live product activation remain unresolved.",
        ],
      },
    },
    stale: [
      [
        "candidate becomes accepted only after",
        "DOC-12 must not retain the pre-integration acceptance gate",
      ],
      [
        "does not pass merely because those draft branches exist",
        "DOC-12 must not describe active F2 as draft-branch dependent",
      ],
      [
        "It becomes effective only after",
        "DOC-12 must not retain the pre-integration effectiveness gate",
      ],
    ],
    prohibited: PROHIBITED_ACTIVE_TEXT_CLAIMS,
  },
  {
    path: F2_RECORD_PATH,
    profiles: {
      "pre-voc105": { required: [] },
      voc105: { required: [] },
    },
    immutableRequired: [
      '"status": "repository-local-f2-complete-effective"',
      '"current_acceptance"',
      '"candidate_history"',
      '"milestone_state"',
    ],
    stale: [],
  },
];

const EXPECTED_COMMANDS = [
  "pnpm validate",
  "pnpm run ci:local-stack",
  "pnpm run ci:web",
  "pnpm run ci:worker-api",
  "pnpm run ci:delivery",
  "pnpm audit --audit-level high",
  "bash scripts/governance/validate-governance.sh",
  "bash scripts/governance/classify-change-risk.sh",
  "python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py'",
  "git diff --check",
];

export function inspectF2Record(record) {
  const errors = [];
  if (record?.schema_version !== "vocanova-voc081-f2-v2")
    errors.push("F2 record schema is invalid");
  if (
    record?.recorded_at_utc !== "2026-08-23T02:05:53Z" ||
    record?.acceptance_reconciled_on !== "2026-08-24"
  ) {
    errors.push("F2 candidate and acceptance record dates are invalid");
  }
  if (
    record?.task !== "VOC-081-T04" ||
    record?.status !== "repository-local-f2-complete-effective"
  ) {
    errors.push("F2 task/status must report repository/local completion");
  }
  if (
    record?.package?.path !==
      "specs/changes/VOC-081-f2-local-cloudflare-development" ||
    record?.package?.adoption_pr !== 102 ||
    record?.package?.adopted_candidate_sha !==
      "111323e5275b3ed2a2e86440ef087a44f0d00bde" ||
    record?.package?.adopted !== true ||
    record?.package?.implementation_authorized !== true
  ) {
    errors.push("F2 record does not bind the adopted VOC-081 package");
  }
  if (
    record?.repository_stack?.stack_base_sha !==
      "3d6699c5eb378b9a00679d61a5c28b6b7e27c32c" ||
    record?.repository_stack?.exact_implementation_sha !==
      EXPECTED_TASKS.at(-1)[1] ||
    record?.repository_stack?.final_evidence_sha !== EXPECTED_FINAL_HEAD ||
    record?.repository_stack?.verified_through_task !== "VOC-081-T04" ||
    record?.repository_stack?.integrated_by_pull_request !== 108 ||
    record?.repository_stack?.merge_sha !== EXPECTED_MERGE ||
    record?.repository_stack?.integrated_into_develop !== true
  ) {
    errors.push("F2 stack boundaries or integration evidence are invalid");
  }
  for (const field of [
    "merged_by_implementer",
    "production_promotion_performed",
  ]) {
    if (record?.repository_stack?.[field] !== false)
      errors.push(`repository_stack.${field} must remain false`);
  }

  const acceptance = record?.current_acceptance;
  if (
    acceptance?.scope !== "repository-local-f2-only" ||
    acceptance?.effective !== true ||
    acceptance?.pull_request !== EXPECTED_PR ||
    acceptance?.final_head_sha !== EXPECTED_FINAL_HEAD ||
    acceptance?.merge_sha !== EXPECTED_MERGE ||
    acceptance?.review_evidence !== EXPECTED_REVIEW ||
    acceptance?.hosted_evidence !== EXPECTED_HOSTED_EVIDENCE ||
    acceptance?.rollback_failure_evidence !== EXPECTED_ROLLBACK_EVIDENCE ||
    JSON.stringify(acceptance?.hosted_runs) !==
      JSON.stringify(EXPECTED_HOSTED_RUNS) ||
    JSON.stringify(acceptance?.post_merge_runs) !==
      JSON.stringify(EXPECTED_POST_MERGE_RUNS)
  ) {
    errors.push("F2 current acceptance evidence is incomplete or inaccurate");
  }
  if (
    JSON.stringify(record?.workflow_inventory) !==
    JSON.stringify(EXPECTED_WORKFLOWS)
  )
    errors.push("F2 record must name exactly the four workflows");

  if (
    record?.local_contract?.supported_process_platform !==
      "linux-and-unix-semantics" ||
    record?.local_contract?.native_windows_verified !== false ||
    record?.local_contract?.web_origin !== "http://127.0.0.1:3000" ||
    record?.local_contract?.api_origin !== "http://127.0.0.1:8080" ||
    record?.local_contract?.developer_state !==
      ".wrangler/state/vocanova-local" ||
    record?.local_contract?.test_state !==
      "fresh-os-temporary-directory-per-run" ||
    record?.local_contract?.remote_access !== false ||
    record?.local_contract?.credentials_required !== false
  ) {
    errors.push("F2 local contract or platform limitation is incomplete");
  }

  if (
    !Array.isArray(record?.tasks) ||
    record.tasks.length !== EXPECTED_TASKS.length
  ) {
    errors.push("F2 record must contain exactly T00 through T03");
  } else {
    for (const [index, [id, sha, pr]] of EXPECTED_TASKS.entries()) {
      const task = record.tasks[index];
      const canonicalPr = `https://github.com/KARSIFT/vocanova-platform/pull/${pr}`;
      if (task?.id !== id || task?.exact_sha !== sha)
        errors.push(`${id} exact revision is missing or out of order`);
      if (task?.pull_request !== canonicalPr)
        errors.push(`${id} pull request is not canonical`);
      for (const evidence of [task?.review_evidence, task?.hosted_evidence]) {
        if (
          typeof evidence !== "string" ||
          !evidence.startsWith(`${canonicalPr}#`)
        )
          errors.push(
            `${id} evidence must be bound to its canonical pull request`,
          );
      }
      if (task?.result !== "pass-exact-sha-zero-blockers")
        errors.push(`${id} must record exact-SHA PASS with zero blockers`);
    }
  }

  if (
    JSON.stringify(
      record?.validated_commands?.map(({ command }) => command),
    ) !== JSON.stringify(EXPECTED_COMMANDS) ||
    record?.validated_commands?.some(({ result }) => !result.startsWith("pass"))
  ) {
    errors.push("F2 validation commands or PASS results are incomplete");
  }

  if (
    record?.rollback?.mode !== "reverse-order-disposable-worktree" ||
    record?.rollback?.status !== "pass" ||
    record?.rollback?.expected_terminal_tree !==
      "3d6699c5eb378b9a00679d61a5c28b6b7e27c32c" ||
    record?.rollback?.live_system_effect !== false
  ) {
    errors.push("F2 rollback record is incomplete or unsafe");
  }

  if (!currentProfile(record)) {
    errors.push("F2 and later milestone/hold states are inaccurate");
  }
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
    if (record?.external_effects?.[field] !== false)
      errors.push(`external_effects.${field} must remain false`);
  }
  const history = record?.candidate_history;
  if (
    history?.status !== "repository-local-f2-candidate-integration-pending" ||
    !history?.effective_condition?.includes(
      "integrated into develop and revalidated",
    )
  ) {
    errors.push("F2 candidate-era status and condition must remain historical");
  }
  const closure = history?.t04_closure_evidence_in_candidate_revision;
  for (const field of [
    "exact_sha",
    "pull_request",
    "review_evidence",
    "hosted_evidence",
  ]) {
    if (closure?.[field] !== null)
      errors.push(
        `candidate_history.t04_closure_evidence_in_candidate_revision.${field} must remain null`,
      );
  }
  if (!closure?.reason?.includes("self-referential commit hash"))
    errors.push(
      "T04 candidate history must explain its self-reference boundary",
    );
  return errors;
}

export function inspectF2Surface(source, relativePath, profile = "pre-voc105") {
  const errors = [];
  const contract = DESIGNATED_F2_SURFACES.find(
    ({ path: surfacePath }) => surfacePath === relativePath,
  );
  if (!contract) return [`unknown designated F2 surface: ${relativePath}`];
  if (typeof source !== "string")
    return [`${relativePath}: designated F2 surface is not text`];
  const profileContract = contract.profiles?.[profile];
  if (!profileContract) {
    return [`${relativePath}: unknown current-state profile: ${profile}`];
  }
  const normalized = normalizeAsciiWhitespace(source);
  for (const marker of contract.immutableRequired ?? []) {
    if (!normalized.includes(normalizeAsciiWhitespace(marker)))
      errors.push(`${relativePath}: missing immutable F2 marker: ${marker}`);
  }
  for (const marker of profileContract.required ?? []) {
    const normalizedMarker = normalizeAsciiWhitespace(marker);
    const markerCount = normalized.split(normalizedMarker).length - 1;
    if (markerCount !== 1) {
      errors.push(
        `${relativePath}: current ${profile} marker must occur exactly once: ${marker}`,
      );
    }
  }
  for (const marker of profileContract.prohibited ?? []) {
    if (normalized.includes(normalizeAsciiWhitespace(marker))) {
      errors.push(
        `${relativePath}: prohibited ${profile} marker is present: ${marker}`,
      );
    }
  }
  for (const [marker, reason] of contract.stale) {
    if (source.includes(marker)) errors.push(`${relativePath}: ${reason}`);
  }
  let activeSource = source;
  if (relativePath === F2_DOCUMENT_PATH) {
    const historyStart = source.indexOf("\n## Historical candidate state");
    if (historyStart !== -1) {
      const nextHeading = source.indexOf("\n## ", historyStart + 1);
      activeSource =
        source.slice(0, historyStart) +
        (nextHeading === -1 ? "" : source.slice(nextHeading));
    }
  }
  activeSource = normalizeAsciiWhitespace(activeSource);
  if (profile === "voc105") {
    for (const marker of profileContract.required ?? []) {
      activeSource = activeSource.replace(normalizeAsciiWhitespace(marker), "");
    }
  }
  for (const { pattern, reason } of contract.prohibited ?? []) {
    if (pattern.test(activeSource)) errors.push(`${relativePath}: ${reason}`);
  }
  return errors;
}

export function inspectF2Document(source, record) {
  const errors = [];
  for (const marker of [
    "# VOC-081 F2 Repository/Local Evidence Record",
    "## Acceptance boundary",
    "## Exact integration evidence",
    "## Historical candidate state",
    "## Exact task evidence",
    "## Command and CI contract",
    "## Local shape and limitations",
    "## Rollback status",
    "Repository/local F2 is complete and effective",
    EXPECTED_FINAL_HEAD,
    EXPECTED_MERGE,
    "5383790286",
    "5385582178",
    "5383822937",
    ...Object.values(EXPECTED_HOSTED_RUNS).map(String),
    ...Object.values(EXPECTED_POST_MERGE_RUNS).map(String),
    "repository-local-f2-candidate-integration-pending",
    "Native Windows behavior is not claimed",
    ".wrangler/state/vocanova-local",
    "VOC-080-HOLD-01",
    "VOC-080-HOLD-02",
  ]) {
    if (!source.includes(marker)) errors.push(`F2 document missing: ${marker}`);
  }
  for (const task of record?.tasks ?? []) {
    if (!source.includes(task.exact_sha) || !source.includes(task.pull_request))
      errors.push(`${task.id} exact evidence is absent from the F2 document`);
  }
  return errors;
}

export function inspectF2Scripts(source) {
  let packageDocument;
  try {
    packageDocument = JSON.parse(source);
  } catch {
    return ["package.json: cannot parse F2 evidence script contract"];
  }
  const scripts = packageDocument?.scripts;
  const errors = [];
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) {
    return ["package.json: scripts must be an object"];
  }
  for (const [name, command] of Object.entries(scripts)) {
    if (typeof command !== "string")
      errors.push(`package.json: script ${name} must be a string`);
  }
  if (scripts[F2_SCRIPT_NAME] !== F2_ENTRY_POINT) {
    errors.push(
      "package.json: ci:f2-evidence entry point is missing or drifted",
    );
  }
  const foundationCommand = scripts?.["ci:foundation"];
  if (typeof foundationCommand !== "string") {
    errors.push("package.json: ci:foundation must be a command chain");
    return errors;
  }

  if (foundationCommand.includes("||")) {
    errors.push(
      "package.json: ci:foundation must not bypass F2 evidence with || fallback",
    );
  }
  if (PROHIBITED_FOUNDATION_SYNTAX.test(foundationCommand)) {
    errors.push(
      "package.json: ci:foundation contains prohibited shell-control syntax",
    );
  }

  const segments = foundationCommand
    .split("&&")
    .map((segment) => segment.trim());
  if (segments.some((segment) => segment.length === 0)) {
    errors.push(
      "package.json: ci:foundation contains an empty command segment",
    );
  }

  for (const [index, required] of EXPECTED_FOUNDATION_PREFIX.entries()) {
    if (segments[index] !== required) {
      errors.push(
        `package.json: ci:foundation prefix position ${index + 1} must be exactly ${required}`,
      );
    }
    const count = segments.filter((segment) => segment === required).length;
    if (count !== 1) {
      errors.push(
        `package.json: ci:foundation prefix segment ${required} must occur exactly once`,
      );
    }
  }
  if (segments.at(-1) !== EXPECTED_FOUNDATION_TEST) {
    errors.push(
      "package.json: foundation test command must be exact and terminal",
    );
  }
  if (
    segments.filter((segment) => segment === EXPECTED_FOUNDATION_TEST)
      .length !== 1
  ) {
    errors.push(
      "package.json: foundation test command must occur exactly once",
    );
  }

  const f2Segment = "pnpm run ci:f2-evidence";
  if (segments.filter((segment) => segment === f2Segment).length !== 1) {
    errors.push(
      "package.json: ci:foundation must contain exactly one executable F2 evidence command segment",
    );
  }

  const baselineNames = new Set(EXPECTED_BASELINE_SCRIPTS.keys());
  const baselineEntryPoints = new Map(
    [...EXPECTED_BASELINE_SCRIPTS].map(([name, definition]) => [
      definition,
      name,
    ]),
  );
  const extensionSegments = segments.slice(
    EXPECTED_FOUNDATION_PREFIX.length,
    Math.max(EXPECTED_FOUNDATION_PREFIX.length, segments.length - 1),
  );
  const extensionNames = new Set();
  const extensionEntryPoints = new Set();

  for (const segment of extensionSegments) {
    const baselineSegmentName = [...baselineNames].find(
      (name) => segment === `pnpm run ${name}`,
    );
    if (baselineSegmentName) {
      errors.push(
        `package.json: extension name collides with baseline script ${baselineSegmentName}`,
      );
    }
    const broadMatch = /^pnpm run ci:(.*)$/.exec(segment);
    if (!broadMatch) {
      errors.push(
        `package.json: extension segment is not a direct declared ci:* command: ${segment}`,
      );
      continue;
    }
    const fullName = `ci:${broadMatch[1]}`;
    if (baselineNames.has(fullName)) {
      errors.push(
        `package.json: extension name collides with baseline script ${fullName}`,
      );
    }
    const canonicalMatch = EXTENSION_SEGMENT.exec(segment);
    if (!canonicalMatch) {
      errors.push(
        `package.json: extension name must use lowercase alphanumeric single-hyphen tokens: ${fullName}`,
      );
      continue;
    }
    if (extensionNames.has(fullName)) {
      errors.push(`package.json: duplicate extension name ${fullName}`);
    }
    extensionNames.add(fullName);

    if (!Object.hasOwn(scripts, fullName)) {
      errors.push(`package.json: extension ${fullName} is not declared`);
      continue;
    }
    const definition = scripts[fullName];
    if (typeof definition !== "string") continue;
    const collidedBaseline = baselineEntryPoints.get(definition);
    if (collidedBaseline) {
      errors.push(
        `package.json: extension ${fullName} entry point collides with baseline script ${collidedBaseline}`,
      );
    }
    for (const baselineName of baselineNames) {
      if (definition.includes(`pnpm run ${baselineName}`)) {
        errors.push(
          `package.json: extension ${fullName} must not invoke or mention baseline script ${baselineName}`,
        );
      }
    }
    for (const [baselineDefinition, baselineName] of baselineEntryPoints) {
      if (
        typeof baselineDefinition === "string" &&
        baselineDefinition.length > 0 &&
        definition.includes(baselineDefinition)
      ) {
        errors.push(
          `package.json: extension ${fullName} must not invoke or mention baseline entry point ${baselineName}`,
        );
      }
    }
    const entryPointMatch = EXTENSION_ENTRY_POINT.exec(definition);
    if (!entryPointMatch) {
      errors.push(
        `package.json: extension ${fullName} must be one direct canonical foundation policy entry point`,
      );
      continue;
    }
    if (extensionEntryPoints.has(definition)) {
      errors.push(
        `package.json: extension entry point must be unique: ${definition}`,
      );
    }
    extensionEntryPoints.add(definition);
  }

  for (const [name, command] of Object.entries(scripts)) {
    if (
      name !== "ci:foundation" &&
      name !== F2_SCRIPT_NAME &&
      typeof command === "string" &&
      (command.includes("pnpm run ci:f2-evidence") ||
        command.includes("scripts/foundation/voc081-f2-evidence-policy.mjs"))
    ) {
      errors.push(
        `package.json: script ${name} must not alias or mention the F2 validator`,
      );
    }
  }
  return errors;
}

export function validateF2Evidence(repositoryRoot) {
  const errors = [];
  let record = {};
  try {
    record = JSON.parse(
      readFileSync(path.join(repositoryRoot, F2_RECORD_PATH), "utf8"),
    );
  } catch {
    errors.push(`${F2_RECORD_PATH}: cannot read valid JSON`);
  }
  const workflows = readdirSync(path.join(repositoryRoot, ".github/workflows"))
    .filter((entry) => entry.endsWith(".yml") || entry.endsWith(".yaml"))
    .sort();
  if (JSON.stringify(workflows) !== JSON.stringify(EXPECTED_WORKFLOWS))
    errors.push(
      "active workflow directory must contain exactly four workflows",
    );
  errors.push(...inspectF2Record(record));
  const profile = currentProfile(record);
  for (const { path: surfacePath } of DESIGNATED_F2_SURFACES) {
    const absolutePath = path.join(repositoryRoot, surfacePath);
    if (!existsSync(absolutePath)) {
      errors.push(`${surfacePath}: designated F2 surface is missing`);
      continue;
    }
    let source;
    try {
      source = readFileSync(absolutePath, "utf8");
    } catch {
      errors.push(`${surfacePath}: designated F2 surface cannot be read`);
      continue;
    }
    if (profile) errors.push(...inspectF2Surface(source, surfacePath, profile));
    if (surfacePath === F2_RECORD_PATH) continue;
    if (surfacePath === F2_DOCUMENT_PATH)
      errors.push(...inspectF2Document(source, record));
  }
  errors.push(
    ...inspectF2Scripts(
      readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    ),
  );
  return errors;
}

function repositoryRoot() {
  return path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateF2Evidence(repositoryRoot());
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log("VOC-081 F2 evidence validation passed.");
  }
}
