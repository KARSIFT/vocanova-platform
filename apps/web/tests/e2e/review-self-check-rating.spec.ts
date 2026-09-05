import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const ratingCases = [
  { rating: "Again", result: "incorrect", confidencePointsBalance: 121 },
  { rating: "Good", result: "correct", confidencePointsBalance: 125 },
] as const;

for (const ratingCase of ratingCases) {
  test(`records self-check ${ratingCase.rating} with its derived result`, async (
    { page, context },
    testInfo,
  ) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected the Playwright project to configure use.baseURL.");
    }

    const csrfToken = `self-check-review-csrf-${randomUUID()}`;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `self-check-review-${ratingCase.rating}-${randomUUID()}`,
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

    const submissions: unknown[] = [];
    await page.route("**/api/v1/reviews/submissions", async (route) => {
      submissions.push(route.request().postDataJSON());
      await route.continue();
    });

    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await expect(page.getByText("Answer", { exact: true })).toBeVisible();
    await expect(
      page.getByText("to make liquid flow into a container", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Again", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hard", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Good", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Easy", exact: true })).toBeVisible();

    await page
      .getByRole("button", { name: ratingCase.rating, exact: true })
      .click();

    await expect(
      page.getByText("You completed 1 review in this session.", {
        exact: true,
      }),
    ).toBeVisible();
    expect(submissions).toEqual([
      expect.objectContaining({
        meaningId: "mean-pour",
        promptType: "self_check",
        result: ratingCase.result,
        rating: ratingCase.rating.toLowerCase(),
      }),
    ]);
    expect(submissions[0]).not.toHaveProperty("selectedOptionMeaningId");

    const progressResponse = await page.request.get(
      `http://127.0.0.1:${mockApiPort}/api/v1/progress`,
    );
    expect(progressResponse.ok()).toBeTruthy();
    expect((await progressResponse.json()).confidencePointsBalance).toBe(
      ratingCase.confidencePointsBalance,
    );
  });
}
