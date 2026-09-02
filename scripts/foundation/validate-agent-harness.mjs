import { lstat, readFile, readdir, readlink } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseDocument } from "yaml";

const REQUIRED_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  ".agents/README.md",
  ".claude/settings.json",
  ".codex/config.toml",
  ".cursor/rules/vocanova-harness.mdc",
  ".opencode/agents/pr-poller.md",
  ".playwright/cli.config.json",
  ".vscode/launch.json",
  ".vscode/tasks.json",
  "mise.toml",
  ".pre-commit-config.yaml",
];

const JSON_FILES = [
  ".claude/settings.json",
  ".playwright/cli.config.json",
  ".vscode/extensions.json",
  ".vscode/launch.json",
  ".vscode/settings.json",
  ".vscode/tasks.json",
];

const UNSAFE_INSTRUCTION_PATTERNS = [
  [/\borigin\/develop\b/, "stale develop branch"],
  [/scripts\/governance\//, "retired governance script"],
  [/\bgit\s+push\s+(?:--force|-f)\b/, "force push"],
  [/\bwrangler\s+deploy\b/, "direct deployment"],
  [/--no-verify\b/, "hook bypass"],
  [/pull_request_target/, "privileged pull_request_target event"],
  [/\$\{\{\s*secrets\./, "Actions secret interpolation"],
];

function frontmatterValue(block, key) {
  return block.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function checkInstructionSafety(relativePath, content, violations) {
  for (const [pattern, description] of UNSAFE_INSTRUCTION_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(
        `${relativePath}: contains prohibited ${description} instruction`,
      );
    }
  }
}

async function validateMarkdownAdapter(root, relativePath, violations) {
  let content;
  try {
    content = await readFile(path.join(root, relativePath), "utf8");
  } catch {
    violations.push(`${relativePath}: adapter file is missing`);
    return;
  }
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  const document = match ? parseDocument(match[1], { uniqueKeys: true }) : null;
  if (document?.errors.length) {
    violations.push(`${relativePath}: invalid frontmatter YAML`);
  }
  if (!match || !frontmatterValue(match[1], "description")) {
    violations.push(
      `${relativePath}: adapter needs frontmatter with a description`,
    );
  }
  checkInstructionSafety(relativePath, content, violations);
}

export async function validateAgentHarness(root) {
  const violations = [];

  for (const relativePath of REQUIRED_FILES) {
    try {
      const entry = await lstat(path.join(root, relativePath));
      if (!entry.isFile())
        violations.push(`${relativePath}: expected a regular file`);
    } catch {
      violations.push(`${relativePath}: required harness file is missing`);
    }
  }

  for (const relativePath of JSON_FILES) {
    try {
      JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
    } catch (error) {
      violations.push(`${relativePath}: invalid JSON (${error.message})`);
    }
  }

  let packageScripts = {};
  try {
    packageScripts = JSON.parse(
      await readFile(path.join(root, "package.json"), "utf8"),
    ).scripts;
  } catch {
    violations.push(
      "package.json: required to validate harness command references",
    );
  }

  for (const relativePath of [
    ".cursor/rules/vocanova-harness.mdc",
    ".opencode/agents/pr-poller.md",
    ".agents/agents/pr-poller.md",
  ]) {
    await validateMarkdownAdapter(root, relativePath, violations);
  }

  for (const directory of [".claude/commands"]) {
    try {
      for (const entry of await readdir(path.join(root, directory), {
        withFileTypes: true,
      })) {
        if (entry.isFile() && entry.name.endsWith(".md")) {
          await validateMarkdownAdapter(
            root,
            `${directory}/${entry.name}`,
            violations,
          );
        }
      }
    } catch {
      // Optional adapter directories may be absent.
    }
  }

  try {
    const codex = await readFile(path.join(root, ".codex/config.toml"), "utf8");
    const expectedSettings = [
      'sandbox_mode = "workspace-write"',
      'approval_policy = "on-request"',
      "[sandbox_workspace_write]",
      "network_access = false",
    ];
    for (const expected of expectedSettings) {
      if (!codex.includes(expected)) {
        violations.push(`.codex/config.toml: missing safe setting ${expected}`);
      }
    }
    const settings = codex
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (
      settings.length !== expectedSettings.length ||
      settings.some((line, index) => line !== expectedSettings[index])
    ) {
      violations.push(
        ".codex/config.toml: only the reviewed safe project settings are allowed",
      );
    }
    checkInstructionSafety(".codex/config.toml", codex, violations);
  } catch {
    // The required-file check reports this more clearly.
  }

  try {
    const poller = await readFile(
      path.join(root, ".codex/agents/pr-poller.toml"),
      "utf8",
    );
    if (!poller.includes('sandbox_mode = "read-only"')) {
      violations.push(
        '.codex/agents/pr-poller.toml: poller must use sandbox_mode = "read-only"',
      );
    }
    checkInstructionSafety(".codex/agents/pr-poller.toml", poller, violations);
  } catch {
    violations.push(".codex/agents/pr-poller.toml: adapter file is missing");
  }

  try {
    const mise = await readFile(path.join(root, "mise.toml"), "utf8");
    for (const expected of [
      'node = "24.18.0"',
      'pnpm = "11.14.0"',
      '"pipx:pre-commit" = { version = "4.6.0", depends = "uv" }',
    ]) {
      if (!mise.includes(expected)) {
        violations.push(`mise.toml: missing pinned tool setting ${expected}`);
      }
    }
  } catch {
    // The required-file check reports this more clearly.
  }

  try {
    const hooks = await readFile(
      path.join(root, ".pre-commit-config.yaml"),
      "utf8",
    );
    const hookDocument = parseDocument(hooks, { uniqueKeys: true });
    if (hookDocument.errors.length) {
      violations.push(".pre-commit-config.yaml: invalid YAML");
    }
    for (const id of [
      "prettier",
      "harness-check",
      "architecture-check",
      "workflow-check",
    ]) {
      if (!hooks.includes(`- id: ${id}`)) {
        violations.push(`.pre-commit-config.yaml: missing ${id} hook`);
      }
    }
    checkInstructionSafety(".pre-commit-config.yaml", hooks, violations);
  } catch {
    // The required-file check reports this more clearly.
  }

  for (const [relativePath, expectedTarget] of [
    [".claude/skills", "../.agents/skills"],
    [".claude/agents", "../.agents/agents"],
  ]) {
    try {
      const entry = await lstat(path.join(root, relativePath));
      const target = entry.isSymbolicLink()
        ? await readlink(path.join(root, relativePath))
        : "";
      if (target !== expectedTarget) {
        violations.push(
          `${relativePath}: expected symlink to ${expectedTarget}`,
        );
      }
    } catch {
      violations.push(`${relativePath}: required adapter symlink is missing`);
    }
  }

  const skillRoot = path.join(root, ".agents/skills");
  const names = new Set();
  let skillDirectories = [];
  try {
    skillDirectories = (
      await readdir(skillRoot, { withFileTypes: true })
    ).filter((entry) => entry.isDirectory());
  } catch {
    violations.push(".agents/skills: shared skill directory is missing");
  }

  for (const directory of skillDirectories) {
    const relativePath = `.agents/skills/${directory.name}/SKILL.md`;
    let content;
    try {
      content = await readFile(path.join(root, relativePath), "utf8");
    } catch {
      violations.push(`${relativePath}: every skill directory needs SKILL.md`);
      continue;
    }

    const match = content.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) {
      violations.push(`${relativePath}: missing YAML frontmatter`);
      continue;
    }
    const document = parseDocument(match[1], { uniqueKeys: true });
    if (document.errors.length) {
      violations.push(`${relativePath}: invalid frontmatter YAML`);
      continue;
    }

    const name = frontmatterValue(match[1], "name");
    const description = frontmatterValue(match[1], "description");
    if (name !== directory.name) {
      violations.push(
        `${relativePath}: name must match directory ${directory.name}`,
      );
    }
    if (!description)
      violations.push(`${relativePath}: description is required`);
    if (names.has(name))
      violations.push(`${relativePath}: duplicate skill name ${name}`);
    names.add(name);

    const lineCount = content.split("\n").length;
    if (lineCount > 300) violations.push(`${relativePath}: exceeds 300 lines`);
    checkInstructionSafety(relativePath, content, violations);
    for (const command of content.matchAll(/`pnpm run ([\w:-]+)`/g)) {
      if (!packageScripts?.[command[1]]) {
        violations.push(
          `${relativePath}: references missing package script ${command[1]}`,
        );
      }
    }
  }

  if (skillDirectories.length === 0) {
    violations.push(".agents/skills: at least one shared skill is required");
  }

  try {
    const claudeGuide = await readFile(path.join(root, "CLAUDE.md"), "utf8");
    if (!claudeGuide.includes("AGENTS.md")) {
      violations.push("CLAUDE.md: must route to AGENTS.md");
    }
  } catch {
    // The required-file check reports this more clearly.
  }

  return violations;
}

async function main() {
  const root = path.resolve(process.cwd());
  const violations = await validateAgentHarness(root);
  if (violations.length > 0) {
    console.error(violations.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log("Agent harness is valid.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
