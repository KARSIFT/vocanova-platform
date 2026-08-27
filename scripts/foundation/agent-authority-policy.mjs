import { existsSync, readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const PROHIBITED_AGENT_PATHS = [
  ".claude/agents",
  ".karsift",
  "orchestrator",
  ".agents",
  ".claude-flow",
  ".ruflo",
  ".swarm",
];

const LOCAL_ORCHESTRATOR_DEPENDENCY_PATTERN =
  /^(?:ruflo|agentic-flow|@claude-flow\/)/;

const LOCAL_ORCHESTRATOR_LAUNCH_PATTERN =
  /(?:\b(?:ruflo|claude-flow)\b|@claude-flow\/|(?:^|[\s/])agentic-flow\b)/i;

const GENERATED_INSTRUCTION_MARKERS = [
  "<!-- BEGIN:nextjs-agent-rules -->",
  "<!-- NEXT-AGENTS-MD-START -->",
  "## Ruflo + Codex Automated Workflow",
  "> Multi-agent orchestration framework for agentic coding",
  "Ruflo is the coordination ledger and policy decision point",
];

const INSTRUCTION_SCAN_EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".open-next",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
]);

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
  /\bgh\s+pr\s+review\b[^\n]*\s--approve\b/,
  /\bgh\s+(?:pr|issue)\s+comment\b/,
  /\bgh\s+workflow\s+run\b/,
  /\bgh\s+api\b[^\n]*(?:\/dispatches|\/reviews|\/comments)\b/,
  /\bpulls\s*\.\s*createReview\s*\([^)]*\bevent\s*:\s*["']APPROVE["']/s,
  /\bissues\s*\.\s*createComment\s*\(/,
  /\bactions\s*\.\s*createWorkflowDispatch\s*\(/,
  /\brepos\s*\.\s*createDispatchEvent\s*\(/,
  /\bmutation\b[\s\S]{0,500}\b(addPullRequestReview|addComment|createRepositoryDispatch)\b/,
];

const PROHIBITED_EXTERNAL_EFFECT_PATTERNS = [
  [
    /\b(?:CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|CF_API_TOKEN|CF_ACCOUNT_ID)\b/,
    "Cloudflare credential interface",
  ],
  [/api\.cloudflare\.com\/client\/v4/i, "Cloudflare API access"],
  [
    /\bwrangler\s+(?:publish|delete|secret|versions\s+(?:upload|deploy)|deployments)\b/i,
    "Cloudflare mutation command",
  ],
  [
    /\bwrangler\s+deploy\b(?![^\n]*--dry-run)/i,
    "Cloudflare deployment command",
  ],
  [
    /\bwrangler\s+d1\s+(?:execute|migrations\s+apply)\b[^\n]*(?:--remote|--env\s+(?:staging|production))\b/i,
    "remote D1 mutation command",
  ],
  [
    /\b(?:PRODUCTION_DATABASE_URL|PRODUCTION_LEARNER_DATA|LEARNER_DATA_EXPORT)\b/,
    "production learner-data access",
  ],
  [
    /\b(?:PRODUCTION_[A-Z0-9_]*(?:SECRET|TOKEN|KEY)|ANTHROPIC_API_KEY|OPENAI_API_KEY)\b/,
    "production or paid-provider secret",
  ],
  [/\b(?:RUFLO_)?SPENDING_AUTHORITY\b/, "spending authority"],
];

function filesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function instructionFilesBelow(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return INSTRUCTION_SCAN_EXCLUDED_DIRECTORIES.has(entry.name)
        ? []
        : instructionFilesBelow(path);
    }
    return /^(?:AGENTS|CLAUDE)\.md$/.test(entry.name) ? [path] : [];
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

function inspectDeliveryWorkflow(source) {
  const errors = [];
  for (const marker of [
    "workflow_dispatch:",
    "name: cloudflare delivery",
    "environment: cloudflare-staging",
    "CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}",
    "CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}",
    "VOC-080-HOLD-01",
  ]) {
    if (!source.includes(marker)) {
      errors.push(`ci.yml missing Cloudflare delivery marker: ${marker}`);
    }
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
  return errors;
}

export function validateAgentAuthority(repositoryRoot) {
  const errors = [];

  for (const path of PROHIBITED_AGENT_PATHS) {
    if (existsSync(resolve(repositoryRoot, path))) {
      errors.push(`repository-local agent state is prohibited: ${path}`);
    }
  }

  const packagePath = resolve(repositoryRoot, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    for (const name of Object.keys(packageJson[field] ?? {})) {
      if (LOCAL_ORCHESTRATOR_DEPENDENCY_PATTERN.test(name)) {
        errors.push(
          `repository-local orchestrator dependency is prohibited: ${field}.${name}`,
        );
      }
    }
  }
  for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
    if (
      name.startsWith("orchestrator") ||
      /orchestrator\/run\.mjs/.test(command) ||
      LOCAL_ORCHESTRATOR_LAUNCH_PATTERN.test(command)
    ) {
      errors.push(
        `package script can launch a repository-local orchestrator: ${name}`,
      );
    }
  }

  for (const path of instructionFilesBelow(repositoryRoot)) {
    const filename = relative(repositoryRoot, path).replaceAll("\\", "/");
    const source = readFileSync(path, "utf8");
    for (const marker of GENERATED_INSTRUCTION_MARKERS) {
      if (source.includes(marker)) {
        errors.push(
          `${filename}: generated orchestrator instructions cannot replace repository authority`,
        );
        break;
      }
    }
    if (filename.includes("/") && source.trim() === "@AGENTS.md") {
      errors.push(
        `${filename}: generated nested instruction import cannot replace repository authority`,
      );
    }
  }

  const workflowDirectory = resolve(repositoryRoot, ".github/workflows");
  const deliveryWorkflow = resolve(workflowDirectory, "ci.yml");
  let deliveryWorkflowValid = false;
  if (existsSync(deliveryWorkflow)) {
    const deliveryErrors = inspectDeliveryWorkflow(
      readFileSync(deliveryWorkflow, "utf8"),
    );
    deliveryWorkflowValid = deliveryErrors.length === 0;
    errors.push(
      ...deliveryErrors.map(
        (error) =>
          `${deliveryWorkflow}: unsafe Cloudflare delivery policy: ${error}`,
      ),
    );
  }
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
      !path.endsWith("agent-authority-policy.mjs") &&
      !path.endsWith("cloudflare-delivery-policy.mjs") &&
      !path.endsWith("local-development-policy.mjs") &&
      !path.endsWith("workflow-policy.mjs"),
  );

  for (const path of executableFiles) {
    const source = readFileSync(path, "utf8");
    if (LOCAL_ORCHESTRATOR_LAUNCH_PATTERN.test(source)) {
      errors.push(
        `${path}: tracked external-orchestrator launcher is prohibited`,
      );
    }
    for (const pattern of AUTONOMOUS_WRITE_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(
          `${path}: autonomous GitHub write/completion command is prohibited`,
        );
        break;
      }
    }
    for (const [pattern, capability] of PROHIBITED_EXTERNAL_EFFECT_PATTERNS) {
      const isDeliveryWorkflow = path === deliveryWorkflow;
      if (
        isDeliveryWorkflow &&
        capability === "Cloudflare credential interface"
      ) {
        continue;
      }
      if (isDeliveryWorkflow && deliveryWorkflowValid) continue;
      if (pattern.test(source)) {
        errors.push(`${path}: prohibited external effect: ${capability}`);
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
  console.log("Agent authority boundary validation passed.");
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
