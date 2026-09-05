import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function failNextRead(
  context: BrowserContext,
  baseURL: string,
  fixture: "discover" | "reviews",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `route-retry-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_read_failure", value: fixture, url: baseURL },
  ]);
}

async function holdNextRead(
  context: BrowserContext,
  baseURL: string,
  fixture: "discover" | "reviews",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `route-loading-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_read_hold", value: fixture, url: baseURL },
  ]);
}

async function releaseRead(page: Page, fixture: "discover" | "reviews") {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const response = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/__e2e/release-read?fixture=${fixture}`,
  );
  await expect(response).toBeOK();
}

async function expectRecoveredRoute(
  page: Page,
  errorCopy: string,
  recoveredHeading: string,
) {
  await expect(
    page.getByRole("heading", { name: "Something went wrong", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(errorCopy, { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: recoveredHeading, level: 1 }),
  ).toBeVisible();
}

test.describe("Learning route retry boundaries", () => {
  test("announces Journey loading while its route data is held", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await holdNextRead(context, baseURL, "discover");
    const navigation = page.goto("/discover");
    await expect(
      page.getByRole("status", { name: "Loading journey" }),
    ).toBeVisible();
    await releaseRead(page, "discover");
    await navigation;
    await expect(
      page.getByRole("heading", { name: "Journey", level: 1 }),
    ).toBeVisible();
  });

  test("announces Review loading while its route data is held", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await holdNextRead(context, baseURL, "reviews");
    const navigation = page.goto("/reviews");
    await expect(
      page.getByRole("status", { name: "Loading review" }),
    ).toBeVisible();
    await releaseRead(page, "reviews");
    await navigation;
    await expect(
      page.getByRole("heading", { name: "Review", level: 1 }),
    ).toBeVisible();
  });

  test("retries a failed Journey list request", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await failNextRead(context, baseURL, "discover");
    await page.goto("/discover");
    await expectRecoveredRoute(
      page,
      "We couldn't load your journey. Please try again.",
      "Journey",
    );
  });

  test("retries a failed Word Detail request", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await failNextRead(context, baseURL, "discover");
    await page.goto("/discover/ordering-at-a-cafe/pour");
    await expectRecoveredRoute(
      page,
      "We couldn't load your journey. Please try again.",
      "pour",
    );
  });

  test("retries a failed Review request without starting a review", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await failNextRead(context, baseURL, "reviews");
    await page.goto("/reviews");
    await expectRecoveredRoute(
      page,
      "We couldn't load your review. Please try again.",
      "Review",
    );
    await expect(
      page.getByRole("heading", { name: "You're all caught up", level: 2 }),
    ).toBeVisible();
  });
});
