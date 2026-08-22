import {
  canonicalJson,
  DATA_FOREIGN_KEYS,
  D1_RECONCILIATION_CHAIN_SEED,
  D1_RECONCILIATION_PAGE_ROWS,
  D1_IMPORT_MAX_ROW_BYTES,
  estimateUpsertChunkBytes,
  estimateUpsertStatementBytes,
  sha256,
  type DataDomainAggregates,
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
  reconciliationGeneration: string;
  status: "pass" | "fail";
  tables: Readonly<Record<DataTableName, TableReconciliation>>;
  foreignKeyViolations: number;
  domainAggregates: DataDomainAggregates;
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

type CheckpointDomainAggregates = Readonly<
  Omit<DataDomainAggregates, "confidencePointDelta"> & {
    confidencePointDelta: string;
  }
>;

type ReconciliationCheckpoint = Readonly<{
  schemaVersion: "vocanova-d1-reconciliation-checkpoint-v4";
  generation: string;
  planChecksum: string;
  tableIndex: number;
  current: Readonly<{
    rowCount: number;
    rollingChecksum: string;
    lastId: string;
  }>;
  tables: Readonly<Partial<Record<DataTableName, TableReconciliation>>>;
  foreignKeyViolations: number;
  domainAggregates: CheckpointDomainAggregates;
  completed: boolean;
}>;

type ReconciliationWriteLock = Readonly<{
  schemaVersion: "vocanova-d1-reconciliation-write-lock-v2";
  exportId: string;
  planChecksum: string;
  generation: string;
  checkpoint: ReconciliationCheckpoint;
}>;

const CHECKPOINT_SCHEMA_VERSION = "vocanova-d1-import-checkpoint-v1";
const RECONCILIATION_CHECKPOINT_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-checkpoint-v4";
const RECONCILIATION_PROGRESS_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-progress-v1";
const RECONCILIATION_WRITE_LOCK_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-write-lock-v2";
export const D1_RECONCILIATION_MAX_PAGE_BYTES = 12_000_000;
const CHECKSUM_PATTERN = /^[0-9a-f]{64}$/;
const CANONICAL_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const LOAD_CHECKPOINT_SQL =
  "SELECT value_json FROM platform_metadata WHERE key = ?1";
const STORE_CHECKPOINT_SQL =
  "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at";
const RECONCILIATION_WRITE_LOCK_KEY = "data_reconciliation_write_lock";

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
  const session = database.withSession("first-primary");
  const lock = await acquireOrLoadReconciliationWriteLock(session, plan);
  const checkpoint = lock.checkpoint;

  // A completed receipt is single-use evidence returned only to the invocation
  // that produced it. A later reader cannot safely distinguish that receipt from
  // one already consumed by another caller, so it must fail closed until the
  // producer releases the exact generation recorded in its report.
  if (checkpoint.completed) {
    throw new Error(
      "data conversion: completed reconciliation awaits generation-bound release",
    );
  }

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
    const actualResult = await session
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
    const pageForeignKeyViolations = actualResult.results
      .slice(0, D1_RECONCILIATION_PAGE_ROWS)
      .reduce((total, row) => {
        const value = row.__foreign_key_violations;
        if (!isNonNegativeSafeInteger(value)) {
          throw new Error(
            `data conversion: foreign-key reconciliation for ${tableName} returned an unsafe value`,
          );
        }
        return total + value;
      }, 0);
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
    const nextForeignKeyViolations =
      checkpoint.foreignKeyViolations + pageForeignKeyViolations;
    if (!isNonNegativeSafeInteger(nextForeignKeyViolations)) {
      throw new Error(
        "data conversion: foreign-key reconciliation count overflowed",
      );
    }
    const nextDomainAggregates = addActualPageAggregates(
      checkpoint.domainAggregates,
      tableName,
      pageRows,
    );

    if (hasMore) {
      const nextCheckpoint: ReconciliationCheckpoint = {
        ...checkpoint,
        current: nextCurrent,
        foreignKeyViolations: nextForeignKeyViolations,
        domainAggregates: nextDomainAggregates,
      };
      await advanceReconciliationWriteLock(
        session,
        lock,
        nextCheckpoint,
        plan.exportedAt,
      );
      return reconciliationProgress(plan, nextCheckpoint, tableName);
    }

    const expectedRows = plan.expectedRows[tableName];
    const expectedChecksum = plan.expectedChecksums[tableName];
    const actualChecksum = nextCurrent.rollingChecksum;
    const matches =
      expectedRows.length === nextCurrent.rowCount &&
      expectedChecksum === actualChecksum;
    const nextTableIndex = checkpoint.tableIndex + 1;
    const nextCheckpoint: ReconciliationCheckpoint = {
      ...checkpoint,
      tableIndex: nextTableIndex,
      current: await emptyReconciliationCursor(),
      foreignKeyViolations: nextForeignKeyViolations,
      domainAggregates: nextDomainAggregates,
      completed: nextTableIndex === DATA_TABLE_NAMES.length,
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
    await advanceReconciliationWriteLock(
      session,
      lock,
      nextCheckpoint,
      plan.exportedAt,
    );
    return nextCheckpoint.completed
      ? buildReconciliationReport(plan, nextCheckpoint)
      : reconciliationProgress(plan, nextCheckpoint, tableName);
  }

  throw new Error(
    "data conversion: incomplete reconciliation checkpoint has no remaining table",
  );
}

