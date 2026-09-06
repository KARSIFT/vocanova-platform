import { expect, test } from "@playwright/test";

test.describe("Journey empty state", () => {
  test("explains an empty catalog and offers a route back to today's mission", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    await context.addCookies([
      { name: "e2e_journey_fixture", value: "empty", url: baseURL },
    ]);

    await page.goto("/discover");

    await expect(
      page.getByRole("heading", { name: "No journeys available yet", level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "There are no journeys to explore right now. Return to today's mission.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("list")).toHaveCount(0);

    const backToHome = page.getByRole("link", { name: "Back to Home" });
    await expect(backToHome).toBeVisible();
    await backToHome.click();
    await expect(page).toHaveURL(/\/home$/);
  });
});

test("explains an empty situation and helps the learner choose another journey", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }
  await context.addCookies([
    { name: "e2e_situation_fixture", value: "empty", url: baseURL },
  ]);

  await page.goto("/discover/ordering-at-a-cafe");

  await expect(
    page.getByRole("heading", {
      name: "No new words in this situation right now",
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Choose another journey to explore more practical vocabulary.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("list")).toHaveCount(0);

  await page.getByRole("link", { name: "Choose another journey" }).click();
  await expect(page).toHaveURL(/\/discover$/);
});

test("celebrates a fully saved situation and offers both learner continuations", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }
  await context.addCookies([
    { name: "e2e_situation_fixture", value: "all-saved", url: baseURL },
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
  ]);

  await page.goto("/discover/ordering-at-a-cafe");

  await expect(
    page.getByRole("heading", {
      name: "You've saved every word in this situation",
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Review the words you saved, or choose another journey to explore more practical vocabulary.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("list")).toHaveCount(0);

  const viewSavedVocabulary = page.getByRole("link", {
    name: "View saved vocabulary",
  });
  await expect(viewSavedVocabulary).toHaveAttribute("href", "/discover/saved");
  await expect(viewSavedVocabulary).toHaveClass(/bg-primary-600/);
  await expect(viewSavedVocabulary).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Choose another journey" }),
  ).toHaveAttribute("href", "/discover");

  await viewSavedVocabulary.click();
  await expect(page).toHaveURL(/\/discover\/saved$/);
  await expect(
    page.getByRole("heading", { name: "Saved vocabulary", level: 1 }),
  ).toBeVisible();

  await page.goto("/discover/ordering-at-a-cafe");
  await page.getByRole("link", { name: "Choose another journey" }).click();
  await expect(page).toHaveURL(/\/discover$/);
});
