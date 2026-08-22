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

export type ReconciliationProgress = Readonly<{
  schemaVersion: "vocanova-d1-reconciliation-progress-v1";
  exportId: string;
  planChecksum: string;
  status: "pending";
  completed: false;
  table: DataTableName | null;
  completedTables: number;
  processedRowsInTable: number;
}>;

export type ReconciliationResult =
  ReconciliationProgress | ReconciliationReport;

type ReconciliationCheckpoint = Readonly<{
  schemaVersion: "vocanova-d1-reconciliation-checkpoint-v1";
  planChecksum: string;
  tableIndex: number;
  current: Readonly<{
    rowCount: number;
    rollingChecksum: string;
    lastId: string;
  }>;
  tables: Readonly<Partial<Record<DataTableName, TableReconciliation>>>;
  foreignKeyViolations: number | null;
  domainAggregates: ReconciliationReport["domainAggregates"] | null;
  completed: boolean;
}>;

const CHECKPOINT_SCHEMA_VERSION = "vocanova-d1-import-checkpoint-v1";
const RECONCILIATION_CHECKPOINT_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-checkpoint-v1";
const RECONCILIATION_PROGRESS_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-progress-v1";
export const D1_RECONCILIATION_PAGE_ROWS = 10;
export const D1_RECONCILIATION_MAX_PAGE_BYTES = 12_000_000;
const CHECKSUM_PATTERN = /^[0-9a-f]{64}$/;
const CANONICAL_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
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
  options: Readonly<{
    failBeforePage?: Readonly<{
      table: DataTableName;
      processedRows: number;
    }>;
  }> = {},
): Promise<ReconciliationResult> {
  const checkpointKey = reconciliationCheckpointKeyFor(plan.exportId);
  const existing = await database
    .prepare(LOAD_CHECKPOINT_SQL)
    .bind(checkpointKey)
    .first<{ value_json: string }>();
  const checkpoint = existing
    ? parseReconciliationCheckpoint(existing.value_json, plan)
    : await initialReconciliationCheckpoint(plan);

  if (checkpoint.completed) return buildReconciliationReport(plan, checkpoint);

  if (checkpoint.tableIndex < DATA_TABLE_NAMES.length) {
    const tableName = DATA_TABLE_NAMES[checkpoint.tableIndex];
    if (!tableName) {
      throw new Error("data conversion: reconciliation table order is invalid");
    }
    if (
      options.failBeforePage?.table === tableName &&
      options.failBeforePage.processedRows === checkpoint.current.rowCount
    ) {
      throw new Error(
        `data conversion: injected reconciliation failure before ${tableName} row ${checkpoint.current.rowCount}`,
      );
    }
    const spec = requireTableSpec(tableName);
    const columns = targetColumns(spec);
    const actualResult = await database
      .prepare(buildPagedSelectSql(spec))
      .bind(checkpoint.current.lastId, D1_RECONCILIATION_PAGE_ROWS + 1)
      .all<Record<string, string | number | null>>();
    const hasMore = actualResult.results.length > D1_RECONCILIATION_PAGE_ROWS;
    const pageRows = actualResult.results
      .slice(0, D1_RECONCILIATION_PAGE_ROWS)
      .map((row) =>
        Object.fromEntries(
          columns.map((column) => [column, row[column] ?? null]),
        ),
      );
    const pageBytes = encodedByteLength(canonicalJson(pageRows));
    if (pageBytes > D1_RECONCILIATION_MAX_PAGE_BYTES) {
      throw new Error(
        `data conversion: reconciliation page for ${tableName} exceeds the ${D1_RECONCILIATION_MAX_PAGE_BYTES}-byte bound`,
      );
    }

    let nextCurrent = checkpoint.current;
    if (pageRows.length > 0) {
      const lastId = pageRows.at(-1)?.id;
      if (
        typeof lastId !== "string" ||
        !CANONICAL_ID_PATTERN.test(lastId) ||
        lastId <= checkpoint.current.lastId
      ) {
        throw new Error(
          `data conversion: reconciliation page for ${tableName} has an invalid row order`,
        );
      }
      nextCurrent = {
        rowCount: checkpoint.current.rowCount + pageRows.length,
        rollingChecksum: await advanceRollingChecksum(
          checkpoint.current.rollingChecksum,
          pageRows,
        ),
        lastId,
      };
    }

    if (hasMore) {
      const nextCheckpoint: ReconciliationCheckpoint = {
        ...checkpoint,
        current: nextCurrent,
      };
      await storeReconciliationCheckpoint(
        database,
        checkpointKey,
        nextCheckpoint,
        plan.exportedAt,
      );
      return reconciliationProgress(plan, nextCheckpoint, tableName);
    }

    const expectedRows = plan.expectedRows[tableName];
    const expectedChecksum = await checksumRowsByPage(expectedRows);
    const actualChecksum = nextCurrent.rollingChecksum;
    const matches =
      expectedRows.length === nextCurrent.rowCount &&
      expectedChecksum === actualChecksum;
    const nextCheckpoint: ReconciliationCheckpoint = {
      ...checkpoint,
      tableIndex: checkpoint.tableIndex + 1,
      current: await emptyReconciliationCursor(),
      tables: {
        ...checkpoint.tables,
        [tableName]: {
          sourceCount: plan.sourceCounts[tableName],
          excludedCount: plan.excludedCounts[tableName],
          expectedCount: expectedRows.length,
          actualCount: nextCurrent.rowCount,
          expectedChecksum,
          actualChecksum,
          matches,
        },
      },
    };
    await storeReconciliationCheckpoint(
      database,
      checkpointKey,
      nextCheckpoint,
      plan.exportedAt,
    );
    return reconciliationProgress(plan, nextCheckpoint, tableName);
  }

  const foreignKeyViolations = await readForeignKeyViolationCount(database);
  const domainAggregates = await readDomainAggregates(database);
  const completedCheckpoint: ReconciliationCheckpoint = {
    ...checkpoint,
    foreignKeyViolations,
    domainAggregates,
    completed: true,
  };
  await storeReconciliationCheckpoint(
    database,
    checkpointKey,
    completedCheckpoint,
    plan.exportedAt,
  );
  return buildReconciliationReport(plan, completedCheckpoint);
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

async function initialReconciliationCheckpoint(
  plan: D1ImportPlan,
): Promise<ReconciliationCheckpoint> {
  return {
    schemaVersion: RECONCILIATION_CHECKPOINT_SCHEMA_VERSION,
    planChecksum: plan.checksum,
    tableIndex: 0,
    current: await emptyReconciliationCursor(),
    tables: {},
    foreignKeyViolations: null,
    domainAggregates: null,
    completed: false,
  };
}

function parseReconciliationCheckpoint(
  value: string,
  plan: D1ImportPlan,
): ReconciliationCheckpoint {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "data conversion: reconciliation checkpoint is not valid JSON",
    );
  }
  if (!isRecord(parsed)) {
    throw new Error(
      "data conversion: reconciliation checkpoint must be an object",
    );
  }
  requireExactObjectKeys(
    parsed,
    [
      "completed",
      "current",
      "domainAggregates",
      "foreignKeyViolations",
      "planChecksum",
      "schemaVersion",
      "tableIndex",
      "tables",
    ],
    "reconciliation checkpoint",
  );
  if (
    parsed.schemaVersion !== RECONCILIATION_CHECKPOINT_SCHEMA_VERSION ||
    parsed.planChecksum !== plan.checksum ||
    typeof parsed.completed !== "boolean" ||
    !Number.isSafeInteger(parsed.tableIndex) ||
    Number(parsed.tableIndex) < 0 ||
    Number(parsed.tableIndex) > DATA_TABLE_NAMES.length ||
    !isRecord(parsed.current) ||
    !isRecord(parsed.tables)
  ) {
    throw new Error(
      "data conversion: reconciliation checkpoint is stale or inconsistent",
    );
  }
  requireExactObjectKeys(
    parsed.current,
    ["lastId", "rollingChecksum", "rowCount"],
    "reconciliation checkpoint current cursor",
  );
  if (
    !Number.isSafeInteger(parsed.current.rowCount) ||
    Number(parsed.current.rowCount) < 0 ||
    typeof parsed.current.rollingChecksum !== "string" ||
    !CHECKSUM_PATTERN.test(parsed.current.rollingChecksum) ||
    typeof parsed.current.lastId !== "string" ||
    (parsed.current.lastId !== "" &&
      !CANONICAL_ID_PATTERN.test(parsed.current.lastId))
  ) {
    throw new Error(
      "data conversion: reconciliation checkpoint cursor is invalid",
    );
  }

  const tableIndex = Number(parsed.tableIndex);
  const completedTableNames = DATA_TABLE_NAMES.slice(0, tableIndex);
  requireExactObjectKeys(
    parsed.tables,
    completedTableNames,
    "reconciliation checkpoint tables",
  );
  for (const tableName of completedTableNames) {
    validateTableReconciliation(parsed.tables[tableName], tableName);
  }

  if (parsed.completed) {
    if (
      tableIndex !== DATA_TABLE_NAMES.length ||
      !isNonNegativeSafeInteger(parsed.foreignKeyViolations) ||
      !isDomainAggregates(parsed.domainAggregates)
    ) {
      throw new Error(
        "data conversion: completed reconciliation checkpoint is inconsistent",
      );
    }
  } else if (
    parsed.foreignKeyViolations !== null ||
    parsed.domainAggregates !== null
  ) {
    throw new Error(
      "data conversion: incomplete reconciliation checkpoint has final evidence",
    );
  }
  return parsed as ReconciliationCheckpoint;
}

