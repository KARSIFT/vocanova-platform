export const DATA_EXPORT_SCHEMA_VERSION = "vocanova-postgres-export-v1";
export const DATA_RECONCILIATION_SCHEMA_VERSION =
  "vocanova-d1-reconciliation-v1";

export type FieldKind =
  | "boolean"
  | "bytea"
  | "date"
  | "integer"
  | "json"
  | "text"
  | "timestamp"
  | "uuid";

export type FieldSpec = Readonly<{
  source: string;
  target?: string;
  kind: FieldKind;
  nullable?: boolean;
  defaultWhenNull?: string;
  sensitive?: boolean;
}>;

export type TableSpec = Readonly<{
  name: string;
  fields: readonly FieldSpec[];
  sourceOnlyFields?: readonly FieldSpec[];
}>;

const field = (
  source: string,
  kind: FieldKind,
  options: Omit<FieldSpec, "source" | "kind"> = {},
): FieldSpec => ({ source, kind, ...options });

const lifecycle = [
  field("created_at", "timestamp"),
  field("updated_at", "timestamp"),
] as const;

const uuidId = field("id", "uuid");
const userId = field("user_id", "uuid");

export const DATA_TABLES = [
  {
    name: "users",
    fields: [
      uuidId,
      field("email", "text", { nullable: true }),
      field("display_name", "text", { nullable: true, defaultWhenNull: "" }),
      field("avatar_url", "text", { nullable: true, defaultWhenNull: "" }),
      field("status", "text"),
      field("onboarding_status", "text"),
      field("email_verified_at", "timestamp", { nullable: true }),
      field("last_login_at", "timestamp", { nullable: true }),
      field("deleted_at", "timestamp", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "external_identities",
    fields: [
      uuidId,
      userId,
      field("provider", "text"),
      field("provider_subject", "text", { sensitive: true }),
      field("provider_email", "text", {
        nullable: true,
        defaultWhenNull: "",
        sensitive: true,
      }),
      field("provider_email_verified", "boolean"),
      ...lifecycle,
    ],
    sourceOnlyFields: [
      field("deleted_at", "timestamp", { nullable: true, sensitive: true }),
    ],
  },
  {
    name: "user_onboarding_profiles",
    fields: [
      uuidId,
      userId,
      field("english_level", "text"),
      field("native_language", "text"),
      field("learning_goal", "text"),
      field("main_use_case", "text"),
      field("daily_review_target", "integer"),
      field("completed_at", "timestamp"),
      ...lifecycle,
    ],
  },
  {
    name: "user_settings",
    fields: [
      uuidId,
      userId,
      field("timezone", "text"),
      field("daily_review_target", "integer"),
      field("review_interval_preset", "text"),
      field("notifications_enabled", "boolean"),
      field("marketing_emails_enabled", "boolean"),
      field("app_language", "text"),
      ...lifecycle,
    ],
  },
  {
    name: "sessions",
    fields: [
      uuidId,
      userId,
      field("token_hash", "bytea", { sensitive: true }),
      field("created_at", "timestamp"),
      field("expires_at", "timestamp"),
      field("revoked_at", "timestamp", { nullable: true }),
    ],
  },
  {
    name: "magic_links",
    fields: [
      uuidId,
      field("user_id", "uuid", { nullable: true }),
      field("email", "text", { sensitive: true }),
      field("token_hash", "bytea", { sensitive: true }),
      field("environment", "text"),
      field("created_at", "timestamp"),
      field("expires_at", "timestamp"),
      field("consumed_at", "timestamp", { nullable: true }),
      field("revoked_at", "timestamp", { nullable: true }),
    ],
  },
  {
    name: "oauth_states",
    fields: [
      uuidId,
      field("token_hash", "bytea", { sensitive: true }),
      field("environment", "text"),
      field("provider", "text"),
      field("app_return_url", "text"),
      field("created_at", "timestamp"),
      field("expires_at", "timestamp"),
      field("consumed_at", "timestamp", { nullable: true }),
    ],
  },
  {
    name: "email_change_links",
    fields: [
      uuidId,
      userId,
      field("new_email", "text", { sensitive: true }),
      field("token_hash", "bytea", { sensitive: true }),
      field("environment", "text"),
      field("created_at", "timestamp"),
      field("expires_at", "timestamp"),
      field("consumed_at", "timestamp", { nullable: true }),
      field("revoked_at", "timestamp", { nullable: true }),
    ],
  },
  {
    name: "account_deletion_requests",
    fields: [
      uuidId,
      userId,
      field("status", "text"),
      field("requested_at", "timestamp"),
      field("purge_after", "timestamp"),
      field("completed_at", "timestamp", { nullable: true }),
      field("idempotency_key", "text", { sensitive: true }),
      ...lifecycle,
    ],
  },
  {
    name: "canonical_words",
    fields: [
      uuidId,
      field("text", "text"),
      field("normalized_text", "text"),
      field("word_type", "text"),
      field("language_code", "text"),
      field("status", "text"),
      field("difficulty_level", "text", { nullable: true }),
      field("frequency_rank", "integer", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "word_meanings",
    fields: [
      uuidId,
      field("word_id", "uuid"),
      field("part_of_speech", "text"),
      field("short_definition", "text"),
      field("learner_definition", "text", { nullable: true }),
      field("meaning_order", "integer"),
      field("status", "text"),
      field("difficulty_level", "text", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "word_examples",
    fields: [
      uuidId,
      field("meaning_id", "uuid"),
      field("example_text", "text"),
      field("example_order", "integer"),
      field("difficulty_level", "text", { nullable: true }),
      field("situation_label", "text", { nullable: true }),
      field("status", "text"),
      ...lifecycle,
    ],
  },
  {
    name: "usage_notes",
    fields: [
      uuidId,
      field("meaning_id", "uuid"),
      field("note_type", "text"),
      field("note_text", "text"),
      field("note_order", "integer"),
      field("status", "text"),
      ...lifecycle,
    ],
  },
  {
    name: "journey_situations",
    fields: [
      uuidId,
      field("slug", "text"),
      field("title", "text"),
      field("short_description", "text"),
      field("level_band", "text", { nullable: true }),
      field("category", "text"),
      field("status", "text"),
      field("display_order", "integer"),
      ...lifecycle,
    ],
  },
  {
    name: "journey_words",
    fields: [
      uuidId,
      field("journey_situation_id", "uuid"),
      field("meaning_id", "uuid"),
      field("relevance_score", "integer"),
      field("display_order", "integer", { nullable: true }),
      field("is_core", "boolean"),
      ...lifecycle,
    ],
  },
  {
    name: "user_words",
    fields: [
      uuidId,
      userId,
      field("meaning_id", "uuid"),
      field("status", "text"),
      field("source", "text"),
      field("review_step", "integer"),
      field("next_review_at", "timestamp", { nullable: true }),
      field("last_reviewed_at", "timestamp", { nullable: true }),
      field("last_result", "text", { nullable: true }),
      field("last_rating", "text", { nullable: true }),
      field("consecutive_correct_count", "integer"),
      field("consecutive_incorrect_count", "integer"),
      field("total_review_count", "integer"),
      field("correct_review_count", "integer"),
      field("added_at", "timestamp"),
      field("mastered_at", "timestamp", { nullable: true }),
      field("ignored_at", "timestamp", { nullable: true }),
      field("deleted_at", "timestamp", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "idempotency_keys",
    fields: [
      uuidId,
      userId,
      field("operation", "text"),
      field("key", "text", { sensitive: true }),
      field("fingerprint", "text", { sensitive: true }),
      field("created_at", "timestamp"),
    ],
  },
  {
    name: "review_attempts",
    fields: [
      uuidId,
      userId,
      field("user_word_id", "uuid"),
      field("meaning_id", "uuid"),
      field("attempt_type", "text"),
      field("prompt_type", "text"),
      field("result", "text"),
      field("rating", "text", { nullable: true }),
      field("review_step_before", "integer"),
      field("review_step_after", "integer"),
      field("answered_at", "timestamp"),
      field("response_time_ms", "integer"),
      field("selected_option_meaning_id", "uuid", { nullable: true }),
      field("typed_answer", "text", { nullable: true, sensitive: true }),
      field("was_hint_used", "boolean"),
      field("source", "text"),
      field("client_attempt_id", "text", { nullable: true }),
      field("metadata", "json", { nullable: true, target: "metadata_json" }),
      ...lifecycle,
    ],
  },
  {
    name: "daily_mission_snapshots",
    fields: [
      uuidId,
      userId,
      field("local_date", "date"),
      field("timezone", "text"),
      field("review_target", "integer"),
      field("reviews_completed", "integer"),
      field("new_word_target", "integer", { nullable: true }),
      field("new_words_completed", "integer", { nullable: true }),
      field("sentence_practice_target", "integer", { nullable: true }),
      field("sentence_practices_completed", "integer", { nullable: true }),
      field("policy_version", "text"),
      field("status", "text"),
      field("completed_at", "timestamp", { nullable: true }),
      field("grace_applied", "boolean"),
      field("grace_day_id", "uuid", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "daily_activity_summaries",
    fields: [
      uuidId,
      userId,
      field("local_date", "date"),
      field("timezone", "text"),
      field("reviews_attempted", "integer"),
      field("reviews_correct", "integer"),
      field("reviews_skipped", "integer"),
      field("words_discovered", "integer"),
      field("words_added", "integer"),
      field("sentences_submitted", "integer"),
      field("ai_feedback_received", "integer"),
      field("confidence_points_earned", "integer"),
      field("confidence_points_spent", "integer"),
      ...lifecycle,
    ],
  },
  {
    name: "learner_sentences",
    fields: [
      uuidId,
      userId,
      field("meaning_id", "uuid", { nullable: true }),
      field("user_word_id", "uuid", { nullable: true }),
      field("sentence_text", "text", { sensitive: true }),
      field("normalized_sentence_text", "text", { sensitive: true }),
      field("source", "text"),
      field("status", "text"),
      field("submitted_at", "timestamp"),
      field("deleted_at", "timestamp", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "ai_feedback_attempts",
    fields: [
      uuidId,
      field("learner_sentence_id", "uuid"),
      field("status", "text"),
      field("provider", "text"),
      field("model", "text"),
      field("prompt_version", "text"),
      field("request_hash", "text", { sensitive: true }),
      field("feedback_json", "json", { nullable: true }),
      field("feedback_text", "text", { nullable: true, sensitive: true }),
      field("error_code", "text", { nullable: true }),
      field("error_message", "text", { nullable: true, sensitive: true }),
      field("started_at", "timestamp", { nullable: true }),
      field("completed_at", "timestamp", { nullable: true }),
      ...lifecycle,
    ],
  },
  {
    name: "confidence_point_ledger",
    fields: [
      uuidId,
      userId,
      field("amount", "integer"),
      field("balance_after", "integer"),
      field("reason", "text"),
      field("source_type", "text"),
      field("source_id", "uuid", { nullable: true }),
      field("idempotency_key", "text", { nullable: true, sensitive: true }),
      field("metadata", "json", { nullable: true, target: "metadata_json" }),
      field("occurred_at", "timestamp"),
      ...lifecycle,
    ],
  },
  {
    name: "streak_states",
    fields: [
      uuidId,
      userId,
      field("current_streak_count", "integer"),
      field("longest_streak_count", "integer"),
      field("last_completed_local_date", "date", { nullable: true }),
      field("last_activity_local_date", "date", { nullable: true }),
      field("timezone", "text"),
      field("status", "text"),
      ...lifecycle,
    ],
  },
  {
    name: "grace_day_ledger",
    fields: [
      uuidId,
      userId,
      field("amount", "integer"),
      field("balance_after", "integer"),
      field("reason", "text"),
      field("source_type", "text"),
      field("source_id", "uuid", { nullable: true }),
      field("applied_to_local_date", "date"),
      field("timezone", "text"),
      field("idempotency_key", "text", { nullable: true, sensitive: true }),
      ...lifecycle,
    ],
  },
] as const satisfies readonly TableSpec[];

export type DataTableName = (typeof DATA_TABLES)[number]["name"];

export const DATA_TABLE_NAMES = DATA_TABLES.map(
  (table) => table.name,
) as readonly DataTableName[];

export const DATA_TABLE_BY_NAME = new Map<DataTableName, TableSpec>(
  DATA_TABLES.map((table) => [table.name, table]),
);
