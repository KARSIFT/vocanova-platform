import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("clears feedback for an edited sentence and accepts a new submission", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  const csrfToken = `sentence-edit-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `sentence-edit-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
  ]);

  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const saveResponse = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/api/v1/user-words`,
    {
      data: { meaningId: "mean-pour", source: "journey" },
      headers: { "X-CSRF-Token": csrfToken },
    },
  );
  expect(saveResponse.ok()).toBeTruthy();

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  const sentenceInput = page.getByRole("textbox", {
    name: /Write a sentence using pour/,
  });
  await sentenceInput.fill("I will pour the coffee into a cup.");
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(page.getByRole("status", { name: "Feedback result: Correct" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Report a problem" })).toBeVisible();

  let releaseReport: (() => void) | undefined;
  const reportReleased = new Promise<void>((resolve) => {
    releaseReport = resolve;
  });
  await page.route("**/api/v1/sentence-feedback/*/reports", async (route) => {
    await reportReleased;
    await route.continue();
  });
  const reportResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/api/v1/sentence-feedback/") &&
      response.url().endsWith("/reports") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Report a problem" }).click();
  await page
    .getByRole("radio", { name: "The feedback is irrelevant" })
    .check();
  await page.getByRole("button", { name: "Send report" }).click();

  const replacement = "I pour water every morning.";
  await sentenceInput.fill(replacement);
  await expect(sentenceInput).toHaveValue(replacement);
  await expect(
    page.getByRole("status", { name: "Feedback result: Correct" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Report a problem" })).toHaveCount(0);

  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(page.getByRole("status", { name: "Feedback result: Correct" })).toBeVisible();
  releaseReport?.();
  expect((await reportResponse).status()).toBe(204);
  await expect(page.getByRole("button", { name: "Report a problem" })).toBeVisible();
  await expect(page.getByText("Reported", { exact: true })).toHaveCount(0);
});
