// VOC-031-T07b accessibility scan for /progress.
//
// The progress page is the most state-heavy screen in the core
// loop - the "Done" / "Rest" day pills and the streak text both
// use colour AND text. The non-color-only assertion specifically
// targets those text labels, which is the T07b acceptance
// criterion's "non-color-only feedback is asserted explicitly,
// not only inferred from a clean axe run" requirement for
// mission/streak state.

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

const truncatedSavedWordsResponse = {
  items: [
    {
      userWordId: "e2e-preview-user-word-01",
      meaningId: "e2e-preview-meaning-01",
      wordId: "e2e-preview-word-01",
      wordSlug: "arrival",
      wordText: "arrival",
      partOfSpeech: "noun",
      shortDefinition: "the act of reaching a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-02",
      meaningId: "e2e-preview-meaning-02",
      wordId: "e2e-preview-word-02",
      wordSlug: "baggage",
      wordText: "baggage",
      partOfSpeech: "noun",
      shortDefinition: "bags carried while travelling",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-09T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-03",
      meaningId: "e2e-preview-meaning-03",
      wordId: "e2e-preview-word-03",
      wordSlug: "counter",
      wordText: "counter",
      partOfSpeech: "noun",
      shortDefinition: "a long flat surface for service",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-08T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-04",
      meaningId: "e2e-preview-meaning-04",
      wordId: "e2e-preview-word-04",
      wordSlug: "departure",
      wordText: "departure",
      partOfSpeech: "noun",
      shortDefinition: "the act of leaving a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-07T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-05",
      meaningId: "e2e-preview-meaning-05",
      wordId: "e2e-preview-word-05",
      wordSlug: "gate",
      wordText: "gate",
      partOfSpeech: "noun",
      shortDefinition: "the place where passengers board",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-06T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-06",
      meaningId: "e2e-preview-meaning-06",
      wordId: "e2e-preview-word-06",
      wordSlug: "luggage",
      wordText: "luggage",
      partOfSpeech: "noun",
      shortDefinition: "bags used for travelling",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-05T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-07",
      meaningId: "e2e-preview-meaning-07",
      wordId: "e2e-preview-word-07",
      wordSlug: "passport",
      wordText: "passport",
      partOfSpeech: "noun",
      shortDefinition: "an official document for international travel",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-04T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-08",
      meaningId: "e2e-preview-meaning-08",
      wordId: "e2e-preview-word-08",
      wordSlug: "queue",
      wordText: "queue",
      partOfSpeech: "noun",
      shortDefinition: "a line of people waiting",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-03T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-09",
      meaningId: "e2e-preview-meaning-09",
      wordId: "e2e-preview-word-09",
      wordSlug: "reservation",
      wordText: "reservation",
      partOfSpeech: "noun",
      shortDefinition: "an arrangement to keep a place",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-02T00:00:00.000Z",
    },
    {
      userWordId: "e2e-preview-user-word-10",
      meaningId: "e2e-preview-meaning-10",
      wordId: "e2e-preview-word-10",
      wordSlug: "terminal",
      wordText: "terminal",
      partOfSpeech: "noun",
      shortDefinition: "an airport building for passengers",
      status: "saved",
      source: "journey",
      saved: true,
      addedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  nextCursor: "e2e-saved-words-after-10",
};

test.describe("Progress accessibility (VOC-031-T07b)", () => {
  test("/progress renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state", async ({
    page,
  }) => {
    await page.goto("/progress");

    await expect(
      page.getByRole("heading", { name: "Progress", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /progress; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // The progress page is mostly read-only: the "no saved
    // words" empty state has no anchors, and the "all rest"
    // completion history has no controls either. The page may
    // have zero focusable elements, so the floor is 0 - the
    // read-only nature is itself the correct a11y posture.
    await assertKeyboardReachable(page, { minFocusable: 0 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/progress",
      requireText: [
        "text=Confidence Points",
        "text=Your streaks",
        "text=This week",
        // The "Done" / "Rest" labels on the day pills are the
        // most likely place for a colour-only regression
        // (the pills use bg-primary-100 vs bg-neutral-200
        // plus the text label - the text label is the part
        // this assertion checks).
        "text=Done",
        "text=Rest",
      ],
    });

    await expect(
      page.getByText(
        "No saved words yet. Save words from a journey to track your vocabulary here.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("A preview of up to 10 recently saved words."),
    ).toHaveCount(0);
    const emptySavedVocabularySection = page
      .getByRole("heading", {
        name: "Recently saved vocabulary",
        level: 2,
      })
      .locator("..");
    await expect(emptySavedVocabularySection.getByRole("list")).toHaveCount(0);
  });

  test("saved vocabulary section presents a truncated response as a preview", async ({
    page,
    baseURL,
  }) => {
    if (!baseURL) {
      throw new Error(
        "Expected the Playwright project to configure use.baseURL so the e2e_saved_words_fixture cookie can be scoped to it.",
      );
    }

    await page.context().addCookies([
      {
        name: "e2e_saved_words_fixture",
        value: "truncated-page",
        url: baseURL,
      },
    ]);

    const mockApiPort = Number(process.env.MOCK_API_PORT ?? 8080);
    const fixtureResponse = await page.request.get(
      `http://127.0.0.1:${mockApiPort}/api/v1/user-words?limit=10`,
    );

    await expect(fixtureResponse).toBeOK();
    await expect(await fixtureResponse.json()).toEqual(
      truncatedSavedWordsResponse,
    );

    await page.goto("/progress");

    const savedVocabularySection = page
      .getByRole("heading", {
        name: "Recently saved vocabulary",
        level: 2,
      })
      .locator("..");
    await expect(savedVocabularySection).toContainText(
      "A preview of up to 10 recently saved words.",
    );
    await expect(savedVocabularySection).not.toContainText("10 words saved");
    await expect(savedVocabularySection).not.toContainText("10 word saved");
    await expect(
      page.getByText(
        "No saved words yet. Save words from a journey to track your vocabulary here.",
      ),
    ).toHaveCount(0);

    const savedVocabularyList = savedVocabularySection.getByRole("list");
    await expect(savedVocabularyList).toHaveCount(1);
    const savedVocabularyItems = savedVocabularyList.getByRole("listitem");
    await expect(savedVocabularyItems).toHaveCount(
      truncatedSavedWordsResponse.items.length,
    );

    for (const [index, item] of truncatedSavedWordsResponse.items.entries()) {
      const row = savedVocabularyItems.nth(index);
      await expect(row.getByText(item.wordText, { exact: true })).toBeVisible();
      await expect(
        row.getByText(item.shortDefinition, { exact: true }),
      ).toBeVisible();
      await expect(savedVocabularySection.getByText(item.wordText)).toHaveCount(
        1,
      );
      await expect(
        savedVocabularySection.getByText(item.shortDefinition),
      ).toHaveCount(1);
    }

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /progress truncated saved-vocabulary preview; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);
  });
});
