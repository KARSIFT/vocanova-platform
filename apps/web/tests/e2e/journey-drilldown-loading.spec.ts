import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

type ReadFixture = "discover" | "journey-situation" | "word-detail";

async function holdRead(
  context: BrowserContext,
  baseURL: string,
  fixture: ReadFixture,
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `journey-loading-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_read_hold", value: fixture, url: baseURL },
  ]);
}

async function releaseRead(page: Page, fixture: ReadFixture) {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const response = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/__e2e/release-read?fixture=${fixture}`,
  );
  await expect(response).toBeOK();
}

test("keeps the Journey catalog loader while the catalog read is held", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await holdRead(context, baseURL, "discover");

  const navigation = page.goto("/discover");
  await expect(
    page.getByRole("status", { name: "Loading journey" }),
  ).toBeVisible();
  await releaseRead(page, "discover");
  await navigation;
  await expect(page.getByRole("heading", { name: "Journey", level: 1 })).toBeVisible();
});

test("announces the selected Journey while its situation read is held", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await holdRead(context, baseURL, "journey-situation");

  const navigation = page.goto("/discover/ordering-at-a-cafe");
  try {
    await expect(
      page.getByRole("status", { name: "Loading journey situation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Loading journey", exact: true }),
    ).toHaveCount(0);
  } finally {
    await releaseRead(page, "journey-situation");
    await navigation;
  }
  await expect(
    page.getByRole("heading", { name: "Ordering at a cafe", level: 1 }),
  ).toBeVisible();
});

test("announces Word Detail while its canonical-word read is held", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await holdRead(context, baseURL, "word-detail");

  const navigation = page.goto("/discover/ordering-at-a-cafe/pour");
  try {
    await expect(
      page.getByRole("status", { name: "Loading word details" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Loading journey", exact: true }),
    ).toHaveCount(0);
  } finally {
    await releaseRead(page, "word-detail");
    await navigation;
  }
  await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
});

test("preserves an encoded Word Detail return path when authentication expires", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    { name: "e2e_unauthenticated", value: "1", url: baseURL },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour%3F%23");
  await expect(page).toHaveURL(/\/signin\?returnTo=/);
  expect(new URL(page.url()).searchParams.get("returnTo")).toBe(
    "/discover/ordering-at-a-cafe/pour%3F%23",
  );
});
