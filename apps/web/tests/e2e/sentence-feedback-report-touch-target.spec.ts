import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("keeps feedback reporting reachable with a 44px touch target", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `test-session-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: `test-csrf-${randomUUID()}`, url: baseURL },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("textbox", { name: /Write a sentence using pour/ }).fill(
    "I will pour the coffee into a cup.",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();
  const reportButton = page.getByRole("button", { name: "Report a problem" });
  await expect(reportButton).toBeVisible();
  const reportButtonBox = await reportButton.boundingBox();
  expect(reportButtonBox).not.toBeNull();
  expect(reportButtonBox?.height).toBeGreaterThanOrEqual(44);
  await reportButton.click();
  await page
    .getByRole("radio", { name: "The correction is wrong" })
    .check();
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(
    page.getByRole("status", { name: "Feedback report submitted" }),
  ).toBeVisible();
});
