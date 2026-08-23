import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  buildStandaloneWorkerdEnvironment,
  collectChildWorkerdOutput,
  startWorkerdWithRetry,
  WorkerdOutputCollector,
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

test("port retry skips duplicates and bounds fresh-port selection", async () => {
  const selectedPorts = [44_001, 44_001, 44_002];
  const attemptedPorts = [];
  await startWorkerdWithRetry({
    maximumAttempts: 2,
    maximumPortSelections: 3,
    selectPort: async () => selectedPorts.shift(),
    startAttempt: async (port) => {
      attemptedPorts.push(port);
      if (port === 44_001) {
        throw startupFailure(
          port,
          `Error: listen EADDRINUSE: address already in use 127.0.0.1:${port}\n`,
        );
      }
      return { port };
    },
  });
  assert.deepEqual(attemptedPorts, [44_001, 44_002]);

  let selections = 0;
  await assert.rejects(
    startWorkerdWithRetry({
      maximumAttempts: 2,
      maximumPortSelections: 3,
      selectPort: async () => {
        selections += 1;
        return 45_001;
      },
      startAttempt: async (port) => {
        throw startupFailure(
          port,
          `Error: listen EADDRINUSE: address already in use 127.0.0.1:${port}\n`,
        );
      },
    }),
    /Unable to select a fresh workerd port after 3 bounded selections/,
  );
  assert.equal(selections, 3);
});

test("standalone workerd environment rejects inherited Sentry configuration", () => {
  const environment = buildStandaloneWorkerdEnvironment({
    PATH: "/fixture/bin",
    NEXT_PUBLIC_SENTRY_DSN: "https://public@invalid.example/1",
    SENTRY_AUTH_TOKEN: "must-not-survive",
    SENTRY_CREDENTIAL: "must-not-survive",
    SENTRY_DSN: "https://server@invalid.example/2",
    SENTRY_ORG: "must-not-survive",
  });
  assert.equal(environment.PATH, "/fixture/bin");
  assert.equal(environment.NEXT_PUBLIC_SENTRY_DSN, "");
  assert.equal(environment.SENTRY_DSN, "");
  for (const key of ["SENTRY_AUTH_TOKEN", "SENTRY_CREDENTIAL", "SENTRY_ORG"]) {
    assert.equal(environment[key], undefined);
  }
  assert.doesNotMatch(JSON.stringify(environment), /must-not-survive|invalid\.example/);
});

test("incremental collector joins split diagnostics and narrow allowlists", () => {
  const hard = new WorkerdOutputCollector();
  hard.write("stderr", "UnhandledPromise");
  hard.write("stderr", "Rejection: Compile");
  hard.write("stderr", "Error: rejected\n");
  hard.close("stderr");
  assert.equal(hard.result().pass, false);
  assert.match(hard.result().diagnostics.join("\n"), /UnhandledPromiseRejection/);

  const allowed = new WorkerdOutputCollector();
  allowed.write("stderr", 'ERROR {"event":"middleware_auth_');
  allowed.write(
    "stderr",
    'check_failure","category":"unauthorized_401"}\n',
  );
  allowed.close("stderr");
  assert.equal(allowed.result().pass, true);
});

test("collector retains early redacted diagnostics after bounded output eviction", () => {
  const collector = new WorkerdOutputCollector({ maximumOutputBytes: 64 });
  collector.write(
    "stderr",
    "UnhandledPromiseRejection: token=secret-token learner='private learner' CompileError\n",
  );
  collector.write("stdout", "healthy request\n".repeat(200));
  collector.close("stderr");
  collector.close("stdout");
  const result = collector.result();
  assert.equal(result.pass, false);
  assert.match(result.diagnostics.join("\n"), /CompileError/);
  assert.doesNotMatch(
    `${result.output}\n${result.diagnostics.join("\n")}`,
    /secret-token|private learner/,
  );
  assert.ok(Buffer.byteLength(result.output) <= 64);
});

test("child collection waits for stdio close and catches diagnostics after exit", async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  const observed = collectChildWorkerdOutput(child);
  let closed = false;
  void observed.closed.then(() => {
    closed = true;
  });

  child.emit("exit", 0, null);
  child.stderr.emit("data", "UnhandledPromise");
  await Promise.resolve();
  assert.equal(closed, false);
  child.stderr.emit("data", "Rejection: late diagnostic\n");
  child.stdout.emit("close");
  child.stderr.emit("close");
  child.emit("close", 0, null);
  await observed.closed;

  assert.equal(closed, true);
  assert.equal(observed.collector.result().pass, false);
  assert.match(
    observed.collector.result().diagnostics.join("\n"),
    /late diagnostic/,
  );
});
