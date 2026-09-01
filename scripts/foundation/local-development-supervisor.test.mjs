/* global Response, clearTimeout, setTimeout */

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createServer as createHttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { tmpdir } from "node:os";
import { relative } from "node:path";
import process from "node:process";
import test from "node:test";

import {
  LOCAL_DEVELOPMENT_PATHS,
  SupervisedChildren,
  assertPortsAvailable,
  buildLocalDevelopmentPlan,
  buildLocalProcessEnvironment,
  runLocalDevelopment,
  validateSupervisorCliArguments,
  waitForReadiness,
} from "./local-development-supervisor.mjs";

const quietStream = Object.freeze({ write() {} });

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

const CHILD_READY_TIMEOUT_MS = 5_000;
const CHILD_READY_MARKER_PREFIX = "VOCANOVA_CHILD_SIGNAL_READY";

function childReadyMarker(signal) {
  return `${CHILD_READY_MARKER_PREFIX}:${signal}`;
}

function exactMarkerPresent(output, marker) {
  const markerLine = `${marker}\n`;
  return output.startsWith(markerLine) || output.includes(`\n${markerLine}`);
}

function childOutcomeDescription(outcome) {
  if (!outcome) return "unknown outcome";
  if (outcome.error) return outcome.error.message;
  if (outcome.signal) return `signal ${outcome.signal}`;
  return `exit code ${String(outcome.code)}`;
}

function waitForChildReady(
  record,
  {
    marker,
    timeoutMs = CHILD_READY_TIMEOUT_MS,
    setTimeoutImpl = setTimeout,
    clearTimeoutImpl = clearTimeout,
  },
) {
  assert(Number.isFinite(timeoutMs) && timeoutMs > 0 && timeoutMs <= 5_000);
  assert.equal(typeof marker, "string");
  assert.notEqual(marker, "");

  return new Promise((resolveReady, rejectReady) => {
    const stdout = record.child.stdout;
    let observed = "";
    let settled = false;
    let timer;

    const cleanup = () => {
      stdout?.off("data", onData);
      record.child.off("error", onError);
      record.child.off("exit", onExit);
      if (timer !== undefined) clearTimeoutImpl(timer);
    };
    const settle = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (error) rejectReady(error);
      else resolveReady();
    };
    const inspect = () => {
      if (exactMarkerPresent(observed, marker)) settle();
    };
    function onData(chunk) {
      observed += String(chunk);
      inspect();
    }
    function onError(error) {
      settle(
        new Error(`${record.label} errored before readiness: ${error.message}`),
      );
    }
    function onExit(code, signal) {
      settle(
        new Error(
          `${record.label} exited before readiness: ${childOutcomeDescription({ code, error: null, signal })}`,
        ),
      );
    }

    stdout?.on("data", onData);
    record.child.on("error", onError);
    record.child.on("exit", onExit);
    timer = setTimeoutImpl(
      () =>
        settle(
          new Error(
            `${record.label} did not emit ${marker} within ${String(timeoutMs)}ms`,
          ),
        ),
      timeoutMs,
    );

    observed = String(record.output ?? "");
    inspect();
    if (!settled && record.exited) {
      settle(
        new Error(
          `${record.label} exited before readiness: ${childOutcomeDescription(record.outcome)}`,
        ),
      );
    }
  });
}

function occurrenceCount(source, token) {
  return source.split(token).length - 1;
}

function assertSignalFixtureSource(source, { marker, signal }) {
  const handlerToken = `process.on(${JSON.stringify(signal)},`;
  const markerToken = `process.stdout.write(${JSON.stringify(`${marker}\n`)});`;
  assert.equal(
    occurrenceCount(source, handlerToken),
    1,
    `${signal} fixture must register its exact handler once`,
  );
  assert.equal(
    occurrenceCount(source, markerToken),
    1,
    `${signal} fixture must emit its exact marker once`,
  );
  assert(
    source.indexOf(handlerToken) < source.indexOf(markerToken),
    `${signal} fixture must register its handler before marker emission`,
  );
}

const EXPECTED_SIGNAL_EXIT_CODES = Object.freeze({ SIGINT: 23, SIGTERM: 24 });

