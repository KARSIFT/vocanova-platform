import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext } from "@playwright/test";

async function useHomeReadFixture(
  context: BrowserContext,
  baseURL: string,
  fixture: "home" | "reviews",
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `home-auxiliary-read-${fixture}-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `home-auxiliary-read-csrf-${randomUUID()}`,
      url: baseURL,
    },
    { name: "e2e_read_failure", value: fixture, url: baseURL },
    { name: "e2e_home_fixture", value: "caught-up", url: baseURL },
  ]);
}

test.describe("Home auxiliary read recovery", () => {
  test("keeps the mission available when the saved-word preview fails and recovers on retry", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");

    await useHomeReadFixture(context, baseURL, "home");
    await page.goto("/home");

    await expect(
      page.getByRole("heading", { name: "Today's Mission", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Saved vocabulary unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Practice a saved word" }),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Try saved vocabulary again" }).click();
    await expect(
      page.getByLabel("Choose a saved word to practice"),
    ).toBeVisible();
  });

  test("keeps the mission truthful when the due-review count fails and recovers on retry", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");

    await useHomeReadFixture(context, baseURL, "reviews");
    await page.goto("/home");

    await expect(
      page.getByRole("heading", { name: "Today's Mission", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Review availability unavailable" }),
    ).toBeVisible();
    await expect(
      page.getByText("0 words due for review", { exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Check reviews" })).toHaveAttribute(
      "href",
      "/reviews",
    );

    await page.getByRole("button", { name: "Try review availability again" }).click();
    await expect(
      page.getByText("0 words due for review", { exact: true }),
    ).toBeVisible();
  });

  for (const read of ["saved", "due", "mission"] as const) {
    test(`redirects to sign in when the ${read} Home read is unauthorized`, async ({
      page,
      context,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "home-desktop-1280",
        "The redirect contract is layout independent; recovery behavior covers every layout.",
      );
      const baseURL = testInfo.project.use.baseURL;
      if (!baseURL) throw new Error("Expected a Playwright base URL.");

      await context.addCookies([
        {
          name: "vocanova_session",
          value: `home-unauthorized-${read}-${randomUUID()}`,
          url: baseURL,
        },
        { name: "e2e_home_read_unauthorized", value: read, url: baseURL },
      ]);
      await page.goto("/home");

      await expect(page).toHaveURL(/\/signin\?returnTo=%2Fhome/);
      await expect(
        page.getByRole("heading", { name: "Sign in to Vocanova" }),
      ).toBeVisible();
    });
  }
});
