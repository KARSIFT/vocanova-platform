import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("attributes Home sentence practice to the daily mission", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `home-sentence-source-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `home-sentence-source-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("button", { name: "Remove pour from saved words" }),
  ).toBeVisible();

  await page.goto("/home");
  await page
    .getByRole("textbox", { name: /Write a sentence using pour/ })
    .fill("I will pour the coffee into a cup.");
  const submission = page.waitForRequest(
    (request) =>
      request.url().includes("/api/v1/sentence-feedback") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();

  expect((await submission).postDataJSON()).toMatchObject({
    sentenceText: "I will pour the coffee into a cup.",
    source: "daily_mission",
    attemptId: "uw-mean-pour",
  });
});
