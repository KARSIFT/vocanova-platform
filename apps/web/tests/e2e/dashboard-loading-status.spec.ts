import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

for (const dashboard of [
  { path: "/home", fixture: "home", label: "Loading home", content: "Today's Mission" },
  { path: "/progress", fixture: "progress", label: "Loading progress", content: "Progress" },
]) {
  test(`announces loading ${dashboard.fixture} while its route read is held`, async ({ page, context }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await context.addCookies([
      { name: "vocanova_session", value: `dashboard-loading-${randomUUID()}`, url: baseURL },
      { name: "e2e_read_hold", value: dashboard.fixture, url: baseURL },
    ]);
    const navigation = page.goto(dashboard.path);
    await expect(page.getByRole("status", { name: dashboard.label })).toBeVisible();
    const port = process.env.MOCK_API_PORT ?? "8080";
    await expect.poll(async () => (await page.request.post(`http://127.0.0.1:${port}/__e2e/release-read?fixture=${dashboard.fixture}`)).status()).toBe(204);
    await navigation;
    await expect(page.getByRole("heading", { name: dashboard.content, exact: true })).toBeVisible();
  });
}
