import { expect, test } from "@playwright/test";

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

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/^definition-/)).toBeVisible();
  await expect(page.getByText(/^learner-/)).toBeVisible();
  await expect(page.getByText(/^example-/)).toBeVisible();
  await expect(page.getByText(/^note-/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Practice with word-/ })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});
