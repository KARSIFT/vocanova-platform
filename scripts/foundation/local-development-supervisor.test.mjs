/* global Response, setTimeout */

import assert from "node:assert/strict";
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

  assert.equal(workers.preparation.length, 3);
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

for (const [signal, expectedCode] of [
  ["SIGINT", 23],
  ["SIGTERM", 24],
]) {
  test(`owned children receive ${signal} once and settle`, async () => {
    const children = new SupervisedChildren({
      stdout: quietStream,
      stderr: quietStream,
      shutdownGraceMs: 500,
    });
    const child = children.start(
      fixtureSpecification(
        `${signal} fixture`,
        `setInterval(() => {}, 1000); process.on('${signal}', () => process.exit(${String(expectedCode)}));`,
      ),
    );
    await delay(75);
    const forced = await children.stopAll(signal);
    await child.exit;
    assert.equal(forced, false);
    assert.equal(child.outcome.code, expectedCode);
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
