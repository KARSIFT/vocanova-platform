import { expect, test } from "@playwright/test";

const LONG_SAVED_CONTENT = "a".repeat(300);
const LONG_WORD = `word-${LONG_SAVED_CONTENT}`;
const LONG_PART_OF_SPEECH = `part-${LONG_SAVED_CONTENT}`;
const LONG_DEFINITION = `A definition containing ${LONG_SAVED_CONTENT}.`;

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

    await expect(page.getByText(LONG_WORD, { exact: true })).toBeVisible();
    await expect(
      page.getByText(LONG_DEFINITION, { exact: true }),
    ).toBeVisible();
    if (pathname === "/home") {
      await expect(
        page.getByText(LONG_PART_OF_SPEECH, { exact: true }),
      ).toBeVisible();
    }
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
  });
}
