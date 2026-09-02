// Home accessibility scan.
//
// This desktop scan proves the Playwright + axe-core harness is wired end-to-end (Playwright
// spins up, axe-core injects into the page, the WCAG 2.2 AA rule
// set runs, the impact filter narrows to critical/serious, the
// assertion fails the run if any are present, and the test
// summary in CI shows the violation rule + element + impact).
//
// The companion home-mobile-accessibility.spec.ts scans /home at
// 360px and 430px; this file remains the representative desktop scan.

import { expect, test } from "@playwright/test";

import {
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

test.describe("Home accessibility", () => {
  test("Home renders with zero critical or serious axe-core violations at 1280x720", async ({
    page,
  }, testInfo) => {
    // Mobile coverage lives in home-mobile-accessibility.spec.ts.
    test.skip(
      testInfo.project.name !== "home-desktop-1280",
      "This scan covers the representative desktop layout; mobile coverage has its own spec.",
    );

    // The mock API server (started by playwright.config.ts's
    // webServer entries) handles /api/v1/me + the home page's data
    // reads. The auth-gate middleware reads the same /api/v1/me
    // response, so a 200 there lets the request through to
    // /home instead of redirecting to /signin.
    await page.goto("/home");

    // The "Today's Mission" heading is the most specific
    // signal that the Home page server component has rendered
    // with the mocked data; waiting on it (rather than on a
    // generic network-idle) keeps the scan from running
    // against a still-streaming SSR response and from
    // reporting false-positive violations for half-rendered
    // markup.
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
  });
});
