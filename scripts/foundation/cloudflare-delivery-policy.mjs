import {
  appendFileSync,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const DELIVERY_SCHEMA_VERSION = "vocanova-cloudflare-delivery-v1";
export const DELIVERY_MANIFEST_PATH =
  "infrastructure/cloudflare/delivery-manifest.json";
export const DELIVERY_ENVIRONMENTS = ["staging", "production"];
export const STAGING_ACCOUNT_ID = "0a9eda28b96d77c24dcde74f3e074d47";
export const STAGING_ENVIRONMENT = "cloudflare-staging";
export const STAGING_DISPATCHER = {
  login: "m-e-h-r-d-a-a-d",
  numeric_id: 7955432,
};
export const APPROVAL_RECEIPT_SCHEMA =
  "vocanova-cloudflare-ai-deployment-review-v1";
export const MANDATORY_STAGING_TOKEN_REVOCATION_TRIGGERS = [
  "suspected-disclosure",
  "account-or-permission-drift",
  "shared-identity-fabrication",
  "loss-of-operator-control",
  "explicit-operator-revocation-request",
];
export const STAGING_CREDENTIAL_POLICY_SURFACES = [
  {
    path: ".github/README.md",
    required: [
      "operator-revoked standing least-privilege staging token is valid until revoked",
      "Ordinary dispatches, revocations, and replacements need no package or pull request",
      "later meaningful policy or behavior change still requires governed intake and adoption",
    ],
  },
  {
    path: ".github/workflows/ci.yml",
    required: [
      "standing staging token is valid until revoked",
      "Mandatory triggers revoke first and keep staging disabled",
      "protected no-write check for standing-token replacement",
    ],
  },
  {
    path: "docs/governance/16-autonomous-development-operating-model.md",
    required: [
      "operator-revoked standing staging token is valid until revoked",
      "ordinary dispatches, revocations, and replacements need no package or PR",
      "meaningful lifecycle policy or behavior change still requires governed intake and adoption",
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    required: [
      `account \`${STAGING_ACCOUNT_ID}\` credential`,
      "exactly `Workers Scripts Edit` and `D1 Edit`",
      "operator-revoked standing token is valid until revoked",
      "`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` may exist only as `cloudflare-staging` environment secrets",
      "never at repository or organization scope",
      "No token value enters repository evidence, logs, comments, artifacts, or agent records",
    ],
  },
  {
    path: "docs/operations/10-development-workflow.md",
    required: [
      "operator-revoked standing staging token remains valid until revoked",
      "Ordinary staging dispatches, token revocations, and token replacements under the stable policy need neither a new plan nor a pull request",
      "Later meaningful policy or behavior changes still use governed intake and adoption",
    ],
  },
  {
    path: "docs/operations/11-devops-and-ci-cd.md",
    required: [
      "VOC-101-standing-staging-token-amendment",
      "operator-revoked standing Cloudflare staging token",
      "valid until revoked",
      "Mandatory triggers revoke first and keep staging disabled",
    ],
  },
  {
    path: "docs/operations/15-ai-native-product-and-engineering-operating-model.md",
    required: [
      "operator-revoked standing credential valid until revoked",
      "Mandatory triggers revoke first and keep staging disabled",
      "ordinary dispatch, revocation, or replacement requires no package or pull request",
    ],
  },
  {
    path: "docs/operations/cloudflare-delivery.md",
    required: [
      "operator-revoked standing Cloudflare staging token is valid until revoked",
      `account \`${STAGING_ACCOUNT_ID}\` with exactly Workers Scripts Edit and D1 Edit`,
      "no DNS, billing, user, organization, Access, Pages, R2, AI, production-data, token-management, or unrelated-product permission",
      "Mandatory revocation triggers are suspected disclosure, account or permission drift, shared-identity fabrication, loss of operator control, and an explicit operator revocation request",
      "A trigger requires revocation first and leaves staging disabled",
      "Only voluntary replacement when no mandatory trigger exists may retain the prior token",
      "failed voluntary replacement restores the prior environment secret",
      "failed trigger-driven replacement is revoked and removed while staging stays disabled",
      "remove the environment API-token secret, reject new approvals, cancel in-flight staging runs, open an incident",
      "verify the affected token is inactive without logging it",
      "Staging cannot resume until that verification succeeds and a valid credential passes the protected no-write check",
      "Ordinary dispatch, revocation, and replacement under this stable policy require neither a change package nor a pull request and are not coupled to deployment",
    ],
  },
  {
    path: "scripts/foundation/cloudflare-delivery-policy.mjs",
    required: [
      "MANDATORY_STAGING_TOKEN_REVOCATION_TRIGGERS",
      "inspectStagingCredentialPolicySources",
      "planStagingCredentialLifecycle",
      "verify-affected-token-inactive-without-logging",
      "requiresChangePackageOrPullRequest: false",
      "coupledToDeployment: false",
    ],
  },
  {
    path: "scripts/foundation/cloudflare-delivery-policy.test.mjs",
    required: [
      "every mandatory staging-token trigger revokes first",
      "failed voluntary replacement restores and verifies the prior token",
      "failed trigger-driven replacement removes the failed credential",
      "unconfirmed mandatory revocation removes the secret",
      "staging-token lifecycle planner rejects invalid or contradictory scenarios",
    ],
  },
];
export const STAGING_CREDENTIAL_POLICY_PATHS =
  STAGING_CREDENTIAL_POLICY_SURFACES.map(({ path }) => path);

const STAGING_CREDENTIAL_CONTEXT = [
  /\b(?:cloudflare[-\s]+)?staging(?:[-\s]+environment)?[-\s]+(?:api[-\s]+)?(?:token|credential)\b/i,
  /\b(?:token|credential)\s+(?:for|used\s+(?:for|by|in)|stored\s+in|scoped\s+to)\s+(?:the\s+)?(?:cloudflare[-\s]+)?staging(?:[-\s]+environment)?\b/i,
];
const STAGING_CREDENTIAL_ACTION =
  /\b(?:dispatch(?:es|ed|ing)?|use[ds]?|using|revok(?:e|es|ed|ing)|revocation(?:s)?|replac(?:e|es|ed|ing)|replacement(?:s)?|reissu(?:e|es|ed|ing|ance)|issu(?:e|es|ed|ing|ance)|rotat(?:e|es|ed|ing|ion)|renew(?:s|ed|ing|al)?|provision(?:s|ed|ing)?|install(?:s|ed|ing)?)\b/i;
const GOVERNED_CHANGE_ARTIFACT =
  /\b(?:change[-\s]+package|pull[-\s]+request|PR|(?:new|change|governed)\s+plan)\b/i;
const TOKEN_AUTHORITY_TARGET =
  /\b(?:dispatch(?:es|ed|ing)?|review(?:s|ed|ing)?|approval|approv(?:e|es|ed|ing)|review[-\s]+judgment)\b/i;
const TOKEN_POSSESSION =
  /\b(?:possession|possess(?:es|ed|ing)?|holder|holding|using|presenting|access\s+to|control|ownership)\b/i;
const CREDENTIAL_LIFECYCLE_ACTION =
  /\b(?:reissu(?:e|es|ed|ing|ance)|rotat(?:e|es|ed|ing|ion)|renew(?:s|ed|ing|al)?|recreat(?:e|es|ed|ing|ion)|regenerat(?:e|es|ed|ing|ion)|replac(?:e|es|ed|ing)|replacement)\b/i;
const CALENDAR_CADENCE =
  /\b(?:calendar|cadence|schedule(?:d)?|daily|weekly|biweekly|monthly|quarterly|semiannually|annually|annual|yearly|periodic(?:ally)?|regular(?:ly|\s+intervals?)|(?:every|each)\s+(?:(?:[1-9][0-9]*)\s+)?(?:day|days|week|weeks|month|months|quarter|quarters|year|years)|once\s+per\s+(?:day|week|month|quarter|year))\b/i;
const OPERATIONAL_CADENCE =
  /\b(?:per|after|before|on|upon|for)\s+(?:each|every)\s+(?:dispatch|use|run|deployment|release|review|approval)\b|\bper[-\s]+(?:dispatch|use|run|deployment|release)\b/i;
const NEGATED_LIFECYCLE =
  /\b(?:no|never|without)\b[^.;]{0,50}\b(?:expiry|expiration|calendar|cadence|schedule|reissu(?:e|ed|ance)|rotat(?:e|ed|ion)|renew(?:ed|al)|replac(?:e|ed|ement))\b|\b(?:do(?:es)?|must|shall|will|is|are)\s+not\s+(?:be\s+)?(?:expire[ds]?|reissu(?:e|ed)|rotat(?:e|ed)|renew(?:ed)?|replac(?:e|ed))\b/i;
const REVOCATION_TRIGGER_CONTEXT =
  /\b(?:after|on|upon|during|for|following|because\s+of|if|when|in\s+response\s+to|triggered\s+by)\b[^.;]{0,80}\b(?:revok(?:e|ed|ing)|revocation|mandatory\s+trigger|disclosure|permission\s+drift|account\s+drift|fabrication|loss\s+of\s+operator\s+control|operator\s+revocation\s+request|voluntary\s+replacement)\b/i;

const CANONICAL_SHA = /^[0-9a-f]{40}$/;
const VERSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_DECIMAL = /^[1-9][0-9]{0,15}$/;
const PARTICIPANT = /^[A-Za-z0-9_./:@-]{1,160}$/;
const REQUIRED_CHECKS = ["ci required"];
const SECRET_NAMES = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"];
const MIGRATION_LEDGER = {
  directory: "apps/api-worker/migrations",
  table: "d1_migrations",
  ordered_files: [
    "0001_foundation.sql",
    "0002_identity_accounts.sql",
    "0003_content_learning_reviews.sql",
    "0004_missions_gamification.sql",
    "0005_ai_feedback.sql",
    "0006_synthetic_test_account.sql",
    "0007_reconciliation_write_guard.sql",
  ],
};
const OBSERVABILITY = {
  enabled: true,
  logs: { enabled: true, invocation_logs: true },
};
const EXPECTED_WRANGLER_ROOTS = {
  api: {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "vocanova-api-local",
    main: "src/index.ts",
    compatibility_date: "2026-08-22",
    workers_dev: false,
    preview_urls: false,
    d1_databases: [
      {
        binding: "DB",
        database_name: "vocanova-local",
        database_id: "local",
        migrations_dir: "migrations",
        migrations_table: "d1_migrations",
      },
    ],
    vars: {
      ENVIRONMENT: "local",
      RELEASE: "local",
      CORS_ALLOWED_ORIGINS: "http://127.0.0.1:3000",
      AUTH_BASE_URL: "http://127.0.0.1:3000",
      OAUTH_REDIRECT_URI:
        "http://127.0.0.1:8080/api/v1/auth/oauth/google/callback",
      OAUTH_RETURN_ALLOWLIST:
        "http://127.0.0.1:3000/home,http://127.0.0.1:3000/onboarding",
      MAGIC_LINK_ENABLED: "true",
      GOOGLE_OAUTH_ENABLED: "false",
      NEW_USER_SIGNUP_ENABLED: "true",
      NEW_USER_SIGNUP_ALLOWLIST: "",
      RESERVED_SYNTHETIC_EMAIL: "",
      AI_GENERATION_ENABLED: "false",
      AI_PER_MINUTE: "5",
      AI_PER_DAY: "30",
      AI_GLOBAL_PER_DAY: "1000",
      AI_MONTHLY_COST_HARD_STOP_CENTS: "0",
      AI_REQUEST_COST_CENTS: "0",
      AI_GENERATION_LEASE_SECONDS: "15",
      AI_PROVIDER_TIMEOUT_MS: "10000",
    },
    observability: OBSERVABILITY,
  },
  web: {
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "vocanova-web-local",
    main: "sentry.edge.config.ts",
    compatibility_date: "2026-08-22",
    compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
    workers_dev: false,
    preview_urls: false,
    assets: { directory: ".open-next/assets", binding: "ASSETS" },
    services: [{ binding: "API", service: "vocanova-api-local" }],
    vars: { ENVIRONMENT: "local" },
    observability: OBSERVABILITY,
  },
};
const STAGING_RESOURCES = {
  account_id: STAGING_ACCOUNT_ID,
  zone_id: "63286d93b5f32925ac7366b4e97908be",
  zone_name: "vocanova.site",
  requested_d1_location_hint: "eeur",
  served_d1_region: "EEUR",
  api_baseline_version_id: "ace13c0b-c148-4ef1-ad9a-fdfdb07f264f",
  web_baseline_version_id: "5255e64d-872e-469f-90b6-bea49efd5e75",
  zero_traffic_probe_version_ids: [
    "858009b5-0840-499d-92f4-e0a0483e0b33",
    "0dc15f45-d178-480e-ba32-ca5279cc2c17",
    "7b694392-8f38-4329-bd2f-af982c3c6a56",
  ],
  applied_migration_count: 7,
  application_rows: 0,
  workers_plan: "Free",
  d1_plan: "Free",
  incremental_vocanova_cost_cents: 0,
  unrelated_basic_load_balancing:
    "unchanged-unexpanded-not-attributed-to-vocanova",
  production_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
};
const PRODUCTION_SENTINEL = {
  state: "held",
  hold_id: "VOC-080-HOLD-01",
  required_ref: "refs/heads/main",
  github_environment: "cloudflare-production",
  cost_ceiling_cents: 0,
  workers: {
    api: "vocanova-api-production",
    web: "vocanova-web-production",
  },
  d1: {
    binding: "DB",
    database_name: "vocanova-production",
    database_id: "held-production-d1",
  },
  secret_scopes: {
    github: "cloudflare-production",
    api_worker: "vocanova-api-production",
    web_worker: "vocanova-web-production",
  },
  routes: {
    api: "https://api-production.invalid",
    web: "https://web-production.invalid",
  },
  authority_evidence_url: null,
  resource_manifest_evidence_url: null,
  rollback_rehearsal_url: null,
  staging_evidence_url: null,
  backup_evidence_url: null,
  authorization_expires_at: null,
};

export function loadDeliveryManifest(repositoryRoot) {
  return JSON.parse(
    readFileSync(resolve(repositoryRoot, DELIVERY_MANIFEST_PATH), "utf8"),
  );
}

export function parseJsonc(source) {
  let stripped = "";
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
        stripped += character;
      } else stripped += " ";
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        stripped += "  ";
        index += 1;
        blockComment = false;
      } else stripped += character === "\n" ? "\n" : " ";
      continue;
    }
    if (quote) {
      stripped += character;
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      stripped += character;
    } else if (character === "/" && next === "/") {
      stripped += "  ";
      index += 1;
      lineComment = true;
    } else if (character === "/" && next === "*") {
      stripped += "  ";
      index += 1;
      blockComment = true;
    } else stripped += character;
  }
  return JSON.parse(stripped.replace(/,\s*([}\]])/g, "$1"));
}