export async function releaseD1ReconciliationWriteLock(
  database: D1Database,
  plan: D1ImportPlan,
  reconciliationGeneration: string,
): Promise<void> {
  if (!CANONICAL_ID_PATTERN.test(reconciliationGeneration)) {
    throw new Error(
      "data conversion: reconciliation release generation is invalid",
    );
  }
  const session = database.withSession("first-primary");
  const existingLock = await loadReconciliationWriteLock(session);
  if (!existingLock) {
    throw new Error(
      "data conversion: cannot release a missing reconciliation lock",
    );
  }
  const lock = parseReconciliationWriteLock(existingLock, plan);
  if (lock.generation !== reconciliationGeneration) {
    throw new Error(
      "data conversion: reconciliation release generation does not match the completed receipt",
    );
  }
  if (!lock.checkpoint.completed) {
    throw new Error(
      "data conversion: cannot release reconciliation lock before exact reconciliation completes",
    );
  }

  await session
    .prepare("DELETE FROM platform_metadata WHERE key = ?1 AND value_json = ?2")
    .bind(RECONCILIATION_WRITE_LOCK_KEY, existingLock)
    .run();
  const remainingLock = await loadReconciliationWriteLock(session);
  if (remainingLock === existingLock) {
    throw new Error(
      "data conversion: reconciliation write lock was not released",
    );
  }
  if (remainingLock) {
    const replacement = parseReconciliationWriteLock(remainingLock, plan);
    if (replacement.generation === lock.generation) {
      throw new Error(
        "data conversion: reconciliation state changed during release",
      );
    }
  }
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
  generation: string,
): Promise<ReconciliationCheckpoint> {
  return {
    schemaVersion: RECONCILIATION_CHECKPOINT_SCHEMA_VERSION,
    generation,
    planChecksum: plan.checksum,
    tableIndex: 0,
    current: await emptyReconciliationCursor(),
    tables: {},
    foreignKeyViolations: 0,
    domainAggregates: emptyDomainAggregates(),
    completed: false,
  };
}

