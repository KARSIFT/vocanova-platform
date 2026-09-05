import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function setRetryFixture(context: BrowserContext, baseURL: string) {
  const domain = new URL(baseURL).hostname;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `settings-save-retry-${randomUUID()}`,
      domain,
      path: "/",
    },
    { name: "vocanova_csrf", value: "settings-csrf", domain, path: "/" },
    {
      name: "e2e_settings_patch_failure",
      value: "retry",
      domain,
      path: "/",
    },
    {
      name: "e2e_settings_patch_hold",
      value: "1",
      domain,
      path: "/",
    },
  ]);
}

async function releaseSettingsPatch(page: Page) {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  const response = await page.request.post(
    `http://127.0.0.1:${mockApiPort}/__e2e/release-settings-patch`,
  );
  await expect(response).toBeOK();
}

test.describe("Settings save recovery", () => {
  test("retains a failed edit and persists exactly one retry", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) {
      throw new Error("Expected Playwright to configure a base URL.");
    }
    await setRetryFixture(context, baseURL);
    await page.goto("/settings");

    const displayName = page.getByRole("textbox", { name: "Display name" });
    await displayName.fill("Retry-safe learner");
    const patchRequests: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "PATCH" &&
        request.url().endsWith("/api/v1/settings")
      ) {
        patchRequests.push(request.postData() ?? "");
      }
    });

    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByRole("button", { name: "Saving..." })).toBeDisabled();

    // Exercise the real keyboard path while the request is held. This must
    // not manufacture a second submit by dispatching synthetic form events.
    await displayName.focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => patchRequests).toHaveLength(1);

    await releaseSettingsPatch(page);
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "We couldn't save your settings. Please try again." }),
    ).toBeVisible();
    await expect(displayName).toHaveValue("Retry-safe learner");
    await expect(page.getByRole("button", { name: "Save settings" })).toBeEnabled();

    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText("Your settings have been saved.", { exact: true }),
    ).toBeVisible();
    await expect.poll(() => patchRequests).toHaveLength(2);
    expect(JSON.parse(patchRequests[1])).toEqual({
      displayName: "Retry-safe learner",
    });

    await page.reload();
    await expect(displayName).toHaveValue("Retry-safe learner");
  });
});
