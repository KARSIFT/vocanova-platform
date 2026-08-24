import {
  DATA_EXPORT_SCHEMA_VERSION,
  DATA_TABLE_BY_NAME,
  DATA_TABLE_NAMES,
  type DataTableName,
  type FieldKind,
  type FieldSpec,
  type TableSpec,
} from "./schema.js";

export type D1ImportValue = string | number | null;
export type D1ImportRow = Readonly<Record<string, D1ImportValue>>;

export type DataDomainAggregates = Readonly<{
  activeUsers: number;
  activeSavedWords: number;
  reviewAttempts: number;
  completedMissions: number;
  confidencePointDelta: number;
  successfulAiFeedbackAttempts: number;
}>;

export type ExpectedPageEvidence = Readonly<{
  rowCount: number;
  lastId: string;
  checksum: string;
}>;

export type ImportChunk = Readonly<{
  index: number;
  operation: "clear" | "upsert";
  table: DataTableName;
  rows: readonly D1ImportRow[];
  encodedBytes: number;
}>;

export type D1ImportPlan = Readonly<{
  schemaVersion: typeof DATA_EXPORT_SCHEMA_VERSION;
  exportId: string;
  exportedAt: string;
  checksum: string;
  chunkSize: number;
  maxChunkBytes: number;
  chunks: readonly ImportChunk[];
  expectedRows: Readonly<Record<DataTableName, readonly D1ImportRow[]>>;
  expectedChecksums: Readonly<Record<DataTableName, string>>;
  expectedPageEvidence: Readonly<
    Record<DataTableName, readonly ExpectedPageEvidence[]>
  >;
  expectedDomainAggregates: DataDomainAggregates;
  sourceCounts: Readonly<Record<DataTableName, number>>;
  excludedCounts: Readonly<Record<DataTableName, number>>;
  redactedFieldCount: number;
}>;

type SourceExport = Readonly<{
  schema_version: string;
  export_id: string;
  source: Readonly<{
    dialect: string;
    synthetic: boolean;
    exported_at: string;
  }>;
  tables: Readonly<Record<string, unknown>>;
}>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/i;
const HEX_32_PATTERN = /^[0-9a-f]{64}$/i;

// These repository guardrails are deliberately stricter than Cloudflare's D1
// platform limits. A batch has at most 41 statements (40 rows plus its atomic
// checkpoint), every statement has fewer than 100 bindings, and encoded row
// payloads stay far below D1's 2,000,000-byte row ceiling. The byte estimate
// includes a conservative allowance for SQL and transport framing.
export const D1_IMPORT_MAX_ROWS_PER_CHUNK = 40;
export const D1_IMPORT_MAX_ROW_BYTES = 1_000_000;
export const D1_IMPORT_MAX_CHUNK_BYTES = 1_500_000;
export const D1_IMPORT_MIN_CHUNK_BYTES = 8_192;
export const D1_RECONCILIATION_PAGE_ROWS = 10;
export const D1_RECONCILIATION_CHAIN_SEED = "vocanova-d1-page-chain-v1";
const D1_IMPORT_STATEMENT_OVERHEAD_BYTES = 4_096;
const D1_IMPORT_CHECKPOINT_RESERVE_BYTES = 4_096;

