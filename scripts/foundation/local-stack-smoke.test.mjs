/* global Headers, Response, URL */

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import {
  LOCAL_STACK_MARKER,
  assertRepositoryTreeUnchanged,
  buildDisposableLocalStackPlan,
  createLocalStackSignalController,
  probeLocalStack,
  readDisposableD1Evidence,
  runLocalStackCycle,
  validateLocalStackCliArguments,
} from "./local-stack-smoke.mjs";
import { runLocalD1Migrations } from "../../apps/api-worker/scripts/local-d1-init.mjs";
import { assertPortsAvailable } from "./local-development-supervisor.mjs";

function temporaryDirectory(t, prefix = "vocanova-local-stack-test-") {
  const directory = mkdtempSync(resolve(tmpdir(), prefix));
  t.after(() => rmSync(directory, { force: true, recursive: true }));
  return directory;
}

function fixturePlan() {
  return {
    api: { label: "api" },
    apiReadiness: [{ label: "API", url: "http://127.0.0.1:8080/healthz" }],
    ports: [
      { label: "web", port: 3000 },
      { label: "api", port: 8080 },
    ],
    web: { label: "web-worker" },
    webReadiness: [{ label: "web", url: "http://127.0.0.1:3000/" }],
  };
}

class FixtureChildren {
  constructor(records = []) {
    this.records = records;
    this.stopSignals = [];
  }

  start(specification) {
    const record = {
      label: specification.label,
      outcome: null,
      settled: false,
    };
    this.records.push(record);
    return record;
  }

  async stopAll(signal) {
    this.stopSignals.push(signal);
    for (const record of this.records) record.settled = true;
  }
}

test("the disposable plan preserves locked local-only topology with OS-temp state", (t) => {
  const state = resolve(temporaryDirectory(t), "state");
  const plan = buildDisposableLocalStackPlan(state, {
    PATH: process.env.PATH,
    CLOUDFLARE_API_TOKEN: "must-not-survive",
  });
  for (const child of [plan.api, plan.web]) {
    assert.ok(child.args.includes("--local"));
    assert.ok(child.args.includes("--config"));
    assert.ok(child.args.includes("--persist-to"));
    assert.ok(child.args.includes(state));
    assert.ok(!child.args.includes("--remote"));
    assert.ok(!child.args.includes("--env"));
    assert.ok(!("CLOUDFLARE_API_TOKEN" in child.env));
  }
  assert.equal(plan.api.args[plan.api.args.indexOf("--port") + 1], "8080");
  assert.equal(plan.web.args[plan.web.args.indexOf("--port") + 1], "3000");
  assert.throws(
    () => buildDisposableLocalStackPlan(resolve(process.cwd(), ".wrangler")),
    /non-disposable/,
  );
});

test("local D1 migration execution rejects an unbounded timeout override", () => {
  assert.throws(
    () => runLocalD1Migrations({ timeoutMs: Number.POSITIVE_INFINITY }),
    /positive integer/,
  );
});

test("disposable D1 evidence reports the migration ledger and integrity", (t) => {
  const root = temporaryDirectory(t);
  const databaseDirectory = resolve(root, "v3/d1/miniflare-D1DatabaseObject");
  mkdirSync(databaseDirectory, { recursive: true });
  const database = new DatabaseSync(
    resolve(databaseDirectory, "fixture.sqlite"),
  );
  database.exec(
    "CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY); INSERT INTO d1_migrations VALUES (1), (2);",
  );
  database.close();
  assert.deepEqual(readDisposableD1Evidence(root), {
    health: "ok",
    migrationCount: 2,
  });
});

