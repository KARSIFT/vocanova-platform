import assert from "node:assert/strict";
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
  assert.deepEqual(
    [...sourceFields].sort(),
    [...requireTable(postgresTables, tableName)].sort(),
    `${tableName}: PostgreSQL export fields drifted`,
  );
  assert.deepEqual(
    [...targetFields].sort(),
    [...requireTable(d1Tables, tableName)].sort(),
    `${tableName}: D1 import fields drifted`,
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
  const tablePattern =
    /CREATE TABLE\s+([a-z_]+)\s*\(([\s\S]*?)\n\)(?:\s+WITHOUT ROWID)?(?:,\s*STRICT|\s+STRICT)?;/g;
  for (const match of sql.matchAll(tablePattern)) {
    const [, name, body] = match;
    const columns = [];
    for (const line of body.split("\n")) {
      const column = line.match(/^\s{2}([a-z_][a-z0-9_]*)\s+([A-Za-z]+)/);
      if (column && acceptedTypes.includes(column[2])) columns.push(column[1]);
    }
    tables.set(name, columns);
  }
  return tables;
}

function requireTable(tables, name) {
  const columns = tables.get(name);
  assert.ok(columns, `missing parsed table ${name}`);
  return columns;
}
