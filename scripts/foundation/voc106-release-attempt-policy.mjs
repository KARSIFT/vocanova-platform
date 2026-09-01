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
    const identity = ["actor", "assignee"].every((prefix) => {
      const triple = [
        value[`${prefix}_id`],
        value[`${prefix}_login`],
        value[`${prefix}_node_id`],
      ];
      return (
        triple.every((item) => item === null) ||
        (validateIdDecimal(triple[0]) &&
          validString(triple[1]) &&
          validNode(triple[2]))
      );
    });
    if (
      !identity ||
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
      whitespace();
      if (raw[cursor] === "}") {
        cursor += 1;
        return;
      }
      while (true) {
        whitespace();
        const key = stringToken();
        if (keys.has(key)) throw new SyntaxError(`duplicate raw key ${key}`);
        keys.add(key);
        whitespace();
        if (raw[cursor++] !== ":") throw new SyntaxError("JSON colon required");
        value();
        whitespace();
        const separator = raw[cursor++];
        if (separator === "}") return;
        if (separator !== ",")
          throw new SyntaxError("JSON object separator required");
      }
    }
    if (raw[cursor] === "[") {
      cursor += 1;
      whitespace();
      if (raw[cursor] === "]") {
        cursor += 1;
        return;
      }
      while (true) {
        value();
        whitespace();
        const separator = raw[cursor++];
        if (separator === "]") return;
        if (separator !== ",")
          throw new SyntaxError("JSON array separator required");
      }
    }
    if (raw[cursor] === '"') {
      stringToken();
      return;
    }
    const token =
      /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/u.exec(
        raw.slice(cursor),
      );
    if (!token) throw new SyntaxError("invalid JSON token");
    cursor += token[0].length;
  };
  value();
  whitespace();
  if (cursor !== raw.length) throw new SyntaxError("trailing JSON content");
  if (/(?<!["\w])(?:-?\d{16,})(?!["\w])/.test(raw))
    throw new SyntaxError(
      "unsafe raw JSON number; ids must project losslessly",
    );
  return JSON.parse(raw);
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

export function validateSubmitAward(value) {
  const keys = [
    "http_status",
    "submit_ref",
    "request_jcs_sha256",
    "schema",
    "sha",
  ];
  if (!exactKeys(value, keys))
    return ["submit-award-v1: exact own keys required"];
  return value.schema === "voc-106-submit-award-v1" &&
    value.http_status === 201 &&
    validateSubmitName(value.submit_ref) &&
    validDigest(value.request_jcs_sha256) &&
    validSha(value.sha)
    ? []
    : ["submit-award-v1: domains"];
}

