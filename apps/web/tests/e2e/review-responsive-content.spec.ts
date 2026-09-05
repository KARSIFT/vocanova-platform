import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps long Review content within the viewport", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }

  const csrfToken = `review-responsive-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-responsive-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
    { name: "e2e_review_fixture", value: "long-content", url: baseURL },
  ]);

  await page.goto("/reviews");

  await expect(page.getByRole("heading", { level: 2, name: /^word-/ })).toBeVisible();
  await expect(
    page.getByRole("group", { name: /^Choose the meaning for word-/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /correct-/ }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await page.getByRole("button", { name: "Show answer" }).click();
  await expect(page.getByText(/^option-1-/)).toBeVisible();

  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});