export function inspectDeliveryManifest(manifest, configs) {
  const errors = [];
  if (manifest?.schema_version !== DELIVERY_SCHEMA_VERSION)
    errors.push(`delivery manifest schema must be ${DELIVERY_SCHEMA_VERSION}`);
  if (manifest?.status !== "standard-ready")
    errors.push("repository delivery status must be standard-ready");
  if (manifest?.wrangler_version !== "4.125.0")
    errors.push("delivery manifest must bind locked Wrangler 4.125.0");
  if (manifest?.workflow !== ".github/workflows/ci.yml")
    errors.push("Cloudflare delivery must remain inside ci.yml");
  inspectLimits(manifest?.limits, errors);
  if (!deepEqual(manifest?.migration_ledger, MIGRATION_LEDGER))
    errors.push("ordered D1 migration ledger drifted");
  inspectStaging(manifest?.environments?.staging, errors);
  if (!deepEqual(manifest?.environments?.production, PRODUCTION_SENTINEL))
    errors.push("production held environment or sentinel set drifted");
  if (configs) {
    inspectWranglerRoots(configs, errors);
    for (const environment of DELIVERY_ENVIRONMENTS)
      inspectWranglerEnvironment(
        environment,
        manifest?.environments?.[environment],
        configs,
        errors,
      );
  }
  return errors;
}

