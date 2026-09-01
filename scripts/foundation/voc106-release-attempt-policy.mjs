import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const REPOSITORY = "KARSIFT/vocanova-platform";
export const ISSUE_URL =
  "https://github.com/KARSIFT/vocanova-platform/issues/191";
export const FOUNDATION_COMMAND = "node --test scripts/foundation/*.test.mjs";
export const POLICY_MARKER = "VOC-115 durable release-attempt contract";
export const ACTOR = Object.freeze({
  agent: "/root",
  login: "m-e-h-r-d-a-a-d",
  id: "7955432",
  node_id: "MDQ6VXNlcjc5NTU0MzI=",
});

export const LIVING_RELEASE_SURFACES = Object.freeze([
  ".github/README.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "docs/governance/16-autonomous-development-operating-model.md",
  "docs/governance/repository-settings.md",
  "docs/operations/10-development-workflow.md",
  "docs/operations/15-ai-native-product-and-engineering-operating-model.md",
]);

const PACKAGE_FILES = Object.freeze([
  "README.md",
  "acceptance-criteria.md",
  "change.yaml",
  "impact-analysis.md",
  "implementation-plan.md",
  "release-plan.md",
  "specification.md",
  "tasks.md",
  "test-plan.md",
]);

export const CURRENT_POLICY_SURFACES = Object.freeze([
  ...LIVING_RELEASE_SURFACES,
  ...[
    "VOC-106-release-promotion-sync",
    "VOC-114-release-head-and-voc106-bookkeeping",
  ].flatMap((directory) =>
    PACKAGE_FILES.map((file) => `specs/changes/${directory}/${file}`),
  ),
]);

export const RULESET_PATTERNS = Object.freeze([
  "refs/heads/release/voc-106-claim-*",
  "refs/heads/release/voc-106-*-attempt-*",
  "refs/heads/release/voc-106-submit-*",
]);

const SHA40 = /^[0-9a-f]{40}$/;
const DIGEST64 = /^[0-9a-f]{64}$/;
const PR_DECIMAL = /^[1-9][0-9]{0,9}$/;
const ID_DECIMAL = /^[1-9][0-9]{0,18}$/;
const NODE_ID = /^[A-Za-z0-9_=-]+$/;
const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const CLAIM =
  /^release\/voc-106-claim-(?:genesis|after-pr-([1-9][0-9]{0,9})|after-conflict-([0-9a-f]{64}))$/;
const ATTEMPT =
  /^release\/voc-106-([0-9a-f]{40})-attempt-(?:genesis|after-pr-([1-9][0-9]{0,9})|after-conflict-([0-9a-f]{64}))$/;
const SUBMIT = /^release\/voc-106-submit-([0-9a-f]{64})$/;
const MAX_PR = 2147483647n;
const MAX_ID = 9223372036854775807n;

function canonicalDecimal(value, maximum, pattern) {
  if (typeof value !== "string" || !pattern.test(value)) return false;
  try {
    return BigInt(value) <= maximum;
  } catch {
    return false;
  }
}

export function validatePrDecimal(value) {
  return canonicalDecimal(value, MAX_PR, PR_DECIMAL);
}

export function validateIdDecimal(value) {
  return canonicalDecimal(value, MAX_ID, ID_DECIMAL);
}

function validNode(value) {
  return (
    typeof value === "string" &&
    Buffer.byteLength(value, "utf8") >= 1 &&
    Buffer.byteLength(value, "utf8") <= 256 &&
    NODE_ID.test(value)
  );
}

function validBranch(name, pattern) {
  if (typeof name !== "string" || name.startsWith("refs/heads/")) return false;
  const match = pattern.exec(name);
  if (!match) return false;
  let number = null;
  if (pattern === CLAIM) number = match[1] ?? null;
  if (pattern === ATTEMPT) number = match[2] ?? null;
  return number === null || number === undefined || validatePrDecimal(number);
}

export function validateFrontierName(name) {
  return validBranch(name, CLAIM);
}

export function validateAttemptName(name, sha) {
  if (!validBranch(name, ATTEMPT)) return false;
  const match = ATTEMPT.exec(name);
  return sha === undefined || (SHA40.test(sha) && match[1] === sha);
}

export function deriveAttemptName(sha, frontier) {
  if (!validSha(sha) || !validateFrontierName(frontier))
    throw new TypeError("frozen SHA and frontier required");
  return `release/voc-106-${sha}-attempt-${frontier.slice("release/voc-106-claim-".length)}`;
}

export function validateSubmitName(name, allocationDigest) {
  if (!validBranch(name, SUBMIT)) return false;
  const digest = SUBMIT.exec(name)[1];
  return allocationDigest === undefined || digest === allocationDigest;
}

export function toFullRef(branch) {
  if (
    !validateFrontierName(branch) &&
    !validateAttemptName(branch) &&
    !validateSubmitName(branch)
  )
    throw new TypeError("branch-v1 required");
  return `refs/heads/${branch}`;
}

export function validateBranchField(name) {
  return (
    validateFrontierName(name) ||
    validateAttemptName(name) ||
    validateSubmitName(name)
  );
}

export function validateFullRefField(name) {
  return (
    typeof name === "string" &&
    name.startsWith("refs/heads/") &&
    validateBranchField(name.slice(11))
  );
}

