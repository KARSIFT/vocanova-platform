import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function setRetryFixture(context: BrowserContext, baseURL: string) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `email-change-retry-${randomUUID()}`,
      domain: new URL(baseURL).hostname,
      path: "/",
    },
    {
      name: "vocanova_csrf",
      value: "email-change-csrf",
      domain: new URL(baseURL).hostname,
      path: "/",
    },
    {
      name: "e2e_email_change_failure",
      value: "retry",
      domain: new URL(baseURL).hostname,
      path: "/",
    },
    {
      name: "e2e_email_change_hold",
      value: "request",
      domain: new URL(baseURL).hostname,
      path: "/",
    },
  ]);
}

async function releaseFirstRequest(page: Page) {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  await expect
    .poll(async () => {
      const response = await page.request.post(
        `http://127.0.0.1:${mockApiPort}/__e2e/release-email-change-request`,
      );
      return response.status();
    })
    .toBe(204);
}

test.describe("Email-change retry recovery", () => {
  test("retains request and token input across failed writes, then recovers", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    await setRetryFixture(context, baseURL);
    await page.goto("/settings/account");

    const email = page.getByRole("textbox", { name: "New sign-in email" });
    await email.fill("new@example.test");
    await page.getByRole("button", { name: "Send confirmation link" }).click();
    await expect(
      page.getByRole("button", { name: "Sending confirmation link..." }),
    ).toBeDisabled();
    await expect(email).toBeDisabled();

    await releaseFirstRequest(page);
    await expect(
      page.getByRole("alert").filter({
        hasText: "We couldn't send the confirmation email. Please try again.",
      }),
    ).toBeVisible();
    await expect(email).toHaveValue("new@example.test");

    await page.getByRole("button", { name: "Send confirmation link" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: "new@example.test" }),
    ).toBeVisible();

    const token = page.getByRole("textbox", { name: "Confirmation token" });
    await token.fill("retry-token");
    await page.getByRole("button", { name: "Confirm change" }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({
          hasText: "We couldn't confirm that link. Please try again.",
        }),
    ).toBeVisible();
    await expect(token).toHaveValue("retry-token");
    await expect(
      page.getByRole("button", { name: "Confirm change" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Confirm change" }).click();
    await expect(
      page.getByRole("status").filter({
        hasText: "Your sign-in email was updated.",
      }),
    ).toBeVisible();
  });
});
