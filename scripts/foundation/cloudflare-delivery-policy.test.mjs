import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  APPROVAL_RECEIPT_SCHEMA,
  MANDATORY_STAGING_TOKEN_REVOCATION_TRIGGERS,
  STAGING_ACCOUNT_ID,
  STAGING_CREDENTIAL_POLICY_PATHS,
  STAGING_CREDENTIAL_POLICY_SURFACES,
  canonicalize,
  evaluateDeliveryEvent,
  inspectDeliveryManifest,
  inspectMigrationLedger,
  inspectStagingCredentialPolicySources,
  inspectWranglerConfigSelection,
  inspectDeliveryWorkflow,
  loadDeliveryManifest,
  loadStagingCredentialPolicySources,
  parseJsonc,
  parseStrictJson,
  planStagingCredentialLifecycle,
  resolveCurrentDeployment,
  resolveVersionId,
  validateApprovalHistory,
  validateDeliveryRepository,
  validateEnvironmentProtection,
  verifyAccountIdentity,
} from "./cloudflare-delivery-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const workflowPath = resolve(repositoryRoot, ".github/workflows/ci.yml");
const workflow = readFileSync(workflowPath, "utf8");
const manifest = loadDeliveryManifest(repositoryRoot);
const credentialPolicySources =
  loadStagingCredentialPolicySources(repositoryRoot);
const configs = {
  api: parseJsonc(
    readFileSync(
      resolve(repositoryRoot, "apps/api-worker/wrangler.jsonc"),
      "utf8",
    ),
  ),
  web: parseJsonc(
    readFileSync(resolve(repositoryRoot, "apps/web/wrangler.jsonc"), "utf8"),
  ),
};
const exactSha = "a".repeat(40);
const versionId = "11111111-1111-4111-8111-111111111111";

function clone(value) {
  return structuredClone(value);
}

function exactProtection() {
  return {
    environment: {
      id: 987654,
      name: "cloudflare-staging",
      can_admins_bypass: false,
      protection_rules: [
        {
          type: "required_reviewers",
          prevent_self_review: false,
          reviewers: [
            {
              type: "User",
              reviewer: { login: "m-e-h-r-d-a-a-d", id: 7955432 },
            },
          ],
        },
      ],
      deployment_branch_policy: {
        protected_branches: false,
        custom_branch_policies: true,
      },
    },
    branchPolicies: {
      total_count: 1,
      branch_policies: [{ id: 1234, name: "develop", type: "branch" }],
    },
  };
}

function dispatchEvent(overrides = {}) {
  return {
    event_name: "workflow_dispatch",
    actor: "m-e-h-r-d-a-a-d",
    actor_id: 7955432,
    triggering_actor: "m-e-h-r-d-a-a-d",
    ref: "refs/heads/develop",
    sha: exactSha,
    required_result: "success",
    inputs: {
      delivery_environment: "staging",
      delivery_operation: "deploy",
      confirmation: `DEPLOY staging ${exactSha}`,
    },
    ...overrides,
  };
}

function approvalFixture() {
  const receipt = {
    checks_reviewed: ["ci required"],
    coordinator_model: "gpt-5.6-terra",
    environment_id: 987654,
    environment_name: "cloudflare-staging",
    exact_sha_author: false,
    no_cloudflare_secret_access: true,
    participant_id: "/root/voc100_deployment_review",
    reviewer_model: "gpt-5.6-sol",
    reviewer_received_approval_credentials: false,
    run_attempt: 2,
    run_id: "123456789",
    schema_version: APPROVAL_RECEIPT_SCHEMA,
    sha: exactSha,
    task_id: "VOC-100-staging-review",
    verdict: "PASS",
  };
  return {
    context: { runId: "123456789", runAttempt: 2, sha: exactSha },
    receipt,
    history: [
      {
        state: "approved",
        user: { login: "m-e-h-r-d-a-a-d", id: 7955432 },
        environments: [{ id: 987654, name: "cloudflare-staging" }],
        comment: canonicalize(receipt),
      },
    ],
  };
}

