import { appendFileSync, readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const DELIVERY_SCHEMA_VERSION = "vocanova-cloudflare-delivery-v1";
export const DELIVERY_MANIFEST_PATH =
  "infrastructure/cloudflare/delivery-manifest.json";
export const DELIVERY_ENVIRONMENTS = ["staging", "production"];

const CANONICAL_SHA = /^[0-9a-f]{40}$/;
const VERSION_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const D1_DATABASE_ID = VERSION_ID;
const EVIDENCE_URL =
  /^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/(?:pull|issues)\/\d+(?:#issuecomment-\d+)?$/;
const CANONICAL_ACTIVATION_COMMENT =
  /^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/issues\/158#issuecomment-([1-9][0-9]{0,15})$/;
const SHA256 = /^[0-9a-f]{64}$/;
const SAFE_DECIMAL = /^[1-9][0-9]{0,15}$/;
const GITHUB_API = "https://api.github.com";
const REQUIRED_PR2_FILES = [
  ".github/README.md",
  "docs/governance/repository-settings-current.yaml",
  "docs/governance/repository-settings.md",
  "docs/operations/11-devops-and-ci-cd.md",
  "docs/operations/cloudflare-delivery.md",
].sort();
const REQUIRED_CHECKS = ["ci required", "security required", "structure"];
const REQUIRED_WORKFLOWS = {
  "ci required": ["CI", ".github/workflows/ci.yml", 321329558],
  "security required": [
    "Security",
    ".github/workflows/security.yml",
    337617927,
  ],
  structure: ["Governance", ".github/workflows/governance.yml", 337617928],
};
const EXPECTED_PUBLISHER_TRUST_ROOT = {
  login: "m-e-h-r-d-a-a-d",
  numeric_id: 7955432,
  type: "User",
  site_admin: false,
  author_association: "CONTRIBUTOR",
};
const EXPECTED_CONTRACT_DIGEST_FIELDS = [
  "shared_definitions_sha256",
  "api_envelope_schema_sha256",
  "settings_authority_body_schema_sha256",
  "act03_body_schema_sha256",
  "pr2_exact_review_body_schema_sha256",
  "act04_authority_body_schema_sha256",
  "binder_review_body_schema_sha256",
];
const EXPECTED_STAGING_RESOURCES = {
  account_id: "0a9eda28b96d77c24dcde74f3e074d47",
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
const EXPECTED_PRODUCTION_ENVIRONMENT = {
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
      } else {
        stripped += " ";
      }
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        stripped += "  ";
        index += 1;
        blockComment = false;
      } else {
        stripped += character === "\n" ? "\n" : " ";
      }
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
    } else {
      stripped += character;
    }
  }
  return JSON.parse(stripped.replace(/,\s*([}\]])/g, "$1"));
}

export function inspectDeliveryManifest(manifest, configs) {
  const errors = [];
  if (manifest.schema_version !== DELIVERY_SCHEMA_VERSION) {
    errors.push(`delivery manifest schema must be ${DELIVERY_SCHEMA_VERSION}`);
  }
  if (!["prepared", "held"].includes(manifest.status)) {
    errors.push(
      "repository delivery status must remain held until a separately reviewed activation change",
    );
  }
  if (manifest.wrangler_version !== "4.125.0") {
    errors.push("delivery manifest must bind the locked Wrangler 4.125.0 CLI");
  }
  if (manifest.workflow !== ".github/workflows/ci.yml") {
    errors.push("Cloudflare delivery must remain inside ci.yml");
  }
  inspectLimits(manifest.limits, errors);

  const environmentRecords = manifest.environments ?? {};
  for (const environment of DELIVERY_ENVIRONMENTS) {
    const record = environmentRecords[environment];
    if (!isRecord(record)) {
      errors.push(`delivery manifest is missing ${environment}`);
      continue;
    }
    inspectEnvironment(environment, record, errors);
    inspectWranglerEnvironment(environment, record, configs, errors);
  }

  const staging = environmentRecords.staging;
  const production = environmentRecords.production;
  if (isRecord(staging) && isRecord(production)) {
    for (const [label, left, right] of [
      [
        "GitHub environments",
        staging.github_environment,
        production.github_environment,
      ],
      ["API Worker names", staging.workers?.api, production.workers?.api],
      ["web Worker names", staging.workers?.web, production.workers?.web],
      [
        "D1 database names",
        staging.d1?.database_name,
        production.d1?.database_name,
      ],
      ["D1 database IDs", staging.d1?.database_id, production.d1?.database_id],
      ["API routes", staging.routes?.api, production.routes?.api],
      ["web routes", staging.routes?.web, production.routes?.web],
      [
        "GitHub secret scopes",
        staging.secret_scopes?.github,
        production.secret_scopes?.github,
      ],
      [
        "API secret scopes",
        staging.secret_scopes?.api_worker,
        production.secret_scopes?.api_worker,
      ],
      [
        "web secret scopes",
        staging.secret_scopes?.web_worker,
        production.secret_scopes?.web_worker,
      ],
    ]) {
      if (typeof left !== "string" || left === right) {
        errors.push(`${label} must be explicit and isolated`);
      }
    }
  }
  return errors;
}

function inspectLimits(limits, errors) {
  if (!isRecord(limits)) {
    errors.push("delivery manifest limits are missing");
    return;
  }
  for (const [name, minimum, maximum] of [
    ["max_migrations_per_release", 1, 100],
    ["max_smoke_attempts", 1, 20],
    ["max_smoke_seconds", 1, 900],
    ["max_api_gzip_bytes", 1, 3_000_000],
    ["max_web_gzip_bytes", 1, 10_000_000],
  ]) {
    const value = limits[name];
    if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
      errors.push(`${name} must be an integer from ${minimum} to ${maximum}`);
    }
  }
}

