import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const coreSurfaces = ["/home", "/discover", "/progress"];

test("reaches Settings from every core surface and retains existing Settings navigation", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `settings-header-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `settings-header-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);

  for (const surface of coreSurfaces) {
    await page.goto(surface);
    const settings = page.getByRole("link", { name: "Settings" });
    await expect(settings).toHaveAttribute("href", "/settings");
    await settings.focus();
    await expect(settings).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Settings", level: 1 }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Back to Home" }).click();
    await expect(page).toHaveURL(/\/home$/);
  }

  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByRole("link", { name: "Manage account" }).click();
  await expect(
    page.getByRole("heading", { name: "Account", level: 1 }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Settings", level: 1 }),
  ).toBeVisible();
});

test("keeps Settings and logout usable after a mobile-sized logout failure", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `settings-header-logout-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `settings-header-logout-csrf-${randomUUID()}`,
      url: baseURL,
    },
  ]);
  let releaseLogout: (() => void) | undefined;
  const logoutReleased = new Promise<void>((resolve) => {
    releaseLogout = resolve;
  });
  await page.route("**/api/v1/auth/logout", async (route) => {
    await logoutReleased;
    await route.fulfill({
      status: 503,
      contentType: "application/problem+json",
      body: JSON.stringify({ detail: "temporarily unavailable" }),
    });
  });

  await page.goto("/home");
  const header = page.getByRole("banner");
  const settings = page.getByRole("link", { name: "Settings" });
  const logout = page.getByRole("button", { name: "Log out" });
  await expect(settings).toBeVisible();
  await expect(logout).toBeVisible();
  await logout.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Signing out..." }),
  ).toBeDisabled();
  releaseLogout?.();
  await expect(
    page.getByText("Unable to log out. Please try again.", { exact: true }),
  ).toBeVisible();
  await expect(logout).toBeFocused();

  for (const control of [settings, logout]) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      testInfo.project.use.viewport?.width ?? Number.POSITIVE_INFINITY,
    );
  }
  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox?.height).toBeGreaterThanOrEqual(56);
});
