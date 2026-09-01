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
  buildRefRequest,
  buildStableState,
  canonicalize,
  classifyClaimRefRecovery,
  classifyBoundaryProvenance,
  classifyMultiplicity,
  classifyOneShotPrOutcome,
  classifySubmitAward,
  conflictDigest,
  createSubmitAward,
  deriveAttemptState,
  deriveExpectedPassMembers,
  deriveFrontier,
  deriveStableState,
  parseNextLink,
  parseLosslessJson,
  projectRulesetHistory,
  reconcileRefs,
  renderAttemptBinder,
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
  validateRefFormatAndLength,
  validateReconciliation,
  validateScanCapture,
  validateStableState,
  validateObjectCapture,
  validatePrDecimal,
  validateProjection,
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

function endpoint(source, number, subject) {
  const root = `https://api.github.com/repos/${REPOSITORY}`;
  if (source === "pulls")
    return `${root}/pulls?state=all&sort=created&direction=asc&per_page=100&page=${number}`;
  if (source === "timeline")
    return `${root}/issues/${subject ?? "7"}/timeline?per_page=100&page=${number}`;
  if (source === "matching_refs")
    return `${root}/git/matching-refs/heads/release/voc-106-?per_page=100&page=${number}`;
  return `${root}/rulesets/${subject ?? "8"}/history?per_page=100&page=${number}`;
}

