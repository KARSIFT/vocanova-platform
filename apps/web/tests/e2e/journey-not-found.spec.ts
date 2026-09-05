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

for (const path of [
  "/discover/unknown/pour",
  "/discover/navigating-an-airport/pour",
]) {
  test(`does not render a canonical word outside its Journey context: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(
      page.getByRole("heading", { name: "Journey item not found", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "pour", level: 1 }),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Back to Journey" }).click();
    await expect(page).toHaveURL(/\/discover$/);
  });
}

test("renders a canonical word assigned to its Journey situation", async ({
  page,
}) => {
  await page.goto("/discover/ordering-at-a-cafe/pour");

  await expect(page.getByRole("heading", { name: "pour", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Back to Journey" }).click();
  await expect(page).toHaveURL(/\/discover\/ordering-at-a-cafe$/);
});