function inspectEnvironment(environment, record, errors) {
  const expected = {
    staging: {
      hold: "VOC-080-HOLD-00",
      ref: "refs/heads/develop",
      github: "cloudflare-staging",
    },
    production: {
      hold: "VOC-080-HOLD-01",
      ref: "refs/heads/main",
      github: "cloudflare-production",
    },
  }[environment];
  const expectedState = environment === "staging" ? "prepared" : "held";
  if (record.state !== expectedState) {
    errors.push(
      `${environment} delivery must remain ${expectedState} in this revision`,
    );
  }
  if (record.hold_id !== expected.hold) {
    errors.push(`${environment} must bind ${expected.hold}`);
  }
  if (record.required_ref !== expected.ref) {
    errors.push(`${environment} must require ${expected.ref}`);
  }
  if (record.github_environment !== expected.github) {
    errors.push(
      `${environment} must use GitHub environment ${expected.github}`,
    );
  }
  if (
    !Number.isSafeInteger(record.cost_ceiling_cents) ||
    record.cost_ceiling_cents < 0
  ) {
    errors.push(`${environment} cost ceiling must be a non-negative integer`);
  }
  for (const key of ["api", "web"]) {
    if (record.workers?.[key] !== `vocanova-${key}-${environment}`) {
      errors.push(`${environment} ${key} Worker name is not canonical`);
    }
    if (typeof record.routes?.[key] !== "string") {
      errors.push(`${environment} ${key} route is missing`);
    }
  }
  if (record.d1?.binding !== "DB") {
    errors.push(`${environment} D1 binding must be DB`);
  }
  if (record.d1?.database_name !== `vocanova-${environment}`) {
    errors.push(`${environment} D1 database name is not canonical`);
  }
  const expectedD1 =
    environment === "staging"
      ? "22ae386f-e3f5-4d98-a3ad-18b39d3b8556"
      : "held-production-d1";
  if (record.d1?.database_id !== expectedD1) {
    errors.push(
      `${environment} D1 identifier differs from its reviewed boundary`,
    );
  }
  for (const value of Object.values(record.secret_scopes ?? {})) {
    if (typeof value !== "string" || !value.includes(environment)) {
      errors.push(`${environment} secret scopes must be environment-specific`);
      break;
    }
  }
  if (
    record.authority_evidence_url !== null ||
    record.authorization_expires_at !== null
  ) {
    errors.push(
      `${environment} must not commit future runtime authority evidence`,
    );
  }
  if (environment === "staging") {
    inspectPreparedStaging(record, errors);
  } else {
    for (const field of [
      "resource_manifest_evidence_url",
      "rollback_rehearsal_url",
    ]) {
      if (record[field] !== null)
        errors.push(`production.${field} must remain null while held`);
    }
  }
  if (environment === "production") {
    if (!deepEqual(record, EXPECTED_PRODUCTION_ENVIRONMENT)) {
      errors.push("production held environment or sentinel set drifted");
    }
    for (const field of ["staging_evidence_url", "backup_evidence_url"]) {
      if (record[field] !== null) {
        errors.push(`production.${field} must remain null while held`);
      }
    }
  }
}

function inspectPreparedStaging(record, errors) {
  if (record.cost_ceiling_cents !== 0)
    errors.push("staging cost ceiling must be exactly zero");
  if (
    record.routes?.api !== "https://api-stag.vocanova.site" ||
    record.routes?.web !== "https://stag.vocanova.site"
  ) {
    errors.push("staging routes must equal the reviewed Custom Domains");
  }
  const binder = record.prepared_runtime_binder;
  if (!isRecord(binder) || binder.runtime_evidence !== null) {
    errors.push(
      "staging prepared runtime binder must exist without future evidence",
    );
    return;
  }
  if (
    binder.bundle_id !== "vocanova-voc096-runtime-record-contract" ||
    binder.bundle_version !== 1 ||
    binder.schema_dialect !== "JSON-Schema-2020-12" ||
    binder.contract_path !==
      "specs/changes/VOC-096-voc094-dispatch-binder-transition/change.yaml#runtime_record_contract" ||
    binder.canonical_registry !==
      "https://github.com/KARSIFT/vocanova-platform/issues/158" ||
    binder.maximum_authorization_seconds !== 1800 ||
    binder.maximum_dispatches !== 1 ||
    binder.live_checks_per_dispatch !== 2 ||
    !deepEqual(binder.publisher_trust_root, EXPECTED_PUBLISHER_TRUST_ROOT)
  ) {
    errors.push("staging runtime binder identity, registry, or limits drifted");
  }
  if (
    binder.prepared_staging_tuple_sha256 !==
    "25ac2748678adb7d41c8a525bf05443154ba8ac1678ce6647a75e6ceeca45871"
  ) {
    errors.push("prepared staging tuple digest drifted");
  }
  if (!isRecord(binder.contract) || !isRecord(binder.prepared_staging_tuple)) {
    errors.push(
      "prepared staging tuple and closed runtime contract must be embedded",
    );
    return;
  }
  if (
    binder.contract.bundle_id !== binder.bundle_id ||
    binder.contract.bundle_version !== binder.bundle_version ||
    binder.contract.schema_dialect !== binder.schema_dialect ||
    binder.contract.prepared_staging_tuple_binding?.canonicalization !==
      "RFC-8785-JCS-of-change-yaml-prepared_staging_tuple" ||
    binder.contract.prepared_staging_tuple_binding?.sha256 !==
      binder.prepared_staging_tuple_sha256 ||
    !deepEqual(binder.contract.manifest_binding?.required_fields, [
      "bundle_id",
      "bundle_version",
      ...EXPECTED_CONTRACT_DIGEST_FIELDS,
    ]) ||
    EXPECTED_CONTRACT_DIGEST_FIELDS.some(
      (field) =>
        binder.contract.manifest_binding?.[field] !==
        binder.contract_digests?.[field],
    )
  ) {
    errors.push("staging runtime contract manifest binding drifted");
  }
  inspectRuntimeContractDigests(binder, errors);
  const resources = record.resources;
  if (!deepEqual(resources, EXPECTED_STAGING_RESOURCES)) {
    errors.push(
      "staging resource, baseline, cost, privacy, or hold tuple drifted",
    );
  }
  if (
    record.resource_manifest_evidence_url !==
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5437898152" ||
    record.rollback_rehearsal_url !==
      "https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5435923878"
  ) {
    errors.push(
      "staging evidence must use the exact dedicated canonical comments",
    );
  }
  const forbiddenEnvelopeFields = [
    "comment_id",
    "html_url",
    "raw_body_sha256",
    "created_at",
    "updated_at",
    "publisher",
    "author_association",
  ];
  for (const [name, schema] of Object.entries(
    binder.contract.record_body_schemas ?? {},
  )) {
    if (
      schema?.additionalProperties !== false ||
      forbiddenEnvelopeFields.some((field) =>
        Object.hasOwn(schema?.properties ?? {}, field),
      )
    ) {
      errors.push(
        `${name} body schema permits self-asserted envelope metadata`,
      );
    }
  }
  if (
    canonicalize(binder.prepared_staging_tuple) !==
    canonicalizeExpectedTuple(binder)
  ) {
    errors.push("prepared staging tuple canonicalization failed");
  }
}

function canonicalizeExpectedTuple(binder) {
  const digest = sha256(canonicalize(binder.prepared_staging_tuple));
  return digest === binder.prepared_staging_tuple_sha256
    ? canonicalize(binder.prepared_staging_tuple)
    : "digest-mismatch";
}

function inspectRuntimeContractDigests(binder, errors) {
  const contract = binder.contract;
  const expected = binder.contract_digests;
  const mappings = {
    shared_definitions_sha256: contract.shared_definitions,
    api_envelope_schema_sha256: contract.api_envelope_schema,
    settings_authority_body_schema_sha256:
      contract.record_body_schemas?.settings_authority,
    act03_body_schema_sha256: contract.record_body_schemas?.act03,
    pr2_exact_review_body_schema_sha256:
      contract.record_body_schemas?.pr2_exact_review,
    act04_authority_body_schema_sha256:
      contract.record_body_schemas?.act04_authority,
    binder_review_body_schema_sha256:
      contract.record_body_schemas?.binder_review,
  };
  for (const [name, mapping] of Object.entries(mappings)) {
    if (!isRecord(mapping)) {
      errors.push(`runtime contract mapping ${name} is missing`);
      continue;
    }
    const withoutDigest = structuredClone(mapping);
    delete withoutDigest.schema_sha256;
    const actual = sha256(canonicalize(withoutDigest));
    if (actual !== expected?.[name] || actual !== mapping.schema_sha256) {
      errors.push(`runtime contract digest ${name} drifted`);
    }
  }
}