function page(source, number, items, next = null, subject) {
  const capture = {
    schema: "voc-106-page-capture-v1",
    source,
    endpoint: endpoint(source, number, subject),
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

function historyRecord() {
  return {
    actor_id: "1",
    actor_type: "User",
    updated_at: TIME,
    version_id: "9",
  };
}

function stableFixture() {
  return buildStableState({
    ruleset: ruleset(),
    ruleset_history: [historyRecord()],
    protected_refs: [
      { name: "main", sha: TREE, tree: SHA },
      { name: "develop", sha: SHA, tree: TREE },
    ],
    all_pr_boundary: [],
    reserved_prs: [],
    timelines: [],
    refs: [],
  });
}

function stableWithPr(state = "closed", mergedAt = null, number = "7") {
  const attempt = `release/voc-106-${SHA}-attempt-genesis`;
  const boundaryRow = {
    head_label: `KARSIFT:${attempt}`,
    head_ref: attempt,
    head_repo_full_name: REPOSITORY,
    node_id: `${NODE}${number}`,
    number,
    updated_at: TIME,
  };
  const reserved = {
    base_ref: "main",
    base_sha: TREE,
    closed_at: state === "closed" ? TIME : null,
    created_at: TIME,
    draft: true,
    head_label: `KARSIFT:${attempt}`,
    head_ref: attempt,
    head_repo_full_name: REPOSITORY,
    head_sha: SHA,
    merge_commit_sha: mergedAt ? TREE : null,
    merged_at: mergedAt,
    node_id: `${NODE}${number}`,
    number,
    state,
    updated_at: TIME,
    user_id: "1",
    user_login: "m-e-h-r-d-a-a-d",
    user_node_id: "USER_node",
  };
  return buildStableState({
    ruleset: ruleset(),
    ruleset_history: [historyRecord()],
    protected_refs: [
      { name: "develop", sha: SHA, tree: TREE },
      { name: "main", sha: TREE, tree: SHA },
    ],
    all_pr_boundary: [boundaryRow],
    reserved_prs: [reserved],
    timelines: [{ events: [], pr_number: number }],
    refs: [{ name: `refs/heads/${attempt}`, sha: SHA }],
  });
}

function stableWithRefs(branches) {
  const base = stableFixture();
  return buildStableState({
    ruleset: base.ruleset,
    ruleset_history: base.ruleset_history,
    protected_refs: base.protected_refs,
    all_pr_boundary: [],
    reserved_prs: [],
    timelines: [],
    refs: branches.map((name) => ({ name: `refs/heads/${name}`, sha: SHA })),
  });
}

function objectCapture(source, projection) {
  const root = `https://api.github.com/repos/${REPOSITORY}`;
  const endpoints = {
    ruleset: `${root}/rulesets/8`,
    ruleset_history_version: `${root}/rulesets/8/history/9`,
    protected_ref: `${root}/git/ref/heads/${projection.name}`,
    git_commit: `${root}/git/commits/${projection.sha}`,
    reserved_pr: `${root}/pulls/${projection.number}`,
  };
  const capture = {
    schema: "voc-106-object-capture-v1",
    source,
    endpoint: endpoints[source],
    http_status: 200,
    etag: null,
    captured_at: TIME,
    raw_sha256: sha256(`${source}:${endpoints[source]}`),
    projection,
    projection_jcs_sha256: sha256(canonicalize(projection)),
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  return capture;
}

function scanCapture(source, pages) {
  const items = pages.flatMap((item) => item.items);
  const sorted = [...items].sort((a, b) => {
    const field =
      source === "pulls"
        ? "number"
        : source === "timeline"
          ? "id"
          : source === "ruleset_history_list"
            ? "version_id"
            : "name";
    if (field === "name")
      return Buffer.compare(Buffer.from(a.name), Buffer.from(b.name));
    return BigInt(a[field]) < BigInt(b[field])
      ? -1
      : BigInt(a[field]) > BigInt(b[field])
        ? 1
        : 0;
  });
  const high =
    source === "pulls"
      ? (sorted.at(-1)?.number ?? "0")
      : source === "timeline"
        ? (sorted.at(-1)?.id ?? "0")
        : source === "ruleset_history_list"
          ? (sorted.at(-1)?.version_id ?? "0")
          : (sorted.at(-1)?.name ?? null);
  const capture = {
    schema: "voc-106-scan-capture-v1",
    source,
    started_at: TIME,
    completed_at: TIME,
    pages: pages.map((item) => item.capture_sha256),
    page_count: String(pages.length),
    total_count: String(sorted.length),
    high_watermark: high,
    capture_sha256: "",
    state_projection_sha256: sha256(canonicalize(sorted)),
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  return capture;
}

function passContextFixture() {
  const stableState = stableFixture();
  const historyPages = [page("ruleset_history_list", 1, [historyRecord()])];
  const pullPages = [page("pulls", 1, [])];
  const refPages = [page("matching_refs", 1, [])];
  const current = ruleset();
  const versionState = { ...current };
  delete versionState.history_version;
  const version = {
    actor_id: "1",
    actor_type: "User",
    state: versionState,
    updated_at: TIME,
    version_id: "9",
  };
  const emptyCommand = {
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
    stdout_sha256: sha256(""),
    stderr_sha256: sha256(""),
    projection: [],
    projection_jcs_sha256: sha256(canonicalize([])),
    capture_sha256: "",
  };
  const commandPreimage = { ...emptyCommand };
  delete commandPreimage.capture_sha256;
  emptyCommand.capture_sha256 = sha256(canonicalize(commandPreimage));
  const registry = [
    {
      kind: "scan",
      source: "ruleset_history_list",
      subject: "ruleset:8",
      capture: scanCapture("ruleset_history_list", historyPages),
      auxiliary: { pages: historyPages },
    },
    {
      kind: "scan",
      source: "pulls",
      subject: REPOSITORY,
      capture: scanCapture("pulls", pullPages),
      auxiliary: { pages: pullPages },
    },
    {
      kind: "scan",
      source: "matching_refs",
      subject: "refs/heads/release/voc-106-",
      capture: scanCapture("matching_refs", refPages),
      auxiliary: { pages: refPages },
    },
    {
      kind: "command",
      source: "git_ls_remote",
      subject: "refs/heads/release/voc-106-",
      capture: emptyCommand,
      auxiliary: { stdout: "", stderr: "" },
    },
    {
      kind: "object",
      source: "ruleset",
      subject: "ruleset:8",
      capture: objectCapture("ruleset", current),
      auxiliary: {},
    },
    {
      kind: "object",
      source: "ruleset_history_version",
      subject: "version:9",
      capture: objectCapture("ruleset_history_version", version),
      auxiliary: {},
    },
    {
      kind: "object",
      source: "protected_ref",
      subject: "ref:develop",
      capture: objectCapture("protected_ref", stableState.protected_refs[0]),
      auxiliary: {},
    },
    {
      kind: "object",
      source: "protected_ref",
      subject: "ref:main",
      capture: objectCapture("protected_ref", stableState.protected_refs[1]),
      auxiliary: {},
    },
    {
      kind: "object",
      source: "git_commit",
      subject: `commit:${SHA}`,
      capture: objectCapture("git_commit", {
        parents: [],
        sha: SHA,
        tree: TREE,
      }),
      auxiliary: {},
    },
    {
      kind: "object",
      source: "git_commit",
      subject: `commit:${TREE}`,
      capture: objectCapture("git_commit", {
        parents: [],
        sha: TREE,
        tree: SHA,
      }),
      auxiliary: {},
    },
  ];
  return { stableState, registry };
}

function submitFixture() {
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
  const request = buildRefRequest(binder.submit_ref, SHA);
  const currentInvocationId = "invocation-1";
  const response = {
    http_status: 201,
    ref: request.ref,
    sha: request.sha,
    invocation_id: currentInvocationId,
    received_synchronously: true,
  };
  const context = {
    allocation,
    binder,
    request,
    response,
    currentInvocationId,
    markerPresent: true,
  };
  const award = createSubmitAward(context);
  return { ...context, award };
}

function rehash(capture) {
  const copy = structuredClone(capture);
  delete copy.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(copy));
  return capture;
}

function passFixture(context, label) {
  const capture = {
    schema: "voc-106-pass-capture-v1",
    pass: label,
    started_at: TIME,
    completed_at: TIME,
    members: deriveExpectedPassMembers(context.stableState, context.registry),
    member_count: String(context.registry.length),
    stable_state_sha256: sha256(canonicalize(context.stableState)),
    capture_sha256: "",
  };
  return rehash(capture);
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
  assert.equal(
    parseLosslessJson('{"id":9223372036854775807}').id,
    "9223372036854775807",
  );
  assert.throws(() => parseLosslessJson('{"id":1e16}'), /non-integer/u);
  assert.throws(() => parseLosslessJson('{"id":1.0}'), /non-integer/u);
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
  assert.match(
    validatePageCapture(foreign).join(";"),
    /canonical source endpoint/u,
  );
});

test("source endpoints, Link next relation, and 100/101 sentinels are exact", () => {
  for (const [source, subject, items] of [
    ["pulls", undefined, []],
    ["timeline", "7", []],
    ["matching_refs", undefined, []],
    ["ruleset_history_list", "8", [historyRecord()]],
  ])
    assert.deepEqual(
      validatePageCapture(page(source, 1, items, null, subject)),
      [],
    );
  const next = endpoint("pulls", 2);
  assert.equal(
    parseNextLink(`<${next}>; rel="next"`, "pulls", REPOSITORY, "1"),
    next,
  );
  assert.throws(
    () =>
      parseNextLink(`<${next}&extra=1>; rel="next"`, "pulls", REPOSITORY, "1"),
    /canonical successor/u,
  );
  assert.throws(
    () =>
      parseNextLink(
        `<${next}>; rel="next", <${next}>; rel="next"`,
        "pulls",
        REPOSITORY,
        "1",
      ),
    /exactly one/u,
  );
  const hundred = Array.from({ length: 100 }, (_, index) =>
    boundary(index + 1),
  );
  assert.deepEqual(
    validatePagination(
      [page("pulls", 1, hundred, next), page("pulls", 2, [])],
      "pulls",
    ),
    [],
  );
  assert.match(
    validatePagination([page("pulls", 1, hundred, null)], "pulls").join(";"),
    /successor/u,
  );
  assert.deepEqual(
    validatePagination(
      [page("pulls", 1, hundred, next), page("pulls", 2, [boundary(101)])],
      "pulls",
    ),
    [],
  );
});

test("scan schemas derive source counts, projection digest, and high watermarks", () => {
  const pages = [page("pulls", 1, [boundary(2), boundary(7)])];
  const capture = scanCapture("pulls", pages);
  assert.deepEqual(validateScanCapture(capture, pages), []);
  const wrongHigh = rehash({
    ...structuredClone(capture),
    high_watermark: "6",
  });
  assert.match(
    validateScanCapture(wrongHigh, pages).join(";"),
    /high watermark/u,
  );
  const wrongCount = rehash({ ...structuredClone(capture), total_count: "02" });
  assert.notDeepEqual(validateScanCapture(wrongCount, pages), []);
  const emptyHistoryPages = [page("ruleset_history_list", 1, [])];
  assert.match(
    validateScanCapture(
      scanCapture("ruleset_history_list", emptyHistoryPages),
      emptyHistoryPages,
    ).join(";"),
    /cannot be empty/u,
  );
});

test("every object source binds exact endpoint, projection schema, and ruleset version", () => {
  const state = stableFixture();
  const current = state.ruleset;
  const selectedHistory = historyRecord();
  const versionState = { ...current };
  delete versionState.history_version;
  const version = { ...selectedHistory, state: versionState };
  const fixtures = [
    [objectCapture("ruleset", current), {}],
    [
      objectCapture("ruleset_history_version", version),
      { currentRuleset: current, selectedHistory },
    ],
    [objectCapture("protected_ref", state.protected_refs[0]), {}],
    [objectCapture("git_commit", { parents: [], sha: SHA, tree: TREE }), {}],
  ];
  for (const [capture, context] of fixtures)
    assert.deepEqual(validateObjectCapture(capture, context), []);
  const wrong = rehash({
    ...structuredClone(fixtures[2][0]),
    endpoint: `https://api.github.com/repos/${REPOSITORY}/git/ref/heads/main`,
  });
  assert.match(validateObjectCapture(wrong).join(";"), /endpoint/u);
  const driftedVersion = structuredClone(fixtures[1][0]);
  driftedVersion.projection.state.enforcement = "disabled";
  driftedVersion.projection_jcs_sha256 = sha256(
    canonicalize(driftedVersion.projection),
  );
  rehash(driftedVersion);
  assert.match(
    validateObjectCapture(driftedVersion, fixtures[1][1]).join(";"),
    /state mismatch/u,
  );
});

test("every frozen projection rejects each omitted key and every extra key", () => {
  const withPr = stableWithPr();
  const event = {
    actor_id: null,
    actor_login: null,
    actor_node_id: null,
    assignee_id: null,
    assignee_login: null,
    assignee_node_id: null,
    commit_id: null,
    created_at: TIME,
    event: "closed",
    id: "1",
    node_id: null,
  };
  const fixtures = [
    ["pr_boundary", withPr.all_pr_boundary[0]],
    ["reserved_pr", withPr.reserved_prs[0]],
    ["timeline", event],
    ["ref", withPr.refs[0]],
    ["git_commit", { parents: [], sha: SHA, tree: TREE }],
    ["protected", withPr.protected_refs[0]],
    ["ruleset_history", historyRecord()],
  ];
  for (const [kind, fixture] of fixtures) {
    assert.deepEqual(validateProjection(kind, fixture), []);
    for (const key of Object.keys(fixture)) {
      const changed = structuredClone(fixture);
      delete changed[key];
      assert.notDeepEqual(
        validateProjection(kind, changed),
        [],
        `${kind} omitted ${key}`,
      );
    }
    assert.notDeepEqual(
      validateProjection(kind, { ...fixture, extra: true }),
      [],
    );
  }
});

test("capture, stable, pass, reconciliation, award, and PR schemas reject every missing/extra key", () => {
  const passContext = passContextFixture();
  const pass1 = passFixture(passContext, "1");
  const pass2 = passFixture(passContext, "2");
  const scanEntry = passContext.registry.find((item) => item.kind === "scan");
  const objectEntry = passContext.registry.find(
    (item) => item.source === "protected_ref",
  );
  const submit = submitFixture();
  const reconciliation = {
    schema: "voc-106-reconciliation-v1",
    pass_1_capture_sha256: pass1.capture_sha256,
    pass_2_capture_sha256: pass2.capture_sha256,
    stable_state_sha256: sha256(canonicalize(passContext.stableState)),
    frozen_develop_sha: SHA,
    frozen_develop_tree: TREE,
    frozen_main_sha: TREE,
    frozen_main_tree: SHA,
    frontier: "release/voc-106-claim-genesis",
    claim_ref: null,
    claim_sha: null,
    attempt_ref: null,
    submit_ref: null,
    submit_state: "absent",
    pr_number: null,
    pr_node_id: null,
  };
  const join = {
    pass1,
    pass2,
    pass1Context: passContext,
    pass2Context: passContext,
    stableState: passContext.stableState,
  };
  const prRequest = {
    base: "main",
    body: renderAttemptBinder(submit.binder),
    draft: true,
    head: submit.allocation.attempt_ref,
    maintainer_can_modify: false,
    title: "VOC-106 release promotion",
  };
  const cases = [
    [
      scanEntry.capture,
      (value) => validateScanCapture(value, scanEntry.auxiliary.pages),
    ],
    [objectEntry.capture, (value) => validateObjectCapture(value)],
    [passContext.stableState, validateStableState],
    [pass1, (value) => validatePassCapture(value, passContext)],
    [reconciliation, (value) => validateReconciliation(value, join)],
    [submit.award, (value) => validateSubmitAward(value, submit)],
    [
      prRequest,
      (value) =>
        validateCanonicalPrRequest(value, {
          allocation: submit.allocation,
          binder: submit.binder,
          award: submit.award,
          awardContext: submit,
          client: { retries: 0, redirects: false },
        }),
    ],
  ];
  for (const [fixture, validator] of cases) {
    for (const key of Object.keys(fixture)) {
      const changed = structuredClone(fixture);
      delete changed[key];
      assert.notDeepEqual(validator(changed), [], `omitted ${key}`);
    }
    assert.notDeepEqual(validator({ ...fixture, extra: true }), []);
  }
});

test("stable-state mutations fail ordering, count, high-watermark, and provenance", () => {
  const state = stableWithPr();
  assert.deepEqual(validateStableState(state), []);
  for (const mutate of [
    (value) => {
      value.counts.all_prs = "2";
    },
    (value) => {
      value.high_watermarks.all_pr_number = "8";
    },
    (value) => {
      value.ruleset_history[0].version_id = "10";
    },
    (value) => {
      value.all_pr_boundary[0].head_repo_full_name = null;
    },
    (value) => {
      value.timelines[0].pr_number = "8";
    },
  ]) {
    const changed = structuredClone(state);
    mutate(changed);
    assert.notDeepEqual(validateStableState(changed), []);
  }
});

test("pass registry rejects omission, duplicate, reorder, substitution, and stable drift", () => {
  const context = passContextFixture();
  const pass = passFixture(context, "1");
  assert.deepEqual(validatePassCapture(pass, context), []);
  const reordered = structuredClone(pass);
  reordered.members.reverse();
  rehash(reordered);
  assert.match(validatePassCapture(reordered, context).join(";"), /inventory/u);
  const duplicated = {
    ...context,
    registry: [...context.registry, context.registry[0]],
  };
  assert.match(validatePassCapture(pass, duplicated).join(";"), /duplicate/u);
  const wrongStable = rehash({
    ...structuredClone(pass),
    stable_state_sha256: DIGEST,
  });
  assert.match(
    validatePassCapture(wrongStable, context).join(";"),
    /stable digest/u,
  );
});

test("reconciliation joins exact pass captures, stable topology, state, and nullability", () => {
  const context = passContextFixture();
  const pass1 = passFixture(context, "1");
  const pass2 = passFixture(context, "2");
  const state = context.stableState;
  const value = {
    schema: "voc-106-reconciliation-v1",
    pass_1_capture_sha256: pass1.capture_sha256,
    pass_2_capture_sha256: pass2.capture_sha256,
    stable_state_sha256: sha256(canonicalize(state)),
    frozen_develop_sha: SHA,
    frozen_develop_tree: TREE,
    frozen_main_sha: TREE,
    frozen_main_tree: SHA,
    frontier: "release/voc-106-claim-genesis",
    claim_ref: null,
    claim_sha: null,
    attempt_ref: null,
    submit_ref: null,
    submit_state: "absent",
    pr_number: null,
    pr_node_id: null,
  };
  const join = {
    pass1,
    pass2,
    pass1Context: context,
    pass2Context: context,
    stableState: state,
  };
  assert.deepEqual(validateReconciliation(value, join), []);
  assert.match(
    validateReconciliation(
      { ...value, pass_1_capture_sha256: pass2.capture_sha256 },
      join,
    ).join(";"),
    /join mismatch/u,
  );
  assert.match(
    validateReconciliation({ ...value, submit_state: "consumed" }, join).join(
      ";",
    ),
    /requires exact PR/u,
  );
  assert.match(
    validateReconciliation(
      { ...value, submit_state: "awarded-current-invocation" },
      { ...join, persisted: true },
    ).join(";"),
    /cannot be persisted/u,
  );
});

test("ref byte limits and branch/full forms cover every maximum grammar", () => {
  const branches = [
    "release/voc-106-claim-genesis",
    "release/voc-106-claim-after-pr-2147483647",
    `release/voc-106-claim-after-conflict-${DIGEST}`,
    `release/voc-106-${SHA}-attempt-genesis`,
    `release/voc-106-${SHA}-attempt-after-pr-2147483647`,
    `release/voc-106-${SHA}-attempt-after-conflict-${DIGEST}`,
    `release/voc-106-submit-${DIGEST}`,
  ];
  const expectedLengths = [
    [29, 40],
    [41, 52],
    [101, 112],
    [72, 83],
    [84, 95],
    [144, 155],
    [87, 98],
  ];
  for (const [index, branch] of branches.entries()) {
    assert.equal(validateRefFormatAndLength(branch, "branch-v1"), true);
    assert.equal(
      validateRefFormatAndLength(`refs/heads/${branch}`, "full-ref-v1"),
      true,
    );
    assert.equal(Buffer.byteLength(branch), expectedLengths[index][0]);
    assert.equal(
      Buffer.byteLength(`refs/heads/${branch}`),
      expectedLengths[index][1],
    );
  }
  assert.equal(
    validateRefFormatAndLength(`refs/heads/${branches[0]}`, "branch-v1"),
    false,
  );
  assert.equal(
    validateAttemptName(`release/voc-106-${SHA}-attempt-after-pr-2147483648`),
    false,
  );
});

test("pagination requires consecutive pages, terminal short page, and no duplicates", () => {
  const hundred = Array.from({ length: 100 }, (_, index) =>
    boundary(index + 1),
  );
  const next = endpoint("pulls", 2);
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
  const state = stableFixture();
  assert.deepEqual(validateStableState(state), []);
  assert.equal(
    deriveStableState([state, structuredClone(state)]).state.schema,
    "voc-106-stable-state-v1",
  );
  assert.throws(
    () =>
      deriveStableState([
        state,
        { ...structuredClone(state), repository: "foreign/repo" },
      ]),
    /stable-state/u,
  );
  assert.throws(() => deriveStableState([{ head: SHA }]), /exactly two/u);
});

test("pass receipt binds ordered complete member list and its own preimage", () => {
  const context = passContextFixture();
  const members = deriveExpectedPassMembers(
    context.stableState,
    context.registry,
  );
  const capture = {
    schema: "voc-106-pass-capture-v1",
    pass: "1",
    started_at: TIME,
    completed_at: TIME,
    members,
    member_count: String(members.length),
    stable_state_sha256: sha256(canonicalize(context.stableState)),
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  assert.deepEqual(validatePassCapture(capture, context), []);
  const omitted = { ...context, registry: context.registry.slice(1) };
  assert.match(validatePassCapture(capture, omitted).join(";"), /omission/u);
  assert.match(
    validatePassCapture({ ...capture, member_count: "0" }, context).join(";"),
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
  const fixture = submitFixture();
  assert.equal(classifySubmitAward(fixture), "awarded-current-invocation");
  assert.equal(
    classifySubmitAward({
      ...fixture,
      response: { ...fixture.response, http_status: 422 },
    }),
    "submit-outcome-unknown",
  );
  assert.equal(
    classifyOneShotPrOutcome({
      matchingPrCount: 0,
      postCount: 0,
      markerPresent: true,
      award: fixture.award,
      awardContext: fixture,
      postStarted: false,
      crashed: false,
      restarted: false,
      handedOff: false,
    }),
    "post-once",
  );
  assert.equal(
    classifyOneShotPrOutcome({
      matchingPrCount: 0,
      postCount: 0,
      markerPresent: true,
      award: null,
      awardContext: null,
      postStarted: true,
      crashed: true,
      restarted: true,
      handedOff: false,
    }),
    "submit-outcome-unknown",
  );
  assert.equal(
    classifyOneShotPrOutcome({
      matchingPrCount: 2,
      postCount: 1,
      markerPresent: true,
    }),
    "conflict-cleanup",
  );
});

test("allocation, binder, submit award, and PR request schemas are exact", () => {
  const fixture = submitFixture();
  const { allocation, binder, award } = fixture;
  assert.deepEqual(validateAllocationState(allocation), []);
  assert.deepEqual(validateAttemptBinder(binder), []);
  assert.deepEqual(validateSubmitAward(award, fixture), []);
  const request = {
    base: "main",
    body: renderAttemptBinder(binder),
    draft: true,
    head: allocation.attempt_ref,
    maintainer_can_modify: false,
    title: "VOC-106 release promotion",
  };
  assert.deepEqual(
    validateCanonicalPrRequest(request, {
      allocation,
      binder,
      award,
      awardContext: fixture,
      client: { retries: 0, redirects: false },
    }),
    [],
  );
  assert.notDeepEqual(
    validateCanonicalPrRequest(
      { ...request, body: "binder" },
      {
        allocation,
        binder,
        award,
        awardContext: fixture,
        client: { retries: 0, redirects: false },
      },
    ),
    [],
  );
  assert.notDeepEqual(
    validateSubmitAward(award, { ...fixture, currentInvocationId: "handoff" }),
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
    stdout_sha256: sha256(`${SHA}\t${projection[0].name}\n`),
    stderr_sha256: sha256(""),
    projection,
    projection_jcs_sha256: sha256(canonicalize(projection)),
    capture_sha256: "",
  };
  const preimage = { ...capture };
  delete preimage.capture_sha256;
  capture.capture_sha256 = sha256(canonicalize(preimage));
  const raw = { stdout: `${SHA}\t${projection[0].name}\n`, stderr: "" };
  assert.deepEqual(validateCommandCapture(capture, raw), []);
  assert.notDeepEqual(
    validateCommandCapture({ ...capture, exit_code: 1 }, raw),
    [],
  );
});

test("cardinality is resolved before terminal state and frontier is deterministic", () => {
  assert.equal(
    deriveFrontier(stableFixture()),
    "release/voc-106-claim-genesis",
  );
  assert.equal(
    deriveFrontier(stableWithPr()),
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
  const claim = "release/voc-106-claim-genesis";
  const attempt = `release/voc-106-${SHA}-attempt-genesis`;
  const submit = `release/voc-106-submit-${DIGEST}`;
  assert.equal(
    deriveAttemptState({
      stableState: stableWithRefs([claim]),
      claim: { ref: claim, sha: SHA, stale: true },
      attempt: null,
      submit: null,
    }),
    "stale-protected-topology",
  );
  assert.equal(
    deriveAttemptState({
      stableState: stableWithRefs([claim, attempt, submit]),
      claim: { ref: claim, sha: SHA },
      attempt: { ref: attempt, sha: SHA },
      submit: { ref: submit, sha: SHA },
    }),
    "submit-outcome-unknown",
  );
  assert.equal(
    deriveAttemptState({
      stableState: stableWithRefs([claim, attempt]),
      claim: { ref: claim, sha: SHA },
      attempt: { ref: attempt, sha: SHA },
      submit: null,
    }),
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
