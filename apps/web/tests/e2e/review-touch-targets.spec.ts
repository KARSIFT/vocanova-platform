import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps self-check review controls reachable on touch screens", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  const csrfToken = `review-touch-target-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-touch-target-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
  ]);

  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const saveResponse = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/api/v1/user-words`,
    {
      data: { meaningId: "mean-pour", source: "journey" },
      headers: { "X-CSRF-Token": csrfToken },
    },
  );
  expect(saveResponse.ok()).toBeTruthy();

  await page.goto("/reviews");
  const showAnswer = page.getByRole("button", { name: "Show answer" });
  await expect(showAnswer).toBeVisible();
  const showAnswerBox = await showAnswer.boundingBox();
  expect(showAnswerBox).not.toBeNull();
  await showAnswer.click();

  const ratings = ["Again", "Hard", "Good", "Easy"] as const;
  const heights = [showAnswerBox?.height ?? 0];
  for (const rating of ratings) {
    const ratingButton = page.getByRole("button", { name: rating, exact: true });
    await expect(ratingButton).toBeVisible();
    heights.push((await ratingButton.boundingBox())?.height ?? 0);
  }

  expect(heights.every((height) => height >= 44)).toBe(true);
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByText("You completed 1 review in this session.", { exact: true }),
  ).toBeVisible();
});

test("keeps multiple-choice review controls reachable on touch screens", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-choice-touch-target-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-choice-touch-target-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  await page.goto("/reviews");
  const correctOption = page.getByRole("button", {
    name: /the act of reaching a place/,
  });
  await expect(correctOption).toBeVisible();
  const optionBox = await correctOption.boundingBox();
  expect(optionBox).not.toBeNull();
  await correctOption.click();

  const ratingHeights = [optionBox?.height ?? 0];
  for (const rating of ["Hard", "Good", "Easy"] as const) {
    const ratingButton = page.getByRole("button", { name: rating, exact: true });
    await expect(ratingButton).toBeVisible();
    ratingHeights.push((await ratingButton.boundingBox())?.height ?? 0);
  }
  expect(ratingHeights.every((height) => height >= 44)).toBe(true);

  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toBeVisible();
});
