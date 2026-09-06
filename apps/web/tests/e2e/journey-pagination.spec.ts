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
  await expect(
    page.getByRole("link", { name: /Navigating an airport/ }),
  ).toBeFocused();
  await expect(loadMore).toHaveCount(0);
});

test("does not offer a false Journey continuation for an exact terminal page", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_journey_fixture", value: "exact-page", url: baseURL },
  ]);

  await page.goto("/discover");
  await expect(
    page.getByRole("heading", { name: "Ordering at a cafe", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Navigating an airport", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Load more journeys" }),
  ).toHaveCount(0);
});

test("restores the keyboard retry target after a Journey page fails", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_journey_fixture", value: "paginated", url: baseURL },
  ]);

  let requestCount = 0;
  let settleFirstRequest: (() => void) | undefined;
  const firstRequest = new Promise<void>((resolve) => {
    settleFirstRequest = resolve;
  });
  await page.route("**/api/v1/journey-situations?after=*", async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await firstRequest;
      await route.fulfill({ status: 500, body: "{}" });
      return;
    }
    await route.continue();
  });

  await page.goto("/discover");
  const loadMore = page.getByRole("button", { name: /journeys/ });
  await loadMore.focus();
  await loadMore.press("Enter");
  await expect(loadMore).toHaveText("Loading journeys...");
  await expect(loadMore).toHaveAttribute("aria-busy", "true");
  await expect(loadMore).toBeDisabled();
  await expect.poll(() => requestCount).toBe(1);
  await loadMore.click({ force: true });
  await expect.poll(() => requestCount).toBe(1);

  if (!settleFirstRequest) throw new Error("Expected the pagination request.");
  settleFirstRequest();
  await expect(
    page.getByText("We couldn't load more journeys. Please try again."),
  ).toBeVisible();
  await expect(loadMore).toHaveText("Load more journeys");
  await expect(
    page.getByRole("heading", { name: "Ordering at a cafe", level: 2 }),
  ).toBeVisible();
  await expect(loadMore).toHaveAttribute("aria-busy", "false");
  await expect(loadMore).toBeEnabled();
  await expect(loadMore).toBeFocused();

  await loadMore.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Navigating an airport", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Navigating an airport/ }),
  ).toBeFocused();
});

test("keeps focus on the retained Journey when an empty terminal page removes the control", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_journey_fixture", value: "paginated", url: baseURL },
  ]);
  await page.route("**/api/v1/journey-situations?after=*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items: [] }),
    }),
  );
  await page.goto("/discover");
  await page.getByRole("button", { name: "Load more journeys" }).press("Enter");
  await expect(
    page.getByRole("link", { name: /Ordering at a cafe/ }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Load more journeys" }),
  ).toHaveCount(0);
});
