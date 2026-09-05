import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function setRetryFixture(context: BrowserContext, baseURL: string) {
  const domain = new URL(baseURL).hostname;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `account-deletion-retry-${randomUUID()}`,
      domain,
      path: "/",
    },
    { name: "vocanova_csrf", value: "deletion-csrf", domain, path: "/" },
    {
      name: "e2e_account_deletion_failure",
      value: "retry",
      domain,
      path: "/",
    },
    {
      name: "e2e_account_deletion_hold",
      value: "1",
      domain,
      path: "/",
    },
  ]);
}

async function releaseFirstDeletion(page: Page) {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  await expect
    .poll(async () => {
      const response = await page.request.post(
        `http://127.0.0.1:${mockApiPort}/__e2e/release-account-deletion`,
      );
      return response.status();
    })
    .toBe(204);
}

test.describe("Account deletion retry recovery", () => {
  test("keeps confirmation actionable across a failed write and completes one retry", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    await setRetryFixture(context, baseURL);
    await page.goto("/settings/account");

    const deleteTrigger = page.getByRole("button", {
      name: "I want to delete my account",
    });
    await deleteTrigger.click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(deleteTrigger).toBeVisible();

    await deleteTrigger.click();
    const phrase = page.getByRole("textbox", {
      name: "Type the confirmation phrase",
    });
    await phrase.fill("delete my account");
    await page
      .getByRole("button", { name: "Permanently deactivate my account" })
      .click();
    await expect(
      page.getByRole("button", { name: "Deactivating..." }),
    ).toBeDisabled();
    await expect(phrase).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await releaseFirstDeletion(page);
    await expect(
      page
        .getByRole("alert")
        .filter({
          hasText: "We couldn't deactivate your account. Please try again.",
        }),
    ).toBeVisible();
    await expect(phrase).toHaveValue("delete my account");
    await expect(
      page.getByRole("button", { name: "Permanently deactivate my account" }),
    ).toBeEnabled();

    await page
      .getByRole("button", { name: "Permanently deactivate my account" })
      .click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Your account has been deactivated.",
      }),
    ).toBeVisible();
  });
});
