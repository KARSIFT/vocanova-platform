import { expect, test } from "@playwright/test";

test.describe("Bottom navigation", () => {
  test("marks the matching primary route current, including nested Journey pages", async ({
    page,
  }) => {
    const routes = [
      { path: "/home", active: "Home" },
      { path: "/discover", active: "Journey" },
      { path: "/discover/ordering-at-a-cafe", active: "Journey" },
      { path: "/discover/ordering-at-a-cafe/pour", active: "Journey" },
      { path: "/progress", active: "Progress" },
    ] as const;

    const navigation = page.getByRole("navigation", { name: "Primary" });
    for (const route of routes) {
      await page.goto(route.path);

      for (const label of ["Home", "Journey", "Progress"]) {
        const link = navigation.getByRole("link", { name: label });
        if (label === route.active) {
          await expect(link).toHaveAttribute("aria-current", "page");
        } else {
          await expect(link).not.toHaveAttribute("aria-current");
        }
      }
    }
  });
});
