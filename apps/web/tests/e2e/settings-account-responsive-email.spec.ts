import { expect, test } from "@playwright/test";

test("keeps a valid long sign-in email within the Settings Account viewport", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }

  await context.addCookies([
    {
      name: "e2e_account_email_fixture",
      value: "long",
      url: baseURL,
    },
  ]);
  await page.goto("/settings/account");

  const expectedEmail = `${"a".repeat(64)}@example.test`;
  await expect(
    page.getByText(expectedEmail, { exact: true }).first(),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});
