import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("shows the learner-local next review after the final rating without a refresh", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `review-completion-schedule-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `review-completion-schedule-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_timezone", value: "America/New_York", url: baseURL },
    {
      name: "e2e_review_fixture",
      value: "completion-next-review",
      url: baseURL,
    },
  ]);

  await page.goto("/reviews");
  await page.getByRole("button", { name: "Show answer" }).click();
  await page.getByRole("button", { name: "Good", exact: true }).click();

  const completion = page.getByRole("heading", {
    name: "Review session complete",
    level: 2,
  });
  await expect(completion).toBeFocused();
  await expect(
    page.getByText("Your next review is Aug 22, 2099, 8:30 AM EDT.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("You completed 1 review in this session.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Practice with arrival/ }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/reviews$/);
});

test("keeps generic completion guidance when the follow-up schedule is omitted or null", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  for (const fixture of [
    "completion-without-next-review",
    "completion-null-next-review",
  ]) {
    await context.clearCookies();
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `${fixture}-${randomUUID()}`,
        url: baseURL,
      },
      {
        name: "vocanova_csrf",
        value: `${fixture}-csrf-${randomUUID()}`,
        url: baseURL,
      },
      { name: "e2e_review_fixture", value: fixture, url: baseURL },
    ]);

    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();

    await expect(
      page.getByText("No more due words are available for this session.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Your next review is/)).toHaveCount(0);
  }
});