function parseReconciliationCheckpoint(
  value: string,
  plan: D1ImportPlan,
  generation: string,
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
      "generation",
      "planChecksum",
      "schemaVersion",
      "tableIndex",
      "tables",
    ],
    "reconciliation checkpoint",
  );
  if (
    parsed.schemaVersion !== RECONCILIATION_CHECKPOINT_SCHEMA_VERSION ||
    parsed.generation !== generation ||
    !CANONICAL_ID_PATTERN.test(generation) ||
    parsed.planChecksum !== plan.checksum ||
    typeof parsed.completed !== "boolean" ||
    !Number.isSafeInteger(parsed.tableIndex) ||
    Number(parsed.tableIndex) < 0 ||
    Number(parsed.tableIndex) > DATA_TABLE_NAMES.length ||
    !isRecord(parsed.current) ||
    !isRecord(parsed.tables) ||
    !isNonNegativeSafeInteger(parsed.foreignKeyViolations) ||
    !isCheckpointDomainAggregates(parsed.domainAggregates)
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
      !CANONICAL_ID_PATTERN.test(parsed.current.lastId)) ||
    (Number(parsed.current.rowCount) === 0) !==
      (parsed.current.lastId === "") ||
    (Number(parsed.current.rowCount) > 0 &&
      Number(parsed.current.rowCount) % D1_RECONCILIATION_PAGE_ROWS !== 0)
  ) {
    throw new Error(
      "data conversion: reconciliation checkpoint cursor is invalid",
    );
  }

  const tableIndex = Number(parsed.tableIndex);
  const currentRowCount = Number(parsed.current.rowCount);
  if (currentRowCount > 0) {
    const currentTable = DATA_TABLE_NAMES[tableIndex];
    const expectedPageIndex = currentRowCount / D1_RECONCILIATION_PAGE_ROWS - 1;
    const expectedPage = currentTable
      ? plan.expectedPageEvidence[currentTable][expectedPageIndex]
      : undefined;
    if (
      !expectedPage ||
      expectedPage.rowCount !== currentRowCount ||
      expectedPage.lastId !== parsed.current.lastId ||
      expectedPage.checksum !== parsed.current.rollingChecksum
    ) {
      throw new Error(
        "data conversion: reconciliation checkpoint cursor is not bound to an exact expected prefix",
      );
    }
  }
  const completedTableNames = DATA_TABLE_NAMES.slice(0, tableIndex);
  requireExactObjectKeys(
    parsed.tables,
    completedTableNames,
    "reconciliation checkpoint tables",
  );
  for (const tableName of completedTableNames) {
    validateTableReconciliation(parsed.tables[tableName], tableName, plan);
  }
  validateCheckpointAggregates(
    parsed.domainAggregates,
    tableIndex,
    currentRowCount,
    parsed.tables,
    plan,
  );

  if (
    parsed.completed !== (tableIndex === DATA_TABLE_NAMES.length) ||
    (parsed.completed &&
      (Number(parsed.current.rowCount) !== 0 || parsed.current.lastId !== ""))
  ) {
    throw new Error(
      "data conversion: completed reconciliation checkpoint is inconsistent",
    );
  }
  return parsed as ReconciliationCheckpoint;
}

function validateCheckpointAggregates(
  actual: CheckpointDomainAggregates,
  tableIndex: number,
  currentRowCount: number,
  tables: Readonly<Record<string, unknown>>,
  plan: D1ImportPlan,
): void {
  const contracts = [
    ["activeUsers", "users"],
    ["activeSavedWords", "user_words"],
    ["reviewAttempts", "review_attempts"],
    ["completedMissions", "daily_mission_snapshots"],
    ["confidencePointDelta", "confidence_point_ledger"],
    ["successfulAiFeedbackAttempts", "ai_feedback_attempts"],
  ] as const satisfies readonly (readonly [
    keyof DataDomainAggregates,
    DataTableName,
  ])[];

  for (const [field, tableName] of contracts) {
    const aggregateTableIndex = DATA_TABLE_NAMES.indexOf(tableName);
    const tableEvidence = tables[tableName];
    if (
      tableIndex > aggregateTableIndex &&
      isRecord(tableEvidence) &&
      tableEvidence.matches === true &&
      aggregateValueIsDifferent(actual, plan.expectedDomainAggregates, field)
    ) {
      throw new Error(
        `data conversion: reconciliation checkpoint aggregate ${field} is inconsistent with matching table evidence`,
      );
    }
    if (
      (tableIndex < aggregateTableIndex ||
        (tableIndex === aggregateTableIndex && currentRowCount === 0)) &&
      aggregateValueIsNotZero(actual, field)
    ) {
      throw new Error(
        `data conversion: reconciliation checkpoint aggregate ${field} advances before its table`,
      );
    }
  }
}

function aggregateValueIsDifferent(
  actual: CheckpointDomainAggregates,
  expected: DataDomainAggregates,
  field: keyof DataDomainAggregates,
): boolean {
  return field === "confidencePointDelta"
    ? actual.confidencePointDelta !== String(expected.confidencePointDelta)
    : actual[field] !== expected[field];
}

function aggregateValueIsNotZero(
  actual: CheckpointDomainAggregates,
  field: keyof DataDomainAggregates,
): boolean {
  return field === "confidencePointDelta"
    ? actual.confidencePointDelta !== "0"
    : actual[field] !== 0;
}

