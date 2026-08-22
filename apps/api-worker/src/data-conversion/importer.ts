import {
  canonicalJson,
  D1_IMPORT_MAX_ROW_BYTES,
  estimateUpsertChunkBytes,
  estimateUpsertStatementBytes,
  sha256,
  type D1ImportPlan,
  type D1ImportRow,
} from "./converter.js";
import {
  DATA_RECONCILIATION_SCHEMA_VERSION,
  DATA_TABLE_BY_NAME,
  DATA_TABLE_NAMES,
  type DataTableName,
  type TableSpec,
} from "./schema.js";

type Checkpoint = Readonly<{
  schemaVersion: "vocanova-d1-import-checkpoint-v1";
  planChecksum: string;
  nextChunk: number;
  completed: boolean;
}>;

export type ImportResult = Readonly<{
  exportId: string;
  planChecksum: string;
  resumedFromChunk: number;
  appliedChunks: number;
  appliedBatches: number;
  totalChunks: number;
  completed: boolean;
}>;

export type TableReconciliation = Readonly<{
  sourceCount: number;
  excludedCount: number;
  expectedCount: number;
  actualCount: number;
  expectedChecksum: string;
  actualChecksum: string;
  matches: boolean;
}>;

export type ReconciliationReport = Readonly<{
  schemaVersion: typeof DATA_RECONCILIATION_SCHEMA_VERSION;
  exportId: string;
  planChecksum: string;
  status: "pass" | "fail";
  tables: Readonly<Record<DataTableName, TableReconciliation>>;
  foreignKeyViolations: number;
  domainAggregates: Readonly<{
    activeUsers: number;
    activeSavedWords: number;
    reviewAttempts: number;
    completedMissions: number;
    confidencePointDelta: number;
    successfulAiFeedbackAttempts: number;
  }>;
  expectedDomainAggregates: ReconciliationReport["domainAggregates"];
  redactedFieldCount: number;
}>;

const CHECKPOINT_SCHEMA_VERSION = "vocanova-d1-import-checkpoint-v1";
const LOAD_CHECKPOINT_SQL =
  "SELECT value_json FROM platform_metadata WHERE key = ?1";
const STORE_CHECKPOINT_SQL =
  "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at";

export async function applyD1ImportPlan(
  database: D1Database,
  plan: D1ImportPlan,
  options: Readonly<{ failBeforeChunk?: number }> = {},
): Promise<ImportResult> {
  const checkpointKey = checkpointKeyFor(plan.exportId);
  const existing = await database
    .prepare(LOAD_CHECKPOINT_SQL)
    .bind(checkpointKey)
    .first<{ value_json: string }>();
  const checkpoint = existing
    ? parseCheckpoint(existing.value_json, plan)
    : initialCheckpoint(plan);
  const resumedFromChunk = checkpoint.nextChunk;

  if (checkpoint.completed) {
    return {
      exportId: plan.exportId,
      planChecksum: plan.checksum,
      resumedFromChunk,
      appliedChunks: 0,
      appliedBatches: 0,
      totalChunks: plan.chunks.length,
      completed: true,
    };
  }

  const index = checkpoint.nextChunk;
  if (options.failBeforeChunk === index) {
    throw new Error(`data conversion: injected failure before chunk ${index}`);
  }
  const chunk = plan.chunks[index];
  if (!chunk || chunk.index !== index) {
    throw new Error("data conversion: import plan chunk order is invalid");
  }
  const spec = requireTableSpec(chunk.table);
  let statements: D1PreparedStatement[];
  let nextChunk = index + 1;

  if (chunk.operation === "clear") {
    if (chunk.rows.length !== 0) {
      throw new Error("data conversion: clear chunk contains rows");
    }
    const existingRows = await database
      .prepare(buildSelectIdsSql(spec))
      .bind(plan.chunkSize + 1)
      .all<{ id: string }>();
    const ids = existingRows.results.map((row) => row.id);
    const hasMore = ids.length > plan.chunkSize;
    statements = ids
      .slice(0, plan.chunkSize)
      .map((id) => database.prepare(buildDeleteByIdSql(spec)).bind(id));
    if (hasMore) nextChunk = index;
  } else if (chunk.operation === "upsert") {
    if (
      chunk.rows.length < 1 ||
      chunk.rows.length > plan.chunkSize ||
      chunk.encodedBytes !==
        estimateUpsertChunkBytes(chunk.table, chunk.rows) ||
      chunk.encodedBytes > plan.maxChunkBytes ||
      chunk.rows.some(
        (row) =>
          estimateUpsertStatementBytes(chunk.table, row) >
          D1_IMPORT_MAX_ROW_BYTES,
      )
    ) {
      throw new Error(
        "data conversion: import plan chunk exceeds its statement or encoded-byte bounds",
      );
    }
    const upsertSql = buildUpsertSql(spec);
    statements = chunk.rows.map((row) =>
      database
        .prepare(upsertSql)
        .bind(...targetColumns(spec).map((column) => row[column] ?? null)),
    );
  } else {
    throw new Error("data conversion: import plan chunk operation is invalid");
  }

  const completed = nextChunk === plan.chunks.length;
  statements.push(
    database.prepare(STORE_CHECKPOINT_SQL).bind(
      checkpointKey,
      canonicalJson({
        schemaVersion: CHECKPOINT_SCHEMA_VERSION,
        planChecksum: plan.checksum,
        nextChunk,
        completed,
      }),
      plan.exportedAt,
    ),
  );
  await database.batch(statements);

  return {
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    resumedFromChunk,
    appliedChunks: nextChunk > index ? 1 : 0,
    appliedBatches: 1,
    totalChunks: plan.chunks.length,
    completed,
  };
}

