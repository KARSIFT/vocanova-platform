import { expect, test } from "@playwright/test";

for (const path of [
  "/discover/unknown",
  "/discover/ordering-at-a-cafe/unknown",
]) {
  test(`recovers unknown Journey route ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Journey item not found", level: 1 }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to Journey" }).click();
    await expect(page).toHaveURL(/\/discover$/);
  });
}
