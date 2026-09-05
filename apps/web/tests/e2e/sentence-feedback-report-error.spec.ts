import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test.describe("Sentence feedback report errors", () => {
  test("announces a failed report and safely retries it", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected a Playwright base URL.");
    }

    const csrfValue = `test-csrf-${randomUUID()}`;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `test-session-${randomUUID()}`,
        url: baseURL,
      },
      { name: "vocanova_csrf", value: csrfValue, url: baseURL },
    ]);

    await page.goto("/discover/ordering-at-a-cafe/pour");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
    await page
      .getByRole("textbox", { name: /Write a sentence using pour/ })
      .fill("I will pour the coffee into a cup.");
    await page.getByRole("button", { name: "Check my sentence" }).click();
    await expect(page.getByText("Correct", { exact: true })).toBeVisible();

    let reportRequestCount = 0;
    await page.route("**/api/v1/sentence-feedback/*/reports", async (route) => {
      reportRequestCount += 1;
      if (reportRequestCount === 1) {
        await route.fulfill({
          status: 503,
          contentType: "application/problem+json",
          body: JSON.stringify({
            type: "https://vocanova.test/problems/unavailable",
            title: "Service unavailable",
            status: 503,
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.getByRole("button", { name: "Report a problem" }).click();

    const reportFailure = page.getByRole("alert").filter({
      hasText: "Unable to report. Try again.",
    });
    await expect(reportFailure).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Report a problem" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Report a problem" }).click();
    await expect(
      page.getByRole("status", { name: "Feedback report submitted" }),
    ).toBeVisible();
    await expect(reportFailure).toBeHidden();
    expect(reportRequestCount).toBe(2);
  });
});
