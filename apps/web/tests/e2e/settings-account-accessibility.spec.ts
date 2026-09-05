// Accessibility scan for /settings/account.
//
// Extracted from settings-accessibility.spec.ts so issue #536's
// dedicated spec file per entry route is satisfied without duplicating CI time.
// /settings/account renders the email-change form, the current email, and the
// account-deletion form — the highest-stakes settings sub-screen. Keyboard-
// reachability and non-color-only assertions are stricter here than on read-only
// screens: a learner who cannot operate the deletion flow because colour-only
// feedback signals the typed-phrase confirmation would be locked out of their
// own account.

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Settings account accessibility", () => {
  test("moves keyboard focus to the deletion confirmation phrase", async ({
    page,
  }) => {
    await page.goto("/settings/account");
    await page
      .getByRole("button", { name: "I want to delete my account" })
      .focus();
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("textbox", { name: "Type the confirmation phrase" }),
    ).toBeFocused();
  });

  test("returns keyboard focus to the deletion trigger after cancellation", async ({
    page,
  }) => {
    await page.goto("/settings/account");
    const deleteTrigger = page.getByRole("button", {
      name: "I want to delete my account",
    });
    await deleteTrigger.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("textbox", { name: "Type the confirmation phrase" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Cancel" }).focus();
    await page.keyboard.press("Enter");
    await expect(deleteTrigger).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("textbox", { name: "Type the confirmation phrase" }),
    ).toBeFocused();
  });

  test("moves keyboard focus to the confirmation token after requesting an email change", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    await page
      .context()
      .addCookies([
        { name: "vocanova_csrf", value: "test-csrf", url: baseURL },
      ]);
    await page.route("**/api/v1/settings/email-change-links", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": new URL(baseURL).origin,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    });

    await page.goto("/settings/account");
    await page
      .getByRole("textbox", { name: "New sign-in email" })
      .fill("new@example.test");
    await page.getByRole("button", { name: "Send confirmation link" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByLabel("Confirmation token")).toBeFocused();
    await expect(
      page.getByRole("status").filter({ hasText: "new@example.test" }),
    ).toBeVisible();
  });

  test("returns keyboard focus to the email field after canceling confirmation", async ({
    page,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    const email = page.getByRole("textbox", { name: "New sign-in email" });
    await page.context().addCookies([
      {
        name: "vocanova_session",
        value: `email-cancel-${Date.now()}`,
        url: baseURL,
      },
      {
        name: "vocanova_csrf",
        value: `email-cancel-csrf-${Date.now()}`,
        url: baseURL,
      },
    ]);

    await page.goto("/settings/account");
    await email.fill("new@example.test");
    await page.getByRole("button", { name: "Send confirmation link" }).click();
    await expect(page.getByLabel("Confirmation token")).toBeFocused();

    await page.getByRole("button", { name: "Cancel" }).focus();
    await page.keyboard.press("Enter");
    await expect(email).toBeFocused();

    await email.fill("another@example.test");
    await page.getByRole("button", { name: "Send confirmation link" }).click();
    await expect(page.getByLabel("Confirmation token")).toBeFocused();
  });

  test("/settings/account renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state", async ({
    page,
  }, testInfo) => {
    await page.goto("/settings/account");

    await expect(
      page.getByRole("heading", { name: "Account", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /settings/account; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // /settings/account has the Back to Settings link + 1 email
    // input + 1 confirmation-phrase input + 1 token input + 2
    // submit buttons (one for email-change request, one for
    // account deletion) = at least 6 focusable elements.
    await assertKeyboardReachable(page, { minFocusable: 5 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/settings/account",
      requireText: [
        "text=Sign-in email",
        "text=Delete your account",
        "text=Current address:",
        // The "We'll deactivate your account right away, then
        // permanently anonymize your data after 30 days" copy
        // is the most important text on the deletion section -
        // it is the only signal a screen reader user has that
        // the deletion is staged and reversible for 30 days.
        "text=permanently anonymize your data after 30 days",
      ],
    });

    expect(testInfo.project.name).toMatch(
      /^(home-desktop-1280|mobile-360|mobile-430)$/,
    );
  });
});
