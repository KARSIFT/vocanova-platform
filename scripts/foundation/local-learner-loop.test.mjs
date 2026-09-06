import assert from "node:assert/strict";
import test from "node:test";

import { validateLocalLearnerLoopCliArguments } from "./local-learner-loop.mjs";

test("the local learner-loop entry point fixes its disposable topology", () => {
  assert.deepEqual(validateLocalLearnerLoopCliArguments([]), []);
  assert.match(
    validateLocalLearnerLoopCliArguments(["--remote"])[0],
    /no arguments/,
  );
});
