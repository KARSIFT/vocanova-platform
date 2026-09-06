import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext } from "@playwright/test";

async function useHomeFixture(
  context: BrowserContext,
  baseURL: string,
  fixture:
    | "mission-complete"
    | "mission-complete-milestone"
    | "mission-complete-zero-streak",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `home-celebration-${fixture}-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `home-celebration-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_home_fixture", value: fixture, url: baseURL },
  ]);
}

test("celebrates a completed review target and marks seven-day streak milestones", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "mission-complete-milestone");
  await page.goto("/home");

  const celebration = page.getByRole("status", {
    name: "Mission celebration",
  });
  await expect(celebration).toContainText(
    "Great work — today's review target is complete.",
  );
  await expect(celebration).toContainText("7-day streak milestone");
});

test("celebrates completion without claiming a milestone for ordinary or zero streaks", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await useHomeFixture(context, baseURL, "mission-complete");
  await page.goto("/home");
  await expect(
    page.getByRole("status", { name: "Mission celebration" }),
  ).toContainText("Great work — today's review target is complete.");
  await expect(page.getByText(/streak milestone/)).toHaveCount(0);

  await useHomeFixture(context, baseURL, "mission-complete-zero-streak");
  await page.goto("/home");
  await expect(
    page.getByRole("status", { name: "Mission celebration" }),
  ).toContainText("Great work — today's review target is complete.");
  await expect(page.getByText(/streak milestone/)).toHaveCount(0);
});

test("does not celebrate an incomplete review target", async ({ page }) => {
  await page.goto("/home");

  await expect(
    page.getByRole("status", { name: "Mission celebration" }),
  ).toHaveCount(0);
});
