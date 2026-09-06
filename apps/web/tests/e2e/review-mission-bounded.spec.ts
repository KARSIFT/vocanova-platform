import { randomUUID } from "node:crypto";
import { expect, test, type Page, type BrowserContext } from "@playwright/test";

async function seed(
  context: BrowserContext,
  baseURL: string,
  mission: string,
  queue = "multiple-choice",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `bounded-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: `csrf-${randomUUID()}`, url: baseURL },
    { name: "e2e_review_fixture", value: queue, url: baseURL },
    { name: "e2e_review_mission_fixture", value: mission, url: baseURL },
  ]);
}

async function answer(page: Page, word: string, multipleChoice = false) {
  await expect(
    page.getByRole("heading", { level: 2, name: word, exact: true }),
  ).toBeVisible();
  if (multipleChoice) {
    await page
      .getByRole("button", {
        name:
          word === "arrival"
            ? "noun — the act of reaching a place"
            : "noun — a long flat surface for service",
        exact: true,
      })
      .click();
  } else {
    await page
      .getByRole("button", { name: "Show answer", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Good", exact: true }).click();
}

test("stops at the daily target without another fetch and counts an optional final batch separately", async ({
  page,
  context,
  baseURL,
}) => {
  await seed(context, baseURL!, "target-three");
  let extraReads = 0;
  await page.route("**/api/v1/reviews/due?limit=50", async (route) => {
    extraReads += 1;
    await route.continue();
  });
  await page.goto("/reviews");
  await expect(page.getByText("Card 1 of 3", { exact: true })).toBeVisible();
  await answer(page, "arrival", true);
  await expect(page.getByText("Card 2 of 3", { exact: true })).toBeVisible();
  await answer(page, "baggage");
  await expect(page.getByText("Card 3 of 3", { exact: true })).toBeVisible();
  await answer(page, "counter", true);
  await expect(
    page.getByRole("heading", { name: "Review session complete", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByText("You reached today’s review target.", { exact: true }),
  ).toBeVisible();
  expect(extraReads).toBe(0);
  await page
    .getByRole("button", { name: /Continue with up to 1 more review/ })
    .click();
  await expect(page.getByText("Card 1 of 1", { exact: true })).toBeVisible();
  await answer(page, "departure");
  await expect(
    page.getByText("You completed 1 review in this session.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("You reached today’s review target.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("heading", { name: /Practice with departure/ }),
  ).toBeVisible();
  expect(extraReads).toBe(0);
});

test("continues a partial mission across a failed next-page read and focuses the recovered card", async ({
  page,
  context,
  baseURL,
}) => {
  await seed(context, baseURL!, "partially-completed", "completion-summary");
  let reads = 0;
  await page.route("**/api/v1/reviews/due?limit=50", async (route) => {
    reads += 1;
    if (reads === 1)
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: "{}",
      });
    else await route.continue();
  });
  await page.goto("/reviews");
  await expect(page.getByText("Card 1 of 2", { exact: true })).toBeVisible();
  await answer(page, "arrival");
  await answer(page, "baggage");
  await expect(
    page.getByRole("heading", { name: "Review session complete", exact: true }),
  ).toBeFocused();
  expect(reads).toBe(0);
  await page
    .getByRole("button", { name: /Continue with up to 2 more reviews/ })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Unable to load more words." }),
  ).toHaveText("Unable to load more words. Please try again.");
  await page.getByRole("button", { name: "Retry loading reviews" }).click();
  await expect(
    page.getByRole("heading", { name: "counter", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("Card 1 of 2", { exact: true })).toBeVisible();
  await answer(page, "counter");
  await answer(page, "departure");
  await expect(
    page.getByText("You completed 2 reviews in this session.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(
    0,
  );
  expect(reads).toBe(2);
});

test("reports a short due queue without claiming the review target was reached", async ({
  page,
  context,
  baseURL,
}) => {
  await seed(context, baseURL!, "fewer-due-words");
  await page.goto("/reviews");
  await expect(page.getByText("Card 1 of 4", { exact: true })).toBeVisible();
  await answer(page, "arrival", true);
  await answer(page, "baggage");
  await answer(page, "counter", true);
  await answer(page, "departure");
  await expect(
    page.getByText("No more due words are available for this session.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("You reached today’s review target.", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Continue with/ })).toHaveCount(
    0,
  );
});

test("requires an explicit optional start when the target is already met", async ({
  page,
  context,
  baseURL,
}) => {
  await seed(context, baseURL!, "already-met");
  await page.goto("/reviews");
  await expect(
    page.getByRole("heading", { name: "Review target reached", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Good", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Start optional practice (up to 4 reviews)" })
    .click();
  await expect(
    page.getByRole("heading", { name: "arrival", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("Card 1 of 4", { exact: true })).toBeVisible();
});
