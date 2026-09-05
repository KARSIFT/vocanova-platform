// Accessibility scans for the Discover journey tree:
// /discover, /discover/[situation], and /discover/[situation]/[word]
// (the Word Detail screen, which also embeds the sentence feedback
// widget from sentence-feedback.tsx).
//
// The UI/UX design requires the full mobile-first journey to be
// accessible at the three supported layouts. The Word Detail
// screen is the screen where most of the saved-words interaction
// happens (the Save button + the sentence feedback widget), so it
// is also where colour-only feedback and keyboard reachability
// regressions are most likely to land.

import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Discover accessibility", () => {
  test("/discover renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state", async ({
    page,
  }) => {
    await page.goto("/discover");

    await expect(
      page.getByRole("heading", { name: "Journey", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /discover; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // Each situation card is an anchor, so the page has at
    // least one focusable element per card (the fixture serves
    // two cards).
    await assertKeyboardReachable(page, { minFocusable: 2 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/discover",
      requireText: [
        "text=Choose a situation",
        // The two fixture situation cards must each render their
        // title text - the situation grid is the page's primary
        // content.
        "text=Ordering at a cafe",
        "text=Navigating an airport",
      ],
    });
  });

  test("/discover/[situation] renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state", async ({
    page,
  }) => {
    await page.goto("/discover/ordering-at-a-cafe");

    await expect(
      page.getByRole("heading", { name: "Ordering at a cafe", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /discover/[situation]; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // Each recommended meaning is an anchor; the back link is also focusable.
    // Fixture has two meanings, so at least 3 focusable elements.
    await assertKeyboardReachable(page, { minFocusable: 3 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/discover/[situation]",
      requireText: [
        "text=Explore a new word for this situation.",
        "text=Back to Journey",
      ],
    });
  });

  test("Journey recommendations exclude saved meanings while retaining remaining new meanings", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected the Playwright project to configure use.baseURL.");
    }
    const sessionValue = `vocanova-session-${randomUUID()}`;
    const csrfValue = `vocanova-csrf-${randomUUID()}`;
    await page.context().addCookies([
      { name: "vocanova_session", value: sessionValue, url: baseURL },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
    ]);

    await page.goto("/discover/ordering-at-a-cafe/pour");
    await page
      .getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      })
      .click();
    await expect(
      page.getByRole("button", { name: "Remove pour from saved words" }),
    ).toBeVisible();

    await page.goto("/discover/ordering-at-a-cafe");
    await expect(
      page.getByRole("link", { name: /pour/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /counter/i }),
    ).toBeVisible();
  });

  test("/discover/[situation]/[word] (Word Detail + sentence feedback) renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state", async ({
    page,
  }) => {
    await page.goto("/discover/ordering-at-a-cafe/pour");

    await expect(
      page.getByRole("heading", { name: "pour", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /discover/[situation]/[word]; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // Word Detail has a back link, the meaning's Save button, and
    // (when saved) the sentence-feedback form. The unsaved
    // fixture gives us a back link + at least one Save button +
    // the back-to-journey link from the sentence-feedback
    // pattern is not in this fixture. Use a conservative floor.
    await assertKeyboardReachable(page, { minFocusable: 2 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/discover/[situation]/[word]",
      requireText: [
        "text=Meanings",
        "text=to make liquid flow into a container",
        "text=Example sentences",
        "text=Could you pour me a cup of coffee?",
      ],
    });
  });

  test("Word Detail renders every backend review-state fixture with an exact direct contract and accessible SSR copy", async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error(
        "Expected the Playwright project to configure use.baseURL so the Word Detail fixture cookie can be scoped to it.",
      );
    }
    const fixtures = [
      { cookie: "unsaved", state: null, label: null },
      { cookie: "due", state: "due", label: "Due now" },
      { cookie: "new", state: "new", label: "New" },
      { cookie: "learning", state: "learning", label: "Learning" },
      { cookie: "reviewing", state: "reviewing", label: "Reviewing" },
      { cookie: "mastered", state: "mastered", label: "Mastered" },
      {
        cookie: "not-reviewing",
        state: "not_reviewing",
        label: "Not in review",
      },
    ] as const;
    const mockApiPort = Number(process.env.MOCK_API_PORT ?? 8080);

    for (const fixture of fixtures) {
      await page.context().addCookies([
        {
          name: "e2e_word_detail_review_state",
          value: fixture.cookie,
          url: baseURL,
        },
      ]);
      const fixtureResponse = await page.request.get(
        `http://127.0.0.1:${mockApiPort}/api/v1/canonical-words/pour`,
      );
      await expect(fixtureResponse).toBeOK();
      const fixtureBody = await fixtureResponse.json();
      const expectedMeaning = {
        id: "mean-pour",
        partOfSpeech: "verb",
        shortDefinition: "to make liquid flow into a container",
        saved: fixture.state !== null,
        ...(fixture.state !== null && { userWordId: "uw-mean-pour" }),
        reviewState: fixture.state,
        examples: [
          {
            id: "ex-pour-1",
            exampleText: "Could you pour me a cup of coffee?",
          },
        ],
        usageNotes: [
          {
            id: "note-pour-1",
            noteType: "register",
            noteText: "Common in everyday service contexts.",
          },
        ],
      };
      expect(fixtureBody).toEqual({
        word: {
          id: "word-pour",
          text: "pour",
          slug: "pour",
          wordType: "verb",
          difficultyLevel: "A2",
          meanings: [expectedMeaning],
        },
      });
      expect(fixtureBody.word.meanings[0]).not.toHaveProperty("reviewStep");
      expect(fixtureBody.word.meanings[0]).not.toHaveProperty("nextReviewAt");
      expect(fixtureBody.word.meanings[0]).not.toHaveProperty("status");

      await page.goto("/discover/ordering-at-a-cafe/pour");
      await expect(
        page.getByRole("heading", { name: "pour", level: 1 }),
      ).toBeVisible();
      await expect(
        page.getByText("to make liquid flow into a container", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Could you pour me a cup of coffee?"),
      ).toBeVisible();
      await expect(
        page.getByText("Common in everyday service contexts."),
      ).toBeVisible();

      if (fixture.label === null) {
        await expect(page.getByText(/^Review state:/)).toHaveCount(0);
        await expect(
          page.getByRole("button", {
            name: /^Save pour: to make liquid flow into a container$/,
          }),
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "Practice with pour" }),
        ).toHaveCount(0);
      } else {
        await expect(
          page.getByText(`Review state: ${fixture.label}`, { exact: true }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", {
            name: "Remove pour from saved words",
          }),
        ).toBeVisible();
        await expect(
          page.getByRole("heading", { name: "Practice with pour" }),
        ).toBeVisible();
      }
      await expect(page.getByText("not_reviewing", { exact: true })).toHaveCount(
        0,
      );

      const { criticalOrSerious } = await scanForAxeViolations(page);
      expect(
        criticalOrSerious,
        `Expected zero critical or serious axe-core violations for Word Detail fixture ${fixture.cookie}; found:\n${formatViolations(
          criticalOrSerious,
        ).join("\n")}`,
      ).toEqual([]);
      await assertKeyboardReachable(page, { minFocusable: 2 });
      await assertNonColorOnlyFeedback(page, {
        contextLabel: `Word Detail fixture ${fixture.cookie}`,
        requireText: [
          fixture.label === null
            ? "text=Meanings"
            : `text=Review state: ${fixture.label}`,
        ],
      });
    }

    await page.context().clearCookies({
      name: "e2e_word_detail_review_state",
    });
    const defaultResponse = await page.request.get(
      `http://127.0.0.1:${mockApiPort}/api/v1/canonical-words/pour`,
    );
    await expect(defaultResponse).toBeOK();
    expect((await defaultResponse.json()).word.meanings[0]).toMatchObject({
      saved: false,
      reviewState: null,
    });
  });

  test("Word Detail refreshes backend state after save and unsave but preserves state on failure", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error(
        "Expected the Playwright project to configure use.baseURL so the stateful Word Detail session can be scoped to it.",
      );
    }
    const sessionValue = `vocanova-session-${randomUUID()}`;
    const csrfValue = `vocanova-csrf-${randomUUID()}`;
    await page.context().addCookies([
      { name: "vocanova_session", value: sessionValue, url: baseURL },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
    ]);
    await page.goto("/discover/ordering-at-a-cafe/pour");
    await expect(page.getByText(/^Review state:/)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Practice with pour" }),
    ).toHaveCount(0);

    await page
      .getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      })
      .click();
    await expect(page.getByText("Review state: Due now", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Practice with pour" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Remove pour from saved words" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Remove pour from saved words" })
      .click();
    await expect(page.getByText(/^Review state:/)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Practice with pour" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      }),
    ).toBeVisible();

    const failingSession = `vocanova-failure-${randomUUID()}`;
    await page.context().addCookies([
      { name: "vocanova_session", value: failingSession, url: baseURL },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
      {
        name: "e2e_word_detail_save_failure",
        value: "1",
        url: baseURL,
      },
    ]);
    await page.goto("/discover/ordering-at-a-cafe/pour");
    await page
      .getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      })
      .click();
    await expect(
      page.getByRole("alert").getByText(
        "Unable to update saved state. Please try again.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(page.getByText(/^Review state:/)).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Practice with pour" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      }),
    ).toBeVisible();
  });
});
