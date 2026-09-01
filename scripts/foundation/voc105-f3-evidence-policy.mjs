import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectF2Scripts } from "./voc081-f2-evidence-policy.mjs";

const RECORD = "docs/operations/voc-105-f3-evidence.json";
const NARRATIVE = "docs/operations/voc-105-f3-evidence.md";
const SURFACES = [
  "docs/README.md",
  "docs/product/README.md",
  "docs/product/12-mvp-implementation-plan.md",
  "docs/operations/README.md",
  "docs/operations/voc-081-f2-evidence.md",
  "docs/operations/voc-081-f2-evidence.json",
  "docs/operations/cloudflare-delivery.md",
  NARRATIVE,
];

const GATE_ITEMS = [
  "isolated-staging-resources",
  "privacy-safe-observability",
  "compatible-d1-migrations",
  "exact-version-delivery",
  "bounded-staging-smoke",
  "rollback-baseline-and-rehearsal",
  "standard-environment-protection",
  "external-phase-closure",
  "successful-current-delivery",
];
const GATE_EVIDENCE = new Map([
  [
    "isolated-staging-resources",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "privacy-safe-observability",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "compatible-d1-migrations",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "exact-version-delivery",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "bounded-staging-smoke",
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
  ],
  [
    "rollback-baseline-and-rehearsal",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438014817",
  ],
  [
    "standard-environment-protection",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  ],
  [
    "external-phase-closure",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5438136312",
  ],
  [
    "successful-current-delivery",
    "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5477915272",
  ],
]);

