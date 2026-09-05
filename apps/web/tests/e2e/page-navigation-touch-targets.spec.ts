import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const navigationCases = [
  {
    path: "/discover/ordering-at-a-cafe",
    name: "Back to Journey",
    destination: "/discover",
  },
  {
    path: "/discover/ordering-at-a-cafe/pour",
    name: "Back to Journey",
    destination: "/discover/ordering-at-a-cafe",
  },
  { path: "/reviews", name: "Back to Home", destination: "/home" },
  { path: "/settings", name: "Back to Home", destination: "/home" },
  {
    path: "/settings/account",
    name: "Back to Settings",
    destination: "/settings",
  },
];

test("keeps page-level back navigation reachable on touch screens", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");

  await context.addCookies([
    {
      name: "vocanova_session",
      value: `test-session-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: `test-csrf-${randomUUID()}`, url: baseURL },
  ]);

  const linkHeights: number[] = [];
  for (const navigation of navigationCases) {
    await page.goto(navigation.path);
    const link = page.getByRole("link", { name: navigation.name }).first();
    await expect(link).toBeVisible();
    const linkBox = await link.boundingBox();
    expect(linkBox).not.toBeNull();
    linkHeights.push(linkBox?.height ?? 0);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${navigation.destination}$`));
  }

  expect(linkHeights.every((height) => height >= 44)).toBe(true);
});
