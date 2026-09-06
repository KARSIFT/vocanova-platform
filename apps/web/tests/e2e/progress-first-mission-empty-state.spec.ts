import { expect, test } from "@playwright/test";

test("explains genuinely empty progress without inventing history and keeps Home reachable", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "e2e_progress_fixture",
      value: "first-mission",
      url: baseURL,
    },
  ]);

  await page.goto("/progress");

  const confidencePoints = page
    .getByText("Confidence Points", { exact: true })
    .locator("..");
  await expect(confidencePoints.getByText("0", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "No saved words yet. Save words from a journey to track your vocabulary here.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("0-day streak", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Longest streak: 0 days", { exact: true }),
  ).toBeVisible();

  const completionHistory = page
    .getByRole("heading", { name: "Recent missions", level: 2 })
    .locator("..");
  await expect(completionHistory).toContainText(
    "No mission history yet. Complete your first daily mission to start building your streak.",
  );
  await expect(completionHistory.getByRole("list")).toHaveCount(0);
  await expect(page.getByText("Completed", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Missed", { exact: true })).toHaveCount(0);

  const homeLink = page.getByRole("link", { name: "Home", exact: true });
  await homeLink.focus();
  await expect(homeLink).toBeFocused();
  await homeLink.press("Enter");
  await expect(page).toHaveURL(/\/home$/);
  await expect(
    page.getByRole("heading", { name: "Today's Mission", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore a journey" }),
  ).toBeVisible();
});