function assertSignalTestCase(fixture) {
  assert.equal(
    fixture.expectedCode,
    EXPECTED_SIGNAL_EXIT_CODES[fixture.signal],
    `${fixture.signal} must retain its expected exit code`,
  );
  assert.equal(
    fixture.readinessStrategy,
    waitForChildReady,
    `${fixture.signal} must use waitForChildReady instead of a fixed delay`,
  );
  assertSignalFixtureSource(fixture.source, fixture);
}

function signalFixture(signal, expectedCode) {
  const marker = childReadyMarker(signal);
  const source = [
    "setInterval(() => {}, 1000);",
    `process.on(${JSON.stringify(signal)}, () => process.exit(${String(expectedCode)}));`,
    `process.stdout.write(${JSON.stringify(`${marker}\n`)});`,
  ].join(" ");
  const fixture = {
    expectedCode,
    marker,
    readinessStrategy: waitForChildReady,
    signal,
    source,
  };
  assertSignalTestCase(fixture);
  return fixture;
}

async function unusedLoopbackPort() {
  const server = createNetServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  await new Promise((resolveClose, rejectClose) =>
    server.close((error) => (error ? rejectClose(error) : resolveClose())),
  );
  return address.port;
}

function fixtureSpecification(label, source, args = []) {
  return {
    label,
    command: process.execPath,
    args: ["-e", source, ...args.map(String)],
    cwd: LOCAL_DEVELOPMENT_PATHS.repositoryRoot,
    env: buildLocalProcessEnvironment(process.env),
  };
}

test("fast and Workers plans use locked local-only tools and shared state", () => {
  const fast = buildLocalDevelopmentPlan("fast");
  const workers = buildLocalDevelopmentPlan("workers");

  assert.equal(fast.preparation.length, 1);
  assert.equal(fast.preparation[0].command, process.execPath);
  assert.equal(
    fast.preparation[0].args[0],
    LOCAL_DEVELOPMENT_PATHS.typescriptBin,
  );
  assert.equal(fast.api.command, process.execPath);
  assert.equal(fast.web.command, process.execPath);
  assert.equal(fast.api.args[0], LOCAL_DEVELOPMENT_PATHS.wranglerBin);
  assert.equal(fast.web.args[0], LOCAL_DEVELOPMENT_PATHS.nextBin);
  assert.deepEqual(fast.ports, [
    { label: "web", port: 3000 },
    { label: "api", port: 8080 },
  ]);

  assert.equal(workers.preparation.length, 4);
  assert.equal(workers.preparation[1].command, process.execPath);
  assert.equal(
    workers.preparation[1].args[0],
    LOCAL_DEVELOPMENT_PATHS.openNextBin,
  );
  assert.deepEqual(workers.preparation[1].args.slice(1), ["build"]);
  assert.equal(workers.preparation[2].command, process.execPath);
  assert.equal(
    workers.preparation[2].args[0],
    LOCAL_DEVELOPMENT_PATHS.workerCompatibilityScript,
  );
  assert.deepEqual(workers.preparation[2].args.slice(1), [
    "--canonicalize-opennext",
  ]);
  assert.equal(workers.preparation[3].command, process.execPath);
  assert.equal(
    workers.preparation[3].args[0],
    LOCAL_DEVELOPMENT_PATHS.workerCompatibilityScript,
  );
  assert.equal(workers.web.args[0], LOCAL_DEVELOPMENT_PATHS.wranglerBin);

  for (const specification of [fast.api, workers.api, workers.web]) {
    assert(specification.args.includes("--local"));
    assert(specification.args.includes("--config"));
    assert(specification.args.includes("--persist-to"));
    assert(specification.args.includes(LOCAL_DEVELOPMENT_PATHS.stateDirectory));
    assert(
      !specification.args.some((argument) =>
        /remote|preview|tunnel/.test(argument),
      ),
    );
    assert(!specification.args.includes("--env"));
  }
  assert(workers.api.args.includes(LOCAL_DEVELOPMENT_PATHS.apiConfigPath));
  assert(workers.web.args.includes(LOCAL_DEVELOPMENT_PATHS.webConfigPath));
});

