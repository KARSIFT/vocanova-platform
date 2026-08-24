import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

import {
  EXPECTED_WRANGLER_VERSION,
  LOCAL_D1_BINDING,
  LOCAL_D1_PATHS,
  buildLocalD1MigrationInvocation,
  localOnlyEnvironment,
  runLocalD1Migrations,
  validateLocalD1CliArguments,
} from "../../apps/api-worker/scripts/local-d1-init.mjs";

function temporaryDirectory(t, prefix) {
  const directory = mkdtempSync(resolve(tmpdir(), prefix));
  t.after(() => rmSync(directory, { force: true, recursive: true }));
  return directory;
}

function filesUnder(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(path));
    else files.push(path);
  }
  return files;
}

function sqliteFiles(stateDirectory) {
  try {
    return filesUnder(stateDirectory).filter(
      (path) =>
        path.endsWith(".sqlite") &&
        path.includes("/v3/d1/") &&
        !path.endsWith("/metadata.sqlite"),
    );
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT")
      return [];
    throw error;
  }
}

function databaseEvidence(stateDirectory) {
  const databases = sqliteFiles(stateDirectory);
  assert.equal(
    databases.length,
    1,
    `expected one local D1 file: ${databases.join(", ")}`,
  );
  const database = new DatabaseSync(databases[0], { readOnly: true });
  try {
    return {
      migrationCount: database
        .prepare("SELECT COUNT(*) AS count FROM d1_migrations")
        .get().count,
      health: database.prepare("PRAGMA quick_check").get().quick_check,
      rollbackTable: database
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'should_rollback'",
        )
        .get(),
    };
  } finally {
    database.close();
  }
}

function requireSuccess(result, label) {
  assert.equal(
    result.status,
    0,
    `${label}\nstdout:\n${result.stdout ?? ""}\nstderr:\n${result.stderr ?? ""}`,
  );
  assert.equal(result.signal, null);
}

test("local D1 command uses the locked CLI, DB, local config, and explicit state", () => {
  const invocation = buildLocalD1MigrationInvocation();
  assert.equal(EXPECTED_WRANGLER_VERSION, "4.125.0");
  assert.equal(LOCAL_D1_BINDING, "DB");
  assert.equal(invocation.command, process.execPath);
  assert.deepEqual(invocation.args.slice(1, 5), [
    "d1",
    "migrations",
    "apply",
    "DB",
  ]);
  assert.ok(invocation.args.includes("--local"));
  assert.ok(invocation.args.includes("--config"));
  assert.ok(invocation.args.includes(LOCAL_D1_PATHS.canonicalConfigPath));
  assert.ok(invocation.args.includes("--persist-to"));
  assert.ok(invocation.args.includes(LOCAL_D1_PATHS.canonicalStateDirectory));
  assert.ok(!invocation.args.includes("--remote"));
  assert.ok(!invocation.args.includes("--preview"));
  assert.ok(!invocation.args.includes("--env"));
});

test("local D1 environment strips credentials and disables telemetry", () => {
  const environment = localOnlyEnvironment({
    PATH: "/fixture",
    CLOUDFLARE_API_TOKEN: "must-not-survive",
    CLOUDFLARE_ACCOUNT_ID: "must-not-survive",
    WRANGLER_PROFILE: "must-not-survive",
  });
  assert.equal(environment.PATH, "/fixture");
  assert.equal(environment.CI, "true");
  assert.equal(environment.WRANGLER_SEND_METRICS, "false");
  assert.ok(!("CLOUDFLARE_API_TOKEN" in environment));
  assert.ok(!("CLOUDFLARE_ACCOUNT_ID" in environment));
  assert.ok(!("WRANGLER_PROFILE" in environment));
});

