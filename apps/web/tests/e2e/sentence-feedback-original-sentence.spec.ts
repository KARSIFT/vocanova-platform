import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("shows the submitted sentence alongside completed AI feedback", async ({
  page,
  context,
}, testInfo) => {
  const originalSentence = "I will pour the coffee into a cup.";
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `sentence-original-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `sentence-original-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await page
    .getByRole("textbox", { name: /Write a sentence using pour/ })
    .fill(originalSentence);
  await page.getByRole("button", { name: "Check my sentence" }).click();

  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toBeVisible();
  const originalSentenceResult = page.getByRole("group", {
    name: "Your sentence",
  });
  await expect(originalSentenceResult).toBeVisible();
  await expect(originalSentenceResult).toContainText(originalSentence);
});
