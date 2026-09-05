import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { AccountAnonymizationProcessor } from "../src/identity/anonymization.js";

const USER = "10000000-0000-4000-8000-000000000099";
const NOW = "2026-09-05T00:00:00.000Z";
const TOKEN = "a".repeat(64);

beforeEach(async () => {
  for (const table of [
    "ai_feedback_reports", "ai_feedback_attempts", "learner_sentences", "review_attempts", "user_words", "idempotency_keys", "daily_mission_snapshots", "daily_activity_summaries", "confidence_point_ledger", "streak_states", "grace_day_ledger", "ai_generation_events", "ai_generation_leases", "ai_usage_counters", "auth_rate_limits", "magic_links", "external_identities", "sessions",
    "account_deletion_requests", "users",
  ]) await env.DB.prepare(`DELETE FROM ${table}`).run();
});

describe("account anonymization", () => {
  it("dry-runs due accounts without mutating them and ignores non-due accounts", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    const processor = new AccountAnonymizationProcessor(env.DB, () => new Date(NOW));
    expect(await processor.run()).toEqual({ dryRun: true, due: 1, processed: 0, deleted: 0 });
    expect(await env.DB.prepare("SELECT count(*) AS count FROM users").first<{ count: number }>()).toEqual({ count: 1 });
    await env.DB.prepare("UPDATE account_deletion_requests SET purge_after = '2026-09-06T00:00:00.000Z'").run();
    expect(await processor.run()).toEqual({ dryRun: true, due: 0, processed: 0, deleted: 0 });
  });

  it("deletes account-linked identity and session-rate data atomically and is retry-safe", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    const processor = new AccountAnonymizationProcessor(env.DB, () => new Date(NOW));
    expect(await processor.run({ dryRun: false })).toEqual({ dryRun: false, due: 1, processed: 1, deleted: 1 });
    for (const table of ["users", "account_deletion_requests", "sessions", "external_identities", "magic_links", "auth_rate_limits"]) {
      expect(await env.DB.prepare(`SELECT count(*) AS count FROM ${table}`).first<{ count: number }>(), table).toEqual({ count: 0 });
    }
    for (const table of ["learner_sentences", "ai_feedback_attempts", "ai_feedback_reports", "review_attempts", "user_words", "idempotency_keys", "daily_mission_snapshots", "daily_activity_summaries", "confidence_point_ledger", "streak_states", "grace_day_ledger", "ai_generation_events", "ai_generation_leases", "ai_usage_counters"]) {
      expect(await env.DB.prepare(`SELECT count(*) AS count FROM ${table}`).first<{ count: number }>(), table).toEqual({ count: 0 });
    }
    expect(await processor.run({ dryRun: false })).toEqual({ dryRun: false, due: 0, processed: 0, deleted: 0 });
  });

  it("rolls back an account when a dependent delete fails", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    await env.DB.prepare("CREATE TRIGGER fail_anonymization BEFORE DELETE ON sessions BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END").run();
    await expect(new AccountAnonymizationProcessor(env.DB, () => new Date(NOW)).run({ dryRun: false })).rejects.toThrow("synthetic failure");
    expect(await env.DB.prepare("SELECT count(*) AS count FROM users").first<{ count: number }>()).toEqual({ count: 1 });
    expect(await env.DB.prepare("SELECT count(*) AS count FROM account_deletion_requests").first<{ count: number }>()).toEqual({ count: 1 });
    await env.DB.prepare("DROP TRIGGER fail_anonymization").run();
  });

  it("preserves active accounts and shared operational data", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    const other = "10000000-0000-4000-8000-000000000097";
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users (id, email, status, created_at, updated_at) VALUES (?1, 'other@example.test', 'active', ?2, ?2)").bind(other, NOW),
      env.DB.prepare("INSERT INTO account_deletion_requests (id, user_id, requested_at, purge_after, idempotency_key, created_at, updated_at) VALUES ('20000000-0000-4000-8000-000000000097', ?1, '2026-08-01T00:00:00.000Z', '2026-08-02T00:00:00.000Z', 'other', ?2, ?2)").bind(other, NOW),
      env.DB.prepare("INSERT INTO magic_links (id, user_id, email, token_hash, environment, created_at, expires_at) VALUES ('40000000-0000-4000-8000-000000000097', ?1, 'person@example.test', ?2, 'local', ?3, '2026-10-01T00:00:00.000Z')").bind(other, "e".repeat(64), NOW),
      env.DB.prepare("INSERT INTO auth_rate_limits (bucket_key, window_started_at, attempts) VALUES ('account.delete:ip:shared', 0, 1)"),
      env.DB.prepare("INSERT INTO ai_usage_counters (scope, subject, period, request_count, estimated_cost_cents, updated_at) VALUES ('global_day', 'global', '2026-09-01', 1, 1, ?1)").bind(NOW),
    ]);
    await new AccountAnonymizationProcessor(env.DB, () => new Date(NOW)).run({ dryRun: false });
    for (const table of ["users", "account_deletion_requests", "magic_links", "auth_rate_limits", "ai_usage_counters", "canonical_words"]) {
      expect(await env.DB.prepare(`SELECT count(*) AS count FROM ${table}`).first<{ count: number }>(), table).toEqual({ count: 1 });
    }
  });
});