function validateTableReconciliation(
  value: unknown,
  tableName: DataTableName,
): asserts value is TableReconciliation {
  if (!isRecord(value)) {
    throw new Error(
      `data conversion: reconciliation checkpoint table ${tableName} is invalid`,
    );
  }
  requireExactObjectKeys(
    value,
    [
      "actualChecksum",
      "actualCount",
      "excludedCount",
      "expectedChecksum",
      "expectedCount",
      "matches",
      "sourceCount",
    ],
    `reconciliation checkpoint table ${tableName}`,
  );
  if (
    !isNonNegativeSafeInteger(value.sourceCount) ||
    !isNonNegativeSafeInteger(value.excludedCount) ||
    !isNonNegativeSafeInteger(value.expectedCount) ||
    !isNonNegativeSafeInteger(value.actualCount) ||
    typeof value.expectedChecksum !== "string" ||
    !CHECKSUM_PATTERN.test(value.expectedChecksum) ||
    typeof value.actualChecksum !== "string" ||
    !CHECKSUM_PATTERN.test(value.actualChecksum) ||
    typeof value.matches !== "boolean"
  ) {
    throw new Error(
      `data conversion: reconciliation checkpoint table ${tableName} has invalid evidence`,
    );
  }
}

function reconciliationProgress(
  plan: D1ImportPlan,
  checkpoint: ReconciliationCheckpoint,
  table: DataTableName,
): ReconciliationProgress {
  return {
    schemaVersion: RECONCILIATION_PROGRESS_SCHEMA_VERSION,
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    status: "pending",
    completed: false,
    table,
    completedTables: checkpoint.tableIndex,
    processedRowsInTable: checkpoint.current.rowCount,
  };
}

