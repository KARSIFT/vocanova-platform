// Home accessibility scan at the two mobile viewports
// (360px, 430px). The desktop spec covers /home at 1280x720.
// This file covers the mobile breakpoints required by DOC-03 §10,
// including keyboard reachability and non-color-only feedback in
// addition to the axe scan.

import { expect, test } from "@playwright/test";

import {
  assertKeyboardReachable,
  assertNonColorOnlyFeedback,
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Home accessibility (mobile)", () => {
  test("Home renders with zero critical/serious axe violations, is keyboard reachable, and uses text-based state at 360 / 430", async ({
    page,
  }, testInfo) => {
    // This scan is intentionally scoped to the mobile projects.
    test.skip(
      testInfo.project.name === "home-desktop-1280",
      "The mobile scan is scoped to mobile-360 and mobile-430; desktop coverage has its own spec.",
    );

    await page.goto("/home");

    await expect(
      page.getByRole("heading", { name: "Today's Mission", level: 1 }),
    ).toBeVisible();

    const { criticalOrSerious } = await scanForAxeViolations(page);
    expect(
      criticalOrSerious,
      `Expected zero critical or serious axe-core violations on /home; found:\n${formatViolations(
        criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);

    // The Home page renders at least two links ("Go to Journey",
    // "Start review") and the sentence-feedback form's submit
    // button. Use a conservative floor.
    await assertKeyboardReachable(page, { minFocusable: 2 });

    // Non-color-only feedback: the mission progress text, the
    // streak text, and the "words due today" line all carry
    // their state in text, not just color. The empty-saved-words
    // message is also text.
    await assertNonColorOnlyFeedback(page, {
      contextLabel: "/home",
      requireText: [
        "text=Review target",
        "text=words reviewed today",
        "text=-day streak",
        "text=words due today",
      ],
    });
  });
});
