import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  evaluateDeliveryEvent,
  inspectDeliveryWorkflow,
  loadDeliveryManifest,
  parseJsonc,
  canonicalize,
  parseStrictJson,
  resolveVersionId,
  validateDeliveryRepository,
} from "./cloudflare-delivery-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const exactSha = "a".repeat(40);
const apiVersion = "11111111-1111-4111-8111-111111111111";
const webVersion = "22222222-2222-4222-8222-222222222222";
const evidence =
  "https://github.com/KARSIFT/vocanova-platform/pull/123#issuecomment-456";

test("held delivery manifest, Wrangler environments, workflow, and migration ceiling agree", () => {
  assert.deepEqual(validateDeliveryRepository(repositoryRoot), []);
});

test("JSONC parsing preserves URLs while removing comments and trailing commas", () => {
  assert.deepEqual(
    parseJsonc('{"url":"https://example.invalid/a//b",/* x */"items":[1,],}'),
    { url: "https://example.invalid/a//b", items: [1] },
  );
});

test("strict JSON/JCS rejects duplicate keys, unsafe integers, and non-canonical bytes", () => {
  assert.deepEqual(parseStrictJson('{"a":1,"b":[true,null]}'), {
    a: 1,
    b: [true, null],
  });
  assert.throws(() => parseStrictJson('{"a":1,"a":2}'), /duplicate JSON key/);
  assert.throws(() => parseStrictJson('{"a":9007199254740992}'), /safe range/);
  assert.notEqual(canonicalize({ b: 1, a: 2 }), '{"b":1,"a":2}');
});

test("Node and Python independently reproduce all sixteen locked tuple/schema digests", () => {
  const manifest = loadDeliveryManifest(repositoryRoot);
  const binder = manifest.environments.staging.prepared_runtime_binder;
  const contract = binder.contract;
  const mappings = {
    prepared_staging_tuple_sha256: binder.prepared_staging_tuple,
    shared_definitions_sha256: contract.shared_definitions,
    api_envelope_schema_sha256: contract.api_envelope_schema,
    settings_authority_body_schema_sha256:
      contract.record_body_schemas.settings_authority,
    act03_body_schema_sha256: contract.record_body_schemas.act03,
    pr2_exact_review_body_schema_sha256:
      contract.record_body_schemas.pr2_exact_review,
    act04_authority_body_schema_sha256:
      contract.record_body_schemas.act04_authority,
    binder_review_body_schema_sha256:
      contract.record_body_schemas.binder_review,
  };
  const expected = {
    prepared_staging_tuple_sha256: binder.prepared_staging_tuple_sha256,
    ...binder.contract_digests,
  };
  const nodeDigests = Object.fromEntries(
    Object.entries(mappings).map(([name, mapping]) => {
      const value = structuredClone(mapping);
      if (name !== "prepared_staging_tuple_sha256") delete value.schema_sha256;
      return [name, shaText(canonicalize(value))];
    }),
  );
  assert.deepEqual(nodeDigests, expected);

  const python = spawnSync(
    "python3",
    [
      "-c",
      [
        "import hashlib,json,sys",
        "m=json.load(open(sys.argv[1],encoding='utf-8'))",
        "b=m['environments']['staging']['prepared_runtime_binder']",
        "c=b['contract']",
        "maps={'prepared_staging_tuple_sha256':b['prepared_staging_tuple'],'shared_definitions_sha256':c['shared_definitions'],'api_envelope_schema_sha256':c['api_envelope_schema'],'settings_authority_body_schema_sha256':c['record_body_schemas']['settings_authority'],'act03_body_schema_sha256':c['record_body_schemas']['act03'],'pr2_exact_review_body_schema_sha256':c['record_body_schemas']['pr2_exact_review'],'act04_authority_body_schema_sha256':c['record_body_schemas']['act04_authority'],'binder_review_body_schema_sha256':c['record_body_schemas']['binder_review']}",
        "out={} ",
        "for n,v in maps.items():",
        " v=dict(v); v.pop('schema_sha256',None) if n!='prepared_staging_tuple_sha256' else None",
        " raw=json.dumps(v,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode()",
        " out[n]=hashlib.sha256(raw).hexdigest()",
        "print(json.dumps(out,sort_keys=True))",
      ].join("\n"),
      resolve(
        repositoryRoot,
        "infrastructure/cloudflare/delivery-manifest.json",
      ),
    ],
    { encoding: "utf8" },
  );
  assert.equal(python.status, 0, python.stderr);
  assert.deepEqual(JSON.parse(python.stdout), expected);
});