export async function reconcileD1Import(
  database: D1Database,
  plan: D1ImportPlan,
): Promise<ReconciliationReport> {
  const tables = {} as Record<DataTableName, TableReconciliation>;
  let allTablesMatch = true;

  for (const tableName of DATA_TABLE_NAMES) {
    const spec = requireTableSpec(tableName);
    const columns = targetColumns(spec);
    const actualResult = await database
      .prepare(buildSelectSql(spec))
      .all<Record<string, string | number | null>>();
    const actualRows = actualResult.results.map((row) =>
      Object.fromEntries(
        columns.map((column) => [column, row[column] ?? null]),
      ),
    );
    const expectedRows = plan.expectedRows[tableName];
    const [expectedChecksum, actualChecksum] = await Promise.all([
      checksumRows(expectedRows),
      checksumRows(actualRows),
    ]);
    const matches =
      expectedRows.length === actualRows.length &&
      expectedChecksum === actualChecksum;
    allTablesMatch = allTablesMatch && matches;
    tables[tableName] = {
      sourceCount: plan.sourceCounts[tableName],
      excludedCount: plan.excludedCounts[tableName],
      expectedCount: expectedRows.length,
      actualCount: actualRows.length,
      expectedChecksum,
      actualChecksum,
      matches,
    };
  }

  const foreignKeyResult = await database
    .prepare("PRAGMA foreign_key_check")
    .all<Record<string, string | number | null>>();
  const domainAggregates = await readDomainAggregates(database);
  const expectedDomainAggregates = expectedAggregates(plan.expectedRows);
  const aggregatesMatch =
    canonicalJson(domainAggregates) === canonicalJson(expectedDomainAggregates);

  return {
    schemaVersion: DATA_RECONCILIATION_SCHEMA_VERSION,
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    status:
      allTablesMatch && foreignKeyResult.results.length === 0 && aggregatesMatch
        ? "pass"
        : "fail",
    tables,
    foreignKeyViolations: foreignKeyResult.results.length,
    domainAggregates,
    expectedDomainAggregates,
    redactedFieldCount: plan.redactedFieldCount,
  };
}

function initialCheckpoint(plan: D1ImportPlan): Checkpoint {
  return {
    schemaVersion: CHECKPOINT_SCHEMA_VERSION,
    planChecksum: plan.checksum,
    nextChunk: 0,
    completed: false,
  };
}

function parseCheckpoint(value: string, plan: D1ImportPlan): Checkpoint {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("data conversion: checkpoint is not valid JSON");
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("data conversion: checkpoint must be an object");
  }
  const candidate = parsed as Record<string, unknown>;
  const keys = Object.keys(candidate).sort().join(",");
  if (keys !== "completed,nextChunk,planChecksum,schemaVersion") {
    throw new Error("data conversion: checkpoint shape is invalid");
  }
  if (
    candidate.schemaVersion !== CHECKPOINT_SCHEMA_VERSION ||
    candidate.planChecksum !== plan.checksum ||
    typeof candidate.completed !== "boolean" ||
    !Number.isSafeInteger(candidate.nextChunk) ||
    Number(candidate.nextChunk) < 0 ||
    Number(candidate.nextChunk) > plan.chunks.length ||
    candidate.completed !== (candidate.nextChunk === plan.chunks.length)
  ) {
    throw new Error(
      "data conversion: checkpoint is stale or inconsistent with the import plan",
    );
  }
  return candidate as Checkpoint;
}

