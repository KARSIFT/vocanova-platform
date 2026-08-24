import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const RETIREMENT_MANIFEST_PATH =
  "infrastructure/cloudflare/server-retirement-manifest.json";

const RETIRED_PREFIXES = ["apps/api/", "apps/web/tests/staging-e2e/", "infra/"];

const RETIRED_EXACT_PATHS = [
  ".dockerignore",
  "apps/web/Dockerfile",
  "apps/web/playwright.staging.config.ts",
  "scripts/foundation/check-go-format.mjs",
  "scripts/foundation/cors-parity.test.mjs",
  "scripts/foundation/deploy-production-oauth-port.test.mjs",
  "scripts/foundation/docker-compose-production-api-base-url-port.test.mjs",
  "scripts/foundation/mock-inventory.mjs",
  "scripts/foundation/mock-inventory.test.mjs",
  "scripts/foundation/nginx-healthcheck-probe.test.mjs",
  "scripts/foundation/voc067-cutover-bridge-gate.test.mjs",
];

const ACTIVE_TEXT_POLICIES = {
  "package.json": [
    /\bci:api\b/,
    /\b(?:go vet|go test|go build|gofmt)\b/,
    /\bapps\/api(?:\/|["'\s])/,
  ],
  ".github/actions/setup-toolchain/action.yml": [
    /\bsetup-go@/,
    /\binstall-go\b/,
    /\bapps\/api(?:\/|["'\s])/,
  ],
  ".github/workflows/ci.yml": [/pnpm run ci:api/, /^  api:\s*$/m],
  ".github/dependabot.yml": [/package-ecosystem:\s*["']gomod["']/],
  "apps/api-worker/scripts/check-contract-drift.mjs": [
    /\.\.\/api\/openapi/,
    /canonical Go/,
  ],
  "apps/api-worker/scripts/check-data-conversion-inventory.mjs": [
    /apps\/api\/migrations/,
  ],
  "apps/web/.env.example": [/\bapps\/api\b/],
};

const ACTIVE_INSTRUCTION_FILES = [
  "README.md",
  "CONTRIBUTING.md",
  ".github/README.md",
  "docs/development.md",
  "docs/engineering/04-technical-architecture.md",
  "docs/engineering/05-database-design.md",
  "docs/engineering/06-backend-design.md",
  "docs/engineering/07-api-contract-and-dto-design.md",
  "docs/engineering/09-ai-features.md",
  "docs/engineering/README.md",
  "docs/governance/repository-settings.md",
  "docs/operations/10-development-workflow.md",
  "docs/product/12-mvp-implementation-plan.md",
];

const ACTIVE_INSTRUCTION_PATTERNS = [
  /```[^`]*(?:\bgo (?:test|build|vet|run)\b|\bdocker compose\b|\bcd apps\/api\b|\bapps\/api\/scripts\/|\binfra\/scripts\/)[^`]*```/gis,
  /\bpnpm (?:run )?(?:ci:api|lint:api|test:api|build:api)\b/,
  /\bplaywright\.staging\.config\.ts\b/,
];

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".open-next",
  ".wrangler",
  "dist",
  "node_modules",
  "coverage",
]);

export function inspectServerRetirementPaths(files) {
  const errors = [];
  for (const relative of files) {
    const normalized = relative.replaceAll(path.sep, "/");
    if (
      RETIRED_PREFIXES.some((prefix) => normalized.startsWith(prefix)) ||
      RETIRED_EXACT_PATHS.includes(normalized)
    ) {
      errors.push(`${normalized}: retired server path returned`);
      continue;
    }
    const basename = path.posix.basename(normalized);
    if (
      normalized.endsWith(".go") ||
      basename === "go.mod" ||
      basename === "go.sum" ||
      basename.startsWith("Dockerfile") ||
      /(?:^|\/)docker-compose[^/]*\.ya?ml$/i.test(normalized) ||
      /(?:^|\/)nginx(?:\/|$)/i.test(normalized)
    ) {
      errors.push(`${normalized}: executable legacy runtime artifact returned`);
    }
  }
  return errors;
}

export function inspectRetiredText(relative, source) {
  const errors = [];
  for (const pattern of ACTIVE_TEXT_POLICIES[relative] ?? []) {
    if (pattern.test(source)) {
      errors.push(
        `${relative}: retired runtime command or dependency returned`,
      );
    }
  }
  if (ACTIVE_INSTRUCTION_FILES.includes(relative)) {
    for (const pattern of ACTIVE_INSTRUCTION_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(`${relative}: stale server execution instruction returned`);
      }
    }
  }
  return errors;
}

export function inspectRetirementScripts(source) {
  let scripts;
  try {
    scripts = JSON.parse(source).scripts;
  } catch {
    return ["package.json: cannot parse retirement script contract"];
  }
  const errors = [];
  if (
    scripts?.["ci:retirement"] !==
    "node scripts/foundation/server-retirement-policy.mjs"
  ) {
    errors.push(
      "package.json: ci:retirement entry point is missing or drifted",
    );
  }
  if (!scripts?.["ci:foundation"]?.includes("pnpm run ci:retirement")) {
    errors.push(
      "package.json: ci:foundation must include the retirement validation",
    );
  }
  return errors;
}

export function validateServerRetirement(repositoryRoot) {
  const errors = [];
  const manifestPath = path.join(repositoryRoot, RETIREMENT_MANIFEST_PATH);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    return [`${RETIREMENT_MANIFEST_PATH}: cannot read retirement manifest`];
  }
  if (manifest.schema_version !== "vocanova-server-retirement-v1") {
    errors.push("server retirement manifest schema is invalid");
  }
  if (
    manifest.status !== "retired-from-active-tree" ||
    manifest.task !== "VOC-080-T11"
  ) {
    errors.push("server retirement manifest status/task is invalid");
  }
  for (const value of Object.values(manifest.parity_evidence ?? {})) {
    if (!/^[0-9a-f]{40}$/.test(value)) {
      errors.push("every parity evidence revision must be an exact SHA");
      break;
    }
  }
  if (Object.keys(manifest.parity_evidence ?? {}).length !== 8) {
    errors.push("server retirement requires the complete T03-T10 parity chain");
  }
  for (const field of [
    "live_server_inspected",
    "live_server_mutated",
    "live_server_stopped",
  ]) {
    if (manifest[field] !== false) {
      errors.push(`${field} must remain false for repository-only retirement`);
    }
  }
  for (const retired of [...RETIRED_PREFIXES, ...RETIRED_EXACT_PATHS]) {
    if (!(manifest.retired_paths ?? []).includes(retired)) {
      errors.push(`retirement manifest is missing ${retired}`);
    }
  }
  for (const retained of Object.values(
    manifest.retained_non_runtime_snapshots ?? {},
  )) {
    if (
      typeof retained !== "string" ||
      !existsSync(path.join(repositoryRoot, retained))
    ) {
      errors.push(`retained migration snapshot is missing: ${retained}`);
    }
  }
  for (const key of ["api_contract", "postgresql_schema"]) {
    const retained = manifest.retained_non_runtime_snapshots?.[key];
    if (typeof retained !== "string") continue;
    try {
      const snapshot = JSON.parse(
        readFileSync(path.join(repositoryRoot, retained), "utf8"),
      );
      if (
        snapshot.retired_source_revision !==
        manifest.parity_evidence?.held_delivery
      ) {
        errors.push(
          `${retained}: retired source revision must match the final pre-retirement parity revision`,
        );
      }
    } catch {
      errors.push(`${retained}: retained migration snapshot is unparseable`);
    }
  }

  const files = listActiveFiles(repositoryRoot);
  errors.push(...inspectServerRetirementPaths(files));
  for (const relative of [
    ...Object.keys(ACTIVE_TEXT_POLICIES),
    ...ACTIVE_INSTRUCTION_FILES,
  ]) {
    const absolute = path.join(repositoryRoot, relative);
    if (!existsSync(absolute)) {
      errors.push(`${relative}: required active surface is missing`);
      continue;
    }
    errors.push(
      ...inspectRetiredText(relative, readFileSync(absolute, "utf8")),
    );
  }
  errors.push(
    ...inspectRetirementScripts(
      readFileSync(path.join(repositoryRoot, "package.json"), "utf8"),
    ),
  );
  return errors;
}

function listActiveFiles(repositoryRoot) {
  const files = [];
  const visit = (directory, relativeRoot = "") => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const relative = relativeRoot
        ? `${relativeRoot}/${entry.name}`
        : entry.name;
      if (
        relative.startsWith("docs/archive/") ||
        relative.startsWith("specs/changes/")
      ) {
        continue;
      }
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, relative);
      else files.push(relative);
    }
  };
  visit(repositoryRoot);
  return files;
}

function repositoryRoot() {
  return path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateServerRetirement(repositoryRoot());
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exitCode = 1;
  } else {
    console.log("Active server-runtime retirement validation passed.");
  }
}
