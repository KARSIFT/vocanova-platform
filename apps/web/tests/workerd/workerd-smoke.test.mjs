import assert from "node:assert/strict";
import test from "node:test";

import {
  startWorkerdWithRetry,
  WorkerdStartupAttemptError,
} from "../../scripts/test-workerd.mjs";

function startupFailure(port, diagnostic) {
  return new WorkerdStartupAttemptError(
    new Error("Wrangler exited before readiness with 1"),
    {
      output: [diagnostic],
      port,
      stickyDiagnostics: [diagnostic.trim()],
    },
  );
}

test("retries a startup bind collision with a fresh port and accepts only successful diagnostics", async () => {
  const selectedPorts = [41_001, 41_002];
  const attemptedPorts = [];
  const accepted = {
    output: ["Ready on http://127.0.0.1:41002\n"],
    stickyDiagnostics: [],
  };

  const result = await startWorkerdWithRetry({
    selectPort: async () => selectedPorts.shift(),
    startAttempt: async (port) => {
      attemptedPorts.push(port);
      if (port === 41_001) {
        throw startupFailure(
          port,
          `✘ [ERROR] Address already in use (127.0.0.1:${port}). Please check that you are not already running a server on this address or specify a different port with --port.\n`,
        );
      }
      return accepted;
    },
  });

  assert.equal(result, accepted);
  assert.deepEqual(attemptedPorts, [41_001, 41_002]);
  assert.deepEqual(result.output, ["Ready on http://127.0.0.1:41002\n"]);
  assert.deepEqual(result.stickyDiagnostics, []);
});

test("stops after the bounded number of bind collisions", async () => {
  const selectedPorts = [42_001, 42_002, 42_003];
  const attemptedPorts = [];

  await assert.rejects(
    startWorkerdWithRetry({
      selectPort: async () => selectedPorts.shift(),
      startAttempt: async (port) => {
        attemptedPorts.push(port);
        throw startupFailure(
          port,
          `Error: listen EADDRINUSE: address already in use 127.0.0.1:${port}\n`,
        );
      },
    }),
    (error) => {
      assert.ok(error instanceof WorkerdStartupAttemptError);
      assert.equal(error.port, 42_003);
      return true;
    },
  );
  assert.deepEqual(attemptedPorts, [42_001, 42_002, 42_003]);
});

test("does not retry a non-collision startup failure", async () => {
  let attempts = 0;
  const failure = startupFailure(
    43_001,
    "✘ [ERROR] Failed to parse wrangler.jsonc\n",
  );

  await assert.rejects(
    startWorkerdWithRetry({
      selectPort: async () => 43_001,
      startAttempt: async () => {
        attempts += 1;
        throw failure;
      },
    }),
    (error) => error === failure,
  );
  assert.equal(attempts, 1);
});
