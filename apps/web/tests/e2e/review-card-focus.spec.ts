import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("moves keyboard focus to the next review card after a rating advances the session", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-card-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-card-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  await page.goto("/reviews");
  await page
    .getByRole("button", { name: /the act of reaching a place/ })
    .click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  const nextCardHeading = page.getByRole("heading", {
    name: "baggage",
    level: 2,
  });
  await expect(nextCardHeading).toBeFocused();
});

test("moves focus across a fetched review page", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-page-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-page-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "completion-summary", url: baseURL },
  ]);

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toBeFocused();

  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "counter", level: 2 }),
  ).toBeFocused();
});

test("does not advance focus until a failed review submission succeeds on retry", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-retry-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-retry-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  let submissionCount = 0;
  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionCount += 1;
    if (submissionCount === 1) {
      await route.fulfill({ status: 500, body: JSON.stringify({ error: "failed" }) });
      return;
    }
    await route.continue();
  });

  await page.goto("/reviews");
  await page
    .getByRole("button", { name: /the act of reaching a place/ })
    .click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  await expect(
    page.getByText("Unable to submit your answer. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "arrival", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Retry submission" }).click();

  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toBeFocused();
  expect(submissionCount).toBe(2);
});

test("moves focus to the completion heading after the final review", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-completion-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-completion-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "completion-summary", url: baseURL },
  ]);

  await page.goto("/reviews");
  for (const word of ["arrival", "baggage", "counter", "departure"]) {
    await expect(page.getByRole("heading", { name: word, level: 2 })).toBeVisible();
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
  }

  await expect(
    page.getByRole("heading", { name: "You're all caught up", level: 2 }),
  ).toBeFocused();
});
