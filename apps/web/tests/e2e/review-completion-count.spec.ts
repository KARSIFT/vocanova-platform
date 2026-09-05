import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

async function completeSelfCheck(page: Page) {
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
}

test("counts only successful reviews across fetched due-word pages", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  const csrfToken = `review-count-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-count-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
    { name: "e2e_review_fixture", value: "completion-summary", url: baseURL },
  ]);

  let submissionCount = 0;
  let releaseFailedSubmission: (() => void) | undefined;
  const failedSubmissionReleased = new Promise<void>((resolve) => {
    releaseFailedSubmission = resolve;
  });
  let notifyFailedSubmission: (() => void) | undefined;
  const failedSubmissionStarted = new Promise<void>((resolve) => {
    notifyFailedSubmission = resolve;
  });

  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionCount += 1;
    if (submissionCount > 1) {
      await route.continue();
      return;
    }

    notifyFailedSubmission?.();
    await failedSubmissionReleased;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "temporary_failure" }),
    });
  });

  await page.goto("/reviews");

  const showAnswer = page.getByRole("button", { name: "Show answer" });
  await showAnswer.click();
  const firstGoodRating = page.getByRole("button", {
    name: "Good",
    exact: true,
  });
  await firstGoodRating.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await failedSubmissionStarted;
  await expect(firstGoodRating).toBeDisabled();

  releaseFailedSubmission?.();
  await expect(
    page.getByText("Unable to submit your answer. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(firstGoodRating).toBeEnabled();
  expect(submissionCount).toBe(1);

  await firstGoodRating.click();
  await completeSelfCheck(page);
  await completeSelfCheck(page);
  await completeSelfCheck(page);

  await expect(
    page.getByText("You completed 4 reviews in this session.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(submissionCount).toBe(5);
});
