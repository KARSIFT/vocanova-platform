import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  closeSync,
  mkdirSync,
  mkdtempSync,
  openSync,
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
const policyCli = resolve(
  repositoryRoot,
  "scripts/foundation/cloudflare-delivery-policy.mjs",
);

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
        { type: "branch_policy" },
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

function credentialCheckEvent() {
  return dispatchEvent({
    inputs: {
      delivery_environment: "staging",
      delivery_operation: "credential-check",
      confirmation: `CHECK staging ${exactSha}`,
    },
  });
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
      /must remain standing and valid until revoked/,
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

test("standing staging-token policy rejects direct contradictions without matching unrelated credentials", () => {
  const humanPolicyPaths = STAGING_CREDENTIAL_POLICY_PATHS.filter(
    (candidate) => !candidate.endsWith(".mjs"),
  );
  const contradictionClasses = [
    {
      expected: /cannot require a package, plan, or pull request/,
      claims: [
        "Each staging-token revocation requires a new change package and pull request.",
        "A pull request is mandatory before every Cloudflare staging credential replacement.",
        "The staging API token may be dispatched only after a governed plan is approved.",
        "For every use of the token for staging, create a change package and open a PR.",
        "A new change package gates each use of the staging environment token.",
      ],
    },
    {
      expected:
        /possession cannot grant dispatch, review, or approval authority/,
      claims: [
        "Possession of the staging token grants dispatch approval authority.",
        "Holding the Cloudflare staging credential authorizes review judgment.",
        "Access to the token for staging confers approval rights on its holder.",
        "Whoever possesses the staging API token may approve a dispatch.",
        "The Cloudflare staging token itself constitutes review authority.",
      ],
    },
    {
      expected: /must remain standing and valid until revoked/,
      claims: [
        "The staging credential is reissued on a calendar cadence.",
        "Rotate the Cloudflare staging token every 30 days.",
        "The token for staging is renewed quarterly.",
        "The staging token is short-lived and expires after six weeks.",
        "Scheduled monthly replacement of the staging credential is mandatory.",
        "A 30-day Cloudflare staging token is used for each delivery window.",
        "The token for staging is replaced after every dispatch.",
        "The staging environment credential has a finite lifetime.",
        "The staging token will be reissued after use.",
      ],
    },
  ];

  for (const path of humanPolicyPaths)
    for (const { expected, claims } of contradictionClasses)
      for (const claim of claims) {
        const candidate = clone(credentialPolicySources);
        candidate[path] += `\n${claim}\n`;
        assert.match(
          inspectStagingCredentialPolicySources(candidate).join("\n"),
          expected,
          `${path}: ${claim}`,
        );
      }

  const unrelatedClaims = [
    "Application session tokens expire after 30 days and are renewed monthly.",
    "Possessing an OAuth session token grants approval to access the signed-in account.",
    "A pull request is required before changing application-session credential behavior.",
    "The staging environment review calendar is updated monthly.",
    "A release credential for production is rotated after every deployment.",
  ];
  const validStagingClaims = [
    "The staging token has no calendar reissue cadence and grants no dispatch authority.",
    "During voluntary replacement, the staging token will be replaced after its protected check.",
    "The staging token expires only when revoked.",
    "Staging-token revocation does not require a new change package or pull request.",
    "Possession of the staging API token does not grant review or approval authority.",
  ];

  for (const path of humanPolicyPaths)
    for (const claim of [...unrelatedClaims, ...validStagingClaims]) {
      const candidate = clone(credentialPolicySources);
      candidate[path] += `\n${claim}\n`;
      assert.deepEqual(
        inspectStagingCredentialPolicySources(candidate),
        [],
        `${path}: ${claim}`,
      );
    }
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

test("provider readiness vars are exact in every API environment without secret bindings", () => {
  const variables = {
    EMAIL_PROVIDER_URL: "",
    EMAIL_FROM: "",
    AUTH_PROVIDER_TIMEOUT_MS: "8000",
    GOOGLE_OAUTH_CLIENT_ID: "",
  };
  const locations = [
    ["root", configs.api.vars],
    ["staging", configs.api.env.staging.vars],
    ["production", configs.api.env.production.vars],
  ];
  for (const [location, vars] of locations) {
    for (const [name, expected] of Object.entries(variables)) {
      assert.equal(vars[name], expected, `${location} ${name}`);
      const candidate = clone(configs);
      const candidateVars =
        location === "root"
          ? candidate.api.vars
          : candidate.api.env[location].vars;
      candidateVars[name] = expected === "8000" ? "7999" : "unsafe";
      assert.notDeepEqual(
        inspectDeliveryManifest(manifest, candidate),
        [],
        `${location} ${name} drift`,
      );
    }
  }
  assert.equal(configs.api.env.staging.vars.MAGIC_LINK_ENABLED, "false");
  assert.equal(configs.api.env.staging.vars.GOOGLE_OAUTH_ENABLED, "false");
  assert.equal(configs.api.env.production.vars.MAGIC_LINK_ENABLED, "false");
  assert.equal(configs.api.env.production.vars.GOOGLE_OAUTH_ENABLED, "false");
  assert.deepEqual(manifest.environments.staging.secret_names, [
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
  ]);
  const serialized = JSON.stringify(configs.api);
  assert.doesNotMatch(serialized, /EMAIL_PROVIDER_API_KEY/u);
  assert.doesNotMatch(serialized, /GOOGLE_OAUTH_CLIENT_SECRET/u);
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

test("workflow completes distinct version JSON files before exact resolution", () => {
  assert.deepEqual(inspectDeliveryWorkflow(workflow), []);
  assert.doesNotMatch(
    workflow,
    /wrangler versions list[^\n]*\|[^\n]*--resolve-version-tag/,
  );

  const apiList =
    'pnpm --filter @vocanova/api-worker exec wrangler versions list --env staging --json --config wrangler.jsonc > "$api_versions_file"';
  const apiResolve =
    'api_version_id="$(node scripts/foundation/cloudflare-delivery-policy.mjs --resolve-version-tag "$tag" < "$api_versions_file")"';
  const webList =
    'pnpm --filter @vocanova/web exec wrangler versions list --env staging --json --config wrangler.jsonc > "$web_versions_file"';
  const webResolve =
    'web_version_id="$(node scripts/foundation/cloudflare-delivery-policy.mjs --resolve-version-tag "$tag" < "$web_versions_file")"';
  const mutations = [
    workflow.replace(
      `${apiList}\n          ${apiResolve}`,
      'api_version_id="$(pnpm --filter @vocanova/api-worker exec wrangler versions list --env staging --json --config wrangler.jsonc | node scripts/foundation/cloudflare-delivery-policy.mjs --resolve-version-tag "$tag")"',
    ),
    workflow.replace(`${apiList}\n`, ""),
    workflow.replace(`${webList}\n`, ""),
    workflow.replace(
      'api_versions_file="$(mktemp "$RUNNER_TEMP/vocanova-api-versions.XXXXXX")"',
      'api_versions_file="$web_versions_file"',
    ),
    workflow.replace('> "$web_versions_file"', '> "$api_versions_file"'),
    workflow.replace('< "$web_versions_file")"', '< "$api_versions_file")"'),
    workflow.replace(
      `${apiList}\n          ${apiResolve}`,
      `${apiResolve}\n          ${apiList}`,
    ),
    workflow.replace("trap cleanup_version_files EXIT", "true"),
    workflow.replace(
      apiResolve,
      'api_version_id="$(node scripts/foundation/cloudflare-delivery-policy.mjs --resolve-version-tag "$tag" < <(cat "$api_versions_file"))"',
    ),
    workflow.replace(apiList, `${apiList} &`),
    workflow.replace(apiList, `coproc api_versions { ${apiList}; }`),
    workflow.replace(apiList, `${apiList} || true`),
    workflow.replace(
      'rm -f -- "$api_versions_file" || true',
      'rm -f -- "$api_versions_file"',
    ),
    workflow.replace(
      `${apiResolve}\n`,
      `${apiResolve}\n          cat "$api_versions_file"\n`,
    ),
    workflow.replace(
      "${{ steps.versions.outputs.api_version_id }}@100%",
      "${{ steps.prewrite.outputs.api_rollback_version_id }}@100%",
    ),
    workflow.replace(
      "if: failure() && inputs.delivery_operation == 'deploy' && steps.promote.outcome != 'skipped'",
      "if: failure() && inputs.delivery_operation == 'deploy'",
    ),
  ];
  for (const candidate of mutations) {
    assert.notEqual(candidate, workflow);
    assert.notDeepEqual(inspectDeliveryWorkflow(candidate), []);
  }
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
  const credentialCheck = credentialCheckEvent();
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

test("native Fetch responses decode into the exact eligible credential-check decision", async () => {
  const protection = exactProtection();
  const responses = [protection.environment, protection.branchPolicies].map(
    (body) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      }),
  );
  assert.equal(Object.hasOwn(responses[0], "ok"), false);
  assert.equal(responses[0].ok, true);

  let responseIndex = 0;
  const decision = await evaluateDeliveryEvent(
    manifest,
    credentialCheckEvent(),
    {
      githubToken: "injected-http-no-network",
      requiredResult: "success",
      http: async () => responses[responseIndex++],
    },
  );

  assert.deepEqual(decision, {
    eligible: true,
    environment: "staging",
    operation: "credential-check",
    reasons: [],
  });
  assert.equal(responseIndex, 2);
  assert.equal(responses[0].bodyUsed, true);
  assert.equal(responses[1].bodyUsed, true);
});

test("native Fetch response failures stay fail-closed and redact request and body values", async () => {
  const cases = [
    {
      name: "non-2xx",
      response: () =>
        new Response('{"body-secret-non-2xx":true}', {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      expected: /GitHub API returned 403/,
    },
    {
      name: "inherited ok true with non-2xx status",
      response: () => {
        const response = Object.assign(
          Object.create({
            get ok() {
              return true;
            },
          }),
          {
            status: 403,
            headers: new Headers({ "content-type": "application/json" }),
            json: async () => ({ "body-secret-inconsistent": true }),
          },
        );
        assert.equal(Object.hasOwn(response, "ok"), false);
        return response;
      },
      expected: /GitHub API returned 403/,
    },
    {
      name: "non-JSON",
      response: () =>
        new Response("body-secret-non-json", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
      expected: /GitHub API response is not JSON/,
    },
    {
      name: "malformed JSON",
      response: () =>
        new Response('{"body-secret-malformed":', {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      expected: /GitHub API response JSON is malformed/,
    },
  ];

  for (const { name, response, expected } of cases) {
    let calls = 0;
    const decision = await evaluateDeliveryEvent(
      manifest,
      credentialCheckEvent(),
      {
        githubToken: "token-secret-sentinel",
        requiredResult: "success",
        http: async () => {
          calls += 1;
          return response();
        },
      },
    );
    assert.equal(decision.eligible, false, name);
    assert.equal(decision.environment, null, name);
    assert.equal(decision.operation, null, name);
    assert.equal(decision.reasons.length, 1, name);
    assert.match(
      decision.reasons[0],
      /^live environment protection readback failed:/,
      name,
    );
    assert.match(decision.reasons[0], expected, name);
    assert.doesNotMatch(
      decision.reasons.join("\n"),
      /token-secret-sentinel|authorization|bearer|body-secret/i,
      name,
    );
    assert.equal(calls, 1, name);
  }
});

test("plain decoded protection records retain the explicit injected HTTP fixture path", async () => {
  const protection = exactProtection();
  const responses = [protection.environment, protection.branchPolicies];
  let responseIndex = 0;

  const decision = await evaluateDeliveryEvent(
    manifest,
    credentialCheckEvent(),
    {
      githubToken: "injected-http-no-network",
      requiredResult: "success",
      http: async () => responses[responseIndex++],
    },
  );

  assert.deepEqual(decision, {
    eligible: true,
    environment: "staging",
    operation: "credential-check",
    reasons: [],
  });
  assert.equal(responseIndex, 2);
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

test("live environment protection accepts one exact reviewer rule beside unrelated rules", () => {
  assert.deepEqual(validateEnvironmentProtection(exactProtection()), []);

  const withAnotherUnrelatedRule = exactProtection();
  withAnotherUnrelatedRule.environment.protection_rules.unshift({
    type: "wait_timer",
  });
  assert.deepEqual(validateEnvironmentProtection(withAnotherUnrelatedRule), []);
});

test("live environment protection fails closed on reviewer-rule cardinality and fields", () => {
  const reviewerRuleError =
    "environment must have exactly one required-reviewer rule";
  const cardinalityCases = [
    (value) => delete value.environment.protection_rules,
    (value) => (value.environment.protection_rules = {}),
    (value) => (value.environment.protection_rules = []),
    (value) =>
      (value.environment.protection_rules = [{ type: "branch_policy" }]),
    (value) =>
      value.environment.protection_rules.push(
        clone(value.environment.protection_rules[0]),
      ),
  ];
  for (const mutate of cardinalityCases) {
    const candidate = exactProtection();
    mutate(candidate);
    assert.deepEqual(validateEnvironmentProtection(candidate), [
      reviewerRuleError,
    ]);
  }

  const selfReview = exactProtection();
  selfReview.environment.protection_rules[0].prevent_self_review = true;
  assert.deepEqual(validateEnvironmentProtection(selfReview), [
    "GitHub identity-layer self-review must be allowed",
  ]);

  const adminBypass = exactProtection();
  adminBypass.environment.can_admins_bypass = true;
  assert.deepEqual(validateEnvironmentProtection(adminBypass), [
    "environment admin bypass must be disabled",
  ]);

  const identityCases = [
    (value) => (value.environment.protection_rules[0].reviewers = []),
    (value) =>
      value.environment.protection_rules[0].reviewers.push({
        type: "User",
        reviewer: { login: "other", id: 1 },
      }),
    (value) =>
      (value.environment.protection_rules[0].reviewers[0].type = "Team"),
    (value) =>
      (value.environment.protection_rules[0].reviewers[0].reviewer.login =
        "other"),
    (value) =>
      (value.environment.protection_rules[0].reviewers[0].reviewer.id = 1),
  ];
  for (const mutate of identityCases) {
    const candidate = exactProtection();
    mutate(candidate);
    assert.deepEqual(validateEnvironmentProtection(candidate), [
      "environment must name only the exact operator reviewer identity",
    ]);
  }
});

test("deployment branch-policy validation remains independent of protection rules", () => {
  const cases = [
    [
      (value) =>
        (value.environment.deployment_branch_policy.protected_branches = true),
      "environment must use only custom deployment branch policies",
    ],
    [
      (value) =>
        (value.environment.deployment_branch_policy.custom_branch_policies = false),
      "environment must use only custom deployment branch policies",
    ],
    [
      (value) => (value.branchPolicies.total_count = 0),
      "environment must have exactly one custom develop branch policy",
    ],
    [
      (value) => (value.branchPolicies.branch_policies = []),
      "environment must have exactly one custom develop branch policy",
    ],
    [
      (value) => (value.branchPolicies.branch_policies[0].name = "main"),
      "environment must have exactly one custom develop branch policy",
    ],
    [
      (value) =>
        value.branchPolicies.branch_policies.push({
          id: 2,
          name: "release",
        }),
      "environment must have exactly one custom develop branch policy",
    ],
  ];
  for (const [mutate, error] of cases) {
    const candidate = exactProtection();
    mutate(candidate);
    assert.equal(
      candidate.environment.protection_rules.some(
        (rule) => rule.type === "branch_policy",
      ),
      true,
    );
    assert.deepEqual(validateEnvironmentProtection(candidate), [error]);
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

test("completed file-backed JSON resolves in an isolated child and partial evidence fails closed", () => {
  const directory = mkdtempSync(
    resolve(tmpdir(), "vocanova-version-json-handoff-"),
  );
  try {
    const capture = resolve(directory, "versions.json");
    const preload = resolve(directory, "deny-network.cjs");
    writeFileSync(
      preload,
      [
        "const deny=()=>{throw new Error('VOCANOVA_OUTBOUND_NETWORK_DENIED')};",
        "global.fetch=deny;",
        "for(const name of ['node:net','node:tls']){const mod=require(name);mod.connect=deny;mod.createConnection=deny;}",
        "for(const name of ['node:http','node:https']){const mod=require(name);mod.request=deny;mod.get=deny;}",
      ].join("\n"),
    );
    const tag = `sha-${exactSha.slice(0, 12)}-run-123-attempt-1`;
    const exactVersion = {
      id: versionId,
      annotations: { "workers/tag": tag },
    };
    const childEnv = {
      CI: "1",
      NODE_OPTIONS: `--require=${preload}`,
      PATH: process.env.PATH,
    };

    function completeCapture(source) {
      const split = Math.max(1, Math.floor(source.length / 3));
      const chunks = [
        source.slice(0, split),
        source.slice(split, split * 2),
        source.slice(split * 2),
      ];
      const producer = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          "import { appendFileSync, writeFileSync } from 'node:fs'; const [path, ...chunks] = process.argv.slice(1); writeFileSync(path, chunks.shift()); for (const chunk of chunks) appendFileSync(path, chunk);",
          capture,
          ...chunks,
        ],
        { encoding: "utf8", env: childEnv },
      );
      assert.equal(producer.status, 0, producer.stderr);
    }

    function resolveCapture() {
      const stdin = openSync(capture, "r");
      try {
        return spawnSync(
          process.execPath,
          [policyCli, "--resolve-version-tag", tag],
          { encoding: "utf8", env: childEnv, stdio: [stdin, "pipe", "pipe"] },
        );
      } finally {
        closeSync(stdin);
      }
    }

    completeCapture(JSON.stringify([exactVersion]));
    const valid = resolveCapture();
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(valid.stdout, `${versionId}\n`);
    assert.doesNotMatch(valid.stderr, /VOCANOVA_OUTBOUND_NETWORK_DENIED/);

    const invalidDocuments = [
      JSON.stringify([exactVersion]).slice(0, -1),
      JSON.stringify([
        exactVersion,
        {
          id: "22222222-2222-4222-8222-222222222222",
          annotations: { "workers/tag": tag },
        },
      ]),
      JSON.stringify([
        { id: "not-a-uuid", annotations: { "workers/tag": tag } },
      ]),
      JSON.stringify([
        { id: versionId, annotations: { "workers/tag": "another-tag" } },
      ]),
    ];
    for (const document of invalidDocuments) {
      completeCapture(document);
      const invalid = resolveCapture();
      assert.notEqual(invalid.status, 0);
      assert.doesNotMatch(invalid.stdout, /[0-9a-f]{8}-[0-9a-f-]{27}/i);
      assert.doesNotMatch(invalid.stderr, /[0-9a-f]{8}-[0-9a-f-]{27}/i);
      assert.doesNotMatch(invalid.stderr, /VOCANOVA_OUTBOUND_NETWORK_DENIED/);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
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
