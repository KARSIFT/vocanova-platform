import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext } from "@playwright/test";

async function useHomeFixture(
  context: BrowserContext,
  baseURL: string,
  fixture:
    | "new-learner"
    | "reviews-due"
    | "caught-up"
    | "mission-complete"
    | "sentence-practice-needed",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `home-mission-${fixture}-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `home-mission-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_home_fixture", value: fixture, url: baseURL },
  ]);
}

test("puts the authoritative next mission action before optional practice", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "reviews-due");
  await page.goto("/home");

  await expect(
    page.getByText("3 words due for review", { exact: true }),
  ).toBeVisible();
  const primaryAction = page.getByRole("link", { name: "Start review" });
  await expect(primaryAction).toBeVisible();
  await expect(primaryAction).toHaveAttribute("href", "/reviews");
  await expect(
    page.getByRole("heading", { name: "Practice a saved word" }),
  ).toBeVisible();

  const actionTop = await primaryAction.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  const practiceTop = await page
    .getByRole("heading", { name: "Practice a saved word" })
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(actionTop).toBeLessThan(practiceTop);
});

test("uses mission status and due reviews to choose the next action", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  for (const expected of [
    ["new-learner", "Explore a journey", "/discover"],
    ["caught-up", "Explore a journey", "/discover"],
    ["mission-complete", "View your progress", "/progress"],
  ] as const) {
    await useHomeFixture(context, baseURL, expected[0]);
    await page.goto("/home");
    await expect(page.getByRole("link", { name: expected[1] })).toHaveAttribute(
      "href",
      expected[2],
    );
  }

  await expect(
    page.getByText("Today's mission is complete.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Review due words" }),
  ).toHaveAttribute("href", "/reviews");
});

test("keeps one keyboard-selectable practice target and protects a draft", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "caught-up");
  await page.goto("/home");

  const selector = page.getByLabel("Choose a saved word to practice");
  await expect(selector).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /Write a sentence using arrival/ }),
  ).toHaveCount(1);
  await expect(
    page.getByText("the act of reaching a place", { exact: true }),
  ).toBeVisible();

  await selector.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("textbox", { name: /Write a sentence using baggage/ }),
  ).toHaveCount(1);
  await expect(
    page.getByText("bags carried while travelling", { exact: true }),
  ).toBeVisible();

  const sentence = page.getByRole("textbox", {
    name: /Write a sentence using baggage/,
  });
  await sentence.fill("My baggage is ready for the flight.");
  await selector.selectOption("e2e-preview-user-word-01");
  await expect(selector).toHaveValue("e2e-preview-user-word-02");
  await expect(
    page.getByText("Discard this draft to change words?", { exact: true }),
  ).toBeVisible();
  await expect(sentence).toHaveValue("My baggage is ready for the flight.");
  await page.getByRole("button", { name: "Keep practicing" }).click();
  await expect(selector).toBeFocused();
  await expect(sentence).toHaveValue("My baggage is ready for the flight.");

  await selector.selectOption("e2e-preview-user-word-01");
  await page
    .getByRole("button", { name: "Discard draft and change word" })
    .click();
  await expect(selector).toBeFocused();
  await expect(
    page.getByRole("textbox", { name: /Write a sentence using arrival/ }),
  ).toHaveCount(1);
});

test("does not infer completion from review progress when sentence practice remains", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "sentence-practice-needed");
  await page.goto("/home");

  await expect(
    page.getByText("0 reviews remaining", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("1 sentence practice remaining", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Practice a saved word" }),
  ).toHaveAttribute("href", "#saved-word-practice-heading");
  await expect(
    page.getByRole("link", { name: "Review due words" }),
  ).toHaveAttribute("href", "/reviews");
  await expect(
    page.getByText("Today's mission is complete.", { exact: true }),
  ).toHaveCount(0);
});

test("does not change the practice target while feedback is in flight", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "caught-up");
  let releaseSubmission: (() => void) | undefined;
  const submissionReleased = new Promise<void>((resolve) => {
    releaseSubmission = resolve;
  });
  let notifySubmissionStarted: (() => void) | undefined;
  const submissionStarted = new Promise<void>((resolve) => {
    notifySubmissionStarted = resolve;
  });
  await page.route("**/api/v1/sentence-feedback", async (route) => {
    notifySubmissionStarted?.();
    await submissionReleased;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        originalSentence: "My arrival is at noon.",
        status: "correct",
        missionCompleted: false,
        canRetry: false,
        reported: false,
      }),
    });
  });

  await page.goto("/home");
  const selector = page.getByLabel("Choose a saved word to practice");
  await page
    .getByRole("textbox", { name: /Write a sentence using arrival/ })
    .fill("My arrival is at noon.");
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await submissionStarted;

  await selector.selectOption("e2e-preview-user-word-02");
  await expect(selector).toHaveValue("e2e-preview-user-word-01");
  await expect(page.getByRole("status")).toContainText(
    "Keep this word selected until it is finished.",
  );

  releaseSubmission?.();
  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toBeVisible();
});

test("allows an explicit target change after local feedback validation fails", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "caught-up");
  await page.goto("/home");
  await page.evaluate(() => {
    document.cookie = "vocanova_csrf=; Max-Age=0; Path=/";
  });
  await page
    .getByRole("textbox", { name: /Write a sentence using arrival/ })
    .fill("My arrival is at noon.");
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(
    page.getByText("Session is not ready. Please refresh the page.", {
      exact: true,
    }),
  ).toBeVisible();

  const selector = page.getByLabel("Choose a saved word to practice");
  await selector.selectOption("e2e-preview-user-word-02");
  await page
    .getByRole("button", { name: "Discard draft and change word" })
    .click();
  await expect(
    page.getByRole("textbox", { name: /Write a sentence using baggage/ }),
  ).toHaveCount(1);
});

test("clears an older pending word choice after the learner clears the draft", async ({
  page,
  context,
  baseURL,
}) => {
  await useHomeFixture(context, baseURL!, "caught-up");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "truncated-page", url: baseURL! },
  ]);
  await page.goto("/home");
  const selector = page.getByLabel("Choose a saved word to practice");
  const sentence = page.getByRole("textbox", {
    name: /Write a sentence using arrival/,
  });
  await sentence.fill("My arrival is at noon.");
  await selector.selectOption("e2e-preview-user-word-02");
  await expect(
    page.getByRole("button", { name: "Discard draft and change word" }),
  ).toBeVisible();
  await sentence.fill("");
  await selector.selectOption("e2e-preview-user-word-03");
  await expect(selector).toHaveValue("e2e-preview-user-word-03");
  await expect(
    page.getByRole("button", { name: "Discard draft and change word" }),
  ).toHaveCount(0);
  await expect(page.getByRole("textbox")).toHaveValue("");
});