function inspectWranglerEnvironment(environment, record, configs, errors) {
  const api = configs?.api?.env?.[environment];
  const web = configs?.web?.env?.[environment];
  if (!isRecord(api) || !isRecord(web)) {
    errors.push(
      `${environment} Wrangler environments must exist for both Workers`,
    );
    return;
  }
  if (api.name !== record.workers.api || web.name !== record.workers.web) {
    errors.push(
      `${environment} Worker names differ between Wrangler and manifest`,
    );
  }
  const database = api.d1_databases?.find?.(
    (candidate) => candidate.binding === record.d1.binding,
  );
  if (
    !database ||
    database.database_name !== record.d1.database_name ||
    database.database_id !== record.d1.database_id
  ) {
    errors.push(
      `${environment} D1 binding differs between Wrangler and manifest`,
    );
  }
  const service = web.services?.find?.(
    (candidate) => candidate.binding === "API",
  );
  if (!service || service.service !== record.workers.api) {
    errors.push(`${environment} web API service binding is not isolated`);
  }
  if (
    api.vars?.ENVIRONMENT !== environment ||
    web.vars?.ENVIRONMENT !== environment
  ) {
    errors.push(`${environment} Wrangler environment markers are inconsistent`);
  }
}

export function inspectDeliveryWorkflow(source) {
  const errors = [];
  for (const marker of [
    "workflow_dispatch:",
    "delivery_environment:",
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
    "previous_api_version_id:",
    "previous_web_version_id:",
    "name: cloudflare delivery policy",
    "pnpm run ci:delivery",
    "name: cloudflare delivery gate",
    "Recheck live runtime binder before any secret-bearing step",
    "name: cloudflare staging",
    "name: cloudflare production",
    "environment: cloudflare-staging",
    "environment: cloudflare-production",
    "VOC-080-HOLD-00",
    "VOC-080-HOLD-01",
    "wrangler d1 migrations apply DB --remote --env staging",
    "wrangler d1 migrations apply DB --remote --env production",
    "wrangler versions upload --env staging",
    "wrangler versions upload --env production",
    "wrangler versions deploy",
    "wrangler rollback",
    "if: failure() && steps.promote.outcome != 'skipped'",
    "if: always()",
  ]) {
    if (!source.includes(marker))
      errors.push(`ci.yml missing delivery marker: ${marker}`);
  }
  if (
    !source.includes(
      "cancel-in-progress: ${{ github.event_name != 'workflow_dispatch' }}",
    )
  ) {
    errors.push(
      "manual delivery runs must not be cancelled after migration can start",
    );
  }
  if (
    /^\s{2}(issues|issue_comment|pull_request_target|schedule):/m.test(source)
  ) {
    errors.push("delivery workflow contains an unsafe trigger");
  }
  for (const [job, environment] of [
    [extractJob(source, "cloudflare-staging"), "staging"],
    [extractJob(source, "cloudflare-production"), "production"],
  ]) {
    if (!job) {
      errors.push(`${environment} delivery job is missing`);
      continue;
    }
    for (const marker of [
      `environment: cloudflare-${environment}`,
      "github.event_name == 'workflow_dispatch'",
      `needs.delivery-gate.outputs.environment == '${environment}'`,
      "CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}",
      "CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}",
      'test -n "$CLOUDFLARE_API_TOKEN" && test -n "$CLOUDFLARE_ACCOUNT_ID"',
      "persist-credentials: false",
      "ref: ${{ github.sha }}",
    ]) {
      if (!job.includes(marker)) {
        errors.push(`${environment} delivery job missing: ${marker}`);
      }
    }
    const order = [
      "wrangler d1 migrations apply",
      "wrangler versions upload",
      "wrangler versions deploy",
      "Smoke exact promoted versions",
      "Record delivery outcome",
    ].map((marker) => job.indexOf(marker));
    if (
      order.some((index) => index === -1) ||
      order.some((value, index) => index > 0 && value <= order[index - 1])
    ) {
      errors.push(
        `${environment} delivery sequence is not migration/upload/promotion/smoke/outcome`,
      );
    }
  }
  const policyJob = extractJob(source, "cloudflare-delivery-policy");
  const gateJob = extractJob(source, "delivery-gate");
  for (const [name, job] of [
    ["delivery policy", policyJob],
    ["delivery gate", gateJob],
  ]) {
    if (
      job &&
      /secrets\.|CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID/.test(job)
    ) {
      errors.push(`${name} job must be credential-free`);
    }
  }
  const stagingJob = extractJob(source, "cloudflare-staging");
  const productionJob = extractJob(source, "cloudflare-production");
  const outsideDeliveryJobs = source
    .replace(stagingJob, "")
    .replace(productionJob, "");
  if (
    /secrets\.CLOUDFLARE_(?:API_TOKEN|ACCOUNT_ID)/.test(outsideDeliveryJobs)
  ) {
    errors.push("Cloudflare credentials must appear only in environment jobs");
  }
  for (const [name, job] of [
    ["staging", stagingJob],
    ["production", productionJob],
  ]) {
    const apiTokens = job.match(/secrets\.CLOUDFLARE_API_TOKEN/g) ?? [];
    const accountIds = job.match(/secrets\.CLOUDFLARE_ACCOUNT_ID/g) ?? [];
    if (apiTokens.length !== 4 || accountIds.length !== 4) {
      errors.push(
        `${name} credentials must be scoped to migration, upload, promotion, and rollback only`,
      );
    }
  }
  return errors;
}

function extractJob(source, jobId) {
  const marker = `  ${jobId}:\n`;
  const start = source.indexOf(marker);
  if (start === -1) return "";
  const remainder = source.slice(start + marker.length);
  const next = remainder.search(/^  [a-z0-9-]+:\n/m);
  return next === -1
    ? source.slice(start)
    : source.slice(start, start + marker.length + next);
}

