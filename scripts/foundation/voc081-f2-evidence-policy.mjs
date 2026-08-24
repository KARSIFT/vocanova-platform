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

  const milestones = record?.milestone_state;
  if (
    milestones?.f2_repository_local !== "complete-effective" ||
    milestones?.f3_staging !== "unresolved-held" ||
    milestones?.a1_authenticated_product_acceptance !== "unresolved" ||
    milestones?.p1_plus_product_acceptance !== "unresolved" ||
    milestones?.production !== "held" ||
    milestones?.live_activation !== "unresolved-held" ||
    JSON.stringify(milestones?.voc080_holds) !==
      JSON.stringify(["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"])
  ) {
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
    "## No-live and later-gate state",
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
    "VOC-080-HOLD-00",
    "VOC-080-HOLD-01",
    "VOC-080-HOLD-02",
    "no deployment URL is expected",
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
  let scripts;
  try {
    scripts = JSON.parse(source).scripts;
  } catch {
    return ["package.json: cannot parse F2 evidence script contract"];
  }
  const errors = [];
  if (
    scripts?.["ci:f2-evidence"] !==
    "node scripts/foundation/voc081-f2-evidence-policy.mjs"
  ) {
    errors.push(
      "package.json: ci:f2-evidence entry point is missing or drifted",
    );
  }
  if (!scripts?.["ci:foundation"]?.includes("pnpm run ci:f2-evidence"))
    errors.push(
      "package.json: ci:foundation must include F2 evidence validation",
    );
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
  if (!existsSync(path.join(repositoryRoot, F2_DOCUMENT_PATH))) {
    errors.push(`${F2_DOCUMENT_PATH}: required F2 evidence is missing`);
  } else {
    errors.push(
      ...inspectF2Document(
        readFileSync(path.join(repositoryRoot, F2_DOCUMENT_PATH), "utf8"),
        record,
      ),
    );
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
