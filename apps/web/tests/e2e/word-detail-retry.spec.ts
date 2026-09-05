import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test.describe("Word Detail recovery", () => {
  test("identifies a failed word read and retries the recovered request", async ({
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
        value: `word-detail-retry-${randomUUID()}`,
        url: baseURL,
      },
      {
        name: "e2e_read_failure",
        value: "discover",
        url: baseURL,
      },
    ]);

    await page.goto("/discover/ordering-at-a-cafe/pour");

    await expect(
      page.getByRole("heading", { name: "We couldn't load this word", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Journey" })).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  });
});