test("prepared staging accepts one exact offline runtime-binder chain", async () => {
  const fixture = runtimeBinderFixture();
  const decision = await evaluateDeliveryEvent(
    fixture.manifest,
    fixture.event,
    {
      http: fixture.http,
      now: new Date("2026-08-27T00:09:00Z"),
      rateLimitMinimum: 40,
    },
  );
  assert.deepEqual(decision, {
    eligible: true,
    environment: "staging",
    reasons: [],
  });
});

test("runtime binder rejects reruns, spoofed checks, network failure, and fixture-like inputs", async () => {
  for (const [name, mutate, pattern] of [
    [
      "rerun",
      (fixture) => {
        fixture.responses.get(
          `/repos/KARSIFT/vocanova-platform/actions/runs/${fixture.event.run_id}`,
        ).run_attempt = 2;
      },
      /first binder attempt/,
    ],
    [
      "spoofed check",
      (fixture) => {
        fixture.responses.get(
          `/repos/KARSIFT/vocanova-platform/commits/${fixture.event.sha}/check-runs?filter=all&per_page=100&page=1`,
        ).check_runs[0].details_url =
          "https://github.com/KARSIFT/vocanova-platform/actions/runs/101/job/9999";
      },
      /required check|hosted check/,
    ],
    [
      "non-canonical push URL",
      (fixture) => {
        fixture.responses.get(
          `/repos/KARSIFT/vocanova-platform/actions/runs?branch=develop&event=push&head_sha=${fixture.event.sha}&per_page=100&page=1`,
        ).workflow_runs[0].url =
          "https://attacker.invalid/repos/KARSIFT/vocanova-platform/actions/runs/101";
      },
      /run URL is not canonical/,
    ],
    [
      "pending pre-review check",
      (fixture) => {
        const check = fixture.responses.get(
          `/repos/KARSIFT/vocanova-platform/commits/${fixture.event.sha}/check-runs?filter=all&per_page=100&page=1`,
        ).check_runs[0];
        check.status = "in_progress";
        check.conclusion = null;
        check.completed_at = null;
      },
      /pending pre-review candidate/,
    ],
    [
      "fixture-mode input",
      (fixture) => {
        fixture.event.inputs.fixture_mode = "true";
        fixture.failAllRequests = true;
      },
      /GitHub API request failed/,
    ],
  ]) {
    const fixture = runtimeBinderFixture();
    mutate(fixture);
    const decision = await evaluateDeliveryEvent(
      fixture.manifest,
      fixture.event,
      {
        http: async (...args) =>
          fixture.failAllRequests
            ? jsonResponse({ message: "offline" }, 503)
            : fixture.http(...args),
        now: new Date("2026-08-27T00:09:00Z"),
        rateLimitMinimum: 40,
      },
    );
    assert.equal(decision.eligible, false, name);
    assert.match(decision.reasons.join("\n"), pattern, name);
  }
});

test("pull requests and prepared staging without a runtime binder cannot deploy", async () => {
  const manifest = loadDeliveryManifest(repositoryRoot);
  const pullRequest = await evaluateDeliveryEvent(manifest, {
    event_name: "pull_request",
    ref: "refs/pull/1/merge",
    sha: exactSha,
    inputs: {},
  });
  assert.equal(pullRequest.eligible, false);
  assert.match(pullRequest.reasons.join("\n"), /explicit workflow_dispatch/);

  const manual = await evaluateDeliveryEvent(manifest, eventFor("staging"));
  assert.equal(manual.eligible, false);
  assert.match(
    manual.reasons.join("\n"),
    /URL is not canonical|digest is invalid/,
  );
});

test("the legacy production evaluator remains structurally held but passes a complete synthetic authorized record", async () => {
  const manifest = authorizedManifest("production");
  assert.deepEqual(
    await evaluateDeliveryEvent(manifest, eventFor("production"), {
      now: new Date("2026-08-22T00:00:00Z"),
    }),
    { eligible: true, environment: "production", reasons: [] },
  );
});

