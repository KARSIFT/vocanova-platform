import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("retries the failed initial onboarding profile read", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `onboarding-read-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_onboarding_status", value: "not_started", url: baseURL },
    { name: "e2e_read_failure", value: "onboarding", url: baseURL },
  ]);

  await page.goto("/onboarding");
  await expect(
    page.getByRole("heading", {
      name: "We couldn't load onboarding",
      level: 1,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome to Vocanova", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("radiogroup", {
      name: "How would you describe your English?",
    }),
  ).toBeVisible();
});
