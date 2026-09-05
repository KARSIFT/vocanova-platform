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
  const submissionFingerprints: Array<{
    body: unknown;
    idempotencyKey: string | undefined;
  }> = [];
  let committedResponse: unknown;
  let replayedResponse: unknown;
  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionRequests += 1;
    submissionFingerprints.push({
      body: route.request().postDataJSON(),
      idempotencyKey: route.request().headers()["idempotency-key"],
    });
    if (submissionRequests > 1) {
      const response = await route.fetch();
      replayedResponse = await response.json();
      await route.fulfill({
        status: response.status(),
        contentType: "application/json",
        body: JSON.stringify(replayedResponse),
      });
      return;
    }

    const response = await route.fetch();
    committedResponse = await response.json();
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

  await expect(
    page.getByText("Unable to submit your answer. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
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
  expect(submissionFingerprints).toHaveLength(2);
  expect(submissionFingerprints[1]).toEqual(submissionFingerprints[0]);
  expect(replayedResponse).toEqual(committedResponse);

  const progressResponse = await page.request.get(
    `http://127.0.0.1:${mockApiPort}/api/v1/progress`,
  );
  expect(progressResponse.ok()).toBeTruthy();
  expect((await progressResponse.json()).confidencePointsBalance).toBe(125);

  const missionResponse = await page.request.get(
    `http://127.0.0.1:${mockApiPort}/api/v1/daily-mission`,
  );
  expect(missionResponse.ok()).toBeTruthy();
  expect((await missionResponse.json()).reviewsCompleted).toBe(1);
});