export function validateRefFormatAndLength(name, form = "branch-v1") {
  const branch =
    form === "full-ref-v1" &&
    typeof name === "string" &&
    name.startsWith("refs/heads/")
      ? name.slice(11)
      : name;
  if (
    !validateBranchField(branch) ||
    !["branch-v1", "full-ref-v1"].includes(form)
  )
    return false;
  if (form === "branch-v1" && name !== branch) return false;
  if (form === "full-ref-v1" && name !== `refs/heads/${branch}`) return false;
  const bytes = Buffer.byteLength(name, "utf8");
  const maximum = validateAttemptName(branch)
    ? form === "branch-v1"
      ? 144
      : 155
    : validateFrontierName(branch)
      ? form === "branch-v1"
        ? 101
        : 112
      : form === "branch-v1"
        ? 87
        : 98;
  return (
    bytes <= maximum &&
    !/(?:\.\.|[\x00-\x20~^:?*[\\]|\.lock(?:\/|$)|@\{|\.$|\/\.)/u.test(name)
  );
}

export function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(",")}}`;
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export class LosslessInteger {
  constructor(lexeme) {
    this.lexeme = lexeme;
    Object.freeze(this);
  }
}

function decimalToken(value, validator, label) {
  if (!(value instanceof LosslessInteger) || !validator(value.lexeme))
    throw new TypeError(`${label}: canonical raw integer token required`);
  return value.lexeme;
}

export function conflictDigest(numbers) {
  const canonical = [...numbers].map(String);
  if (canonical.some((number) => !validatePrDecimal(number)))
    throw new TypeError("canonical PR numbers required");
  canonical.sort((a, b) =>
    BigInt(a) < BigInt(b) ? -1 : BigInt(a) > BigInt(b) ? 1 : 0,
  );
  if (new Set(canonical).size !== canonical.length)
    throw new TypeError("duplicate PR number");
  return sha256(`${canonical.join("\n")}\n`);
}

function exactKeys(object, keys) {
  return (
    object !== null &&
    typeof object === "object" &&
    !Array.isArray(object) &&
    JSON.stringify(Object.keys(object).sort()) ===
      JSON.stringify([...keys].sort())
  );
}

function validDigest(value) {
  return typeof value === "string" && DIGEST64.test(value);
}

function validTime(value) {
  return typeof value === "string" && TIME.test(value);
}

function validSha(value) {
  return typeof value === "string" && SHA40.test(value);
}

function validString(value) {
  return typeof value === "string";
}

function nullable(value, validator) {
  return value === null || validator(value);
}

const TIMELINE_EVENTS = new Set([
  "assigned",
  "unassigned",
  "closed",
  "reopened",
  "merged",
  "head_ref_deleted",
  "head_ref_restored",
  "base_ref_changed",
  "renamed",
  "locked",
  "unlocked",
  "labeled",
  "unlabeled",
  "milestoned",
  "demilestoned",
  "review_requested",
  "review_request_removed",
  "review_dismissed",
  "ready_for_review",
  "convert_to_draft",
  "auto_merge_enabled",
  "auto_merge_disabled",
  "added_to_merge_queue",
  "removed_from_merge_queue",
  "committed",
  "reviewed",
  "commented",
  "referenced",
  "cross-referenced",
  "connected",
  "disconnected",
  "subscribed",
  "unsubscribed",
  "marked_as_duplicate",
  "unmarked_as_duplicate",
  "transferred",
  "converted_note_to_issue",
  "deployed",
  "deployment_environment_changed",
]);

const PROJECTION_KEYS = Object.freeze({
  pr_boundary: [
    "head_label",
    "head_ref",
    "head_repo_full_name",
    "node_id",
    "number",
    "updated_at",
  ],
  reserved_pr: [
    "base_ref",
    "base_sha",
    "closed_at",
    "created_at",
    "draft",
    "head_label",
    "head_ref",
    "head_repo_full_name",
    "head_sha",
    "merge_commit_sha",
    "merged_at",
    "node_id",
    "number",
    "state",
    "updated_at",
    "user_id",
    "user_login",
    "user_node_id",
  ],
  timeline: [
    "actor_id",
    "actor_login",
    "actor_node_id",
    "assignee_id",
    "assignee_login",
    "assignee_node_id",
    "commit_id",
    "created_at",
    "event",
    "id",
    "node_id",
  ],
  ref: ["name", "sha"],
  git_commit: ["parents", "sha", "tree"],
  protected: ["name", "sha", "tree"],
  ruleset_history: ["actor_id", "actor_type", "updated_at", "version_id"],
});

export function validateProjection(kind, value) {
  const keys = PROJECTION_KEYS[kind];
  if (!keys || !exactKeys(value, keys))
    return [`${kind}-v1: exact own keys required`];
  const errors = [];
  if (kind === "pr_boundary") {
    if (
      !nullable(value.head_label, validString) ||
      !nullable(value.head_ref, validString) ||
      !nullable(value.head_repo_full_name, validString) ||
      !validNode(value.node_id) ||
      !validatePrDecimal(value.number) ||
      !validTime(value.updated_at)
    )
      errors.push("pr-boundary-v1: domains");
  } else if (kind === "reserved_pr") {
    if (
      value.base_ref !== "main" ||
      !validSha(value.base_sha) ||
      !nullable(value.closed_at, validTime) ||
      !validTime(value.created_at) ||
      typeof value.draft !== "boolean" ||
      !validateAttemptName(value.head_ref) ||
      value.head_label !== `KARSIFT:${value.head_ref}` ||
      value.head_repo_full_name !== REPOSITORY ||
      !validSha(value.head_sha) ||
      !nullable(value.merge_commit_sha, validSha) ||
      !nullable(value.merged_at, validTime) ||
      !validNode(value.node_id) ||
      !validatePrDecimal(value.number) ||
      !["open", "closed"].includes(value.state) ||
      !validTime(value.updated_at) ||
      !validateIdDecimal(value.user_id) ||
      !validString(value.user_login) ||
      !validNode(value.user_node_id)
    )
      errors.push("reserved-pr-v1: domains");
  } else if (kind === "timeline") {
    if (
      !nullable(value.actor_id, validateIdDecimal) ||
      !nullable(value.actor_login, validString) ||
      !nullable(value.actor_node_id, validNode) ||
      !nullable(value.assignee_id, validateIdDecimal) ||
      !nullable(value.assignee_login, validString) ||
      !nullable(value.assignee_node_id, validNode) ||
      !nullable(value.commit_id, validSha) ||
      !validTime(value.created_at) ||
      !TIMELINE_EVENTS.has(value.event) ||
      !validateIdDecimal(value.id) ||
      !nullable(value.node_id, validNode)
    )
      errors.push("timeline-v1: domains");
  } else if (kind === "ref") {
    if (!validateFullRefField(value.name) || !validSha(value.sha))
      errors.push("ref-v1: domains");
  } else if (kind === "git_commit") {
    if (
      !Array.isArray(value.parents) ||
      value.parents.length > 16 ||
      !value.parents.every(validSha) ||
      !validSha(value.sha) ||
      !validSha(value.tree)
    )
      errors.push("git-commit-v1: domains");
  } else if (kind === "protected") {
    if (
      !["develop", "main"].includes(value.name) ||
      !validSha(value.sha) ||
      !validSha(value.tree)
    )
      errors.push("protected-v1: domains");
  } else if (kind === "ruleset_history") {
    if (
      !validateIdDecimal(value.actor_id) ||
      value.actor_type !== "User" ||
      !validTime(value.updated_at) ||
      !validateIdDecimal(value.version_id)
    )
      errors.push("ruleset-history-v1: domains");
  }
  return errors;
}

export function parseLosslessJson(raw) {
  if (typeof raw !== "string")
    throw new TypeError("raw JSON must be UTF-8 text");
  let cursor = 0;
  const whitespace = () => {
    while (/\s/u.test(raw[cursor] ?? "")) cursor += 1;
  };
  const stringToken = () => {
    const start = cursor;
    if (raw[cursor++] !== '"') throw new SyntaxError("JSON string required");
    let escaped = false;
    while (cursor < raw.length) {
      const character = raw[cursor++];
      if (!escaped && character === '"')
        return JSON.parse(raw.slice(start, cursor));
      if (character === "\\" && !escaped) escaped = true;
      else escaped = false;
    }
    throw new SyntaxError("unterminated JSON string");
  };
  const value = () => {
    whitespace();
    if (raw[cursor] === "{") {
      cursor += 1;
      const keys = new Set();
      const object = {};
      whitespace();
      if (raw[cursor] === "}") {
        cursor += 1;
        return object;
      }
      while (true) {
        whitespace();
        const key = stringToken();
        if (keys.has(key)) throw new SyntaxError(`duplicate raw key ${key}`);
        keys.add(key);
        whitespace();
        if (raw[cursor++] !== ":") throw new SyntaxError("JSON colon required");
        object[key] = value();
        whitespace();
        const separator = raw[cursor++];
        if (separator === "}") return object;
        if (separator !== ",")
          throw new SyntaxError("JSON object separator required");
      }
    }
    if (raw[cursor] === "[") {
      cursor += 1;
      const array = [];
      whitespace();
      if (raw[cursor] === "]") {
        cursor += 1;
        return array;
      }
      while (true) {
        array.push(value());
        whitespace();
        const separator = raw[cursor++];
        if (separator === "]") return array;
        if (separator !== ",")
          throw new SyntaxError("JSON array separator required");
      }
    }
    if (raw[cursor] === '"') {
      return stringToken();
    }
    const token =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(
        raw.slice(cursor),
      );
    if (!token) throw new SyntaxError("invalid JSON token");
    cursor += token[0].length;
    if (token[0] === "true") return true;
    if (token[0] === "false") return false;
    if (token[0] === "null") return null;
    if (/[.eE]/u.test(token[0]))
      throw new SyntaxError("non-integer raw JSON number is unsafe");
    return new LosslessInteger(token[0]);
  };
  const parsed = value();
  whitespace();
  if (cursor !== raw.length) throw new SyntaxError("trailing JSON content");
  return parsed;
}

export function validateRulesetFixture(ruleset) {
  const errors = [];
  const keys = [
    "bypass_actors",
    "conditions",
    "enforcement",
    "history_version",
    "id",
    "name",
    "rules",
    "source",
    "source_type",
    "target",
  ];
  if (!exactKeys(ruleset, keys)) return ["ruleset-v1: exact own keys required"];
  if (ruleset.enforcement !== "active")
    errors.push("ruleset-v1: active enforcement required");
  if (
    !Array.isArray(ruleset.bypass_actors) ||
    ruleset.bypass_actors.length !== 0
  )
    errors.push("ruleset-v1: bypass actors must be empty");
  if (ruleset.name !== "VOC-106 immutable release attempt refs")
    errors.push("ruleset-v1: wrong name");
  if (
    ruleset.source !== REPOSITORY ||
    ruleset.source_type !== "Repository" ||
    ruleset.target !== "branch"
  )
    errors.push("ruleset-v1: wrong repository target");
  if (
    !validateIdDecimal(ruleset.id) ||
    !validateIdDecimal(ruleset.history_version)
  )
    errors.push("ruleset-v1: canonical ids required");
  const refName = ruleset.conditions?.ref_name;
  if (
    !exactKeys(ruleset.conditions, ["ref_name"]) ||
    !exactKeys(refName, ["exclude", "include"]) ||
    !Array.isArray(refName.exclude) ||
    refName.exclude.length !== 0 ||
    JSON.stringify(refName.include) !== JSON.stringify(RULESET_PATTERNS)
  )
    errors.push("ruleset-v1: exact include/exclude patterns required");
  const expectedRules = [
    { type: "deletion" },
    { type: "non_fast_forward" },
    { parameters: { update_allows_fetch_and_merge: false }, type: "update" },
  ];
  if (canonicalize(ruleset.rules) !== canonicalize(expectedRules))
    errors.push("ruleset-v1: deletion/non-fast-forward/update rules required");
  return errors;
}

export function validateRulesetVersion(
  version,
  currentRuleset,
  selectedHistory,
) {
  const keys = ["actor_id", "actor_type", "state", "updated_at", "version_id"];
  if (!exactKeys(version, keys))
    return ["ruleset-version-v1: exact own keys required"];
  const errors = [];
  if (
    !selectedHistory ||
    canonicalize({
      actor_id: version.actor_id,
      actor_type: version.actor_type,
      updated_at: version.updated_at,
      version_id: version.version_id,
    }) !== canonicalize(selectedHistory)
  )
    errors.push("ruleset-version-v1: selected history mismatch");
  const expected = { ...currentRuleset };
  delete expected.history_version;
  if (canonicalize(version.state) !== canonicalize(expected))
    errors.push("ruleset-version-v1: state mismatch");
  return errors;
}

const ALLOCATION_KEYS = [
  "attempt_ref",
  "attempt_sha",
  "claim_ref",
  "claim_sha",
  "frozen_develop_sha",
  "frozen_develop_tree",
  "frozen_main_sha",
  "frozen_main_tree",
  "frontier",
  "issue_url",
  "repository",
  "ruleset_history_version",
  "ruleset_id",
  "schema",
];
const BINDER_KEYS = [
  "attempt_ref",
  "claim_ref",
  "claim_sha",
  "frozen_develop_sha",
  "frozen_develop_tree",
  "frozen_main_sha",
  "frozen_main_tree",
  "frontier",
  "issue_url",
  "schema",
  "submit_ref",
  "allocation_state_sha256",
];

export function validateAllocationState(value) {
  if (!exactKeys(value, ALLOCATION_KEYS))
    return ["allocation-state-v1: exact own keys required"];
  const errors = [];
  if (
    value.schema !== "voc-106-allocation-state-v1" ||
    value.repository !== REPOSITORY ||
    value.issue_url !== ISSUE_URL ||
    !validateAttemptName(value.attempt_ref, value.attempt_sha) ||
    !validateFrontierName(value.claim_ref) ||
    value.frontier !== value.claim_ref ||
    ![
      value.attempt_sha,
      value.claim_sha,
      value.frozen_develop_sha,
      value.frozen_develop_tree,
      value.frozen_main_sha,
      value.frozen_main_tree,
    ].every(validSha) ||
    value.attempt_sha !== value.frozen_develop_sha ||
    value.attempt_ref !==
      deriveAttemptName(value.frozen_develop_sha, value.frontier) ||
    value.claim_sha !== value.frozen_develop_sha ||
    !validateIdDecimal(value.ruleset_history_version) ||
    !validateIdDecimal(value.ruleset_id)
  )
    errors.push("allocation-state-v1: domains/invariants");
  return errors;
}

export function validateAttemptBinder(value) {
  if (!exactKeys(value, BINDER_KEYS))
    return ["attempt-binder-v1: exact own keys required"];
  const errors = [];
  if (
    value.schema !== "voc-106-attempt-binder-v1" ||
    value.issue_url !== ISSUE_URL ||
    !validateAttemptName(value.attempt_ref, value.frozen_develop_sha) ||
    !validateFrontierName(value.claim_ref) ||
    value.frontier !== value.claim_ref ||
    !validateSubmitName(value.submit_ref, value.allocation_state_sha256) ||
    ![
      value.claim_sha,
      value.frozen_develop_sha,
      value.frozen_develop_tree,
      value.frozen_main_sha,
      value.frozen_main_tree,
    ].every(validSha) ||
    value.claim_sha !== value.frozen_develop_sha ||
    !validDigest(value.allocation_state_sha256)
  )
    errors.push("attempt-binder-v1: domains/invariants");
  return errors;
}

export function renderAttemptBinder(value) {
  const errors = validateAttemptBinder(value);
  if (errors.length) throw new TypeError(errors.join("; "));
  return `<!-- voc-106-attempt-binder-v1\n${canonicalize(value)}\n-->\n`;
}

export function buildRefRequest(branch, sha) {
  if (!validateBranchField(branch) || !validSha(sha))
    throw new TypeError("canonical branch/SHA required");
  return { ref: toFullRef(branch), sha };
}

export function validateRefRequest(value, branch, sha) {
  if (!exactKeys(value, ["ref", "sha"]))
    return ["ref-request-v1: exact own keys required"];
  return value.ref === toFullRef(branch) && value.sha === sha
    ? []
    : ["ref-request-v1: canonical ref/SHA mismatch"];
}

export function validateBinderAllocationJoin(binder, allocation) {
  const errors = [
    ...validateAllocationState(allocation),
    ...validateAttemptBinder(binder),
  ];
  const allocationDigest = sha256(canonicalize(allocation));
  const fields = [
    "attempt_ref",
    "claim_ref",
    "claim_sha",
    "frozen_develop_sha",
    "frozen_develop_tree",
    "frozen_main_sha",
    "frozen_main_tree",
    "frontier",
    "issue_url",
  ];
  if (
    fields.some((field) => binder[field] !== allocation[field]) ||
    binder.allocation_state_sha256 !== allocationDigest ||
    binder.submit_ref !== `release/voc-106-submit-${allocationDigest}`
  )
    errors.push("attempt-binder-v1: allocation cryptographic join mismatch");
  return errors;
}

export function validateSubmitAward(value, context = {}) {
  const keys = [
    "http_status",
    "submit_ref",
    "request_jcs_sha256",
    "schema",
    "sha",
  ];
  if (!exactKeys(value, keys))
    return ["submit-award-v1: exact own keys required"];
  const errors = [];
  if (!(
    value.schema === "voc-106-submit-award-v1" &&
    value.http_status === 201 &&
    validateSubmitName(value.submit_ref) &&
    validDigest(value.request_jcs_sha256) &&
    validSha(value.sha)
  ))
    errors.push("submit-award-v1: domains");
  const { allocation, binder, request, response, currentInvocationId } =
    context;
  if (
    !allocation ||
    !binder ||
    !request ||
    !response ||
    typeof currentInvocationId !== "string" ||
    currentInvocationId === ""
  )
    return [
      ...errors,
      "submit-award-v1: synchronous invocation join context required",
    ];
  errors.push(...validateBinderAllocationJoin(binder, allocation));
  errors.push(
    ...validateRefRequest(
      request,
      binder.submit_ref,
      allocation.frozen_develop_sha,
    ),
  );
  if (
    !exactKeys(response, [
      "http_status",
      "ref",
      "sha",
      "invocation_id",
      "received_synchronously",
    ]) ||
    response.http_status !== 201 ||
    response.ref !== request.ref ||
    response.sha !== request.sha ||
    response.invocation_id !== currentInvocationId ||
    response.received_synchronously !== true
  )
    errors.push(
      "submit-award-v1: exact synchronous 201 recipient/response mismatch",
    );
  if (
    value.submit_ref !== binder.submit_ref ||
    value.sha !== allocation.frozen_develop_sha ||
    value.request_jcs_sha256 !== sha256(canonicalize(request))
  )
    errors.push(
      "submit-award-v1: allocation/request cryptographic join mismatch",
    );
  return errors;
}

export function createSubmitAward(context) {
  const award = {
    http_status: 201,
    submit_ref: context.binder.submit_ref,
    request_jcs_sha256: sha256(canonicalize(context.request)),
    schema: "voc-106-submit-award-v1",
    sha: context.allocation.frozen_develop_sha,
  };
  const errors = validateSubmitAward(award, context);
  if (errors.length) throw new TypeError(errors.join("; "));
  return award;
}

export function validateCanonicalPrRequest(value, context = {}) {
  const keys = [
    "base",
    "body",
    "draft",
    "head",
    "maintainer_can_modify",
    "title",
  ];
  if (!exactKeys(value, keys))
    return ["pr-request-v1: exact own keys required"];
  const errors = [];
  if (!(
    value.base === "main" &&
    validString(value.body) &&
    value.draft === true &&
    validateAttemptName(value.head) &&
    value.maintainer_can_modify === false &&
    value.title === "VOC-106 release promotion"
  ))
    errors.push("pr-request-v1: domains");
  const { allocation, binder, award, awardContext, client } = context;
  if (!allocation || !binder || !award || !awardContext || !client)
    return [
      ...errors,
      "pr-request-v1: allocation/binder/award/client context required",
    ];
  errors.push(...validateBinderAllocationJoin(binder, allocation));
  errors.push(...validateSubmitAward(award, awardContext));
  if (
    value.body !== renderAttemptBinder(binder) ||
    value.head !== allocation.attempt_ref ||
    award.submit_ref !== binder.submit_ref ||
    award.sha !== allocation.frozen_develop_sha
  )
    errors.push("pr-request-v1: binder/allocation/award mismatch");
  if (
    !exactKeys(client, ["retries", "redirects"]) ||
    client.retries !== 0 ||
    client.redirects !== false
  )
    errors.push("pr-request-v1: retries zero and redirects disabled required");
  return errors;
}

export const GITHUB_HEADERS = Object.freeze({
  accept: "application/vnd.github+json",
  "x-github-api-version": "2026-03-10",
});

function validateSourceHeaders(headers) {
  return (
    exactKeys(headers, Object.keys(GITHUB_HEADERS)) &&
    headers.accept === GITHUB_HEADERS.accept &&
    headers["x-github-api-version"] === GITHUB_HEADERS["x-github-api-version"]
  );
}

function decodeRawUtf8(raw) {
  if (!(raw instanceof Uint8Array))
    throw new TypeError("exact raw UTF-8 bytes required");
  const bytes = Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (!Buffer.from(text, "utf8").equals(bytes))
    throw new TypeError("noncanonical UTF-8 bytes");
  return { bytes, parsed: parseLosslessJson(text) };
}

function rawString(value, label, allowNull = false) {
  if (allowNull && value === null) return null;
  if (typeof value !== "string")
    throw new TypeError(`${label}: raw string required`);
  return value;
}

function rawIdentity(value, prefix) {
  if (value === null)
    return {
      [`${prefix}_id`]: null,
      [`${prefix}_login`]: null,
      [`${prefix}_node_id`]: null,
    };
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(`${prefix}: raw identity object/null required`);
  return {
    [`${prefix}_id`]: decimalToken(value.id, validateIdDecimal, `${prefix}.id`),
    [`${prefix}_login`]: rawString(value.login, `${prefix}.login`),
    [`${prefix}_node_id`]: rawString(value.node_id, `${prefix}.node_id`),
  };
}

function projectPageItem(source, raw) {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
    throw new TypeError(`${source}: raw item object required`);
  if (source === "pulls") {
    const head = raw.head;
    if (head === null || typeof head !== "object" || Array.isArray(head))
      throw new TypeError("pulls.head: raw object required");
    return {
      head_label: rawString(head.label, "pulls.head.label", true),
      head_ref: rawString(head.ref, "pulls.head.ref", true),
      head_repo_full_name:
        head.repo === null
          ? null
          : rawString(head.repo?.full_name, "pulls.head.repo.full_name"),
      node_id: rawString(raw.node_id, "pulls.node_id"),
      number: decimalToken(raw.number, validatePrDecimal, "pulls.number"),
      updated_at: rawString(raw.updated_at, "pulls.updated_at"),
    };
  }
  if (source === "timeline") {
    return {
      ...rawIdentity(raw.actor, "actor"),
      ...rawIdentity(raw.assignee, "assignee"),
      commit_id: rawString(raw.commit_id, "timeline.commit_id", true),
      created_at: rawString(raw.created_at, "timeline.created_at"),
      event: rawString(raw.event, "timeline.event"),
      id: decimalToken(raw.id, validateIdDecimal, "timeline.id"),
      node_id: rawString(raw.node_id, "timeline.node_id", true),
    };
  }
  if (source === "matching_refs") {
    return {
      name: rawString(raw.ref, "matching_refs.ref"),
      sha: rawString(raw.object?.sha, "matching_refs.object.sha"),
    };
  }
  if (source === "ruleset_history_list") {
    return {
      actor_id: decimalToken(
        raw.actor?.id,
        validateIdDecimal,
        "history.actor.id",
      ),
      actor_type: rawString(raw.actor?.type, "history.actor.type"),
      updated_at: rawString(raw.updated_at, "history.updated_at"),
      version_id: decimalToken(raw.id, validateIdDecimal, "history.id"),
    };
  }
  throw new TypeError("known page source required");
}

export function projectPageRaw(source, rawBytes, context = {}) {
  if (!validateSourceHeaders(context.headers))
    throw new TypeError("exact GitHub headers required");
  const { bytes, parsed } = decodeRawUtf8(rawBytes);
  if (!Array.isArray(parsed))
    throw new TypeError("raw page must be a JSON array");
  return { bytes, items: parsed.map((item) => projectPageItem(source, item)) };
}

function projectRulesetRaw(raw, historyVersion, includeHistory) {
  const projected = {
    bypass_actors: Array.isArray(raw.bypass_actors) ? raw.bypass_actors : null,
    conditions: raw.conditions,
    enforcement: rawString(raw.enforcement, "ruleset.enforcement"),
    id: decimalToken(raw.id, validateIdDecimal, "ruleset.id"),
    name: rawString(raw.name, "ruleset.name"),
    rules: raw.rules,
    source: rawString(raw.source, "ruleset.source"),
    source_type: rawString(raw.source_type, "ruleset.source_type"),
    target: rawString(raw.target, "ruleset.target"),
  };
  if (includeHistory) projected.history_version = historyVersion;
  return projected;
}

export function projectObjectRaw(source, rawBytes, context = {}) {
  if (!validateSourceHeaders(context.headers))
    throw new TypeError("exact GitHub headers required");
  const { bytes, parsed: raw } = decodeRawUtf8(rawBytes);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
    throw new TypeError("raw object response required");
  let projection;
  if (source === "ruleset")
    projection = projectRulesetRaw(raw, context.historyVersion, true);
  else if (source === "ruleset_history_version") {
    projection = {
      actor_id: decimalToken(
        raw.actor?.id,
        validateIdDecimal,
        "version.actor.id",
      ),
      actor_type: rawString(raw.actor?.type, "version.actor.type"),
      state: projectRulesetRaw(raw.state, null, false),
      updated_at: rawString(raw.updated_at, "version.updated_at"),
      version_id: decimalToken(raw.id, validateIdDecimal, "version.id"),
    };
  } else if (source === "protected_ref") {
    const fullName = rawString(raw.ref, "protected_ref.ref");
    const name =
      fullName === "refs/heads/develop"
        ? "develop"
        : fullName === "refs/heads/main"
          ? "main"
          : null;
    if (name === null)
      throw new TypeError(
        "protected_ref.ref: exact protected full ref required",
      );
    const sha = rawString(raw.object?.sha, "protected_ref.object.sha");
    if (
      !context.gitCommit ||
      context.gitCommit.sha !== sha ||
      validateProjection("git_commit", context.gitCommit).length
    )
      throw new TypeError(
        "protected_ref: exact git-commit tree context required",
      );
    projection = { name, sha, tree: context.gitCommit.tree };
  } else if (source === "git_commit") {
    if (!Array.isArray(raw.parents))
      throw new TypeError("git_commit.parents array required");
    projection = {
      parents: raw.parents.map((item) =>
        rawString(item?.sha, "git_commit.parents.sha"),
      ),
      sha: rawString(raw.sha, "git_commit.sha"),
      tree: rawString(raw.tree?.sha, "git_commit.tree.sha"),
    };
  } else if (source === "reserved_pr") {
    projection = {
      base_ref: rawString(raw.base?.ref, "reserved.base.ref"),
      base_sha: rawString(raw.base?.sha, "reserved.base.sha"),
      closed_at: rawString(raw.closed_at, "reserved.closed_at", true),
      created_at: rawString(raw.created_at, "reserved.created_at"),
      draft: raw.draft,
      head_label: rawString(raw.head?.label, "reserved.head.label"),
      head_ref: rawString(raw.head?.ref, "reserved.head.ref"),
      head_repo_full_name: rawString(
        raw.head?.repo?.full_name,
        "reserved.head.repo.full_name",
      ),
      head_sha: rawString(raw.head?.sha, "reserved.head.sha"),
      merge_commit_sha: rawString(
        raw.merge_commit_sha,
        "reserved.merge_commit_sha",
        true,
      ),
      merged_at: rawString(raw.merged_at, "reserved.merged_at", true),
      node_id: rawString(raw.node_id, "reserved.node_id"),
      number: decimalToken(raw.number, validatePrDecimal, "reserved.number"),
      state: rawString(raw.state, "reserved.state"),
      updated_at: rawString(raw.updated_at, "reserved.updated_at"),
      user_id: decimalToken(
        raw.user?.id,
        validateIdDecimal,
        "reserved.user.id",
      ),
      user_login: rawString(raw.user?.login, "reserved.user.login"),
      user_node_id: rawString(raw.user?.node_id, "reserved.user.node_id"),
    };
  } else throw new TypeError("known object source required");
  return { bytes, projection };
}

const PAGE_KEYS = [
  "schema",
  "source",
  "endpoint",
  "http_status",
  "etag",
  "captured_at",
  "page",
  "per_page",
  "next_url",
  "item_count",
  "raw_sha256",
  "items",
  "items_jcs_sha256",
  "capture_sha256",
];
const PAGE_SOURCES = new Set([
  "pulls",
  "timeline",
  "matching_refs",
  "ruleset_history_list",
]);

function canonicalPageEndpoint(source, subject, page) {
  if (!validateIdDecimal(String(page)))
    throw new TypeError("canonical page required");
  const root = `https://api.github.com/repos/${REPOSITORY}`;
  if (source === "pulls")
    return `${root}/pulls?state=all&sort=created&direction=asc&per_page=100&page=${page}`;
  if (source === "timeline") {
    if (!validatePrDecimal(subject))
      throw new TypeError("timeline PR required");
    return `${root}/issues/${subject}/timeline?per_page=100&page=${page}`;
  }
  if (source === "matching_refs") {
    if (subject !== "refs/heads/release/voc-106-")
      throw new TypeError("matching-ref prefix required");
    return `${root}/git/matching-refs/heads/release/voc-106-?per_page=100&page=${page}`;
  }
  if (source === "ruleset_history_list") {
    if (!validateIdDecimal(subject)) throw new TypeError("ruleset id required");
    return `${root}/rulesets/${subject}/history?per_page=100&page=${page}`;
  }
  throw new TypeError("known page source required");
}

