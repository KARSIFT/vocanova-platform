import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { createApp, createOpenApiDocument } from "../src/app.js";
import type { ReviewSubmission } from "../src/domain/content-learning.js";
import {
  D1ContentLearningRepository,
  projectWordReviewState,
} from "../src/content/repository.js";

const NOW = "2026-08-22T12:00:00.000Z";
const REVIEW_NOW = "2026-08-24T12:00:00.000Z";
const USER_A = "10000000-0000-4000-8000-000000000001";
const USER_B = "10000000-0000-4000-8000-000000000002";
const WORD_A = "20000000-0000-4000-8000-000000000001";
const WORD_B = "20000000-0000-4000-8000-000000000002";
const MEANING_A = "30000000-0000-4000-8000-000000000001";
const MEANING_B = "30000000-0000-4000-8000-000000000002";
const MEANING_C = "30000000-0000-4000-8000-000000000003";
const SITUATION_A = "40000000-0000-4000-8000-000000000001";
const SITUATION_B = "40000000-0000-4000-8000-000000000002";
const USER_WORD_A = "50000000-0000-4000-8000-000000000001";
const USER_WORD_B = "50000000-0000-4000-8000-000000000002";

let repository: D1ContentLearningRepository;

beforeEach(async () => {
  await clearTables();
  await seedContent();
  repository = new D1ContentLearningRepository(env.DB, () => new Date(NOW));
});

