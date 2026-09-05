import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

test("keeps a valid long sign-in email within the Settings Account viewport", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }
  const currentEmail = `${"a".repeat(64)}@example.test`;
  const newEmail = `${"b".repeat(64)}@example.test`;
  const previousEmail = `${"c".repeat(64)}@example.test`;

  await context.addCookies([
    {
      name: "e2e_account_email_fixture",
      value: "long",
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: "long-email-csrf",
      url: baseURL,
    },
  ]);
  await page.route(
    "**/api/v1/settings/email-change-links/consume",
    async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "Access-Control-Allow-Origin": new URL(baseURL).origin,
          "Access-Control-Allow-Credentials": "true",
        },
        body: JSON.stringify({
          email: newEmail,
          previousEmail,
          changedAt: "2026-09-05T00:00:00.000Z",
        }),
      });
    },
  );
  await page.goto("/settings/account");

  await expect(page.getByText(currentEmail, { exact: true }).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("textbox", { name: "New sign-in email" }).fill(newEmail);
  await page.getByRole("button", { name: "Send confirmation link" }).click();
  await expect(page.getByRole("status").filter({ hasText: newEmail })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("textbox", { name: "Confirmation token" }).fill("token");
  await page.getByRole("button", { name: "Confirm change" }).click();
  const completed = page
    .getByRole("status")
    .filter({ hasText: "Your sign-in email was updated." });
  await expect(completed).toContainText(newEmail);
  await expect(completed).toContainText(previousEmail);
  await expectNoHorizontalOverflow(page);
});