function validateTableReconciliation(
  value: unknown,
  tableName: DataTableName,
  plan: D1ImportPlan,
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
    typeof value.matches !== "boolean" ||
    value.sourceCount !== plan.sourceCounts[tableName] ||
    value.excludedCount !== plan.excludedCounts[tableName] ||
    value.expectedCount !== plan.expectedRows[tableName].length ||
    value.expectedChecksum !== plan.expectedChecksums[tableName] ||
    value.matches !==
      (value.expectedCount === value.actualCount &&
        value.expectedChecksum === value.actualChecksum)
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

async function advanceReconciliationWriteLock(
  database: D1DatabaseSession,
  previous: ReconciliationWriteLock,
  checkpoint: ReconciliationCheckpoint,
  updatedAt: string,
): Promise<ReconciliationWriteLock> {
  if (checkpoint.generation !== previous.generation) {
    throw new Error(
      "data conversion: reconciliation checkpoint changed lock generation",
    );
  }
  const next: ReconciliationWriteLock = {
    ...previous,
    checkpoint,
  };
  const previousValue = canonicalJson(previous);
  const nextValue = canonicalJson(next);
  await database
    .prepare(
      "UPDATE platform_metadata SET value_json = ?1, updated_at = ?2 WHERE key = ?3 AND value_json = ?4",
    )
    .bind(nextValue, updatedAt, RECONCILIATION_WRITE_LOCK_KEY, previousValue)
    .run();
  const stored = await loadReconciliationWriteLock(database);
  if (stored !== nextValue) {
    throw new Error(
      "data conversion: reconciliation state changed concurrently",
    );
  }
  return next;
}

async function acquireOrLoadReconciliationWriteLock(
  database: D1DatabaseSession,
  plan: D1ImportPlan,
): Promise<ReconciliationWriteLock> {
  const generation = crypto.randomUUID();
  const checkpoint = await initialReconciliationCheckpoint(plan, generation);
  const candidate = reconciliationWriteLockFor(plan, generation, checkpoint);
  const value = canonicalJson(candidate);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await database
      .prepare(
        "INSERT OR IGNORE INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3)",
      )
      .bind(RECONCILIATION_WRITE_LOCK_KEY, value, plan.exportedAt)
      .run();
    const acquired = await loadReconciliationWriteLock(database);
    if (acquired) {
      return parseReconciliationWriteLock(acquired, plan);
    }
    // A completed generation can be conditionally released between this
    // invocation's INSERT OR IGNORE and confirming load. Retry once in the same
    // primary-anchored session; a persistent absence still fails closed.
  }
  throw new Error(
    "data conversion: reconciliation write lock was not acquired",
  );
}

async function loadReconciliationWriteLock(
  database: D1DatabaseSession,
): Promise<string | null> {
  const row = await database
    .prepare(LOAD_CHECKPOINT_SQL)
    .bind(RECONCILIATION_WRITE_LOCK_KEY)
    .first<{ value_json: string }>();
  return row?.value_json ?? null;
}

function reconciliationWriteLockFor(
  plan: D1ImportPlan,
  generation: string,
  checkpoint: ReconciliationCheckpoint,
): ReconciliationWriteLock {
  return {
    schemaVersion: RECONCILIATION_WRITE_LOCK_SCHEMA_VERSION,
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    generation,
    checkpoint,
  };
}

function parseReconciliationWriteLock(
  value: string,
  plan: D1ImportPlan,
): ReconciliationWriteLock {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      "data conversion: reconciliation write lock is not valid JSON",
    );
  }
  if (!isRecord(parsed)) {
    throw new Error("data conversion: reconciliation write lock is invalid");
  }
  requireExactObjectKeys(
    parsed,
    ["checkpoint", "exportId", "generation", "planChecksum", "schemaVersion"],
    "reconciliation write lock",
  );
  if (
    parsed.schemaVersion !== RECONCILIATION_WRITE_LOCK_SCHEMA_VERSION ||
    parsed.exportId !== plan.exportId ||
    parsed.planChecksum !== plan.checksum ||
    typeof parsed.generation !== "string" ||
    !CANONICAL_ID_PATTERN.test(parsed.generation) ||
    !isRecord(parsed.checkpoint)
  ) {
    throw new Error(
      "data conversion: reconciliation write lock belongs to another plan",
    );
  }
  const checkpoint = parseReconciliationCheckpoint(
    canonicalJson(parsed.checkpoint),
    plan,
    parsed.generation,
  );
  return { ...parsed, checkpoint } as ReconciliationWriteLock;
}

