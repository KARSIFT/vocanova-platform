// Accessibility scan for / (landing).
//
// The root page is public and gives prospective learners a clear,
// accessible entry to the existing sign-in flow.

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Landing accessibility", () => {
  test("/ renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based content", async ({
    page,
  }, testInfo) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: "Practical English, every day",
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Get started" }),
    ).toHaveAttribute("href", "/signin");

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    await assertKeyboardReachable(page, { minFocusable: 1 });

    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/",
      requireText: [
        "text=Practical English, every day",
        "text=Build confidence with short, focused vocabulary practice.",
      ],
    });

    expect(testInfo.project.name).toMatch(
      /^(home-desktop-1280|mobile-360|mobile-430)$/,
    );
  });
});
