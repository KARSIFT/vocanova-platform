import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps an authenticated learner on page after logout fails, then retries", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  const csrf = `logout-csrf-${randomUUID()}`;
  await context.addCookies([
    { name: "vocanova_session", value: `logout-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: csrf, url: baseURL },
  ]);
  await page.goto("/home");
  let calls = 0;
  await page.route("**/api/v1/auth/logout", async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({ status: 503, contentType: "application/problem+json", body: JSON.stringify({ detail: "temporarily unavailable" }) });
      return;
    }
    await route.continue();
  });
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByText("temporarily unavailable")).toBeVisible();
  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByRole("button", { name: "Log out" })).toBeEnabled();
  expect((await context.cookies()).some((cookie) => cookie.name === "vocanova_csrf" && cookie.value === csrf)).toBe(true);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/signin/);
  expect(calls).toBe(2);
});
