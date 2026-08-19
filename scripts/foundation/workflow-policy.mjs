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

const REQUIRED_MARKERS = {
  "ci.yml": [
    "pnpm install --frozen-lockfile",
    "pnpm validate",
    "node-version-file: .nvmrc",
    "go-version-file: apps/api/go.mod",
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
  ],
  "security.yml": [
    "pnpm audit --audit-level high",
    "trufflesecurity/trufflehog@bcfcf73aaf4759d4dadc2783177c245a02792318",
    'version: "3.97.0"',
    "ghcr.io/trufflesecurity/trufflehog@sha256:ff4c95e9df7d645daf2140e3ca1039031c63106268d5fbb25feb43ceca1bcc33",
    'test "$status" -eq 183',
  ],
};

function occurrences(source, pattern) {
  return [...source.matchAll(pattern)].length;
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

  for (const match of source.matchAll(/^\s*-\s+uses:\s*([^\s#]+)\s*$/gm)) {
    const reference = match[1];
    if (!reference.startsWith("./") && !/@[0-9a-f]{40}$/.test(reference)) {
      errors.push(
        `${filename}: action is not pinned to an immutable SHA: ${reference}`,
      );
    }
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

  for (const filename of actual) {
    const source = readFileSync(resolve(directory, filename), "utf8");
    if (source.includes("KARSIFT/karsift-ai-infra")) {
      errors.push(
        `${filename}: external control-plane reference is prohibited`,
      );
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
