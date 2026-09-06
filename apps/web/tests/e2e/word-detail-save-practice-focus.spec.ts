import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const RECOVERY_KEY = "vocanova.sentence-recovery.v1";

async function authenticate(
  context: import("@playwright/test").BrowserContext,
  baseURL: string,
  extraCookies: { name: string; value: string }[] = [],
) {
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `word-detail-focus-${randomUUID()}`,
      url: baseURL,
    },
    {
      name: "vocanova_csrf",
      value: `word-detail-focus-csrf-${randomUUID()}`,
      url: baseURL,
    },
    ...extraCookies.map((cookie) => ({ ...cookie, url: baseURL })),
  ]);
}

test("keyboard saves focus the exact practice entry without clearing sibling sentence recovery", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected Playwright to configure a base URL.");
  await authenticate(context, baseURL, [
    { name: "e2e_situation_fixture", value: "bank" },
  ]);

  const saveRequests: { meaningId: string; idempotencyKey?: string }[] = [];
  page.on("request", (request) => {
    if (
      request.url().endsWith("/api/v1/user-words") &&
      request.method() === "POST"
    ) {
      saveRequests.push({
        meaningId: (request.postDataJSON() as { meaningId: string }).meaningId,
        idempotencyKey: request.headers()["idempotency-key"],
      });
    }
  });

  await page.goto("/discover/ordering-at-a-cafe/bank");
  const riverSave = page.getByRole("button", {
    name: "Save bank: land beside a river",
  });
  await riverSave.focus();
  await riverSave.press("Enter");

  const riverPractice = page.getByRole("heading", {
    name: "Practice with bank — land beside a river",
  });
  await expect(riverPractice).toBeFocused();

  await page.evaluate(([key, record]) => {
    sessionStorage.setItem(key as string, JSON.stringify(record));
  }, [
    RECOVERY_KEY,
    {
      version: 1,
      ownerId: "user-fixture",
      source: "word_detail",
      attemptId: "uw-mean-bank-river",
      path: "/discover/ordering-at-a-cafe/bank",
      targetWord: "bank",
      shortDefinition: "land beside a river",
      sentence: "The river bank flooded yesterday.",
      createdAt: Date.now(),
    },
  ]);
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume sentence" })).toBeVisible();

  const moneySave = page.getByRole("button", {
    name: "Save bank: a financial institution",
  });
  await moneySave.focus();
  await moneySave.press("Enter");

  const moneyPractice = page.getByRole("heading", {
    name: "Practice with bank — a financial institution",
  });
  await expect(moneyPractice).toBeFocused();
  await expect(page.getByRole("button", { name: "Resume sentence" })).toBeVisible();
  expect(saveRequests).toEqual([
    expect.objectContaining({
      meaningId: "mean-bank-river",
      idempotencyKey: expect.any(String),
    }),
    expect.objectContaining({
      meaningId: "mean-bank-money",
      idempotencyKey: expect.any(String),
    }),
  ]);
  expect(saveRequests[0]?.idempotencyKey).not.toBe(
    saveRequests[1]?.idempotencyKey,
  );

  await page
    .getByRole("button", { name: "Remove bank from saved words" })
    .nth(1)
    .click();
  await expect(moneyPractice).toHaveCount(0);
  await expect(riverPractice).toBeVisible();
  await expect(page.getByRole("button", { name: "Resume sentence" })).toBeVisible();
});

test("a failed keyboard save keeps Save focused and usable for recovery", async ({
  page,
  context,
}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected Playwright to configure a base URL.");
  await authenticate(context, baseURL, [
    { name: "e2e_word_detail_save_failure", value: "1" },
  ]);

  await page.goto("/discover/ordering-at-a-cafe/pour");
  const save = page.getByRole("button", {
    name: "Save pour: to make liquid flow into a container",
  });
  await save.focus();
  await save.press("Enter");
  await expect(
    page
      .getByRole("alert")
      .getByText("Unable to update saved state. Please try again."),
  ).toBeVisible();
  await expect(save).toBeFocused();
  await expect(save).toBeEnabled();

  await context.clearCookies({ name: "e2e_word_detail_save_failure" });
  await save.press("Enter");
  await expect(
    page.getByRole("heading", {
      name: "Practice with pour — to make liquid flow into a container",
    }),
  ).toBeFocused();
});