export function validateCanonicalPrRequest(value) {
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
  return value.base === "main" &&
    validString(value.body) &&
    value.draft === true &&
    validateAttemptName(value.head) &&
    value.maintainer_can_modify === false &&
    value.title === "VOC-106 release promotion"
    ? []
    : ["pr-request-v1: domains"];
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

export function validatePageCapture(capture) {
  const errors = [];
  if (!exactKeys(capture, PAGE_KEYS))
    return ["page-capture-v1: exact own keys required"];
  if (capture.schema !== "voc-106-page-capture-v1")
    errors.push("page-capture-v1: schema");
  if (!PAGE_SOURCES.has(capture.source)) errors.push("page-capture-v1: source");
  const endpointPrefix = `https://api.github.com/repos/${REPOSITORY}/`;
  if (
    typeof capture.endpoint !== "string" ||
    !capture.endpoint.startsWith(endpointPrefix)
  )
    errors.push("page-capture-v1: canonical endpoint");
  if (!(
    capture.next_url === null ||
    (typeof capture.next_url === "string" &&
      capture.next_url.startsWith(endpointPrefix))
  ))
    errors.push("page-capture-v1: canonical next URL");
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
  if (!validDigest(capture.raw_sha256))
    errors.push("page-capture-v1: raw digest");
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

export function validateObjectCapture(capture) {
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
    !validDigest(capture.raw_sha256) ||
    typeof capture.endpoint !== "string" ||
    !capture.endpoint.startsWith(
      `https://api.github.com/repos/${REPOSITORY}/`,
    ) ||
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
  if (
    capture.projection_jcs_sha256 !== sha256(canonicalize(capture.projection))
  )
    errors.push("object-capture-v1: projection digest");
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

export function validateCommandCapture(capture) {
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
    a.name.localeCompare(b.name),
  );
  if (canonicalize(sorted) !== canonicalize(capture.projection))
    errors.push("command-capture-v1: projection order");
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

export function validateScanCapture(capture, pageCaptures, projection) {
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
    !/^\d+$/u.test(capture.page_count) ||
    !/^\d+$/u.test(capture.total_count)
  )
    errors.push("scan-capture-v1: domains");
  if (
    capture.page_count !== String(pageCaptures.length) ||
    capture.total_count !== String(projection.length) ||
    canonicalize(capture.pages) !==
      canonicalize(pageCaptures.map((page) => page.capture_sha256))
  )
    errors.push("scan-capture-v1: complete page inventory");
  if (capture.state_projection_sha256 !== sha256(canonicalize(projection)))
    errors.push("scan-capture-v1: state digest");
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  if (capture.capture_sha256 !== sha256(canonicalize(preimage)))
    errors.push("scan-capture-v1: capture digest");
  return errors;
}

export function validatePagination(pages, source) {
  const errors = [];
  if (!Array.isArray(pages) || pages.length === 0)
    return ["pagination: at least page 1 required"];
  let seenShort = false;
  const seenIds = new Set();
  pages.forEach((page, index) => {
    errors.push(...validatePageCapture(page));
    if (page.source !== source)
      errors.push(`pagination: page ${index + 1} wrong source`);
    if (page.page !== String(index + 1))
      errors.push(`pagination: gap/repeat at page ${index + 1}`);
    const count = Number(page.item_count);
    if (seenShort) errors.push("pagination: page after short terminal");
    if (count < 100) {
      seenShort = true;
      if (page.next_url !== null)
        errors.push("pagination: short page has next");
    }
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

export function projectAllStatePulls(pages) {
  const errors = validatePagination(pages, "pulls");
  if (errors.length) throw new TypeError(errors.join("; "));
  return pages
    .flatMap((page) => page.items)
    .sort((a, b) => Number(BigInt(a.number) - BigInt(b.number)));
}

export function projectTimeline(pages) {
  const errors = validatePagination(pages, "timeline");
  if (errors.length) throw new TypeError(errors.join("; "));
  return pages
    .flatMap((page) => page.items)
    .sort((a, b) => Number(BigInt(a.id) - BigInt(b.id)));
}

export function projectRulesetHistory(pages) {
  const errors = validatePagination(pages, "ruleset_history_list");
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

export function reconcileRefs(lsRemote, matchingRefsPages) {
  const errors = validatePagination(matchingRefsPages, "matching_refs");
  if (errors.length) return errors;
  const api = matchingRefsPages
    .flatMap((page) => page.items)
    .sort((a, b) => a.name.localeCompare(b.name));
  const git = [...lsRemote].sort((a, b) => a.name.localeCompare(b.name));
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

export function deriveStableState(passes) {
  if (!Array.isArray(passes) || passes.length !== 2)
    throw new TypeError("exactly two passes required");
  const [first, second] = passes;
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

export function validateReconciliation(value) {
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

export function validatePassCapture(capture, expectedMembers) {
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
  if (canonicalize(capture.members) !== canonicalize(expectedMembers))
    errors.push("pass-capture-v1: ordered member inventory mismatch");
  if (!validDigest(capture.stable_state_sha256))
    errors.push("pass-capture-v1: stable digest");
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

export function deriveFrontier(prs) {
  const result = classifyMultiplicity(prs);
  if (result.state === "empty") return "release/voc-106-claim-genesis";
  if (result.state === "single-closed") return result.frontier;
  if (result.state === "conflict-abandonment")
    return `release/voc-106-claim-after-conflict-${result.digest}`;
  return null;
}

export function deriveAttemptState({ claim, attempt, submit, prs }) {
  if (claim?.stale) return "stale-protected-topology";
  const multiplicity = classifyMultiplicity(prs ?? []);
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

export function classifySubmitAward(state, responseClass) {
  if (
    responseClass === "201-verified" &&
    state === "created-by-current-invocation"
  )
    return "awarded-current-invocation";
  return state === "present" ? "submit-outcome-unknown" : "no-award";
}

export function classifyOneShotPrOutcome(state, award, responseClass) {
  if (state.pr_count > 1) return "conflict-cleanup";
  if (state.pr_count === 1) return "consumed";
  if (award === "awarded-current-invocation" && responseClass === "before-post")
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
