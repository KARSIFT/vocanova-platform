import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

type PreviewFixture = "saved-unavailable" | "sentence-unavailable";

async function useProgressPreviewFixture(
  context: import("@playwright/test").BrowserContext,
  baseURL: string,
  fixture: PreviewFixture | "saved-reauth" | "sentence-reauth" | "progress-reauth",
) {
  await context.addCookies([
    { name: "vocanova_session", value: randomUUID(), url: baseURL },
    { name: "e2e_progress_preview_fixture", value: fixture, url: baseURL },
  ]);
}

function progressSummary(page: import("@playwright/test").Page) {
  return {
    confidencePoints: page.getByText("120", { exact: true }),
    streak: page.getByText("3-day streak", { exact: true }),
    missions: page.getByRole("heading", { name: "Recent missions", level: 2 }),
  };
}

for (const [fixture, failedPreview, availablePreview] of [
  ["saved-unavailable", "saved vocabulary", "Recent sentence practice"],
  ["sentence-unavailable", "recent sentence practice", "Recently saved vocabulary"],
] as const) {
  test(`keeps Progress and the other preview visible when ${failedPreview} is unavailable, then retries`, async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await useProgressPreviewFixture(context, baseURL, fixture);

    await page.goto("/progress");

    const summary = progressSummary(page);
    await expect(summary.confidencePoints).toBeVisible();
    await expect(summary.streak).toBeVisible();
    await expect(summary.missions).toBeVisible();
    await expect(page.getByRole("heading", { name: availablePreview, level: 2 })).toBeVisible();

    const previewAlert = page
      .getByRole("alert")
      .filter({ hasText: `We couldn't load ${failedPreview}.` });
    await expect(previewAlert).toContainText(
      "This preview is unavailable right now.",
    );
    await expect(page.getByText("No saved words yet. Save words from a journey to track your vocabulary here.")).toHaveCount(
      fixture === "saved-unavailable" ? 0 : 1,
    );
    await page.getByRole("button", { name: `Try loading ${failedPreview} again` }).click();

    await expect(previewAlert).toHaveCount(0);
    if (fixture === "saved-unavailable") {
      await expect(page.getByText("No saved words yet. Save words from a journey to track your vocabulary here.")).toBeVisible();
    } else {
      await expect(page.getByText("arrival", { exact: true })).toBeVisible();
    }
    await expect(summary.confidencePoints).toBeVisible();
    await expect(summary.streak).toBeVisible();
  });
}

for (const fixture of [
  "saved-reauth",
  "sentence-reauth",
  "progress-reauth",
] as const) {
  test(`redirects to sign in when the ${fixture.replace("-reauth", "")} Progress read returns 401`, async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await useProgressPreviewFixture(context, baseURL, fixture);

    await page.goto("/progress");
    await expect(page).toHaveURL(/\/signin\?returnTo=%2Fprogress/);
    await expect(page.getByRole("heading", { name: "Sign in to Vocanova", level: 1 })).toBeVisible();
  });
}
