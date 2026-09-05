import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("replays a committed review and retries the due list without duplicate progress", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }

  const csrfToken = `review-retry-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-retry-${randomUUID()}`,
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

  let submissionRequests = 0;
  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionRequests += 1;
    if (submissionRequests > 1) {
      await route.continue();
      return;
    }

    await route.fetch();
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "response_lost" }),
    });
  });

  let dueListRequests = 0;
  await page.route("**/api/v1/reviews/due?limit=50", async (route) => {
    dueListRequests += 1;
    if (dueListRequests > 1) {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "due_list_unavailable" }),
    });
  });

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  await expect(page.getByText("HTTP 500", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Retry submission" }).click();

  await expect(
    page.getByRole("button", { name: "Retry loading reviews" }),
  ).toBeVisible();
  expect(submissionRequests).toBe(2);

  await page.getByRole("button", { name: "Retry loading reviews" }).click();
  await expect(
    page.getByText("You completed 1 review in this session.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(submissionRequests).toBe(2);
  expect(dueListRequests).toBe(2);
});
