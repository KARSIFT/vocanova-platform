import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { validateServerRetirement } from "./server-retirement-policy.mjs";

export const TRANSITION_RECORD_PATH =
  "docs/operations/voc-080-transition-record.json";
export const TRANSITION_DOCUMENT_PATH =
  "docs/operations/voc-080-transition-record.md";
export const TRANSITION_VISUAL_PATH =
  "docs/operations/voc-080-architecture.html";

const EXPECTED_WORKFLOWS = [
  "ci.yml",
  "governance.yml",
  "quality.yml",
  "security.yml",
];

const EXPECTED_TASKS = [
  ["VOC-080-T00", "5b857fe4b8aa5a427165545aebfbb1f562771886", 87],
  ["VOC-080-T01", "b582b95e264e0c5c55ece02ad9aee0172347ef84", 88],
  ["VOC-080-T02", "d70f2308a3c03907c3ad2d8eb8797939a5e9ae59", 89],
  ["VOC-080-T03", "a82714639eeae6458ad3c3d027778c369e90ff5b", 90],
  ["VOC-080-T04", "6d68e20d4a1b5bb5a97fe5eb469dd6cd5ab5ee22", 91],
  ["VOC-080-T05", "f18c4dfb8bd95e675d58b22472a2fdbb4ebd7e42", 92],
  ["VOC-080-T06", "e44424a727aa9b548c561147188a220f6cfc7c67", 93],
  ["VOC-080-T07", "de2b3d0f4bf0105cb74d5abaa9a5ab826ee75dd1", 94],
  ["VOC-080-T08", "2bce45c1d22ce53eedcdabb457d9849a254a8069", 95],
  ["VOC-080-T09", "631899874d27839969895db0590a52524b9507ca", 96],
  ["VOC-080-T10", "203ac878d7a054de0826188924446e5d24a6dd43", 97],
  ["VOC-080-T11", "697bb1360c4df706ef05ff50d07e4b11b1b6b13b", 99],
];

const PARITY_TASKS = {
  "VOC-080-T03": "web_worker",
  "VOC-080-T04": "api_foundation",
  "VOC-080-T05": "identity_account",
  "VOC-080-T06": "content_review",
  "VOC-080-T07": "missions_progress",
  "VOC-080-T08": "ai_email_observability",
  "VOC-080-T09": "data_conversion",
  "VOC-080-T10": "held_delivery",
};

const LIVE_FALSE_FIELDS = [
  "live_cloudflare_state_queried",
  "live_server_state_queried",
  "dns_state_queried",
  "sentry_state_queried",
  "resource_created_or_mutated",
  "deployment_performed",
];

export function inspectTransitionRecord(record, retirement, delivery) {
  const errors = [];
  if (record?.schema_version !== "vocanova-voc080-transition-v1") {
    errors.push("transition record schema is invalid");
  }
  if (
    record?.task !== "VOC-080-T12" ||
    record?.status !== "repository-implementation-complete-live-activation-held"
  ) {
    errors.push("transition task/status is invalid");
  }
  if (
    record?.package?.path !==
      ["specs/changes/VOC-080-cloudflare-native", ["ru", "flo"].join("")].join(
        "-",
      ) ||
    record?.package?.adoption_pr !== 86 ||
    record?.package?.adopted_candidate_sha !==
      "6fb00a0b64e6f2d4adceb24a9caeffd9af98c779" ||
    record?.package?.adopted !== true ||
    record?.package?.implementation_authorized !== true
  ) {
    errors.push("transition record does not bind the adopted VOC-080 package");
  }
  if (
    record?.repository_stack?.stack_base_sha !==
      "399ccefa879545b43574c02fdc3babff223a1db0" ||
    record?.repository_stack?.verified_stack_tip_sha !==
      EXPECTED_TASKS.at(-1)[1]
  ) {
    errors.push("transition record stack boundaries are invalid");
  }
  for (const field of [
    "merged_by_implementer",
    "production_promotion_performed",
  ]) {
    if (record?.repository_stack?.[field] !== false) {
      errors.push(`repository_stack.${field} must remain false`);
    }
  }
  if (
    JSON.stringify(record?.workflow_inventory) !==
    JSON.stringify(EXPECTED_WORKFLOWS)
  ) {
    errors.push("transition record must name exactly the four workflows");
  }
  if (record?.architecture?.legacy_server_runtime_present !== false) {
    errors.push(
      "transition record must state that the legacy runtime is absent",
    );
  }
  for (const field of [
    "repository_local_launcher_present",
    "github_write_authority",
    "cloudflare_authority",
    "deployment_authority",
    "secret_or_production_data_authority",
    "spending_or_public_launch_authority",
  ]) {
    if (record?.orchestration_boundary?.[field] !== false) {
      errors.push(`orchestration_boundary.${field} must remain false`);
    }
  }
  if (record?.orchestration_boundary?.github_is_canonical !== true) {
    errors.push("GitHub must remain the canonical evidence layer");
  }
  for (const holdId of [
    "VOC-080-HOLD-00",
    "VOC-080-HOLD-01",
    "VOC-080-HOLD-02",
  ]) {
    if (record?.action_holds?.[holdId]?.status !== "held") {
      errors.push(`${holdId} must remain held`);
    }
  }
  for (const environment of ["staging", "production"]) {
    if (delivery?.environments?.[environment]?.state !== "held") {
      errors.push(`${environment} delivery manifest must remain held`);
    }
  }
  if (delivery?.status !== "held") {
    errors.push("delivery manifest status must remain held");
  }
  for (const field of LIVE_FALSE_FIELDS) {
    if (record?.live_activation?.[field] !== false) {
      errors.push(`live_activation.${field} must remain false`);
    }
  }
  errors.push(...inspectHostedSettings(record?.github_hosted_settings));
  errors.push(...inspectTaskEvidence(record?.tasks, retirement));
  const closure = record?.t12_closure_evidence;
  for (const field of [
    "exact_sha",
    "pull_request",
    "review_evidence",
    "hosted_evidence",
  ]) {
    if (closure?.[field] !== null) {
      errors.push(`t12_closure_evidence.${field} must remain null in Git`);
    }
  }
  if (!closure?.reason?.includes("self-referential commit hash")) {
    errors.push(
      "T12 closure evidence must explain its self-reference boundary",
    );
  }
  return errors;
}

