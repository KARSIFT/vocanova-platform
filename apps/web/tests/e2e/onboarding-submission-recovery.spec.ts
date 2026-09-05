import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps complete onboarding answers through a failed final save and retries once", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  const csrfToken = `onboarding-recovery-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `onboarding-recovery-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
    { name: "e2e_onboarding_status", value: "not_started", url: baseURL },
  ]);

  const requestBodies: unknown[] = [];
  let releaseFirstRequest!: () => void;
  const firstRequestReleased = new Promise<void>((resolve) => {
    releaseFirstRequest = resolve;
  });
  let firstRequestStarted!: () => void;
  const firstRequestObserved = new Promise<void>((resolve) => {
    firstRequestStarted = resolve;
  });

  await page.route("**/api/v1/onboarding", async (route) => {
    requestBodies.push(route.request().postDataJSON());
    if (requestBodies.length > 1) {
      await route.continue();
      return;
    }
    firstRequestStarted();
    await firstRequestReleased;
    await route.fulfill({
      status: 503,
      contentType: "application/problem+json",
      body: JSON.stringify({
        detail: "We couldn't save your answers. Please try again.",
      }),
    });
  });

  await page.goto("/onboarding");
  await page.getByLabel("B1 — Intermediate").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Native language").fill("Spanish");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Travel").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Daily life").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("radiogroup", { name: "Daily review target" })
    .getByText("15", { exact: true })
    .click();

  await page.getByRole("button", { name: "Finish setup" }).click();
  await firstRequestObserved;
  await expect(page.getByRole("button", { name: "Saving..." })).toBeDisabled();
  await expect(page).toHaveURL(/\/onboarding$/);
  releaseFirstRequest();

  await expect(
    page.getByText("We couldn't save your answers. Please try again."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Finish setup" }),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Daily life")).toBeChecked();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("15")).toBeChecked();

  await context.clearCookies({ name: "e2e_onboarding_status" });
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page).toHaveURL(/\/home$/);

  expect(requestBodies).toEqual([
    {
      englishLevel: "b1",
      nativeLanguage: "Spanish",
      learningGoal: "travel",
      mainUseCase: "daily_life",
      dailyReviewTarget: 15,
    },
    {
      englishLevel: "b1",
      nativeLanguage: "Spanish",
      learningGoal: "travel",
      mainUseCase: "daily_life",
      dailyReviewTarget: 15,
    },
  ]);
});
