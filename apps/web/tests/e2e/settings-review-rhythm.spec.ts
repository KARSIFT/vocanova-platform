import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

for (const preset of ["vocanova_default", "wordup_like", "custom"] as const) {
  test(`unavailable review rhythms preserve the saved ${preset} preference`, async ({
    page,
    context,
  }, testInfo) => {
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
      data: { reviewIntervalPreset: preset },
    });
    expect(seeded.ok()).toBe(true);

    await page.goto("/settings");
    await expect(page.getByRole("radio", { name: /Faster reminders/ })).toBeDisabled();
    await expect(page.getByRole("radio", { name: /Custom/ })).toBeDisabled();
    await expect(page.getByRole("radio", { name: /Vocanova default/ })).toBeEnabled();
    await expect(page.getByText("All reviews currently use the Vocanova default schedule.")).toBeVisible();
    await expect(page.locator(`input[name="reviewIntervalPreset"][value="${preset}"]`)).toBeChecked();

    await page.getByRole("textbox", { name: "Display name" }).fill("Updated learner");
    const savedRequest = page.waitForRequest(
      (request) => request.method() === "PATCH" && request.url().endsWith("/api/v1/settings"),
    );
    await page.getByRole("button", { name: "Save settings" }).click();
    expect((await savedRequest).postDataJSON()).toEqual({ displayName: "Updated learner" });
    await expect(page.getByText("Your settings have been saved.")).toBeVisible();
    await page.reload();
    await expect(page.locator(`input[name="reviewIntervalPreset"][value="${preset}"]`)).toBeChecked();
    await expect(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Updated learner");
  });
}