export async function evaluateDeliveryEvent(manifest, event, options = {}) {
  const reasons = [];
  if (event.event_name !== "workflow_dispatch") {
    reasons.push("delivery requires an explicit workflow_dispatch event");
  }
  const inputs = event.inputs ?? {};
  const environment = inputs.delivery_environment;
  if (!DELIVERY_ENVIRONMENTS.includes(environment)) {
    reasons.push("delivery_environment must be staging or production");
  }
  const record = manifest.environments?.[environment];
  if (!isRecord(record)) {
    reasons.push("delivery manifest environment is missing");
    return { eligible: false, environment: null, reasons };
  }
  const isPreparedStaging =
    environment === "staging" &&
    manifest.status === "prepared" &&
    record.state === "prepared";
  if (
    !isPreparedStaging &&
    (manifest.status !== "authorized" || record.state !== "authorized")
  ) {
    reasons.push(`${record.hold_id} remains active`);
  }
  if (
    !CANONICAL_SHA.test(inputs.reviewed_sha ?? "") ||
    inputs.reviewed_sha !== event.sha
  ) {
    reasons.push("reviewed_sha must equal the exact dispatched revision");
  }
  if (event.ref !== record.required_ref) {
    reasons.push(`${environment} delivery requires ${record.required_ref}`);
  }
  if (!isPreparedStaging) {
    if (inputs.action_authority_url !== record.authority_evidence_url) {
      reasons.push("action authority does not match the reviewed manifest");
    }
    for (const [label, value] of [
      ["action authority", record.authority_evidence_url],
      ["resource manifest", record.resource_manifest_evidence_url],
      ["rollback rehearsal", record.rollback_rehearsal_url],
    ]) {
      if (!EVIDENCE_URL.test(value ?? ""))
        reasons.push(`${label} evidence is missing`);
    }
  }
  if (!VERSION_ID.test(inputs.previous_api_version_id ?? "")) {
    reasons.push("previous API Worker version ID is invalid");
  }
  if (!VERSION_ID.test(inputs.previous_web_version_id ?? "")) {
    reasons.push("previous web Worker version ID is invalid");
  }
  const estimatedCost = Number(inputs.estimated_cost_cents);
  if (
    !Number.isSafeInteger(estimatedCost) ||
    estimatedCost < 0 ||
    estimatedCost > record.cost_ceiling_cents
  ) {
    reasons.push("estimated release cost exceeds the recorded ceiling");
  }
  if (inputs.confirmation !== `DEPLOY ${environment} ${event.sha}`) {
    reasons.push("manual confirmation does not bind environment and exact SHA");
  }
  if (!D1_DATABASE_ID.test(record.d1?.database_id ?? "")) {
    reasons.push(
      "authorized delivery requires a real environment-specific D1 database ID",
    );
  }
  for (const route of Object.values(record.routes ?? {})) {
    if (typeof route !== "string" || route.endsWith(".invalid")) {
      reasons.push(
        "authorized delivery requires reviewed non-placeholder routes",
      );
      break;
    }
  }
  if (isPreparedStaging) {
    const runtime = await evaluateRuntimeBinder(manifest, event, options);
    reasons.push(...runtime.reasons);
  } else {
    const now = options.now ?? new Date();
    const expiry = Date.parse(record.authorization_expires_at ?? "");
    if (!Number.isFinite(expiry) || expiry <= now.valueOf()) {
      reasons.push("delivery authorization is missing or expired");
    }
  }
  if (environment === "production") {
    for (const [label, inputName, manifestName] of [
      ["staging", "staging_evidence_url", "staging_evidence_url"],
      ["backup/Time Travel", "backup_evidence_url", "backup_evidence_url"],
    ]) {
      if (
        !EVIDENCE_URL.test(record[manifestName] ?? "") ||
        inputs[inputName] !== record[manifestName]
      ) {
        reasons.push(`${label} evidence does not match the reviewed manifest`);
      }
    }
  }
  return { eligible: reasons.length === 0, environment, reasons };
}

export async function evaluateRuntimeBinder(manifest, event, options = {}) {
  const reasons = [];
  const staging = manifest.environments?.staging;
  const binder = staging?.prepared_runtime_binder;
  if (!isRecord(binder) || !isRecord(binder.contract)) {
    return { eligible: false, reasons: ["prepared runtime binder is missing"] };
  }
  inspectRuntimeContractDigests(binder, reasons);
  const inputs = event.inputs ?? {};
  const inputRecords = {
    act03: [inputs.act03_evidence_url, inputs.act03_evidence_sha256],
    pr2_exact_review: [inputs.pr2_review_url, inputs.pr2_review_sha256],
    act04_authority: [
      inputs.action_authority_url,
      inputs.action_authority_sha256,
    ],
    binder_review: [inputs.binder_review_url, inputs.binder_review_sha256],
  };
  for (const [name, [url, digest]] of Object.entries(inputRecords)) {
    if (!CANONICAL_ACTIVATION_COMMENT.test(url ?? ""))
      reasons.push(`${name} URL is not canonical issue #158 evidence`);
    if (!SHA256.test(digest ?? ""))
      reasons.push(`${name} raw-body digest is invalid`);
  }
  if (!/^[0-9a-f]{32,128}$/.test(inputs.dispatch_nonce ?? ""))
    reasons.push("dispatch nonce is invalid");
  if (reasons.length) return { eligible: false, reasons };

  const client = createRuntimeClient(options);
  try {
    await client.preflight(options.rateLimitMinimum ?? 40);
    const records = {};
    for (const name of [
      "act03",
      "pr2_exact_review",
      "act04_authority",
      "binder_review",
    ]) {
      records[name] = await fetchRecord(
        client,
        inputRecords[name][0],
        inputRecords[name][1],
        name,
        binder,
      );
    }
    const settingsReference = records.act03.body.settings_authority?.evidence;
    records.settings_authority = await fetchRecord(
      client,
      settingsReference?.url,
      settingsReference?.raw_body_sha256,
      "settings_authority",
      binder,
    );
    const authority = records.act04_authority;
    if (authority.body.nonce !== inputs.dispatch_nonce)
      throw new Error("dispatch nonce does not match authority");

    const pr2Number = authority.body.pr2?.pull_request_number;
    const pr2 = await client.json(
      `/repos/KARSIFT/vocanova-platform/pulls/${pr2Number}`,
    );
    const filesResponse = await client.json(
      `/repos/KARSIFT/vocanova-platform/pulls/${pr2Number}/files?per_page=100&page=1`,
    );
    const files = filesResponse.value;
    if (!Array.isArray(files) || filesResponse.next)
      throw new Error("PR2 files must fit one complete page");
    const changedFiles = files.map((file) => file.filename).sort();
    if (!deepEqual(changedFiles, REQUIRED_PR2_FILES))
      throw new Error(
        "PR2 changed-file set is not the exact five-file boundary",
      );
    const prProjection = projectPullRequest(pr2.value);
    if (
      !deepEqual(prProjection, authority.body.pr2) ||
      prProjection.merge_sha !== event.sha
    ) {
      throw new Error("PR2 metadata does not bind the dispatched merge SHA");
    }

    const currentRun = await client.json(
      `/repos/KARSIFT/vocanova-platform/actions/runs/${event.run_id}`,
    );
    const current = projectCurrentRun(currentRun.value);
    const runMarker = `${inputs.action_authority_sha256}-${inputs.dispatch_nonce}`;
    if (
      current.id !== String(event.run_id) ||
      current.event !== "workflow_dispatch" ||
      current.head_sha !== event.sha ||
      current.head_branch !== "develop" ||
      current.run_attempt !== 1 ||
      !current.display_title.includes(runMarker)
    )
      throw new Error(
        "current workflow run is not the exact first binder attempt",
      );

    const pushes = await client.json(
      `/repos/KARSIFT/vocanova-platform/actions/runs?branch=develop&event=push&head_sha=${event.sha}&per_page=100&page=1`,
    );
    const pushProjection = projectPushRuns(
      pushes,
      event.sha,
      records.pr2_exact_review.envelope.created_at,
    );
    const checks = await client.json(
      `/repos/KARSIFT/vocanova-platform/commits/${event.sha}/check-runs?filter=all&per_page=100&page=1`,
    );
    const checkProjection = projectChecks(
      checks,
      pushProjection,
      event.sha,
      prProjection.merged_at,
      records.pr2_exact_review.envelope.created_at,
      String(event.run_id),
    );
    if (
      !deepEqual(checkProjection, records.pr2_exact_review.body.hosted_checks)
    ) {
      throw new Error(
        "hosted check projection differs from the merged-PR2 review",
      );
    }

    await rejectReplay(client, event, inputs, authority.envelope.created_at);
    validateRecordChain(records, binder, prProjection, current, event, inputs);
    client.requireBudget();
    const completion = options.now ?? new Date();
    const deadline = Math.min(
      Date.parse(authority.body.expires_at),
      Date.parse(records.act03.body.phase4_token.expires_at),
    );
    if (!(
      completion.valueOf() < deadline &&
      client.latestServerDate.valueOf() < deadline
    )) {
      throw new Error(
        "live runtime-binder check completed at or after authority/token expiry",
      );
    }
  } catch (error) {
    reasons.push(error instanceof Error ? error.message : String(error));
  }
  return { eligible: reasons.length === 0, reasons };
}