function buildReconciliationReport(
  plan: D1ImportPlan,
  checkpoint: ReconciliationCheckpoint,
): ReconciliationReport {
  if (!checkpoint.completed) {
    throw new Error("data conversion: reconciliation is not complete");
  }
  const tables = checkpoint.tables as Record<
    DataTableName,
    TableReconciliation
  >;
  const expectedDomainAggregates = plan.expectedDomainAggregates;
  const domainAggregates: DataDomainAggregates = {
    ...checkpoint.domainAggregates,
    confidencePointDelta: exactSafeInteger(
      BigInt(checkpoint.domainAggregates.confidencePointDelta),
      "confidence-point aggregate",
    ),
  };
  const allTablesMatch = DATA_TABLE_NAMES.every(
    (tableName) => tables[tableName]?.matches === true,
  );
  const aggregatesMatch =
    canonicalJson(domainAggregates) === canonicalJson(expectedDomainAggregates);
  return {
    schemaVersion: DATA_RECONCILIATION_SCHEMA_VERSION,
    exportId: plan.exportId,
    planChecksum: plan.checksum,
    reconciliationGeneration: checkpoint.generation,
    status:
      allTablesMatch && checkpoint.foreignKeyViolations === 0 && aggregatesMatch
        ? "pass"
        : "fail",
    tables,
    foreignKeyViolations: checkpoint.foreignKeyViolations,
    domainAggregates,
    expectedDomainAggregates,
    redactedFieldCount: plan.redactedFieldCount,
  };
}

async function emptyReconciliationCursor(): Promise<
  ReconciliationCheckpoint["current"]
> {
  return {
    rowCount: 0,
    rollingChecksum: await sha256(D1_RECONCILIATION_CHAIN_SEED),
    lastId: "",
  };
}

async function advanceRollingChecksum(
  previous: string,
  rows: readonly D1ImportRow[],
): Promise<string> {
  return sha256(canonicalJson({ previous, rows }));
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
  const columns = targetColumns(spec).map(
    (column) => `source.${column} AS ${column}`,
  );
  const foreignKeyChecks = DATA_FOREIGN_KEYS.filter(
    ([table]) => table === spec.name,
  ).map(
    ([, field, referencedTable]) =>
      `CASE WHEN source.${field} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM ${referencedTable} AS parent WHERE parent.id = source.${field}) THEN 1 ELSE 0 END`,
  );
  const violationExpression =
    foreignKeyChecks.length === 0 ? "0" : foreignKeyChecks.join(" + ");
  return `SELECT ${columns.join(", ")}, (${violationExpression}) AS __foreign_key_violations FROM ${spec.name} AS source WHERE source.id > ?1 ORDER BY source.id LIMIT ?2`;
}

function encodedByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function emptyDomainAggregates(): CheckpointDomainAggregates {
  return {
    activeUsers: 0,
    activeSavedWords: 0,
    reviewAttempts: 0,
    completedMissions: 0,
    confidencePointDelta: "0",
    successfulAiFeedbackAttempts: 0,
  };
}

function addActualPageAggregates(
  previous: CheckpointDomainAggregates,
  table: DataTableName,
  rows: readonly D1ImportRow[],
): CheckpointDomainAggregates {
  const next = { ...previous };
  switch (table) {
    case "users":
      next.activeUsers += rows.filter((row) => row.status === "active").length;
      break;
    case "user_words":
      next.activeSavedWords += rows.filter(
        (row) => row.deleted_at === null,
      ).length;
      break;
    case "review_attempts":
      next.reviewAttempts += rows.length;
      break;
    case "daily_mission_snapshots":
      next.completedMissions += rows.filter(
        (row) => row.status === "completed",
      ).length;
      break;
    case "confidence_point_ledger": {
      let exactDelta = BigInt(next.confidencePointDelta);
      for (const row of rows) {
        if (
          typeof row.amount !== "number" ||
          !Number.isSafeInteger(row.amount)
        ) {
          throw new Error(
            "data conversion: confidence-point aggregate encountered an unsafe value",
          );
        }
        exactDelta += BigInt(row.amount);
      }
      next.confidencePointDelta = exactDelta.toString();
      break;
    }
    case "ai_feedback_attempts":
      next.successfulAiFeedbackAttempts += rows.filter(
        (row) => row.status === "succeeded",
      ).length;
      break;
  }
  if (!isCheckpointDomainAggregates(next)) {
    throw new Error("data conversion: aggregate accumulation overflowed");
  }
  return next;
}

function exactSafeInteger(value: bigint, location: string): number {
  if (
    value < BigInt(Number.MIN_SAFE_INTEGER) ||
    value > BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    throw new Error(
      `data conversion: ${location} exceeds safe integer precision`,
    );
  }
  return Number(value);
}

function isCheckpointDomainAggregates(
  value: unknown,
): value is CheckpointDomainAggregates {
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
  return keys.every((key) =>
    key === "confidencePointDelta"
      ? typeof value[key] === "string" && /^(?:0|-?[1-9]\d*)$/.test(value[key])
      : isNonNegativeSafeInteger(value[key]),
  );
}
