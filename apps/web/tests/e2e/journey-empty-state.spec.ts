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
