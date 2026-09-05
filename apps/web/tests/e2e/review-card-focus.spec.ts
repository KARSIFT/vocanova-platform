import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("moves keyboard focus to the next review card after a rating advances the session", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error("Expected a Playwright base URL.");
  }

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-card-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-card-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_review_fixture", value: "multiple-choice", url: baseURL },
  ]);

  await page.goto("/reviews");
  await page
    .getByRole("button", { name: /the act of reaching a place/ })
    .click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  const nextCardHeading = page.getByRole("heading", {
    name: "baggage",
    level: 2,
  });
  await expect(nextCardHeading).toBeFocused();
});