function get(root, relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function requireEqual(errors, actual, expected, label) {
  if (actual !== expected)
    errors.push(`${label}: expected ${JSON.stringify(expected)}`);
}

export function inspectF3Evidence(root) {
  const errors = [];
  let record;
  try {
    record = JSON.parse(get(root, RECORD));
  } catch (error) {
    return [`${RECORD}: invalid JSON (${error.message})`];
  }

  requireEqual(
    errors,
    record.schema_version,
    "vocanova-voc105-f3-v1",
    "schema_version",
  );
  requireEqual(
    errors,
    record.status,
    "f3-staging-foundation-complete-effective",
    "status",
  );
  requireEqual(
    errors,
    record.package,
    "specs/changes/VOC-105-f3-current-documentation-reconciliation",
    "package",
  );
  requireEqual(
    errors,
    record.milestone_gate?.decision,
    record.status,
    "milestone_gate.decision",
  );
  if (
    !Array.isArray(record.milestone_gate?.missing_evidence) ||
    record.milestone_gate.missing_evidence.length
  )
    errors.push(
      "milestone_gate.missing_evidence: complete gate requires an empty array",
    );
  requireEqual(
    errors,
    record.milestone_gate?.f2_dependency?.status,
    "complete-effective",
    "F2 status",
  );
  requireEqual(
    errors,
    record.milestone_gate?.f2_dependency?.pull_request,
    "https://github.com/KARSIFT/vocanova-platform/pull/108",
    "F2 PR",
  );
  requireEqual(
    errors,
    record.milestone_gate?.f2_dependency?.merge_sha,
    "36d526bdec83e28b17aa30a6814d42b92f058ec1",
    "F2 merge SHA",
  );

  const items = record.milestone_gate?.items;
  if (!Array.isArray(items))
    errors.push("milestone_gate.items: expected array");
  else {
    requireEqual(errors, items.length, GATE_ITEMS.length, "gate item count");
    for (const id of GATE_ITEMS) {
      const matches = items.filter((item) => item?.id === id);
      if (matches.length !== 1)
        errors.push(`gate item ${id}: expected exactly once`);
      else {
        requireEqual(
          errors,
          matches[0].status,
          "validated",
          `gate item ${id} status`,
        );
        requireEqual(
          errors,
          matches[0].evidence,
          GATE_EVIDENCE.get(id),
          `gate item ${id} evidence`,
        );
      }
    }
  }

  const event = record.delivery_event ?? {};
  requireEqual(errors, event.workflow, "CI", "delivery workflow");
  requireEqual(errors, event.run_id, 33386240492, "delivery run");
  requireEqual(errors, event.attempt, 1, "delivery attempt");
  requireEqual(
    errors,
    event.event_sha,
    "03528a84988ebe664207c6a439e133070627c92a",
    "delivery SHA",
  );
  requireEqual(
    errors,
    event.url,
    "https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492",
    "delivery URL",
  );
  for (const key of ["required", "delivery_gate", "staging_job"])
    requireEqual(errors, event[key], "success", key);
  for (const key of [
    "migration",
    "immutable_upload",
    "exact_promotion",
    "bounded_smoke",
    "sanitized_outcome",
  ])
    requireEqual(errors, event.steps?.[key], "success", `delivery step ${key}`);
  requireEqual(
    errors,
    event.steps?.rollback_after_promotion_failure,
    "skipped-expected",
    "rollback outcome",
  );
  requireEqual(
    errors,
    event.production_job,
    "skipped-held",
    "production outcome",
  );

  const settings = record.settings_contract ?? {};
  const settingsExpected = {
    delivery_controls_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/175",
    settings_truth_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/179",
    credential_policy_pull_request:
      "https://github.com/KARSIFT/vocanova-platform/pull/178",
    sanitized_readback:
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5471376705",
  };
  for (const [key, value] of Object.entries(settingsExpected))
    requireEqual(errors, settings[key], value, `settings contract ${key}`);

  const later = record.later_boundaries ?? {};
  const laterExpected = {
    a1_authenticated_product_acceptance: "unresolved",
    p1_plus_product_acceptance: "unresolved",
    production_readiness: "held",
    production_traffic: "held",
    public_launch: "unresolved-held",
    learner_data: "held",
  };
  for (const [key, value] of Object.entries(laterExpected))
    requireEqual(errors, later[key], value, key);
  if (
    JSON.stringify(later.inherited_holds) !==
    JSON.stringify(["VOC-080-HOLD-01", "VOC-080-HOLD-02"])
  )
    errors.push("inherited holds: expected exact HOLD-01/HOLD-02 boundary");

  requireEqual(
    errors,
    record.historical_boundary?.packages,
    "VOC-094-through-VOC-104-immutable",
    "historical package boundary",
  );
  requireEqual(
    errors,
    record.historical_boundary
      ?.later_evidence_supersedes_prospective_pending_language,
    true,
    "historical supersession boundary",
  );
  requireEqual(
    errors,
    record.external_effects_by_voc105,
    "none-repository-only",
    "VOC-105 external effects",
  );

  const narrativeText = get(root, NARRATIVE);
  const recordText = `${JSON.stringify(record)}\n${narrativeText}`;
  if (
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i.test(
      recordText,
    )
  )
    errors.push(
      "record: immutable Worker-version UUID disclosure is prohibited",
    );
  if (
    /\b(?:api[_-]?token|secret)["']?\s*[:=]\s*["'][^"']{8,}/i.test(recordText)
  )
    errors.push("record: token or secret value disclosure is prohibited");

  for (const file of SURFACES) {
    let text;
    try {
      text = get(root, file);
    } catch {
      errors.push(`${file}: missing designated active surface`);
      continue;
    }
    if (
      !/F3[\s\S]{0,160}complete-effective|complete-effective[\s\S]{0,160}F3/i.test(
        text,
      )
    )
      errors.push(`${file}: missing current F3 complete-effective statement`);
    if (
      !/A1[\s\S]{0,180}(?:unresolved|separate|not included|not claim)/i.test(
        text,
      )
    )
      errors.push(`${file}: missing A1 boundary`);
    if (!/VOC-080-HOLD-01/.test(text) || !/VOC-080-HOLD-02/.test(text))
      errors.push(`${file}: missing inherited hold boundary`);
    if (
      /F3(?:\/staging)?[^\n]{0,100}(?:remains?|is|are) (?:unresolved|held)/i.test(
        text,
      )
    )
      errors.push(`${file}: stale current F3 unresolved/held wording`);
    if (
      /A1[^\n]{0,60}(?:complete-effective|accepted)|P1\+[^\n]{0,60}(?:complete-effective|accepted)/i.test(
        text,
      )
    )
      errors.push(`${file}: later milestone acceptance claim is prohibited`);
    if (
      /VOC-080-HOLD-0[12][^\n]{0,60}(?:\bis (?:released|resolved|closed)\b|\bhas been (?:released|resolved|closed)\b)/i.test(
        text,
      )
    )
      errors.push(`${file}: inherited hold release claim is prohibited`);
  }

  const narrative = narrativeText;
  for (const marker of [
    "33386240492",
    "03528a84988ebe664207c6a439e133070627c92a",
    "skipped-expected",
    "skipped-held",
    "VOC-094 through VOC-104 remain immutable",
  ])
    if (!narrative.includes(marker))
      errors.push(`${NARRATIVE}: missing ${marker}`);
  if (
    /\b(?:deploy|dispatch|migrate|promote) (?:now|the|to staging)/i.test(
      narrative,
    )
  )
    errors.push(`${NARRATIVE}: direct live-action instruction is prohibited`);

  let packageJson;
  try {
    packageJson = JSON.parse(get(root, "package.json"));
  } catch (error) {
    errors.push(`package.json: ${error.message}`);
    return errors;
  }
  requireEqual(
    errors,
    packageJson.scripts?.["ci:f3-evidence"],
    "node scripts/foundation/voc105-f3-evidence-policy.mjs",
    "ci:f3-evidence script",
  );
  errors.push(...inspectF2Scripts(JSON.stringify(packageJson)));
  const segments = (packageJson.scripts?.["ci:foundation"] ?? "")
    .split("&&")
    .map((part) => part.trim());
  if (
    segments.filter((part) => part === "pnpm run ci:f3-evidence").length !== 1
  )
    errors.push("ci:foundation: expected exact ci:f3-evidence segment once");
  const settingsIndex = segments.indexOf("pnpm run ci:settings-truth");
  if (
    segments[settingsIndex + 1] !== "pnpm run ci:f3-evidence" ||
    segments[settingsIndex + 2] !== "node --test scripts/foundation/*.test.mjs"
  )
    errors.push(
      "ci:foundation: ci:f3-evidence must occupy the governed extension slot",
    );
  return errors;
}

export function validateF3Evidence(root) {
  const errors = inspectF3Evidence(root);
  if (errors.length)
    throw new Error(
      `VOC-105 F3 evidence policy failed:\n- ${errors.join("\n- ")}`,
    );
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    validateF3Evidence(process.cwd());
    console.log("VOC-105 F3 evidence policy: PASS");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
