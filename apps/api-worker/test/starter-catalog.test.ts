import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import { D1ContentLearningRepository } from "../src/content/repository.js";

const NOW = "2026-08-22T12:00:00.000Z";
const USER = "a9000000-0000-4000-8000-000000000001";
const BOARDING_PASS_MEANING = "a3000000-0000-4000-8000-000000000001";

describe("starter vocabulary catalog", () => {
  it("has ordered active situations with original definitions, examples, and notes", async () => {
    const repository = new D1ContentLearningRepository(
      env.DB,
      () => new Date(NOW),
    );
    const situations = await repository.listSituations("", 10);
    expect(situations.items.map((item) => item.slug)).toEqual([
      "travel-airport",
      "daily-life-shopping",
      "work-meetings",
      "study-classroom",
    ]);
    const airport = await repository.getSituation(USER, "travel-airport");
    expect(airport.meanings.map((meaning) => meaning.wordText)).toEqual([
      "boarding pass",
      "check in",
      "departure gate",
      "carry-on bag",
      "delayed",
      "aisle seat",
      "security check",
      "I would like to",
    ]);
    const word = await repository.getWord(USER, "boarding-pass");
    expect(word.word.meanings[0]).toMatchObject({
      shortDefinition: "a document that lets you get on a plane",
      examples: [
        { exampleText: "Please show your boarding pass at the gate." },
      ],
      usageNotes: [
        {
          noteText: "Keep your boarding pass ready until you reach your seat.",
        },
      ],
    });
    await expect(
      env.DB.prepare(
        `SELECT count(*) AS count FROM word_meanings wm
         JOIN canonical_words cw ON cw.id = wm.word_id
         JOIN word_examples we ON we.meaning_id = wm.id
         JOIN usage_notes un ON un.meaning_id = wm.id
         WHERE cw.id GLOB 'a2000000-*' AND cw.status = 'active'
           AND wm.short_definition <> '' AND we.example_text <> '' AND un.note_text <> ''
           AND cw.difficulty_level IN ('a2', 'b1')`,
      ).first<{ count: number }>(),
    ).resolves.toEqual({ count: 32 });
  });

  it("keeps every seeded Journey word link navigable and canonical", async () => {
    const repository = new D1ContentLearningRepository(
      env.DB,
      () => new Date(NOW),
    );
    const situations = await repository.listSituations("", 10);
    let meaningsChecked = 0;
    for (const situation of situations.items) {
      const detail = await repository.getSituation(USER, situation.slug);
      expect(detail.meanings).toHaveLength(8);
      for (const meaning of detail.meanings) {
        expect(meaning.wordSlug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        const canonical = await repository.getWord(USER, meaning.wordSlug);
        expect(
          canonical.word.meanings.some((item) => item.id === meaning.meaningId),
        ).toBe(true);
        meaningsChecked += 1;
      }
    }
    expect(meaningsChecked).toBe(32);
  });

  it("supports a synthetic learner saving and reviewing a catalog meaning", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, email, status, onboarding_status, created_at, updated_at)
       VALUES (?1, 'starter-catalog@example.test', 'active', 'completed', ?2, ?2)`,
    )
      .bind(USER, NOW)
      .run();
    const repository = new D1ContentLearningRepository(
      env.DB,
      () => new Date(NOW),
    );
    const saved = await repository.saveUserWord(
      USER,
      BOARDING_PASS_MEANING,
      "journey",
      "starter-save",
    );
    const review = await repository.submitReview(
      USER,
      {
        userWordId: saved.userWordId,
        meaningId: BOARDING_PASS_MEANING,
        promptType: "self_check",
        result: "correct",
        rating: "good",
        answeredAt: NOW,
        source: "review",
        clientAttemptId: "starter-review",
      },
      "starter-review-key",
    );
    expect(review.meaningId).toBe(BOARDING_PASS_MEANING);
    await expect(repository.listDueWords(USER, "", 10)).resolves.toMatchObject({
      totalCount: 0,
    });
  });
});
