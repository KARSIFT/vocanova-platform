import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";
import type { ReviewSubmission } from "../src/domain/content-learning.js";
import { D1ContentLearningRepository } from "../src/content/repository.js";

const NOW = "2026-08-22T12:00:00.000Z";
const USER_A = "10000000-0000-4000-8000-000000000001";
const USER_B = "10000000-0000-4000-8000-000000000002";
const WORD_A = "20000000-0000-4000-8000-000000000001";
const WORD_B = "20000000-0000-4000-8000-000000000002";
const MEANING_A = "30000000-0000-4000-8000-000000000001";
const MEANING_B = "30000000-0000-4000-8000-000000000002";
const SITUATION_A = "40000000-0000-4000-8000-000000000001";
const SITUATION_B = "40000000-0000-4000-8000-000000000002";
const USER_WORD_A = "50000000-0000-4000-8000-000000000001";

let repository: D1ContentLearningRepository;

beforeEach(async () => {
  await clearTables();
  await seedContent();
  repository = new D1ContentLearningRepository(env.DB, () => new Date(NOW));
});

describe("Worker content, learning, and review parity", () => {
  it("preserves journey ordering, opaque cursors, detail shape, and requester overlays", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
    );
    const first = await repository.listSituations("", 1);
    expect(first.items.map((item) => item.slug)).toEqual(["at-the-cafe"]);
    expect(first.nextCursor).toBeTruthy();
    const second = await repository.listSituations(first.nextCursor!, 1);
    expect(second.items.map((item) => item.slug)).toEqual(["at-the-airport"]);

    const owner = await repository.getSituation(USER_A, "at-the-cafe");
    const other = await repository.getSituation(USER_B, "at-the-cafe");
    expect(owner.meanings).toEqual([
      expect.objectContaining({
        meaningId: MEANING_A,
        wordSlug: "flat-white",
        saved: true,
      }),
    ]);
    expect(other.meanings[0]?.saved).toBe(false);

    const word = await repository.getWord(USER_A, "flat-white");
    expect(word.word).toMatchObject({
      id: WORD_A,
      text: "flat white",
      wordType: "phrase",
    });
    expect(word.word.meanings[0]).toMatchObject({
      id: MEANING_A,
      saved: true,
      userWordId: USER_WORD_A,
      examples: [
        { exampleText: "A flat white, please.", situationLabel: "At the cafe" },
      ],
      usageNotes: [
        { noteType: "register", noteText: "Common in cafe orders." },
      ],
    });
  });

  it("fails closed on malformed cursors and missing canonical records", async () => {
    await expect(
      repository.listSituations("not-base64", 20),
    ).rejects.toMatchObject({
      code: "invalid_cursor",
    });
    await expect(
      repository.getSituation(USER_A, "missing"),
    ).rejects.toMatchObject({
      code: "situation_not_found",
    });
    await expect(repository.getWord(USER_A, "missing")).rejects.toMatchObject({
      code: "word_not_found",
    });
  });

  it("saves, replays, paginates, unsaves, restores, and isolates learner state", async () => {
    const savedA = await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "journey",
      "save-a",
    );
    const replay = await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "journey",
      "save-a",
    );
    expect(replay).toEqual(savedA);
    await expect(
      repository.saveUserWord(USER_A, MEANING_B, "manual", "save-a"),
    ).rejects.toMatchObject({ code: "idempotency_conflict" });

    await repository.saveUserWord(USER_A, MEANING_B, "manual", "save-b");
    const first = await repository.listSavedWords(USER_A, "", 1);
    expect(first.items).toHaveLength(1);
    const second = await repository.listSavedWords(
      USER_A,
      first.nextCursor!,
      1,
    );
    expect(second.items).toHaveLength(1);
    expect(
      new Set([...first.items, ...second.items].map((item) => item.meaningId)),
    ).toEqual(new Set([MEANING_A, MEANING_B]));
    expect((await repository.listSavedWords(USER_B, "", 20)).items).toEqual([]);

    await expect(
      repository.unsaveUserWord(USER_B, MEANING_A),
    ).rejects.toMatchObject({
      code: "user_word_not_found",
    });
    await repository.unsaveUserWord(USER_A, MEANING_A);
    expect(
      (await repository.getWord(USER_A, "flat-white")).word.meanings[0]?.saved,
    ).toBe(false);
    const restored = await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "search",
      "restore-a",
    );
    expect(restored.userWordId).toBe(savedA.userWordId);
    expect(restored.source).toBe("search");
  });

  it("rolls back the entire save batch when its idempotency record fails", async () => {
    await env.DB.prepare(
      `CREATE TRIGGER fail_save_idempotency BEFORE INSERT ON idempotency_keys
       WHEN NEW.key = 'fail-save' BEGIN SELECT RAISE(ABORT, 'injected failure'); END`,
    ).run();
    await expect(
      repository.saveUserWord(USER_A, MEANING_A, "journey", "fail-save"),
    ).rejects.toThrow("injected failure");
    const rows = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM user_words",
    ).first<{ count: number }>();
    expect(rows?.count).toBe(0);
    await env.DB.prepare("DROP TRIGGER fail_save_idempotency").run();
  });

  it("orders due words, schedules ratings, and replays both idempotency guards exactly once", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
      2,
    );
    const futureId = "50000000-0000-4000-8000-000000000002";
    await insertUserWord(
      futureId,
      USER_A,
      MEANING_B,
      "2026-08-22T11:00:00.000Z",
      1,
    );
    const otherId = "50000000-0000-4000-8000-000000000003";
    await insertUserWord(
      otherId,
      USER_B,
      MEANING_B,
      "2026-08-22T09:00:00.000Z",
    );
    const due = await repository.listDueWords(USER_A, "", 1);
    expect(due.totalCount).toBe(2);
    expect(due.items.map((item) => item.userWordId)).toEqual([USER_WORD_A]);
    const dueSecond = await repository.listDueWords(USER_A, due.nextCursor!, 1);
    expect(dueSecond.items.map((item) => item.userWordId)).toEqual([futureId]);

    const input = review({
      clientAttemptId: "attempt-good",
      rating: "good",
      result: "correct",
    });
    const first = await repository.submitReview(USER_A, input, "review-good");
    const replay = await repository.submitReview(USER_A, input, "review-good");
    const clientReplay = await repository.submitReview(
      USER_A,
      input,
      "different-key",
    );
    expect(replay).toEqual(first);
    expect(clientReplay).toEqual(first);
    expect(first).toMatchObject({
      reviewStepBefore: 2,
      reviewStepAfter: 3,
      nextReviewAt: "2026-08-25T12:00:00.000Z",
    });
    const attemptCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM review_attempts",
    ).first<{ count: number }>();
    expect(attemptCount?.count).toBe(1);
    const keyCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM idempotency_keys WHERE operation = 'reviews:submit'",
    ).first<{ count: number }>();
    expect(keyCount?.count).toBe(2);
    const state = await env.DB.prepare(
      "SELECT review_step, total_review_count, correct_review_count FROM user_words WHERE id = ?1",
    )
      .bind(USER_WORD_A)
      .first<{
        review_step: number;
        total_review_count: number;
        correct_review_count: number;
      }>();
    expect(state).toEqual({
      review_step: 3,
      total_review_count: 1,
      correct_review_count: 1,
    });
  });

  it("applies again, consecutive reset, hard, easy, and skipped transitions", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
      4,
    );
    const again = await repository.submitReview(
      USER_A,
      review({
        clientAttemptId: "again-1",
        result: "incorrect",
        rating: "again",
      }),
      "again-1",
    );
    expect(again.reviewStepAfter).toBe(3);
    const reset = await repository.submitReview(
      USER_A,
      review({
        clientAttemptId: "again-2",
        result: "incorrect",
        rating: "again",
      }),
      "again-2",
    );
    expect(reset.reviewStepAfter).toBe(0);
    const hard = await repository.submitReview(
      USER_A,
      review({ clientAttemptId: "hard", result: "correct", rating: "hard" }),
      "hard",
    );
    expect(hard.reviewStepAfter).toBe(0);
    const easy = await repository.submitReview(
      USER_A,
      review({ clientAttemptId: "easy", result: "correct", rating: "easy" }),
      "easy",
    );
    expect(easy.reviewStepAfter).toBe(1);
    const skipped = await repository.submitReview(
      USER_A,
      review({ clientAttemptId: "skip", result: "skipped", rating: undefined }),
      "skip",
    );
    expect(skipped.reviewStepAfter).toBe(1);
    expect(skipped.rating).toBe("");
  });

  it("rejects invalid, conflicting, and cross-user review submissions", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
    );
    await expect(
      repository.submitReview(USER_B, review({}), "cross-user"),
    ).rejects.toMatchObject({ code: "user_word_not_found" });
    await expect(
      repository.submitReview(
        USER_A,
        review({ result: "incorrect", rating: "good" }),
        "invalid-rating",
      ),
    ).rejects.toMatchObject({ code: "invalid_input" });
    const first = review({ clientAttemptId: "client-conflict" });
    await repository.submitReview(USER_A, first, "key-conflict");
    await expect(
      repository.submitReview(
        USER_A,
        { ...first, responseTimeMs: 999 },
        "key-conflict",
      ),
    ).rejects.toMatchObject({ code: "idempotency_conflict" });
  });

  it("rolls back attempt and schedule together when the review batch fails", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
      2,
    );
    await env.DB.prepare(
      `CREATE TRIGGER fail_review_idempotency BEFORE INSERT ON idempotency_keys
       WHEN NEW.key = 'fail-review' BEGIN SELECT RAISE(ABORT, 'injected failure'); END`,
    ).run();
    await expect(
      repository.submitReview(
        USER_A,
        review({ clientAttemptId: "failed-attempt" }),
        "fail-review",
      ),
    ).rejects.toThrow("injected failure");
    const attempts = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM review_attempts",
    ).first<{ count: number }>();
    const word = await env.DB.prepare(
      "SELECT review_step, total_review_count FROM user_words WHERE id = ?1",
    )
      .bind(USER_WORD_A)
      .first<{ review_step: number; total_review_count: number }>();
    expect(attempts?.count).toBe(0);
    expect(word).toEqual({ review_step: 2, total_review_count: 0 });
    await env.DB.prepare("DROP TRIGGER fail_review_idempotency").run();
  });

  it("keeps all migrated content routes behind authentication", async () => {
    const app = createApp();
    for (const [method, path] of [
      ["GET", "/api/v1/journey-situations"],
      ["GET", "/api/v1/journey-situations/at-the-cafe"],
      ["GET", "/api/v1/canonical-words/flat-white"],
      ["GET", "/api/v1/user-words"],
      ["POST", "/api/v1/user-words"],
      ["DELETE", `/api/v1/user-words/${MEANING_A}`],
      ["GET", "/api/v1/reviews/due"],
      ["POST", "/api/v1/reviews/submissions"],
    ]) {
      const response = await app.request(
        `http://worker.test${path}`,
        { method },
        env,
      );
      expect(response.status, `${method} ${path}`).toBe(401);
    }
  });
});