function inspectWranglerRoots(configs, errors) {
  for (const component of ["api", "web"]) {
    const config = configs?.[component];
    if (!isRecord(config)) {
      errors.push(`${component} Wrangler configuration must exist`);
      continue;
    }
    const root = Object.fromEntries(
      Object.entries(config).filter(([key]) => key !== "env"),
    );
    if (!deepEqual(root, EXPECTED_WRANGLER_ROOTS[component]))
      errors.push(
        `${component} Wrangler root differs from the exact inherited configuration`,
      );
    if (
      !isRecord(config.env) ||
      !deepEqual(
        Object.keys(config.env).sort(),
        [...DELIVERY_ENVIRONMENTS].sort(),
      )
    )
      errors.push(
        `${component} Wrangler environment names must be exactly staging and production`,
      );
  }
}

function inspectLimits(limits, errors) {
  for (const [name, minimum, maximum] of [
    ["max_migrations_per_release", 1, 100],
    ["max_smoke_attempts", 1, 20],
    ["max_smoke_seconds", 1, 900],
    ["max_api_gzip_bytes", 1, 3_000_000],
    ["max_web_gzip_bytes", 1, 10_000_000],
  ]) {
    const value = limits?.[name];
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum)
      errors.push(`${name} must be an integer from ${minimum} to ${maximum}`);
  }
}

function inspectStaging(staging, errors) {
  if (!isRecord(staging)) {
    errors.push("delivery manifest is missing staging");
    return;
  }
  const exact = {
    state: "standard-ready",
    hold_id: "VOC-080-HOLD-00",
    required_ref: "refs/heads/develop",
    github_environment: STAGING_ENVIRONMENT,
    cost_ceiling_cents: 0,
    workers: { api: "vocanova-api-staging", web: "vocanova-web-staging" },
    d1: {
      binding: "DB",
      database_name: "vocanova-staging",
      database_id: "22ae386f-e3f5-4d98-a3ad-18b39d3b8556",
    },
    secret_scopes: {
      github: STAGING_ENVIRONMENT,
      api_worker: "vocanova-api-staging",
      web_worker: "vocanova-web-staging",
    },
    secret_names: SECRET_NAMES,
    routes: {
      api: "https://api-stag.vocanova.site",
      web: "https://stag.vocanova.site",
    },
  };
  for (const [field, value] of Object.entries(exact))
    if (!deepEqual(staging[field], value))
      errors.push(`staging ${field} differs from the reviewed boundary`);
  if (!deepEqual(staging.resources, STAGING_RESOURCES))
    errors.push("staging resource, cost, privacy, or hold tuple drifted");
  if (
    staging.resources?.applied_migration_count !==
    MIGRATION_LEDGER.ordered_files.length
  )
    errors.push("staging applied migration count differs from the ledger");
  if (
    staging.resource_manifest_evidence_url !==
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5437898152" ||
    staging.rollback_rehearsal_url !==
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5435923878"
  )
    errors.push("staging resource and rollback evidence drifted");
  if (
    staging.authority_evidence_url !== null ||
    staging.authorization_expires_at !== null
  )
    errors.push("staging must not commit future external-action evidence");
  const controls = staging.delivery_controls;
  const expectedControls = {
    dispatcher_login: STAGING_DISPATCHER.login,
    dispatcher_numeric_id: STAGING_DISPATCHER.numeric_id,
    allowed_operations: ["credential-check", "deploy"],
    deployment_confirmation_prefix: "DEPLOY staging",
    credential_check_confirmation_prefix: "CHECK staging",
    environment_protection: {
      reviewer_login: STAGING_DISPATCHER.login,
      reviewer_numeric_id: STAGING_DISPATCHER.numeric_id,
      prevent_self_review: false,
      can_admins_bypass: false,
      custom_branch_policy: "develop",
    },
    approval_receipt_schema: APPROVAL_RECEIPT_SCHEMA,
    required_same_run_checks: REQUIRED_CHECKS,
    rollback_source: "current-single-version-100-percent-deployment",
    d1_recovery: "forward-correction-only",
  };
  if (!deepEqual(controls, expectedControls))
    errors.push("staging standard delivery controls drifted");
  if (Object.hasOwn(staging, "prepared_runtime_binder"))
    errors.push("superseded prepared runtime binder must be absent");
}