function createRuntimeClient(options) {
  const http = options.http ?? fetch;
  let requests = 0;
  let coreRequests = 0;
  let minimumRemaining = Number.POSITIVE_INFINITY;
  let latestServerDate = new Date(0);
  async function json(path, { core = true } = {}) {
    requests += 1;
    if (core) coreRequests += 1;
    if (requests > 21 || coreRequests > 20)
      throw new Error("runtime-binder HTTP budget exceeded");
    const url = path.startsWith("https://") ? path : `${GITHUB_API}${path}`;
    if (!url.startsWith(`${GITHUB_API}/`))
      throw new Error(
        "runtime-binder request host is not canonical GitHub API",
      );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let response;
    try {
      response = await http(url, {
        method: "GET",
        redirect: "error",
        signal: controller.signal,
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "vocanova-delivery-binder",
        },
      });
    } finally {
      clearTimeout(timeout);
    }
    if (response.status !== 200)
      throw new Error(`GitHub API request failed with HTTP ${response.status}`);
    if (
      !(response.headers.get("content-type") ?? "")
        .toLowerCase()
        .startsWith("application/json")
    ) {
      throw new Error("GitHub API response content type is not JSON");
    }
    const date = new Date(response.headers.get("date") ?? "");
    const remaining = Number(response.headers.get("x-ratelimit-remaining"));
    if (
      !Number.isFinite(date.valueOf()) ||
      !Number.isSafeInteger(remaining) ||
      remaining < 0
    ) {
      throw new Error(
        "GitHub API Date or rate-limit header is missing or invalid",
      );
    }
    latestServerDate = date > latestServerDate ? date : latestServerDate;
    minimumRemaining = Math.min(minimumRemaining, remaining);
    const text = await response.text();
    if (Buffer.byteLength(text) > 1_000_000)
      throw new Error("GitHub API response exceeds one-megabyte bound");
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      throw new Error("GitHub API response is malformed JSON");
    }
    return {
      value,
      date,
      remaining,
      next: /rel="next"/.test(response.headers.get("link") ?? ""),
    };
  }
  return {
    json,
    async preflight(minimum) {
      const response = await json("/rate_limit", { core: false });
      const remaining = response.value?.resources?.core?.remaining;
      if (
        !Number.isSafeInteger(remaining) ||
        remaining < minimum ||
        response.remaining < minimum
      ) {
        throw new Error(`GitHub core rate limit is below required ${minimum}`);
      }
    },
    requireBudget() {
      if (requests > 21 || coreRequests > 20 || minimumRemaining < 0) {
        throw new Error("runtime-binder request allocation exceeded");
      }
    },
    get latestServerDate() {
      return latestServerDate;
    },
  };
}

async function fetchRecord(client, url, expectedDigest, schemaName, binder) {
  const match = CANONICAL_ACTIVATION_COMMENT.exec(url ?? "");
  if (!match || !isSafeDecimal(match[1]))
    throw new Error(`${schemaName} comment URL is invalid`);
  const response = await client.json(
    `/repos/KARSIFT/vocanova-platform/issues/comments/${match[1]}`,
  );
  const upstream = response.value;
  if (
    !isRecord(upstream) ||
    upstream.html_url !== url ||
    upstream.issue_url !==
      `${GITHUB_API}/repos/KARSIFT/vocanova-platform/issues/158`
  ) {
    throw new Error(
      `${schemaName} comment does not belong to canonical issue #158`,
    );
  }
  if (typeof upstream.body !== "string")
    throw new Error(`${schemaName} comment body is missing`);
  const bytes = Buffer.byteLength(upstream.body, "utf8");
  if (bytes < 2 || bytes > 60_000)
    throw new Error(`${schemaName} body is outside size bounds`);
  const digest = sha256(upstream.body);
  if (digest !== expectedDigest)
    throw new Error(`${schemaName} raw-body digest mismatch`);
  const body = parseStrictJson(upstream.body);
  if (canonicalize(body) !== upstream.body)
    throw new Error(`${schemaName} body is not exact RFC-8785 JCS bytes`);
  const contractName =
    schemaName === "act04_authority" ? "act04_authority" : schemaName;
  const schema = binder.contract.record_body_schemas?.[contractName];
  const schemaErrors = validateSchema(
    body,
    schema,
    binder.contract.shared_definitions,
  );
  if (schemaErrors.length)
    throw new Error(`${schemaName} body schema failed: ${schemaErrors[0]}`);
  const envelope = {
    comment_id: upstream.id,
    html_url: upstream.html_url,
    issue_url: upstream.issue_url,
    created_at: upstream.created_at,
    updated_at: upstream.updated_at,
    raw_body_sha256: digest,
    raw_body_bytes: bytes,
    body: upstream.body,
    publisher: {
      login: upstream.user?.login,
      numeric_id: upstream.user?.id,
      type: upstream.user?.type,
      site_admin: upstream.user?.site_admin,
    },
    author_association: upstream.author_association,
  };
  const envelopeErrors = validateSchema(
    envelope,
    binder.contract.api_envelope_schema,
    binder.contract.shared_definitions,
  );
  if (envelopeErrors.length)
    throw new Error(`${schemaName} API envelope failed: ${envelopeErrors[0]}`);
  if (
    envelope.created_at !== envelope.updated_at ||
    String(envelope.comment_id) !== match[1]
  ) {
    throw new Error(`${schemaName} comment was edited or URL/ID mismatched`);
  }
  return { body, envelope, serverDate: response.date };
}

function projectPullRequest(value) {
  if (
    !isRecord(value) ||
    value.state !== "closed" ||
    value.merged !== true ||
    value.base?.ref !== "develop"
  ) {
    throw new Error("PR2 is not a merged pull request into develop");
  }
  return {
    pull_request_number: value.number,
    head_sha: value.head?.sha,
    merge_sha: value.merge_commit_sha,
    base: value.base.ref,
    ref: "refs/heads/develop",
    merged_at: value.merged_at,
  };
}

function projectCurrentRun(value) {
  if (!isRecord(value))
    throw new Error("current workflow run response is invalid");
  return {
    id: String(value.id),
    event: value.event,
    head_sha: value.head_sha,
    head_branch: value.head_branch,
    run_attempt: value.run_attempt,
    created_at: value.created_at,
    display_title: value.display_title ?? "",
  };
}

