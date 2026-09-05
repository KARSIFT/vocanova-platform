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
        "New situations will appear here when they are ready. Return to today's mission and check back later.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("list")).toHaveCount(0);

    const backToHome = page.getByRole("link", { name: "Back to Home" });
    await expect(backToHome).toBeVisible();
    await backToHome.click();
    await expect(page).toHaveURL(/\/home$/);
  });
});
