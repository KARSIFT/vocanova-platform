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
  if (record?.schema_version !== "vocanova-voc081-f2-v1")
    errors.push("F2 record schema is invalid");
  if (
    record?.task !== "VOC-081-T04" ||
    record?.status !== "repository-local-f2-candidate-integration-pending"
  ) {
    errors.push("F2 task/status must remain integration-pending");
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
    record?.repository_stack?.verified_through_task !== "VOC-081-T03"
  ) {
    errors.push("F2 stack boundaries or executable tip are invalid");
  }
  for (const field of [
    "merged_by_implementer",
    "production_promotion_performed",
  ]) {
    if (record?.repository_stack?.[field] !== false)
      errors.push(`repository_stack.${field} must remain false`);
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
    milestones?.f2_repository_local !==
      "candidate-passes-only-after-integration-and-revalidation" ||
    milestones?.f3_staging !== "unresolved-held" ||
    milestones?.a1_authenticated_product_acceptance !== "unresolved" ||
    milestones?.production !== "held" ||
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
  const closure = record?.t04_closure_evidence;
  for (const field of [
    "exact_sha",
    "pull_request",
    "review_evidence",
    "hosted_evidence",
  ]) {
    if (closure?.[field] !== null)
      errors.push(`t04_closure_evidence.${field} must remain null in Git`);
  }
  if (!closure?.reason?.includes("self-referential commit hash"))
    errors.push(
      "T04 closure evidence must explain its self-reference boundary",
    );
  return errors;
}

export function inspectF2Document(source, record) {
  const errors = [];
  for (const marker of [
    "# VOC-081 F2 Repository/Local Evidence Record",
    "## Acceptance boundary",
    "## Exact task evidence",
    "## Command and CI contract",
    "## Local shape and limitations",
    "## No-live and later-gate state",
    "## Rollback status",
    "F2 becomes effective only after",
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
