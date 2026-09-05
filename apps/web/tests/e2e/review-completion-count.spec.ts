import { randomUUID } from "node:crypto";

import { expect, test, type Page, type Response } from "@playwright/test";

function waitForSuccessfulReview(page: Page): Promise<Response> {
  return page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/reviews/submissions") &&
      response.request().method() === "POST" &&
      response.status() === 200,
  );
}

async function completeSelfCheck(page: Page): Promise<Response> {
  const submitted = waitForSuccessfulReview(page);
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  return submitted;
}

test("hands sentence practice to the final successful review across fetched due-word pages", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error(
      "Expected the Playwright project to configure use.baseURL.",
    );
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

  const firstSuccessfulSubmission = waitForSuccessfulReview(page);
  await firstGoodRating.click();
  const firstSuccessfulAttempt = await firstSuccessfulSubmission;
  await completeSelfCheck(page);
  await completeSelfCheck(page);
  const lastSuccessfulAttempt = await completeSelfCheck(page);

  await expect(
    page.getByText("You completed 4 reviews in this session.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(submissionCount).toBe(5);
  const firstSuccessfulAttemptId = (
    (await firstSuccessfulAttempt.json()) as { attemptId: string }
  ).attemptId;
  const lastSuccessfulAttemptId = (
    (await lastSuccessfulAttempt.json()) as { attemptId: string }
  ).attemptId;

  await expect(
    page.getByRole("heading", { name: /Practice with departure/ }),
  ).toBeVisible();

  await page
    .getByRole("textbox", { name: /Write a sentence using departure/ })
    .fill("The departure board changed this morning.");
  const sentenceSubmitted = page.waitForRequest(
    (request) =>
      request.url().includes("/api/v1/sentence-feedback") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();
  const sentenceRequest = await sentenceSubmitted;

  expect(sentenceRequest.postDataJSON()).toEqual({
    sentenceText: "The departure board changed this morning.",
    source: "review",
    attemptId: lastSuccessfulAttemptId,
  });
  expect(lastSuccessfulAttemptId).not.toBe(firstSuccessfulAttemptId);
});