function inspectHostedSettings(settings) {
  const errors = [];
  if (
    settings?.recorded_read_only !== true ||
    settings?.repository_private !== true ||
    settings?.default_branch !== "main"
  ) {
    errors.push("hosted settings snapshot identity/read-only state is invalid");
  }
  if (
    settings?.actions?.enabled !== true ||
    settings?.actions?.allowed_actions !== "selected" ||
    settings?.actions?.sha_pinning_required !== true ||
    settings?.actions?.default_workflow_permissions !== "read" ||
    settings?.actions?.can_approve_pull_request_reviews !== false
  ) {
    errors.push("hosted Actions settings snapshot is incomplete or unsafe");
  }
  for (const branch of ["develop", "main"]) {
    if (
      settings?.branch_protection?.[branch] !==
      "unavailable-github-free-private-repository-http-403"
    ) {
      errors.push(`${branch} branch-protection read-back must remain explicit`);
    }
  }
  if (settings?.branch_protection?.claimed_as_hosted_enforcement !== false) {
    errors.push(
      "unavailable branch protection cannot be claimed as enforcement",
    );
  }
  if (
    !Array.isArray(settings?.environments) ||
    settings.environments.some(
      (environment) => environment.changed_by_voc080_t12 !== false,
    )
  ) {
    errors.push("T12 environment settings must be recorded as read-only");
  }
  return errors;
}

function inspectTaskEvidence(tasks, retirement) {
  const errors = [];
  if (!Array.isArray(tasks) || tasks.length !== EXPECTED_TASKS.length) {
    return ["transition record must contain exactly T00 through T11"];
  }
  for (const [index, [id, sha, pr]] of EXPECTED_TASKS.entries()) {
    const task = tasks[index];
    if (task?.id !== id || task?.exact_sha !== sha) {
      errors.push(`${id} exact revision is missing or out of order`);
    }
    if (
      task?.pull_request !==
      `https://github.com/KARSIFT/vocanova-platform/pull/${pr}`
    ) {
      errors.push(`${id} pull request is not canonical`);
    }
    if (!task?.review_evidence?.startsWith(task.pull_request)) {
      errors.push(`${id} review evidence must belong to its pull request`);
    }
    if (
      !task?.hosted_evidence?.startsWith(
        "https://github.com/KARSIFT/vocanova-platform/",
      )
    ) {
      errors.push(`${id} hosted evidence must be repository-scoped`);
    }
    if (
      task?.local_validation !== "pass" ||
      !task?.hosted_validation?.startsWith("pass") ||
      !task?.independent_review?.startsWith("pass-exact-sha") ||
      task?.rollback !== "pass"
    ) {
      errors.push(
        `${id} requires local, hosted, exact-review, and rollback PASS`,
      );
    }
    const parityKey = PARITY_TASKS[id];
    if (parityKey && retirement?.parity_evidence?.[parityKey] !== sha) {
      errors.push(`${id} differs from the retirement parity manifest`);
    }
  }
  return errors;
}

export function inspectTransitionDocument(source, record) {
  const errors = [];
  for (const marker of [
    "# VOC-080 Repository Transition Record",
    "## Deterministic control plane",
    "## Hosted GitHub settings read-back",
    "## Activation and external-effect boundary",
    "## Rehearsal and rollback interpretation",
    "## Closure statement",
    "voc-080-architecture.html",
  ]) {
    if (!source.includes(marker))
      errors.push(`transition document missing: ${marker}`);
  }
  for (const task of record?.tasks ?? []) {
    if (
      !source.includes(task.exact_sha) ||
      !source.includes(task.pull_request)
    ) {
      errors.push(
        `${task.id} exact evidence is absent from the transition document`,
      );
    }
  }
  for (const holdId of Object.keys(record?.action_holds ?? {})) {
    if (!source.includes(holdId))
      errors.push(`${holdId} is absent from the document`);
  }
  return errors;
}

