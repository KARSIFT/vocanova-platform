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
    migrationCount: 11,
    health: "ok",
    rollbackTable: undefined,
  });

  requireSuccess(runLocalD1Migrations(options), "repeated initialization");
  assert.deepEqual(databaseEvidence(firstState), {
    migrationCount: 11,
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
    migrationCount: 11,
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
    join(migrationsDirectory, "0011_intentional_failure.sql"),
    "CREATE TABLE should_rollback (id INTEGER PRIMARY KEY);\nTHIS IS NOT VALID SQL;\n",
  );
  const failed = runLocalD1Migrations(options);
  assert.notEqual(failed.status, 0);
  assert.match(
    `${failed.stdout}\n${failed.stderr}`,
    /0011_intentional_failure|syntax error/i,
  );
  assert.deepEqual(databaseEvidence(stateDirectory), {
    migrationCount: 11,
    health: "ok",
    rollbackTable: undefined,
  });
});

for (const collision of ["none", "natural-key", "stable-id"]) {
  test(`catalog upgrade preserves learner records with ${collision} collision`, (t) => {
    const fixture = temporaryDirectory(t, "vocanova-catalog-upgrade-");
    const stateDirectory = join(fixture, "state");
    const migrationsDirectory = join(fixture, "migrations");
    const catalogMigration = "0011_starter_vocabulary_catalog.sql";
    cpSync(resolve(LOCAL_D1_PATHS.apiRoot, "migrations"), migrationsDirectory, {
      recursive: true,
    });
    rmSync(join(migrationsDirectory, catalogMigration));
    const configPath = join(fixture, "wrangler.jsonc");
    writeFileSync(
      configPath,
      JSON.stringify({
        name: "catalog-upgrade",
        d1_databases: [
          {
            binding: "DB",
            database_name: "catalog-upgrade",
            database_id: "local",
            migrations_dir: "migrations",
            migrations_table: "d1_migrations",
          },
        ],
      }),
    );
    const options = {
      purpose: "test",
      configPath,
      stateDirectory,
      stdio: "pipe",
    };
    requireSuccess(runLocalD1Migrations(options), "pre-catalog initialization");
    const database = new DatabaseSync(sqliteFiles(stateDirectory)[0]);
    database.exec(`
      PRAGMA foreign_keys = ON;
      INSERT INTO users (id,email,status,onboarding_status,created_at,updated_at)
      VALUES ('a9000000-0000-4000-8000-000000000099','existing@example.test','active','completed','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');
      INSERT INTO canonical_words (id,text,normalized_text,word_type,language_code,status,difficulty_level,created_at,updated_at)
      VALUES ('a9000000-0000-4000-8000-000000000098','existing word','existing word','word','en','active','b1','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');
      INSERT INTO word_meanings (id,word_id,part_of_speech,short_definition,meaning_order,status,created_at,updated_at)
      VALUES ('a9000000-0000-4000-8000-000000000097','a9000000-0000-4000-8000-000000000098','noun','Preserved editorial definition',1,'active','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');
      INSERT INTO user_words (id,user_id,meaning_id,status,source,review_step,next_review_at,added_at,created_at,updated_at)
      VALUES ('a9000000-0000-4000-8000-000000000096','a9000000-0000-4000-8000-000000000099','a9000000-0000-4000-8000-000000000097','reviewing','manual',3,'2026-08-25T09:00:00.000Z','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');
    `);
    if (collision === "natural-key") {
      database.exec(`INSERT INTO canonical_words (id,text,normalized_text,word_type,language_code,status,difficulty_level,created_at,updated_at)
        VALUES ('a9000000-0000-4000-8000-000000000095','make a mistake','make a mistake','phrase','en','active','a2','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');`);
    }
    if (collision === "stable-id") {
      // A collision in the final notes insert must roll back preceding catalog tables too.
      database.exec(`INSERT INTO usage_notes (id,meaning_id,note_type,note_text,note_order,status,created_at,updated_at)
        VALUES ('a5000000-0000-4000-8000-000000000032','a9000000-0000-4000-8000-000000000097','other','Preserved editorial note',1,'active','2026-08-22T00:00:00.000Z','2026-08-22T00:00:00.000Z');`);
    }
    const tables = [
      "users",
      "canonical_words",
      "word_meanings",
      "user_words",
      "usage_notes",
    ];
    const before = new Map(
      tables.map((table) => [
        table,
        database.prepare(`SELECT * FROM ${table} ORDER BY id`).all(),
      ]),
    );
    database.close();
    cpSync(
      resolve(LOCAL_D1_PATHS.apiRoot, "migrations", catalogMigration),
      join(migrationsDirectory, catalogMigration),
    );
    const result = runLocalD1Migrations(options);
    if (collision === "none") requireSuccess(result, "catalog upgrade");
    else {
      assert.notEqual(result.status, 0);
      assert.match(
        `${result.stdout}\n${result.stderr}`,
        /UNIQUE constraint failed/,
      );
    }
    const check = new DatabaseSync(sqliteFiles(stateDirectory)[0], {
      readOnly: true,
    });
    for (const table of tables) {
      const rows = check.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
      const priorRows = before.get(table);
      const preserved =
        collision === "none"
          ? rows.filter((row) => priorRows.some((prior) => prior.id === row.id))
          : rows;
      assert.deepEqual(
        preserved,
        priorRows,
        `${table} records must remain unchanged`,
      );
    }
    assert.equal(
      check.prepare("SELECT COUNT(*) AS count FROM d1_migrations").get().count,
      collision === "none" ? 11 : 10,
    );
    for (const [table, expected] of [
      ["journey_situations", 4],
      ["journey_words", 32],
      ["word_examples", 32],
    ]) {
      assert.equal(
        check.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count,
        collision === "none" ? expected : 0,
      );
    }
    assert.deepEqual(check.prepare("PRAGMA foreign_key_check").all(), []);
    check.close();
  });
}