function runWorkflowApprovalGate(history, context) {
  const match = workflow.match(
    /--arg sha "\$GITHUB_SHA" '\n([\s\S]*?)\n            ' "\$response_file"/,
  );
  assert.ok(match, "approval-history jq predicate must be extractable");
  return spawnSync(
    "jq",
    [
      "-e",
      "--arg",
      "login",
      "m-e-h-r-d-a-a-d",
      "--argjson",
      "login_id",
      "7955432",
      "--arg",
      "run_id",
      context.runId,
      "--argjson",
      "run_attempt",
      String(context.runAttempt),
      "--arg",
      "sha",
      context.sha,
      match[1],
    ],
    { input: JSON.stringify(history), encoding: "utf8" },
  );
}

test("standard-ready staging, held production, Wrangler configs, workflow, and migration ceiling agree", () => {
  assert.deepEqual(validateDeliveryRepository(repositoryRoot), []);
  assert.equal(manifest.status, "standard-ready");
  assert.equal(manifest.environments.staging.state, "standard-ready");
  assert.equal(manifest.environments.production.state, "held");
  assert.equal(
    Object.hasOwn(manifest.environments.staging, "prepared_runtime_binder"),
    false,
  );
});

test("standing staging-token policy covers the exact living inventory and rejects stale lifecycle claims", () => {
  assert.deepEqual(
    Object.keys(credentialPolicySources).sort(),
    [...STAGING_CREDENTIAL_POLICY_PATHS].sort(),
  );
  assert.deepEqual(
    inspectStagingCredentialPolicySources(credentialPolicySources),
    [],
  );

  for (const { path, required } of STAGING_CREDENTIAL_POLICY_SURFACES) {
    const candidate = clone(credentialPolicySources);
    const requiredPattern = new RegExp(
      required[0]
        .trim()
        .split(/\s+/)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("\\s+"),
      "g",
    );
    candidate[path] = candidate[path].replace(requiredPattern, "[removed]");
    assert.notEqual(candidate[path], credentialPolicySources[path], path);
    assert.match(
      inspectStagingCredentialPolicySources(candidate).join("\n"),
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      path,
    );
  }

  for (const path of STAGING_CREDENTIAL_POLICY_PATHS.filter(
    (candidate) => !candidate.endsWith(".mjs"),
  )) {
    const candidate = clone(credentialPolicySources);
    candidate[path] +=
      "\nThe staging token expires after " + "90 days and then rotates.\n";
    assert.match(
      inspectStagingCredentialPolicySources(candidate).join("\n"),
      /stale staging credential lifecycle claim/,
      path,
    );
  }

  const missing = clone(credentialPolicySources);
  delete missing[STAGING_CREDENTIAL_POLICY_PATHS[0]];
  assert.match(
    inspectStagingCredentialPolicySources(missing).join("\n"),
    /living-path inventory drifted/,
  );

  const broadened = clone(credentialPolicySources);
  const runbook = "docs/operations/cloudflare-delivery.md";
  broadened[runbook] = broadened[runbook].replace(
    "it has no DNS, billing",
    "it has DNS and billing",
  );
  assert.match(
    inspectStagingCredentialPolicySources(broadened).join("\n"),
    /incomplete/,
  );
});

test("every mandatory staging-token trigger revokes first and re-enables only after protected replacement checks", () => {
  for (const trigger of MANDATORY_STAGING_TOKEN_REVOCATION_TRIGGERS) {
    const plan = planStagingCredentialLifecycle({ trigger });
    assert.equal(plan.operations[0], "revoke-affected-token", trigger);
    assert.ok(
      plan.operations.indexOf("disable-staging") <
        plan.operations.indexOf("create-replacement-token"),
      trigger,
    );
    assert.ok(
      plan.operations.indexOf("protected-no-write-credential-check") <
        plan.operations.indexOf("enable-staging-after-protected-check"),
      trigger,
    );
    assert.equal(plan.priorTokenRetainedThroughReplacementChecks, false);
    assert.equal(
      plan.environmentApiTokenSecret,
      "verified-replacement-credential",
    );
    assert.equal(plan.staging, "enabled");
    assert.equal(plan.tokenValueLogged, false);
    assert.equal(plan.requiresChangePackageOrPullRequest, false);
    assert.equal(plan.coupledToDeployment, false);
  }
});