export function inspectTransitionVisual(source, record) {
  const errors = [];
  for (const marker of [
    "<!doctype html>",
    '<html lang="en">',
    'name="viewport"',
    "data:image/svg+xml",
    "prefers-color-scheme: dark",
    "prefers-reduced-motion: reduce",
    ":focus-visible",
    'id="current-shape"',
    'id="request-flow"',
    'id="control-plane"',
    'id="evidence-chain"',
    'id="held-boundary"',
    'id="rollback"',
    'id="transition-evidence"',
  ]) {
    if (!source.toLowerCase().includes(marker.toLowerCase())) {
      errors.push(`architecture visual missing: ${marker}`);
    }
  }
  for (const pattern of [
    /<script\b[^>]*\bsrc\s*=/i,
    /<link\b(?=[^>]*rel=["']stylesheet["'])[^>]*href\s*=\s*["'](?:https?:)?\/\//i,
    /<(?:img|source|video|audio)\b[^>]*\bsrc\s*=\s*["'](?:https?:)?\/\//i,
  ]) {
    if (pattern.test(source))
      errors.push("architecture visual must not load external resources");
  }
  const evidenceMatch = source.match(
    /<script id="transition-evidence" type="application\/json">([\s\S]*?)<\/script>/i,
  );
  if (!evidenceMatch) {
    errors.push("architecture visual is missing embedded transition evidence");
  } else {
    try {
      const evidence = JSON.parse(evidenceMatch[1]);
      if (
        evidence.schema_version !== record?.schema_version ||
        evidence.stack_tip !==
          record?.repository_stack?.verified_stack_tip_sha ||
        JSON.stringify(evidence.workflows) !==
          JSON.stringify(EXPECTED_WORKFLOWS) ||
        evidence.tasks?.length !== EXPECTED_TASKS.length ||
        evidence.tasks?.some(
          (task, index) =>
            task.id !== EXPECTED_TASKS[index][0] ||
            task.sha !== EXPECTED_TASKS[index][1],
        ) ||
        evidence.holds?.some((hold) => hold.status !== "held")
      ) {
        errors.push(
          "embedded visual evidence differs from the canonical record",
        );
      }
    } catch {
      errors.push("embedded transition evidence is not valid JSON");
    }
  }
  return errors;
}

export function inspectFinalEvidenceScripts(source) {
  let scripts;
  try {
    scripts = JSON.parse(source).scripts;
  } catch {
    return ["package.json: cannot parse final-evidence script contract"];
  }
  const errors = [];
  if (
    scripts?.["ci:final-evidence"] !==
    "node scripts/foundation/voc080-final-evidence-policy.mjs"
  ) {
    errors.push(
      "package.json: ci:final-evidence entry point is missing or drifted",
    );
  }
  if (!scripts?.["ci:foundation"]?.includes("pnpm run ci:final-evidence")) {
    errors.push(
      "package.json: ci:foundation must include final evidence validation",
    );
  }
  return errors;
}

export function validateFinalEvidence(repositoryRoot) {
  const errors = [];
  const readJson = (relative) => {
    try {
      return JSON.parse(
        readFileSync(path.join(repositoryRoot, relative), "utf8"),
      );
    } catch {
      errors.push(`${relative}: cannot read valid JSON`);
      return {};
    }
  };
  const record = readJson(TRANSITION_RECORD_PATH);
  const retirement = readJson(
    "infrastructure/cloudflare/server-retirement-manifest.json",
  );
  const delivery = readJson("infrastructure/cloudflare/delivery-manifest.json");
  const workflows = readdirSync(path.join(repositoryRoot, ".github/workflows"))
    .filter((entry) => entry.endsWith(".yml") || entry.endsWith(".yaml"))
    .sort();
  if (JSON.stringify(workflows) !== JSON.stringify(EXPECTED_WORKFLOWS)) {
    errors.push(
      "active workflow directory must contain exactly four canonical workflows",
    );
  }
  errors.push(...inspectTransitionRecord(record, retirement, delivery));
  for (const [relative, inspect] of [
    [TRANSITION_DOCUMENT_PATH, inspectTransitionDocument],
    [TRANSITION_VISUAL_PATH, inspectTransitionVisual],
  ]) {
    if (!existsSync(path.join(repositoryRoot, relative))) {
      errors.push(`${relative}: required final evidence is missing`);
      continue;
    }
    errors.push(
      ...inspect(
        readFileSync(path.join(repositoryRoot, relative), "utf8"),
        record,
      ),
    );
  }
  errors.push(
    ...inspectFinalEvidenceScripts(
      readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    ),
  );
  errors.push(...validateServerRetirement(repositoryRoot));
  return errors;
}

function repositoryRoot() {
  return path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateFinalEvidence(repositoryRoot());
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log("VOC-080 final evidence validation passed.");
  }
}
