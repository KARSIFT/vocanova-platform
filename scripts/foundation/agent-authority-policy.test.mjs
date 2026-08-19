import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import { validateAgentAuthority } from "./agent-authority-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");

test("the repository has no executable local agent authority", () => {
  assert.deepEqual(validateAgentAuthority(repositoryRoot), []);
});

test("retired assets, triggers, launchers, and autonomous completion fail closed", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-agent-policy-"));
  try {
    mkdirSync(resolve(temporary, ".claude/agents"), { recursive: true });
    mkdirSync(resolve(temporary, ".github/workflows"), { recursive: true });
    mkdirSync(resolve(temporary, "scripts"), { recursive: true });
    writeFileSync(
      resolve(temporary, "package.json"),
      JSON.stringify({
        scripts: { orchestrator: "node orchestrator/run.mjs" },
      }),
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

    const errors = validateAgentAuthority(temporary);
    assert.ok(errors.some((error) => error.includes("retired agent path")));
    assert.ok(errors.some((error) => error.includes("retired orchestrator")));
    assert.equal(
      errors.filter((error) => error.includes("issue/comment trigger")).length,
      6,
    );
    assert.equal(
      errors.filter((error) => error.includes("completion command")).length,
      6,
    );
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