export function parsePageEndpoint(source, endpoint) {
  if (typeof endpoint !== "string") return null;
  const root = `https://api\\.github\\.com/repos/KARSIFT/vocanova-platform`;
  const patterns = {
    pulls: new RegExp(
      `^${root}/pulls\\?state=all&sort=created&direction=asc&per_page=100&page=([1-9][0-9]{0,18})$`,
      "u",
    ),
    timeline: new RegExp(
      `^${root}/issues/([1-9][0-9]{0,9})/timeline\\?per_page=100&page=([1-9][0-9]{0,18})$`,
      "u",
    ),
    matching_refs: new RegExp(
      `^${root}/git/matching-refs/heads/release/voc-106-\\?per_page=100&page=([1-9][0-9]{0,18})$`,
      "u",
    ),
    ruleset_history_list: new RegExp(
      `^${root}/rulesets/([1-9][0-9]{0,18})/history\\?per_page=100&page=([1-9][0-9]{0,18})$`,
      "u",
    ),
  };
  const match = patterns[source]?.exec(endpoint);
  if (!match) return null;
  const hasSubject = source === "timeline" || source === "ruleset_history_list";
  const subject = hasSubject
    ? match[1]
    : source === "matching_refs"
      ? "refs/heads/release/voc-106-"
      : REPOSITORY;
  const page = hasSubject ? match[2] : match[1];
  if (
    !validateIdDecimal(page) ||
    (source === "timeline" && !validatePrDecimal(subject)) ||
    (source === "ruleset_history_list" && !validateIdDecimal(subject))
  )
    return null;
  return { page, subject };
}

