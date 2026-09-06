import { expect, test } from "@playwright/test";

test("shows bounded sentence practice history, keeps entries after a page failure, and focuses appended content", async ({ page }) => {
  let failOnce = true;
  await page.route("**/api/v1/sentence-feedback/history?after=*&limit=10", async (route) => {
    if (failOnce) { failOnce = false; await route.fulfill({ status: 500, body: "{}" }); return; }
    await route.continue();
  });
  await page.goto("/progress");
  const section = page.getByRole("heading", { name: "Recent sentence practice", level: 2 }).locator("..");
  await expect(section.getByText("arrival", { exact: true })).toBeVisible();
  await expect(section.getByText("Result: correct", { exact: true })).toBeVisible();
  const loadMore = section.getByRole("button", { name: "Load more sentence practice" });
  await loadMore.click();
  await expect(section.getByRole("alert")).toContainText("We couldn't load more sentence practice. Please try again.");
  await expect(section.getByText("arrival", { exact: true })).toBeVisible();
  await expect(loadMore).toBeFocused();
  await loadMore.click();
  await expect(section.getByText("gate", { exact: true })).toBeVisible();
  await expect(section.getByText("Result: needs improvement", { exact: true })).toBeVisible();
  await expect(section.getByText("All sentence practice is shown.")).toBeVisible();
  await expect(page.locator("#sentence-history-first-appended")).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
});

test("explains how to begin when sentence practice history is empty", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([{ name: "e2e_sentence_history_fixture", value: "empty", url: baseURL }]);
  await page.goto("/progress");
  await expect(page.getByText("No sentence practice yet. Write a sentence from a saved word to see your feedback here.")).toBeVisible();
});
