import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps a 300-character sentence feedback result inside the viewport", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }

  const sentence = `I pour ${"a".repeat(293)}`;
  expect(sentence).toHaveLength(300);

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `sentence-responsive-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `sentence-responsive-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await page
    .getByRole("textbox", { name: /Write a sentence using pour/ })
    .fill(sentence);
  await page.getByRole("button", { name: "Check my sentence" }).click();

  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Your sentence" }),
  ).toContainText(sentence);
  await expect(
    page.getByText("Corrected sentence", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Corrected sentence", { exact: true })
      .locator("..")
      .getByText(sentence, { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});
