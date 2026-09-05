import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

for (const enabled of [false, true]) {
  test(`unavailable reminders preserve the saved ${enabled} preference`, async ({ page, context }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a configured baseURL.");
    const csrf = randomUUID();
    await context.addCookies([
      { name: "vocanova_session", value: randomUUID(), url: baseURL },
      { name: "vocanova_csrf", value: csrf, url: baseURL },
    ]);
    const apiURL = `http://127.0.0.1:${process.env.MOCK_API_PORT ?? 8080}`;
    const seeded = await page.request.patch(`${apiURL}/api/v1/settings`, {
      headers: { "X-CSRF-Token": csrf },
      data: { notificationsEnabled: enabled },
    });
    expect(seeded.ok()).toBe(true);
    await page.goto("/settings");

    const reminders = page.getByRole("switch", { name: "Daily review reminders" });
    await expect(reminders).toBeDisabled();
    await expect(reminders).toHaveAttribute("aria-checked", String(enabled));
    await expect(page.getByText("Reminder emails are not available yet. Your saved preference is retained.")).toBeVisible();

    await page.getByRole("textbox", { name: "Display name" }).fill("Updated learner");
    const saving = page.waitForRequest((request) => request.method() === "PATCH" && request.url().endsWith("/api/v1/settings"));
    await page.getByRole("button", { name: "Save settings" }).click();
    expect((await saving).postDataJSON()).toEqual({ displayName: "Updated learner" });
    await expect(page.getByText("Your settings have been saved.")).toBeVisible();
    await page.reload();
    await expect(reminders).toHaveAttribute("aria-checked", String(enabled));
    await expect(page.getByRole("switch", { name: "Product news and tips" })).toBeEnabled();
  });
}