test("stale SHA, missing authority, wrong ref, environment mix-up, and cost fail closed", async () => {
  const cases = [
    ["stale SHA", { reviewed_sha: "b".repeat(40) }, /reviewed_sha/],
    ["missing authority", { action_authority_url: "" }, /action authority/],
    ["wrong ref", {}, /requires refs\/heads\/main/, "refs/heads/develop"],
    [
      "environment mix-up",
      { delivery_environment: "staging" },
      /VOC-080-HOLD-00|runtime binder|canonical issue|digest is invalid/,
    ],
    ["cost", { estimated_cost_cents: "1" }, /cost exceeds/],
    [
      "bad rollback ID",
      { previous_api_version_id: "latest" },
      /version ID is invalid/,
    ],
    ["bad confirmation", { confirmation: "yes" }, /manual confirmation/],
  ];
  for (const [name, inputChanges, pattern, ref = "refs/heads/main"] of cases) {
    const decision = await evaluateDeliveryEvent(
      authorizedManifest("production"),
      {
        ...eventFor("production"),
        ref,
        inputs: { ...eventFor("production").inputs, ...inputChanges },
      },
      { now: new Date("2026-08-22T00:00:00Z") },
    );
    assert.equal(decision.eligible, false, name);
    assert.match(decision.reasons.join("\n"), pattern, name);
  }
});

test("production additionally requires matching staging and backup evidence", async () => {
  const manifest = authorizedManifest("production");
  const passing = await evaluateDeliveryEvent(
    manifest,
    eventFor("production"),
    { now: new Date("2026-08-22T00:00:00Z") },
  );
  assert.equal(passing.eligible, true);

  const missing = eventFor("production");
  missing.inputs.backup_evidence_url = "";
  const blocked = await evaluateDeliveryEvent(manifest, missing, {
    now: new Date("2026-08-22T00:00:00Z"),
  });
  assert.equal(blocked.eligible, false);
  assert.match(blocked.reasons.join("\n"), /backup\/Time Travel evidence/);
});

test("workflow policy rejects PR secret exposure, cancellation, and an unguarded production job", () => {
  const source = readFileSync(
    resolve(repositoryRoot, ".github/workflows/ci.yml"),
    "utf8",
  );
  for (const [changed, pattern] of [
    [
      source.replace(
        "cancel-in-progress: ${{ github.event_name != 'workflow_dispatch' }}",
        "cancel-in-progress: true",
      ),
      /must not be cancelled/,
    ],
    [
      source.replace(
        "needs.delivery-gate.outputs.environment == 'production'",
        "github.ref == 'refs/heads/main'",
      ),
      /production delivery job missing/,
    ],
    [
      source.replace(
        "run: pnpm run ci:delivery",
        "env:\n          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n        run: pnpm run ci:delivery",
      ),
      /delivery policy job must be credential-free/,
    ],
    [
      source.replace(
        'test -n "$CLOUDFLARE_API_TOKEN" && test -n "$CLOUDFLARE_ACCOUNT_ID"',
        "true",
      ),
      /staging delivery job missing/,
    ],
  ]) {
    assert.ok(
      inspectDeliveryWorkflow(changed).some((error) => pattern.test(error)),
    );
  }
});

test("version evidence resolves one exact tagged UUID and rejects missing or ambiguous tags", () => {
  const versions = [
    { id: apiVersion, annotations: { "workers/tag": `sha-${exactSha}` } },
    { id: webVersion, annotations: { "workers/tag": "other" } },
  ];
  assert.equal(resolveVersionId(versions, `sha-${exactSha}`), apiVersion);
  assert.throws(() => resolveVersionId(versions, "missing"), /exactly one/);
  assert.throws(
    () => resolveVersionId([...versions, versions[0]], `sha-${exactSha}`),
    /exactly one/,
  );
});

function eventFor(environment) {
  const production = environment === "production";
  return {
    event_name: "workflow_dispatch",
    ref: production ? "refs/heads/main" : "refs/heads/develop",
    sha: exactSha,
    inputs: {
      delivery_environment: environment,
      reviewed_sha: exactSha,
      action_authority_url: evidence,
      estimated_cost_cents: "0",
      previous_api_version_id: apiVersion,
      previous_web_version_id: webVersion,
      confirmation: `DEPLOY ${environment} ${exactSha}`,
      staging_evidence_url: production ? evidence : "",
      backup_evidence_url: production ? evidence : "",
    },
  };
}

