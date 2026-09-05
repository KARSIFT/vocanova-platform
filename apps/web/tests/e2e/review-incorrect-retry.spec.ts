import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("records an incorrect multiple-choice answer as Again and retries it without duplicate progress", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  const csrfToken = `incorrect-review-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `incorrect-review-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  let submissionCount = 0;
  const submissionFingerprints: Array<{
    body: unknown;
    idempotencyKey: string | undefined;
  }> = [];
  let committedResponse: unknown;
  let replayedResponse: unknown;
  await page.route("**/api/v1/reviews/submissions", async (route) => {
    submissionCount += 1;
    submissionFingerprints.push({
      body: route.request().postDataJSON(),
      idempotencyKey: route.request().headers()["idempotency-key"],
    });

    const response = await route.fetch();
    const body = await response.json();
    if (submissionCount === 1) {
      committedResponse = body;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "response_lost" }),
      });
      return;
    }

    replayedResponse = body;
    await route.fulfill({
      status: response.status(),
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });

  await page.goto("/reviews");
  const wrongOption = page.getByRole("button", {
    name: /bags carried while travelling/,
  });
  await wrongOption.click();

  await expect(page.getByText("Not quite", { exact: true })).toBeVisible();
  await expect(
    page.getByText("The correct answer was: the act of reaching a place"),
  ).toBeVisible();
  const answerOptions = page.locator("fieldset").first().getByRole("button");
  await expect(answerOptions).toHaveCount(4);
  for (const option of await answerOptions.all()) {
    await expect(option).toBeDisabled();
  }
  await expect(page.getByRole("button", { name: "Hard", exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Good", exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Easy", exact: true })).toHaveCount(
    0,
  );

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByText("Unable to submit your answer. Please try again.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "arrival", level: 2 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry submission" }).click();

  await expect(
    page.getByRole("heading", { name: "baggage", level: 2 }),
  ).toBeVisible();
  expect(submissionCount).toBe(2);
  expect(submissionFingerprints).toHaveLength(2);
  expect(submissionFingerprints[0]?.idempotencyKey).toEqual(
    expect.any(String),
  );
  expect(submissionFingerprints[0]?.idempotencyKey).toBeTruthy();
  expect(submissionFingerprints[1]).toEqual(submissionFingerprints[0]);
  expect(submissionFingerprints[0]?.body).toMatchObject({
    meaningId: "e2e-review-meaning-arrival",
    promptType: "multiple_choice",
    result: "incorrect",
    rating: "again",
    selectedOptionMeaningId: "e2e-review-meaning-baggage",
  });
  expect(replayedResponse).toEqual(committedResponse);

  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const progressResponse = await page.request.get(
    `http://127.0.0.1:${mockApiPort}/api/v1/progress`,
  );
  expect(progressResponse.ok()).toBeTruthy();
  expect((await progressResponse.json()).confidencePointsBalance).toBe(121);
});
