import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

for (const surface of ["settings", "reviews"] as const) {
  test(`${surface} mutation expiry redirects to sign-in without claiming success`, async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const csrf = `mutation-expiry-csrf-${randomUUID()}`;
    await context.addCookies([
      {
        name: "vocanova_session",
        value: `mutation-expiry-${randomUUID()}`,
        url: baseURL,
        httpOnly: true,
      },
      { name: "vocanova_csrf", value: csrf, url: baseURL },
    ]);
    if (surface === "reviews") {
      const port = process.env.MOCK_API_PORT ?? "8080";
      const saved = await page.request.post(
        `http://127.0.0.1:${port}/api/v1/user-words`,
        {
          data: { meaningId: "mean-pour", source: "journey" },
          headers: { "X-CSRF-Token": csrf },
        },
      );
      expect(saved.ok()).toBe(true);
    }
    const path =
      surface === "settings" ? "/settings?tab=profile" : "/reviews?mode=due";
    const endpoint =
      surface === "settings"
        ? "**/api/v1/settings"
        : "**/api/v1/reviews/submissions";
    const method = surface === "settings" ? "PATCH" : "POST";
    let rejectedRequests = 0;
    await page.route(endpoint, async (route) => {
      if (route.request().method() !== method) {
        await route.continue();
        return;
      }
      rejectedRequests += 1;
      expect(route.request().headers()["x-csrf-token"]).toBe(csrf);
      await route.fulfill({
        status: 401,
        contentType: "application/problem+json",
        body: JSON.stringify({ detail: "authentication required" }),
      });
    });
    await page.goto(path);
    if (surface === "settings") {
      await page
        .getByRole("textbox", { name: "Display name" })
        .fill("Unaccepted edit");
      await page.getByRole("button", { name: "Save settings" }).click();
    } else {
      await page.getByRole("button", { name: "Show answer" }).click();
      await page.getByRole("button", { name: "Good", exact: true }).click();
    }
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/signin" && url.searchParams.get("returnTo") === path,
    );
    expect(rejectedRequests).toBe(1);
    await expect(
      page.getByRole("heading", { name: "Sign in to Vocanova" }),
    ).toBeVisible();
    await expect(
      page.getByText("Your settings have been saved.", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText(/You completed \d+ reviews? in this session\./),
    ).toHaveCount(0);
    expect(
      (await context.cookies(baseURL)).filter(
        (cookie) => cookie.name === "vocanova_csrf",
      ),
    ).toEqual([]);
  });
}