test("local child environment is minimal, local, and credential-free", () => {
  const environment = buildLocalProcessEnvironment({
    PATH: "/test/bin",
    LANG: "C.UTF-8",
    CLOUDFLARE_API_TOKEN: "must-not-pass",
    SENTRY_AUTH_TOKEN: "must-not-pass",
    GOOGLE_CLIENT_SECRET: "must-not-pass",
    AI_API_KEY: "must-not-pass",
    EMAIL_PASSWORD: "must-not-pass",
    NODE_OPTIONS: "--inspect",
    HOME: "/real/home",
  });

  assert.equal(environment.PATH, "/test/bin");
  assert.equal(environment.LANG, "C.UTF-8");
  assert.equal(environment.ENVIRONMENT, "local");
  assert.equal(environment.NEXT_PUBLIC_API_BASE_URL, "http://127.0.0.1:8080");
  assert.equal(environment.NEXT_PUBLIC_APP_ORIGIN, "http://127.0.0.1:3000");
  assert.equal(environment.NEXT_TELEMETRY_DISABLED, "1");
  assert.equal(environment.WRANGLER_SEND_METRICS, "false");
  assert.equal(environment.HOME, undefined);
  assert.equal(environment.COREPACK_HOME, "/real/home/.cache/node/corepack");
  assert.equal(typeof environment.PNPM_CONFIG_STORE_DIR, "string");
  assert.equal(
    environment.PNPM_CONFIG_NPMRC_AUTH_FILE,
    LOCAL_DEVELOPMENT_PATHS.runtimePnpmAuthFile,
  );
  assert(
    !relative(tmpdir(), LOCAL_DEVELOPMENT_PATHS.runtimeRoot).startsWith(".."),
  );
  assert(
    relative(
      LOCAL_DEVELOPMENT_PATHS.repositoryRoot,
      LOCAL_DEVELOPMENT_PATHS.runtimeRoot,
    ).startsWith(".."),
  );
  for (const secret of [
    "CLOUDFLARE_API_TOKEN",
    "SENTRY_AUTH_TOKEN",
    "GOOGLE_CLIENT_SECRET",
    "AI_API_KEY",
    "EMAIL_PASSWORD",
    "NODE_OPTIONS",
  ]) {
    assert.equal(environment[secret], undefined);
  }
});

test("supervisor CLI accepts exactly one known mode", () => {
  assert.deepEqual(validateSupervisorCliArguments(["fast"]), []);
  assert.deepEqual(validateSupervisorCliArguments(["workers"]), []);
  assert.equal(validateSupervisorCliArguments([]).length, 1);
  assert.equal(validateSupervisorCliArguments(["fast", "extra"]).length, 1);
  assert.equal(validateSupervisorCliArguments(["remote"]).length, 1);
});