test("wrong environment, remote selection, and unsafe state roots fail closed", () => {
  assert.throws(
    () => buildLocalD1MigrationInvocation({ environment: "production" }),
    /non-local environments/,
  );
  assert.throws(
    () => buildLocalD1MigrationInvocation({ remote: true }),
    /remote or preview/,
  );
  assert.throws(
    () =>
      buildLocalD1MigrationInvocation({
        purpose: "test",
        stateDirectory: LOCAL_D1_PATHS.canonicalStateDirectory,
      }),
    /OS-temporary/,
  );

  assert.deepEqual(validateLocalD1CliArguments([]), []);
  for (const args of [
    ["--env", "production"],
    ["--remote"],
    ["--persist-to", "/tmp/unreviewed"],
  ]) {
    const result = spawnSync(
      process.execPath,
      [resolve(LOCAL_D1_PATHS.apiRoot, "scripts/local-d1-init.mjs"), ...args],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /accepts no arguments/);
    assert.doesNotMatch(
      `${result.stdout}\n${result.stderr}`,
      /wrangler 4\.125/,
    );
  }
});

test("empty and repeated local D1 initialization is migrated, healthy, and isolated", (t) => {
  const firstState = temporaryDirectory(t, "vocanova-d1-first-");
  const isolatedState = temporaryDirectory(t, "vocanova-d1-isolated-");
  assert.deepEqual(sqliteFiles(firstState), []);
  assert.deepEqual(sqliteFiles(isolatedState), []);

  const options = {
    purpose: "test",
    stateDirectory: firstState,
    stdio: "pipe",
  };
  requireSuccess(runLocalD1Migrations(options), "empty initialization");
  assert.deepEqual(databaseEvidence(firstState), {
    migrationCount: 7,
    health: "ok",
    rollbackTable: undefined,
  });

  requireSuccess(runLocalD1Migrations(options), "repeated initialization");
  assert.deepEqual(databaseEvidence(firstState), {
    migrationCount: 7,
    health: "ok",
    rollbackTable: undefined,
  });
  assert.deepEqual(sqliteFiles(isolatedState), []);

  requireSuccess(
    runLocalD1Migrations({
      purpose: "test",
      stateDirectory: isolatedState,
      stdio: "pipe",
    }),
    "isolated initialization",
  );
  assert.deepEqual(databaseEvidence(isolatedState), {
    migrationCount: 7,
    health: "ok",
    rollbackTable: undefined,
  });
  assert.notDeepEqual(sqliteFiles(firstState), sqliteFiles(isolatedState));
});

test("a failed forward migration rolls back while prior migrations survive", (t) => {
  const fixture = temporaryDirectory(t, "vocanova-d1-failure-");
  const stateDirectory = join(fixture, "state");
  const migrationsDirectory = join(fixture, "migrations");
  mkdirSync(migrationsDirectory);
  cpSync(resolve(LOCAL_D1_PATHS.apiRoot, "migrations"), migrationsDirectory, {
    recursive: true,
  });
  const configPath = join(fixture, "wrangler.jsonc");
  writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        name: "vocanova-api-local-migration-fixture",
        compatibility_date: "2026-08-22",
        d1_databases: [
          {
            binding: "DB",
            database_name: "vocanova-local-migration-fixture",
            database_id: "local",
            migrations_dir: "migrations",
            migrations_table: "d1_migrations",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  const options = {
    purpose: "test",
    configPath,
    stateDirectory,
    stdio: "pipe",
  };
  requireSuccess(runLocalD1Migrations(options), "fixture initialization");
  writeFileSync(
    join(migrationsDirectory, "0008_intentional_failure.sql"),
    "CREATE TABLE should_rollback (id INTEGER PRIMARY KEY);\nTHIS IS NOT VALID SQL;\n",
  );
  const failed = runLocalD1Migrations(options);
  assert.notEqual(failed.status, 0);
  assert.match(
    `${failed.stdout}\n${failed.stderr}`,
    /0008_intentional_failure|syntax error/i,
  );
  assert.deepEqual(databaseEvidence(stateDirectory), {
    migrationCount: 7,
    health: "ok",
    rollbackTable: undefined,
  });
});
