import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const LONG_CONTENT_TOKEN = "a".repeat(300);
const LONG_WORD = `word-${"a".repeat(289)}`;
const LONG_SENTENCE = `I use ${LONG_WORD}`;
const LONG_DEFINITION = `definition-${LONG_CONTENT_TOKEN}`;
const LONG_LEARNER_DEFINITION = `learner-${LONG_CONTENT_TOKEN}`;
const LONG_EXAMPLE = `example-${LONG_CONTENT_TOKEN}`;
const LONG_NOTE = `note-${LONG_CONTENT_TOKEN}`;

test("keeps long Word Detail content within the viewport", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `word-detail-responsive-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `word-detail-responsive-csrf-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "e2e_word_detail_fixture",
      value: "long-content",
      url: baseURL,
    },
    {
      name: "e2e_word_detail_review_state",
      value: "due",
      url: baseURL,
    },
  ]);
  await page.goto("/discover/ordering-at-a-cafe/pour");

  expect(LONG_WORD).toHaveLength(294);
  expect(LONG_SENTENCE).toHaveLength(300);
  await expect(
    page.getByRole("heading", { level: 1, name: LONG_WORD }),
  ).toBeVisible();
  await expect(page.getByText(LONG_DEFINITION, { exact: true })).toBeVisible();
  await expect(
    page.getByText(LONG_LEARNER_DEFINITION, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(LONG_EXAMPLE, { exact: true })).toBeVisible();
  await expect(page.getByText(LONG_NOTE, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: `Practice with ${LONG_WORD} — ${LONG_DEFINITION}`,
    }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: `Write a sentence using ${LONG_WORD}` })
    .fill(LONG_SENTENCE);
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Your sentence" }),
  ).toContainText(LONG_SENTENCE);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});
