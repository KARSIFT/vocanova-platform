import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test.describe("Account deletion", () => {
  test("does not promise that signing in can reactivate a deactivated account", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    const csrfValue = `account-deletion-csrf-${randomUUID()}`;
    await page.context().addCookies([
      {
        name: "vocanova_session",
        value: `account-deletion-${randomUUID()}`,
        url: baseURL,
      },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
    ]);

    await page.goto("/settings/account");
    await page
      .getByRole("button", { name: "I want to delete my account" })
      .click();

    await expect(
      page.getByText(
        "You will not be able to reactivate your account by signing in. After 30 days this is irreversible.",
        { exact: true },
      ),
    ).toBeVisible();

    await page
      .getByRole("textbox", { name: "Type the confirmation phrase" })
      .fill("delete my account");
    await page
      .getByRole("button", { name: "Permanently deactivate my account" })
      .click();

    await expect(
      page.getByText("Your account has been deactivated.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Your account has been deactivated." }),
    ).toBeFocused();
    await expect(
      page.getByText(
        "You will not be able to reactivate this account by signing in.",
        { exact: true },
      ),
    ).toBeVisible();
  });
});