export function parseNextLink(rawLink, source, subject, currentPage) {
  if (typeof rawLink !== "string" || rawLink.length === 0)
    throw new TypeError("Link header required");
  const entries = rawLink.split(",").map((entry) => entry.trim());
  const next = entries.filter((entry) => /;\s*rel="next"$/u.test(entry));
  if (next.length !== 1)
    throw new TypeError("exactly one Link next relation required");
  const match = /^<([^>]+)>;\s*rel="next"$/u.exec(next[0]);
  if (!match) throw new TypeError("canonical Link next syntax required");
  const expected = canonicalPageEndpoint(
    source,
    subject,
    String(BigInt(currentPage) + 1n),
  );
  if (match[1] !== expected)
    throw new TypeError("Link next URL is not exact canonical successor");
  const url = new URL(match[1]);
  if (url.username || url.password || url.hash)
    throw new TypeError("Link next authority/fragment forbidden");
  return expected;
}

export function validatePageCapture(capture, context = {}) {
  const errors = [];
  if (!exactKeys(capture, PAGE_KEYS))
    return ["page-capture-v1: exact own keys required"];
  if (capture.schema !== "voc-106-page-capture-v1")
    errors.push("page-capture-v1: schema");
  if (!PAGE_SOURCES.has(capture.source)) errors.push("page-capture-v1: source");
  const parsedEndpoint = parsePageEndpoint(capture.source, capture.endpoint);
  if (!parsedEndpoint || parsedEndpoint.page !== capture.page)
    errors.push("page-capture-v1: canonical source endpoint/page");
  if (capture.next_url !== null) {
    const parsedNext = parsePageEndpoint(capture.source, capture.next_url);
    if (
      !parsedEndpoint ||
      !parsedNext ||
      parsedNext.subject !== parsedEndpoint.subject ||
      BigInt(parsedNext.page) !== BigInt(capture.page) + 1n ||
      capture.next_url !==
        canonicalPageEndpoint(
          capture.source,
          parsedEndpoint.subject,
          parsedNext.page,
        )
    )
      errors.push("page-capture-v1: exact next-page relation");
  }
  if (capture.http_status !== 200 || capture.per_page !== "100")
    errors.push("page-capture-v1: HTTP/per_page");
  if (!validateIdDecimal(capture.page)) errors.push("page-capture-v1: page");
  if (!validTime(capture.captured_at))
    errors.push("page-capture-v1: captured_at");
  if (!(
    capture.etag === null ||
    (typeof capture.etag === "string" && /^[\x20-\x7e]*$/.test(capture.etag))
  ))
    errors.push("page-capture-v1: etag");
  if (
    !Array.isArray(capture.items) ||
    !/^(?:0|[1-9][0-9]?|100)$/.test(capture.item_count)
  )
    errors.push("page-capture-v1: items/count");
  else if (Number(capture.item_count) !== capture.items.length)
    errors.push("page-capture-v1: item count mismatch");
  const projectionKind = {
    pulls: "pr_boundary",
    timeline: "timeline",
    matching_refs: "ref",
    ruleset_history_list: "ruleset_history",
  }[capture.source];
  if (projectionKind) {
    for (const item of capture.items ?? [])
      errors.push(...validateProjection(projectionKind, item));
  }
  if (capture.items_jcs_sha256 !== sha256(canonicalize(capture.items)))
    errors.push("page-capture-v1: items digest");
  try {
    const derived = projectPageRaw(capture.source, context.raw, context);
    if (capture.raw_sha256 !== sha256(derived.bytes))
      errors.push("page-capture-v1: exact raw byte digest mismatch");
    if (canonicalize(capture.items) !== canonicalize(derived.items))
      errors.push("page-capture-v1: raw/source projection mismatch");
  } catch (error) {
    errors.push(`page-capture-v1: raw projection: ${error.message}`);
  }
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("page-capture-v1: capture digest");
  return errors;
}

