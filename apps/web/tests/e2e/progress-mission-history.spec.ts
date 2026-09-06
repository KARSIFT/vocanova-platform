import { expect, test } from "@playwright/test";

async function useProgressFixture(
  page: import("@playwright/test").Page,
  baseURL: string,
  fixture: "legacy-history",
) {
  await page.context().addCookies([
    { name: "e2e_progress_fixture", value: fixture, url: baseURL },
  ]);
}

test("shows dated, newest-first mission statuses and the authoritative grace balance", async ({
  page,
}) => {
  await page.goto("/progress");

  const history = page
    .getByRole("heading", { name: "Recent missions", level: 2 })
    .locator("..");
  await expect(history).toContainText(
    "Your latest mission snapshots, newest first.",
  );
  await expect(history.locator("time")).toHaveCount(4);
  await expect(
    await history
      .locator("time")
      .evaluateAll((times) => times.map((time) => time.getAttribute("datetime"))),
  ).toEqual(["2026-01-07", "2026-01-04", "2025-12-31", "2025-12-28"]);
  await expect(history.getByText("Jan 7, 2026", { exact: true })).toBeVisible();
  await expect(history.getByText("Jan 4, 2026", { exact: true })).toBeVisible();
  await expect(history.getByText("Dec 31, 2025", { exact: true })).toBeVisible();
  await expect(history.getByText("Dec 28, 2025", { exact: true })).toBeVisible();
  for (const label of [
    "Completed",
    "Streak protected",
    "Missed",
    "In progress",
  ]) {
    await expect(history.getByText(label, { exact: true })).toBeVisible();
  }

  const streak = page
    .getByRole("heading", { name: "Your streaks", level: 2 })
    .locator("..");
  await expect(streak).toContainText("Grace days available: 1");
  await expect(streak).toContainText(
    "A grace day protects your streak when you miss a mission.",
  );
});

test("uses neutral status labels for a legacy progress response", async (
  { page },
  testInfo,
) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error("Expected a Playwright base URL.");
  await useProgressFixture(page, baseURL, "legacy-history");
  await page.goto("/progress");

  const history = page
    .getByRole("heading", { name: "Recent missions", level: 2 })
    .locator("..");
  await expect(
    history.getByText("Completed or protected", { exact: true }),
  ).toHaveCount(2);
  await expect(history.getByText("Not completed", { exact: true })).toHaveCount(
    2,
  );
  await expect(history.getByText("Streak protected", { exact: true })).toHaveCount(
    0,
  );
});
