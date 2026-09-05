import { expect, test } from "@playwright/test";

test("explains a valid Word Detail response without meanings and keeps journey navigation", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected Playwright to configure a base URL.");
  }
  await context.addCookies([
    {
      name: "e2e_word_detail_fixture",
      value: "empty-meanings",
      url: baseURL,
    },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");

  await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "No meanings available yet",
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This word has no meanings available right now. Return to the journey to explore another word.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("list")).toHaveCount(0);

  await page.getByRole("link", { name: "Back to Journey" }).click();
  await expect(page).toHaveURL(/\/discover\/ordering-at-a-cafe$/);
});