const OBJECT_KEYS = [
  "schema",
  "source",
  "endpoint",
  "http_status",
  "etag",
  "captured_at",
  "raw_sha256",
  "projection",
  "projection_jcs_sha256",
  "capture_sha256",
];
const OBJECT_SOURCES = new Set([
  "ruleset",
  "ruleset_history_version",
  "protected_ref",
  "git_commit",
  "reserved_pr",
]);

export function validateObjectCapture(capture, context = {}) {
  const errors = [];
  if (!exactKeys(capture, OBJECT_KEYS))
    return ["object-capture-v1: exact own keys required"];
  if (
    capture.schema !== "voc-106-object-capture-v1" ||
    !OBJECT_SOURCES.has(capture.source)
  )
    errors.push("object-capture-v1: schema/source");
  if (
    capture.http_status !== 200 ||
    !validTime(capture.captured_at) ||
    typeof capture.endpoint !== "string" ||
    !(
      capture.etag === null ||
      (validString(capture.etag) && /^[\x20-\x7e]*$/u.test(capture.etag))
    )
  )
    errors.push("object-capture-v1: transport domains");
  const projectionKind = {
    protected_ref: "protected",
    git_commit: "git_commit",
    reserved_pr: "reserved_pr",
  }[capture.source];
  if (projectionKind)
    errors.push(...validateProjection(projectionKind, capture.projection));
  if (capture.source === "ruleset")
    errors.push(...validateRulesetFixture(capture.projection));
  if (capture.source === "ruleset_history_version") {
    if (!context.currentRuleset || !context.selectedHistory)
      errors.push("object-capture-v1: ruleset version join context required");
    else
      errors.push(
        ...validateRulesetVersion(
          capture.projection,
          context.currentRuleset,
          context.selectedHistory,
        ),
      );
  }
  const root = `https://api.github.com/repos/${REPOSITORY}`;
  let expectedEndpoint = null;
  if (capture.source === "ruleset" && validateIdDecimal(capture.projection?.id))
    expectedEndpoint = `${root}/rulesets/${capture.projection.id}`;
  if (
    capture.source === "ruleset_history_version" &&
    validateIdDecimal(context.currentRuleset?.id) &&
    validateIdDecimal(capture.projection?.version_id)
  )
    expectedEndpoint = `${root}/rulesets/${context.currentRuleset.id}/history/${capture.projection.version_id}`;
  if (
    capture.source === "protected_ref" &&
    ["develop", "main"].includes(capture.projection?.name)
  )
    expectedEndpoint = `${root}/git/ref/heads/${capture.projection.name}`;
  if (capture.source === "git_commit" && validSha(capture.projection?.sha))
    expectedEndpoint = `${root}/git/commits/${capture.projection.sha}`;
  if (
    capture.source === "reserved_pr" &&
    validatePrDecimal(capture.projection?.number)
  )
    expectedEndpoint = `${root}/pulls/${capture.projection.number}`;
  if (capture.endpoint !== expectedEndpoint)
    errors.push("object-capture-v1: exact source endpoint/projection identity");
  if (
    capture.projection_jcs_sha256 !== sha256(canonicalize(capture.projection))
  )
    errors.push("object-capture-v1: projection digest");
  try {
    const derived = projectObjectRaw(capture.source, context.raw, {
      ...context,
      historyVersion:
        context.currentRuleset?.history_version ?? context.historyVersion,
    });
    if (capture.raw_sha256 !== sha256(derived.bytes))
      errors.push("object-capture-v1: exact raw byte digest mismatch");
    if (canonicalize(capture.projection) !== canonicalize(derived.projection))
      errors.push("object-capture-v1: raw/source projection mismatch");
  } catch (error) {
    errors.push(`object-capture-v1: raw projection: ${error.message}`);
  }
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("object-capture-v1: capture digest");
  return errors;
}

const COMMAND_KEYS = [
  "schema",
  "source",
  "argv",
  "exit_code",
  "captured_at",
  "stdout_sha256",
  "stderr_sha256",
  "projection",
  "projection_jcs_sha256",
  "capture_sha256",
];

export function validateCommandCapture(capture, raw = {}) {
  const errors = [];
  if (!exactKeys(capture, COMMAND_KEYS))
    return ["command-capture-v1: exact own keys required"];
  if (
    capture.schema !== "voc-106-command-capture-v1" ||
    capture.source !== "git_ls_remote" ||
    canonicalize(capture.argv) !==
      canonicalize([
        "git",
        "ls-remote",
        "--heads",
        "origin",
        "refs/heads/release/voc-106-*",
      ]) ||
    capture.exit_code !== 0 ||
    !validTime(capture.captured_at) ||
    !validDigest(capture.stdout_sha256) ||
    capture.stderr_sha256 !== sha256("") ||
    !Array.isArray(capture.projection)
  )
    errors.push("command-capture-v1: domains");
  for (const ref of capture.projection ?? [])
    errors.push(...validateProjection("ref", ref));
  const sorted = [...(capture.projection ?? [])].sort((a, b) =>
    utf8Compare(a.name, b.name),
  );
  if (canonicalize(sorted) !== canonicalize(capture.projection))
    errors.push("command-capture-v1: projection order");
  if (typeof raw.stdout !== "string" || typeof raw.stderr !== "string")
    errors.push("command-capture-v1: exact raw stdout/stderr required");
  else {
    if (
      raw.stderr !== "" ||
      sha256(raw.stderr) !== capture.stderr_sha256 ||
      sha256(raw.stdout) !== capture.stdout_sha256
    )
      errors.push("command-capture-v1: raw byte digest/stderr mismatch");
    const parsed = [];
    if (raw.stdout !== "") {
      if (!raw.stdout.endsWith("\n") || raw.stdout.includes("\r"))
        errors.push("command-capture-v1: stdout framing");
      for (const line of raw.stdout.slice(0, -1).split("\n")) {
        const match =
          /^([0-9a-f]{40})\t(refs\/heads\/release\/voc-106-[^\t\n]+)$/u.exec(
            line,
          );
        if (!match) errors.push("command-capture-v1: stdout record");
        else parsed.push({ name: match[2], sha: match[1] });
      }
    }
    if (canonicalize(parsed) !== canonicalize(capture.projection))
      errors.push("command-capture-v1: raw/projection mismatch");
  }
  if (
    capture.projection_jcs_sha256 !== sha256(canonicalize(capture.projection))
  )
    errors.push("command-capture-v1: projection digest");
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("command-capture-v1: capture digest");
  return errors;
}

const SCAN_KEYS = [
  "schema",
  "source",
  "started_at",
  "completed_at",
  "pages",
  "page_count",
  "total_count",
  "high_watermark",
  "capture_sha256",
  "state_projection_sha256",
];

function projectPageItems(pageCaptures, source) {
  const items = pageCaptures.flatMap((page) => page.items);
  if (source === "pulls") return items.sort(numericCompare("number"));
  if (source === "timeline") return items.sort(numericCompare("id"));
  if (source === "ruleset_history_list")
    return items.sort(numericCompare("version_id"));
  if (source === "matching_refs")
    return items.sort((a, b) => utf8Compare(a.name, b.name));
  throw new TypeError("known scan source required");
}

export function validateScanCapture(capture, pageCaptures, pageContexts) {
  const errors = [];
  if (!exactKeys(capture, SCAN_KEYS))
    return ["scan-capture-v1: exact own keys required"];
  if (
    capture.schema !== "voc-106-scan-capture-v1" ||
    !PAGE_SOURCES.has(capture.source) ||
    !validTime(capture.started_at) ||
    !validTime(capture.completed_at) ||
    !Array.isArray(capture.pages) ||
    !capture.pages.every(validDigest) ||
    !/^(?:0|[1-9]\d*)$/u.test(capture.page_count) ||
    !/^(?:0|[1-9]\d*)$/u.test(capture.total_count)
  )
    errors.push("scan-capture-v1: domains");
  const paginationErrors = validatePagination(
    pageCaptures,
    capture.source,
    pageContexts,
  );
  errors.push(...paginationErrors);
  let projection = [];
  if (paginationErrors.length === 0)
    projection = projectPageItems(pageCaptures, capture.source);
  if (
    capture.page_count !== String(pageCaptures.length) ||
    capture.total_count !== String(projection.length) ||
    canonicalize(capture.pages) !==
      canonicalize(pageCaptures.map((page) => page.capture_sha256))
  )
    errors.push("scan-capture-v1: complete page inventory");
  let expectedHighWatermark;
  if (capture.source === "pulls")
    expectedHighWatermark = projection.at(-1)?.number ?? "0";
  if (capture.source === "timeline")
    expectedHighWatermark = projection.at(-1)?.id ?? "0";
  if (capture.source === "matching_refs")
    expectedHighWatermark = projection.at(-1)?.name ?? null;
  if (capture.source === "ruleset_history_list") {
    if (projection.length === 0)
      errors.push("scan-capture-v1: ruleset history cannot be empty");
    expectedHighWatermark = projection.at(-1)?.version_id ?? "0";
  }
  if (capture.high_watermark !== expectedHighWatermark)
    errors.push("scan-capture-v1: source high watermark mismatch");
  if (capture.state_projection_sha256 !== sha256(canonicalize(projection)))
    errors.push("scan-capture-v1: state digest");
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("scan-capture-v1: capture digest");
  return errors;
}

export function validatePagination(pages, source, contexts) {
  const errors = [];
  if (!Array.isArray(pages) || pages.length === 0)
    return ["pagination: at least page 1 required"];
  if (!Array.isArray(contexts) || contexts.length !== pages.length)
    return ["pagination: exact raw context per page required"];
  let seenShort = false;
  let subject = null;
  const seenIds = new Set();
  pages.forEach((page, index) => {
    errors.push(...validatePageCapture(page, contexts[index]));
    if (page.source !== source)
      errors.push(`pagination: page ${index + 1} wrong source`);
    const parsed = parsePageEndpoint(source, page.endpoint);
    if (parsed) {
      if (subject === null) subject = parsed.subject;
      else if (parsed.subject !== subject)
        errors.push("pagination: source subject changed");
    }
    if (page.page !== String(index + 1))
      errors.push(`pagination: gap/repeat at page ${index + 1}`);
    const count = Number(page.item_count);
    if (seenShort) errors.push("pagination: page after short terminal");
    if (count < 100) {
      seenShort = true;
      if (page.next_url !== null)
        errors.push("pagination: short page has next");
    }
    if (count === 100 && index + 1 >= pages.length)
      errors.push("pagination: full page requires explicit numbered successor");
    if (
      count === 100 &&
      page.next_url !== null &&
      pages[index + 1]?.endpoint !== page.next_url
    )
      errors.push("pagination: Link next does not equal fetched successor");
    for (const item of page.items) {
      const id = item.version_id ?? item.id ?? item.number ?? item.name;
      if (id !== undefined && seenIds.has(String(id)))
        errors.push(`pagination: duplicate ${id}`);
      if (id !== undefined) seenIds.add(String(id));
    }
  });
  if (!seenShort) errors.push("pagination: explicit short sentinel required");
  return errors;
}

