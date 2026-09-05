import { expect, test } from "@playwright/test";

test("appends each authoritative Journey page and removes the terminal control", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_journey_fixture", value: "paginated", url: baseURL },
  ]);

  await page.goto("/discover");
  await expect(
    page.getByRole("heading", { name: "Ordering at a cafe", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Navigating an airport", level: 2 }),
  ).toHaveCount(0);
  const loadMore = page.getByRole("button", { name: "Load more journeys" });
  await loadMore.focus();
  await expect(loadMore).toBeFocused();
  await loadMore.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Navigating an airport", level: 2 }),
  ).toBeVisible();
  await expect(loadMore).toHaveCount(0);
});

test("retains the first Journey page when a later page fails and retries it", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_journey_fixture", value: "paginated", url: baseURL },
  ]);

  let shouldFail = true;
  await page.route("**/api/v1/journey-situations?after=*", async (route) => {
    if (shouldFail) {
      shouldFail = false;
      await route.fulfill({ status: 500, body: "{}" });
      return;
    }
    await route.continue();
  });

  await page.goto("/discover");
  const loadMore = page.getByRole("button", { name: "Load more journeys" });
  await loadMore.click();
  await expect(
    page.getByText("We couldn't load more journeys. Please try again."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ordering at a cafe", level: 2 }),
  ).toBeVisible();
  await expect(loadMore).toBeEnabled();

  await loadMore.click();
  await expect(
    page.getByRole("heading", { name: "Navigating an airport", level: 2 }),
  ).toBeVisible();
});