test("voluntary replacement retains the prior token only through successful checks and then revokes it", () => {
  const plan = planStagingCredentialLifecycle();
  assert.deepEqual(plan.operations, [
    "retain-prior-token",
    "create-replacement-token",
    "sanitized-dashboard-policy-readback",
    "local-status-and-account-verification-without-logging",
    "install-replacement-environment-api-token-secret",
    "protected-no-write-credential-check",
    "revoke-prior-token",
  ]);
  assert.equal(plan.priorTokenRetainedThroughReplacementChecks, true);
  assert.equal(
    plan.environmentApiTokenSecret,
    "verified-replacement-credential",
  );
  assert.equal(plan.staging, "enabled");
});

test("failed voluntary replacement restores and verifies the prior token before revoking the failed replacement", () => {
  const plan = planStagingCredentialLifecycle({ replacementStatus: "failed" });
  assert.ok(
    plan.operations.indexOf("restore-prior-environment-api-token-secret") <
      plan.operations.indexOf("protected-no-write-check-for-prior-credential"),
  );
  assert.ok(
    plan.operations.indexOf("protected-no-write-check-for-prior-credential") <
      plan.operations.indexOf("revoke-failed-replacement"),
  );
  assert.equal(plan.environmentApiTokenSecret, "verified-prior-credential");
  assert.equal(plan.newApprovals, "allowed");
  assert.equal(plan.staging, "enabled");
});

test("failed trigger-driven replacement removes the failed credential and leaves staging disabled", () => {
  const plan = planStagingCredentialLifecycle({
    trigger: "suspected-disclosure",
    replacementStatus: "failed",
  });
  assert.equal(plan.operations[0], "revoke-affected-token");
  assert.ok(
    plan.operations.indexOf("revoke-failed-replacement") <
      plan.operations.indexOf("remove-failed-replacement"),
  );
  assert.equal(plan.environmentApiTokenSecret, "absent");
  assert.equal(plan.newApprovals, "rejected");
  assert.equal(plan.staging, "disabled");
  assert.equal(plan.priorTokenRetainedThroughReplacementChecks, false);
});

test("unconfirmed mandatory revocation removes the secret, stops staging, and blocks resumption", () => {
  const plan = planStagingCredentialLifecycle({
    trigger: "loss-of-operator-control",
    revocationConfirmed: false,
  });
  assert.deepEqual(plan.operations, [
    "revoke-affected-token",
    "disable-staging",
    "remove-environment-api-token-secret",
    "reject-new-staging-approvals",
    "cancel-in-flight-staging-runs",
    "open-incident",
    "retry-revocation",
    "verify-affected-token-inactive-without-logging",
  ]);
  assert.equal(plan.environmentApiTokenSecret, "absent");
  assert.equal(plan.newApprovals, "rejected");
  assert.equal(plan.inFlightStagingRuns, "cancelled");
  assert.equal(plan.incident, "opened");
  assert.equal(plan.staging, "disabled");
  assert.equal(
    plan.resumptionCondition,
    "affected-token-verified-inactive-and-valid-credential-protected-check-passed",
  );
  assert.equal(plan.tokenValueLogged, false);
});

test("staging-token lifecycle planner rejects invalid or contradictory scenarios", () => {
  assert.throws(
    () => planStagingCredentialLifecycle({ trigger: "periodic-expiry" }),
    /trigger is invalid/,
  );
  assert.throws(
    () =>
      planStagingCredentialLifecycle({
        trigger: null,
        revocationConfirmed: false,
      }),
    /requires a mandatory trigger/,
  );
  assert.throws(
    () => planStagingCredentialLifecycle({ replacementStatus: "unchecked" }),
    /replacement status is invalid/,
  );
});

