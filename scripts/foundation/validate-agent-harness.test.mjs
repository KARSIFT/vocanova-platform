import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { mkdtemp } from "node:fs/promises";

import { validateAgentHarness } from "./validate-agent-harness.mjs";

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "vocanova-harness-"));
  const files = {
    "AGENTS.md": "# Guide\n",
    "CLAUDE.md": "Follow AGENTS.md.\n",
    "package.json":
      '{"scripts":{"ci:foundation":"true","ci:packages":"true","ci:web":"true","ci:worker-api":"true","ci:local-stack":"true"}}\n',
    ".agents/README.md": "# Skills\n",
    ".agents/skills/verify/SKILL.md":
      "---\nname: verify\ndescription: Verify a change.\n---\n\n# Verify\n",
    ".agents/agents/pr-poller.md":
      "---\nname: pr-poller\ndescription: Poll a pull request.\n---\n",
    ".claude/settings.json": "{}\n",
    ".codex/config.toml":
      'sandbox_mode = "workspace-write"\napproval_policy = "on-request"\n[sandbox_workspace_write]\nnetwork_access = false\n',
    ".codex/agents/pr-poller.toml": 'sandbox_mode = "read-only"\n',
    ".cursor/rules/vocanova-harness.mdc": "---\ndescription: Guide\n---\n",
    ".opencode/agents/pr-poller.md": "---\ndescription: Poll\n---\n",
    ".playwright/cli.config.json": "{}\n",
    ".vscode/extensions.json": "{}\n",
    ".vscode/launch.json": "{}\n",
    ".vscode/settings.json": "{}\n",
    ".vscode/tasks.json": "{}\n",
    "mise.toml":
      '[tools]\nnode = "24.18.0"\npnpm = "11.14.0"\nuv = "0.11.21"\n"pipx:pre-commit" = { version = "4.6.0", depends = "uv" }\n',
    ".pre-commit-config.yaml":
      "repos:\n  - id: prettier\n  - id: harness-check\n  - id: architecture-check\n  - id: workflow-check\n",
  };
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  await symlink("../.agents/skills", path.join(root, ".claude/skills"));
  await symlink("../.agents/agents", path.join(root, ".claude/agents"));
  return root;
}

test("accepts a complete harness", async () => {
  assert.deepEqual(await validateAgentHarness(await fixture()), []);
});

test("reports a mismatched skill name and malformed adapter", async () => {
  const root = await fixture();
  await writeFile(
    path.join(root, ".agents/skills/verify/SKILL.md"),
    "---\nname: review\ndescription: Wrong name.\n---\n",
  );
  await writeFile(path.join(root, ".playwright/cli.config.json"), "{");
  const violations = await validateAgentHarness(root);
  assert(violations.some((item) => item.includes("name must match directory")));
  assert(violations.some((item) => item.includes("invalid JSON")));
});

test("rejects unsafe instructions and missing command references", async () => {
  const root = await fixture();
  await writeFile(
    path.join(root, ".agents/skills/verify/SKILL.md"),
    "---\nname: verify\ndescription: Unsafe.\n---\n\nRun `pnpm run missing` then `wrangler deploy`.\n",
  );
  const violations = await validateAgentHarness(root);
  assert(violations.some((item) => item.includes("direct deployment")));
  assert(violations.some((item) => item.includes("missing package script")));
});

test("rejects permissive or malformed tool configuration", async () => {
  const root = await fixture();
  await writeFile(
    path.join(root, ".codex/config.toml"),
    'sandbox_mode = "workspace-write"\napproval_policy = "never"\nnetwork_access = true\n',
  );
  await writeFile(path.join(root, ".pre-commit-config.yaml"), "repos: [\n");
  const violations = await validateAgentHarness(root);
  assert(violations.some((item) => item.includes("on-request")));
  assert(violations.some((item) => item.includes("missing prettier hook")));
  assert(violations.some((item) => item.includes("invalid YAML")));
});
