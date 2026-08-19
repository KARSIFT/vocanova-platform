import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const RETIRED_AGENT_PATHS = [
  ".claude/agents",
  ".karsift",
  "orchestrator",
];

const AUTONOMOUS_WRITE_PATTERNS = [
  new RegExp(["gh", "\\s+", "pr", "\\s+", "merge", "\\b"].join("")),
  new RegExp(["gh", "\\s+", "issue", "\\s+", "close", "\\b"].join("")),
  /["']gh["'][\s\S]{0,200}["']pr["'][\s\S]{0,200}["']merge["']/,
  /["']gh["'][\s\S]{0,200}["']issue["'][\s\S]{0,200}["']close["']/,
  /\bpulls\s*\.\s*merge\s*\(/,
  /\bpulls\b[\s\S]{0,200}\/merge\b/,
  /\bissues\s*\.\s*update\s*\([\s\S]{0,300}\bstate\s*:\s*["']closed["']/,
  /\bissues\b[\s\S]{0,300}\bstate\b[\s\S]{0,100}["']closed["']/,
  /\bmutation\b[\s\S]{0,500}\b(mergePullRequest|closeIssue)\b/,
  /\bmutation\b[\s\S]{0,500}\bupdateIssue\b[\s\S]{0,300}\bstate\s*:\s*CLOSED\b/,
  new RegExp(["merge", "Pull", "Request", "\\s*\\("].join("")),
  new RegExp(["close", "Issue", "\\s*\\("].join("")),
];

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function stripYamlComment(line) {
  let quote = "";
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (quote) {
      if (character === quote && line[index - 1] !== "\\") quote = "";
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "#") {
      return line.slice(0, index).trimEnd();
    }
  }
  return line.trimEnd();
}

function containsIssueEvent(value) {
  return /(^|[^A-Za-z0-9_-])(issues|issue_comment)(?=$|[^A-Za-z0-9_-])/.test(
    value,
  );
}

function hasIssueTrigger(source) {
  const lines = source.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const topLevel = stripYamlComment(lines[index]);
    const onMatch = topLevel.match(/^(?:on|["']on["'])\s*:\s*(.*)$/);
    if (!onMatch) continue;

    const inlineValue = onMatch[1].trim();
    if (inlineValue) {
      if (containsIssueEvent(inlineValue) || /[*&]/.test(inlineValue)) {
        return true;
      }
      continue;
    }

    let eventIndent = null;
    for (
      let nestedIndex = index + 1;
      nestedIndex < lines.length;
      nestedIndex += 1
    ) {
      const nested = stripYamlComment(lines[nestedIndex]);
      if (!nested.trim()) continue;
      const indentation = nested.match(/^\s*/)[0].length;
      if (indentation === 0) break;
      if (eventIndent === null) eventIndent = indentation;
      if (indentation !== eventIndent) continue;

      const eventMatch = nested
        .trimStart()
        .match(/^(?:["']?)(issues|issue_comment)(?:["']?)\s*:/);
      if (eventMatch) return true;
      if (/^(?:<<\s*:|[*&])/.test(nested.trimStart())) return true;
    }
  }
  return false;
}

export function validateAgentAuthority(repositoryRoot) {
  const errors = [];

  for (const path of RETIRED_AGENT_PATHS) {
    if (existsSync(resolve(repositoryRoot, path))) {
      errors.push(`retired agent path is present: ${path}`);
    }
  }

  const packagePath = resolve(repositoryRoot, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    if (
      name.startsWith("orchestrator") ||
      /orchestrator\/run\.mjs/.test(command)
    ) {
      errors.push(
        `package script can launch the retired orchestrator: ${name}`,
      );
    }
  }

  const workflowDirectory = resolve(repositoryRoot, ".github/workflows");
  for (const path of filesBelow(workflowDirectory)) {
    if (!/\.ya?ml$/.test(path)) continue;
    const source = readFileSync(path, "utf8");
    if (hasIssueTrigger(source)) {
      errors.push(`${path}: issue/comment trigger can start agent work`);
    }
  }

  const executableFiles = [
    ...filesBelow(resolve(repositoryRoot, "scripts")),
    ...filesBelow(workflowDirectory),
  ].filter(
    (path) =>
      !/\.test\.[cm]?[jt]s$/.test(path) &&
      !path.endsWith("agent-authority-policy.mjs"),
  );

  for (const path of executableFiles) {
    const source = readFileSync(path, "utf8");
    for (const pattern of AUTONOMOUS_WRITE_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(
          `${path}: autonomous PR/issue completion command is prohibited`,
        );
        break;
      }
    }
  }

  return errors;
}

function main() {
  const repositoryRoot = resolve(
    fileURLToPath(new URL("../..", import.meta.url)),
  );
  const errors = validateAgentAuthority(repositoryRoot);
  if (errors.length) {
    for (const error of errors) console.error(error);
    return 1;
  }
  console.log("Agent authority retirement validation passed.");
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