export const DATA_FOREIGN_KEYS = [
  ["external_identities", "user_id", "users"],
  ["user_onboarding_profiles", "user_id", "users"],
  ["user_settings", "user_id", "users"],
  ["sessions", "user_id", "users"],
  ["magic_links", "user_id", "users"],
  ["email_change_links", "user_id", "users"],
  ["account_deletion_requests", "user_id", "users"],
  ["word_meanings", "word_id", "canonical_words"],
  ["word_examples", "meaning_id", "word_meanings"],
  ["usage_notes", "meaning_id", "word_meanings"],
  ["journey_words", "journey_situation_id", "journey_situations"],
  ["journey_words", "meaning_id", "word_meanings"],
  ["user_words", "user_id", "users"],
  ["user_words", "meaning_id", "word_meanings"],
  ["idempotency_keys", "user_id", "users"],
  ["review_attempts", "user_id", "users"],
  ["review_attempts", "user_word_id", "user_words"],
  ["review_attempts", "meaning_id", "word_meanings"],
  ["review_attempts", "selected_option_meaning_id", "word_meanings"],
  ["daily_mission_snapshots", "user_id", "users"],
  ["daily_activity_summaries", "user_id", "users"],
  ["learner_sentences", "user_id", "users"],
  ["learner_sentences", "meaning_id", "word_meanings"],
  ["learner_sentences", "user_word_id", "user_words"],
  ["ai_feedback_attempts", "learner_sentence_id", "learner_sentences"],
  ["confidence_point_ledger", "user_id", "users"],
  ["streak_states", "user_id", "users"],
  ["grace_day_ledger", "user_id", "users"],
] as const satisfies readonly (readonly [
  DataTableName,
  string,
  DataTableName,
])[];