function projectPushRuns(response, sha, cutoff) {
  const value = response.value;
  if (
    response.next ||
    !isRecord(value) ||
    value.total_count !== 3 ||
    !Array.isArray(value.workflow_runs) ||
    value.workflow_runs.length !== 3
  ) {
    throw new Error(
      "exact three push workflow runs were not returned on one page",
    );
  }
  const projections = [];
  const seen = new Set();
  for (const run of value.workflow_runs) {
    const id = normalizeSafeDecimal(run.id, "workflow run ID");
    const suite = normalizeSafeDecimal(
      run.check_suite_id,
      "workflow check-suite ID",
    );
    const apiSuffix = canonicalDecimalSuffix(
      run.url,
      `https://api.github.com/repos/KARSIFT/vocanova-platform/actions/runs/${id}`,
    );
    const htmlSuffix = canonicalDecimalSuffix(
      run.html_url,
      `https://github.com/KARSIFT/vocanova-platform/actions/runs/${id}`,
    );
    if (apiSuffix !== id || htmlSuffix !== id)
      throw new Error("workflow API/HTML URL run ID mismatch");
    const key = `${run.name}|${run.path}|${run.workflow_id}`;
    if (seen.has(key)) throw new Error("duplicate push workflow tuple");
    seen.add(key);
    if (
      run.event !== "push" ||
      run.head_branch !== "develop" ||
      run.head_sha !== sha ||
      run.status !== "completed" ||
      run.conclusion !== "success" ||
      run.run_attempt !== 1
    )
      throw new Error("push workflow run state does not match reviewed merge");
    requireOrderedTimes(
      [run.created_at, run.run_started_at, run.updated_at],
      "push workflow timestamps",
    );
    if (!(Date.parse(run.updated_at) < Date.parse(cutoff)))
      throw new Error("push workflow crosses PR2 review cutoff");
    projections.push({
      id,
      name: run.name,
      event: run.event,
      path: run.path,
      workflow_id: run.workflow_id,
      check_suite_id: suite,
      head_branch: run.head_branch,
      head_sha: run.head_sha,
      status: run.status,
      conclusion: run.conclusion,
      run_attempt: run.run_attempt,
      created_at: run.created_at,
      run_started_at: run.run_started_at,
      updated_at: run.updated_at,
      url: run.url,
      html_url: run.html_url,
    });
  }
  for (const tuple of Object.values(REQUIRED_WORKFLOWS)) {
    if (
      !projections.some(
        (run) =>
          run.name === tuple[0] &&
          run.path === tuple[1] &&
          run.workflow_id === tuple[2],
      )
    ) {
      throw new Error("required push workflow tuple is missing");
    }
  }
  return projections;
}

function projectChecks(
  response,
  pushRuns,
  sha,
  mergedAt,
  cutoff,
  currentRunId,
) {
  const value = response.value;
  if (
    response.next ||
    !isRecord(value) ||
    value.total_count !== value.check_runs?.length ||
    value.total_count > 100
  ) {
    throw new Error("check-runs response is incomplete or paginated");
  }
  const selected = [];
  for (const name of REQUIRED_CHECKS) {
    const tuple = REQUIRED_WORKFLOWS[name];
    const push = pushRuns.find(
      (run) =>
        run.name === tuple[0] &&
        run.path === tuple[1] &&
        run.workflow_id === tuple[2],
    );
    const candidates = value.check_runs.filter((check) => {
      if (
        check.name !== name ||
        check.app?.id !== 15368 ||
        check.app?.slug !== "github-actions"
      )
        return false;
      const ids = parseDetailsUrl(check.details_url);
      return (
        ids &&
        ids.run === push.id &&
        ids.job === normalizeSafeDecimal(check.id, "check-run ID") &&
        String(check.check_suite?.id) === push.check_suite_id &&
        ids.run !== currentRunId
      );
    });
    const pendingBeforeReview = candidates.some(
      (check) =>
        check.head_sha === sha &&
        check.status !== "completed" &&
        Number.isFinite(Date.parse(check.started_at)) &&
        Date.parse(mergedAt) <= Date.parse(check.started_at) &&
        Date.parse(check.started_at) < Date.parse(cutoff),
    );
    if (pendingBeforeReview)
      throw new Error(
        `required check ${name} still had a pending pre-review candidate`,
      );
    const eligible = candidates.filter(
      (check) =>
        check.status === "completed" &&
        check.conclusion === "success" &&
        check.head_sha === sha &&
        Date.parse(mergedAt) <= Date.parse(check.started_at) &&
        Date.parse(check.started_at) <= Date.parse(check.completed_at) &&
        Date.parse(check.completed_at) < Date.parse(cutoff),
    );
    eligible.sort(
      (left, right) =>
        Date.parse(right.completed_at) - Date.parse(left.completed_at),
    );
    if (
      !eligible[0] ||
      (eligible[1] && eligible[1].completed_at === eligible[0].completed_at)
    )
      throw new Error(`required check ${name} is missing or tied`);
    const check = eligible[0];
    if (!(
      Date.parse(push.run_started_at) <= Date.parse(check.started_at) &&
      Date.parse(check.completed_at) <= Date.parse(push.updated_at)
    )) {
      throw new Error(`${name} check timestamps escape its push workflow`);
    }
    selected.push({
      name,
      head_sha: check.head_sha,
      check_run_id: normalizeSafeDecimal(check.id, "check-run ID"),
      check_suite_id: normalizeSafeDecimal(
        check.check_suite.id,
        "check-suite ID",
      ),
      app_id: check.app.id,
      app_slug: check.app.slug,
      status: check.status,
      conclusion: check.conclusion,
      details_url: check.details_url,
      started_at: check.started_at,
      completed_at: check.completed_at,
      workflow_run: push,
    });
  }
  return selected.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
}

async function rejectReplay(client, event, inputs, authorityCreatedAt) {
  let page = 1;
  let scanned = 0;
  let reachedCutoff = false;
  const needles = [
    inputs.action_authority_url,
    inputs.action_authority_sha256,
    inputs.dispatch_nonce,
  ];
  while (page <= 10 && !reachedCutoff) {
    const response = await client.json(
      `/repos/KARSIFT/vocanova-platform/actions/workflows/ci.yml/runs?branch=develop&event=workflow_dispatch&head_sha=${event.sha}&per_page=100&page=${page}`,
    );
    if (!Array.isArray(response.value?.workflow_runs))
      throw new Error("prior-run response is invalid");
    scanned += response.value.workflow_runs.length;
    if (scanned >= 1000)
      throw new Error("prior-run scan reached GitHub 1,000-result cap");
    for (const run of response.value.workflow_runs) {
      if (Date.parse(run.created_at) < Date.parse(authorityCreatedAt))
        reachedCutoff = true;
      if (
        String(run.id) !== String(event.run_id) &&
        needles.some((needle) => (run.display_title ?? "").includes(needle))
      ) {
        throw new Error(
          "runtime binder was already consumed by another workflow run",
        );
      }
    }
    if (!response.next) {
      reachedCutoff = true;
      break;
    }
    page += 1;
  }
  if (!reachedCutoff)
    throw new Error("prior-run pagination did not reach authority cutoff");
}

