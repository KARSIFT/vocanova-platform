// Accessibility scan for /signin.
//
// The sign-in page is a public route (no auth cookie required).
// It renders an OAuth button, a magic-link email form, and
// divider copy. This test exercises the stable initial render
// before any submit/OAuth interaction.

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Sign-in accessibility", () => {
  test("keeps a submitted email and politely announces magic-link progress", async ({
    page,
  }) => {
    let releaseRequest!: () => void;
    const requestReleased = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });

    await page.route("**/api/v1/auth/magic-links", async (route) => {
      await requestReleased;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto("/signin");
    const email = page.getByLabel("Email address");
    await email.fill("learner@example.test");
    await email.press("Enter");

    await expect(page.getByRole("status")).toHaveText(
      "Sending sign-in link...",
    );
    await expect(email).toHaveValue("learner@example.test");
    await expect(
      page.getByRole("button", { name: "Sending..." }),
    ).toBeDisabled();

    releaseRequest();
    await expect(page.getByRole("status")).toHaveText(
      "If learner@example.test is valid, a sign-in link has been sent. Check your email and return to /home.",
    );
  });

  test("/signin renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based labels", async ({
    page,
  }, testInfo) => {
    await page.goto("/signin");

    await expect(
      page.getByRole("heading", { name: "Sign in to Vocanova", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /signin; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // OAuth button, email input, and submit button are the three
    // sequential Tab stops on the initial render.
    await assertKeyboardReachable(page, { minFocusable: 3, minTabStops: 3 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/signin",
      requireText: [
        "text=Choose a sign-in method",
        "text=Email address",
        "text=Send sign-in link",
      ],
    });

    expect(testInfo.project.name).toMatch(
      /^(home-desktop-1280|mobile-360|mobile-430)$/,
    );
  });
});
