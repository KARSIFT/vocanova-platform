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

export type ImportChunk = Readonly<{
  index: number;
  table: DataTableName;
  rows: readonly D1ImportRow[];
}>;

export type D1ImportPlan = Readonly<{
  schemaVersion: typeof DATA_EXPORT_SCHEMA_VERSION;
  exportId: string;
  exportedAt: string;
  checksum: string;
  chunkSize: number;
  chunks: readonly ImportChunk[];
  expectedRows: Readonly<Record<DataTableName, readonly D1ImportRow[]>>;
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

const FOREIGN_KEYS = [
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
  options: Readonly<{ chunkSize?: number }> = {},
): Promise<D1ImportPlan> {
  const document = validateDocument(input);
  const chunkSize = options.chunkSize ?? 50;
  if (!Number.isSafeInteger(chunkSize) || chunkSize < 1 || chunkSize > 500) {
    throw new Error(
      "data conversion: chunkSize must be an integer from 1 to 500",
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
        if (field.sensitive && value !== null) redactedFieldCount += 1;
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

  const chunks: ImportChunk[] = [];
  for (const tableName of DATA_TABLE_NAMES) {
    const rows = expectedRows[tableName];
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
      chunks.push({
        index: chunks.length,
        table: tableName,
        rows: rows.slice(offset, offset + chunkSize),
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
      expectedRows,
      excludedCounts,
    }),
  );

  return {
    schemaVersion: DATA_EXPORT_SCHEMA_VERSION,
    exportId: document.export_id,
    exportedAt,
    checksum,
    chunkSize,
    chunks,
    expectedRows,
    sourceCounts,
    excludedCounts,
    redactedFieldCount,
  };
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
  for (const [table, fieldName, referencedTable] of FOREIGN_KEYS) {
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
