import { expect, test } from "@playwright/test";

const routes = [
  { path: "/home", heading: "Today's Mission" },
  { path: "/discover", heading: "Journey" },
  { path: "/progress", heading: "Progress" },
] as const;

test("skips repeated shell controls to the active learner page", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route.path);
    await expect(
      page.getByRole("heading", { name: route.heading, level: 1 }),
    ).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    const hiddenBox = await skipLink.boundingBox();
    expect(hiddenBox).not.toBeNull();
    expect(hiddenBox?.width).toBeLessThanOrEqual(1);
    expect(hiddenBox?.height).toBeLessThanOrEqual(1);

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      document.body.focus();
    });
    await page.keyboard.press("Tab");

    await expect(skipLink).toBeFocused();
    const focusedBox = await skipLink.boundingBox();
    expect(focusedBox).not.toBeNull();
    expect(focusedBox?.width).toBeGreaterThanOrEqual(44);
    expect(focusedBox?.height).toBeGreaterThanOrEqual(44);
    const focusStyle = await skipLink.evaluate((link) => {
      const computed = window.getComputedStyle(link);
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
      };
    });
    expect(focusStyle.outlineStyle).toBe("solid");
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(
      2,
    );
    await page.keyboard.press("Enter");

    const main = page.locator("main#main-content");
    await expect(main).toHaveAttribute("tabindex", "-1");
    await expect(main).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(main.getByRole("link").first()).toBeFocused();
  }
});
