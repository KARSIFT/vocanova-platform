import assert from "node:assert/strict";
import test from "node:test";

import {
  combineLocalLearnerLoopFailures,
  finalizeLocalLearnerLoop,
  selectDisposableD1Path,
  validateLocalLearnerLoopCliArguments,
} from "./local-learner-loop.mjs";

test("the local learner-loop entry point fixes its disposable topology", () => {
  assert.deepEqual(validateLocalLearnerLoopCliArguments([]), []);
  assert.match(
    validateLocalLearnerLoopCliArguments(["--remote"])[0],
    /no arguments/,
  );
});

test("learner-loop inspection selects D1 without counting Workerd cache state", () => {
  assert.equal(
    selectDisposableD1Path([
      "/tmp/state/v3/cache/miniflare-CacheObject/cache.sqlite",
      "/tmp/state/v3/d1/miniflare-D1DatabaseObject/database.sqlite",
    ]),
    "/tmp/state/v3/d1/miniflare-D1DatabaseObject/database.sqlite",
  );
  assert.throws(
    () =>
      selectDisposableD1Path([
        "/tmp/state/v3/d1/one/database.sqlite",
        "/tmp/state/v3/d1/two/database.sqlite",
      ]),
    /one disposable D1 database/,
  );
});

test("learner-loop finalization attempts every cleanup stage after failures", async () => {
  const calls = [];
  const failing = (label) => {
    calls.push(label);
    throw new Error(label);
  };
  const children = {
    records: [{ label: "api", output: "", diagnostics: [] }],
    stopAll: () => failing("stop"),
  };

  await assert.rejects(
    finalizeLocalLearnerLoop({
      browser: { close: () => failing("browser") },
      children,
      plan: { ports: [3000, 8080] },
      stateDirectory: "/tmp/state",
      workspace: "/tmp/workspace",
      before: "before",
      portCheck: () => failing("ports"),
      exists: (path) => path.endsWith("/state"),
      remove: () => failing("remove"),
      readEvidence: () => {
        calls.push("database");
        return { health: "not ok" };
      },
      assertWorkerdOutput: () => failing("diagnostics"),
      captureTree: () => {
        calls.push("capture-tree");
        return "after";
      },
      assertTree: () => failing("tree"),
    }),
    (error) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.errors.length, 7);
      return true;
    },
  );
  assert.deepEqual(calls, [
    "browser",
    "stop",
    "diagnostics",
    "ports",
    "database",
    "remove",
    "capture-tree",
    "tree",
  ]);
});

test("learner-loop failures retain the primary error before cleanup errors", () => {
  const primary = new Error("browser flow failed");
  const cleanup = new AggregateError(
    [new Error("process stop failed"), new Error("state removal failed")],
    "cleanup failed",
  );

  const combined = combineLocalLearnerLoopFailures(primary, cleanup);

  assert.equal(combined.cause, primary);
  assert.deepEqual(combined.errors, [primary, ...cleanup.errors]);
});
