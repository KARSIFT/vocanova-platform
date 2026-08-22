import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const TARGET_WORKFLOWS = [
  "ci.yml",
  "governance.yml",
  "quality.yml",
  "security.yml",
];

export const RETIRED_CONTROL_PLANE_WORKFLOWS = [
  "change-package.yml",
  "package-release.yml",
  "pipeline.yml",
];

export const RETIRED_SERVER_WORKFLOWS = [
  "deploy-production.yml",
  "deploy-staging.yml",
  "error-monitoring.yml",
];

const SERVER_CAPABILITY_PATTERNS = [
  [
    /\b(?:schedule|workflow_dispatch)\b(?:\s*:|\s*[,\]])/,
    "scheduled/manual server trigger",
  ],
  [
    /(?:\b(?:ssh|scp|sshpass)\b|\brsync\b[^\n]*\bssh\b|\/ssh-agent@|\/(?:ssh|scp)-action@)/i,
    "SSH/SCP command or action",
  ],
  [
    /secrets\.(?:(?:STAGING|PRODUCTION)_[A-Z0-9_]+|CLOUDFLARE_[A-Z0-9_]+|SENTRY_[A-Z0-9_]+|GOOGLE_OAUTH_[A-Z0-9_]+)/,
    "staging/production service credential",
  ],
  [
    /(?:\bSENTRY_(?:API|AUTH)_TOKEN\b|sentry\.io\/api|\bsentry-cli\b)/i,
    "Sentry API access",
  ],
  [
    /environment:\s*(?:(?:staging|production)\s*(?:$|[},])|\n\s+name:\s*(?:staging|production)\s*$)/im,
    "deployment environment",
  ],
  [
    /(?:infra\/scripts\/cloudflare|api\.cloudflare\.com\/client\/v4|\bwrangler\s+(?:deploy|publish|delete|secret|kv|r2|d1|queues|pages)\b)/i,
    "Cloudflare mutation",
  ],
  [/vocanova\.site/i, "remote vocanova endpoint"],
];

const REQUIRED_MARKERS = {
  "ci.yml": [
    "./.github/actions/setup-toolchain",
    "pnpm run ci:foundation",
    "pnpm run ci:packages",
    "pnpm run ci:web",
    "pnpm run ci:worker-api",
    "pnpm run ci:api",
    "name: ci required",
    "scripts/foundation/require-successful-jobs.sh",
  ],
  "governance.yml": [
    "scripts/governance/validate-governance.sh",
    "tooling/governance/validate_repository_foundation.py",
    "scripts/governance/classify-change-risk.sh",
    'jq -r \'.pull_request.body // ""\' "$GITHUB_EVENT_PATH"',
    "--require-declaration",
  ],
  "quality.yml": [
    "paths:",
    "apps/web/**",
    "packages/**",
    "pnpm --filter @vocanova/web test:e2e",
    "pnpm --filter @vocanova/web test:lighthouse",
    ".github/actions/setup-toolchain/**",
    "scripts/foundation/require-successful-jobs.sh",
    "name: quality required",
  ],
  "security.yml": [
    "pnpm audit --audit-level high",
    "trufflesecurity/trufflehog@bcfcf73aaf4759d4dadc2783177c245a02792318",
    'version: "3.97.0"',
    "ghcr.io/trufflesecurity/trufflehog@sha256:ff4c95e9df7d645daf2140e3ca1039031c63106268d5fbb25feb43ceca1bcc33",
    'test "$status" -eq 183',
    "name: security required",
    "scripts/foundation/require-successful-jobs.sh",
  ],
};

const SETUP_ACTION_MARKERS = [
  "uses: pnpm/action-setup@0977fd99725f1db4007ccb2928dbb4e90d06cc86 # v6.0.10\n      with:\n        cache: true",
  "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
  "actions/setup-go@b7ad1dad31e06c5925ef5d2fc7ad053ef454303e",
  "pnpm install --frozen-lockfile",
];

function occurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function inspectImmutableReferences(filename, source) {
  const errors = [];
  for (const match of source.matchAll(
    /^\s*-\s+uses:\s*([^\s#]+)(?:\s+#.*)?\s*$/gm,
  )) {
    const reference = match[1];
    if (!reference.startsWith("./") && !/@[0-9a-f]{40}$/.test(reference)) {
      errors.push(
        `${filename}: action is not pinned to an immutable SHA: ${reference}`,
      );
    }
  }
  return errors;
}

export function inspectCommonWorkflowPolicy(filename, source) {
  const errors = [];
  if (!/^permissions:\n  contents: read$/m.test(source)) {
    errors.push(`${filename}: top-level permissions must be contents: read`);
  }
  if (/^\s+[a-z-]+:\s*write\s*$/m.test(source)) {
    errors.push(`${filename}: write permission is prohibited`);
  }
  if (
    /^\s{2}(issues|issue_comment|pull_request_target|workflow_run|schedule):/m.test(
      source,
    )
  ) {
    errors.push(`${filename}: prohibited trigger is present`);
  }
  if (source.includes("KARSIFT/karsift-ai-infra")) {
    errors.push(`${filename}: external control-plane reference is prohibited`);
  }
  if (!/^defaults:\n  run:\n    shell: bash$/m.test(source)) {
    errors.push(`${filename}: run steps must use the explicit bash shell`);
  }
  if (!/^concurrency:\n(?:  .+\n)+  cancel-in-progress: true$/m.test(source)) {
    errors.push(`${filename}: cancel-in-progress concurrency is required`);
  }

  errors.push(...inspectImmutableReferences(filename, source));

  const checkoutCount = occurrences(
    source,
    /^\s+uses:\s*actions\/checkout@[0-9a-f]{40}(?:\s+#.*)?$/gm,
  );
  const noCredentialCount = occurrences(
    source,
    /^\s+persist-credentials:\s*false$/gm,
  );
  if (checkoutCount === 0 || checkoutCount !== noCredentialCount) {
    errors.push(
      `${filename}: every checkout must disable persisted credentials`,
    );
  }

  for (const match of source.matchAll(/\bghcr\.io\/[a-z0-9_./:@-]+/gi)) {
    if (!/@sha256:[0-9a-f]{64}$/.test(match[0])) {
      errors.push(
        `${filename}: container image is not pinned to an immutable digest: ${match[0]}`,
      );
    }
  }

  const runnerCount = occurrences(source, /^\s+runs-on:/gm);
  const timeoutCount = occurrences(source, /^\s+timeout-minutes:/gm);
  if (runnerCount === 0 || runnerCount !== timeoutCount) {
    errors.push(`${filename}: every runner job must declare a timeout`);
  }

  const artifactCount = occurrences(
    source,
    /^\s+uses:\s*actions\/upload-artifact@[0-9a-f]{40}(?:\s+#.*)?$/gm,
  );
  const retentionValues = [
    ...source.matchAll(/^\s+retention-days:\s*(\d+)$/gm),
  ].map((match) => Number(match[1]));
  if (
    artifactCount !== retentionValues.length ||
    retentionValues.some((days) => days < 1 || days > 7)
  ) {
    errors.push(
      `${filename}: every artifact must have retention between 1 and 7 days`,
    );
  }
  return errors;
}

export function inspectSetupAction(source) {
  const filename = ".github/actions/setup-toolchain/action.yml";
  const errors = inspectImmutableReferences(filename, source);
  for (const marker of SETUP_ACTION_MARKERS) {
    if (!source.includes(marker)) {
      errors.push(`${filename}: missing required marker: ${marker}`);
    }
  }
  if (/node_modules/i.test(source)) {
    errors.push(`${filename}: node_modules must not be cached`);
  }
  return errors;
}

export function inspectTargetWorkflow(filename, source) {
  const errors = inspectCommonWorkflowPolicy(filename, source);
  for (const marker of REQUIRED_MARKERS[filename] ?? []) {
    if (!source.includes(marker)) {
      errors.push(`${filename}: missing required marker: ${marker}`);
    }
  }
  return errors;
}

export function validateWorkflowDirectory(directory, phase = "additive") {
  const errors = [];
  const actual = readdirSync(directory)
    .filter((name) => /\.ya?ml$/.test(name))
    .sort();

  for (const filename of TARGET_WORKFLOWS) {
    if (!actual.includes(filename)) {
      errors.push(`${filename}: target workflow is missing`);
      continue;
    }
    const source = readFileSync(resolve(directory, filename), "utf8");
    errors.push(...inspectTargetWorkflow(filename, source));
  }

  for (const filename of RETIRED_CONTROL_PLANE_WORKFLOWS) {
    if (actual.includes(filename)) {
      errors.push(
        `${filename}: retired external control-plane workflow is present`,
      );
    }
  }

  for (const filename of RETIRED_SERVER_WORKFLOWS) {
    if (actual.includes(filename)) {
      errors.push(`${filename}: retired server-bound workflow is present`);
    }
  }

  for (const filename of actual) {
    const source = readFileSync(resolve(directory, filename), "utf8");
    if (source.includes("KARSIFT/karsift-ai-infra")) {
      errors.push(
        `${filename}: external control-plane reference is prohibited`,
      );
    }
    for (const [pattern, capability] of SERVER_CAPABILITY_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(`${filename}: prohibited server capability: ${capability}`);
      }
    }
  }

  if (phase === "final") {
    const expected = [...TARGET_WORKFLOWS].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      errors.push(`workflow inventory must be exactly: ${expected.join(", ")}`);
    }
  } else if (phase !== "additive") {
    errors.push(`unknown workflow-policy phase: ${phase}`);
  }
  return errors;
}

function main(argv) {
  const phaseIndex = argv.indexOf("--phase");
  const phase = phaseIndex === -1 ? "additive" : argv[phaseIndex + 1];
  const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const errors = validateWorkflowDirectory(
    resolve(root, ".github/workflows"),
    phase,
  );
  errors.push(
    ...inspectSetupAction(
      readFileSync(
        resolve(root, ".github/actions/setup-toolchain/action.yml"),
        "utf8",
      ),
    ),
  );
  if (errors.length) {
    for (const error of errors) console.error(error);
    return 1;
  }
  console.log(`Workflow policy validation passed (${phase} phase).`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
