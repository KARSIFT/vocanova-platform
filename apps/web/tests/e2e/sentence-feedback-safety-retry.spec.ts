import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps a safety-rejected sentence, prevents duplicate pending retries, and never claims mission completion", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `sentence-safety-retry-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `sentence-safety-retry-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();

  const sentenceInput = page.getByRole("textbox", {
    name: /Write a sentence using pour/,
  });
  await sentenceInput.fill("Unsafe feedback fixture pour.");
  await page.getByRole("button", { name: "Check my sentence" }).click();

  await expect(
    page
      .getByRole("alert")
      .filter({
        hasText: "This sentence cannot be checked. Please try a different sentence.",
      }),
  ).toBeVisible();
  await expect(sentenceInput).toHaveValue("Unsafe feedback fixture pour.");
  await expect(page.getByText("Mission completed: Not yet")).toBeVisible();

  let releaseCorrectedRequest: (() => void) | undefined;
  const correctedRequestReleased = new Promise<void>((resolve) => {
    releaseCorrectedRequest = resolve;
  });
  let correctedRequestCount = 0;
  await page.route("**/api/v1/sentence-feedback", async (route) => {
    correctedRequestCount += 1;
    await correctedRequestReleased;
    await route.continue();
  });

  await sentenceInput.fill("I will pour the coffee into a cup.");
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(page.getByRole("button", { name: "Checking..." })).toBeDisabled();
  await page.getByRole("button", { name: "Checking..." }).click({ force: true });
  expect(correctedRequestCount).toBe(1);

  releaseCorrectedRequest?.();
  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await expect(page.getByText("Mission completed: Not yet")).toBeVisible();
  expect(correctedRequestCount).toBe(1);
});
