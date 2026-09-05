import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

const PRIVACY_REMINDER =
  "Please do not include personal information in your sentence.";

async function expectPrivacyReminder(page: Page) {
  const practice = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Practice with pour" }) });
  const sentenceInput = practice.getByRole("textbox", {
    name: "Write a sentence using pour",
  });

  await expect(
    practice.getByText(PRIVACY_REMINDER, { exact: true }),
  ).toBeVisible();
  await expect(sentenceInput).toHaveAccessibleDescription(
    new RegExp(PRIVACY_REMINDER),
  );
}

test.describe("Sentence practice privacy reminder", () => {
  test("is visible and associated with the input from Word Detail, Home, and review completion", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    const sessionValue = `privacy-reminder-${randomUUID()}`;
    const csrfValue = `privacy-reminder-csrf-${randomUUID()}`;
    await page.context().addCookies([
      { name: "vocanova_session", value: sessionValue, url: baseURL },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
    ]);

    await page.goto("/discover/ordering-at-a-cafe/pour");
    await page
      .getByRole("button", {
        name: /^Save pour: to make liquid flow into a container$/,
      })
      .click();
    await expect(
      page.getByText("Review state: Due now", { exact: true }),
    ).toBeVisible();
    await expectPrivacyReminder(page);

    await page.goto("/home");
    await expectPrivacyReminder(page);

    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good" }).click();
    await expect(
      page.getByRole("heading", { name: "You're all caught up", level: 2 }),
    ).toBeVisible();
    await expectPrivacyReminder(page);
  });
});
