import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { fileFromClaudePayload } from "./format-claude-edit.mjs";

const root = path.resolve("/workspace/vocanova");

test("reads Claude's tool_input.file_path payload", () => {
  assert.equal(
    fileFromClaudePayload(
      JSON.stringify({ tool_input: { file_path: "apps/web/src/page.tsx" } }),
      root,
    ),
    path.join(root, "apps/web/src/page.tsx"),
  );
});

test("ignores malformed, unsupported, and out-of-repository paths", () => {
  assert.equal(fileFromClaudePayload("not json", root), null);
  assert.equal(
    fileFromClaudePayload(
      JSON.stringify({ tool_input: { file_path: "README.exe" } }),
      root,
    ),
    null,
  );
  assert.equal(
    fileFromClaudePayload(
      JSON.stringify({ tool_input: { file_path: "../secret.md" } }),
      root,
    ),
    null,
  );
});
