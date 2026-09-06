import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

type SavedRouteFixture = "saved-library" | "saved-detail";

async function prepareSavedRoute(
  context: BrowserContext,
  baseURL: string,
  fixture: SavedRouteFixture,
  mode: "failure" | "hold",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `saved-route-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_saved_words_fixture", value: "library", url: baseURL },
    {
      name: mode === "failure" ? "e2e_read_failure" : "e2e_read_hold",
      value: fixture,
      url: baseURL,
    },
  ]);
}

async function releaseRead(page: Page, fixture: SavedRouteFixture) {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const response = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/__e2e/release-read?fixture=${fixture}`,
  );
  await expect(response).toBeOK();
}

test.describe("Saved Vocabulary route recovery", () => {
  test("announces the right loading state for the library and a saved word", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");

    await prepareSavedRoute(context, baseURL, "saved-library", "hold");
    const libraryNavigation = page.goto("/discover/saved");
    await expect(
      page.getByRole("status", { name: "Loading saved vocabulary" }),
    ).toBeVisible();
    await releaseRead(page, "saved-library");
    await libraryNavigation;
    await expect(
      page.getByRole("heading", { name: "Saved vocabulary", level: 1 }),
    ).toBeVisible();

    await context.addCookies([
      { name: "e2e_read_hold", value: "saved-detail", url: baseURL },
    ]);
    const detailNavigation = page.goto(
      "/discover/saved/pour?meaning=mean-pour",
    );
    await expect(
      page.getByRole("status", { name: "Loading saved word" }),
    ).toBeVisible();
    await releaseRead(page, "saved-detail");
    await detailNavigation;
    await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  });

  test("retries an initial saved-library failure and keeps Journey reachable", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");

    await prepareSavedRoute(context, baseURL, "saved-library", "failure");
    await page.goto("/discover/saved");

    await expect(
      page.getByRole("heading", {
        name: "We couldn't load saved vocabulary",
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Please try again. Your saved words and review progress are still safe.",
      ),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Journey" })).toHaveAttribute(
      "href",
      "/discover",
    );

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(
      page.getByRole("heading", { name: "Saved vocabulary", level: 1 }),
    ).toBeVisible();
  });

  test("retries an initial saved-word failure and keeps the library reachable", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");

    await prepareSavedRoute(context, baseURL, "saved-detail", "failure");
    await page.goto("/discover/saved/pour?meaning=mean-pour");

    await expect(
      page.getByRole("heading", {
        name: "We couldn't load this saved word",
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Please try again. Your saved vocabulary and review progress are still safe.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to saved vocabulary" }),
    ).toHaveAttribute("href", "/discover/saved");

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  });

  test("keeps saved-library authentication failures on the sign-in return path", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `saved-route-reauth-${randomUUID()}`,
        url: baseURL,
      },
      {
        name: "e2e_saved_words_fixture",
        value: "saved-list-reauth",
        url: baseURL,
      },
    ]);

    await page.goto("/discover/saved");
    await expect(page).toHaveURL(/\/signin\?returnTo=%2Fdiscover%2Fsaved/);
    await expect(
      page.getByRole("heading", { name: /sign in/i }),
    ).toBeVisible();
  });
});