export async function convertPostgresExport(
  input: unknown,
  options: Readonly<{ chunkSize?: number; maxChunkBytes?: number }> = {},
): Promise<D1ImportPlan> {
  const document = validateDocument(input);
  const chunkSize = options.chunkSize ?? D1_IMPORT_MAX_ROWS_PER_CHUNK;
  if (
    !Number.isSafeInteger(chunkSize) ||
    chunkSize < 1 ||
    chunkSize > D1_IMPORT_MAX_ROWS_PER_CHUNK
  ) {
    throw new Error(
      `data conversion: chunkSize must be an integer from 1 to ${D1_IMPORT_MAX_ROWS_PER_CHUNK}`,
    );
  }
  const maxChunkBytes = options.maxChunkBytes ?? D1_IMPORT_MAX_CHUNK_BYTES;
  if (
    !Number.isSafeInteger(maxChunkBytes) ||
    maxChunkBytes < D1_IMPORT_MIN_CHUNK_BYTES ||
    maxChunkBytes > D1_IMPORT_MAX_CHUNK_BYTES
  ) {
    throw new Error(
      `data conversion: maxChunkBytes must be an integer from ${D1_IMPORT_MIN_CHUNK_BYTES} to ${D1_IMPORT_MAX_CHUNK_BYTES}`,
    );
  }

  const expectedRows = {} as Record<DataTableName, readonly D1ImportRow[]>;
  const sourceCounts = {} as Record<DataTableName, number>;
  const excludedCounts = {} as Record<DataTableName, number>;
  let redactedFieldCount = 0;

  for (const tableName of DATA_TABLE_NAMES) {
    const spec = requireTableSpec(tableName);
    const sourceRows = document.tables[tableName] as readonly unknown[];
    sourceCounts[tableName] = sourceRows.length;
    const converted: D1ImportRow[] = [];
    const seenIds = new Set<string>();

    for (const [rowIndex, sourceRow] of sourceRows.entries()) {
      const row = validateSourceRow(spec, sourceRow, rowIndex);
      const normalizedId = normalizeValue(
        "uuid",
        row.id,
        `${tableName}[${rowIndex}].id`,
      ) as string;
      if (seenIds.has(normalizedId)) {
        throw new Error(
          `data conversion: ${tableName} contains duplicate id ${normalizedId}`,
        );
      }
      seenIds.add(normalizedId);

      for (const field of [...spec.fields, ...(spec.sourceOnlyFields ?? [])]) {
        if (field.sensitive && row[field.source] !== null) {
          redactedFieldCount += 1;
        }
      }

      if (tableName === "external_identities" && row.deleted_at !== null) {
        continue;
      }

      const target: Record<string, D1ImportValue> = {};
      for (const field of spec.fields) {
        let value = row[field.source];
        if (value === null && field.defaultWhenNull !== undefined) {
          value = field.defaultWhenNull;
        }
        const targetName = field.target ?? field.source;
        target[targetName] = normalizeField(field, value, tableName, rowIndex);
      }

      applySemanticConversions(tableName, target);
      converted.push(target);
    }

    converted.sort((left, right) =>
      String(left.id).localeCompare(String(right.id)),
    );
    expectedRows[tableName] = converted;
    excludedCounts[tableName] = sourceRows.length - converted.length;
  }

  validateRelationships(expectedRows);

  const { expectedChecksums, expectedPageEvidence } =
    await checksumExpectedTables(expectedRows);
  const expectedDomainAggregates = aggregateExpectedRows(expectedRows);
  const chunks: ImportChunk[] = [];
  // A new export ID is a complete replacement. Clearing in reverse dependency
  // order makes rows omitted by a correction (including newly soft-deleted
  // identities) disappear without violating foreign keys. Every clear and its
  // checkpoint are atomic, so interruption resumes deterministically.
  for (const tableName of [...DATA_TABLE_NAMES].reverse()) {
    chunks.push({
      index: chunks.length,
      operation: "clear",
      table: tableName,
      rows: [],
      encodedBytes:
        encodedByteLength(`DELETE FROM ${tableName}`) +
        D1_IMPORT_CHECKPOINT_RESERVE_BYTES,
    });
  }
  for (const tableName of DATA_TABLE_NAMES) {
    const rows = expectedRows[tableName];
    let pendingRows: D1ImportRow[] = [];
    let pendingBytes = D1_IMPORT_CHECKPOINT_RESERVE_BYTES;
    for (const row of rows) {
      const rowBytes = estimateUpsertStatementBytes(tableName, row);
      if (rowBytes > D1_IMPORT_MAX_ROW_BYTES) {
        throw new Error(
          `data conversion: ${tableName} row ${String(row.id)} exceeds the ${D1_IMPORT_MAX_ROW_BYTES}-byte import guardrail`,
        );
      }
      if (
        pendingRows.length > 0 &&
        (pendingRows.length >= chunkSize ||
          pendingBytes + rowBytes > maxChunkBytes)
      ) {
        chunks.push({
          index: chunks.length,
          operation: "upsert",
          table: tableName,
          rows: pendingRows,
          encodedBytes: pendingBytes,
        });
        pendingRows = [];
        pendingBytes = D1_IMPORT_CHECKPOINT_RESERVE_BYTES;
      }
      if (pendingBytes + rowBytes > maxChunkBytes) {
        throw new Error(
          `data conversion: ${tableName} row ${String(row.id)} cannot fit the configured encoded batch bound`,
        );
      }
      pendingRows.push(row);
      pendingBytes += rowBytes;
    }
    if (pendingRows.length > 0) {
      chunks.push({
        index: chunks.length,
        operation: "upsert",
        table: tableName,
        rows: pendingRows,
        encodedBytes: pendingBytes,
      });
    }
  }

  const exportedAt = normalizeTimestamp(
    document.source.exported_at,
    "source.exported_at",
  );
  const checksum = await sha256(
    canonicalJson({
      schemaVersion: DATA_EXPORT_SCHEMA_VERSION,
      exportId: document.export_id,
      exportedAt,
      chunkSize,
      maxChunkBytes,
      chunks,
      expectedRows,
      expectedChecksums,
      expectedPageEvidence,
      expectedDomainAggregates,
      excludedCounts,
      redactedFieldCount,
    }),
  );

  return {
    schemaVersion: DATA_EXPORT_SCHEMA_VERSION,
    exportId: document.export_id,
    exportedAt,
    checksum,
    chunkSize,
    maxChunkBytes,
    chunks,
    expectedRows,
    expectedChecksums,
    expectedPageEvidence,
    expectedDomainAggregates,
    sourceCounts,
    excludedCounts,
    redactedFieldCount,
  };
}

