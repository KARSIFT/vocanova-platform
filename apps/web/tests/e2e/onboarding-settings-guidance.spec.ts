import { expect, test } from "@playwright/test";

test("accurately describes which onboarding preferences can be updated in Settings", async ({
  page,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected the Playwright project to configure use.baseURL.");
  }
  await page.context().addCookies([
    {
      name: "e2e_onboarding_status",
      value: "not_started",
      url: baseURL,
    },
  ]);

  await page.goto("/onboarding");

  await expect(
    page.getByRole("main").getByText(
      /You can update your daily review target and other practice preferences later in Settings\./,
    ),
  ).toBeVisible();
  await expect(
    page.getByText("You can change every answer later in Settings.", {
      exact: true,
    }),
  ).toHaveCount(0);
});
