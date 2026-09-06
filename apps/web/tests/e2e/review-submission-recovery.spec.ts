import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function setReviewCookies(
  context: BrowserContext,
  baseURL: string,
  fixture?: string,
) {
  const csrfToken = `review-submission-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-submission-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
    ...(fixture
      ? [{ name: "e2e_review_fixture", value: fixture, url: baseURL }]
      : []),
  ]);
  return csrfToken;
}

async function savePour(page: Page, csrfToken: string) {
  const response = await page.request.post(
    `http://127.0.0.1:${process.env.MOCK_API_PORT ?? "8080"}/api/v1/user-words`,
    {
      data: { meaningId: "mean-pour", source: "journey" },
      headers: { "X-CSRF-Token": csrfToken },
    },
  );
  expect(response.ok()).toBeTruthy();
}

test("announces a held rating submission and focuses retry without duplicating the review", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  const csrfToken = await setReviewCookies(context, baseURL);
  await savePour(page, csrfToken);

  let releaseFirstSubmission: (() => void) | undefined;
  const firstSubmissionReleased = new Promise<void>((resolve) => {
    releaseFirstSubmission = resolve;
  });
  let firstSubmissionStarted: (() => void) | undefined;
  const firstSubmissionStartedPromise = new Promise<void>((resolve) => {
    firstSubmissionStarted = resolve;
  });
  const submissions: Array<{
    body: unknown;
    idempotencyKey: string | undefined;
  }> = [];

  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissions.push({
      body: route.request().postDataJSON(),
      idempotencyKey: route.request().headers()["idempotency-key"],
    });
    if (submissions.length === 1) {
      firstSubmissionStarted?.();
      await firstSubmissionReleased;
      const response = await route.fetch();
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "response_lost" }),
      });
      return;
    }
    await route.continue();
  });

  try {
    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
    await firstSubmissionStartedPromise;

    await expect(
      page.locator('[role="status"]').filter({ hasText: "Submitting review…" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Good", exact: true }),
    ).toBeDisabled();

    releaseFirstSubmission?.();
    const retrySubmission = page.getByRole("button", {
      name: "Retry submission",
    });
    await expect(retrySubmission).toBeFocused();
    await retrySubmission.click();

    const completion = page.getByRole("heading", {
      name: "Review session complete",
      level: 2,
    });
    await expect(completion).toBeFocused();
    expect(submissions).toHaveLength(2);
    expect(submissions[1]).toEqual(submissions[0]);

    const progressResponse = await page.request.get(
      `http://127.0.0.1:${process.env.MOCK_API_PORT ?? "8080"}/api/v1/progress`,
    );
    expect(progressResponse.ok()).toBeTruthy();
    expect((await progressResponse.json()).confidencePointsBalance).toBe(125);
    const missionResponse = await page.request.get(
      `http://127.0.0.1:${process.env.MOCK_API_PORT ?? "8080"}/api/v1/daily-mission`,
    );
    expect(missionResponse.ok()).toBeTruthy();
    expect((await missionResponse.json()).reviewsCompleted).toBe(1);
  } finally {
    releaseFirstSubmission?.();
  }
});

test("announces a held incorrect-answer Continue submission and focuses the next card", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await setReviewCookies(context, baseURL, "multiple-choice");
  let releaseSubmission: (() => void) | undefined;
  const submissionReleased = new Promise<void>((resolve) => {
    releaseSubmission = resolve;
  });
  let submissionStarted: (() => void) | undefined;
  const submissionStartedPromise = new Promise<void>((resolve) => {
    submissionStarted = resolve;
  });
  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionStarted?.();
    await submissionReleased;
    await route.continue();
  });

  try {
    await page.goto("/reviews");
    await page
      .getByRole("button", { name: /bags carried while travelling/ })
      .click();
    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeFocused();
    await continueButton.click();
    await submissionStartedPromise;

    await expect(
      page.locator('[role="status"]').filter({ hasText: "Submitting review…" }),
    ).toBeVisible();
    await expect(continueButton).toBeDisabled();

    releaseSubmission?.();
    await expect(
      page.getByRole("heading", { name: "baggage", level: 2 }),
    ).toBeFocused();
  } finally {
    releaseSubmission?.();
  }
});

test("focuses retry loading reviews and the recovered card after a due-list failure", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await setReviewCookies(context, baseURL, "pagination-retry");
  let dueListRequests = 0;
  await page.route("**/api/v1/reviews/due?limit=50", async (route) => {
    dueListRequests += 1;
    if (dueListRequests === 1) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "due_list_unavailable" }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  const retryLoading = page.getByRole("button", {
    name: "Retry loading reviews",
  });
  await expect(retryLoading).toBeFocused();
  await retryLoading.click();

  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toBeFocused();
  expect(dueListRequests).toBe(2);
});
