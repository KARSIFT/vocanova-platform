import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const KEY = "vocanova.onboarding-recovery.v1";
const EMAIL = "onboarding-recovery@example.test";

async function prepareCompletedForm(
  page: import("@playwright/test").Page,
  context: import("@playwright/test").BrowserContext,
  baseURL: string,
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `onboarding-recovery-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `onboarding-recovery-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_onboarding_status", value: "not_started", url: baseURL },
  ]);
  await page.goto("/onboarding");
  await page.getByLabel("B1 — Intermediate").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Native language").fill("Persian");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Work").first().check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Daily life").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("radiogroup", { name: "Daily review target" })
    .getByText("30", { exact: true })
    .click();
  await page.getByRole("combobox", { name: "Timezone" }).fill("Asia/Tehran");
}

async function expireOnboardingSubmission(
  page: import("@playwright/test").Page,
) {
  await page.route("**/api/v1/onboarding", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: "application/problem+json",
      body: JSON.stringify({ detail: "authentication required" }),
    });
  });
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page).toHaveURL(/\/signin\?returnTo=%2Fonboarding/);
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY))
    .not.toBeNull();
  await page.unroute("**/api/v1/onboarding");
}

async function reauthenticate(
  page: import("@playwright/test").Page,
  returnTo = "/onboarding",
) {
  const port = process.env.MOCK_API_PORT ?? "8080";
  await page.request.post(`http://127.0.0.1:${port}/api/v1/auth/magic-links`, {
    data: { email: EMAIL, returnTo },
  });
  await page.goto(
    `/auth/magic?token=${randomUUID()}&email=${encodeURIComponent(EMAIL)}&returnTo=${encodeURIComponent(returnTo)}`,
  );
  await expect(page).toHaveURL(returnTo);
}

test("saves final onboarding answers on 401 and explicitly resumes them after reauthentication", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await prepareCompletedForm(page, context, baseURL);
  await expireOnboardingSubmission(page);
  await reauthenticate(page);

  await expect(page.getByRole("heading", { name: "Resume your setup?" })).toBeVisible();
  for (const name of ["Resume setup", "Discard saved answers"]) {
    const control = page.getByRole("button", { name });
    expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    await control.focus();
    await expect(control).toBeFocused();
  }
  await page.getByRole("button", { name: "Resume setup" }).click();
  await expect(page.getByRole("combobox", { name: "Timezone" })).toHaveValue(
    "Asia/Tehran",
  );
  await expect(page.getByLabel("30")).toBeChecked();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Daily life")).toBeChecked();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Work").last()).toBeChecked();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Native language")).toHaveValue("Persian");
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("B1 — Intermediate")).toBeChecked();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await context.clearCookies({ name: "e2e_onboarding_status" });
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page).toHaveURL("/home");
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY))
    .toBeNull();
});

test("discards an owner-matching recovered onboarding record", async ({
  page,
  context,
}, testInfo) => {
  await prepareCompletedForm(page, context, testInfo.project.use.baseURL!);
  await expireOnboardingSubmission(page);
  await reauthenticate(page);
  await page.getByRole("button", { name: "Discard saved answers" }).click();
  await expect(page.getByRole("heading", { name: "Resume your setup?" })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY))
    .toBeNull();
});

test("clears recovered onboarding answers when a different learner signs in", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await prepareCompletedForm(page, context, baseURL);
  await expireOnboardingSubmission(page);
  await context.addCookies([
    { name: "e2e_identity_fixture", value: "alternate", url: baseURL },
  ]);
  await reauthenticate(page);
  await expect(page.getByRole("heading", { name: "Resume your setup?" })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY))
    .toBeNull();
});
