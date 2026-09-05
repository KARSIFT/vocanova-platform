import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("shows a successful-review count before optional sentence practice", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  const sessionId = `review-summary-${randomUUID()}`;
  const csrfToken = `review-summary-csrf-${randomUUID()}`;
  await context.addCookies([
    { name: "vocanova_session", value: sessionId, url: baseURL },
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

  await expect(
    page.getByText("You completed 1 review in this session.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Practice with pour/ }),
  ).toBeVisible();
});
