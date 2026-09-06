import { randomUUID } from "node:crypto";

import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

import { formatViolations, scanForAxeViolations } from "./axe-helper.js";

async function setReviewCookies(
  context: BrowserContext,
  baseURL: string,
  fixture?: string,
) {
  const csrfToken = `review-reveal-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-reveal-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: csrfToken,
      url: baseURL,
    },
    ...(fixture
      ? [{ name: "e2e_review_fixture", value: fixture, url: baseURL }]
      : []),
  ]);
  return csrfToken;
}

async function expectNoCriticalOrSeriousAxeViolations(page: Page) {
  const { criticalOrSerious } = await scanForAxeViolations(page);
  expect(
    criticalOrSerious,
    `Expected no critical or serious review-transition axe violations; found:\n${formatViolations(
      criticalOrSerious,
    ).join("\n")}`,
  ).toEqual([]);
}

async function expectAnnouncement(page: Page, message: string) {
  await expect(
    page
      .locator('[role="status"][aria-live="polite"]')
      .filter({ hasText: message }),
  ).toHaveCount(1);
}

test("announces an incorrect choice and focuses Continue", async (
  { page, context },
  testInfo,
) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await setReviewCookies(context, baseURL, "multiple-choice");
  await page.goto("/reviews");
  await page
    .getByRole("button", { name: /bags carried while travelling/ })
    .click();

  await expectAnnouncement(
    page,
    "Incorrect. The correct answer is shown. Continue to record this review.",
  );
  await expectNoCriticalOrSeriousAxeViolations(page);
  await expect(page.getByRole("button", { name: "Continue" })).toBeFocused();
});

test("announces a correct choice and focuses the first rating", async (
  { page, context },
  testInfo,
) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await setReviewCookies(context, baseURL, "multiple-choice");
  await page.goto("/reviews");
  await page
    .getByRole("button", { name: /the act of reaching a place/ })
    .click();

  await expectAnnouncement(
    page,
    "Correct. Choose how well you knew this word.",
  );
  await expectNoCriticalOrSeriousAxeViolations(page);
  await expect(page.getByRole("button", { name: "Hard", exact: true })).toBeFocused();
});

test("announces a self-check reveal and focuses the first rating", async (
  { page, context },
  testInfo,
) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  const csrfToken = await setReviewCookies(context, baseURL);
  const response = await page.request.post(
    `http://127.0.0.1:${process.env.MOCK_API_PORT ?? "8080"}/api/v1/user-words`,
    {
      data: { meaningId: "mean-pour", source: "journey" },
      headers: { "X-CSRF-Token": csrfToken },
    },
  );
  expect(response.ok()).toBeTruthy();

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();

  await expectAnnouncement(
    page,
    "Answer revealed. Choose how well you knew this word.",
  );
  await expectNoCriticalOrSeriousAxeViolations(page);
  await expect(page.getByRole("button", { name: "Again", exact: true })).toBeFocused();
});