function validateRecordChain(records, binder, pr2, current, event, inputs) {
  const settings = records.settings_authority;
  const act03 = records.act03;
  const review = records.pr2_exact_review;
  const authority = records.act04_authority;
  const binderReview = records.binder_review;
  const references = [
    [act03.body.settings_authority.evidence, settings.envelope],
    [review.body.act03, act03.envelope],
    [authority.body.act03, act03.envelope],
    [authority.body.pr2_exact_review, review.envelope],
    [binderReview.body.act03, act03.envelope],
    [binderReview.body.pr2_exact_review, review.envelope],
    [binderReview.body.authority, authority.envelope],
  ];
  for (const [reference, envelope] of references) {
    if (
      reference.url !== envelope.html_url ||
      reference.raw_body_sha256 !== envelope.raw_body_sha256
    )
      throw new Error("cross-record URL/digest reference mismatch");
  }
  if (!deepEqual(settings.body.authorized_settings_operator, act03.body.actor))
    throw new Error("ACT03 operator differs from settings authority");
  for (const field of [
    "operation",
    "pr1",
    "environment",
    "phase4_token",
    "rollback",
    "tuple_binding",
  ]) {
    if (!deepEqual(settings.body[field], act03.body[field]))
      throw new Error(`settings authority/ACT03 ${field} mismatch`);
  }
  for (const body of [review.body, authority.body, binderReview.body]) {
    if (!deepEqual(body.pr2, pr2))
      throw new Error("record PR2 projection mismatch");
    if (
      !deepEqual(body.tuple_binding, {
        schema: "vocanova-voc096-prepared-staging-tuple-v1",
        canonicalization: "RFC-8785-JCS",
        sha256: binder.prepared_staging_tuple_sha256,
      })
    )
      throw new Error("prepared tuple binding mismatch");
  }
  for (const body of [authority.body, binderReview.body]) {
    if (
      !deepEqual(body.executable_digests, review.body.executable_digests) ||
      !deepEqual(body.staging_assertions, review.body.staging_assertions)
    )
      throw new Error("runtime executable/resource projections differ");
  }
  const root = repositoryRoot();
  const actualDigests = {
    manifest_sha256: sha256(
      readFileSync(resolve(root, DELIVERY_MANIFEST_PATH)),
    ),
    workflow_sha256: sha256(
      readFileSync(resolve(root, ".github/workflows/ci.yml")),
    ),
    policy_sha256: sha256(
      readFileSync(
        resolve(root, "scripts/foundation/cloudflare-delivery-policy.mjs"),
      ),
    ),
  };
  if (!deepEqual(review.body.executable_digests, actualDigests))
    throw new Error("runtime executable digests do not match dispatched files");
  if (
    review.body.verdict !== "PASS" ||
    review.body.blocking_findings.length !== 0 ||
    binderReview.body.verdict !== "PASS" ||
    binderReview.body.blocking_findings.length !== 0
  )
    throw new Error("runtime reviewer verdict is not zero-blocker PASS");
  const actors = [
    settings.body.actor,
    act03.body.actor,
    review.body.actor,
    authority.body.actor,
    binderReview.body.actor,
  ];
  if (
    new Set(actors.map((actor) => actor.actor_id)).size !== 5 ||
    new Set(actors.map((actor) => actor.provenance.session_reference)).size !==
      5
  )
    throw new Error(
      "runtime actor IDs/session references are not pairwise distinct",
    );
  const times = [
    settings.envelope.created_at,
    act03.envelope.created_at,
    pr2.merged_at,
    review.envelope.created_at,
    authority.envelope.created_at,
    binderReview.envelope.created_at,
    current.created_at,
  ];
  requireStrictlyOrderedTimes(times, "runtime record sequence");
  const tokenExpiry = Date.parse(act03.body.phase4_token.expires_at);
  const settingsExpiry = Date.parse(settings.body.expires_at);
  const authorityExpiry = Date.parse(authority.body.expires_at);
  const issued = Date.parse(authority.envelope.created_at);
  if (!(
    Date.parse(pr2.merged_at) < settingsExpiry && settingsExpiry <= tokenExpiry
  ))
    throw new Error("settings authority/token expiry does not cover PR2 merge");
  if (!(
    issued < authorityExpiry &&
    authorityExpiry <= issued + 1_800_000 &&
    authorityExpiry <= tokenExpiry
  ))
    throw new Error(
      "ACT04 authority expiry exceeds exact lifetime/token bound",
    );
  if (times.some((time) => !(Date.parse(time) < tokenExpiry)))
    throw new Error("runtime chain reaches or exceeds Phase4 token expiry");
  if (
    inputs.previous_api_version_id !== "ace13c0b-c148-4ef1-ad9a-fdfdb07f264f" ||
    inputs.previous_web_version_id !== "5255e64d-872e-469f-90b6-bea49efd5e75"
  )
    throw new Error("rollback baselines do not match Phase1 success");
  for (const [name, [url, digest]] of Object.entries({
    act03: [inputs.act03_evidence_url, inputs.act03_evidence_sha256],
    pr2_exact_review: [inputs.pr2_review_url, inputs.pr2_review_sha256],
    act04_authority: [
      inputs.action_authority_url,
      inputs.action_authority_sha256,
    ],
    binder_review: [inputs.binder_review_url, inputs.binder_review_sha256],
  })) {
    if (
      records[name].envelope.html_url !== url ||
      records[name].envelope.raw_body_sha256 !== digest
    )
      throw new Error(`${name} dispatch input mismatch`);
  }
  if (event.sha !== pr2.merge_sha)
    throw new Error("runtime binder does not target dispatched PR2 merge SHA");
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
          return JSON.parse(source.slice(start, index));
        } catch {
          throw new Error("invalid JSON string");
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
  if (value === null || typeof value === "boolean" || typeof value === "string")
    return JSON.stringify(value);
  if (typeof value === "number") {
    if (
      !Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value))
    )
      throw new Error("JCS number is outside ECMAScript range");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (isRecord(value))
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  throw new Error("JCS value is not JSON-compatible");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function validateSchema(value, schema, definitions, path = "$") {
  const errors = [];
  function visit(subject, rule, location) {
    if (!isRecord(rule)) {
      errors.push(`${location}: schema is missing`);
      return;
    }
    if (typeof rule.$ref === "string") {
      const name = rule.$ref.replace(/^#\/\$defs\//, "");
      visit(subject, definitions?.[name], location);
      return;
    }
    for (const child of rule.allOf ?? []) visit(subject, child, location);
    if (Array.isArray(rule.oneOf)) {
      const matches = rule.oneOf.filter(
        (child) =>
          validateSchema(subject, child, definitions, location).length === 0,
      );
      if (matches.length !== 1)
        errors.push(`${location}: expected exactly one oneOf branch`);
    }
    if (Object.hasOwn(rule, "const") && !deepEqual(subject, rule.const))
      errors.push(`${location}: const mismatch`);
    if (
      Array.isArray(rule.enum) &&
      !rule.enum.some((candidate) => deepEqual(subject, candidate))
    )
      errors.push(`${location}: enum mismatch`);
    const types = Array.isArray(rule.type)
      ? rule.type
      : rule.type
        ? [rule.type]
        : [];
    if (types.length && !types.some((type) => schemaType(subject) === type)) {
      errors.push(`${location}: expected ${types.join("|")}`);
      return;
    }
    if (typeof subject === "string") {
      if (
        Number.isInteger(rule.minLength) &&
        [...subject].length < rule.minLength
      )
        errors.push(`${location}: string too short`);
      if (
        Number.isInteger(rule.maxLength) &&
        [...subject].length > rule.maxLength
      )
        errors.push(`${location}: string too long`);
      if (
        typeof rule.pattern === "string" &&
        !new RegExp(rule.pattern, "u").test(subject)
      )
        errors.push(`${location}: pattern mismatch`);
    }
    if (typeof subject === "number") {
      if (rule.type === "integer" && !Number.isSafeInteger(subject))
        errors.push(`${location}: unsafe/non-integer number`);
      if (typeof rule.minimum === "number" && subject < rule.minimum)
        errors.push(`${location}: below minimum`);
      if (typeof rule.maximum === "number" && subject > rule.maximum)
        errors.push(`${location}: above maximum`);
    }
    if (Array.isArray(subject)) {
      if (Number.isInteger(rule.minItems) && subject.length < rule.minItems)
        errors.push(`${location}: too few items`);
      if (Number.isInteger(rule.maxItems) && subject.length > rule.maxItems)
        errors.push(`${location}: too many items`);
      if (
        rule.uniqueItems === true &&
        new Set(subject.map((item) => canonicalize(item))).size !==
          subject.length
      )
        errors.push(`${location}: duplicate items`);
      if (Array.isArray(rule.prefixItems))
        rule.prefixItems.forEach((itemRule, itemIndex) =>
          visit(subject[itemIndex], itemRule, `${location}[${itemIndex}]`),
        );
      if (
        rule.items === false &&
        subject.length > (rule.prefixItems?.length ?? 0)
      )
        errors.push(`${location}: extra items`);
      else if (isRecord(rule.items))
        subject.forEach((item, itemIndex) =>
          visit(item, rule.items, `${location}[${itemIndex}]`),
        );
    }
    if (isRecord(subject)) {
      for (const key of rule.required ?? [])
        if (!Object.hasOwn(subject, key))
          errors.push(`${location}: missing ${key}`);
      if (rule.additionalProperties === false)
        for (const key of Object.keys(subject))
          if (!Object.hasOwn(rule.properties ?? {}, key))
            errors.push(`${location}: unknown ${key}`);
      for (const [key, childRule] of Object.entries(rule.properties ?? {}))
        if (Object.hasOwn(subject, key))
          visit(subject[key], childRule, `${location}.${key}`);
    }
  }
  visit(value, schema, path);
  return errors;
}

function schemaType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (isRecord(value)) return "object";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function deepEqual(left, right) {
  try {
    return canonicalize(left) === canonicalize(right);
  } catch {
    return false;
  }
}

function isSafeDecimal(value) {
  return (
    SAFE_DECIMAL.test(String(value)) && Number.isSafeInteger(Number(value))
  );
}

function normalizeSafeDecimal(value, label) {
  const text = String(value);
  if (!isSafeDecimal(text))
    throw new Error(`${label} is not a canonical safe decimal`);
  return text;
}

function canonicalDecimalSuffix(url, expected) {
  if (url !== expected) throw new Error("GitHub run URL is not canonical");
  return expected.slice(expected.lastIndexOf("/") + 1);
}

function parseDetailsUrl(url) {
  const match =
    /^https:\/\/github\.com\/KARSIFT\/vocanova-platform\/actions\/runs\/([1-9][0-9]{0,15})\/job\/([1-9][0-9]{0,15})$/.exec(
      url ?? "",
    );
  if (!match || !isSafeDecimal(match[1]) || !isSafeDecimal(match[2]))
    return null;
  return { run: match[1], job: match[2] };
}

function requireOrderedTimes(values, label) {
  const times = values.map(Date.parse);
  if (
    times.some((time) => !Number.isFinite(time)) ||
    times.some((time, index) => index > 0 && time < times[index - 1])
  )
    throw new Error(`${label} are invalid or inverted`);
}

function requireStrictlyOrderedTimes(values, label) {
  const times = values.map(Date.parse);
  if (
    times.some((time) => !Number.isFinite(time)) ||
    times.some((time, index) => index > 0 && time <= times[index - 1])
  )
    throw new Error(`${label} are not strictly ordered`);
}

export function resolveVersionId(versions, tag) {
  if (!Array.isArray(versions) || typeof tag !== "string" || tag === "") {
    throw new Error("version evidence is invalid");
  }
  const matches = versions.filter(
    (version) =>
      isRecord(version) &&
      version.annotations?.["workers/tag"] === tag &&
      VERSION_ID.test(version.id ?? ""),
  );
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly one deployable Worker version tagged ${tag}`,
    );
  }
  return matches[0].id;
}

export function inspectMigrationCount(repositoryRoot, maximum) {
  const migrations = readdirSync(
    resolve(repositoryRoot, "apps/api-worker/migrations"),
  ).filter((name) => /^\d{4}_.+\.sql$/.test(name));
  return migrations.length <= maximum
    ? []
    : [
        `D1 migration count ${migrations.length} exceeds release ceiling ${maximum}`,
      ];
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
    ...inspectMigrationCount(
      repositoryRoot,
      manifest.limits?.max_migrations_per_release,
    ),
  ];
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function repositoryRoot() {
  return resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

async function main(argv) {
  const root = repositoryRoot();
  const resolveIndex = argv.indexOf("--resolve-version-tag");
  if (resolveIndex !== -1) {
    const tag = argv[resolveIndex + 1];
    const source = readFileSync(0, "utf8");
    console.log(resolveVersionId(JSON.parse(source), tag));
    return 0;
  }
  const eventIndex = argv.indexOf("--event-path");
  if (eventIndex !== -1) {
    const event = JSON.parse(readFileSync(argv[eventIndex + 1], "utf8"));
    const decision = await evaluateDeliveryEvent(
      loadDeliveryManifest(root),
      {
        event_name: process.env.GITHUB_EVENT_NAME,
        inputs: event.inputs ?? {},
        ref: process.env.GITHUB_REF,
        sha: process.env.GITHUB_SHA,
        run_id: process.env.GITHUB_RUN_ID,
      },
      {
        rateLimitMinimum: argv.includes("--pre-secret-recheck") ? 20 : 40,
      },
    );
    if (process.env.GITHUB_OUTPUT) {
      const record =
        loadDeliveryManifest(root).environments[decision.environment];
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        [
          `environment=${decision.environment ?? "blocked"}`,
          `api_url=${record?.routes?.api ?? ""}`,
          `web_url=${record?.routes?.web ?? ""}`,
          `max_smoke_attempts=${loadDeliveryManifest(root).limits.max_smoke_attempts}`,
          `max_smoke_seconds=${loadDeliveryManifest(root).limits.max_smoke_seconds}`,
          "",
        ].join("\n"),
      );
    }
    if (!decision.eligible) {
      for (const reason of decision.reasons)
        console.error(`delivery blocked: ${reason}`);
      return 1;
    }
    console.log(`Cloudflare ${decision.environment} delivery gate passed.`);
    return 0;
  }
  const errors = validateDeliveryRepository(root);
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    return 1;
  }
  console.log("Prepared/held Cloudflare delivery policy validation passed.");
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