export function estimateUpsertStatementBytes(
  tableName: DataTableName,
  row: D1ImportRow,
): number {
  const spec = requireTableSpec(tableName);
  const values = spec.fields.map(
    (field) => row[field.target ?? field.source] ?? null,
  );
  return (
    encodedByteLength(canonicalJson({ table: tableName, values })) +
    D1_IMPORT_STATEMENT_OVERHEAD_BYTES
  );
}

export function estimateUpsertChunkBytes(
  tableName: DataTableName,
  rows: readonly D1ImportRow[],
): number {
  return (
    D1_IMPORT_CHECKPOINT_RESERVE_BYTES +
    rows.reduce(
      (total, row) => total + estimateUpsertStatementBytes(tableName, row),
      0,
    )
  );
}

function encodedByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function validateDocument(input: unknown): SourceExport {
  if (!isRecord(input))
    throw new Error("data conversion: export must be an object");
  requireExactKeys(
    input,
    ["export_id", "schema_version", "source", "tables"],
    "export",
  );
  if (input.schema_version !== DATA_EXPORT_SCHEMA_VERSION) {
    throw new Error(
      `data conversion: unsupported schema_version ${String(input.schema_version)}`,
    );
  }
  if (
    typeof input.export_id !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(input.export_id)
  ) {
    throw new Error("data conversion: export_id is not canonical");
  }
  if (!isRecord(input.source)) {
    throw new Error("data conversion: source must be an object");
  }
  requireExactKeys(
    input.source,
    ["dialect", "exported_at", "synthetic"],
    "source",
  );
  if (input.source.dialect !== "postgresql") {
    throw new Error("data conversion: source dialect must be postgresql");
  }
  if (input.source.synthetic !== true) {
    throw new Error(
      "data conversion: production data remains held by VOC-080-HOLD-02",
    );
  }
  normalizeTimestamp(input.source.exported_at, "source.exported_at");
  if (!isRecord(input.tables)) {
    throw new Error("data conversion: tables must be an object");
  }
  requireExactKeys(input.tables, [...DATA_TABLE_NAMES], "tables");
  for (const tableName of DATA_TABLE_NAMES) {
    if (!Array.isArray(input.tables[tableName])) {
      throw new Error(`data conversion: tables.${tableName} must be an array`);
    }
  }
  return input as SourceExport;
}

function validateSourceRow(
  spec: TableSpec,
  input: unknown,
  rowIndex: number,
): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error(
      `data conversion: ${spec.name}[${rowIndex}] must be an object`,
    );
  }
  requireExactKeys(
    input,
    [
      ...spec.fields.map((fieldSpec) => fieldSpec.source),
      ...(spec.sourceOnlyFields ?? []).map((fieldSpec) => fieldSpec.source),
    ],
    `${spec.name}[${rowIndex}]`,
  );
  for (const fieldSpec of [...spec.fields, ...(spec.sourceOnlyFields ?? [])]) {
    const value = input[fieldSpec.source];
    if (value === null && !fieldSpec.nullable) {
      throw new Error(
        `data conversion: ${spec.name}[${rowIndex}].${fieldSpec.source} cannot be null`,
      );
    }
    if (value !== null) {
      normalizeValue(
        fieldSpec.kind,
        value,
        `${spec.name}[${rowIndex}].${fieldSpec.source}`,
      );
    }
  }
  return input;
}

function normalizeField(
  fieldSpec: FieldSpec,
  value: unknown,
  table: string,
  rowIndex: number,
): D1ImportValue {
  if (value === null) return null;
  return normalizeValue(
    fieldSpec.kind,
    value,
    `${table}[${rowIndex}].${fieldSpec.source}`,
  );
}