function review(overrides: Partial<ReviewSubmission>): ReviewSubmission {
  return {
    userWordId: USER_WORD_A,
    meaningId: MEANING_A,
    attemptType: "review",
    promptType: "self_check",
    result: "correct",
    rating: "good",
    answeredAt: NOW,
    responseTimeMs: 250,
    wasHintUsed: false,
    source: "review",
    clientAttemptId: "attempt-default",
    ...overrides,
  };
}

async function clearTables(): Promise<void> {
  for (const table of [
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

async function seedContent(): Promise<void> {
  for (const [id, email] of [
    [USER_A, "a@example.test"],
    [USER_B, "b@example.test"],
  ]) {
    await env.DB.prepare(
      "INSERT INTO users (id, email, status, onboarding_status, created_at, updated_at) VALUES (?1, ?2, 'active', 'completed', ?3, ?3)",
    )
      .bind(id, email, NOW)
      .run();
  }
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO canonical_words
      (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
      VALUES (?1, 'flat white', 'flat white', 'phrase', 'en', 'active', 'b1', ?2, ?2)`,
    ).bind(WORD_A, NOW),
    env.DB.prepare(
      `INSERT INTO canonical_words
      (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
      VALUES (?1, 'boarding pass', 'boarding pass', 'phrase', 'en', 'active', 'a2', ?2, ?2)`,
    ).bind(WORD_B, NOW),
    env.DB.prepare(
      `INSERT INTO word_meanings
      (id, word_id, part_of_speech, short_definition, learner_definition, meaning_order, status, created_at, updated_at)
      VALUES (?1, ?2, 'noun', 'coffee with steamed milk', 'A coffee drink made with milk.', 1, 'active', ?3, ?3)`,
    ).bind(MEANING_A, WORD_A, NOW),
    env.DB.prepare(
      `INSERT INTO word_meanings
      (id, word_id, part_of_speech, short_definition, meaning_order, status, created_at, updated_at)
      VALUES (?1, ?2, 'noun', 'document used to board', 1, 'active', ?3, ?3)`,
    ).bind(MEANING_B, WORD_B, NOW),
    env.DB.prepare(
      `INSERT INTO journey_situations
      (id, slug, title, short_description, level_band, category, status, display_order, created_at, updated_at)
      VALUES (?1, 'at-the-cafe', 'At the cafe', 'Order a drink.', 'a1_a2', 'daily_life', 'active', 10, ?2, ?2)`,
    ).bind(SITUATION_A, NOW),
    env.DB.prepare(
      `INSERT INTO journey_situations
      (id, slug, title, short_description, level_band, category, status, display_order, created_at, updated_at)
      VALUES (?1, 'at-the-airport', 'At the airport', 'Catch a flight.', 'a2_b1', 'travel', 'active', 20, ?2, ?2)`,
    ).bind(SITUATION_B, NOW),
  ]);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO journey_words
      (id, journey_situation_id, meaning_id, display_order, created_at, updated_at)
      VALUES (?1, ?2, ?3, 1, ?4, ?4)`,
    ).bind("60000000-0000-4000-8000-000000000001", SITUATION_A, MEANING_A, NOW),
    env.DB.prepare(
      `INSERT INTO journey_words
      (id, journey_situation_id, meaning_id, display_order, created_at, updated_at)
      VALUES (?1, ?2, ?3, 1, ?4, ?4)`,
    ).bind("60000000-0000-4000-8000-000000000002", SITUATION_B, MEANING_B, NOW),
    env.DB.prepare(
      `INSERT INTO word_examples
      (id, meaning_id, example_text, example_order, situation_label, status, created_at, updated_at)
      VALUES (?1, ?2, 'A flat white, please.', 1, 'At the cafe', 'active', ?3, ?3)`,
    ).bind("70000000-0000-4000-8000-000000000001", MEANING_A, NOW),
    env.DB.prepare(
      `INSERT INTO usage_notes
      (id, meaning_id, note_type, note_text, note_order, status, created_at, updated_at)
      VALUES (?1, ?2, 'register', 'Common in cafe orders.', 1, 'active', ?3, ?3)`,
    ).bind("80000000-0000-4000-8000-000000000001", MEANING_A, NOW),
  ]);
}

async function insertUserWord(
  id: string,
  userId: string,
  meaningId: string,
  addedAt: string,
  reviewStep = 0,
  nextReviewAt: string | null = null,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO user_words
    (id, user_id, meaning_id, status, source, review_step, next_review_at, added_at, created_at, updated_at)
    VALUES (?1, ?2, ?3, 'learning', 'manual', ?4, ?5, ?6, ?6, ?6)`,
  )
    .bind(id, userId, meaningId, reviewStep, nextReviewAt, addedAt)
    .run();
}
