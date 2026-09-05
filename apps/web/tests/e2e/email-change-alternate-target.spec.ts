import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

test("starts another email change with a 44px completed-state control", async ({
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

  await page.goto("/settings/account");
  await page.getByRole("textbox", { name: "New sign-in email" }).fill(
    "new@example.test",
  );
  await page.getByRole("button", { name: "Send confirmation link" }).click();
  await page.getByRole("textbox", { name: "Confirmation token" }).fill("token");
  await page.getByRole("button", { name: "Confirm change" }).click();

  const startOver = page.getByRole("button", {
    name: "Change to another address",
  });
  await expect(startOver).toBeVisible();
  const startOverBox = await startOver.boundingBox();
  expect(startOverBox).not.toBeNull();
  expect(startOverBox?.height).toBeGreaterThanOrEqual(44);
  await startOver.click();
  await expect(
    page.getByRole("textbox", { name: "New sign-in email" }),
  ).toHaveValue("");
  await expect(
    page.getByRole("textbox", { name: "Confirmation token" }),
  ).toHaveCount(0);
});