test("port preflight reports the exact occupied listener", async (t) => {
  const occupied = createNetServer();
  await new Promise((resolveListen, rejectListen) => {
    occupied.once("error", rejectListen);
    occupied.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  t.after(
    () => new Promise((resolveClose) => occupied.close(() => resolveClose())),
  );
  const address = occupied.address();
  assert(address && typeof address === "object");

  await assert.rejects(
    assertPortsAvailable([{ label: "test API", port: address.port }]),
    new RegExp(`test API port ${String(address.port)}.*unavailable`),
  );
});

test("readiness accepts a bounded canonical loopback response", async (t) => {
  const server = createHttpServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end('{"status":"ready"}');
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  t.after(() => new Promise((resolveClose) => server.close(resolveClose)));
  const address = server.address();
  assert(address && typeof address === "object");

  await waitForReadiness(
    [
      {
        label: "fixture",
        url: `http://127.0.0.1:${String(address.port)}/ready`,
        verify: async (response) => response.status === 200,
      },
    ],
    { ports: [address.port], readinessTimeoutMs: 500, pollMs: 10 },
  );
});

test("readiness timeout is concrete and the owned child is cleaned up", async () => {
  const port = await unusedLoopbackPort();
  const children = new SupervisedChildren({
    stdout: quietStream,
    stderr: quietStream,
    shutdownGraceMs: 100,
  });
  const child = children.start(
    fixtureSpecification(
      "sleeping fixture",
      "setInterval(() => {}, 1000); process.on('SIGTERM', () => process.exit(0));",
    ),
  );
  try {
    await assert.rejects(
      waitForReadiness(
        [
          {
            label: "missing fixture",
            url: `http://127.0.0.1:${String(port)}/ready`,
            verify: async () => true,
          },
        ],
        {
          childRecord: child,
          fetchImpl: async () => {
            throw new Error("fixture unavailable");
          },
          ports: [port],
          readinessTimeoutMs: 50,
          pollMs: 5,
        },
      ),
      /Timed out after 50ms.*fixture unavailable/,
    );
  } finally {
    await children.stopAll();
  }
  assert.equal(child.settled, true);
});

test("child exit before readiness is reported with its exit code", async () => {
  const port = await unusedLoopbackPort();
  const children = new SupervisedChildren({
    stdout: quietStream,
    stderr: quietStream,
  });
  const child = children.start(
    fixtureSpecification("failed fixture", "process.exit(9);"),
  );
  try {
    await assert.rejects(
      waitForReadiness(
        [
          {
            label: "failed readiness",
            url: `http://127.0.0.1:${String(port)}`,
            verify: async () => true,
          },
        ],
        {
          childRecord: child,
          fetchImpl: async () => {
            throw new Error("not listening");
          },
          ports: [port],
          readinessTimeoutMs: 500,
          pollMs: 10,
        },
      ),
      /failed fixture exited before readiness: exit code 9/,
    );
  } finally {
    await children.stopAll();
  }
});

function readinessFixtureRecord(label, output = "") {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  return {
    child,
    exited: false,
    label,
    outcome: null,
    output,
  };
}

function controlledTimer() {
  const token = Object.freeze({});
  let callback;
  let clearCount = 0;
  let scheduledDelayMs;
  return {
    advanceTo(elapsedMs) {
      assert(Number.isFinite(scheduledDelayMs));
      assert(elapsedMs >= 0 && elapsedMs <= scheduledDelayMs);
      if (elapsedMs === scheduledDelayMs) callback();
    },
    clearTimeoutImpl(actualToken) {
      assert.equal(actualToken, token);
      clearCount += 1;
    },
    fire() {
      assert(callback, "controlled readiness timer must be scheduled");
      callback();
    },
    get clearCount() {
      return clearCount;
    },
    get scheduledDelayMs() {
      return scheduledDelayMs;
    },
    setTimeoutImpl(scheduledCallback, delayMs) {
      callback = scheduledCallback;
      scheduledDelayMs = delayMs;
      return token;
    },
  };
}

test("child readiness accepts buffered and split exact marker lines and disposes resources", async () => {
  const marker = childReadyMarker("STREAM");
  const buffered = readinessFixtureRecord(
    "buffered fixture",
    `unrelated output\n${marker}\n`,
  );
  const bufferedTimer = controlledTimer();
  await waitForChildReady(buffered, {
    marker,
    ...bufferedTimer,
    timeoutMs: 500,
  });
  assert.equal(bufferedTimer.clearCount, 1);
  assert.equal(buffered.child.stdout.listenerCount("data"), 0);
  assert.equal(buffered.child.listenerCount("error"), 0);
  assert.equal(buffered.child.listenerCount("exit"), 0);

  const split = readinessFixtureRecord("split fixture");
  const splitTimer = controlledTimer();
  const ready = waitForChildReady(split, {
    marker,
    ...splitTimer,
    timeoutMs: 500,
  });
  split.child.stdout.emit("data", `noise\n${marker.slice(0, 12)}`);
  split.child.stdout.emit("data", `${marker.slice(12)}\nextra output\n`);
  await ready;
  assert.equal(splitTimer.clearCount, 1);
  assert.equal(split.child.stdout.listenerCount("data"), 0);
  assert.equal(split.child.listenerCount("error"), 0);
  assert.equal(split.child.listenerCount("exit"), 0);

  const nearBound = readinessFixtureRecord("near-bound fixture");
  const nearBoundTimer = controlledTimer();
  const nearBoundReady = waitForChildReady(nearBound, {
    marker,
    ...nearBoundTimer,
    timeoutMs: CHILD_READY_TIMEOUT_MS,
  });
  assert.equal(nearBoundTimer.scheduledDelayMs, 5_000);
  nearBoundTimer.advanceTo(4_999);
  nearBound.child.stdout.emit("data", `${marker}\n`);
  await nearBoundReady;
  assert.equal(nearBoundTimer.clearCount, 1);
  assert.equal(nearBound.child.stdout.listenerCount("data"), 0);
  assert.equal(nearBound.child.listenerCount("error"), 0);
  assert.equal(nearBound.child.listenerCount("exit"), 0);
});

test("child readiness rejects altered output, child errors, and timeouts with disposal", async () => {
  const marker = childReadyMarker("NEGATIVE");
  const altered = readinessFixtureRecord("altered split fixture");
  const alteredTimer = controlledTimer();
  const alteredReady = waitForChildReady(altered, {
    marker,
    ...alteredTimer,
    timeoutMs: 50,
  });
  altered.child.stdout.emit("data", `${marker.slice(0, 10)}`);
  altered.child.stdout.emit("data", `X${marker.slice(11)}\n`);
  alteredTimer.fire();
  await assert.rejects(alteredReady, /altered split fixture.*within 50ms/);
  assert.equal(alteredTimer.clearCount, 1);
  assert.equal(altered.child.stdout.listenerCount("data"), 0);
  assert.equal(altered.child.listenerCount("error"), 0);
  assert.equal(altered.child.listenerCount("exit"), 0);

  const errored = readinessFixtureRecord("errored fixture");
  const errorTimer = controlledTimer();
  const errorReady = waitForChildReady(errored, {
    marker,
    ...errorTimer,
    timeoutMs: 50,
  });
  errored.child.emit("error", new Error("synthetic spawn failure"));
  await assert.rejects(
    errorReady,
    /errored fixture errored before readiness: synthetic spawn failure/,
  );
  assert.equal(errorTimer.clearCount, 1);
  assert.equal(errored.child.stdout.listenerCount("data"), 0);
  assert.equal(errored.child.listenerCount("error"), 0);
  assert.equal(errored.child.listenerCount("exit"), 0);

  const exited = readinessFixtureRecord("exited fixture");
  const exitTimer = controlledTimer();
  const exitReady = waitForChildReady(exited, {
    marker,
    ...exitTimer,
    timeoutMs: 50,
  });
  exited.child.emit("exit", 7, null);
  await assert.rejects(
    exitReady,
    /exited fixture exited before readiness: exit code 7/,
  );
  assert.equal(exitTimer.clearCount, 1);
  assert.equal(exited.child.stdout.listenerCount("data"), 0);
  assert.equal(exited.child.listenerCount("error"), 0);
  assert.equal(exited.child.listenerCount("exit"), 0);
});

for (const readinessNegative of [
  {
    label: "missing marker fixture",
    source:
      "setInterval(() => {}, 1000); process.on('SIGTERM', () => process.exit(0));",
    expected: /missing marker fixture.*within 50ms/,
  },
  {
    label: "wrong marker fixture",
    source:
      "setInterval(() => {}, 1000); process.on('SIGTERM', () => process.exit(0)); process.stdout.write('WRONG_READY_MARKER\\n');",
    expected: /wrong marker fixture.*within 50ms/,
  },
  {
    label: "early exit fixture",
    source: "process.exit(9);",
    expected: /early exit fixture exited before readiness: exit code 9/,
  },
]) {
  test(`${readinessNegative.label} rejects bounded readiness and settles`, async () => {
    const children = new SupervisedChildren({
      stdout: quietStream,
      stderr: quietStream,
      shutdownGraceMs: 100,
    });
    const child = children.start(
      fixtureSpecification(readinessNegative.label, readinessNegative.source),
    );
    try {
      await assert.rejects(
        waitForChildReady(child, {
          marker: childReadyMarker("NEGATIVE"),
          timeoutMs: 50,
        }),
        readinessNegative.expected,
      );
    } finally {
      await children.stopAll();
    }
    assert.equal(child.settled, true);
  });
}

test("signal readiness controls fail closed under disposable mutations", () => {
  for (const [signal, expectedCode] of [
    ["SIGINT", 23],
    ["SIGTERM", 24],
  ]) {
    const fixture = signalFixture(signal, expectedCode);
    const markerToken = `process.stdout.write(${JSON.stringify(`${fixture.marker}\n`)});`;

    assert.throws(
      () =>
        assertSignalFixtureSource(
          fixture.source.replace(markerToken, ""),
          fixture,
        ),
      /must emit its exact marker once/,
    );
    assert.throws(
      () =>
        assertSignalFixtureSource(
          fixture.source.replace(fixture.marker, `${fixture.marker}_RENAMED`),
          fixture,
        ),
      /must emit its exact marker once/,
    );
    assert.throws(
      () =>
        assertSignalFixtureSource(
          `${markerToken} ${fixture.source.replace(markerToken, "")}`,
          fixture,
        ),
      /must register its handler before marker emission/,
    );
    assert.throws(
      () =>
        assertSignalTestCase({
          ...fixture,
          readinessStrategy: async () => delay(75),
        }),
      /must use waitForChildReady instead of a fixed delay/,
    );
    assert.throws(
      () =>
        assertSignalTestCase({ ...fixture, expectedCode: expectedCode + 1 }),
      /must retain its expected exit code/,
    );
  }

  const fixedDelayMutation = runOwnedChildSignalCase
    .toString()
    .replace("await fixture.readinessStrategy(child, {", "await delay(75);");
  assert.throws(
    () => assertSignalHarnessSource(fixedDelayMutation),
    /must not use the fixed 75-ms delay/,
  );
});

function assertSignalHarnessSource(source) {
  assert.equal(
    occurrenceCount(source, "await delay(75)"),
    0,
    "signal harness must not use the fixed 75-ms delay",
  );
  assert.equal(
    occurrenceCount(source, "await fixture.readinessStrategy(child, {"),
    1,
    "signal harness must await its readiness strategy exactly once",
  );
}

async function runOwnedChildSignalCase(fixture) {
  const children = new SupervisedChildren({
    stdout: quietStream,
    stderr: quietStream,
    shutdownGraceMs: 500,
  });
  const child = children.start(
    fixtureSpecification(`${fixture.signal} fixture`, fixture.source),
  );
  const requestedSignals = [];
  const originalKill = child.child.kill;
  child.child.kill = function recordRequestedSignal(requestedSignal) {
    requestedSignals.push(requestedSignal);
    return originalKill.call(this, requestedSignal);
  };
  try {
    await fixture.readinessStrategy(child, {
      marker: fixture.marker,
      timeoutMs: CHILD_READY_TIMEOUT_MS,
    });
    const forced = await children.stopAll(fixture.signal);
    await child.exit;
    assert.equal(forced, false);
    assert.deepEqual(requestedSignals, [fixture.signal]);
    assert.equal(child.outcome.code, fixture.expectedCode);
  } finally {
    if (!child.settled) await children.stopAll();
    child.child.kill = originalKill;
  }
}

for (const [signal, expectedCode] of [
  ["SIGINT", 23],
  ["SIGTERM", 24],
]) {
  test(`owned children receive ${signal} once and settle`, async () => {
    const fixture = signalFixture(signal, expectedCode);
    assertSignalHarnessSource(runOwnedChildSignalCase.toString());
    await runOwnedChildSignalCase(fixture);
  });
}

test("shutdown escalates after the bounded grace period", async () => {
  const children = new SupervisedChildren({
    stdout: quietStream,
    stderr: quietStream,
    shutdownGraceMs: 30,
    forceKillWaitMs: 500,
  });
  const child = children.start(
    fixtureSpecification(
      "stubborn fixture",
      "setInterval(() => {}, 1000); process.on('SIGTERM', () => {});",
    ),
  );
  await delay(75);
  const forced = await children.stopAll("SIGTERM");
  await child.exit;
  assert.equal(forced, true);
  assert.equal(child.outcome.signal, "SIGKILL");
});

test("supervised child waits for close and collects split diagnostics after exit", async () => {
  const fixtureChild = new EventEmitter();
  fixtureChild.stdout = new EventEmitter();
  fixtureChild.stderr = new EventEmitter();
  fixtureChild.exitCode = null;
  fixtureChild.signalCode = null;
  fixtureChild.kill = () => true;
  const children = new SupervisedChildren({
    spawnImpl: () => fixtureChild,
    stdout: quietStream,
    stderr: quietStream,
  });
  const record = children.start(fixtureSpecification("late fixture", ""));

  fixtureChild.emit("exit", 0, null);
  await record.exit;
  assert.equal(record.exited, true);
  assert.equal(record.settled, false);
  fixtureChild.stderr.emit("data", "UnhandledPromise");
  fixtureChild.stderr.emit("data", "Rejection: emitted after exit\n");
  fixtureChild.stdout.emit("close");
  fixtureChild.stderr.emit("close");
  fixtureChild.emit("close", 0, null);
  await record.close;

  assert.equal(record.settled, true);
  assert.match(record.diagnostics.join("\n"), /emitted after exit/);
});

test("an exited web child propagates failure and stops its API sibling", async () => {
  const apiPort = await unusedLoopbackPort();
  const webPort = await unusedLoopbackPort();
  const children = new SupervisedChildren({
    stdout: quietStream,
    stderr: quietStream,
    shutdownGraceMs: 500,
  });
  const apiSource = `
    const http = require('node:http');
    const port = Number(process.argv[1]);
    const server = http.createServer((request, response) => {
      response.setHeader('content-type', 'application/json');
      if (request.url === '/healthz') response.end(JSON.stringify({ status: 'ok', database: 'ok' }));
      else if (request.url === '/configz') response.end(JSON.stringify({ environment: 'local', release: 'local', runtime: 'cloudflare-workers', data: 'd1', migrationStatus: 'full-api-parity' }));
      else { response.statusCode = 404; response.end('{}'); }
    });
    server.listen(port, '127.0.0.1');
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
  `;
  const webSource = `
    const http = require('node:http');
    const port = Number(process.argv[1]);
    const server = http.createServer((_request, response) => {
      response.end('ready');
      setTimeout(() => process.exit(7), 50);
    });
    server.listen(port, '127.0.0.1');
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
  `;
  const plan = {
    mode: "fast",
    preparation: [],
    ports: [
      { label: "web", port: webPort },
      { label: "api", port: apiPort },
    ],
    api: fixtureSpecification("api fixture", apiSource, [apiPort]),
    web: fixtureSpecification("web fixture", webSource, [webPort]),
    apiReadiness: [
      {
        label: "API health",
        url: `http://127.0.0.1:${String(apiPort)}/healthz`,
        verify: async (response) => {
          const body = await response.json();
          return response.status === 200 && body.database === "ok";
        },
      },
      {
        label: "API config",
        url: `http://127.0.0.1:${String(apiPort)}/configz`,
        verify: async (response) => {
          const body = await response.json();
          return response.status === 200 && body.environment === "local";
        },
      },
    ],
    webReadiness: [
      {
        label: "web",
        url: `http://127.0.0.1:${String(webPort)}`,
        verify: async (response) => response.status === 200,
      },
    ],
  };

  const exitCode = await runLocalDevelopment("fast", {
    plan,
    children,
    portCheck: async () => {},
    runMigration: () => ({ status: 0 }),
    stdout: quietStream,
    stderr: quietStream,
    readinessTimeoutMs: 2_000,
    registerSignals: false,
  });

  assert.equal(exitCode, 7);
  assert.equal(children.records.length, 2);
  assert(children.records.every((record) => record.settled));
});

test("noncanonical readiness URLs fail before making a request", async () => {
  let requested = false;
  await assert.rejects(
    waitForReadiness(
      [
        {
          label: "remote",
          url: "https://example.com/ready",
          verify: async () => true,
        },
      ],
      {
        fetchImpl: async () => {
          requested = true;
          return new Response(null, { status: 200 });
        },
      },
    ),
    /canonical loopback HTTP/,
  );
  assert.equal(requested, false);
});
