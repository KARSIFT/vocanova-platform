import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

async function completeSelfCheck(page: Page) {
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
}

async function completeCurrentReview(page: Page) {
  const word = (await page.getByRole("heading", { level: 2 }).textContent())?.trim();
  if (word === "baggage" || word === "departure") {
    await completeSelfCheck(page);
    return;
  }
  await page
    .getByRole("button", {
      name:
        word === "arrival"
          ? /the act of reaching a place/
          : /a long flat surface for service/,
    })
    .click();
  await page.getByRole("button", { name: "Good", exact: true }).click();
}

test("bounds a review session to the remaining daily target and makes continuation explicit", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    { name: "vocanova_session", value: `mission-bound-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: `mission-bound-csrf-${randomUUID()}`, url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    { name: "e2e_review_mission_fixture", value: "target-three", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(page.getByText("Card 1 of 3", { exact: true })).toBeVisible();
  await completeCurrentReview(page);
  await expect(page.getByText("Card 2 of 3", { exact: true })).toBeVisible();
  await completeCurrentReview(page);
  await expect(page.getByText("Card 3 of 3", { exact: true })).toBeVisible();
  await completeCurrentReview(page);

  await expect(page.getByRole("heading", { name: "Review session complete", level: 2 })).toBeVisible();
  await expect(page.getByText("You reached today’s review target.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue with up to 1 more reviews" }).click();
  await expect(page.getByText("Card 1 of 1", { exact: true })).toBeVisible();
  await completeCurrentReview(page);
  await expect(page.getByText("You completed 1 review in this session.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with up to/ })).toHaveCount(0);
});

test("uses the remaining target and does not offer continuation when fewer due words exist", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    { name: "vocanova_session", value: `mission-partial-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: `mission-partial-csrf-${randomUUID()}`, url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    { name: "e2e_review_mission_fixture", value: "partially-completed", url: baseURL },
  ]);
  await page.goto("/reviews");
  await expect(page.getByText("Card 1 of 2", { exact: true })).toBeVisible();

  await context.addCookies([
    { name: "vocanova_session", value: `mission-short-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: `mission-short-csrf-${randomUUID()}`, url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    { name: "e2e_review_mission_fixture", value: "fewer-due-words", url: baseURL },
  ]);
  await page.goto("/reviews");
  for (let index = 0; index < 4; index += 1) await completeCurrentReview(page);
  await expect(page.getByText("No more due words are available for this session.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with up to/ })).toHaveCount(0);
});

test("makes already-met targets optional and reports fewer available due words truthfully", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    { name: "vocanova_session", value: `mission-met-${randomUUID()}`, url: baseURL },
    { name: "vocanova_csrf", value: `mission-met-csrf-${randomUUID()}`, url: baseURL },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
    { name: "e2e_review_mission_fixture", value: "already-met", url: baseURL },
  ]);

  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Review target reached", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Start optional practice (up to 4 reviews)" }).click();
  await expect(page.getByText("Card 1 of 4", { exact: true })).toBeVisible();
});