test("local probes cover direct API, static, SSR, middleware, and service binding", async () => {
  const config = {
    data: "d1",
    environment: "local",
    migrationStatus: "full-api-parity",
    release: "local",
    runtime: "cloudflare-workers",
  };
  const fetchImpl = (value, init = {}) => {
    const url = new URL(value);
    if (url.port === "8080" && url.pathname === "/healthz") {
      return Promise.resolve(Response.json({ status: "ok", database: "ok" }));
    }
    if (url.port === "8080" && url.pathname === "/configz") {
      return Promise.resolve(Response.json(config));
    }
    if (url.port === "8080" && url.pathname === "/openapi.json") {
      return Promise.resolve(
        Response.json({ openapi: "3.1.0", paths: { "/healthz": {} } }),
      );
    }
    if (url.port === "8080" && url.pathname === "/api/v1/me") {
      return Promise.resolve(
        Response.json({ title: "Unauthorized" }, { status: 401 }),
      );
    }
    if (url.pathname === "/") {
      return Promise.resolve(
        new Response("Vocanova web foundation", { status: 200 }),
      );
    }
    if (url.pathname === "/signin") {
      return Promise.resolve(
        new Response("Sign in to Vocanova", { status: 200 }),
      );
    }
    if (url.pathname === "/discover") {
      return Promise.resolve(
        new Response(null, {
          headers: {
            location: "http://127.0.0.1:3000/signin?returnTo=%2Fdiscover",
          },
          status: 307,
        }),
      );
    }
    if (url.pathname === "/api/local-stack") {
      if (
        new Headers(init.headers).get("x-vocanova-local-stack") !==
        LOCAL_STACK_MARKER
      ) {
        return Promise.resolve(new Response(null, { status: 404 }));
      }
      return Promise.resolve(
        Response.json(config, {
          headers: {
            "x-vocanova-local-stack-marker": LOCAL_STACK_MARKER,
            "x-vocanova-local-stack-transport": "service-binding",
          },
        }),
      );
    }
    throw new Error(`unexpected fixture URL: ${url}`);
  };
  const evidence = await probeLocalStack(fetchImpl);
  assert.equal(evidence.bindingMarker, LOCAL_STACK_MARKER);
  assert.equal(evidence.middlewareStatus, 307);
  assert.equal(evidence.webStatus, 200);
});

test("an occupied required port fails before local children can start", async (t) => {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen({ host: "127.0.0.1", port: 0 }, resolveListen);
  });
  t.after(
    () =>
      new Promise((resolveClose) => {
        if (!server.listening) return resolveClose();
        server.close(() => resolveClose());
      }),
  );
  const address = server.address();
  assert.ok(address && typeof address === "object");
  await assert.rejects(
    assertPortsAvailable([{ label: "fixture", port: address.port }]),
    /unavailable/,
  );
});

test("partial startup and probe failure stop every started child", async () => {
  const children = new FixtureChildren();
  let readinessCall = 0;
  await assert.rejects(
    runLocalStackCycle(fixturePlan(), {
      children,
      waitForReadinessImpl: () => {
        readinessCall += 1;
        return readinessCall === 1
          ? Promise.resolve()
          : Promise.reject(new Error("web exited before readiness"));
      },
    }),
    /web exited/,
  );
  assert.deepEqual(children.stopSignals, ["SIGTERM"]);
  assert.ok(children.records.every((record) => record.settled));

  const probeChildren = new FixtureChildren();
  await assert.rejects(
    runLocalStackCycle(fixturePlan(), {
      children: probeChildren,
      probeImpl: () => Promise.reject(new Error("binding marker missing")),
      waitForReadinessImpl: () => Promise.resolve(),
    }),
    /binding marker missing/,
  );
  assert.deepEqual(probeChildren.stopSignals, ["SIGTERM"]);
  assert.ok(probeChildren.records.every((record) => record.settled));
});

test("SIGINT and SIGTERM request one bounded child cleanup", async () => {
  for (const signal of ["SIGINT", "SIGTERM"]) {
    const emitter = new EventEmitter();
    const children = new FixtureChildren();
    const controller = createLocalStackSignalController({
      getChildren: () => children,
      processLike: emitter,
    });
    emitter.emit(signal);
    emitter.emit(signal === "SIGINT" ? "SIGTERM" : "SIGINT");
    await Promise.resolve();
    assert.equal(controller.getRequestedSignal(), signal);
    assert.deepEqual(children.stopSignals, [signal]);
    controller.dispose();
  }
});

test("tree comparison rejects tracked, untracked, or instruction drift", () => {
  const baseline = { instructions: ["AGENTS.md"], status: "" };
  assert.doesNotThrow(() => assertRepositoryTreeUnchanged(baseline, baseline));
  assert.throws(
    () =>
      assertRepositoryTreeUnchanged(baseline, {
        instructions: ["AGENTS.md"],
        status: "?? apps/web/generated.txt\n",
      }),
    /visible repository tree/,
  );
  assert.throws(
    () =>
      assertRepositoryTreeUnchanged(baseline, {
        instructions: ["AGENTS.md", "apps/web/AGENTS.md"],
        status: "",
      }),
    /instruction files/,
  );
});

test("the local-stack entry point accepts no topology override", () => {
  assert.deepEqual(validateLocalStackCliArguments([]), []);
  assert.match(validateLocalStackCliArguments(["--remote"])[0], /no arguments/);
});