export function projectAllStatePulls(pages, contexts) {
  const errors = validatePagination(pages, "pulls", contexts);
  if (errors.length) throw new TypeError(errors.join("; "));
  return pages
    .flatMap((page) => page.items)
    .sort((a, b) => Number(BigInt(a.number) - BigInt(b.number)));
}

export function projectTimeline(pages, contexts) {
  const errors = validatePagination(pages, "timeline", contexts);
  if (errors.length) throw new TypeError(errors.join("; "));
  return pages
    .flatMap((page) => page.items)
    .sort((a, b) => Number(BigInt(a.id) - BigInt(b.id)));
}

export function projectRulesetHistory(pages, contexts) {
  const errors = validatePagination(pages, "ruleset_history_list", contexts);
  if (errors.length) throw new TypeError(errors.join("; "));
  const records = pages.flatMap((page) => page.items);
  if (records.length === 0)
    throw new TypeError("ruleset history cannot be empty");
  return records.sort((a, b) =>
    Number(BigInt(a.version_id) - BigInt(b.version_id)),
  );
}

export function selectLatestRulesetVersion(history) {
  if (!Array.isArray(history) || history.length === 0)
    throw new TypeError("ruleset history required");
  for (const record of history) {
    if (
      !exactKeys(record, ["actor_id", "actor_type", "updated_at", "version_id"])
    )
      throw new TypeError("ruleset-history-v1 exact keys required");
    if (
      !validateIdDecimal(record.actor_id) ||
      !validateIdDecimal(record.version_id) ||
      record.actor_type !== "User" ||
      !validTime(record.updated_at)
    )
      throw new TypeError("invalid ruleset-history-v1");
  }
  return history.reduce((latest, item) =>
    BigInt(item.version_id) > BigInt(latest.version_id) ? item : latest,
  );
}

export function reconcileRefs(lsRemote, matchingRefsPages, contexts) {
  const errors = validatePagination(
    matchingRefsPages,
    "matching_refs",
    contexts,
  );
  if (errors.length) return errors;
  const api = matchingRefsPages
    .flatMap((page) => page.items)
    .sort((a, b) => utf8Compare(a.name, b.name));
  const git = [...lsRemote].sort((a, b) => utf8Compare(a.name, b.name));
  if (canonicalize(api) !== canonicalize(git))
    errors.push("refs: git/API sets differ");
  for (const ref of api) {
    if (
      !exactKeys(ref, ["name", "sha"]) ||
      !validateFullRefField(ref.name) ||
      !SHA40.test(ref.sha)
    )
      errors.push(`refs: invalid ref-v1 ${ref.name ?? "unknown"}`);
  }
  return errors;
}

export function stableStateDigest(state) {
  return sha256(canonicalize(state));
}

const STABLE_KEYS = [
  "schema",
  "repository",
  "ruleset",
  "ruleset_history",
  "protected_refs",
  "counts",
  "high_watermarks",
  "all_pr_boundary",
  "reserved_prs",
  "timelines",
  "refs",
];
const COUNT_KEYS = [
  "all_prs",
  "refs",
  "reserved_prs",
  "ruleset_history_versions",
  "timeline_events",
  "timelines",
];
const HIGH_WATERMARK_KEYS = [
  "all_pr_number",
  "refs",
  "timelines",
  "ruleset_history_version",
];

function numericCompare(field) {
  return (left, right) =>
    BigInt(left[field]) < BigInt(right[field])
      ? -1
      : BigInt(left[field]) > BigInt(right[field])
        ? 1
        : 0;
}

