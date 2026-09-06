import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps due review cards usable when daily-mission progress is unavailable", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected Playwright to configure a base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-mission-recovery-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-mission-recovery-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    {
      name: "e2e_daily_mission_fixture",
      value: "unavailable",
      url: baseURL,
    },
  ]);

  await page.goto("/reviews");

  await expect(
    page.getByRole("status", {
      name: "Mission progress is temporarily unavailable.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "arrival", level: 2, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "noun — the act of reaching a place",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "noun — the act of reaching a place",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "baggage", level: 2, exact: true }),
  ).toBeVisible();
  await expect(page.getByText("You reached today’s review target.")).toHaveCount(
    0,
  );
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});

test("redirects to sign in when the daily-mission read is unauthorized", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected Playwright to configure a base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-mission-reauth-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    { name: "e2e_daily_mission_fixture", value: "reauth", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(page).toHaveURL(/\/signin\?returnTo=%2Freviews/);
  await expect(
    page.getByRole("heading", { name: "Sign in to Vocanova", level: 1 }),
  ).toBeVisible();
});