function checkpointKeyFor(exportId: string): string {
  return `data_conversion:${exportId}`;
}

function requireTableSpec(name: DataTableName): TableSpec {
  const spec = DATA_TABLE_BY_NAME.get(name);
  if (!spec) throw new Error(`data conversion: missing table spec for ${name}`);
  return spec;
}

function targetColumns(spec: TableSpec): string[] {
  return spec.fields.map((field) => field.target ?? field.source);
}

function buildUpsertSql(spec: TableSpec): string {
  const columns = targetColumns(spec);
  const updates = columns
    .filter((column) => column !== "id")
    .map((column) => `${column} = excluded.${column}`)
    .join(", ");
  return `INSERT INTO ${spec.name} (${columns.join(", ")}) VALUES (${columns.map((_, index) => `?${index + 1}`).join(", ")}) ON CONFLICT(id) DO UPDATE SET ${updates}`;
}

function buildSelectIdsSql(spec: TableSpec): string {
  return `SELECT id FROM ${spec.name} ORDER BY id LIMIT ?1`;
}

function buildDeleteByIdSql(spec: TableSpec): string {
  return `DELETE FROM ${spec.name} WHERE id = ?1`;
}

function buildSelectSql(spec: TableSpec): string {
  return `SELECT ${targetColumns(spec).join(", ")} FROM ${spec.name} ORDER BY id`;
}

async function checksumRows(rows: readonly D1ImportRow[]): Promise<string> {
  return sha256(canonicalJson(rows));
}

async function readDomainAggregates(
  database: D1Database,
): Promise<ReconciliationReport["domainAggregates"]> {
  const results = await database.batch([
    database.prepare(
      "SELECT COUNT(*) AS value FROM users WHERE status = 'active'",
    ),
    database.prepare(
      "SELECT COUNT(*) AS value FROM user_words WHERE deleted_at IS NULL",
    ),
    database.prepare("SELECT COUNT(*) AS value FROM review_attempts"),
    database.prepare(
      "SELECT COUNT(*) AS value FROM daily_mission_snapshots WHERE status = 'completed'",
    ),
    database.prepare(
      "SELECT COALESCE(SUM(amount), 0) AS value FROM confidence_point_ledger",
    ),
    database.prepare(
      "SELECT COUNT(*) AS value FROM ai_feedback_attempts WHERE status = 'succeeded'",
    ),
  ]);
  return {
    activeUsers: resultValue(requireBatchResult(results, 0)),
    activeSavedWords: resultValue(requireBatchResult(results, 1)),
    reviewAttempts: resultValue(requireBatchResult(results, 2)),
    completedMissions: resultValue(requireBatchResult(results, 3)),
    confidencePointDelta: resultValue(requireBatchResult(results, 4)),
    successfulAiFeedbackAttempts: resultValue(requireBatchResult(results, 5)),
  };
}

function requireBatchResult(
  results: readonly D1Result[],
  index: number,
): D1Result {
  const result = results[index];
  if (!result)
    throw new Error("data conversion: aggregate batch is incomplete");
  return result;
}

function resultValue(result: D1Result): number {
  const row = result.results[0] as Record<string, unknown> | undefined;
  const value = row?.value;
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new Error(
      "data conversion: aggregate query returned an unsafe value",
    );
  }
  return value;
}

function expectedAggregates(
  rows: Readonly<Record<DataTableName, readonly D1ImportRow[]>>,
): ReconciliationReport["domainAggregates"] {
  return {
    activeUsers: rows.users.filter((row) => row.status === "active").length,
    activeSavedWords: rows.user_words.filter((row) => row.deleted_at === null)
      .length,
    reviewAttempts: rows.review_attempts.length,
    completedMissions: rows.daily_mission_snapshots.filter(
      (row) => row.status === "completed",
    ).length,
    confidencePointDelta: rows.confidence_point_ledger.reduce(
      (total, row) => total + Number(row.amount),
      0,
    ),
    successfulAiFeedbackAttempts: rows.ai_feedback_attempts.filter(
      (row) => row.status === "succeeded",
    ).length,
  };
}
