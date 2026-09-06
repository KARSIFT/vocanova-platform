import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `saved-library-${randomUUID()}`,
      url: baseURL,
    },
  ]);
});

test("loads later saved vocabulary pages and retains earlier items when a page retry fails", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
  ]);
  let failOnce = true;
  await page.route("**/api/v1/user-words?after=*&limit=10", async (route) => {
    if (failOnce) {
      failOnce = false;
      await route.fulfill({ status: 500, body: "{}" });
      return;
    }
    await route.continue();
  });
  await page.goto("/discover/saved");
  await expect(
    page.getByRole("heading", { name: "Saved vocabulary", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("arrival", { exact: true })).toBeVisible();
  const loadMore = page.getByRole("button", { name: "Load more saved words" });
  await loadMore.click();
  await expect(
    page.getByText("We couldn't load more saved words. Please try again."),
  ).toBeVisible();
  await expect(page.getByText("arrival", { exact: true })).toBeVisible();
  await expect(loadMore).toBeFocused();
  await loadMore.click();
  await expect(page.getByText("later word", { exact: true })).toBeVisible();
  await expect(
    page.locator('a[href="/discover/saved/pour?meaning=mean-pour"]'),
  ).toBeFocused();
});

test("offers Journey discovery when the saved library is empty", async ({
  page,
}) => {
  await page.goto("/discover/saved");
  await expect(
    page.getByRole("heading", { name: "No saved words yet", level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore journeys" }),
  ).toHaveAttribute("href", "/discover");
});

test("opens a saved canonical word without Journey context and retains removal after a failure", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "e2e_saved_words_fixture",
      value: "canonical-without-list",
      url: baseURL,
    },
    { name: "vocanova_csrf", value: "saved-library-csrf", url: baseURL },
  ]);
  await page.route("**/api/v1/user-words/mean-pour", (route) =>
    route.fulfill({ status: 500, body: "{}" }),
  );
  await page.goto("/discover/saved/pour?meaning=mean-pour");
  await expect(
    page.getByRole("heading", { name: "pour", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText("Could you pour me a cup of coffee?"),
  ).toBeVisible();
  const sentence = page.getByRole("textbox", {
    name: /Write a sentence using pour/,
  });
  await expect(sentence).toBeVisible();
  await sentence.fill("I pour water into the glass.");
  const sentenceRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/v1/sentence-feedback") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();
  expect((await sentenceRequest).postDataJSON()).toMatchObject({
    attemptId: "e2e-library-user-word-11",
    source: "word_detail",
  });
  const remove = page.getByRole("button", {
    name: "Remove pour from saved words",
  });
  await remove.click();
  await expect(
    page.getByText("Unable to remove this saved word. Please try again."),
  ).toBeVisible();
  await expect(remove).toBeFocused();
});

test("rejects a canonical meaning that is not saved", async ({ page }) => {
  await page.goto("/discover/saved/pour?meaning=unknown-meaning");
  await expect(
    page.getByRole("heading", { name: "Journey item not found", level: 1 }),
  ).toBeVisible();
});

test("keeps saved meanings for the same word distinct", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    { name: "vocanova_csrf", value: "saved-library-bank-csrf", url: baseURL },
  ]);
  await page.goto("/discover/saved/bank?meaning=mean-bank-river");
  await expect(
    page.getByText("land beside a river", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove bank from saved words" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: /Write a sentence using bank/ })
    .fill("The river bank flooded.");
  const riverSentenceRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/v1/sentence-feedback") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();
  expect((await riverSentenceRequest).postDataJSON()).toMatchObject({
    attemptId: "e2e-library-bank-river",
    source: "word_detail",
  });
  await page.goto("/discover/saved/bank?meaning=mean-bank-money");
  await expect(
    page.getByText("a financial institution", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: /Write a sentence using bank/ })
    .fill("The bank approved my loan.");
  const moneySentenceRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/v1/sentence-feedback") &&
      request.method() === "POST",
  );
  await page.getByRole("button", { name: "Check my sentence" }).click();
  expect((await moneySentenceRequest).postDataJSON()).toMatchObject({
    attemptId: "e2e-library-bank-money",
    source: "word_detail",
  });
});

test("keeps a saved meaning until a retry succeeds, then refreshes the library", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    { name: "vocanova_csrf", value: "saved-library-retry-csrf", url: baseURL },
  ]);
  let failOnce = true;
  await page.route("**/api/v1/user-words/mean-bank-river", async (route) => {
    if (failOnce) {
      failOnce = false;
      await route.fulfill({ status: 503, body: "{}" });
      return;
    }
    await route.continue();
  });
  await page.goto("/discover/saved/bank?meaning=mean-bank-river");
  const remove = page.getByRole("button", {
    name: "Remove bank from saved words",
  });
  await remove.click();
  await expect(
    page.getByText("Unable to remove this saved word. Please try again."),
  ).toBeVisible();
  await remove.click();
  await expect(page).toHaveURL(/\/discover\/saved$/);
  await page.getByRole("button", { name: "Load more saved words" }).click();
  await expect(
    page.getByText("land beside a river", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("a financial institution", { exact: true }),
  ).toBeVisible();
  await page.goto("/discover/saved/bank?meaning=mean-bank-river");
  await expect(
    page.getByRole("heading", { name: "Journey item not found", level: 1 }),
  ).toBeVisible();
});

test("keeps keyboard focus and announces the end after an empty final page", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "truncated-page", url: baseURL },
  ]);
  await page.route("**/api/v1/user-words?after=*&limit=10", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ items: [] }),
    }),
  );
  await page.goto("/discover/saved");
  const lastWord = page.locator(
    'a[href="/discover/saved/terminal?meaning=e2e-preview-meaning-10"]',
  );
  const loadMore = page.getByRole("button", { name: "Load more saved words" });
  await loadMore.focus();
  await page.keyboard.press("Enter");
  await expect(loadMore).toHaveCount(0);
  await expect(lastWord).toBeFocused();
  await expect(page.getByRole("status")).toHaveText(
    "All saved words are shown.",
  );
});

test("removes a first-page item from the library after reloading", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    { name: "vocanova_csrf", value: "library-reload-csrf", url: baseURL },
  ]);
  await page.goto("/discover/saved");
  await expect(page.getByText("arrival", { exact: true })).toBeVisible();
  const response = await page.request.delete(
    `http://127.0.0.1:${process.env.MOCK_API_PORT ?? "8080"}/api/v1/user-words/e2e-preview-meaning-01`,
    { headers: { "X-CSRF-Token": "library-reload-csrf" } },
  );
  expect(response.status()).toBe(204);
  await page.reload();
  await expect(page.getByText("arrival", { exact: true })).toHaveCount(0);
  await expect(page.getByText("baggage", { exact: true })).toBeVisible();
});

test("preserves encoded word punctuation and meaning through server reauthentication", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "e2e_saved_words_fixture",
      value: "punctuation-reauth",
      url: baseURL,
    },
  ]);
  await page.goto("/discover/saved");
  const link = page.getByRole("link", { name: /pour/ });
  await expect(link).toHaveAttribute(
    "href",
    "/discover/saved/pour%3F%23?meaning=mean-pour",
  );
  await link.click();
  await expect(page).toHaveURL(/\/signin\?/);
  const returnTo = new URL(page.url()).searchParams.get("returnTo");
  expect(returnTo).toBe("/discover/saved/pour%3F%23?meaning=mean-pour");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});