async function storeReconciliationCheckpoint(
  database: D1Database,
  key: string,
  checkpoint: ReconciliationCheckpoint,
  updatedAt: string,
): Promise<void> {
  await database
    .prepare(STORE_CHECKPOINT_SQL)
    .bind(key, canonicalJson(checkpoint), updatedAt)
    .run();
}

function buildReconciliationReport(
  plan: D1ImportPlan,
  checkpoint: ReconciliationCheckpoint,
): ReconciliationReport {
  if (
    !checkpoint.completed ||
    checkpoint.foreignKeyViolations === null ||
    checkpoint.domainAggregates === null
  ) {
    throw new Error("data conversion: reconciliation is not complete");
  }
  const tables = checkpoint.tables as Record<
    DataTableName,
    TableReconciliation
  >;
  const expectedDomainAggregates = expectedAggregates(plan.expectedRows);
  const allTablesMatch = DATA_TABLE_NAMES.every(
    (tableName) => tables[tableName]?.matches === true,
  );
  const aggregatesMatch =
    canonicalJson(checkpoint.domainAggregates) ===
    canonicalJson(expectedDomainAggregates);
  return {
    schemaVersion: DATA_RECONCILIATION_SCHEMA_VERSION,
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    status:
      allTablesMatch && checkpoint.foreignKeyViolations === 0 && aggregatesMatch
        ? "pass"
        : "fail",
    tables,
    foreignKeyViolations: checkpoint.foreignKeyViolations,
    domainAggregates: checkpoint.domainAggregates,
    expectedDomainAggregates,
    redactedFieldCount: plan.redactedFieldCount,
  };
}

