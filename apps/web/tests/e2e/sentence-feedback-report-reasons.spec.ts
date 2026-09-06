import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import {
  formatViolations,
  scanForAxeViolations,
} from "./axe-helper.js";

async function authenticate(
  context: BrowserContext,
  baseURL: string,
  prefix: string,
) {
  const csrfToken = `${prefix}-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `${prefix}-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
  ]);
  return csrfToken;
}

async function submitFromWordDetail(page: Page) {
  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await page
    .getByRole("textbox", { name: /Write a sentence using pour/ })
    .fill("I will pour the coffee into a cup.");
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toBeVisible();
}

test.describe("Sentence feedback report reasons", () => {
  test("opens a keyboard-operable reason form, returns focus on cancel, and submits a fixed classification", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await authenticate(context, baseURL, "report-reasons-word-detail");
    await submitFromWordDetail(page);

    const trigger = page.getByRole("button", { name: "Report a problem" });
    await trigger.click();
    const firstReason = page.getByRole("radio", {
      name: "The correction is wrong",
    });
    await expect(page.getByRole("radio")).toHaveCount(5);
    await expect(firstReason).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("radio", { name: "The explanation is unclear" }),
    ).toBeChecked();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.keyboard.press("ArrowDown");
    await page.getByRole("button", { name: "Send report" }).click();
    await expect(
      page.getByRole("status", { name: "Feedback report submitted" }),
    ).toBeVisible();

    const axe = await scanForAxeViolations(page);
    expect(
      axe.criticalOrSerious,
      `Expected zero critical or serious axe-core violations after reporting feedback; found:\n${formatViolations(
        axe.criticalOrSerious,
      ).join("\n")}`,
    ).toEqual([]);
  });

  test("submits a report from Home", async ({ page, context }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await authenticate(context, baseURL, "report-reasons-home");
    await context.addCookies([
      { name: "e2e_home_fixture", value: "caught-up", url: baseURL },
    ]);
    await page.goto("/home");
    await page
      .getByRole("textbox", { name: /Write a sentence using arrival/ })
      .fill("My arrival is at noon.");
    await page.getByRole("button", { name: "Check my sentence" }).click();
    await page.getByRole("button", { name: "Report a problem" }).click();
    await page
      .getByRole("radio", { name: "The feedback is irrelevant" })
      .check();
    await page.getByRole("button", { name: "Send report" }).click();
    await expect(
      page.getByRole("status", { name: "Feedback report submitted" }),
    ).toBeVisible();
  });

  test("submits a report after Review completion", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const csrfToken = await authenticate(context, baseURL, "report-reasons-review");
    const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
    const savedWord = await page.request.post(
      `http://127.0.0.1:${mockApiPort}/api/v1/user-words`,
      {
        data: { meaningId: "mean-pour", source: "journey" },
        headers: { "X-CSRF-Token": csrfToken },
      },
    );
    expect(savedWord.ok()).toBeTruthy();
    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Review session complete" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: /Write a sentence using pour/ })
      .fill("I will pour the coffee into a cup.");
    await page.getByRole("button", { name: "Check my sentence" }).click();
    await page.getByRole("button", { name: "Report a problem" }).click();
    await page
      .getByRole("radio", { name: "Another quality problem" })
      .check();
    await page.getByRole("button", { name: "Send report" }).click();
    await expect(
      page.getByRole("status", { name: "Feedback report submitted" }),
    ).toBeVisible();
  });
});
