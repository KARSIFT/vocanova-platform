import assert from "node:assert/strict";
import test from "node:test";

import { validateWorkspace } from "./validate-workspace.mjs";

test("the canonical workspace structure and membership are valid", () => {
  assert.deepEqual(validateWorkspace(), []);
});
