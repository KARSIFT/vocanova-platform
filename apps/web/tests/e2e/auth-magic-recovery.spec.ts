import { expect, test } from "@playwright/test";

test.describe("Expired magic-link recovery", () => {
  test("retains a valid suggested email for one safe replacement-link request", async ({
    page,
  }) => {
    const email = "learner@example.test";
    let replacementRequest: unknown;

    await page.route("**/api/v1/auth/magic-links/consume", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/problem+json",
        body: JSON.stringify({
          detail:
            "This sign-in link is invalid or has expired. Please request a new one.",
        }),
      });
    });
    await page.route("**/api/v1/auth/magic-links", async (route) => {
      replacementRequest = route.request().postDataJSON();
      await route.fulfill({ status: 204 });
    });

    await page.goto(
      `/auth/magic?token=expired-token&email=${encodeURIComponent(email)}`,
    );
    await expect(
      page.getByText(
        "This sign-in link is invalid or has expired. Please request a new one.",
        { exact: true },
      ),
    ).toBeVisible();

    const retry = page.getByRole("link", { name: "Back to sign in" });
    await expect(retry).toHaveAttribute(
      "href",
      `/signin?email=${encodeURIComponent(email)}`,
    );
    await expect(retry).not.toHaveAttribute("href", /expired-token/);
    await retry.click();

    const emailInput = page.getByLabel("Email address");
    await expect(emailInput).toHaveValue(email);
    await page.getByRole("button", { name: "Send sign-in link" }).click();

    expect(replacementRequest).toEqual({ email });
    await expect(page.getByRole("status")).toContainText(
      "a sign-in link has been sent",
    );
  });

  test("does not prefill malformed, oversized, or repeated email query values", async ({
    page,
  }) => {
    for (const query of [
      `email=${encodeURIComponent("not-an-email")}`,
      `email=${encodeURIComponent(`${"a".repeat(250)}@test.test`)}`,
      "email=first%40example.test&email=second%40example.test",
    ]) {
      await page.goto(`/signin?${query}`);
      await expect(page.getByLabel("Email address")).toHaveValue("");
    }
  });
});
