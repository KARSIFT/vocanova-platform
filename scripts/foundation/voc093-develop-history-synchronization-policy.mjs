import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const FOUNDATION_COMMAND = "node --test scripts/foundation/*.test.mjs";

export const LIVING_RELEASE_SURFACES = [
  "AGENTS.md",
  "CONTRIBUTING.md",
  ".github/README.md",
  "docs/governance/16-autonomous-development-operating-model.md",
  "docs/governance/repository-settings.md",
  "docs/operations/10-development-workflow.md",
  "docs/operations/15-ai-native-product-and-engineering-operating-model.md",
];

const REQUIRED_SHARED_MARKER = /post-promotion history\s+synchronization/i;
const REQUIRED_COMBINED_EVIDENCE = [
  [
    /short-lived(?:\s+synchronization)?\s+branch/i,
    "short-lived synchronization branch",
  ],
  [
    /`main` is an ancestor of `develop`/i,
    "main-is-an-ancestor-of-develop evidence",
  ],
  [
    /`develop` is zero commits behind `main`/i,
    "develop-zero-behind-main evidence",
  ],
  [
    /permanent `main`[\s\S]{0,160}never[\s\S]{0,80}(?:PR|pull-request) head/i,
    "permanent main must not be the synchronization PR head",
  ],
  [
    /does not change repository settings/i,
    "repository-settings non-effect boundary",
  ],
  [/does not deploy/i, "deployment non-effect boundary"],
  [
    /exact SHA[\s\S]{0,100}recreation command/i,
    "short-lived-head recovery evidence",
  ],
];

const FORBIDDEN_CLAIMS = [
  [
    /release promotion alone (?:completes|finishes) branch finalization/i,
    "release promotion alone cannot finalize branch history",
  ],
  [
    /(?:history )?synchronization (?:changes|mutates) repository settings/i,
    "history synchronization must not claim a settings mutation",
  ],
  [
    /(?:history )?synchronization (?:deploys|invokes) (?:to )?(?:Cloudflare|production)/i,
    "history synchronization must not claim deployment or Cloudflare activity",
  ],
  [
    /(?:manually delete|manual deletion of) (?:`main`|`develop`|permanent branches?)/i,
    "manual or permanent-branch deletion is prohibited",
  ],
];

function readSurface(repositoryRoot, relativePath, errors) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`${relativePath}: required living release surface is missing`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

export function validateDevelopHistorySynchronization(repositoryRoot) {
  const errors = [];
  const contents = new Map();

  for (const relativePath of LIVING_RELEASE_SURFACES) {
    const text = readSurface(repositoryRoot, relativePath, errors);
    contents.set(relativePath, text);
    if (text && !REQUIRED_SHARED_MARKER.test(text)) {
      errors.push(
        `${relativePath}: missing post-promotion history synchronization boundary`,
      );
    }
  }

  const combined = [...contents.values()].join("\n");
  for (const [pattern, description] of REQUIRED_COMBINED_EVIDENCE) {
    if (!pattern.test(combined)) {
      errors.push(`living release guidance: missing ${description}`);
    }
  }
  for (const [pattern, description] of FORBIDDEN_CLAIMS) {
    if (pattern.test(combined)) {
      errors.push(`living release guidance: ${description}`);
    }
  }

  const packageJsonPath = path.join(repositoryRoot, "package.json");
  if (!existsSync(packageJsonPath)) {
    errors.push("package.json: required foundation command source is missing");
  } else {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const foundation = packageJson.scripts?.["ci:foundation"] ?? "";
    if (!foundation.includes(FOUNDATION_COMMAND)) {
      errors.push(
        `package.json: ci:foundation must include ${FOUNDATION_COMMAND}`,
      );
    }
  }

  return errors;
}

const cliPath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === cliPath) {
  const repositoryRoot = path.resolve(process.argv[2] ?? ".");
  const errors = validateDevelopHistorySynchronization(repositoryRoot);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  } else {
    console.log("VOC-093 develop history synchronization policy: PASS");
  }
}
