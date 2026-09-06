import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test.describe("Timezone preference", () => {
  test("saves manual and device timezones and restores the persisted value after reload", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const domain = new URL(baseURL).hostname;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `timezone-settings-${randomUUID()}`,
        domain,
        path: "/",
      },
      { name: "vocanova_csrf", value: "timezone-csrf", domain, path: "/" },
    ]);
    await page.addInitScript(() => {
      const original = Intl.DateTimeFormat;
      Object.defineProperty(Intl, "DateTimeFormat", {
        configurable: true,
        value: function () {
          const formatter = new original();
          formatter.resolvedOptions = () => ({
            ...original().resolvedOptions(),
            timeZone: "America/New_York",
          });
          return formatter;
        },
      });
    });

    await page.goto("/settings");
    const timezone = page.getByRole("combobox", { name: "IANA timezone" });
    await expect(timezone).toHaveValue("UTC");
    await timezone.fill("Asia/Tehran");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Your settings have been saved.")).toBeVisible();
    await page.reload();
    await expect(timezone).toHaveValue("Asia/Tehran");

    await page.getByRole("button", { name: "Use device timezone" }).click();
    await expect(timezone).toHaveValue("America/New_York");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Your settings have been saved.")).toBeVisible();
    await page.reload();
    await expect(timezone).toHaveValue("America/New_York");
  });

  test("keeps UTC usable when timezone detection fails and sends an onboarding correction", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const domain = new URL(baseURL).hostname;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `timezone-onboarding-${randomUUID()}`,
        domain,
        path: "/",
      },
      { name: "vocanova_csrf", value: "timezone-csrf", domain, path: "/" },
      { name: "e2e_onboarding_status", value: "not_started", domain, path: "/" },
    ]);
    await page.addInitScript(() => {
      Object.defineProperty(Intl, "DateTimeFormat", {
        configurable: true,
        value: () => {
          throw new Error("timezone unavailable");
        },
      });
    });

    await page.goto("/onboarding");
    await page.getByLabel("A1 — Beginner").check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("textbox", { name: "Native language" }).fill("en");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Work").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Work").last().check();
    await page.getByRole("button", { name: "Continue" }).click();

    const timezone = page.getByRole("combobox", { name: "Timezone" });
    await expect(timezone).toHaveValue("UTC");
    await timezone.fill("");
    await expect(page.getByRole("button", { name: "Finish setup" })).toBeDisabled();
    await timezone.fill("Europe/London");
    const onboarding = page.waitForRequest((request) =>
      request.method() === "POST" && request.url().endsWith("/api/v1/onboarding"),
    );
    await page.getByRole("button", { name: "Finish setup" }).click();
    await expect.poll(async () => JSON.parse((await onboarding).postData() ?? "{}")).toMatchObject({
      timezone: "Europe/London",
    });
  });

  test("rejects invalid IANA timezones in onboarding and settings", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const domain = new URL(baseURL).hostname;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `timezone-invalid-${randomUUID()}`,
        domain,
        path: "/",
      },
      { name: "vocanova_csrf", value: "timezone-csrf", domain, path: "/" },
      { name: "e2e_onboarding_status", value: "not_started", domain, path: "/" },
    ]);

    await page.goto("/onboarding");
    await page.getByLabel("A1 — Beginner").check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("textbox", { name: "Native language" }).fill("en");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Work").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Work").last().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("combobox", { name: "Timezone" }).fill("Mars/Olympus");
    const onboardingResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/onboarding") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Finish setup" }).click();
    expect((await onboardingResponse).status()).toBe(422);

    await context.clearCookies({ name: "e2e_onboarding_status" });
    await page.goto("/settings");
    await page
      .getByRole("combobox", { name: "IANA timezone" })
      .fill("Mars/Olympus");
    const settingsResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/settings") &&
        response.request().method() === "PATCH",
    );
    await page.getByRole("button", { name: "Save settings" }).click();
    expect((await settingsResponse).status()).toBe(422);
  });
});
