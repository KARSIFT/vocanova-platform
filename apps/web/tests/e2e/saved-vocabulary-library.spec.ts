import { expect, test } from "@playwright/test";

test("loads later saved vocabulary pages and retains earlier items when a page retry fails", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([{ name: "e2e_saved_words_fixture", value: "library", url: baseURL }]);
  let failOnce = true;
  await page.route("**/api/v1/user-words?after=*&limit=10", async (route) => {
    if (failOnce) { failOnce = false; await route.fulfill({ status: 500, body: "{}" }); return; }
    await route.continue();
  });
  await page.goto("/discover/saved");
  await expect(page.getByRole("heading", { name: "Saved vocabulary", level: 1 })).toBeVisible();
  await expect(page.getByText("arrival", { exact: true })).toBeVisible();
  const loadMore = page.getByRole("button", { name: "Load more saved words" });
  await loadMore.click();
  await expect(page.getByText("We couldn't load more saved words. Please try again.")).toBeVisible();
  await expect(page.getByText("arrival", { exact: true })).toBeVisible();
  await loadMore.click();
  await expect(page.getByText("later word", { exact: true })).toBeVisible();
});

test("offers Journey discovery when the saved library is empty", async ({ page }) => {
  await page.goto("/discover/saved");
  await expect(page.getByRole("heading", { name: "No saved words yet", level: 2 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore journeys" })).toHaveAttribute("href", "/discover");
});

test("opens a saved canonical word without Journey context and retains removal after a failure", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    { name: "vocanova_csrf", value: "saved-library-csrf", url: baseURL },
  ]);
  let savedListReads = 0;
  await page.route("**/api/v1/user-words?*", async (route) => {
    savedListReads += 1;
    await route.abort();
  });
  await page.route("**/api/v1/user-words/mean-pour", (route) =>
    route.fulfill({ status: 500, body: "{}" }),
  );
  await page.goto("/discover/saved/pour?meaning=mean-pour");
  expect(savedListReads).toBe(0);
  await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  await expect(page.getByText("Could you pour me a cup of coffee?")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Write a sentence using pour/ })).toBeVisible();
  const remove = page.getByRole("button", { name: "Remove pour from saved words" });
  await remove.click();
  await expect(page.getByText("Unable to remove this saved word. Please try again.")).toBeVisible();
  await expect(remove).toBeFocused();
});

test("rejects a canonical meaning that is not saved", async ({ page }) => {
  await page.goto("/discover/saved/pour?meaning=unknown-meaning");
  await expect(
    page.getByRole("heading", { name: "Journey item not found", level: 1 }),
  ).toBeVisible();
});
