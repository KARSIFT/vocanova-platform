import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ACTOR,
  CURRENT_POLICY_SURFACES,
  POLICY_MARKER,
  REPOSITORY,
  RULESET_PATTERNS,
  canonicalize,
  classifyClaimRefRecovery,
  classifyBoundaryProvenance,
  classifyMultiplicity,
  classifyOneShotPrOutcome,
  classifySubmitAward,
  conflictDigest,
  deriveAttemptState,
  deriveFrontier,
  deriveStableState,
  parseLosslessJson,
  projectRulesetHistory,
  reconcileRefs,
  selectLatestRulesetVersion,
  sha256,
  toFullRef,
  validateActorMapping,
  validateAllocationState,
  validateAttemptName,
  validateAttemptBinder,
  validateCanonicalPrRequest,
  validateCommandCapture,
  validateCurrentPolicySurfaces,
  validateFrontierName,
  validatePageCapture,
  validatePagination,
  validatePassCapture,
  validatePrDecimal,
  validateRulesetFixture,
  validateSameDevelopRetry,
  validateSubmitAward,
  validateSubmitName,
} from "./voc106-release-attempt-policy.mjs";

const SHA = "a".repeat(40);
const TREE = "b".repeat(40);
const DIGEST = "c".repeat(64);
const TIME = "2026-09-01T00:00:00Z";
const NODE = "PR_node";

function boundary(number) {
  return {
    head_label: null,
    head_ref: null,
    head_repo_full_name: null,
    node_id: `${NODE}${number}`,
    number: String(number),
    updated_at: TIME,
  };
}

