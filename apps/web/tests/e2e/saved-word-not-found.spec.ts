import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `saved-word-not-found-${randomUUID()}`,
      url: baseURL,
    },
  ]);
});

test("returns a missing saved-word link to the responsive saved library", async ({
  page,
}) => {
  await page.goto("/discover/saved/not-a-word?meaning=mean-pour");

  await expect(
    page.getByRole("heading", { name: "Saved item unavailable", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This saved item is no longer available. Return to your saved vocabulary to choose another item.",
    ),
  ).toBeVisible();
  const returnToLibrary = page.getByRole("link", {
    name: "Back to saved vocabulary",
  });
  await returnToLibrary.focus();
  await expect(returnToLibrary).toBeFocused();
  const bounds = await returnToLibrary.boundingBox();
  expect(bounds?.height).toBeGreaterThanOrEqual(44);
  expect(bounds?.width).toBeGreaterThanOrEqual(44);
  await returnToLibrary.click();
  await expect(page).toHaveURL(/\/discover\/saved$/);
  await expect(
    page.getByRole("heading", { name: "No saved words yet", level: 2 }),
  ).toBeVisible();
});

test("recovers a stale link after its saved meaning is removed", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    { name: "vocanova_csrf", value: "saved-word-not-found-csrf", url: baseURL },
  ]);
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const removal = await page.request.delete(
    `http://127.0.0.1:${mockApiPort}/api/v1/user-words/mean-bank-river`,
    { headers: { "X-CSRF-Token": "saved-word-not-found-csrf" } },
  );
  expect(removal.status()).toBe(204);

  await page.goto("/discover/saved/bank?meaning=mean-bank-river");
  await expect(
    page.getByRole("heading", { name: "Saved item unavailable", level: 1 }),
  ).toBeVisible();
});

test("continues to show a valid exact saved meaning", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
  ]);

  await page.goto("/discover/saved/pour?meaning=mean-pour");
  await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Saved item unavailable", level: 1 }),
  ).toHaveCount(0);
});