async function emptyReconciliationCursor(): Promise<
  ReconciliationCheckpoint["current"]
> {
  return {
    rowCount: 0,
    rollingChecksum: await sha256("vocanova-d1-page-chain-v1"),
    lastId: "",
  };
}

async function advanceRollingChecksum(
  previous: string,
  rows: readonly D1ImportRow[],
): Promise<string> {
  return sha256(canonicalJson({ previous, rows }));
}

async function checksumRowsByPage(
  rows: readonly D1ImportRow[],
): Promise<string> {
  let checksum = (await emptyReconciliationCursor()).rollingChecksum;
  for (
    let offset = 0;
    offset < rows.length;
    offset += D1_RECONCILIATION_PAGE_ROWS
  ) {
    checksum = await advanceRollingChecksum(
      checksum,
      rows.slice(offset, offset + D1_RECONCILIATION_PAGE_ROWS),
    );
  }
  return checksum;
}

function requireExactObjectKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
  location: string,
): void {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...expected].sort();
  if (
    actual.length !== canonicalExpected.length ||
    actual.some((key, index) => key !== canonicalExpected[index])
  ) {
    throw new Error(`data conversion: ${location} shape is invalid`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function checkpointKeyFor(exportId: string): string {
  return `data_conversion:${exportId}`;
}

function reconciliationCheckpointKeyFor(exportId: string): string {
  return `data_reconciliation:${exportId}`;
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

function buildPagedSelectSql(spec: TableSpec): string {
  return `SELECT ${targetColumns(spec).join(", ")} FROM ${spec.name} WHERE id > ?1 ORDER BY id LIMIT ?2`;
}

function encodedByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

async function readForeignKeyViolationCount(
  database: D1Database,
): Promise<number> {
  const result = await database
    .prepare("SELECT COUNT(*) AS value FROM pragma_foreign_key_check")
    .first<{ value: number }>();
  if (!isNonNegativeSafeInteger(result?.value)) {
    throw new Error(
      "data conversion: foreign-key reconciliation returned an unsafe value",
    );
  }
  return result.value;
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

function isDomainAggregates(
  value: unknown,
): value is ReconciliationReport["domainAggregates"] {
  if (!isRecord(value)) return false;
  const keys = [
    "activeSavedWords",
    "activeUsers",
    "completedMissions",
    "confidencePointDelta",
    "reviewAttempts",
    "successfulAiFeedbackAttempts",
  ];
  if (Object.keys(value).sort().join(",") !== keys.sort().join(",")) {
    return false;
  }
  return keys.every((key) => Number.isSafeInteger(value[key]));
}