function inspectWranglerEnvironment(environment, record, configs, errors) {
  const api = configs?.api?.env?.[environment];
  const web = configs?.web?.env?.[environment];
  if (!isRecord(api) || !isRecord(web)) {
    errors.push(`${environment} Wrangler environments must exist`);
    return;
  }
  const isStaging = environment === "staging";
  const webUrl = isStaging
    ? "https://stag.vocanova.site"
    : "https://web-production.invalid";
  const apiUrl = isStaging
    ? "https://api-stag.vocanova.site"
    : "https://api-production.invalid";
  const expectedApi = {
    name: record.workers.api,
    workers_dev: false,
    preview_urls: false,
    ...(isStaging
      ? {
          routes: [
            {
              pattern: String(record.routes.api).replace(/^https:\/\//, ""),
              custom_domain: true,
            },
          ],
        }
      : {}),
    d1_databases: [
      {
        binding: record.d1.binding,
        database_name: record.d1.database_name,
        database_id: record.d1.database_id,
        migrations_dir: "migrations",
        migrations_table: MIGRATION_LEDGER.table,
      },
    ],
    vars: {
      ENVIRONMENT: environment,
      RELEASE: isStaging ? "prepared" : "held",
      CORS_ALLOWED_ORIGINS: webUrl,
      AUTH_BASE_URL: webUrl,
      OAUTH_REDIRECT_URI: `${apiUrl}/api/v1/auth/oauth/google/callback`,
      OAUTH_RETURN_ALLOWLIST: `${webUrl}/home,${webUrl}/onboarding`,
      MAGIC_LINK_ENABLED: "false",
      GOOGLE_OAUTH_ENABLED: "false",
      NEW_USER_SIGNUP_ENABLED: "false",
      NEW_USER_SIGNUP_ALLOWLIST: "",
      RESERVED_SYNTHETIC_EMAIL: "",
      AI_GENERATION_ENABLED: "false",
      AI_PER_MINUTE: "5",
      AI_PER_DAY: "30",
      AI_GLOBAL_PER_DAY: "1000",
      AI_MONTHLY_COST_HARD_STOP_CENTS: "0",
      AI_REQUEST_COST_CENTS: "0",
      AI_GENERATION_LEASE_SECONDS: "15",
      AI_PROVIDER_TIMEOUT_MS: "10000",
    },
  };
  const expectedWeb = {
    name: record.workers.web,
    workers_dev: false,
    preview_urls: false,
    ...(isStaging
      ? {
          routes: [
            {
              pattern: String(record.routes.web).replace(/^https:\/\//, ""),
              custom_domain: true,
            },
          ],
        }
      : {}),
    services: [{ binding: "API", service: record.workers.api }],
    vars: { ENVIRONMENT: environment },
  };
  if (!deepEqual(api, expectedApi))
    errors.push(
      `${environment} API Worker environment differs from the exact binding and safety tuple`,
    );
  if (!deepEqual(web, expectedWeb))
    errors.push(
      `${environment} web Worker environment differs from the exact binding and safety tuple`,
    );
}

export function inspectDeliveryWorkflow(source) {
  const errors = [];
  for (const marker of [
    "workflow_dispatch:",
    "delivery_environment:",
    "delivery_operation:",
    "confirmation:",
    "name: cloudflare delivery policy",
    "pnpm run ci:delivery",
    "name: cloudflare delivery gate",
    "name: cloudflare staging",
    "name: cloudflare production",
    "environment: cloudflare-staging",
    "Validate exact current-attempt AI approval receipt",
    "/actions/runs/${GITHUB_RUN_ID}/approvals",
    "GITHUB_TRIGGERING_ACTOR: ${{ github.triggering_actor }}",
    "$approval.comment as $receipt",
    "$receipt == ($r | to_entries | sort_by(.key) | from_entries | tojson)",
    "Read exact current deployments before any write",
    "wrangler deployments status --env staging --json",
    "wrangler whoami --json",
    "--resolve-current-deployment",
    'tag="sha-${GITHUB_SHA:0:12}-run-${GITHUB_RUN_ID}-attempt-${GITHUB_RUN_ATTEMPT}"',
    "api_rollback_status=0",
    "web_rollback_status=0",
    "both were attempted",
    "VOC-080-HOLD-01 and VOC-080-HOLD-02 remain active",
  ]) {
    if (!source.includes(marker)) errors.push(`workflow missing: ${marker}`);
  }
  for (const removed of [
    "reviewed_sha:",
    "action_authority_url:",
    "action_authority_sha256:",
    "act03_evidence_url:",
    "act03_evidence_sha256:",
    "pr2_review_url:",
    "pr2_review_sha256:",
    "binder_review_url:",
    "binder_review_sha256:",
    "dispatch_nonce:",
    "estimated_cost_cents:",
    "previous_api_version_id:",
    "previous_web_version_id:",
    "--experimental-provision",
    "--experimental-auto-create",
    "--pre-secret-recheck",
    "--verify-secret-step-start",
  ]) {
    if (source.includes(removed))
      errors.push(`superseded delivery surface remains: ${removed}`);
  }

  const gate = extractJob(source, "delivery-gate");
  const staging = extractJob(source, "cloudflare-staging");
  const production = extractJob(source, "cloudflare-production");
  if (!gate || !staging || !production) return errors;
  for (const line of staging
    .split("\n")
    .filter((entry) => entry.includes("exec wrangler"))) {
    if (!line.includes("--config wrangler.jsonc"))
      errors.push(
        "every staging Wrangler command must pin the reviewed wrangler.jsonc",
      );
  }
  if (/environment:\s*cloudflare-/m.test(gate))
    errors.push("credential-free delivery gate must not enter an environment");
  if (!gate.includes("needs: [required]") || !gate.includes("actions: read"))
    errors.push(
      "delivery gate must depend on same-run required checks and use Actions read-only",
    );
  if (!staging.includes("needs: [required, delivery-gate]"))
    errors.push("staging must depend on required checks and delivery gate");
  if (!staging.includes("actions: read") || !staging.includes("contents: read"))
    errors.push(
      "staging permissions must be actions/read and contents/read only",
    );
  if (/\bdeployments:\s*write\b/.test(staging))
    errors.push("staging must not grant GitHub deployments write");
  const stepsIndex = staging.indexOf("    steps:\n");
  const firstStep = staging
    .slice(stepsIndex)
    .match(/^      - name: (.+)$/m)?.[1];
  if (
    stepsIndex === -1 ||
    firstStep !== "Validate exact current-attempt AI approval receipt"
  )
    errors.push(
      "approval-history validation must be the first environment-job step",
    );
  const firstStepEnd = staging.indexOf("\n      - name:", stepsIndex + 20);
  const beforeSecondStep = staging.slice(0, firstStepEnd);
  if (secretExpressions(beforeSecondStep).length !== 0)
    errors.push(
      "a Cloudflare secret is referenced before approval-history validation",
    );
  for (const marker of [
    "GITHUB_TOKEN: ${{ github.token }}",
    "if length != 1 then false else",
    "$approval.comment as $receipt",
    "$receipt == ($r | to_entries | sort_by(.key) | from_entries | tojson)",
    "vocanova-cloudflare-ai-deployment-review-v1",
    "checks_reviewed",
    "coordinator_model",
    "environment_id",
    "environment_name",
    "exact_sha_author",
    "no_cloudflare_secret_access",
    "participant_id",
    "reviewer_model",
    "reviewer_received_approval_credentials",
    "run_attempt",
    "run_id",
    "task_id",
    "verdict",
  ]) {
    if (!beforeSecondStep.includes(marker))
      errors.push(`approval-history first step is missing: ${marker}`);
  }
  if (secretExpressions(beforeSecondStep).length !== 0)
    errors.push("approval-history first step may use no Actions secret");
  if (secretExpressions(staging.slice(0, stepsIndex)).length !== 0)
    errors.push(
      "staging job-level environment must not reference Cloudflare secrets",
    );

  const outsideStaging = source.replace(staging, "");
  if (secretExpressions(outsideStaging).length !== 0)
    errors.push(
      "Cloudflare secrets may be referenced only by staging environment steps",
    );
  const allowedSecretSteps = new Set([
    "Read exact current deployments before any write",
    "Apply ordered compatible staging D1 migrations",
    "Upload immutable staging Worker versions",
    "Promote exact staging Worker versions",
    "Roll back exact staging Worker versions after promotion failure",
  ]);
  for (const step of extractSteps(staging)) {
    const expressions = secretExpressions(step.body);
    if (expressions.length !== 0 && !allowedSecretSteps.has(step.name))
      errors.push(
        `unbounded Cloudflare secret reference in step: ${step.name}`,
      );
    if (
      expressions.length !== 0 &&
      !deepEqual(expressions.sort(), [
        "secrets.CLOUDFLARE_ACCOUNT_ID",
        "secrets.CLOUDFLARE_API_TOKEN",
      ])
    )
      errors.push(
        `incomplete Cloudflare credential pair in step: ${step.name}`,
      );
  }
  const prewrite = staging.indexOf(
    "- name: Read exact current deployments before any write",
  );
  const migration = staging.indexOf(
    "- name: Apply ordered compatible staging D1 migrations",
  );
  if (prewrite === -1 || migration === -1 || prewrite >= migration)
    errors.push("current deployment rollback discovery must precede D1 writes");
  if (
    !staging.includes("steps.prewrite.outputs.api_rollback_version_id") ||
    !staging.includes("steps.prewrite.outputs.web_rollback_version_id")
  )
    errors.push("rollback must consume the exact current deployment outputs");
  const rollback = extractSteps(staging).find((step) =>
    step.name.startsWith("Roll back exact staging Worker versions"),
  );
  for (const marker of [
    "set +e",
    "api_rollback_status=0",
    "web_rollback_status=0",
    "|| api_rollback_status=$?",
    "|| web_rollback_status=$?",
    "api_rollback_status != 0 || web_rollback_status != 0",
    "both were attempted",
  ]) {
    if (!rollback?.body.includes(marker))
      errors.push(`independent dual-Worker rollback is missing: ${marker}`);
  }
  if (/environment:\s*cloudflare-production/.test(production))
    errors.push("held production must fail before entering an environment");
  if (/secrets\.|\bwrangler\b/.test(production))
    errors.push(
      "held production sentinel may not reference secrets or Wrangler",
    );
  return errors;
}

function extractJob(source, name) {
  const start = source.indexOf(`\n  ${name}:\n`);
  if (start === -1) return "";
  const tail = source.slice(start + 1);
  const next = tail.slice(name.length + 4).search(/^  [A-Za-z0-9_-]+:\n/m);
  return next === -1 ? tail : tail.slice(0, name.length + 4 + next);
}

function extractSteps(job) {
  const matches = [...job.matchAll(/^      - name: (.+)$/gm)];
  return matches.map((match, index) => ({
    name: match[1],
    body: job.slice(match.index, matches[index + 1]?.index ?? job.length),
  }));
}

function secretExpressions(source) {
  return [...source.matchAll(/\$\{\{([\s\S]*?)\}\}/g)]
    .map((match) => match[1].trim())
    .filter((expression) => /\bsecrets\b/i.test(expression));
}

function stagingCredentialAssertions(source) {
  return source
    .replace(/<!--.*?-->/gs, "\n\n")
    .replace(/^(?=[A-Za-z_][A-Za-z0-9_-]*:\s)/gm, "\n\n")
    .split(/[.!?;]+|\n\s*\n+/)
    .map((assertion) => assertion.replace(/\s+/g, " ").trim())
    .filter(
      (assertion) =>
        assertion !== "" &&
        STAGING_CREDENTIAL_CONTEXT.some((pattern) => pattern.test(assertion)),
    );
}

function requiresPerActionGovernedChange(assertion) {
  if (
    !STAGING_CREDENTIAL_ACTION.test(assertion) ||
    !GOVERNED_CHANGE_ARTIFACT.test(assertion)
  )
    return false;
  if (
    [
      /\b(?:do(?:es)?|did|must|shall|will|can|may)\s+not\s+(?:require|need|create|open|await|use)\b/i,
      /\b(?:requires?|needs?)\s+(?:no|neither)\b/i,
      /\b(?:no|neither)\b[^.;]{0,80}\b(?:change[-\s]+package|pull[-\s]+request|PR|(?:new|change|governed)\s+plan)\b[^.;]{0,40}\b(?:is|are|be)?\s*(?:required|needed|mandatory)\b/i,
      /\b(?:change[-\s]+package|pull[-\s]+request|PR|(?:new|change|governed)\s+plan)\b\s+(?:is|are)\s+(?:not|never)\s+(?:required|needed|mandatory)\b/i,
    ].some((pattern) => pattern.test(assertion))
  )
    return false;
  return [
    /\b(?:requires?|needs?)\s+(?!(?:no|neither|not)\b)/i,
    /\b(?:must|shall)\s+(?:create|open|use|have|receive|await|follow|precede|be\s+(?:preceded|gated|conditioned))/i,
    /\b(?:is|are)\s+(?:required|mandatory|needed|gated|conditioned|dependent)\b/i,
    /\bonly\s+(?:after|with|through)\b/i,
    /\bfor\s+(?:each|every|any)\b[^.;]{0,120}\b(?:create|open|adopt|approve)\b/i,
    /\b(?:cannot|can't|may\s+not)\b[^.;]{0,100}\bwithout\b/i,
    /\b(?:subject|conditioned|contingent|dependent)\s+(?:to|on|upon)\b/i,
    /\b(?:change[-\s]+package|pull[-\s]+request|PR|(?:new|change|governed)\s+plan)\b[^.;]{0,100}\b(?:gates?|precedes?|authorizes?|approves?)\b/i,
  ].some((pattern) => pattern.test(assertion));
}

function grantsTokenPossessionAuthority(assertion) {
  if (!TOKEN_AUTHORITY_TARGET.test(assertion)) return false;
  if (
    [
      /\b(?:do(?:es)?|did|can|may|must|shall|will)\s+not\s+(?:grant|confer|authorize|entitle|permit|allow|provide|give|create|carry)\b/i,
      /\b(?:grants?|confers?|authorizes?|entitles?|permits?|allows?|provides?|gives?|creates?|carries?)\s+(?:no|neither)\b/i,
      /\b(?:no|neither)\b[^.;]{0,80}\b(?:dispatch|review|approval)\s+(?:authority|permission|right|judgment)\b/i,
      /\bnever\s+(?:grants?|confers?|authorizes?|entitles?|permits?|allows?|provides?|gives?|creates?|carries?)\b/i,
    ].some((pattern) => pattern.test(assertion))
  )
    return false;
  const positiveGrant = [
    /\b(?:grants?|confers?|authorizes?|entitles?|permits?|allows?|provides?|gives?|creates?|carries?)\s+(?!(?:no|neither|not)\b)/i,
    /\b(?:is|serves\s+as|counts\s+as|constitutes?)\s+(?!(?:no|not|never)\b)[^.;]{0,60}\b(?:dispatch|review|approval)\s+(?:authority|permission|right|judgment)\b/i,
    /\b(?:suffices?|qualifies?)\s+(?:as|for)\b[^.;]{0,60}\b(?:dispatch|review|approval)\b/i,
    /\b(?:may|can|is\s+allowed\s+to|has\s+the\s+right\s+to)\s+(?:directly\s+)?(?:dispatch|review|approve)\b/i,
  ].some((pattern) => pattern.test(assertion));
  if (!positiveGrant) return false;
  return (
    TOKEN_POSSESSION.test(assertion) ||
    STAGING_CREDENTIAL_CONTEXT.some((pattern) => pattern.test(assertion))
  );
}

function imposesNonStandingLifecycle(assertion) {
  if (NEGATED_LIFECYCLE.test(assertion)) return false;
  if (
    /\b(?:is|are|remains?|becomes?|must\s+be|shall\s+be|will\s+be)\s+(?:a\s+)?(?:short[-\s]+lived|time[-\s]+bound|temporary|ephemeral|single[-\s]+use|one[-\s]+time)\b/i.test(
      assertion,
    ) ||
    (/\b(?:expires?|expiry|expiration|ceases?\s+to\s+be\s+valid)\b/i.test(
      assertion,
    ) &&
      !REVOCATION_TRIGGER_CONTEXT.test(assertion)) ||
    /\b(?:has|carries?|uses?)\s+(?:a\s+)?(?:fixed[-\s]+)?(?:expiry|expiration|lifetime|maximum\b[^.;]{0,24}\bage)\b/i.test(
      assertion,
    ) ||
    /\b(?:finite|fixed|bounded|maximum)[-\s]+(?:validity|lifetime|age)\b/i.test(
      assertion,
    ) ||
    (/\bvalid\s+(?:for|through)\s+(?!revok(?:e|ed|ation)\b)/i.test(assertion) &&
      !/\bvalid\s+until\s+revoked\b/i.test(assertion)) ||
    /\b[1-9][0-9]*[-\s]+(?:day|week|month|quarter|year)s?[-\s]+(?:cloudflare[-\s]+)?staging(?:[-\s]+environment)?[-\s]+(?:api[-\s]+)?(?:token|credential)\b/i.test(
      assertion,
    )
  )
    return true;
  if (
    CREDENTIAL_LIFECYCLE_ACTION.test(assertion) &&
    (CALENDAR_CADENCE.test(assertion) || OPERATIONAL_CADENCE.test(assertion))
  )
    return true;
  if (
    /\b(?:must|shall|will|automatically)\s+(?:be\s+)?(?:reissued|rotate[ds]?|rotated|renewed|recreated|regenerated|replaced)\b/i.test(
      assertion,
    ) &&
    !REVOCATION_TRIGGER_CONTEXT.test(assertion)
  )
    return true;
  return false;
}

export function inspectStagingCredentialPolicySources(sources) {
  const errors = [];
  if (!isRecord(sources))
    return ["staging credential policy sources are invalid"];
  const actualPaths = Object.keys(sources).sort();
  const expectedPaths = [...STAGING_CREDENTIAL_POLICY_PATHS].sort();
  if (!deepEqual(actualPaths, expectedPaths))
    errors.push("staging credential living-path inventory drifted");

  for (const { path, required } of STAGING_CREDENTIAL_POLICY_SURFACES) {
    const source = sources[path];
    if (typeof source !== "string") {
      errors.push(`staging credential policy source is missing: ${path}`);
      continue;
    }
    const normalizedSource = source.replace(/\s+/g, " ");
    for (const marker of required)
      if (!normalizedSource.includes(marker.replace(/\s+/g, " ")))
        errors.push(
          `staging credential policy is incomplete in ${path}: ${marker}`,
        );
    if (path.endsWith(".mjs")) continue;
    for (const assertion of stagingCredentialAssertions(source)) {
      if (requiresPerActionGovernedChange(assertion))
        errors.push(
          `${path}: staging-token action cannot require a package, plan, or pull request`,
        );
      if (grantsTokenPossessionAuthority(assertion))
        errors.push(
          `${path}: staging-token possession cannot grant dispatch, review, or approval authority`,
        );
      if (imposesNonStandingLifecycle(assertion))
        errors.push(
          `${path}: staging token must remain standing and valid until revoked without calendar or cadence reissue`,
        );
    }
  }
  return errors;
}

export function planStagingCredentialLifecycle({
  trigger = null,
  revocationConfirmed = true,
  replacementStatus = "passed",
} = {}) {
  if (
    trigger !== null &&
    !MANDATORY_STAGING_TOKEN_REVOCATION_TRIGGERS.includes(trigger)
  )
    throw new Error("mandatory staging-token revocation trigger is invalid");
  if (!["passed", "failed"].includes(replacementStatus))
    throw new Error("staging-token replacement status is invalid");
  if (typeof revocationConfirmed !== "boolean")
    throw new Error("staging-token revocation confirmation must be boolean");
  if (trigger === null && !revocationConfirmed)
    throw new Error(
      "unconfirmed revocation containment requires a mandatory trigger",
    );

  const common = {
    trigger,
    tokenValueLogged: false,
    requiresChangePackageOrPullRequest: false,
    coupledToDeployment: false,
  };
  if (trigger === null) {
    const operations = [
      "retain-prior-token",
      "create-replacement-token",
      "sanitized-dashboard-policy-readback",
      "local-status-and-account-verification-without-logging",
      "install-replacement-environment-api-token-secret",
    ];
    if (replacementStatus === "passed") {
      operations.push(
        "protected-no-write-credential-check",
        "revoke-prior-token",
      );
      return {
        ...common,
        mode: "voluntary-replacement",
        operations,
        priorTokenRetainedThroughReplacementChecks: true,
        environmentApiTokenSecret: "verified-replacement-credential",
        newApprovals: "allowed",
        inFlightStagingRuns: "unchanged",
        incident: "none",
        staging: "enabled",
        resumptionCondition: "already-satisfied-by-protected-check",
      };
    }
    operations.push(
      "replacement-check-failed",
      "restore-prior-environment-api-token-secret",
      "protected-no-write-check-for-prior-credential",
      "revoke-failed-replacement",
      "remove-failed-replacement",
    );
    return {
      ...common,
      mode: "voluntary-replacement",
      operations,
      priorTokenRetainedThroughReplacementChecks: true,
      environmentApiTokenSecret: "verified-prior-credential",
      newApprovals: "allowed",
      inFlightStagingRuns: "unchanged",
      incident: "none",
      staging: "enabled",
      resumptionCondition: "already-satisfied-by-restored-protected-check",
    };
  }

  const operations = ["revoke-affected-token", "disable-staging"];
  if (!revocationConfirmed) {
    operations.push(
      "remove-environment-api-token-secret",
      "reject-new-staging-approvals",
      "cancel-in-flight-staging-runs",
      "open-incident",
      "retry-revocation",
      "verify-affected-token-inactive-without-logging",
    );
    return {
      ...common,
      mode: "mandatory-trigger",
      operations,
      priorTokenRetainedThroughReplacementChecks: false,
      environmentApiTokenSecret: "absent",
      newApprovals: "rejected",
      inFlightStagingRuns: "cancelled",
      incident: "opened",
      staging: "disabled",
      resumptionCondition:
        "affected-token-verified-inactive-and-valid-credential-protected-check-passed",
    };
  }

  operations.push(
    "verify-affected-token-inactive-without-logging",
    "create-replacement-token",
    "sanitized-dashboard-policy-readback",
    "local-status-and-account-verification-without-logging",
    "install-replacement-environment-api-token-secret",
  );
  if (replacementStatus === "passed") {
    operations.push(
      "protected-no-write-credential-check",
      "enable-staging-after-protected-check",
    );
    return {
      ...common,
      mode: "mandatory-trigger",
      operations,
      priorTokenRetainedThroughReplacementChecks: false,
      environmentApiTokenSecret: "verified-replacement-credential",
      newApprovals: "allowed",
      inFlightStagingRuns: "unchanged",
      incident: "none",
      staging: "enabled",
      resumptionCondition: "already-satisfied-by-protected-check",
    };
  }
  operations.push(
    "replacement-check-failed",
    "revoke-failed-replacement",
    "remove-failed-replacement",
    "remove-environment-api-token-secret",
  );
  return {
    ...common,
    mode: "mandatory-trigger",
    operations,
    priorTokenRetainedThroughReplacementChecks: false,
    environmentApiTokenSecret: "absent",
    newApprovals: "rejected",
    inFlightStagingRuns: "unchanged",
    incident: "none",
    staging: "disabled",
    resumptionCondition:
      "valid-replacement-credential-protected-check-must-pass",
  };
}

export async function evaluateDeliveryEvent(manifest, event, options = {}) {
  const reasons = inspectDeliveryManifest(manifest);
  const inputs = event?.inputs ?? {};
  const operation = inputs.delivery_operation;
  if (event?.event_name !== "workflow_dispatch")
    reasons.push("only workflow_dispatch may request delivery");
  if ((event?.actor ?? event?.sender?.login) !== STAGING_DISPATCHER.login)
    reasons.push(`dispatcher must be ${STAGING_DISPATCHER.login}`);
  if ((event?.actor_id ?? event?.sender?.id) !== STAGING_DISPATCHER.numeric_id)
    reasons.push(
      `dispatcher numeric ID must be ${STAGING_DISPATCHER.numeric_id}`,
    );
  if (event?.triggering_actor !== STAGING_DISPATCHER.login)
    reasons.push(`rerun initiator must be ${STAGING_DISPATCHER.login}`);
  if (event?.ref !== "refs/heads/develop")
    reasons.push("staging dispatch must use refs/heads/develop");
  if (!CANONICAL_SHA.test(event?.sha ?? ""))
    reasons.push("event SHA must be exact lowercase 40-hex");
  if (inputs.delivery_environment !== "staging")
    reasons.push("production delivery remains held");
  if (!["credential-check", "deploy"].includes(operation))
    reasons.push("delivery operation is invalid");
  const prefix =
    operation === "credential-check" ? "CHECK staging" : "DEPLOY staging";
  if (inputs.confirmation !== `${prefix} ${event?.sha ?? ""}`)
    reasons.push("confirmation must bind the operation and exact event SHA");
  if ((options.requiredResult ?? event?.required_result) !== "success")
    reasons.push("same-run required validation must succeed");
  if (manifest?.environments?.staging?.cost_ceiling_cents !== 0)
    reasons.push("staging cost ceiling must remain zero");
  try {
    const protection =
      options.environmentProtection ??
      (await fetchEnvironmentProtection(options));
    reasons.push(...validateEnvironmentProtection(protection));
  } catch (error) {
    reasons.push(
      `live environment protection readback failed: ${message(error)}`,
    );
  }
  return {
    eligible: reasons.length === 0,
    environment: reasons.length === 0 ? "staging" : null,
    operation: reasons.length === 0 ? operation : null,
    reasons,
  };
}

async function fetchEnvironmentProtection(options) {
  const token = options.githubToken ?? process.env.GITHUB_TOKEN;
  if (!token) throw new Error("read-only GitHub token is missing");
  const http = options.http ?? fetch;
  const base = "https://api.github.com/repos/KARSIFT/vocanova-platform";
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const environment = await requestJson(
    http,
    `${base}/environments/${STAGING_ENVIRONMENT}`,
    headers,
  );
  const branchPolicies = await requestJson(
    http,
    `${base}/environments/${STAGING_ENVIRONMENT}/deployment-branch-policies?per_page=100&page=1`,
    headers,
  );
  return { environment, branchPolicies };
}

async function requestJson(http, url, headers) {
  const response = await http(url, {
    method: "GET",
    headers,
    redirect: "error",
  });
  if (isPlainDecodedRecord(response) && !hasFetchResponseShape(response))
    return response;
  if (!isFetchResponseLike(response))
    throw new Error("GitHub API response shape is invalid");
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!/^application\/json\b/i.test(contentType))
    throw new Error("GitHub API response is not JSON");
  try {
    return await response.json();
  } catch {
    throw new Error("GitHub API response JSON is malformed");
  }
}

function hasFetchResponseShape(value) {
  return (
    isRecord(value) &&
    ("ok" in value ||
      "status" in value ||
      typeof value.headers?.get === "function" ||
      typeof value.json === "function")
  );
}

function isFetchResponseLike(value) {
  return (
    hasFetchResponseShape(value) &&
    typeof value.ok === "boolean" &&
    Number.isInteger(value.status) &&
    value.status >= 100 &&
    value.status <= 599 &&
    typeof value.headers?.get === "function" &&
    typeof value.json === "function"
  );
}

function isPlainDecodedRecord(value) {
  if (!isRecord(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function validateEnvironmentProtection(protection) {
  const errors = [];
  const environment = protection?.environment;
  const branchPolicies = protection?.branchPolicies;
  if (environment?.name !== STAGING_ENVIRONMENT)
    errors.push("live environment name is not cloudflare-staging");
  if (!Number.isSafeInteger(environment?.id) || environment.id <= 0)
    errors.push("live environment ID is invalid");
  if (environment?.can_admins_bypass !== false)
    errors.push("environment admin bypass must be disabled");
  const rules = environment?.protection_rules;
  if (
    !Array.isArray(rules) ||
    rules.length !== 1 ||
    rules[0]?.type !== "required_reviewers"
  ) {
    errors.push("environment must have exactly one required-reviewer rule");
  } else {
    const rule = rules[0];
    if (rule.prevent_self_review !== false)
      errors.push("GitHub identity-layer self-review must be allowed");
    if (
      !Array.isArray(rule.reviewers) ||
      rule.reviewers.length !== 1 ||
      rule.reviewers[0]?.type !== "User" ||
      rule.reviewers[0]?.reviewer?.login !== STAGING_DISPATCHER.login ||
      rule.reviewers[0]?.reviewer?.id !== STAGING_DISPATCHER.numeric_id
    )
      errors.push(
        "environment must name only the exact operator reviewer identity",
      );
  }
  if (
    environment?.deployment_branch_policy?.protected_branches !== false ||
    environment?.deployment_branch_policy?.custom_branch_policies !== true
  )
    errors.push("environment must use only custom deployment branch policies");
  if (
    branchPolicies?.total_count !== 1 ||
    !Array.isArray(branchPolicies?.branch_policies) ||
    branchPolicies.branch_policies.length !== 1 ||
    branchPolicies.branch_policies[0]?.name !== "develop"
  )
    errors.push(
      "environment must have exactly one custom develop branch policy",
    );
  return errors;
}

export function validateApprovalHistory(history, context) {
  const errors = [];
  if (!Array.isArray(history) || history.length !== 1)
    return ["approval history must contain exactly one record"];
  const approval = history[0];
  if (approval?.state !== "approved")
    errors.push("approval state must be approved");
  if (
    approval?.user?.login !== STAGING_DISPATCHER.login ||
    approval?.user?.id !== STAGING_DISPATCHER.numeric_id
  )
    errors.push("approval user identity is invalid");
  const environments = approval?.environments;
  if (
    !Array.isArray(environments) ||
    environments.length !== 1 ||
    environments[0]?.name !== STAGING_ENVIRONMENT ||
    !Number.isSafeInteger(environments[0]?.id)
  )
    errors.push("approval environment projection is invalid");
  let receipt;
  try {
    receipt = parseStrictJson(approval?.comment ?? "");
    if (canonicalize(receipt) !== approval.comment)
      errors.push("approval receipt comment must be canonical JSON bytes");
  } catch (error) {
    errors.push(`approval receipt is malformed: ${message(error)}`);
    return errors;
  }
  const keys = [
    "checks_reviewed",
    "coordinator_model",
    "environment_id",
    "environment_name",
    "exact_sha_author",
    "no_cloudflare_secret_access",
    "participant_id",
    "reviewer_model",
    "reviewer_received_approval_credentials",
    "run_attempt",
    "run_id",
    "schema_version",
    "sha",
    "task_id",
    "verdict",
  ].sort();
  if (!deepEqual(Object.keys(receipt).sort(), keys))
    errors.push("approval receipt fields are not the closed schema");
  const environmentId = environments?.[0]?.id;
  if (receipt.schema_version !== APPROVAL_RECEIPT_SCHEMA)
    errors.push("approval receipt schema is invalid");
  if (
    !PARTICIPANT.test(receipt.participant_id ?? "") ||
    !PARTICIPANT.test(receipt.task_id ?? "")
  )
    errors.push("approval participant/task provenance is invalid");
  if (
    !PARTICIPANT.test(receipt.reviewer_model ?? "") ||
    !PARTICIPANT.test(receipt.coordinator_model ?? "")
  )
    errors.push("approval model provenance is invalid");
  if (
    receipt.coordinator_model !== "human-not-applicable" &&
    receipt.coordinator_model === receipt.reviewer_model
  )
    errors.push("agent-mediated review must use a different model");
  if (
    receipt.run_id !== String(context.runId) ||
    receipt.run_attempt !== Number(context.runAttempt)
  )
    errors.push("approval receipt does not bind the current run attempt");
  if (receipt.sha !== context.sha || !CANONICAL_SHA.test(receipt.sha ?? ""))
    errors.push("approval receipt does not bind the event SHA");
  if (
    receipt.environment_id !== environmentId ||
    receipt.environment_name !== STAGING_ENVIRONMENT
  )
    errors.push("approval receipt does not bind the exact environment");
  if (!deepEqual(receipt.checks_reviewed, REQUIRED_CHECKS))
    errors.push("approval receipt checks are invalid");
  if (
    receipt.verdict !== "PASS" ||
    receipt.exact_sha_author !== false ||
    receipt.no_cloudflare_secret_access !== true ||
    receipt.reviewer_received_approval_credentials !== false
  )
    errors.push("approval receipt verdict or separation boundary is invalid");
  return errors;
}

export function verifyAccountIdentity(identity, expected = STAGING_ACCOUNT_ID) {
  if (
    identity?.loggedIn !== true ||
    !["Account API Token", "User API Token"].includes(identity?.authType) ||
    !Array.isArray(identity?.accounts) ||
    identity.accounts.length !== 1 ||
    identity.accounts[0]?.id !== expected
  )
    throw new Error(
      "Wrangler identity does not select exactly the staging account",
    );
  return true;
}

export function resolveCurrentDeployment(deployment) {
  const versions = deployment?.versions;
  if (
    !Array.isArray(versions) ||
    versions.length !== 1 ||
    !VERSION_ID.test(versions[0]?.version_id ?? "") ||
    versions[0]?.percentage !== 100
  )
    throw new Error(
      "current deployment must be one version UUID at exactly 100% traffic",
    );
  return versions[0].version_id;
}

export function resolveVersionId(versions, tag) {
  if (!Array.isArray(versions) || typeof tag !== "string" || tag === "")
    throw new Error("version evidence is invalid");
  const matches = versions.filter(
    (version) =>
      isRecord(version) &&
      version.annotations?.["workers/tag"] === tag &&
      VERSION_ID.test(version.id ?? ""),
  );
  if (matches.length !== 1)
    throw new Error(
      `expected exactly one deployable Worker version tagged ${tag}`,
    );
  return matches[0].id;
}

export function inspectMigrationLedger(repositoryRoot, ledger, maximum) {
  const errors = [];
  if (!isRecord(ledger) || typeof ledger.directory !== "string")
    return ["D1 migration ledger is invalid"];
  const entries = readdirSync(resolve(repositoryRoot, ledger.directory), {
    withFileTypes: true,
  });
  const migrations = entries.map((entry) => entry.name).sort();
  if (
    entries.some((entry) => !entry.isFile()) ||
    !deepEqual(migrations, ledger.ordered_files)
  )
    errors.push("D1 migration files differ from the exact ordered ledger");
  if (migrations.length > maximum)
    errors.push(
      `D1 migration count ${migrations.length} exceeds release ceiling ${maximum}`,
    );
  return errors;
}

export function inspectWranglerConfigSelection(repositoryRoot) {
  const errors = [];
  for (const packageDirectory of ["apps/api-worker", "apps/web"]) {
    const root = resolve(repositoryRoot, packageDirectory);
    const canonical = resolve(root, "wrangler.jsonc");
    if (
      !existsSync(canonical) ||
      !lstatSync(canonical).isFile() ||
      lstatSync(canonical).isSymbolicLink()
    )
      errors.push(`${packageDirectory}/wrangler.jsonc must be a regular file`);
    for (const alternative of [
      "wrangler.json",
      "wrangler.toml",
      ".wrangler/deploy/config.json",
    ]) {
      if (existsSync(resolve(root, alternative)))
        errors.push(
          `${packageDirectory}/${alternative} may redirect Wrangler away from the reviewed config`,
        );
    }
  }
  return errors;
}

export function loadStagingCredentialPolicySources(repositoryRoot) {
  return Object.fromEntries(
    STAGING_CREDENTIAL_POLICY_PATHS.map((path) => [
      path,
      readFileSync(resolve(repositoryRoot, path), "utf8"),
    ]),
  );
}

export function validateDeliveryRepository(repositoryRoot, manifestOverride) {
  const manifest = manifestOverride ?? loadDeliveryManifest(repositoryRoot);
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
  return [
    ...inspectDeliveryManifest(manifest, configs),
    ...inspectDeliveryWorkflow(
      readFileSync(resolve(repositoryRoot, ".github/workflows/ci.yml"), "utf8"),
    ),
    ...inspectStagingCredentialPolicySources(
      loadStagingCredentialPolicySources(repositoryRoot),
    ),
    ...inspectWranglerConfigSelection(repositoryRoot),
    ...inspectMigrationLedger(
      repositoryRoot,
      MIGRATION_LEDGER,
      manifest.limits?.max_migrations_per_release,
    ),
  ];
}

export function parseStrictJson(source) {
  if (typeof source !== "string" || source.charCodeAt(0) === 0xfeff)
    throw new Error("JSON must be UTF-8 without BOM");
  let index = 0;
  function whitespace() {
    while (/\s/.test(source[index] ?? "")) index += 1;
  }
  function value() {
    whitespace();
    const character = source[index];
    if (character === "{") return object();
    if (character === "[") return array();
    if (character === '"') return string();
    for (const [token, result] of [
      ["true", true],
      ["false", false],
      ["null", null],
    ]) {
      if (source.startsWith(token, index)) {
        index += token.length;
        return result;
      }
    }
    const match = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(
      source.slice(index),
    );
    if (!match) throw new Error(`invalid JSON token at byte ${index}`);
    index += match[0].length;
    const number = Number(match[0]);
    if (
      !Number.isFinite(number) ||
      (Number.isInteger(number) && !Number.isSafeInteger(number))
    )
      throw new Error("JSON number is outside ECMAScript safe range");
    return number;
  }
  function string() {
    const start = index;
    index += 1;
    let escaped = false;
    while (index < source.length) {
      const code = source.charCodeAt(index);
      if (!escaped && code === 34) {
        index += 1;
        try {
          const decoded = JSON.parse(source.slice(start, index));
          assertPairedSurrogates(decoded);
          return decoded;
        } catch {
          throw new Error("invalid JSON string or lone Unicode surrogate");
        }
      }
      if (!escaped && code < 32)
        throw new Error("unescaped JSON control character");
      if (!escaped && code === 92) escaped = true;
      else escaped = false;
      index += 1;
    }
    throw new Error("unterminated JSON string");
  }
  function object() {
    index += 1;
    const result = {};
    const keys = new Set();
    whitespace();
    if (source[index] === "}") {
      index += 1;
      return result;
    }
    while (true) {
      whitespace();
      if (source[index] !== '"')
        throw new Error("JSON object key must be a string");
      const key = string();
      if (keys.has(key)) throw new Error(`duplicate JSON key: ${key}`);
      keys.add(key);
      whitespace();
      if (source[index] !== ":")
        throw new Error("JSON object is missing colon");
      index += 1;
      result[key] = value();
      whitespace();
      if (source[index] === "}") {
        index += 1;
        return result;
      }
      if (source[index] !== ",")
        throw new Error("JSON object is missing comma");
      index += 1;
    }
  }
  function array() {
    index += 1;
    const result = [];
    whitespace();
    if (source[index] === "]") {
      index += 1;
      return result;
    }
    while (true) {
      result.push(value());
      whitespace();
      if (source[index] === "]") {
        index += 1;
        return result;
      }
      if (source[index] !== ",") throw new Error("JSON array is missing comma");
      index += 1;
    }
  }
  const result = value();
  whitespace();
  if (index !== source.length) throw new Error("JSON has trailing bytes");
  return result;
}

export function canonicalize(value) {
  assertJsonValue(value);
  if (value === null || typeof value === "boolean" || typeof value === "number")
    return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
    .join(",")}}`;
}

function assertJsonValue(value) {
  if (
    typeof value === "number" &&
    (!Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value)))
  )
    throw new Error("JSON number is outside ECMAScript safe range");
  if (typeof value === "string") assertPairedSurrogates(value);
  if (Array.isArray(value)) value.forEach(assertJsonValue);
  else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      assertPairedSurrogates(key);
      assertJsonValue(child);
    }
  } else if (
    !["string", "number", "boolean"].includes(typeof value) &&
    value !== null
  )
    throw new Error("value is not JSON-compatible");
}

function assertPairedSurrogates(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const following = value.charCodeAt(index + 1);
      if (!(following >= 0xdc00 && following <= 0xdfff))
        throw new Error("string contains a lone high Unicode surrogate");
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff)
      throw new Error("string contains a lone low Unicode surrogate");
  }
}

function deepEqual(left, right) {
  try {
    return canonicalize(left) === canonicalize(right);
  } catch {
    return false;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function message(error) {
  return error instanceof Error ? error.message : String(error);
}

function repositoryRoot() {
  return resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

async function main(argv) {
  const root = repositoryRoot();
  const resolveTag = argv.indexOf("--resolve-version-tag");
  if (resolveTag !== -1) {
    console.log(
      resolveVersionId(
        JSON.parse(readFileSync(0, "utf8")),
        argv[resolveTag + 1],
      ),
    );
    return 0;
  }
  if (argv.includes("--resolve-current-deployment")) {
    console.log(resolveCurrentDeployment(JSON.parse(readFileSync(0, "utf8"))));
    return 0;
  }
  const accountIndex = argv.indexOf("--verify-account-id");
  if (accountIndex !== -1) {
    verifyAccountIdentity(
      JSON.parse(readFileSync(0, "utf8")),
      argv[accountIndex + 1],
    );
    console.log("Wrangler staging account identity verified.");
    return 0;
  }
  const eventIndex = argv.indexOf("--event-path");
  if (eventIndex !== -1) {
    const eventPayload = JSON.parse(readFileSync(argv[eventIndex + 1], "utf8"));
    const decision = await evaluateDeliveryEvent(
      loadDeliveryManifest(root),
      {
        event_name: process.env.GITHUB_EVENT_NAME,
        actor: process.env.GITHUB_ACTOR,
        actor_id: eventPayload.sender?.id,
        triggering_actor: process.env.GITHUB_TRIGGERING_ACTOR,
        inputs: eventPayload.inputs ?? {},
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        required_result: process.env.REQUIRED_RESULT,
      },
      { githubToken: process.env.GITHUB_TOKEN },
    );
    if (process.env.GITHUB_OUTPUT) {
      const staging = loadDeliveryManifest(root).environments.staging;
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        [
          `environment=${decision.environment ?? "blocked"}`,
          `operation=${decision.operation ?? "blocked"}`,
          `api_url=${staging.routes.api}`,
          `web_url=${staging.routes.web}`,
          `max_smoke_attempts=${loadDeliveryManifest(root).limits.max_smoke_attempts}`,
          `max_smoke_seconds=${loadDeliveryManifest(root).limits.max_smoke_seconds}`,
          "",
        ].join("\n"),
      );
    }
    if (!decision.eligible) {
      decision.reasons.forEach((reason) =>
        console.error(`delivery blocked: ${reason}`),
      );
      return 1;
    }
    console.log(`Cloudflare staging ${decision.operation} gate passed.`);
    return 0;
  }
  const errors = validateDeliveryRepository(root);
  if (errors.length) {
    errors.forEach((error) => console.error(error));
    return 1;
  }
  console.log(
    "Standard-ready staging and held production policy validation passed.",
  );
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(message(error));
      process.exitCode = 1;
    });
}
