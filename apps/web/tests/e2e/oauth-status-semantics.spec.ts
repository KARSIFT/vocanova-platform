import { expect, test } from "@playwright/test";

test("announces OAuth progress calmly and failures as errors", async ({
  page,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  let releaseRequest: (() => void) | undefined;
  const requestHeld = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });
  await page.route("**/api/v1/auth/oauth/google/start", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await requestHeld;
    await route.fulfill({
      status: 503,
      contentType: "application/problem+json",
      headers: {
        "Access-Control-Allow-Origin": new URL(baseURL).origin,
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({
        type: "about:blank",
        title: "Service unavailable",
        status: 503,
        detail: "Google sign-in is temporarily unavailable.",
      }),
    });
  });

  await page.goto("/signin");
  await page.getByRole("button", { name: "Continue with Google" }).click();

  await expect(
    page.getByRole("status").filter({ hasText: "Redirecting to Google..." }),
  ).toBeVisible();
  const redirectButton = page.getByRole("button", { name: "Redirecting..." });
  await expect(redirectButton).toBeDisabled();
  await expect(redirectButton).toHaveAttribute("aria-busy", "true");

  releaseRequest?.();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Google sign-in is temporarily unavailable." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeEnabled();
});
