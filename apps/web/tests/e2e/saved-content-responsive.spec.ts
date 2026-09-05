import { expect, test } from "@playwright/test";

for (const pathname of ["/home", "/progress"]) {
  test(`keeps long saved content within the viewport on ${pathname}`, async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }

    await context.addCookies([
      { name: "e2e_saved_words_fixture", value: "long-content", url: baseURL },
    ]);
    await page.goto(pathname);

    await expect(page.getByText(/^word-/).first()).toBeVisible();
    await expect(page.getByText(/^definition-/).first()).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
}
