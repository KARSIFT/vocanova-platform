import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

function magicLinkUrl(returnTo?: string): string {
  const params = new URLSearchParams({
    token: `magic-${randomUUID()}`,
    email: "learner@example.test",
  });
  if (returnTo !== undefined) {
    params.set("returnTo", returnTo);
  }
  return `/auth/magic?${params.toString()}`;
}

test.describe("Auth return navigation", () => {
  test("keeps a documented local return path through the magic-link request and landing", async ({
    page,
  }) => {
    let requestBody: unknown;
    await page.route("**/api/v1/auth/magic-links", async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({ status: 204 });
    });

    const returnTo = "/discover/ordering-at-a-cafe/pour?source=magic";
    await page.goto(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    await page.getByLabel("Email address").fill("learner@example.test");
    await page.getByRole("button", { name: "Send sign-in link" }).click();

    expect(requestBody).toEqual({
      email: "learner@example.test",
      returnTo,
    });
    await expect(page.getByRole("status")).toContainText(returnTo);

    await page.unroute("**/api/v1/auth/magic-links");
    await page.goto(magicLinkUrl(returnTo));
    await expect(page).toHaveURL(
      /\/discover\/ordering-at-a-cafe\/pour\?source=magic$/,
    );
  });

  for (const invalidReturnTo of [
    undefined,
    "https://example.test/reviews",
    "//example.test/reviews",
    "/unknown",
  ]) {
    test(`falls back to Home after a magic link with ${invalidReturnTo ?? "no"} return path`, async ({
      page,
    }) => {
      await page.goto(magicLinkUrl(invalidReturnTo));
      await expect(page).toHaveURL(/\/home$/);
    });
  }
});