describe("Worker content, learning, and review parity", () => {
  it("projects every Word Detail review state and fails closed on unknown persisted status", () => {
    const cases = [
      ["new", null, "due"],
      ["new", REVIEW_NOW, "due"],
      ["new", "2026-08-24T12:00:00.001Z", "new"],
      ["learning", "2026-08-24T11:59:59.999Z", "due"],
      ["learning", "2026-08-24T12:00:00.001Z", "learning"],
      ["reviewing", REVIEW_NOW, "due"],
      ["reviewing", "2026-08-24T12:00:00.001Z", "reviewing"],
      ["mastered", null, "mastered"],
      ["mastered", "2026-08-24T11:59:59.999Z", "mastered"],
      ["ignored", null, "not_reviewing"],
      ["ignored", "2026-08-24T11:59:59.999Z", "not_reviewing"],
      ["archived", null, "not_reviewing"],
      ["archived", "2026-08-24T11:59:59.999Z", "not_reviewing"],
    ] as const;
    for (const [status, nextReviewAt, expected] of cases) {
      expect(
        projectWordReviewState(status, nextReviewAt, REVIEW_NOW),
        `${status}:${nextReviewAt ?? "null"}`,
      ).toBe(expected);
    }
    expect(projectWordReviewState(null, null, REVIEW_NOW)).toBeNull();
    expect(() =>
      projectWordReviewState("unsupported", null, REVIEW_NOW),
    ).toThrowError(new Error("unsupported user_words status"));
  });

  it("captures one request clock for all Word Detail meanings", async () => {
    await env.DB.prepare(
      `INSERT INTO word_meanings
       (id, word_id, part_of_speech, short_definition, meaning_order, status, created_at, updated_at)
       VALUES (?1, ?2, 'noun', 'a second coffee meaning', 2, 'active', ?3, ?3)`,
    )
      .bind(MEANING_C, WORD_A, NOW)
      .run();
    await insertUserWord(USER_WORD_A, USER_A, MEANING_A, NOW, 0, REVIEW_NOW);
    await insertUserWord(
      "50000000-0000-4000-8000-000000000004",
      USER_A,
      MEANING_C,
      NOW,
      0,
      "2026-08-24T12:00:00.001Z",
    );
    const instants = [REVIEW_NOW, "2026-08-24T12:00:00.001Z"];
    let clockCalls = 0;
    const countingRepository = new D1ContentLearningRepository(env.DB, () => {
      const instant = instants[Math.min(clockCalls, instants.length - 1)]!;
      clockCalls += 1;
      return new Date(instant);
    });

    const response = await countingRepository.getWord(USER_A, "flat-white");

    expect(clockCalls).toBe(1);
    expect(
      response.word.meanings.map((meaning) => meaning.reviewState),
    ).toEqual(["due", "learning"]);
  });

  it("keeps Word Detail state minimized for absent, active, and soft-deleted rows", async () => {
    const absent = (await repository.getWord(USER_A, "flat-white")).word
      .meanings[0]!;
    expect(absent).toMatchObject({ saved: false, reviewState: null });
    expect(absent).not.toHaveProperty("userWordId");
    expect(Object.keys(absent).sort()).toEqual(
      [
        "examples",
        "id",
        "learnerDefinition",
        "partOfSpeech",
        "reviewState",
        "saved",
        "shortDefinition",
        "usageNotes",
      ].sort(),
    );

    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      NOW,
      0,
      "2026-08-24T12:00:00.001Z",
    );
    const active = (await repository.getWord(USER_A, "flat-white")).word
      .meanings[0]!;
    expect(active).toMatchObject({
      saved: true,
      userWordId: USER_WORD_A,
      reviewState: "learning",
    });
    expect(Object.keys(active).sort()).toEqual(
      [...Object.keys(absent), "userWordId"].sort(),
    );
    expect(active.examples).toEqual(absent.examples);
    expect(active.usageNotes).toEqual(absent.usageNotes);
    for (const rawField of [
      "status",
      "reviewStep",
      "nextReviewAt",
      "lastResult",
      "lastRating",
    ]) {
      expect(active).not.toHaveProperty(rawField);
    }

    await env.DB.prepare("UPDATE user_words SET deleted_at = ?1 WHERE id = ?2")
      .bind(NOW, USER_WORD_A)
      .run();
    const deleted = (await repository.getWord(USER_A, "flat-white")).word
      .meanings[0]!;
    expect(deleted).toMatchObject({ saved: false, reviewState: null });
    expect(deleted).not.toHaveProperty("userWordId");
    expect(Object.keys(deleted).sort()).toEqual(Object.keys(absent).sort());
  });

  it("isolates canonical Word Detail state through two real session cookies", async () => {
    const tokenA = "vocanova-user-a-session";
    const tokenB = "vocanova-user-b-session";
    await insertUserWord(USER_WORD_A, USER_A, MEANING_A, NOW, 0, null, "new");
    await insertUserWord(
      "50000000-0000-4000-8000-000000000005",
      USER_B,
      MEANING_A,
      NOW,
      0,
      REVIEW_NOW,
      "mastered",
    );
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
         VALUES (?1, ?2, ?3, ?4, '9999-12-31T23:59:59.999Z')`,
      ).bind(
        "90000000-0000-4000-8000-000000000001",
        USER_A,
        await hashToken(tokenA),
        NOW,
      ),
      env.DB.prepare(
        `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
         VALUES (?1, ?2, ?3, ?4, '9999-12-31T23:59:59.999Z')`,
      ).bind(
        "90000000-0000-4000-8000-000000000002",
        USER_B,
        await hashToken(tokenB),
        NOW,
      ),
    ]);
    const app = createApp();
    const requestFor = (token: string) =>
      app.request(
        "http://worker.test/api/v1/canonical-words/flat-white",
        { headers: { cookie: `vocanova_session=${token}` } },
        env,
      );

    const [responseA, responseB, anonymous] = await Promise.all([
      requestFor(tokenA),
      requestFor(tokenB),
      app.request(
        "http://worker.test/api/v1/canonical-words/flat-white",
        {},
        env,
      ),
    ]);
    expect(responseA.status).toBe(200);
    expect(responseB.status).toBe(200);
    expect(anonymous.status).toBe(401);
    const bodyA = (await responseA.json()) as WordDetailRouteBody;
    const bodyB = (await responseB.json()) as WordDetailRouteBody;
    expect(bodyA.word.meanings[0]).toMatchObject({
      saved: true,
      userWordId: USER_WORD_A,
      reviewState: "due",
    });
    expect(bodyB.word.meanings[0]).toMatchObject({
      saved: true,
      userWordId: "50000000-0000-4000-8000-000000000005",
      reviewState: "mastered",
    });
    expect(JSON.stringify(bodyA)).not.toContain(
      "50000000-0000-4000-8000-000000000005",
    );
    expect(JSON.stringify(bodyB)).not.toContain(USER_WORD_A);
  });

  it("publishes reviewState as one required nullable OpenAPI enum", () => {
    const document = createOpenApiDocument() as CanonicalWordOpenApi;
    const meaningSchema =
      document.paths["/api/v1/canonical-words/{wordSlug}"].get.responses["200"]
        .content["application/json"].schema.properties.word.properties.meanings
        .items;
    expect(meaningSchema.required).toContain("reviewState");
    expect(meaningSchema.properties.reviewState).toEqual({
      enum: [
        "due",
        "new",
        "learning",
        "reviewing",
        "mastered",
        "not_reviewing",
        null,
      ],
      type: ["string", "null"],
    });
  });

  it("publishes the shared idempotency key boundary for every retry-sensitive operation", () => {
    const document = createOpenApiDocument() as {
      paths: Record<
        string,
        { post?: { parameters?: Array<{ name: string; schema: unknown }> } }
      >;
    };
    for (const path of [
      "/api/v1/user-words",
      "/api/v1/reviews/submissions",
      "/api/v1/sentence-feedback",
      "/api/v1/account-deletion-requests",
    ]) {
      const parameter = document.paths[path]?.post?.parameters?.find(
        (candidate) => candidate.name === "Idempotency-Key",
      );
      expect(parameter?.schema, path).toEqual({
        type: "string",
        minLength: 1,
        maxLength: 200,
      });
    }
  });

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
      reviewState: "due",
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

  it("resets a restored word into the due queue without erasing review evidence", async () => {
    const saved = await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "manual",
      "restore-schedule-save",
    );
    await repository.submitReview(
      USER_A,
      review({
        userWordId: saved.userWordId,
        clientAttemptId: "restore-schedule-review",
      }),
      "restore-schedule-review",
    );
    await env.DB.prepare(
      `UPDATE user_words
       SET status = 'mastered', review_step = 7, mastered_at = ?1, ignored_at = NULL
       WHERE id = ?2`,
    )
      .bind(NOW, saved.userWordId)
      .run();
    await repository.unsaveUserWord(USER_A, MEANING_A);
    await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "search",
      "restore-schedule-resave",
    );
    const ignored = await repository.saveUserWord(
      USER_A,
      MEANING_B,
      "manual",
      "restore-ignored-save",
    );
    await env.DB.prepare(
      `UPDATE user_words
       SET status = 'ignored', ignored_at = ?1, mastered_at = NULL
       WHERE id = ?2`,
    )
      .bind(NOW, ignored.userWordId)
      .run();
    await repository.unsaveUserWord(USER_A, MEANING_B);
    await repository.saveUserWord(
      USER_A,
      MEANING_B,
      "search",
      "restore-ignored-resave",
    );

    expect(
      (await repository.getWord(USER_A, "flat-white")).word.meanings[0],
    ).toMatchObject({ saved: true, reviewState: "due" });
    expect(
      (await repository.listDueWords(USER_A, "", 20)).items.map(
        (item) => item.userWordId,
      ),
    ).toContain(saved.userWordId);
    expect(
      await env.DB.prepare(
        `SELECT status, review_step, next_review_at, last_reviewed_at, total_review_count,
                correct_review_count, consecutive_correct_count,
                consecutive_incorrect_count, mastered_at, ignored_at
         FROM user_words WHERE id = ?1`,
      )
        .bind(saved.userWordId)
        .first<{
          status: string;
          review_step: number;
          next_review_at: string | null;
          last_reviewed_at: string | null;
          total_review_count: number;
          correct_review_count: number;
          consecutive_correct_count: number;
          consecutive_incorrect_count: number;
          mastered_at: string | null;
          ignored_at: string | null;
        }>(),
    ).toEqual({
      status: "new",
      review_step: 0,
      next_review_at: null,
      last_reviewed_at: NOW,
      total_review_count: 1,
      correct_review_count: 1,
      consecutive_correct_count: 0,
      consecutive_incorrect_count: 0,
      mastered_at: null,
      ignored_at: null,
    });
    await expect(
      env.DB.prepare(
        "SELECT status, review_step, next_review_at, mastered_at, ignored_at FROM user_words WHERE id = ?1",
      )
        .bind(ignored.userWordId)
        .first(),
    ).resolves.toEqual({
      status: "new",
      review_step: 0,
      next_review_at: null,
      mastered_at: null,
      ignored_at: null,
    });
    expect(
      (
        await env.DB.prepare(
          "SELECT count(*) AS count FROM review_attempts WHERE user_word_id = ?1",
        )
          .bind(saved.userWordId)
          .first<{ count: number }>()
      )?.count,
    ).toBe(1);
    expect(
      (
        await env.DB.prepare(
          "SELECT count(*) AS count FROM confidence_point_ledger WHERE reason = 'word_added'",
        ).first<{ count: number }>()
      )?.count,
    ).toBe(2);
  });

  it("accepts 200-character content idempotency keys and rejects 201", async () => {
    const accepted = "a".repeat(200);
    const rejected = "b".repeat(201);
    const saved = await repository.saveUserWord(
      USER_A,
      MEANING_A,
      "manual",
      accepted,
    );
    await expect(
      repository.saveUserWord(USER_A, MEANING_B, "manual", rejected),
    ).rejects.toMatchObject({ code: "invalid_idempotency" });
    await expect(
      repository.submitReview(
        USER_A,
        review({
          userWordId: saved.userWordId,
          clientAttemptId: "boundary-review",
        }),
        accepted,
      ),
    ).resolves.toMatchObject({ userWordId: saved.userWordId });
    await expect(
      repository.submitReview(
        USER_A,
        review({
          userWordId: saved.userWordId,
          clientAttemptId: "boundary-review-rejected",
        }),
        rejected,
      ),
    ).rejects.toMatchObject({ code: "invalid_idempotency" });
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

  it("isolates the same review idempotency key between users", async () => {
    await insertUserWord(USER_WORD_A, USER_A, MEANING_A, NOW);
    await insertUserWord(USER_WORD_B, USER_B, MEANING_B, NOW);

    await expect(
      repository.submitReview(
        USER_A,
        review({ clientAttemptId: "shared-key-a" }),
        "shared-review-key",
      ),
    ).resolves.toMatchObject({ userWordId: USER_WORD_A });
    await expect(
      repository.submitReview(
        USER_B,
        review({
          userWordId: USER_WORD_B,
          meaningId: MEANING_B,
          clientAttemptId: "shared-key-b",
        }),
        "shared-review-key",
      ),
    ).resolves.toMatchObject({ userWordId: USER_WORD_B });

    const rows = await env.DB.prepare(
      `SELECT user_id, count(*) AS count FROM idempotency_keys
       WHERE operation = 'reviews:submit' AND key = 'shared-review-key'
       GROUP BY user_id ORDER BY user_id`,
    ).all<{ user_id: string; count: number }>();
    expect(rows.results).toEqual([
      { user_id: USER_A, count: 1 },
      { user_id: USER_B, count: 1 },
    ]);
    const schedules = await env.DB.prepare(
      `SELECT user_id, total_review_count FROM user_words
       WHERE id IN (?1, ?2) ORDER BY user_id`,
    )
      .bind(USER_WORD_A, USER_WORD_B)
      .all<{ user_id: string; total_review_count: number }>();
    expect(schedules.results).toEqual([
      { user_id: USER_A, total_review_count: 1 },
      { user_id: USER_B, total_review_count: 1 },
    ]);
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
    const skippedReplay = await repository.submitReview(
      USER_A,
      review({ clientAttemptId: "skip", result: "skipped", rating: undefined }),
      "skip",
    );
    expect(skipped.reviewStepAfter).toBe(1);
    expect(skipped).not.toHaveProperty("rating");
    expect(skippedReplay).toEqual(skipped);
  });

  it("publishes review rating as an optional four-value OpenAPI enum", () => {
    const document = createOpenApiDocument() as ReviewSubmissionOpenApi;
    const attemptSchema =
      document.paths["/api/v1/reviews/submissions"].post.responses["200"]
        .content["application/json"].schema;

    expect(attemptSchema.required).not.toContain("rating");
    expect(attemptSchema.properties.rating).toEqual({
      enum: ["again", "hard", "good", "easy"],
      type: "string",
    });
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

  it("rejects forged multiple-choice results before changing review state", async () => {
    await insertUserWord(
      USER_WORD_A,
      USER_A,
      MEANING_A,
      "2026-08-22T10:00:00.000Z",
      2,
    );
    const multipleChoice = {
      promptType: "multiple_choice" as const,
      selectedOptionMeaningId: MEANING_B,
    };
    await expect(
      repository.submitReview(
        USER_A,
        review({ ...multipleChoice, clientAttemptId: "forged-correct" }),
        "forged-correct",
      ),
    ).rejects.toMatchObject({ code: "invalid_input" });
    await expect(
      repository.submitReview(
        USER_A,
        review({
          ...multipleChoice,
          clientAttemptId: "forged-incorrect",
          result: "incorrect",
          rating: "again",
          selectedOptionMeaningId: MEANING_A,
        }),
        "forged-incorrect",
      ),
    ).rejects.toMatchObject({ code: "invalid_input" });
    await expect(
      repository.submitReview(
        USER_A,
        review({
          promptType: "multiple_choice",
          clientAttemptId: "missing-selection",
        }),
        "missing-selection",
      ),
    ).rejects.toMatchObject({ code: "invalid_input" });
    const word = await env.DB.prepare(
      "SELECT review_step, total_review_count FROM user_words WHERE id = ?1",
    )
      .bind(USER_WORD_A)
      .first<{ review_step: number; total_review_count: number }>();
    expect(word).toEqual({ review_step: 2, total_review_count: 0 });
    await expect(
      repository.submitReview(
        USER_A,
        review({
          promptType: "multiple_choice",
          selectedOptionMeaningId: MEANING_A,
          clientAttemptId: "objective-correct",
        }),
        "objective-correct",
      ),
    ).resolves.toMatchObject({ result: "correct", reviewStepAfter: 3 });
  });

  it("returns a client-validation response for a forged multiple-choice API payload", async () => {
    const token = "multiple-choice-session";
    const csrf = "multiple-choice-csrf";
    await insertUserWord(USER_WORD_A, USER_A, MEANING_A, NOW);
    await env.DB.prepare(
      `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
       VALUES (?1, ?2, ?3, ?4, '9999-12-31T23:59:59.999Z')`,
    )
      .bind(
        "90000000-0000-4000-8000-000000000003",
        USER_A,
        await hashToken(token),
        NOW,
      )
      .run();
    const response = await createApp().request(
      "http://worker.test/api/v1/reviews/submissions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `vocanova_session=${token}; vocanova_csrf=${csrf}`,
          "x-csrf-token": csrf,
          "idempotency-key": "forged-api-review",
        },
        body: JSON.stringify(
          review({
            promptType: "multiple_choice",
            selectedOptionMeaningId: MEANING_B,
            clientAttemptId: "forged-api-review",
          }),
        ),
      },
      env,
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ detail: "invalid request" });
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
      ["GET", "/api/v1/daily-mission"],
      ["GET", "/api/v1/progress"],
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
  status = "learning",
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO user_words
    (id, user_id, meaning_id, status, source, review_step, next_review_at, added_at, created_at, updated_at)
    VALUES (?1, ?2, ?3, ?7, 'manual', ?4, ?5, ?6, ?6, ?6)`,
  )
    .bind(id, userId, meaningId, reviewStep, nextReviewAt, addedAt, status)
    .run();
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

interface WordDetailRouteBody {
  word: {
    meanings: Array<{
      saved: boolean;
      userWordId?: string;
      reviewState: string | null;
    }>;
  };
}

interface CanonicalWordOpenApi {
  paths: {
    "/api/v1/canonical-words/{wordSlug}": {
      get: {
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    word: {
                      properties: {
                        meanings: {
                          items: {
                            required: string[];
                            properties: { reviewState: unknown };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
}

interface ReviewSubmissionOpenApi {
  paths: {
    "/api/v1/reviews/submissions": {
      post: {
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: {
                  required: string[];
                  properties: { rating: unknown };
                };
              };
            };
          };
        };
      };
    };
  };
}
