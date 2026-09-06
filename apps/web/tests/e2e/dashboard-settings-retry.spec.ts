import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const cases = [
  [
    "/home",
    "home",
    "Something went wrong",
    "We couldn't load your home data. Please try again.",
    "Today's Mission",
  ],
  [
    "/progress",
    "progress",
    "Something went wrong",
    "We couldn't load your progress. Please try again.",
    "Progress",
  ],
  [
    "/settings",
    "settings",
    "We couldn't load your settings",
    "Please try again. Your settings are still safe.",
    "Settings",
  ],
  [
    "/settings/account",
    "account",
    "We couldn't load your account",
    "Please try again. Your account is still safe.",
    "Account",
  ],
] as const;

test.describe("Dashboard and settings retry boundaries", () => {
  for (const [path, fixture, errorHeading, errorCopy, heading] of cases) {
    test(`retries ${path} after a failed server read`, async ({
      page,
      context,
    }, testInfo) => {
      const baseURL = testInfo.project.use.baseURL;
      if (!baseURL)
        throw new Error("Expected Playwright to configure a base URL.");
      await context.addCookies([
        {
          name: "vocanova_session",
          value: `retry-${randomUUID()}`,
          url: baseURL,
        },
        { name: "e2e_read_failure", value: fixture, url: baseURL },
      ]);
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: errorHeading, level: 1 }),
      ).toBeFocused();
      await expect(page.getByText(errorCopy, { exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Try again" }).click();
      await expect(
        page.getByRole("heading", { name: heading, level: 1 }),
      ).toBeVisible();
    });
  }
});