async function seed(purgeAfter: string) {
  await env.DB.batch([
    env.DB.prepare("INSERT INTO users (id, email, status, deleted_at, created_at, updated_at) VALUES (?1, NULL, 'deleted', ?2, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO external_identities (id, user_id, provider, provider_subject, provider_email, provider_email_verified, created_at, updated_at) VALUES ('20000000-0000-4000-8000-000000000099', ?1, 'email', 'person@example.test', 'person@example.test', 1, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES ('30000000-0000-4000-8000-000000000099', ?1, ?2, ?3, '2026-10-01T00:00:00.000Z')").bind(USER, TOKEN, NOW),
    env.DB.prepare("INSERT INTO magic_links (id, user_id, email, token_hash, environment, created_at, expires_at) VALUES ('40000000-0000-4000-8000-000000000099', NULL, 'person@example.test', ?1, 'local', ?2, '2026-10-01T00:00:00.000Z')").bind("b".repeat(64), NOW),
    env.DB.prepare("INSERT INTO account_deletion_requests (id, user_id, requested_at, purge_after, idempotency_key, created_at, updated_at) VALUES ('50000000-0000-4000-8000-000000000099', ?1, '2026-08-01T00:00:00.000Z', ?2, 'delete', ?3, ?3)").bind(USER, purgeAfter, NOW),
    env.DB.prepare("INSERT INTO auth_rate_limits (bucket_key, window_started_at, attempts) VALUES (?1, 0, 1)").bind(`account.delete:session:${TOKEN}`),
    env.DB.prepare("INSERT OR IGNORE INTO canonical_words (id, text, normalized_text, word_type, language_code, status, created_at, updated_at) VALUES ('60000000-0000-4000-8000-000000000099', 'test', 'test', 'word', 'en', 'active', ?1, ?1)").bind(NOW),
    env.DB.prepare("INSERT OR IGNORE INTO word_meanings (id, word_id, part_of_speech, short_definition, meaning_order, status, created_at, updated_at) VALUES ('70000000-0000-4000-8000-000000000099', '60000000-0000-4000-8000-000000000099', 'noun', 'test', 1, 'active', ?1, ?1)").bind(NOW),
    env.DB.prepare("INSERT INTO user_words (id, user_id, meaning_id, status, source, added_at, created_at, updated_at) VALUES ('80000000-0000-4000-8000-000000000099', ?1, '70000000-0000-4000-8000-000000000099', 'learning', 'manual', ?2, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO review_attempts (id, user_id, user_word_id, meaning_id, attempt_type, prompt_type, result, review_step_before, review_step_after, answered_at, selected_option_meaning_id, typed_answer, was_hint_used, source, client_attempt_id, metadata_json, created_at, updated_at) VALUES ('81000000-0000-4000-8000-000000000099', ?1, '80000000-0000-4000-8000-000000000099', '70000000-0000-4000-8000-000000000099', 'review', 'self_check', 'skipped', 0, 0, ?2, '70000000-0000-4000-8000-000000000099', 'private', 0, 'review', 'test', '{\"private\":true}', ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO idempotency_keys (id, user_id, operation, key, fingerprint, created_at) VALUES ('82000000-0000-4000-8000-000000000099', ?1, 'review', 'private', ?2, ?3)").bind(USER, "c".repeat(64), NOW),
    env.DB.prepare("INSERT INTO learner_sentences (id, user_id, user_word_id, sentence_text, normalized_sentence_text, source, submitted_at, created_at, updated_at) VALUES ('83000000-0000-4000-8000-000000000099', ?1, '80000000-0000-4000-8000-000000000099', 'private text', 'private text', 'free_practice', ?2, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO ai_feedback_attempts (id, learner_sentence_id, status, provider, model, prompt_version, request_hash, feedback_text, created_at, updated_at) VALUES ('84000000-0000-4000-8000-000000000099', '83000000-0000-4000-8000-000000000099', 'pending', 'test', 'test', 'v1', ?1, 'private feedback', ?2, ?2)").bind("d".repeat(64), NOW),
    env.DB.prepare("INSERT INTO ai_feedback_reports (id, attempt_id, user_id, reason, created_at) VALUES ('85000000-0000-4000-8000-000000000099', '84000000-0000-4000-8000-000000000099', ?1, 'private', ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO daily_mission_snapshots (id, user_id, local_date, timezone, review_target, reviews_completed, policy_version, status, grace_applied, created_at, updated_at) VALUES ('86000000-0000-4000-8000-000000000099', ?1, '2026-09-01', 'UTC', 5, 0, 'test', 'open', 0, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO daily_activity_summaries (id, user_id, local_date, timezone, created_at, updated_at) VALUES ('87000000-0000-4000-8000-000000000099', ?1, '2026-09-01', 'UTC', ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO confidence_point_ledger (id, user_id, amount, balance_after, reason, source_type, metadata_json, occurred_at, created_at, updated_at) VALUES ('88000000-0000-4000-8000-000000000099', ?1, 1, 1, 'admin_adjustment', 'admin', '{\"private\":true}', ?2, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO streak_states (id, user_id, timezone, created_at, updated_at) VALUES ('89000000-0000-4000-8000-000000000099', ?1, 'UTC', ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO grace_day_ledger (id, user_id, amount, balance_after, reason, source_type, applied_to_local_date, timezone, created_at, updated_at) VALUES ('90000000-0000-4000-8000-000000000099', ?1, 1, 1, 'manual_grant', 'admin', '2026-09-01', 'UTC', ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO ai_usage_counters (scope, subject, period, request_count, estimated_cost_cents, updated_at) VALUES ('user_day', ?1, '2026-09-01', 1, 1, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO ai_generation_events (id, user_id, occurred_at, estimated_cost_cents) VALUES ('91000000-0000-4000-8000-000000000099', ?1, ?2, 1)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO ai_generation_leases (user_id, lease_id, expires_at, created_at) VALUES (?1, '92000000-0000-4000-8000-000000000099', '2026-10-01T00:00:00.000Z', ?2)").bind(USER, NOW),
  ]);
}
