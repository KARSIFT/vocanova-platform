import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("shows the learner-local scheduled review time on every scheduled-review surface", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_timezone", value: "America/New_York", url: baseURL },
    { name: "e2e_review_fixture", value: "next-review", url: baseURL },
    { name: "e2e_saved_words_fixture", value: "next-review", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(
    page.getByText("Your next review is Aug 22, 2099, 8:30 AM EDT."),
  ).toBeVisible();

  await page.goto("/discover/saved");
  await expect(
    page.getByText("Next review: Aug 22, 2099, 8:30 AM EDT"),
  ).toBeVisible();
  await page.getByRole("link", { name: /later word/ }).click();
  await expect(
    page.getByText("Next review: Aug 22, 2099, 8:30 AM EDT"),
  ).toBeVisible();
});

test("keeps scheduled review guidance when a stored timezone is invalid", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_timezone", value: "Not/A-Timezone", url: baseURL },
    { name: "e2e_review_fixture", value: "next-review", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(
    page.getByText("Your next review is Aug 22, 2099, 12:30 PM UTC."),
  ).toBeVisible();
});

test("keeps scheduled review guidance when the timezone read is unavailable", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_read_failure", value: "settings", url: baseURL },
    { name: "e2e_review_fixture", value: "next-review", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(
    page.getByText("Your next review is Aug 22, 2099, 12:30 PM UTC."),
  ).toBeVisible();
});

test("uses neutral caught-up guidance when older responses omit scheduling", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([{ name: "vocanova_session", value: randomUUID(), url: baseURL }]);
  await page.goto("/reviews");
  await expect(page.getByText("No words are due for review right now.")).toBeVisible();
});

test("distinguishes no saved vocabulary from saved words without active reviews", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_review_fixture", value: "no-active-reviews", url: baseURL },
  ]);
  await page.goto("/reviews");
  await expect(page.getByText("Save a word to start reviewing.")).toBeVisible();

  await context.addCookies([
    {
      name: "e2e_saved_words_fixture",
      value: "no-active-reviews",
      url: baseURL,
    },
  ]);
  await page.goto("/reviews");
  await expect(
    page.getByText("No active reviews are scheduled right now."),
  ).toBeVisible();
});

test("keeps neutral guidance when the auxiliary saved-word read is unavailable", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_review_fixture", value: "no-active-reviews", url: baseURL },
    { name: "e2e_saved_words_fixture", value: "saved-list-failure", url: baseURL },
  ]);
  await page.goto("/reviews");
  await expect(page.getByText("No words are due for review right now.")).toBeVisible();
});

test("redirects to sign in when the auxiliary saved-word read is unauthorized", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_review_fixture", value: "no-active-reviews", url: baseURL },
    { name: "e2e_saved_words_fixture", value: "saved-list-reauth", url: baseURL },
  ]);
  await page.goto("/reviews");
  await expect(page).toHaveURL(/\/signin\?returnTo=%2Freviews/);
  await expect(
    page.getByRole("heading", { name: "Sign in to Vocanova", level: 1 }),
  ).toBeVisible();
});

test("renders actionable controls for an active review queue", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);
  await page.goto("/reviews");
  await expect(
    page.getByRole("heading", { name: "arrival", level: 2, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "noun — the act of reaching a place",
      exact: true,
    }),
  ).toBeVisible();
});
