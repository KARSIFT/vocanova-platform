import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

for (const route of [
  { path: "/settings", fixture: "settings", label: "Loading settings", heading: "Settings" },
  { path: "/settings/account", fixture: "account", label: "Loading account settings", heading: "Account" },
]) {
  test(`announces ${route.fixture} loading until its read recovers`, async ({ page, context }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await context.addCookies([{ name: "vocanova_session", value: `settings-loading-${randomUUID()}`, url: baseURL }, { name: "e2e_read_hold", value: route.fixture, url: baseURL }]);
    const navigation = page.goto(route.path);
    await expect(page.getByRole("status", { name: route.label })).toBeVisible();
    const port = process.env.MOCK_API_PORT ?? "8080";
    await expect.poll(async () => (await page.request.post(`http://127.0.0.1:${port}/__e2e/release-read?fixture=${route.fixture}`)).status()).toBe(204);
    await navigation;
    await expect(page.getByRole("heading", { name: route.heading, exact: true })).toBeVisible();
  });
}