function page(source, number, items, next = null) {
  const capture = {
    schema: "voc-106-page-capture-v1",
    source,
    endpoint: `https://api.github.com/repos/${REPOSITORY}/pulls?state=all&per_page=100&page=${number}`,
    http_status: 200,
    etag: null,
    captured_at: TIME,
    page: String(number),
    per_page: "100",
    next_url: next,
    item_count: String(items.length),
    raw_sha256: "d".repeat(64),
    items,
    items_jcs_sha256: sha256(canonicalize(items)),
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  return capture;
}

function ruleset() {
  return {
    bypass_actors: [],
    conditions: { ref_name: { exclude: [], include: [...RULESET_PATTERNS] } },
    enforcement: "active",
    history_version: "9",
    id: "8",
    name: "VOC-106 immutable release attempt refs",
    rules: [
      { type: "deletion" },
      { type: "non_fast_forward" },
      { parameters: { update_allows_fetch_and_merge: false }, type: "update" },
    ],
    source: REPOSITORY,
    source_type: "Repository",
    target: "branch",
  };
}

test("canonical JCS ordering and digest are deterministic", () => {
  assert.equal(
    canonicalize({ z: 1, a: [true, null] }),
    '{"a":[true,null],"z":1}',
  );
  assert.equal(
    sha256("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("lossless JSON rejects duplicate keys and unsafe numeric identifiers", () => {
  assert.deepEqual(
    parseLosslessJson('{"a":{"id":"9223372036854775807"},"b":{"id":"1"}}').a.id,
    "9223372036854775807",
  );
  assert.throws(() => parseLosslessJson('{"a":1,"a":2}'), /duplicate raw key/u);
  assert.throws(
    () => parseLosslessJson('{"id":9223372036854775807}'),
    /unsafe raw JSON number/u,
  );
  assert.throws(() => parseLosslessJson('{"a":1} trailing'), /trailing/u);
});

test("PR decimal domain is canonical, bounded, and BigInt-safe", () => {
  for (const value of ["1", "2147483647"])
    assert.equal(validatePrDecimal(value), true);
  for (const value of ["0", "01", "2147483648", 1])
    assert.equal(validatePrDecimal(value), false);
});

test("branch-v1 grammars and full-ref conversion are unambiguous", () => {
  const frontier = "release/voc-106-claim-after-pr-2147483647";
  const attempt = `release/voc-106-${SHA}-attempt-after-conflict-${DIGEST}`;
  const submit = `release/voc-106-submit-${DIGEST}`;
  assert.equal(validateFrontierName(frontier), true);
  assert.equal(validateAttemptName(attempt, SHA), true);
  assert.equal(validateSubmitName(submit, DIGEST), true);
  assert.equal(toFullRef(frontier), `refs/heads/${frontier}`);
  assert.equal(validateFrontierName(`refs/heads/${frontier}`), false);
  assert.equal(
    validateAttemptName(attempt.replace(SHA, "a".repeat(39))),
    false,
  );
  assert.equal(
    validateSubmitName(submit.replace(DIGEST, "g".repeat(64))),
    false,
  );
});

test("conflict digest is sorted, unique, and newline-delimited", () => {
  assert.equal(conflictDigest(["3", "1"]), sha256("1\n3\n"));
  assert.throws(() => conflictDigest(["1", "1"]), /duplicate/u);
});

test("ruleset fixture is exact and rejects bypass, inactive, or pattern drift", () => {
  assert.deepEqual(validateRulesetFixture(ruleset()), []);
  for (const mutate of [
    (value) => value.bypass_actors.push({ actor_id: 1 }),
    (value) => {
      value.enforcement = "disabled";
    },
    (value) => value.conditions.ref_name.include.pop(),
    (value) => value.rules.pop(),
  ]) {
    const value = structuredClone(ruleset());
    mutate(value);
    assert.notDeepEqual(validateRulesetFixture(value), []);
  }
});

test("page capture binds exact members and capture preimage", () => {
  const value = page("pulls", 1, []);
  assert.deepEqual(validatePageCapture(value), []);
  for (const field of ["items_jcs_sha256", "capture_sha256", "raw_sha256"]) {
    const changed = structuredClone(value);
    changed[field] = "0".repeat(64);
    assert.notDeepEqual(validatePageCapture(changed), []);
  }
  const foreign = structuredClone(value);
  foreign.endpoint = "https://example.invalid/pulls";
  assert.match(validatePageCapture(foreign).join(";"), /canonical endpoint/u);
});

test("pagination requires consecutive pages, terminal short page, and no duplicates", () => {
  const hundred = Array.from({ length: 100 }, (_, index) =>
    boundary(index + 1),
  );
  const next = `https://api.github.com/repos/${REPOSITORY}/pulls?state=all&per_page=100&page=2`;
  assert.deepEqual(
    validatePagination(
      [page("pulls", 1, hundred, next), page("pulls", 2, [])],
      "pulls",
    ),
    [],
  );
  assert.match(
    validatePagination([page("pulls", 2, [])], "pulls").join(";"),
    /gap/u,
  );
  assert.match(
    validatePagination([page("pulls", 1, [boundary(1)], next)], "pulls").join(
      ";",
    ),
    /short page has next/u,
  );
  assert.match(
    validatePagination(
      [page("pulls", 1, [boundary(1), boundary(1)])],
      "pulls",
    ).join(";"),
    /duplicate/u,
  );
});

test("history is exhaustive, nonempty, and selects numeric maximum", () => {
  const records = [
    { actor_id: "1", actor_type: "User", updated_at: TIME, version_id: "9" },
    { actor_id: "1", actor_type: "User", updated_at: TIME, version_id: "10" },
  ];
  assert.equal(selectLatestRulesetVersion(records).version_id, "10");
  assert.equal(
    projectRulesetHistory([page("ruleset_history_list", 1, records)])[1]
      .version_id,
    "10",
  );
  assert.throws(
    () => projectRulesetHistory([page("ruleset_history_list", 1, [])]),
    /cannot be empty/u,
  );
});

test("git and API ref enumerations must agree exactly", () => {
  const ref = { name: `refs/heads/release/voc-106-submit-${DIGEST}`, sha: SHA };
  assert.deepEqual(reconcileRefs([ref], [page("matching_refs", 1, [ref])]), []);
  assert.match(
    reconcileRefs([], [page("matching_refs", 1, [ref])]).join(";"),
    /differ/u,
  );
});

test("two scans must have identical stable projections", () => {
  assert.equal(
    deriveStableState([{ head: SHA }, { head: SHA }]).state.head,
    SHA,
  );
  assert.throws(
    () => deriveStableState([{ head: SHA }, { head: TREE }]),
    /mismatch/u,
  );
  assert.throws(() => deriveStableState([{ head: SHA }]), /exactly two/u);
});

test("pass receipt binds ordered complete member list and its own preimage", () => {
  const members = [
    { capture_sha256: DIGEST, kind: "scan", source: "pulls", subject: "all" },
  ];
  const capture = {
    schema: "voc-106-pass-capture-v1",
    pass: "1",
    started_at: TIME,
    completed_at: TIME,
    members,
    member_count: "1",
    stable_state_sha256: DIGEST,
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  assert.deepEqual(validatePassCapture(capture, members), []);
  assert.match(validatePassCapture(capture, []).join(";"), /inventory/u);
  assert.match(
    validatePassCapture({ ...capture, member_count: "0" }, members).join(";"),
    /count/u,
  );
});

test("claim creation coalesces same target and rejects foreign/stale topology", () => {
  const frozen = { sha: SHA, tree: TREE, current_sha: SHA };
  assert.equal(
    classifyClaimRefRecovery(null, frozen),
    "same-canonical-request-eligible",
  );
  assert.equal(
    classifyClaimRefRecovery({ sha: SHA, tree: TREE }, frozen),
    "coalesced-accepted",
  );
  assert.equal(
    classifyClaimRefRecovery({ sha: TREE, tree: TREE }, frozen),
    "lose-different-target",
  );
  assert.equal(
    classifyClaimRefRecovery(
      { sha: SHA, tree: TREE },
      { ...frozen, current_sha: TREE },
    ),
    "stale-protected-topology",
  );
});

test("all-PR boundary keeps foreign rows and stops canonical-looking null provenance", () => {
  const attempt = `release/voc-106-${SHA}-attempt-genesis`;
  const base = {
    ...boundary(1),
    head_ref: attempt,
    head_label: `KARSIFT:${attempt}`,
  };
  assert.equal(classifyBoundaryProvenance(base), "ambiguous-head-provenance");
  assert.equal(
    classifyBoundaryProvenance({ ...base, head_repo_full_name: "FORK/repo" }),
    "foreign-boundary-only",
  );
  assert.equal(
    classifyBoundaryProvenance({ ...base, head_repo_full_name: REPOSITORY }),
    "reserved-candidate",
  );
});

test("same-develop retry requires a fresh distinct identity and advanced frontier", () => {
  const previous = {
    frozen_develop_sha: SHA,
    attempt_ref: `release/voc-106-${SHA}-attempt-genesis`,
    frontier: "release/voc-106-claim-genesis",
    terminal_state: "single-closed",
  };
  const next = {
    frozen_develop_sha: SHA,
    attempt_ref: `release/voc-106-${SHA}-attempt-after-pr-7`,
    frontier: "release/voc-106-claim-after-pr-7",
  };
  assert.equal(
    validateSameDevelopRetry(previous, next),
    "fresh-distinct-retry",
  );
  assert.equal(
    validateSameDevelopRetry(previous, {
      ...next,
      attempt_ref: previous.attempt_ref,
    }),
    "stop-identity-reuse",
  );
  assert.equal(
    validateSameDevelopRetry(
      { ...previous, terminal_state: "submit-outcome-unknown" },
      next,
    ),
    "stop-no-terminal-frontier",
  );
});

test("submit allocation is awarded only to the verified synchronous 201 invocation", () => {
  assert.equal(
    classifySubmitAward("created-by-current-invocation", "201-verified"),
    "awarded-current-invocation",
  );
  assert.equal(classifySubmitAward("present", "422"), "submit-outcome-unknown");
  assert.equal(
    classifyOneShotPrOutcome(
      { pr_count: 0 },
      "awarded-current-invocation",
      "before-post",
    ),
    "post-once",
  );
  assert.equal(
    classifyOneShotPrOutcome({ pr_count: 0 }, "no-award", "timeout"),
    "submit-outcome-unknown",
  );
  assert.equal(
    classifyOneShotPrOutcome({ pr_count: 2 }, "no-award", "scan"),
    "conflict-cleanup",
  );
});

test("allocation, binder, submit award, and PR request schemas are exact", () => {
  const frontier = "release/voc-106-claim-genesis";
  const attempt = `release/voc-106-${SHA}-attempt-genesis`;
  const allocation = {
    attempt_ref: attempt,
    attempt_sha: SHA,
    claim_ref: frontier,
    claim_sha: SHA,
    frozen_develop_sha: SHA,
    frozen_develop_tree: TREE,
    frozen_main_sha: TREE,
    frozen_main_tree: SHA,
    frontier,
    issue_url: `https://github.com/${REPOSITORY}/issues/191`,
    repository: REPOSITORY,
    ruleset_history_version: "9",
    ruleset_id: "8",
    schema: "voc-106-allocation-state-v1",
  };
  assert.deepEqual(validateAllocationState(allocation), []);
  const allocationDigest = sha256(canonicalize(allocation));
  const binder = {
    attempt_ref: attempt,
    claim_ref: frontier,
    claim_sha: SHA,
    frozen_develop_sha: SHA,
    frozen_develop_tree: TREE,
    frozen_main_sha: TREE,
    frozen_main_tree: SHA,
    frontier,
    issue_url: `https://github.com/${REPOSITORY}/issues/191`,
    schema: "voc-106-attempt-binder-v1",
    submit_ref: `release/voc-106-submit-${allocationDigest}`,
    allocation_state_sha256: allocationDigest,
  };
  assert.deepEqual(validateAttemptBinder(binder), []);
  assert.deepEqual(
    validateSubmitAward({
      http_status: 201,
      submit_ref: binder.submit_ref,
      request_jcs_sha256: DIGEST,
      schema: "voc-106-submit-award-v1",
      sha: SHA,
    }),
    [],
  );
  assert.deepEqual(
    validateCanonicalPrRequest({
      base: "main",
      body: "binder",
      draft: true,
      head: attempt,
      maintainer_can_modify: false,
      title: "VOC-106 release promotion",
    }),
    [],
  );
  assert.notDeepEqual(validateAttemptBinder({ ...binder, extra: true }), []);
});

test("command capture is bound to exact inert argv and sorted ref projection", () => {
  const projection = [
    { name: `refs/heads/release/voc-106-submit-${DIGEST}`, sha: SHA },
  ];
  const capture = {
    schema: "voc-106-command-capture-v1",
    source: "git_ls_remote",
    argv: [
      "git",
      "ls-remote",
      "--heads",
      "origin",
      "refs/heads/release/voc-106-*",
    ],
    exit_code: 0,
    captured_at: TIME,
    stdout_sha256: DIGEST,
    stderr_sha256: sha256(""),
    projection,
    projection_jcs_sha256: sha256(canonicalize(projection)),
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  assert.deepEqual(validateCommandCapture(capture), []);
  assert.notDeepEqual(validateCommandCapture({ ...capture, exit_code: 1 }), []);
});

test("cardinality is resolved before terminal state and frontier is deterministic", () => {
  assert.equal(deriveFrontier([]), "release/voc-106-claim-genesis");
  assert.equal(
    deriveFrontier([{ number: "7", state: "closed", merged_at: null }]),
    "release/voc-106-claim-after-pr-7",
  );
  assert.equal(
    classifyMultiplicity([
      { number: "7", state: "closed", merged_at: TIME },
      { number: "8", state: "open", merged_at: null },
    ]).state,
    "conflict-cleanup",
  );
  assert.equal(
    classifyMultiplicity([
      { number: "7", state: "closed", merged_at: TIME },
      { number: "8", state: "closed", merged_at: TIME },
    ]).state,
    "irrecoverable",
  );
});

test("attempt state preserves protected stale and marker-zero holds", () => {
  assert.equal(
    deriveAttemptState({
      claim: { stale: true },
      attempt: {},
      submit: null,
      prs: [],
    }),
    "stale-protected-topology",
  );
  assert.equal(
    deriveAttemptState({ claim: {}, attempt: {}, submit: {}, prs: [] }),
    "submit-outcome-unknown",
  );
  assert.equal(
    deriveAttemptState({ claim: {}, attempt: {}, submit: null, prs: [] }),
    "attempt-ready-for-submit",
  );
});

test("operator actor maps to the exact attributable GitHub identity", () => {
  assert.equal(validateActorMapping(ACTOR.agent, ACTOR), true);
  assert.equal(validateActorMapping(ACTOR.agent, { ...ACTOR, id: "1" }), false);
  assert.equal(validateActorMapping("/root/child", ACTOR), false);
});

test("exact 25 policy surfaces are enforced with path-specific diagnostics", () => {
  assert.equal(CURRENT_POLICY_SURFACES.length, 25);
  assert.equal(new Set(CURRENT_POLICY_SURFACES).size, 25);
  const root = mkdtempSync(path.join(tmpdir(), "voc115-policy-"));
  const body = `${POLICY_MARKER}\nrelease/voc-106-claim-*\nrelease/voc-106-submit-*\nsubmit-outcome-unknown\nVOC-080-HOLD-01\n`;
  for (const relative of CURRENT_POLICY_SURFACES) {
    mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
    writeFileSync(path.join(root, relative), body);
  }
  assert.deepEqual(validateCurrentPolicySurfaces(root), []);
  writeFileSync(
    path.join(root, CURRENT_POLICY_SURFACES[0]),
    body.replace(POLICY_MARKER, "missing"),
  );
  assert.match(
    validateCurrentPolicySurfaces(root).join(";"),
    new RegExp(CURRENT_POLICY_SURFACES[0].replaceAll(".", "\\."), "u"),
  );
});

test("repository policy surfaces themselves satisfy the durable marker contract", () => {
  const root = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "../..",
  );
  assert.deepEqual(validateCurrentPolicySurfaces(root), []);
  assert.match(
    readFileSync(path.join(root, CURRENT_POLICY_SURFACES[0]), "utf8"),
    /VOC-115 durable release-attempt contract/u,
  );
});
