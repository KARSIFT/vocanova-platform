import { appendFileSync, readFileSync, readdirSync } from "node:fs";
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
  if (manifest.status !== "held") {
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
  if (record.state !== "held") {
    errors.push(`${environment} delivery must remain held in this revision`);
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
  if (record.d1?.database_id !== `held-${environment}-d1`) {
    errors.push(`${environment} must retain its non-resource D1 sentinel`);
  }
  for (const value of Object.values(record.secret_scopes ?? {})) {
    if (typeof value !== "string" || !value.includes(environment)) {
      errors.push(`${environment} secret scopes must be environment-specific`);
      break;
    }
  }
  for (const field of [
    "authority_evidence_url",
    "resource_manifest_evidence_url",
    "rollback_rehearsal_url",
    "authorization_expires_at",
  ]) {
    if (record[field] !== null) {
      errors.push(`${environment}.${field} must remain null while held`);
    }
  }
  if (environment === "production") {
    for (const field of ["staging_evidence_url", "backup_evidence_url"]) {
      if (record[field] !== null) {
        errors.push(`production.${field} must remain null while held`);
      }
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
    "previous_api_version_id:",
    "previous_web_version_id:",
    "name: cloudflare delivery policy",
    "pnpm run ci:delivery",
    "name: cloudflare delivery gate",
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

export function evaluateDeliveryEvent(manifest, event, now = new Date()) {
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
  if (manifest.status !== "authorized" || record.state !== "authorized") {
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
  const expiry = Date.parse(record.authorization_expires_at ?? "");
  if (!Number.isFinite(expiry) || expiry <= now.valueOf()) {
    reasons.push("delivery authorization is missing or expired");
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

export function validateDeliveryRepository(repositoryRoot) {
  const manifest = loadDeliveryManifest(repositoryRoot);
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

function main(argv) {
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
    const decision = evaluateDeliveryEvent(loadDeliveryManifest(root), {
      event_name: process.env.GITHUB_EVENT_NAME,
      inputs: event.inputs ?? {},
      ref: process.env.GITHUB_REF,
      sha: process.env.GITHUB_SHA,
    });
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
  console.log("Held Cloudflare delivery policy validation passed.");
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