function normalizeValue(
  kind: FieldKind,
  value: unknown,
  location: string,
): D1ImportValue {
  switch (kind) {
    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error(`data conversion: ${location} must be a boolean`);
      }
      return value ? 1 : 0;
    case "bytea": {
      if (typeof value !== "string") {
        throw new Error(`data conversion: ${location} must be bytea hex text`);
      }
      const hex = value.startsWith("\\x") ? value.slice(2) : value;
      if (!HEX_32_PATTERN.test(hex)) {
        throw new Error(
          `data conversion: ${location} must contain exactly 32 bytes`,
        );
      }
      return hex.toLowerCase();
    }
    case "date":
      return normalizeDate(value, location);
    case "integer":
      return normalizeInteger(value, location);
    case "json":
      return canonicalJson(value, location);
    case "text":
      if (typeof value !== "string") {
        throw new Error(`data conversion: ${location} must be text`);
      }
      return value;
    case "timestamp":
      return normalizeTimestamp(value, location);
    case "uuid":
      if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
        throw new Error(`data conversion: ${location} must be a UUID`);
      }
      return value.toLowerCase();
  }
}

function normalizeDate(value: unknown, location: string): string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new Error(`data conversion: ${location} must be YYYY-MM-DD`);
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`data conversion: ${location} is not a real UTC date`);
  }
  return value;
}

function normalizeInteger(value: unknown, location: string): number {
  if (!(
    (typeof value === "number" && Number.isInteger(value)) ||
    (typeof value === "string" && /^-?(?:0|[1-9]\d*)$/.test(value))
  )) {
    throw new Error(`data conversion: ${location} must be an integer`);
  }
  const normalized = Number(value);
  if (!Number.isSafeInteger(normalized)) {
    throw new Error(
      `data conversion: ${location} exceeds JavaScript safe integer precision`,
    );
  }
  return normalized;
}

function normalizeTimestamp(value: unknown, location: string): string {
  if (typeof value !== "string" || !TIMESTAMP_PATTERN.test(value)) {
    throw new Error(
      `data conversion: ${location} must include an explicit timezone`,
    );
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`data conversion: ${location} is not a valid timestamp`);
  }
  return parsed.toISOString();
}

function applySemanticConversions(
  table: DataTableName,
  row: Record<string, D1ImportValue>,
): void {
  if (table === "users") {
    if (row.deleted_at !== null) row.email = null;
    else if (typeof row.email === "string") row.email = row.email.toLowerCase();
  }
  if (table === "review_attempts" && row.client_attempt_id === null) {
    row.client_attempt_id = `legacy:${String(row.id)}`;
  }
  if (table === "oauth_states" && row.provider !== "google") {
    throw new Error(
      "data conversion: oauth_states.provider is not supported by the Worker schema",
    );
  }
  if (table === "user_settings" && row.app_language !== "en") {
    throw new Error(
      "data conversion: user_settings.app_language is not supported by the Worker schema",
    );
  }
  for (const hashField of ["fingerprint", "request_hash"]) {
    const hash = row[hashField];
    if (
      hash !== undefined &&
      (typeof hash !== "string" || !HEX_32_PATTERN.test(hash))
    ) {
      throw new Error(
        `data conversion: ${table}.${hashField} must be a lowercase-compatible SHA-256 hex digest`,
      );
    }
    if (typeof hash === "string") row[hashField] = hash.toLowerCase();
  }
}

function validateRelationships(
  rowsByTable: Readonly<Record<DataTableName, readonly D1ImportRow[]>>,
): void {
  const idsByTable = new Map<DataTableName, Set<string>>(
    DATA_TABLE_NAMES.map((table) => [
      table,
      new Set(rowsByTable[table].map((row) => String(row.id))),
    ]),
  );
  for (const [table, fieldName, referencedTable] of DATA_FOREIGN_KEYS) {
    const referencedIds = idsByTable.get(referencedTable);
    if (!referencedIds)
      throw new Error("data conversion: internal FK schema error");
    for (const row of rowsByTable[table]) {
      const value = row[fieldName];
      if (value !== null && !referencedIds.has(String(value))) {
        throw new Error(
          `data conversion: ${table}.${fieldName} references missing ${referencedTable} row`,
        );
      }
    }
  }
}