function authorizedManifest(environment) {
  const manifest = structuredClone(loadDeliveryManifest(repositoryRoot));
  manifest.status = "authorized";
  const record = manifest.environments[environment];
  record.state = "authorized";
  record.cost_ceiling_cents = 0;
  record.d1.database_id =
    environment === "staging"
      ? "33333333-3333-4333-8333-333333333333"
      : "44444444-4444-4444-8444-444444444444";
  record.routes.api = `https://api-${environment}.example.com`;
  record.routes.web = `https://web-${environment}.example.com`;
  record.authority_evidence_url = evidence;
  record.resource_manifest_evidence_url = evidence;
  record.rollback_rehearsal_url = evidence;
  record.authorization_expires_at = "2026-08-23T00:00:00Z";
  if (environment === "production") {
    record.staging_evidence_url = evidence;
    record.backup_evidence_url = evidence;
  }
  return manifest;
}

function runtimeBinderFixture() {
  const manifest = loadDeliveryManifest(repositoryRoot);
  const binder = manifest.environments.staging.prepared_runtime_binder;
  const definitions = binder.contract.shared_definitions;
  const bodies = {};
  for (const [name, schema] of Object.entries(
    binder.contract.record_body_schemas,
  )) {
    bodies[name] = exampleForSchema(schema, definitions);
  }

  const pr1Sha = "1".repeat(40);
  const pr2Head = "2".repeat(40);
  const pr2Merge = exactSha;
  const pr2 = {
    pull_request_number: 166,
    head_sha: pr2Head,
    merge_sha: pr2Merge,
    base: "develop",
    ref: "refs/heads/develop",
    merged_at: "2026-08-27T00:02:00Z",
  };
  const executableDigests = {
    manifest_sha256: fileSha(
      "infrastructure/cloudflare/delivery-manifest.json",
    ),
    workflow_sha256: fileSha(".github/workflows/ci.yml"),
    policy_sha256: fileSha("scripts/foundation/cloudflare-delivery-policy.mjs"),
  };
  const tupleBinding = {
    schema: "vocanova-voc096-prepared-staging-tuple-v1",
    canonicalization: "RFC-8785-JCS",
    sha256: binder.prepared_staging_tuple_sha256,
  };
  const actor = (id, role, revision) => ({
    actor_id: id,
    role,
    provenance: {
      schema: "vocanova-voc096-actor-provenance-v1",
      participant_kind: "separately-instantiated-ai",
      assignment_scope: "KARSIFT/vocanova-platform#158/VOC-096",
      assignment_revision: revision,
      session_reference: `session-${id}`,
      provider: "OpenAI",
      model: "test-fixture",
      non_authorship_of_reviewed_revision: true,
    },
  });
  const settingsActor = actor(
    "settings-authority",
    "settings-accountable-authority",
    pr1Sha,
  );
  const operator = actor(
    "settings-operator",
    "github-settings-operator",
    pr1Sha,
  );
  const pr2Reviewer = actor(
    "pr2-reviewer",
    "merged-pr2-exact-reviewer",
    pr2Merge,
  );
  const authorityActor = actor(
    "act04-authority",
    "act04-accountable-actor",
    pr2Merge,
  );
  const binderReviewer = actor(
    "binder-reviewer",
    "act04-binder-reviewer",
    pr2Merge,
  );

  Object.assign(bodies.settings_authority, {
    actor: settingsActor,
    authorized_settings_operator: operator,
    pr1: { ...bodies.settings_authority.pr1, head_sha: pr1Sha },
    tuple_binding: tupleBinding,
    expires_at: "2026-08-27T00:30:00Z",
  });
  bodies.settings_authority.environment.mutated_secret_names = [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
  ];
  Object.assign(bodies.act03, {
    actor: operator,
    operation: bodies.settings_authority.operation,
    pr1: bodies.settings_authority.pr1,
    environment: bodies.settings_authority.environment,
    phase4_token: bodies.settings_authority.phase4_token,
    rollback: bodies.settings_authority.rollback,
    tuple_binding: tupleBinding,
  });
  bodies.act03.phase4_token.expires_at = "2026-08-27T01:00:00Z";

  const pushRuns = REQUIRED_WORKFLOW_FIXTURES.map((fixture, index) => {
    const runId = String(101 + index);
    const suiteId = String(301 + index);
    return {
      id: Number(runId),
      name: fixture.workflow,
      path: fixture.path,
      workflow_id: fixture.workflowId,
      check_suite_id: Number(suiteId),
      event: "push",
      head_branch: "develop",
      head_sha: pr2Merge,
      status: "completed",
      conclusion: "success",
      run_attempt: 1,
      created_at: "2026-08-27T00:03:00Z",
      run_started_at: "2026-08-27T00:03:10Z",
      updated_at: "2026-08-27T00:03:40Z",
      url: `https://api.github.com/repos/KARSIFT/vocanova-platform/actions/runs/${runId}`,
      html_url: `https://github.com/KARSIFT/vocanova-platform/actions/runs/${runId}`,
    };
  });
  const checkRuns = REQUIRED_WORKFLOW_FIXTURES.map((fixture, index) => ({
    id: 201 + index,
    name: fixture.check,
    head_sha: pr2Merge,
    check_suite: { id: 301 + index },
    app: { id: 15368, slug: "github-actions" },
    status: "completed",
    conclusion: "success",
    details_url: `https://github.com/KARSIFT/vocanova-platform/actions/runs/${101 + index}/job/${201 + index}`,
    started_at: "2026-08-27T00:03:20Z",
    completed_at: "2026-08-27T00:03:30Z",
  }));
  const hostedChecks = checkRuns
    .map((check, index) => ({
      name: check.name,
      head_sha: check.head_sha,
      check_run_id: String(check.id),
      check_suite_id: String(check.check_suite.id),
      app_id: check.app.id,
      app_slug: check.app.slug,
      status: check.status,
      conclusion: check.conclusion,
      details_url: check.details_url,
      started_at: check.started_at,
      completed_at: check.completed_at,
      workflow_run: {
        ...pushRuns[index],
        id: String(pushRuns[index].id),
        check_suite_id: String(pushRuns[index].check_suite_id),
      },
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  Object.assign(bodies.pr2_exact_review, {
    actor: pr2Reviewer,
    verdict: "PASS",
    blocking_findings: [],
    pr2,
    changed_files: [
      ".github/README.md",
      "docs/governance/repository-settings.md",
      "docs/governance/repository-settings-current.yaml",
      "docs/operations/11-devops-and-ci-cd.md",
      "docs/operations/cloudflare-delivery.md",
    ],
    hosted_checks: hostedChecks,
    executable_digests: executableDigests,
    tuple_binding: tupleBinding,
  });
  Object.assign(bodies.act04_authority, {
    actor: authorityActor,
    pr2,
    executable_digests: executableDigests,
    tuple_binding: tupleBinding,
    staging_assertions: bodies.pr2_exact_review.staging_assertions,
    nonce: "0123456789abcdef0123456789abcdef",
    maximum_dispatches: 1,
    expires_at: "2026-08-27T00:26:00Z",
  });
  Object.assign(bodies.binder_review, {
    actor: binderReviewer,
    verdict: "PASS",
    blocking_findings: [],
    pr2,
    executable_digests: executableDigests,
    tuple_binding: tupleBinding,
    staging_assertions: bodies.pr2_exact_review.staging_assertions,
  });

  const records = {
    settings_authority: recordFixture(
      501,
      bodies.settings_authority,
      "2026-08-27T00:00:00Z",
    ),
    act03: recordFixture(502, bodies.act03, "2026-08-27T00:01:00Z"),
    pr2_exact_review: recordFixture(
      503,
      bodies.pr2_exact_review,
      "2026-08-27T00:05:00Z",
    ),
    act04_authority: recordFixture(
      504,
      bodies.act04_authority,
      "2026-08-27T00:06:00Z",
    ),
    binder_review: recordFixture(
      505,
      bodies.binder_review,
      "2026-08-27T00:07:00Z",
    ),
  };
  const reference = (record) => ({
    url: record.html_url,
    raw_body_sha256: shaText(record.body),
  });
  bodies.act03.settings_authority = {
    hold_id: "VOC-085-HOLD-00",
    evidence: reference(records.settings_authority),
  };
  records.act03 = recordFixture(502, bodies.act03, "2026-08-27T00:01:00Z");
  bodies.pr2_exact_review.act03 = reference(records.act03);
  records.pr2_exact_review = recordFixture(
    503,
    bodies.pr2_exact_review,
    "2026-08-27T00:05:00Z",
  );
  bodies.act04_authority.act03 = reference(records.act03);
  bodies.act04_authority.pr2_exact_review = reference(records.pr2_exact_review);
  records.act04_authority = recordFixture(
    504,
    bodies.act04_authority,
    "2026-08-27T00:06:00Z",
  );
  bodies.binder_review.act03 = reference(records.act03);
  bodies.binder_review.pr2_exact_review = reference(records.pr2_exact_review);
  bodies.binder_review.authority = reference(records.act04_authority);
  records.binder_review = recordFixture(
    505,
    bodies.binder_review,
    "2026-08-27T00:07:00Z",
  );

  const inputs = {
    delivery_environment: "staging",
    reviewed_sha: pr2Merge,
    act03_evidence_url: records.act03.html_url,
    act03_evidence_sha256: shaText(records.act03.body),
    pr2_review_url: records.pr2_exact_review.html_url,
    pr2_review_sha256: shaText(records.pr2_exact_review.body),
    action_authority_url: records.act04_authority.html_url,
    action_authority_sha256: shaText(records.act04_authority.body),
    binder_review_url: records.binder_review.html_url,
    binder_review_sha256: shaText(records.binder_review.body),
    dispatch_nonce: bodies.act04_authority.nonce,
    estimated_cost_cents: "0",
    previous_api_version_id: apiVersion
      .replace(/^11111111/, "ace13c0b")
      .replace(/1111-4111-8111-111111111111$/, "c148-4ef1-ad9a-fdfdb07f264f"),
    previous_web_version_id: "5255e64d-872e-469f-90b6-bea49efd5e75",
    confirmation: `DEPLOY staging ${pr2Merge}`,
    staging_evidence_url: "",
    backup_evidence_url: "",
  };
  const runId = "999";
  const responses = new Map();
  responses.set("/rate_limit", {
    resources: { core: { remaining: 500 } },
  });
  for (const record of Object.values(records)) {
    responses.set(
      `/repos/KARSIFT/vocanova-platform/issues/comments/${record.id}`,
      record,
    );
  }
  responses.set("/repos/KARSIFT/vocanova-platform/pulls/166", {
    number: 166,
    state: "closed",
    merged: true,
    merged_at: pr2.merged_at,
    merge_commit_sha: pr2Merge,
    head: { sha: pr2Head },
    base: { ref: "develop" },
  });
  responses.set(
    "/repos/KARSIFT/vocanova-platform/pulls/166/files?per_page=100&page=1",
    REQUIRED_PR2_FILES_FIXTURE.map((filename) => ({ filename })),
  );
  responses.set(`/repos/KARSIFT/vocanova-platform/actions/runs/${runId}`, {
    id: Number(runId),
    event: "workflow_dispatch",
    head_sha: pr2Merge,
    head_branch: "develop",
    run_attempt: 1,
    created_at: "2026-08-27T00:08:00Z",
    display_title: `CI staging authority=${inputs.action_authority_sha256}-${inputs.dispatch_nonce}`,
  });
  responses.set(
    `/repos/KARSIFT/vocanova-platform/actions/runs?branch=develop&event=push&head_sha=${pr2Merge}&per_page=100&page=1`,
    { total_count: 3, workflow_runs: pushRuns },
  );
  responses.set(
    `/repos/KARSIFT/vocanova-platform/commits/${pr2Merge}/check-runs?filter=all&per_page=100&page=1`,
    { total_count: 3, check_runs: checkRuns },
  );
  responses.set(
    `/repos/KARSIFT/vocanova-platform/actions/workflows/ci.yml/runs?branch=develop&event=workflow_dispatch&head_sha=${pr2Merge}&per_page=100&page=1`,
    {
      total_count: 1,
      workflow_runs: [
        {
          id: Number(runId),
          created_at: "2026-08-27T00:08:00Z",
          display_title: `CI staging authority=${inputs.action_authority_sha256}-${inputs.dispatch_nonce}`,
        },
      ],
    },
  );
  return {
    manifest,
    event: {
      event_name: "workflow_dispatch",
      ref: "refs/heads/develop",
      sha: pr2Merge,
      run_id: runId,
      inputs,
    },
    http: async (url, init) => {
      assert.equal(init.headers.Authorization, undefined);
      const path = new URL(url).pathname + new URL(url).search;
      if (!responses.has(path))
        return jsonResponse({ message: `missing fixture ${path}` }, 404);
      return jsonResponse(responses.get(path));
    },
    responses,
  };
}

const REQUIRED_WORKFLOW_FIXTURES = [
  {
    check: "ci required",
    workflow: "CI",
    path: ".github/workflows/ci.yml",
    workflowId: 321329558,
  },
  {
    check: "security required",
    workflow: "Security",
    path: ".github/workflows/security.yml",
    workflowId: 337617927,
  },
  {
    check: "structure",
    workflow: "Governance",
    path: ".github/workflows/governance.yml",
    workflowId: 337617928,
  },
];
const REQUIRED_PR2_FILES_FIXTURE = [
  ".github/README.md",
  "docs/governance/repository-settings-current.yaml",
  "docs/governance/repository-settings.md",
  "docs/operations/11-devops-and-ci-cd.md",
  "docs/operations/cloudflare-delivery.md",
];

function exampleForSchema(schema, definitions) {
  if (schema.$ref)
    return exampleForSchema(
      definitions[schema.$ref.split("/").at(-1)],
      definitions,
    );
  if (schema.allOf) {
    let result = {};
    for (const branch of schema.allOf) {
      if (branch.$ref)
        result = {
          ...result,
          ...exampleForSchema(
            definitions[branch.$ref.split("/").at(-1)],
            definitions,
          ),
        };
      for (const [key, child] of Object.entries(branch.properties ?? {}))
        result[key] = exampleForSchema(child, definitions);
    }
    return result;
  }
  if (Object.hasOwn(schema, "const")) return structuredClone(schema.const);
  if (schema.enum) return structuredClone(schema.enum[0]);
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "object") {
    const result = {};
    for (const key of schema.required ?? [])
      result[key] = exampleForSchema(schema.properties[key], definitions);
    return result;
  }
  if (type === "array") {
    if (schema.prefixItems)
      return schema.prefixItems.map((item) =>
        exampleForSchema(item, definitions),
      );
    return Array.from({ length: schema.minItems ?? 0 }, () =>
      exampleForSchema(schema.items, definitions),
    );
  }
  if (type === "integer") return schema.minimum ?? 1;
  if (type === "null") return null;
  if (type === "string") return patternValue(schema.pattern, schema.minLength);
  throw new Error(
    `fixture cannot instantiate schema ${JSON.stringify(schema)}`,
  );
}

function patternValue(pattern = "", minimum = 1) {
  if (pattern.includes("{64}")) return "a".repeat(64);
  if (pattern.includes("{40}")) return "a".repeat(40);
  if (pattern.includes("issuecomment"))
    return "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-500";
  if (pattern.includes("actions/runs"))
    return "https://github.com/KARSIFT/vocanova-platform/actions/runs/101/job/201";
  if (pattern.includes("T(")) return "2026-08-27T00:00:00Z";
  if (pattern.includes("[0-9a-f]{8}-"))
    return "11111111-1111-4111-8111-111111111111";
  if (pattern.includes("[0-9a-f]{32")) return "0".repeat(32);
  return "fixture-value".padEnd(minimum, "x");
}

function recordFixture(id, body, timestamp) {
  return {
    id,
    html_url: `https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-${id}`,
    issue_url:
      "https://api.github.com/repos/KARSIFT/vocanova-platform/issues/158",
    created_at: timestamp,
    updated_at: timestamp,
    body: canonicalize(body),
    user: {
      login: "m-e-h-r-d-a-a-d",
      id: 7955432,
      type: "User",
      site_admin: false,
    },
    author_association: "CONTRIBUTOR",
  };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      date: "Wed, 27 Aug 2026 00:08:30 GMT",
      "x-ratelimit-remaining": "500",
    },
  });
}

function shaText(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fileSha(path) {
  return shaText(readFileSync(resolve(repositoryRoot, path)));
}
