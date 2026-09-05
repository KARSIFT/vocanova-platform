import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { D1ContentLearningRepository } from "../src/content/repository.js";
import { addDays, localDate } from "../src/domain/missions.js";
import { D1MissionsRepository } from "../src/missions/repository.js";

const USER = "11000000-0000-4000-8000-000000000001";
const WORD = "22000000-0000-4000-8000-000000000001";
const MEANING = "33000000-0000-4000-8000-000000000001";
const USER_WORD = "55000000-0000-4000-8000-000000000001";
const NOW = "2026-08-22T23:30:00.000Z";

beforeEach(async () => {
  await clearTables();
  await seed();
});

describe("Worker missions, gamification, streak, and progress parity", () => {
  it("uses deterministic IANA local days and rejects unknown zones", () => {
    const instant = new Date("2026-03-08T07:30:00.000Z");
    expect(localDate(instant, "UTC")).toBe("2026-03-08");
    expect(localDate(instant, "America/Los_Angeles")).toBe("2026-03-07");
    expect(localDate(instant, "Asia/Tehran")).toBe("2026-03-08");
    expect(() => localDate(instant, "Mars/Olympus")).toThrow(
      "invalid_timezone",
    );
  });

  it("handles a valid timezone change that moves the local date backward", async () => {
    await setSettings("Pacific/Honolulu", 5);
    await env.DB.prepare(`INSERT INTO streak_states (id, user_id, current_streak_count, longest_streak_count, last_completed_local_date, last_activity_local_date, timezone, status, created_at, updated_at) VALUES (?1, ?2, 1, 1, '2026-08-23', '2026-08-23', 'Pacific/Kiritimati', 'active', ?3, ?3)`).bind(crypto.randomUUID(), USER, NOW).run();
    const repository = new D1MissionsRepository(env.DB, () => new Date("2026-08-22T12:00:00.000Z"));
    await expect(repository.getProgress(USER, "")).resolves.toMatchObject({ streak: { currentStreakCount: 1, status: "active" } });
    await expect(repository.getProgress(USER, "")).resolves.toMatchObject({ streak: { currentStreakCount: 1, status: "active" } });
    await expect(repository.getDailyMission(USER, "")).resolves.toMatchObject({
      localDate: "2026-08-22",
      streak: { currentStreakCount: 1, status: "active" },
    });
    expect(await pointBalance()).toBe(0);
  });

  it("reconciles a missed local day when progress is read without daily mission", async () => {
    const today = "2026-08-22";
    await env.DB.batch([
      mission(addDays(today, -1), "open", NOW),
      env.DB.prepare(
        `INSERT INTO streak_states (id, user_id, current_streak_count, longest_streak_count, last_completed_local_date, last_activity_local_date, timezone, status, created_at, updated_at) VALUES (?1, ?2, 3, 3, ?3, ?3, 'UTC', 'active', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, addDays(today, -2), NOW),
    ]);
    const repository = new D1MissionsRepository(
      env.DB,
      () => new Date("2026-08-22T12:00:00.000Z"),
    );
    const progress = await repository.getProgress(USER, "UTC");
    expect(progress.streak).toMatchObject({
      currentStreakCount: 0,
      status: "broken",
    });
    expect((await repository.getProgress(USER, "UTC")).streak).toEqual(
      progress.streak,
    );
  });

  it("does not alter a same-day completed streak when progress is read", async () => {
    const today = "2026-08-22";
    await env.DB.batch([
      mission(today, "completed", NOW),
      env.DB.prepare(
        `INSERT INTO streak_states (id, user_id, current_streak_count, longest_streak_count, last_completed_local_date, last_activity_local_date, timezone, status, created_at, updated_at) VALUES (?1, ?2, 3, 3, ?3, ?3, 'UTC', 'active', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, today, NOW),
    ]);
    expect(
      (
        await new D1MissionsRepository(
          env.DB,
          () => new Date("2026-08-22T12:00:00.000Z"),
        ).getProgress(USER, "UTC")
      ).streak,
    ).toMatchObject({ currentStreakCount: 3, status: "active" });
  });

  it("preserves available grace when progress reads an at-risk streak", async () => {
    const today = "2026-08-22";
    await env.DB.batch([
      mission(addDays(today, -2), "completed", NOW),
      mission(addDays(today, -1), "missed", NOW),
      env.DB.prepare(
        `INSERT INTO streak_states (id, user_id, current_streak_count, longest_streak_count, last_completed_local_date, last_activity_local_date, timezone, status, created_at, updated_at) VALUES (?1, ?2, 2, 2, ?3, ?3, 'UTC', 'active', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, addDays(today, -2), NOW),
      env.DB.prepare(
        `INSERT INTO grace_day_ledger (id, user_id, amount, balance_after, reason, source_type, applied_to_local_date, timezone, idempotency_key, created_at, updated_at) VALUES (?1, ?2, 1, 1, 'manual_grant', 'admin', ?3, 'UTC', 'progress-grace', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, addDays(today, -2), NOW),
    ]);
    const repository = new D1MissionsRepository(
      env.DB,
      () => new Date("2026-08-22T12:00:00.000Z"),
    );
    await repository.getProgress(USER, "UTC");
    const first = await repository.getProgress(USER, "UTC");
    expect(first.streak).toMatchObject({
      currentStreakCount: 2,
      status: "at_risk",
      graceDayBalance: 1,
    });
    expect(
      (
        await env.DB.prepare(
          "SELECT count(*) AS count FROM grace_day_ledger WHERE user_id = ?1",
        )
          .bind(USER)
          .first<{ count: number }>()
      )?.count,
    ).toBe(1);
  });

  it("freezes today's snapshot while settings apply on the next local day", async () => {
    let current = new Date("2026-08-22T12:00:00.000Z");
    const repository = new D1MissionsRepository(env.DB, () => current);
    const first = await repository.getDailyMission(USER, "America/New_York");
    expect(first).toMatchObject({
      localDate: "2026-08-22",
      timezone: "America/New_York",
      reviewTarget: 20,
      policyVersion: "p4-mission-policy-v1",
    });
    await env.DB.prepare(
      `INSERT INTO user_settings
       (id, user_id, timezone, daily_review_target, created_at, updated_at)
       VALUES (?1, ?2, 'Asia/Tehran', 35, ?3, ?3)`,
    )
      .bind(crypto.randomUUID(), USER, NOW)
      .run();
    const stable = await repository.getDailyMission(USER, "Europe/London");
    expect(stable).toMatchObject({
      timezone: "America/New_York",
      reviewTarget: 20,
    });
    current = new Date("2026-08-23T23:30:00.000Z");
    const next = await repository.getDailyMission(USER, "Europe/London");
    expect(next).toMatchObject({
      localDate: "2026-08-24",
      timezone: "Asia/Tehran",
      reviewTarget: 35,
    });
  });

  it("preserves a UTC custom target when client timezone selects the local day", async () => {
    let current = new Date("2026-08-22T12:00:00.000Z");
    const repository = new D1MissionsRepository(env.DB, () => current);
    const first = await repository.getDailyMission(USER, "America/New_York");
    expect(first).toMatchObject({
      localDate: "2026-08-22",
      timezone: "America/New_York",
      reviewTarget: 20,
    });
    await env.DB.prepare(
      `INSERT INTO user_settings
       (id, user_id, timezone, daily_review_target, created_at, updated_at)
       VALUES (?1, ?2, 'UTC', 35, ?3, ?3)`,
    )
      .bind(crypto.randomUUID(), USER, NOW)
      .run();
    const stable = await repository.getDailyMission(USER, "Europe/London");
    expect(stable).toMatchObject({
      timezone: "America/New_York",
      reviewTarget: 20,
    });
    current = new Date("2026-08-23T12:00:00.000Z");
    const next = await repository.getDailyMission(USER, "Europe/London");
    expect(next).toMatchObject({
      localDate: "2026-08-23",
      timezone: "Europe/London",
      reviewTarget: 35,
    });
    expect(await repository.resolveSettings(USER, "")).toEqual({
      timezone: "UTC",
      reviewTarget: 35,
    });
  });

  it("awards word and rating points once and completes a five-review mission atomically", async () => {
    await setSettings("Asia/Tehran", 5);
    const content = new D1ContentLearningRepository(
      env.DB,
      () => new Date("2026-08-22T12:00:00.000Z"),
    );
    const saved = await content.saveUserWord(USER, MEANING, "manual", "save");
    await content.saveUserWord(USER, MEANING, "manual", "save");
    expect(await pointBalance()).toBe(2);

    for (let index = 0; index < 5; index += 1) {
      await content.submitReview(
        USER,
        review(saved.userWordId, `attempt-${index}`),
        `review-${index}`,
      );
    }
    await content.submitReview(
      USER,
      review(saved.userWordId, "attempt-4"),
      "review-4",
    );
    expect(await pointBalance()).toBe(37);
    const mission = await new D1MissionsRepository(
      env.DB,
      () => new Date("2026-08-22T12:00:00.000Z"),
    ).getDailyMission(USER, "");
    expect(mission).toMatchObject({
      reviewTarget: 5,
      reviewsCompleted: 5,
      status: "completed",
      streak: { currentStreakCount: 1, status: "active" },
    });
    await content.submitReview(
      USER,
      review(saved.userWordId, "attempt-after-completion"),
      "review-after-completion",
    );
    expect(await pointBalance()).toBe(42);
    expect(
      (
        await new D1MissionsRepository(
          env.DB,
          () => new Date("2026-08-22T12:00:00.000Z"),
        ).getDailyMission(USER, "")
      ).streak.currentStreakCount,
    ).toBe(1);
    const counts = await env.DB.prepare(
      `SELECT
       (SELECT count(*) FROM review_attempts) AS attempts,
       (SELECT count(*) FROM confidence_point_ledger WHERE reason = 'daily_mission_completed') AS completions,
       (SELECT reviews_attempted FROM daily_activity_summaries WHERE user_id = ?1) AS reviews`,
    )
      .bind(USER)
      .first<{ attempts: number; completions: number; reviews: number }>();
    expect(counts).toEqual({ attempts: 6, completions: 1, reviews: 6 });
  });

  it("rolls back review, schedule, ledger, mission, and activity on a downstream failure", async () => {
    await setSettings("Asia/Tehran", 5);
    await insertUserWord();
    await env.DB.prepare(
      `CREATE TRIGGER fail_mission_reward BEFORE INSERT ON confidence_point_ledger
       WHEN NEW.reason = 'daily_mission_completed'
       BEGIN SELECT RAISE(ABORT, 'injected mission failure'); END`,
    ).run();
    await env.DB.prepare(
      `INSERT INTO daily_mission_snapshots
       (id, user_id, local_date, timezone, review_target, reviews_completed,
        policy_version, status, grace_applied, created_at, updated_at)
       VALUES (?1, ?2, '2026-08-22', 'UTC', 5, 4,
               'p4-mission-policy-v1', 'open', 0, ?3, ?3)`,
    )
      .bind(crypto.randomUUID(), USER, "2026-08-22T12:00:00.000Z")
      .run();
    const content = new D1ContentLearningRepository(
      env.DB,
      () => new Date("2026-08-22T12:00:00.000Z"),
    );
    await expect(
      content.submitReview(USER, review(USER_WORD, "failure"), "failure"),
    ).rejects.toThrow("injected mission failure");
    const state = await env.DB.prepare(
      `SELECT
       (SELECT count(*) FROM review_attempts) AS attempts,
       (SELECT count(*) FROM confidence_point_ledger) AS points,
       (SELECT reviews_completed FROM daily_mission_snapshots WHERE user_id = ?1) AS reviews,
       (SELECT total_review_count FROM user_words WHERE id = ?2) AS word_reviews`,
    )
      .bind(USER, USER_WORD)
      .first<{
        attempts: number;
        points: number;
        reviews: number;
        word_reviews: number;
      }>();
    expect(state).toEqual({
      attempts: 0,
      points: 0,
      reviews: 4,
      word_reviews: 0,
    });
    await env.DB.prepare("DROP TRIGGER fail_mission_reward").run();
  });

  it("serializes concurrent completion writes without false progress or duplicate rewards", async () => {
    await setSettings("Asia/Tehran", 5);
    await insertUserWord();
    const timestamp = "2026-08-22T12:00:00.000Z";
    await env.DB.prepare(
      `INSERT INTO daily_mission_snapshots
       (id, user_id, local_date, timezone, review_target, reviews_completed,
        policy_version, status, grace_applied, created_at, updated_at)
       VALUES (?1, ?2, '2026-08-22', 'Asia/Tehran', 5, 3,
               'p4-mission-policy-v1', 'open', 0, ?3, ?3)`,
    )
      .bind(crypto.randomUUID(), USER, timestamp)
      .run();
    const content = new D1ContentLearningRepository(
      env.DB,
      () => new Date(timestamp),
    );
    await Promise.all([
      content.submitReview(
        USER,
        review(USER_WORD, "concurrent-a"),
        "concurrent-a",
      ),
      content.submitReview(
        USER,
        review(USER_WORD, "concurrent-b"),
        "concurrent-b",
      ),
    ]);
    const state = await env.DB.prepare(
      `SELECT
       (SELECT reviews_completed FROM daily_mission_snapshots WHERE user_id = ?1) AS reviews,
       (SELECT count(*) FROM review_attempts WHERE user_id = ?1) AS attempts,
       (SELECT count(*) FROM confidence_point_ledger
        WHERE user_id = ?1 AND reason = 'daily_mission_completed') AS completions,
       (SELECT reviews_attempted FROM daily_activity_summaries WHERE user_id = ?1) AS activity_reviews`,
    )
      .bind(USER)
      .first<{
        reviews: number;
        attempts: number;
        completions: number;
        activity_reviews: number;
      }>();
    expect(state).toEqual({
      reviews: 5,
      attempts: 2,
      completions: 1,
      activity_reviews: 2,
    });
    expect(await pointBalance()).toBe(20);
  });

  it("protects one missed day with grace and exposes reconciled progress", async () => {
    const today = "2026-08-22";
    const timestamp = "2026-08-22T12:00:00.000Z";
    await env.DB.batch([
      mission(addDays(today, -2), "completed", timestamp),
      mission(addDays(today, -1), "missed", timestamp),
      mission(today, "completed", timestamp),
      env.DB.prepare(
        `INSERT INTO streak_states
           (id, user_id, current_streak_count, longest_streak_count,
            last_completed_local_date, last_activity_local_date, timezone, status,
            created_at, updated_at)
           VALUES (?1, ?2, 6, 6, ?3, ?3, 'UTC', 'active', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, addDays(today, -2), timestamp),
      env.DB.prepare(
        `INSERT INTO grace_day_ledger
           (id, user_id, amount, balance_after, reason, source_type,
            applied_to_local_date, timezone, idempotency_key, created_at, updated_at)
           VALUES (?1, ?2, 1, 1, 'manual_grant', 'admin', ?3, 'UTC', 'seed-grace', ?4, ?4)`,
      ).bind(crypto.randomUUID(), USER, addDays(today, -2), timestamp),
    ]);
    const repository = new D1MissionsRepository(
      env.DB,
      () => new Date(timestamp),
    );
    await repository.reconcile(USER, "UTC", today, true);
    const progress = await repository.getProgress(USER, "");
    expect(progress.streak).toEqual({
      currentStreakCount: 7,
      longestStreakCount: 7,
      status: "active",
      graceDayBalance: 1,
    });
    expect(progress.completionHistory).toEqual([
      { localDate: today, completed: true },
      { localDate: addDays(today, -1), completed: true },
      { localDate: addDays(today, -2), completed: true },
    ]);
    const protectedDay = await env.DB.prepare(
      "SELECT status, grace_applied FROM daily_mission_snapshots WHERE user_id = ?1 AND local_date = ?2",
    )
      .bind(USER, addDays(today, -1))
      .first<{ status: string; grace_applied: number }>();
    expect(protectedDay).toEqual({ status: "protected", grace_applied: 1 });
  });
});

function review(userWordId: string, clientAttemptId: string) {
  return {
    userWordId,
    meaningId: MEANING,
    attemptType: "review",
    promptType: "self_check",
    result: "correct",
    rating: "good",
    answeredAt: "2026-08-22T12:00:00.000Z",
    responseTimeMs: 100,
    wasHintUsed: false,
    source: "review",
    clientAttemptId,
  };
}

function mission(date: string, status: string, timestamp: string) {
  return env.DB.prepare(
    `INSERT INTO daily_mission_snapshots
       (id, user_id, local_date, timezone, review_target, reviews_completed,
        policy_version, status, completed_at, grace_applied, created_at, updated_at)
       VALUES (?1, ?2, ?3, 'UTC', 5, ?4, 'p4-mission-policy-v1', ?5, ?6, 0, ?7, ?7)`,
  ).bind(
    crypto.randomUUID(),
    USER,
    date,
    status === "completed" ? 5 : 0,
    status,
    status === "completed" ? timestamp : null,
    timestamp,
  );
}

async function setSettings(timezone: string, target: number): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO user_settings
     (id, user_id, timezone, daily_review_target, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?5)`,
  )
    .bind(crypto.randomUUID(), USER, timezone, target, NOW)
    .run();
}

async function pointBalance(): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT balance_after FROM confidence_point_ledger
     WHERE user_id = ?1 ORDER BY occurred_at DESC, rowid DESC LIMIT 1`,
  )
    .bind(USER)
    .first<{ balance_after: number }>();
  return Number(row?.balance_after ?? 0);
}

async function seed(): Promise<void> {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users (id, email, status, onboarding_status, created_at, updated_at)
         VALUES (?1, 'missions@example.test', 'active', 'completed', ?2, ?2)`,
    ).bind(USER, NOW),
    env.DB.prepare(
      `INSERT INTO canonical_words
         (id, text, normalized_text, word_type, language_code, status, created_at, updated_at)
         VALUES (?1, 'hello', 'hello', 'word', 'en', 'active', ?2, ?2)`,
    ).bind(WORD, NOW),
    env.DB.prepare(
      `INSERT INTO word_meanings
         (id, word_id, part_of_speech, short_definition, meaning_order, status, created_at, updated_at)
         VALUES (?1, ?2, 'interjection', 'a greeting', 1, 'active', ?3, ?3)`,
    ).bind(MEANING, WORD, NOW),
  ]);
}

async function insertUserWord(): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO user_words
     (id, user_id, meaning_id, status, source, review_step, added_at, created_at, updated_at)
     VALUES (?1, ?2, ?3, 'learning', 'manual', 0, ?4, ?4, ?4)`,
  )
    .bind(USER_WORD, USER, MEANING, NOW)
    .run();
}

async function clearTables(): Promise<void> {
  for (const table of [
    "ai_feedback_reports",
    "ai_feedback_attempts",
    "learner_sentences",
    "ai_generation_leases",
    "ai_generation_events",
    "ai_usage_counters",
    "grace_day_ledger",
    "streak_states",
    "confidence_point_ledger",
    "daily_activity_summaries",
    "daily_mission_snapshots",
    "review_attempts",
    "idempotency_keys",
    "user_words",
    "journey_words",
    "usage_notes",
    "word_examples",
    "word_meanings",
    "journey_situations",
    "canonical_words",
    "account_deletion_requests",
    "email_change_links",
    "user_onboarding_profiles",
    "user_settings",
    "oauth_states",
    "magic_links",
    "sessions",
    "external_identities",
    "auth_rate_limits",
    "users",
  ]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}