function utf8Compare(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function assertUnique(items, field, label) {
  const values = items.map((item) => item[field]);
  if (new Set(values).size !== values.length)
    throw new TypeError(`${label}: duplicate ${field}`);
}

export function buildStableState(input) {
  const keys = [
    "ruleset",
    "ruleset_history",
    "protected_refs",
    "all_pr_boundary",
    "reserved_prs",
    "timelines",
    "refs",
  ];
  if (!exactKeys(input, keys))
    throw new TypeError("stable-state input: exact own keys required");
  if (validateRulesetFixture(input.ruleset).length)
    throw new TypeError("stable-state: invalid ruleset");
  const history = structuredClone(input.ruleset_history);
  if (!Array.isArray(history) || history.length === 0)
    throw new TypeError("stable-state: history required");
  for (const record of history) {
    const errors = validateProjection("ruleset_history", record);
    if (errors.length) throw new TypeError(errors.join("; "));
  }
  assertUnique(history, "version_id", "stable-state history");
  history.sort(numericCompare("version_id"));
  const latest = selectLatestRulesetVersion(history);
  if (input.ruleset.history_version !== latest.version_id)
    throw new TypeError("stable-state: current/history numeric-max mismatch");

  const protectedRefs = structuredClone(input.protected_refs);
  if (!Array.isArray(protectedRefs) || protectedRefs.length !== 2)
    throw new TypeError(
      "stable-state: exact develop/main protected refs required",
    );
  for (const ref of protectedRefs) {
    const errors = validateProjection("protected", ref);
    if (errors.length) throw new TypeError(errors.join("; "));
  }
  protectedRefs.sort((a, b) => utf8Compare(a.name, b.name));
  if (protectedRefs[0].name !== "develop" || protectedRefs[1].name !== "main")
    throw new TypeError("stable-state: protected ref cardinality");

  const boundaries = structuredClone(input.all_pr_boundary);
  if (!Array.isArray(boundaries))
    throw new TypeError("stable-state: all PR boundary array required");
  for (const boundary of boundaries) {
    const classification = classifyBoundaryProvenance(boundary);
    if (
      classification === "invalid-boundary" ||
      classification === "ambiguous-head-provenance"
    )
      throw new TypeError(`stable-state: ${classification}`);
  }
  assertUnique(boundaries, "number", "stable-state PR boundary");
  boundaries.sort(numericCompare("number"));

  const reserved = structuredClone(input.reserved_prs);
  if (!Array.isArray(reserved))
    throw new TypeError("stable-state: reserved PR array required");
  for (const pr of reserved) {
    const errors = validateProjection("reserved_pr", pr);
    if (errors.length) throw new TypeError(errors.join("; "));
  }
  assertUnique(reserved, "number", "stable-state reserved PR");
  reserved.sort(numericCompare("number"));
  const expectedReserved = boundaries
    .filter((item) => classifyBoundaryProvenance(item) === "reserved-candidate")
    .map((item) => item.number);
  if (
    canonicalize(expectedReserved) !==
    canonicalize(reserved.map((item) => item.number))
  )
    throw new TypeError(
      "stable-state: reserved filter/detail inventory mismatch",
    );

  const timelines = structuredClone(input.timelines);
  if (!Array.isArray(timelines))
    throw new TypeError("stable-state: timelines array required");
  for (const timeline of timelines) {
    if (
      !exactKeys(timeline, ["events", "pr_number"]) ||
      !validatePrDecimal(timeline.pr_number) ||
      !Array.isArray(timeline.events)
    )
      throw new TypeError("stable-state: timeline wrapper schema");
    for (const event of timeline.events) {
      const errors = validateProjection("timeline", event);
      if (errors.length) throw new TypeError(errors.join("; "));
    }
    assertUnique(
      timeline.events,
      "id",
      `stable-state timeline ${timeline.pr_number}`,
    );
    timeline.events.sort(numericCompare("id"));
  }
  assertUnique(timelines, "pr_number", "stable-state timelines");
  timelines.sort(numericCompare("pr_number"));
  if (
    canonicalize(timelines.map((item) => item.pr_number)) !==
    canonicalize(reserved.map((item) => item.number))
  )
    throw new TypeError(
      "stable-state: one complete timeline per reserved PR required",
    );

  const refs = structuredClone(input.refs);
  if (!Array.isArray(refs))
    throw new TypeError("stable-state: refs array required");
  for (const ref of refs) {
    const errors = validateProjection("ref", ref);
    if (errors.length) throw new TypeError(errors.join("; "));
  }
  assertUnique(refs, "name", "stable-state refs");
  refs.sort((a, b) => utf8Compare(a.name, b.name));
  const timelineEvents = timelines.reduce(
    (count, item) => count + item.events.length,
    0,
  );
  return {
    schema: "voc-106-stable-state-v1",
    repository: REPOSITORY,
    ruleset: structuredClone(input.ruleset),
    ruleset_history: history,
    protected_refs: protectedRefs,
    counts: {
      all_prs: String(boundaries.length),
      refs: String(refs.length),
      reserved_prs: String(reserved.length),
      ruleset_history_versions: String(history.length),
      timeline_events: String(timelineEvents),
      timelines: String(timelines.length),
    },
    high_watermarks: {
      all_pr_number: boundaries.at(-1)?.number ?? "0",
      refs: refs.at(-1)?.name ?? null,
      timelines: timelines.map((item) => ({
        event_id: item.events.at(-1)?.id ?? "0",
        pr_number: item.pr_number,
      })),
      ruleset_history_version: latest.version_id,
    },
    all_pr_boundary: boundaries,
    reserved_prs: reserved,
    timelines,
    refs,
  };
}

export function validateStableState(state) {
  if (!exactKeys(state, STABLE_KEYS))
    return ["stable-state-v1: exact own keys required"];
  if (
    !exactKeys(state.counts, COUNT_KEYS) ||
    !exactKeys(state.high_watermarks, HIGH_WATERMARK_KEYS)
  )
    return ["stable-state-v1: exact counts/high-watermarks keys required"];
  try {
    const rebuilt = buildStableState({
      ruleset: state.ruleset,
      ruleset_history: state.ruleset_history,
      protected_refs: state.protected_refs,
      all_pr_boundary: state.all_pr_boundary,
      reserved_prs: state.reserved_prs,
      timelines: state.timelines,
      refs: state.refs,
    });
    return canonicalize(rebuilt) === canonicalize(state)
      ? []
      : ["stable-state-v1: derived ordering/count/high-watermark mismatch"];
  } catch (error) {
    return [`stable-state-v1: ${error.message}`];
  }
}

export function deriveStableState(passes) {
  if (!Array.isArray(passes) || passes.length !== 2)
    throw new TypeError("exactly two passes required");
  const [first, second] = passes;
  const firstErrors = validateStableState(first);
  const secondErrors = validateStableState(second);
  if (firstErrors.length || secondErrors.length)
    throw new TypeError([...firstErrors, ...secondErrors].join("; "));
  if (canonicalize(first) !== canonicalize(second))
    throw new TypeError("stable-state mismatch");
  return { state: first, sha256: stableStateDigest(first) };
}

const RECONCILIATION_KEYS = [
  "schema",
  "pass_1_capture_sha256",
  "pass_2_capture_sha256",
  "stable_state_sha256",
  "frozen_develop_sha",
  "frozen_develop_tree",
  "frozen_main_sha",
  "frozen_main_tree",
  "frontier",
  "claim_ref",
  "claim_sha",
  "attempt_ref",
  "submit_ref",
  "submit_state",
  "pr_number",
  "pr_node_id",
];

export function validateReconciliation(value, context = {}) {
  if (!exactKeys(value, RECONCILIATION_KEYS))
    return ["reconciliation-v1: exact own keys required"];
  const errors = [];
  if (
    value.schema !== "voc-106-reconciliation-v1" ||
    ![
      value.pass_1_capture_sha256,
      value.pass_2_capture_sha256,
      value.stable_state_sha256,
    ].every(validDigest) ||
    ![
      value.frozen_develop_sha,
      value.frozen_develop_tree,
      value.frozen_main_sha,
      value.frozen_main_tree,
    ].every(validSha) ||
    !nullable(value.frontier, validateFrontierName) ||
    !nullable(value.claim_ref, validateFrontierName) ||
    !nullable(value.claim_sha, validSha) ||
    !nullable(value.attempt_ref, validateAttemptName) ||
    !nullable(value.submit_ref, validateSubmitName) ||
    ![
      "absent",
      "awarded-current-invocation",
      "submit-outcome-unknown",
      "consumed",
    ].includes(value.submit_state) ||
    !nullable(value.pr_number, validatePrDecimal) ||
    !nullable(value.pr_node_id, validNode)
  )
    errors.push("reconciliation-v1: domains");
  if ((value.pr_number === null) !== (value.pr_node_id === null))
    errors.push("reconciliation-v1: PR pair nullability");
  const {
    pass1,
    pass2,
    pass1Context,
    pass2Context,
    stableState,
    persisted = false,
  } = context;
  if (!pass1 || !pass2 || !stableState)
    return [
      ...errors,
      "reconciliation-v1: exact pass/stable join context required",
    ];
  errors.push(
    ...validatePassCapture(pass1, pass1Context),
    ...validatePassCapture(pass2, pass2Context),
  );
  if (
    pass1.pass !== "1" ||
    pass2.pass !== "2" ||
    value.pass_1_capture_sha256 !== pass1.capture_sha256 ||
    value.pass_2_capture_sha256 !== pass2.capture_sha256 ||
    value.stable_state_sha256 !== stableStateDigest(stableState) ||
    pass1.stable_state_sha256 !== value.stable_state_sha256 ||
    pass2.stable_state_sha256 !== value.stable_state_sha256
  )
    errors.push("reconciliation-v1: pass/stable digest join mismatch");
  const develop = stableState.protected_refs?.find(
    (item) => item.name === "develop",
  );
  const main = stableState.protected_refs?.find((item) => item.name === "main");
  if (
    value.frozen_develop_sha !== develop?.sha ||
    value.frozen_develop_tree !== develop?.tree ||
    value.frozen_main_sha !== main?.sha ||
    value.frozen_main_tree !== main?.tree
  )
    errors.push("reconciliation-v1: frozen protected topology mismatch");
  if (value.submit_state === "consumed" && value.pr_number === null)
    errors.push("reconciliation-v1: consumed requires exact PR identity");
  if (value.submit_state === "awarded-current-invocation" && persisted)
    errors.push(
      "reconciliation-v1: ephemeral award cannot be persisted/reconstructed",
    );
  return errors;
}

const PASS_KEYS = [
  "schema",
  "pass",
  "started_at",
  "completed_at",
  "members",
  "member_count",
  "stable_state_sha256",
  "capture_sha256",
];
const MEMBER_KEYS = ["capture_sha256", "kind", "source", "subject"];

function requiredPassDescriptors(stableState) {
  const rulesetId = stableState.ruleset.id;
  const latestVersion = stableState.ruleset.history_version;
  const commitShas = new Set(
    stableState.protected_refs.map((item) => item.sha),
  );
  for (const ref of stableState.refs) commitShas.add(ref.sha);
  for (const pr of stableState.reserved_prs) {
    commitShas.add(pr.base_sha);
    commitShas.add(pr.head_sha);
    if (pr.merge_commit_sha !== null) commitShas.add(pr.merge_commit_sha);
  }
  return [
    {
      kind: "scan",
      source: "ruleset_history_list",
      subject: `ruleset:${rulesetId}`,
    },
    { kind: "scan", source: "pulls", subject: REPOSITORY },
    ...stableState.timelines.map((item) => ({
      kind: "scan",
      source: "timeline",
      subject: `pr:${item.pr_number}`,
    })),
    {
      kind: "scan",
      source: "matching_refs",
      subject: "refs/heads/release/voc-106-",
    },
    {
      kind: "command",
      source: "git_ls_remote",
      subject: "refs/heads/release/voc-106-",
    },
    { kind: "object", source: "ruleset", subject: `ruleset:${rulesetId}` },
    {
      kind: "object",
      source: "ruleset_history_version",
      subject: `version:${latestVersion}`,
    },
    { kind: "object", source: "protected_ref", subject: "ref:develop" },
    { kind: "object", source: "protected_ref", subject: "ref:main" },
    ...stableState.reserved_prs.map((item) => ({
      kind: "object",
      source: "reserved_pr",
      subject: `pr:${item.number}`,
    })),
    ...[...commitShas].sort(utf8Compare).map((sha) => ({
      kind: "object",
      source: "git_commit",
      subject: `commit:${sha}`,
    })),
  ];
}

function registryKey(item) {
  return `${item.kind}\0${item.source}\0${item.subject}`;
}

export function deriveExpectedPassMembers(stableState, registry) {
  const stateErrors = validateStableState(stableState);
  if (stateErrors.length) throw new TypeError(stateErrors.join("; "));
  if (!Array.isArray(registry))
    throw new TypeError("pass registry array required");
  const descriptors = requiredPassDescriptors(stableState);
  const requiredKeys = descriptors.map(registryKey);
  const entries = new Map();
  const captureDigests = new Set();
  for (const entry of registry) {
    if (
      !exactKeys(entry, ["kind", "source", "subject", "capture", "auxiliary"])
    )
      throw new TypeError("pass registry exact entry keys required");
    const key = registryKey(entry);
    if (entries.has(key)) throw new TypeError(`pass registry duplicate ${key}`);
    entries.set(key, entry);
    if (
      !validDigest(entry.capture?.capture_sha256) ||
      captureDigests.has(entry.capture.capture_sha256)
    )
      throw new TypeError("pass registry invalid/duplicate capture digest");
    captureDigests.add(entry.capture.capture_sha256);
  }
  if (
    canonicalize([...entries.keys()].sort()) !==
    canonicalize([...requiredKeys].sort())
  )
    throw new TypeError("pass registry omission/extra subject");

  const expectedHistory = stableState.ruleset_history;
  const expectedPulls = stableState.all_pr_boundary;
  const expectedRefs = stableState.refs;
  for (const descriptor of descriptors) {
    const entry = entries.get(registryKey(descriptor));
    let errors = [];
    if (descriptor.kind === "scan") {
      errors = validateScanCapture(
        entry.capture,
        entry.auxiliary?.pages,
        entry.auxiliary?.pageContexts,
      );
      const projection = projectPageItems(
        entry.auxiliary?.pages ?? [],
        descriptor.source,
      );
      let expected = expectedHistory;
      if (descriptor.source === "pulls") expected = expectedPulls;
      if (descriptor.source === "matching_refs") expected = expectedRefs;
      if (descriptor.source === "timeline") {
        const number = descriptor.subject.slice(3);
        expected = stableState.timelines.find(
          (item) => item.pr_number === number,
        )?.events;
      }
      if (canonicalize(projection) !== canonicalize(expected))
        errors.push("pass registry scan/stable projection mismatch");
    } else if (descriptor.kind === "command") {
      errors = validateCommandCapture(entry.capture, entry.auxiliary);
      if (
        canonicalize(entry.capture.projection) !==
        canonicalize(stableState.refs)
      )
        errors.push("pass registry command/stable refs mismatch");
    } else {
      const selectedHistory = selectLatestRulesetVersion(
        stableState.ruleset_history,
      );
      errors = validateObjectCapture(entry.capture, {
        ...entry.auxiliary,
        currentRuleset: stableState.ruleset,
        selectedHistory,
      });
      let expected;
      if (descriptor.source === "ruleset") expected = stableState.ruleset;
      if (descriptor.source === "protected_ref")
        expected = stableState.protected_refs.find(
          (item) => `ref:${item.name}` === descriptor.subject,
        );
      if (descriptor.source === "reserved_pr")
        expected = stableState.reserved_prs.find(
          (item) => `pr:${item.number}` === descriptor.subject,
        );
      if (
        descriptor.source === "git_commit" &&
        `commit:${entry.capture.projection.sha}` !== descriptor.subject
      )
        errors.push("pass registry git commit subject mismatch");
      if (
        expected &&
        canonicalize(entry.capture.projection) !== canonicalize(expected)
      )
        errors.push("pass registry object/stable projection mismatch");
    }
    if (errors.length) throw new TypeError(errors.join("; "));
  }
  return descriptors.map((descriptor) => ({
    ...descriptor,
    capture_sha256: entries.get(registryKey(descriptor)).capture.capture_sha256,
  }));
}

export function validatePassCapture(capture, context) {
  const errors = [];
  if (!exactKeys(capture, PASS_KEYS))
    return ["pass-capture-v1: exact own keys required"];
  if (
    capture.schema !== "voc-106-pass-capture-v1" ||
    !["1", "2"].includes(capture.pass)
  )
    errors.push("pass-capture-v1: schema/pass");
  if (!validTime(capture.started_at) || !validTime(capture.completed_at))
    errors.push("pass-capture-v1: times");
  if (
    !Array.isArray(capture.members) ||
    capture.member_count !== String(capture.members?.length ?? -1)
  )
    errors.push("pass-capture-v1: member count");
  for (const member of capture.members ?? []) {
    if (
      !exactKeys(member, MEMBER_KEYS) ||
      !validDigest(member.capture_sha256) ||
      !["scan", "command", "object"].includes(member.kind)
    )
      errors.push("pass-capture-v1: invalid member");
  }
  let expectedMembers = [];
  try {
    if (!context || Array.isArray(context))
      throw new TypeError("derived stable-state registry context required");
    expectedMembers = deriveExpectedPassMembers(
      context.stableState,
      context.registry,
    );
  } catch (error) {
    errors.push(`pass-capture-v1: ${error.message}`);
  }
  if (canonicalize(capture.members) !== canonicalize(expectedMembers))
    errors.push("pass-capture-v1: ordered member inventory mismatch");
  if (
    !validDigest(capture.stable_state_sha256) ||
    !context?.stableState ||
    capture.stable_state_sha256 !== stableStateDigest(context.stableState)
  )
    errors.push("pass-capture-v1: stable digest binding");
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("pass-capture-v1: capture digest");
  return errors;
}

export function validateReceipt(receipt, projection) {
  const errors = [];
  if (receipt.projection_jcs_sha256 !== sha256(canonicalize(projection)))
    errors.push("receipt: projection digest mismatch");
  if (!validDigest(receipt.raw_sha256))
    errors.push("receipt: raw digest required");
  return errors;
}

export function classifyMultiplicity(prs) {
  if (!Array.isArray(prs))
    return { state: "invalid", reason: "PR array required" };
  const merged = prs.filter((pr) => pr.merged_at !== null);
  const open = prs.filter((pr) => pr.state === "open");
  const nonmerged = prs.filter((pr) => pr.merged_at === null);
  if (
    prs.length > 1 &&
    (open.length > 0 || nonmerged.some((pr) => pr.state !== "closed"))
  )
    return { state: "conflict-cleanup" };
  if (merged.length > 1)
    return { state: "irrecoverable", reason: "multiple merged PRs" };
  if (merged.length === 1)
    return nonmerged.every((pr) => pr.state === "closed")
      ? { state: "merged-terminal", pr: merged[0] }
      : { state: "conflict-cleanup" };
  if (prs.length > 1 && prs.every((pr) => pr.state === "closed"))
    return {
      state: "conflict-abandonment",
      digest: conflictDigest(prs.map((pr) => pr.number)),
    };
  if (prs.length === 1 && prs[0].state === "closed")
    return {
      state: "single-closed",
      frontier: `release/voc-106-claim-after-pr-${prs[0].number}`,
    };
  if (prs.length === 1 && prs[0].state === "open")
    return { state: "single-open", pr: prs[0] };
  if (prs.length === 0) return { state: "empty" };
  return { state: "invalid" };
}

export function deriveFrontier(stableState) {
  const errors = validateStableState(stableState);
  if (errors.length) throw new TypeError(errors.join("; "));
  const prs = stableState.reserved_prs;
  const result = classifyMultiplicity(prs);
  if (result.state === "empty" && stableState.refs.length > 0) return null;
  if (result.state === "empty") return "release/voc-106-claim-genesis";
  if (result.state === "single-closed") return result.frontier;
  if (result.state === "conflict-abandonment")
    return `release/voc-106-claim-after-conflict-${result.digest}`;
  return null;
}

export function deriveAttemptState({ stableState, claim, attempt, submit }) {
  const stateErrors = validateStableState(stableState);
  if (stateErrors.length) return "invalid-stable-state";
  const exactRef = (record, validator) => {
    if (record === null) return true;
    if (!record || !validator(record.ref) || !validSha(record.sha))
      return false;
    return stableState.refs.some(
      (item) => item.name === toFullRef(record.ref) && item.sha === record.sha,
    );
  };
  if (
    !exactRef(claim, validateFrontierName) ||
    !exactRef(attempt, validateAttemptName) ||
    !exactRef(submit, validateSubmitName)
  )
    return "invalid-ref-reconciliation";
  if (claim?.stale) return "stale-protected-topology";
  const multiplicity = classifyMultiplicity(stableState.reserved_prs);
  if (
    [
      "conflict-cleanup",
      "irrecoverable",
      "merged-terminal",
      "conflict-abandonment",
      "single-closed",
      "single-open",
    ].includes(multiplicity.state)
  )
    return multiplicity.state;
  if (submit) return "submit-outcome-unknown";
  if (attempt) return "attempt-ready-for-submit";
  if (claim) return "claim-ready-for-attempt";
  return "empty";
}

export function classifyClaimRefRecovery(state, frozenTopology) {
  if (
    !frozenTopology ||
    !validSha(frozenTopology.sha) ||
    !validSha(frozenTopology.tree)
  )
    return "stop-malformed";
  if (state === null) return "same-canonical-request-eligible";
  if (!SHA40.test(state.sha ?? "") || !SHA40.test(state.tree ?? ""))
    return "stop-malformed";
  if (state.sha !== frozenTopology.sha || state.tree !== frozenTopology.tree)
    return "lose-different-target";
  if (frozenTopology.current_sha && frozenTopology.current_sha !== state.sha)
    return "stale-protected-topology";
  return "coalesced-accepted";
}

export function classifyBoundaryProvenance(boundary) {
  if (validateProjection("pr_boundary", boundary).length)
    return "invalid-boundary";
  const matchingRef =
    boundary.head_ref !== null && validateAttemptName(boundary.head_ref);
  const matchingLabel =
    boundary.head_label !== null &&
    boundary.head_label.startsWith("KARSIFT:") &&
    validateAttemptName(boundary.head_label.slice("KARSIFT:".length));
  if (boundary.head_repo_full_name === null && (matchingRef || matchingLabel))
    return "ambiguous-head-provenance";
  if (boundary.head_repo_full_name !== REPOSITORY)
    return "foreign-boundary-only";
  if (!matchingRef || boundary.head_label !== `KARSIFT:${boundary.head_ref}`)
    return "ordinary-boundary-only";
  return "reserved-candidate";
}

export function validateSameDevelopRetry(previous, next) {
  if (
    !previous ||
    !next ||
    !validSha(previous.frozen_develop_sha) ||
    previous.frozen_develop_sha !== next.frozen_develop_sha
  )
    return "not-same-develop";
  if (
    !validateAttemptName(previous.attempt_ref, previous.frozen_develop_sha) ||
    !validateAttemptName(next.attempt_ref, next.frozen_develop_sha)
  )
    return "invalid-attempt";
  if (previous.attempt_ref === next.attempt_ref) return "stop-identity-reuse";
  if (
    !["single-closed", "conflict-abandonment"].includes(previous.terminal_state)
  )
    return "stop-no-terminal-frontier";
  if (
    !validateFrontierName(next.frontier) ||
    next.frontier === previous.frontier
  )
    return "stop-frontier-not-advanced";
  return "fresh-distinct-retry";
}

export function classifySubmitAward(context) {
  if (!context || typeof context !== "object") return "invalid-submit-context";
  try {
    createSubmitAward(context);
    return "awarded-current-invocation";
  } catch {
    return context.markerPresent ? "submit-outcome-unknown" : "no-award";
  }
}

export function classifyOneShotPrOutcome(trace) {
  if (
    !trace ||
    !Number.isSafeInteger(trace.matchingPrCount) ||
    trace.matchingPrCount < 0 ||
    !Number.isSafeInteger(trace.postCount) ||
    trace.postCount < 0 ||
    trace.postCount > 1
  )
    return "invalid-submit-trace";
  if (trace.matchingPrCount > 1) return "conflict-cleanup";
  if (trace.matchingPrCount === 1) return "consumed";
  if (!trace.markerPresent) return "no-award";
  const awardValid =
    trace.award &&
    trace.awardContext &&
    validateSubmitAward(trace.award, trace.awardContext).length === 0;
  if (
    awardValid &&
    trace.postCount === 0 &&
    trace.postStarted === false &&
    trace.crashed === false &&
    trace.restarted === false &&
    trace.handedOff === false
  )
    return "post-once";
  return "submit-outcome-unknown";
}

export function validateActorMapping(actor, githubIdentity) {
  return (
    actor === ACTOR.agent &&
    githubIdentity?.login === ACTOR.login &&
    String(githubIdentity?.id) === ACTOR.id &&
    githubIdentity?.node_id === ACTOR.node_id
  );
}

export function validateCurrentPolicySurfaces(repositoryRoot) {
  const errors = [];
  for (const relativePath of CURRENT_POLICY_SURFACES) {
    const absolute = path.join(repositoryRoot, relativePath);
    if (!existsSync(absolute)) {
      errors.push(
        `${relativePath}: required VOC-115 policy surface is missing`,
      );
      continue;
    }
    const text = readFileSync(absolute, "utf8");
    if (!text.includes(POLICY_MARKER))
      errors.push(`${relativePath}: missing ${POLICY_MARKER}`);
    for (const required of [
      "release/voc-106-claim-",
      "release/voc-106-submit-",
      "submit-outcome-unknown",
      "VOC-080-HOLD-01",
    ]) {
      if (!text.includes(required))
        errors.push(
          `${relativePath}: missing durable contract token ${required}`,
        );
    }
  }
  return errors;
}

export function validateRepository(root) {
  const errors = validateCurrentPolicySurfaces(root);
  const packagePath = path.join(root, "package.json");
  if (!existsSync(packagePath)) errors.push("package.json: missing");
  else {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    if (
      !(packageJson.scripts?.["ci:foundation"] ?? "").includes(
        FOUNDATION_COMMAND,
      )
    )
      errors.push(
        `package.json: ci:foundation must include ${FOUNDATION_COMMAND}`,
      );
  }
  return errors;
}

const cliPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === cliPath) {
  const root = path.resolve(process.argv[2] ?? ".");
  const errors = validateRepository(root);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log("VOC-106 release attempt policy: PASS");
  }
}