async function checksumExpectedTables(
  rowsByTable: Readonly<Record<DataTableName, readonly D1ImportRow[]>>,
): Promise<{
  expectedChecksums: Record<DataTableName, string>;
  expectedPageEvidence: Record<DataTableName, readonly ExpectedPageEvidence[]>;
}> {
  const expectedChecksums = {} as Record<DataTableName, string>;
  const expectedPageEvidence = {} as Record<
    DataTableName,
    readonly ExpectedPageEvidence[]
  >;
  const emptyChecksum = await sha256(D1_RECONCILIATION_CHAIN_SEED);
  for (const tableName of DATA_TABLE_NAMES) {
    let checksum = emptyChecksum;
    const rows = rowsByTable[tableName];
    const pages: ExpectedPageEvidence[] = [];
    for (
      let offset = 0;
      offset < rows.length;
      offset += D1_RECONCILIATION_PAGE_ROWS
    ) {
      const page = rows.slice(offset, offset + D1_RECONCILIATION_PAGE_ROWS);
      checksum = await sha256(
        canonicalJson({
          previous: checksum,
          rows: page,
        }),
      );
      pages.push({
        rowCount: offset + page.length,
        lastId: String(page.at(-1)?.id),
        checksum,
      });
    }
    expectedChecksums[tableName] = checksum;
    expectedPageEvidence[tableName] = pages;
  }
  return { expectedChecksums, expectedPageEvidence };
}

function aggregateExpectedRows(
  rows: Readonly<Record<DataTableName, readonly D1ImportRow[]>>,
): DataDomainAggregates {
  const confidencePointDelta = rows.confidence_point_ledger.reduce(
    (total, row) => total + BigInt(requireSafeInteger(row.amount, "amount")),
    0n,
  );
  return {
    activeUsers: rows.users.filter((row) => row.status === "active").length,
    activeSavedWords: rows.user_words.filter((row) => row.deleted_at === null)
      .length,
    reviewAttempts: rows.review_attempts.length,
    completedMissions: rows.daily_mission_snapshots.filter(
      (row) => row.status === "completed",
    ).length,
    confidencePointDelta: exactSafeInteger(
      confidencePointDelta,
      "confidence-point aggregate",
    ),
    successfulAiFeedbackAttempts: rows.ai_feedback_attempts.filter(
      (row) => row.status === "succeeded",
    ).length,
  };
}

function requireSafeInteger(value: unknown, location: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new Error(`data conversion: ${location} is not a safe integer`);
  }
  return value;
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

function requireTableSpec(name: DataTableName): TableSpec {
  const spec = DATA_TABLE_BY_NAME.get(name);
  if (!spec) throw new Error(`data conversion: missing table spec for ${name}`);
  return spec;
}

function requireExactKeys(
  value: Readonly<Record<string, unknown>>,
  expected: readonly string[],
  location: string,
): void {
  const actual = Object.keys(value).sort();
  const canonicalExpected = [...new Set(expected)].sort();
  if (
    actual.length !== canonicalExpected.length ||
    actual.some((key, index) => key !== canonicalExpected[index])
  ) {
    throw new Error(
      `data conversion: ${location} keys must be exactly ${canonicalExpected.join(",")}`,
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function canonicalJson(value: unknown, location = "value"): string {
  return JSON.stringify(canonicalValue(value, location));
}

function canonicalValue(value: unknown, location: string): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (typeof value === "number") {
    if (
      !Number.isFinite(value) ||
      (Number.isInteger(value) && !Number.isSafeInteger(value))
    ) {
      throw new Error(
        `data conversion: ${location} JSON numbers must be finite and integers must be safe`,
      );
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      canonicalValue(entry, `${location}[${index}]`),
    );
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue(value[key], `${location}.${key}`)]),
    );
  }
  throw new Error(`data conversion: ${location} is not valid JSON`);
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
