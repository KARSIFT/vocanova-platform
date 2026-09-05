import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps multiple-choice options in place through selection, feedback, loading, and retry", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  await page.addInitScript(() => {
    let calls = 0;
    Math.random = () => (calls++ < 6 ? 0 : 0.999);
  });

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-option-order-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-option-order-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  await page.goto("/reviews");

  const options = page.locator("fieldset").first().getByRole("button");
  await expect(options).toHaveCount(4);
  const optionLabels = async () =>
    (await options.allTextContents()).map((label) =>
      label.replace(/\(correct\)$/, ""),
    );
  const orderBeforeSelection = await optionLabels();

  await page
    .getByRole("button", { name: /the act of reaching a place/ })
    .click();

  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await expect.poll(optionLabels).toEqual(orderBeforeSelection);

  let releaseFirstSubmission: (() => void) | undefined;
  const firstSubmissionReleased = new Promise<void>((resolve) => {
    releaseFirstSubmission = resolve;
  });
  let notifyFirstSubmission: (() => void) | undefined;
  const firstSubmissionStarted = new Promise<void>((resolve) => {
    notifyFirstSubmission = resolve;
  });
  let submissionCount = 0;

  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionCount += 1;
    if (submissionCount > 1) {
      await route.continue();
      return;
    }

    notifyFirstSubmission?.();
    await firstSubmissionReleased;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "temporary_failure" }),
    });
  });

  const goodRating = page.getByRole("button", { name: "Good", exact: true });
  await goodRating.click();
  await firstSubmissionStarted;

  await expect(goodRating).toBeDisabled();
  await expect.poll(optionLabels).toEqual(orderBeforeSelection);

  releaseFirstSubmission?.();
  await expect(
    page.getByText("Unable to submit your answer. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(goodRating).toBeEnabled();
  await expect.poll(optionLabels).toEqual(orderBeforeSelection);
});