test("manifest preserves the exact staging account/resources, zero cost, and production holds", () => {
  const cases = [
    [
      "account",
      (candidate) =>
        (candidate.environments.staging.resources.account_id = "0".repeat(32)),
    ],
    [
      "D1",
      (candidate) =>
        (candidate.environments.staging.d1.database_id = versionId),
    ],
    [
      "cost",
      (candidate) => (candidate.environments.staging.cost_ceiling_cents = 1),
    ],
    [
      "paid plan",
      (candidate) =>
        (candidate.environments.staging.resources.workers_plan = "Paid"),
    ],
    [
      "production",
      (candidate) =>
        (candidate.environments.production.state = "standard-ready"),
    ],
  ];
  for (const [name, mutate] of cases) {
    const candidate = clone(manifest);
    mutate(candidate);
    assert.notDeepEqual(inspectDeliveryManifest(candidate), [], name);
  }
  assert.equal(
    manifest.environments.staging.resources.account_id,
    STAGING_ACCOUNT_ID,
  );
  assert.deepEqual(manifest.environments.staging.resources.production_holds, [
    "VOC-080-HOLD-01",
    "VOC-080-HOLD-02",
  ]);
});

test("exact Wrangler environments and the ordered D1 migration ledger fail closed on drift", () => {
  assert.deepEqual(inspectDeliveryManifest(manifest, configs), []);
  const routeCases = [
    (candidate) =>
      (candidate.api.env.staging.routes[0].pattern =
        "wrong-staging.example.invalid"),
    (candidate) =>
      candidate.web.env.staging.routes.push({
        pattern: "extra-staging.example.invalid",
        custom_domain: true,
      }),
    (candidate) =>
      (candidate.api.env.production.routes = [
        { pattern: "production.example.invalid", custom_domain: true },
      ]),
    (candidate) => (candidate.web.env.staging.preview_urls = true),
    (candidate) =>
      (candidate.api.env.staging.d1_databases[0].migrations_pattern =
        "migrations/0001_foundation.sql"),
    (candidate) =>
      candidate.api.env.staging.d1_databases.push({
        binding: "UNREVIEWED_DB",
        database_name: "unreviewed",
        database_id: "44444444-4444-4444-8444-444444444444",
        migrations_dir: "migrations",
        migrations_table: "d1_migrations",
      }),
    (candidate) =>
      candidate.web.env.staging.services.push({
        binding: "UNREVIEWED_SERVICE",
        service: "unreviewed-worker",
      }),
    (candidate) =>
      (candidate.api.env.staging.vars.NEW_USER_SIGNUP_ENABLED = "true"),
    (candidate) =>
      (candidate.api.env.staging.kv_namespaces = [
        { binding: "UNREVIEWED_KV", id: "unreviewed" },
      ]),
  ];
  for (const mutate of routeCases) {
    const candidate = clone(configs);
    mutate(candidate);
    assert.notDeepEqual(inspectDeliveryManifest(manifest, candidate), []);
  }
  const inheritedRootCases = [
    (candidate) => (candidate.api.account_id = "0".repeat(32)),
    (candidate) =>
      (candidate.api.routes = [
        { pattern: "inherited-api.example.invalid", custom_domain: true },
      ]),
    (candidate) =>
      (candidate.web.routes = [
        { pattern: "inherited-web.example.invalid", custom_domain: true },
      ]),
    (candidate) => (candidate.api.triggers = { crons: ["0 * * * *"] }),
    (candidate) => (candidate.web.assets.run_worker_first = true),
    (candidate) => (candidate.api.placement = { mode: "smart" }),
    (candidate) => (candidate.api.compatibility_flags = ["nodejs_compat"]),
    (candidate) => (candidate.api.logpush = true),
    (candidate) => (candidate.web.limits = { cpu_ms: 10 }),
    (candidate) => (candidate.api.env.unreviewed = {}),
  ];
  for (const mutate of inheritedRootCases) {
    const candidate = clone(configs);
    mutate(candidate);
    assert.notDeepEqual(inspectDeliveryManifest(manifest, candidate), []);
  }

  const changedLedger = clone(manifest);
  changedLedger.migration_ledger.ordered_files[0] = "0001_rewritten.sql";
  assert.notDeepEqual(inspectDeliveryManifest(changedLedger), []);

  const directory = mkdtempSync(resolve(tmpdir(), "vocanova-migrations-"));
  try {
    const migrations = resolve(directory, manifest.migration_ledger.directory);
    mkdirSync(migrations, { recursive: true });
    for (const name of manifest.migration_ledger.ordered_files)
      writeFileSync(resolve(migrations, name), "-- fixture\n");
    assert.deepEqual(
      inspectMigrationLedger(
        directory,
        manifest.migration_ledger,
        manifest.limits.max_migrations_per_release,
      ),
      [],
    );
    writeFileSync(resolve(migrations, "unreviewed.sql"), "-- drift\n");
    assert.notDeepEqual(
      inspectMigrationLedger(
        directory,
        manifest.migration_ledger,
        manifest.limits.max_migrations_per_release,
      ),
      [],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("JSONC and strict canonical JSON parsing reject ambiguous receipt bytes", () => {
  assert.deepEqual(
    parseJsonc('{"url":"https://example.invalid/a//b",/* x */"items":[1,],}'),
    { url: "https://example.invalid/a//b", items: [1] },
  );
  assert.deepEqual(parseStrictJson('{"a":1,"b":[true,null]}'), {
    a: 1,
    b: [true, null],
  });
  assert.throws(() => parseStrictJson('{"a":1,"a":2}'), /duplicate JSON key/);
  assert.throws(() => parseStrictJson('{"a":9007199254740992}'), /safe range/);
  assert.throws(
    () => parseStrictJson('{"x":"\\ud800"}'),
    /lone Unicode surrogate/,
  );
  assert.equal(canonicalize({ b: 1, a: 2 }), '{"a":2,"b":1}');
});

test("workflow removes binder inputs and isolates secrets after the first approval-history step", () => {
  assert.deepEqual(inspectDeliveryWorkflow(workflow), []);
  for (const removed of [
    "action_authority_url",
    "act03_evidence_url",
    "pr2_review_url",
    "binder_review_url",
    "dispatch_nonce",
    "previous_api_version_id",
    "previous_web_version_id",
    "experimental-provision",
    "experimental-auto-create",
  ]) {
    assert.equal(workflow.includes(removed), false, removed);
  }
  const stagingStart = workflow.indexOf("\n  cloudflare-staging:\n");
  const productionStart = workflow.indexOf("\n  cloudflare-production:\n");
  const staging = workflow.slice(stagingStart, productionStart);
  const approval = staging.indexOf(
    "- name: Validate exact current-attempt AI approval receipt",
  );
  const firstSecret = staging.indexOf("secrets.CLOUDFLARE_API_TOKEN");
  assert.ok(approval !== -1 && firstSecret > approval);
  assert.doesNotMatch(
    staging.slice(0, firstSecret),
    /secrets\.CLOUDFLARE_ACCOUNT_ID/,
  );
});

test("workflow graph mutations fail closed before Cloudflare credentials", () => {
  const mutations = [
    workflow.replace(
      "Validate exact current-attempt AI approval receipt",
      "Skip approval receipt",
    ),
    workflow.replace(
      "needs: [required, delivery-gate]",
      "needs: [delivery-gate]",
    ),
    workflow.replace(
      "GITHUB_TRIGGERING_ACTOR: ${{ github.triggering_actor }}",
      "GITHUB_TRIGGERING_ACTOR: m-e-h-r-d-a-a-d",
    ),
    workflow.replace(
      "environment: cloudflare-staging",
      "environment: cloudflare-staging\n    env:\n      TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}",
    ),
    workflow.replace(
      "name: Validate foundation",
      "name: Validate foundation\n        env:\n          TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}",
    ),
    workflow.replace(
      "name: Validate foundation",
      "name: Validate foundation\n        env:\n          TOKEN: ${{ secrets['CLOUDFLARE_API_TOKEN'] }}",
    ),
    workflow.replace(
      "GITHUB_TOKEN: ${{ github.token }}",
      "TOKEN: ${{ fromJSON(toJSON(secrets))['CLOUDFLARE_API_TOKEN'] }}",
    ),
    workflow.replace(
      'echo "VOC-080-HOLD-01 and VOC-080-HOLD-02 remain active." >&2',
      "pnpm exec wrangler deploy",
    ),
    workflow.replace("set +e", "set -e"),
    workflow.replace("|| api_rollback_status=$?", "&& api_rollback_status=0"),
    workflow.replace(
      'tag="sha-${GITHUB_SHA:0:12}-run-${GITHUB_RUN_ID}-attempt-${GITHUB_RUN_ATTEMPT}"',
      'tag="sha-${GITHUB_SHA}"',
    ),
    workflow.replace(" --config wrangler.jsonc", ""),
  ];
  for (const candidate of mutations)
    assert.notDeepEqual(inspectDeliveryWorkflow(candidate), []);
});

test("Wrangler configuration selection rejects precedence and deploy redirects", () => {
  const directory = mkdtempSync(resolve(tmpdir(), "vocanova-wrangler-config-"));
  try {
    for (const packageDirectory of ["apps/api-worker", "apps/web"]) {
      const root = resolve(directory, packageDirectory);
      mkdirSync(root, { recursive: true });
      writeFileSync(resolve(root, "wrangler.jsonc"), "{}\n");
    }
    assert.deepEqual(inspectWranglerConfigSelection(directory), []);

    const alternatives = [
      ["apps/api-worker", "wrangler.json"],
      ["apps/api-worker", "wrangler.toml"],
      ["apps/api-worker", ".wrangler/deploy/config.json"],
      ["apps/web", "wrangler.json"],
      ["apps/web", "wrangler.toml"],
      ["apps/web", ".wrangler/deploy/config.json"],
    ];
    for (const [packageDirectory, alternative] of alternatives) {
      const path = resolve(directory, packageDirectory, alternative);
      mkdirSync(resolve(path, ".."), { recursive: true });
      writeFileSync(path, "{}\n");
      assert.notDeepEqual(inspectWranglerConfigSelection(directory), []);
      rmSync(path);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("manual develop staging dispatch and no-write credential check pass exact deterministic gates", async () => {
  const deploy = await evaluateDeliveryEvent(manifest, dispatchEvent(), {
    environmentProtection: exactProtection(),
    requiredResult: "success",
  });
  assert.deepEqual(deploy, {
    eligible: true,
    environment: "staging",
    operation: "deploy",
    reasons: [],
  });
  const credentialCheck = dispatchEvent({
    inputs: {
      delivery_environment: "staging",
      delivery_operation: "credential-check",
      confirmation: `CHECK staging ${exactSha}`,
    },
  });
  assert.equal(
    (
      await evaluateDeliveryEvent(manifest, credentialCheck, {
        environmentProtection: exactProtection(),
        requiredResult: "success",
      })
    ).eligible,
    true,
  );
});

test("wrong event, actor, ref, SHA, confirmation, checks, or production target fails", async () => {
  const cases = [
    { event_name: "push" },
    { actor: "someone-else" },
    { actor_id: 1 },
    { triggering_actor: "unauthorized-rerunner" },
    { ref: "refs/heads/main" },
    { sha: "not-a-sha" },
    { required_result: "failure" },
    {
      inputs: {
        ...dispatchEvent().inputs,
        confirmation: `DEPLOY staging ${"b".repeat(40)}`,
      },
    },
    {
      inputs: { ...dispatchEvent().inputs, delivery_environment: "production" },
    },
  ];
  for (const override of cases) {
    const decision = await evaluateDeliveryEvent(
      manifest,
      dispatchEvent(override),
      { environmentProtection: exactProtection() },
    );
    assert.equal(decision.eligible, false, JSON.stringify(override));
  }
});

test("live environment protection requires one exact reviewer and one develop policy", () => {
  assert.deepEqual(validateEnvironmentProtection(exactProtection()), []);
  const cases = [
    (value) => (value.environment.can_admins_bypass = true),
    (value) =>
      (value.environment.protection_rules[0].prevent_self_review = true),
    (value) =>
      (value.environment.protection_rules[0].reviewers[0].reviewer.login =
        "other"),
    (value) => value.environment.protection_rules.push({ type: "wait_timer" }),
    (value) => (value.branchPolicies.branch_policies[0].name = "main"),
    (value) =>
      value.branchPolicies.branch_policies.push({ id: 2, name: "release" }),
  ];
  for (const mutate of cases) {
    const candidate = exactProtection();
    mutate(candidate);
    assert.notDeepEqual(validateEnvironmentProtection(candidate), []);
  }
});

test("approval history accepts one canonical current-attempt non-author AI PASS receipt", () => {
  const fixture = approvalFixture();
  assert.deepEqual(
    validateApprovalHistory(fixture.history, fixture.context),
    [],
  );
  assert.equal(
    runWorkflowApprovalGate(fixture.history, fixture.context).status,
    0,
  );
});

test("approval history rejects stale, extra, conflicting, forged-schema, author, and same-model records", () => {
  const cases = [
    (fixture) => fixture.history.push(clone(fixture.history[0])),
    (fixture) => (fixture.context.runAttempt = 3),
    (fixture) => (fixture.history[0].state = "rejected"),
    (fixture) => (fixture.history[0].user.id = 1),
    (fixture) => (fixture.receipt.environment_id = 1),
    (fixture) => (fixture.receipt.exact_sha_author = true),
    (fixture) =>
      (fixture.receipt.coordinator_model = fixture.receipt.reviewer_model),
    (fixture) => (fixture.receipt.no_cloudflare_secret_access = false),
    (fixture) => (fixture.receipt.extra = "forbidden"),
  ];
  for (const mutate of cases) {
    const fixture = approvalFixture();
    mutate(fixture);
    if (
      fixture.history.length === 1 &&
      fixture.history[0].comment === canonicalize(approvalFixture().receipt)
    )
      fixture.history[0].comment = canonicalize(fixture.receipt);
    assert.notDeepEqual(
      validateApprovalHistory(fixture.history, fixture.context),
      [],
    );
  }
  const noncanonical = approvalFixture();
  noncanonical.history[0].comment = JSON.stringify(
    noncanonical.receipt,
    null,
    2,
  );
  assert.match(
    validateApprovalHistory(noncanonical.history, noncanonical.context).join(
      "\n",
    ),
    /canonical/,
  );
  for (const suffix of ["\n", "\r\n"]) {
    const altered = approvalFixture();
    altered.history[0].comment += suffix;
    assert.match(
      validateApprovalHistory(altered.history, altered.context).join("\n"),
      /canonical/,
    );
    assert.notEqual(
      runWorkflowApprovalGate(altered.history, altered.context).status,
      0,
      `workflow gate accepted altered receipt suffix ${JSON.stringify(suffix)}`,
    );
  }
});

test("Wrangler identity and current deployment readback fail on account or traffic ambiguity", () => {
  assert.equal(
    verifyAccountIdentity({
      loggedIn: true,
      authType: "Account API Token",
      accounts: [{ id: STAGING_ACCOUNT_ID, name: "selected account" }],
    }),
    true,
  );
  assert.throws(
    () =>
      verifyAccountIdentity({
        loggedIn: true,
        authType: "Account API Token",
        accounts: [{ id: "wrong", name: "wrong" }],
      }),
    /exactly the staging account/,
  );
  assert.equal(
    resolveCurrentDeployment({
      versions: [{ version_id: versionId, percentage: 100 }],
    }),
    versionId,
  );
  for (const deployment of [
    { versions: [] },
    { versions: [{ version_id: versionId, percentage: 99 }] },
    {
      versions: [
        { version_id: versionId, percentage: 50 },
        { version_id: "22222222-2222-4222-8222-222222222222", percentage: 50 },
      ],
    },
  ])
    assert.throws(
      () => resolveCurrentDeployment(deployment),
      /one version UUID/,
    );
});

test("version tag resolution remains exact and unambiguous", () => {
  const versions = [
    { id: versionId, annotations: { "workers/tag": `sha-${exactSha}` } },
  ];
  assert.equal(resolveVersionId(versions, `sha-${exactSha}`), versionId);
  assert.throws(
    () =>
      resolveVersionId([...versions, clone(versions[0])], `sha-${exactSha}`),
    /exactly one/,
  );
});

test(
  "locked Wrangler no-help parser harness reaches missing-auth and rejects unknown options with network denied",
  { timeout: 60_000 },
  () => {
    const directory = mkdtempSync(
      resolve(tmpdir(), "vocanova-wrangler-parser-"),
    );
    try {
      const worker = resolve(directory, "worker.mjs");
      const migrations = resolve(directory, "migrations");
      const config = resolve(directory, "wrangler.jsonc");
      const preload = resolve(directory, "deny-network.cjs");
      mkdirSync(migrations);
      writeFileSync(
        worker,
        "export default { fetch() { return new Response('ok'); } };\n",
      );
      writeFileSync(
        resolve(migrations, "0001_parser.sql"),
        "CREATE TABLE parser_test (id INTEGER PRIMARY KEY);\n",
      );
      writeFileSync(
        config,
        JSON.stringify({
          name: "vocanova-parser-harness",
          main: worker,
          compatibility_date: "2026-08-01",
          send_metrics: false,
          d1_databases: [
            {
              binding: "DB",
              database_name: "vocanova-parser-harness",
              database_id: "33333333-3333-4333-8333-333333333333",
              migrations_dir: migrations,
            },
          ],
        }),
      );
      writeFileSync(
        preload,
        [
          "const deny=()=>{throw new Error('VOCANOVA_OUTBOUND_NETWORK_DENIED')};",
          "global.fetch=deny;",
          "for(const name of ['node:net','node:tls']){const mod=require(name);mod.connect=deny;mod.createConnection=deny;}",
          "for(const name of ['node:http','node:https']){const mod=require(name);mod.request=deny;mod.get=deny;}",
        ].join("\n"),
      );
      const wrangler = resolve(
        repositoryRoot,
        "apps/api-worker/node_modules/wrangler/bin/wrangler.js",
      );
      const commands = [
        ["d1", "migrations", "apply", "DB", "--remote", "--env", "staging"],
        ["deployments", "status", "--env", "staging", "--json"],
        [
          "versions",
          "deploy",
          `${versionId}@100%`,
          "--env",
          "staging",
          "--yes",
          "--message",
          "parser harness promotion",
        ],
        [
          "rollback",
          versionId,
          "--env",
          "staging",
          "--yes",
          "--message",
          "parser harness rollback",
        ],
      ];
      const env = {
        CI: "1",
        HOME: directory,
        PATH: process.env.PATH,
        NODE_OPTIONS: `--require=${preload}`,
        WRANGLER_SEND_METRICS: "false",
        XDG_CONFIG_HOME: resolve(directory, "xdg"),
      };
      for (const argv of commands) {
        assert.equal(argv.includes("--help"), false);
        const valid = spawnSync(
          process.execPath,
          [wrangler, ...argv, "--config", config],
          { cwd: directory, encoding: "utf8", env, timeout: 8_000 },
        );
        const validOutput = `${valid.stdout}\n${valid.stderr}`;
        assert.notEqual(
          valid.status,
          0,
          `${argv.join(" ")} unexpectedly succeeded`,
        );
        assert.match(
          validOutput,
          /not authenticated|CLOUDFLARE_API_TOKEN|wrangler login|non-interactive environment/i,
          `${argv.join(" ")} did not reach the missing-auth guard:\n${validOutput}`,
        );
        assert.doesNotMatch(validOutput, /Unknown argument|Unknown option/i);

        const invalid = spawnSync(
          process.execPath,
          [wrangler, ...argv, "--vocanova-unknown-option", "--config", config],
          { cwd: directory, encoding: "utf8", env, timeout: 8_000 },
        );
        const invalidOutput = `${invalid.stdout}\n${invalid.stderr}`;
        assert.notEqual(invalid.status, 0);
        assert.match(invalidOutput, /Unknown argument|Unknown option/i);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
