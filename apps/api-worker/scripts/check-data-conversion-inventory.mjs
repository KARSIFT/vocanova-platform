import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  DATA_TABLE_BY_NAME,
  DATA_TABLE_NAMES,
} from "../dist/data-conversion/schema.js";

const workerRoot = process.cwd();
const repositoryRoot = path.resolve(workerRoot, "../..");
const postgresRoot = path.join(repositoryRoot, "apps/api/migrations");
const d1Root = path.join(workerRoot, "migrations");

const [postgresSchema, d1Schema] = await Promise.all([
  readSqlDirectory(postgresRoot),
  readSqlDirectory(d1Root),
]);

const postgresTables = extractTables(postgresSchema, [
  "uuid",
  "text",
  "boolean",
  "bytea",
  "integer",
  "timestamptz",
  "date",
  "jsonb",
]);
const d1Tables = extractTables(d1Schema, ["TEXT", "INTEGER"]);

assert.deepEqual(
  [...postgresTables.keys()].sort(),
  [...DATA_TABLE_NAMES].sort(),
  "the conversion contract must cover every active PostgreSQL source table",
);

const allowedD1OnlyTables = [
  "ai_feedback_reports",
  "ai_generation_events",
  "ai_generation_leases",
  "ai_usage_counters",
  "auth_rate_limits",
  "platform_metadata",
];
assert.deepEqual(
  [...d1Tables.keys()].sort(),
  [...DATA_TABLE_NAMES, ...allowedD1OnlyTables].sort(),
  "D1 table inventory drifted from the conversion contract",
);

for (const tableName of DATA_TABLE_NAMES) {
  const spec = DATA_TABLE_BY_NAME.get(tableName);
  assert.ok(spec, `missing conversion spec for ${tableName}`);
  const sourceFields = [
    ...spec.fields.map((field) => field.source),
    ...(spec.sourceOnlyFields ?? []).map((field) => field.source),
  ];
  const targetFields = spec.fields.map((field) => field.target ?? field.source);
  const postgresTable = requireTable(postgresTables, tableName);
  const d1Table = requireTable(d1Tables, tableName);
  assert.deepEqual(
    [...sourceFields].sort(),
    [...postgresTable.keys()].sort(),
    `${tableName}: PostgreSQL export fields drifted`,
  );
  assert.deepEqual(
    [...targetFields].sort(),
    [...d1Table.keys()].sort(),
    `${tableName}: D1 import fields drifted`,
  );
  for (const field of [...spec.fields, ...(spec.sourceOnlyFields ?? [])]) {
    assert.equal(
      postgresTable.get(field.source)?.toLowerCase(),
      postgresTypeFor(field.kind),
      `${tableName}.${field.source}: PostgreSQL field kind drifted`,
    );
  }
  for (const field of spec.fields) {
    const target = field.target ?? field.source;
    assert.equal(
      d1Table.get(target)?.toUpperCase(),
      d1TypeFor(field.kind),
      `${tableName}.${target}: D1 field kind drifted`,
    );
  }
  assert.ok(
    targetFields.length < 100,
    `${tableName}: import exceeds D1's 100-bound-parameter query limit`,
  );
  const upsertSql = `INSERT INTO ${tableName} (${targetFields.join(", ")}) VALUES (${targetFields.map((_, index) => `?${index + 1}`).join(", ")})`;
  assert.ok(
    Buffer.byteLength(upsertSql, "utf8") < 100_000,
    `${tableName}: import exceeds D1's 100,000-byte SQL statement limit`,
  );
}

process.stdout.write(
  `Data conversion inventory: PASS (${DATA_TABLE_NAMES.length} PostgreSQL tables mapped exactly; ${allowedD1OnlyTables.length} D1-only runtime tables classified)\n`,
);

async function readSqlDirectory(directory) {
  const names = (await readdir(directory))
    .filter((name) => name.endsWith(".sql"))
    .sort();
  return (
    await Promise.all(
      names.map((name) => readFile(path.join(directory, name), "utf8")),
    )
  ).join("\n");
}

function extractTables(sql, acceptedTypes) {
  const tables = new Map();
  const accepted = new Set(acceptedTypes.map((type) => type.toLowerCase()));
  const tablePattern =
    /CREATE TABLE\s+([a-z_]+)\s*\(([\s\S]*?)\n\)(?:\s+WITHOUT ROWID)?(?:,\s*STRICT|\s+STRICT)?;/g;
  for (const match of sql.matchAll(tablePattern)) {
    const [, name, body] = match;
    const columns = new Map();
    for (const line of body.split("\n")) {
      const column = line.match(/^\s{2}([a-z_][a-z0-9_]*)\s+([A-Za-z]+)/);
      if (column && accepted.has(column[2].toLowerCase())) {
        columns.set(column[1], column[2]);
      }
    }
    tables.set(name, columns);
  }
  const addColumnPattern =
    /ALTER TABLE\s+(?:IF EXISTS\s+)?([a-z_]+)\s+ADD COLUMN\s+(?:IF NOT EXISTS\s+)?([a-z_][a-z0-9_]*)\s+([A-Za-z]+)/gi;
  for (const match of sql.matchAll(addColumnPattern)) {
    const [, tableName, columnName, type] = match;
    if (!accepted.has(type.toLowerCase())) continue;
    const table = tables.get(tableName);
    assert.ok(table, `ALTER TABLE references unparsed table ${tableName}`);
    assert.ok(
      !table.has(columnName),
      `${tableName}.${columnName} is added twice`,
    );
    table.set(columnName, type);
  }
  return tables;
}

function requireTable(tables, name) {
  const columns = tables.get(name);
  assert.ok(columns, `missing parsed table ${name}`);
  return columns;
}

function postgresTypeFor(kind) {
  return {
    boolean: "boolean",
    bytea: "bytea",
    date: "date",
    integer: "integer",
    json: "jsonb",
    text: "text",
    timestamp: "timestamptz",
    uuid: "uuid",
  }[kind];
}

function d1TypeFor(kind) {
  return kind === "boolean" || kind === "integer" ? "INTEGER" : "TEXT";
}
