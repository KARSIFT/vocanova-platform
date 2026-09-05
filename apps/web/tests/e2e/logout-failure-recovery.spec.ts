import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps an authenticated learner on page after logout fails, then retries", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  const csrf = `logout-csrf-${randomUUID()}`;
  await context.addCookies([
    { name: "vocanova_session", value: `logout-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: csrf, url: baseURL },
  ]);
  await page.goto("/home");
  let calls = 0;
  let releaseFailure!: () => void;
  const failureReleased = new Promise<void>((resolve) => {
    releaseFailure = resolve;
  });
  let observeRequest!: () => void;
  const requestObserved = new Promise<void>((resolve) => {
    observeRequest = resolve;
  });
  await page.route("**/api/v1/auth/logout", async (route) => {
    calls += 1;
    if (calls === 1) {
      observeRequest();
      await failureReleased;
      await route.fulfill({
        status: 503,
        contentType: "application/problem+json",
        body: JSON.stringify({ detail: "temporarily unavailable" }),
      });
      return;
    }
    await route.continue();
  });
  await page.getByRole("button", { name: "Log out" }).click();
  await requestObserved;
  await expect(
    page.getByRole("button", { name: "Signing out..." }),
  ).toBeDisabled();
  expect(calls).toBe(1);
  await expect(page).toHaveURL(/\/home$/);
  releaseFailure();
  await expect(
    page.getByText("Unable to log out. Please try again."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByRole("button", { name: "Log out" })).toBeEnabled();
  expect(
    (await context.cookies()).some(
      (cookie) => cookie.name === "vocanova_csrf" && cookie.value === csrf,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/signin/);
  expect(
    (await context.cookies()).some((cookie) => cookie.name === "vocanova_csrf"),
  ).toBe(false);
  expect(calls).toBe(2);
});
