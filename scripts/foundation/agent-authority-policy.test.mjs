import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { validateAgentAuthority } from "./agent-authority-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");

test("the repository has no executable local agent authority", () => {
  assert.deepEqual(validateAgentAuthority(repositoryRoot), []);
});

test("Cloudflare credential interface names are scoped to the canonical delivery workflow", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-agent-policy-"));
  try {
    mkdirSync(resolve(temporary, ".github/workflows"), { recursive: true });
    mkdirSync(resolve(temporary, "scripts"), { recursive: true });
    writeFileSync(resolve(temporary, "package.json"), JSON.stringify({}));
    writeFileSync(
      resolve(temporary, ".github/workflows/ci.yml"),
      [
        "on:",
        "  workflow_dispatch:",
        "jobs:",
        "  unsafe:",
        "    runs-on: ubuntu-24.04",
        "    steps:",
        '      - run: test -n "$CLOUDFLARE_API_TOKEN"',
        "",
      ].join("\n"),
    );
    writeFileSync(
      resolve(temporary, "scripts/cloudflare-token.sh"),
      'test -n "$CLOUDFLARE_API_TOKEN"\n',
    );

    const errors = validateAgentAuthority(temporary);
    assert.ok(
      errors.some((error) =>
        error.includes("unsafe Cloudflare delivery policy"),
      ),
    );
    assert.ok(
      errors.some(
        (error) =>
          error.includes("scripts/cloudflare-token.sh") &&
          error.includes("Cloudflare credential interface"),
      ),
    );
    assert.ok(
      errors.every(
        (error) =>
          !(
            error.includes(".github/workflows/ci.yml") &&
            error.includes("prohibited external effect") &&
            error.includes("Cloudflare credential interface")
          ),
      ),
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("settings truth validator exception only allows literal credential names", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-agent-policy-"));
  try {
    mkdirSync(resolve(temporary, ".github/workflows"), { recursive: true });
    mkdirSync(resolve(temporary, "scripts/foundation"), { recursive: true });
    writeFileSync(resolve(temporary, "package.json"), JSON.stringify({}));
    writeFileSync(
      resolve(temporary, ".github/workflows/ci.yml"),
      readFileSync(resolve(repositoryRoot, ".github/workflows/ci.yml"), "utf8"),
    );
    writeFileSync(
      resolve(
        temporary,
        "scripts/foundation/voc085-settings-truthfulness-policy.mjs",
      ),
      [
        'const names = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"];',
        "void names;",
        "const unsafe = 'gh workflow run ci.yml';",
        "void unsafe;",
        "",
      ].join("\n"),
    );

    const errors = validateAgentAuthority(temporary);
    assert.ok(
      errors.some((error) =>
        error.includes("autonomous GitHub write/completion command"),
      ),
    );
    assert.ok(
      errors.every(
        (error) =>
          !error.includes(
            "prohibited external effect: Cloudflare credential interface",
          ),
      ),
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("local orchestration, authority replacement, and external effects fail closed", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-agent-policy-"));
  try {
    mkdirSync(resolve(temporary, ".claude/agents"), { recursive: true });
    mkdirSync(resolve(temporary, ".agents"), { recursive: true });
    mkdirSync(resolve(temporary, ".claude-flow"), { recursive: true });
    mkdirSync(resolve(temporary, ".swarm"), { recursive: true });
    mkdirSync(resolve(temporary, ".github/workflows"), { recursive: true });
    mkdirSync(resolve(temporary, "apps/web"), { recursive: true });
    mkdirSync(resolve(temporary, "packages/example"), { recursive: true });
    mkdirSync(resolve(temporary, "scripts"), { recursive: true });
    writeFileSync(
      resolve(temporary, "package.json"),
      JSON.stringify({
        scripts: {
          orchestrator: "node orchestrator/run.mjs",
          ruflo: "npx ruflo init --force",
        },
        devDependencies: { ruflo: "3.38.16" },
      }),
    );
    writeFileSync(
      resolve(temporary, "AGENTS.md"),
      "# Project\n\n## Ruflo + Codex Automated Workflow\n",
    );
    writeFileSync(
      resolve(temporary, "apps/web/AGENTS.md"),
      "<!-- BEGIN:nextjs-agent-rules -->\nGenerated instructions\n",
    );
    writeFileSync(
      resolve(temporary, "packages/example/CLAUDE.md"),
      "@AGENTS.md\n",
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/agent.yml"),
      "on:\n  issues:\n    types: [opened]\n",
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/inline.yml"),
      "on: [push, issues]\n",
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/flow.yml"),
      "on: { issue_comment: { types: [created] } }\n",
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/indented.yml"),
      "on: # event map\n    issue_comment:\n      types: [created]\n",
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/quoted.yml"),
      '"on":\n  issues:\n    types: [opened]\n',
    );
    writeFileSync(
      resolve(temporary, ".github/workflows/alias.yml"),
      "on:\n  <<: *common_triggers\n",
    );
    writeFileSync(resolve(temporary, "scripts/finish.sh"), "gh pr merge 123\n");
    writeFileSync(
      resolve(temporary, "scripts/close.mjs"),
      'sh("gh", ["issue", "close", "123"]);\n',
    );
    writeFileSync(
      resolve(temporary, "scripts/sdk.mjs"),
      "await octokit.rest.pulls.merge({ owner, repo, pull_number });\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/rest.mjs"),
      'await fetch("/repos/acme/app/pulls/123/merge", { method: "PUT" });\n',
    );
    writeFileSync(
      resolve(temporary, "scripts/issue-sdk.mjs"),
      'await octokit.rest.issues.update({ issue_number: 1, state: "closed" });\n',
    );
    writeFileSync(
      resolve(temporary, "scripts/graphql.mjs"),
      "await graphql(`mutation { closeIssue(input: $input) { issue { id } } }`);\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/ruflo.sh"),
      "npx ruflo@3.38.16 swarm init --topology hierarchical\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/approve.sh"),
      "gh pr review 123 --approve\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/comment.sh"),
      "gh pr comment 123 --body pass\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/dispatch.mjs"),
      "await octokit.rest.actions.createWorkflowDispatch({ workflow_id: 1 });\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/cloudflare.sh"),
      "wrangler deploy --env production\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/cloudflare-token.sh"),
      'test -n "$CLOUDFLARE_API_TOKEN"\n',
    );
    writeFileSync(
      resolve(temporary, "scripts/learner-export.sh"),
      "psql \"$PRODUCTION_DATABASE_URL\" -c 'copy learners to stdout'\n",
    );
    writeFileSync(
      resolve(temporary, "scripts/provider-secret.sh"),
      'test -n "$ANTHROPIC_API_KEY"\n',
    );
    writeFileSync(
      resolve(temporary, "scripts/spend.sh"),
      'test "$RUFLO_SPENDING_AUTHORITY" = approved\n',
    );

    const errors = validateAgentAuthority(temporary);
    assert.ok(errors.some((error) => error.includes("agent state")));
    assert.ok(
      errors.some((error) => error.includes("orchestrator dependency")),
    );
    assert.ok(errors.some((error) => error.includes("package script")));
    assert.ok(errors.some((error) => error.includes("AGENTS.md")));
    assert.ok(errors.some((error) => error.includes("apps/web/AGENTS.md")));
    assert.ok(
      errors.some((error) => error.includes("packages/example/CLAUDE.md")),
    );
    assert.equal(
      errors.filter((error) => error.includes("issue/comment trigger")).length,
      6,
    );
    assert.ok(
      errors.filter((error) => error.includes("GitHub write/completion"))
        .length >= 9,
    );
    assert.ok(
      errors.some((error) => error.includes("external-orchestrator launcher")),
    );
    assert.equal(
      errors.filter((error) => error.includes("prohibited external effect"))
        .length,
      5,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
