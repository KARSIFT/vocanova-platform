import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";

const KEY = "vocanova.sentence-recovery.v1";
const USER = "user-fixture";

function recovery(overrides: Record<string, unknown> = {}) {
  return {
    version: 1, ownerId: USER, source: "word_detail", attemptId: "uw-mean-pour",
    path: "/discover/ordering-at-a-cafe/pour", targetWord: "pour",
    shortDefinition: "to make a liquid flow", sentence: "I pour coffee every morning.", createdAt: Date.now(), ...overrides,
  };
}

async function authenticate(page: import("@playwright/test").Page, context: import("@playwright/test").BrowserContext, baseURL: string) {
  await context.addCookies([{ name: "vocanova_session", value: `recovery-${randomUUID()}`, url: baseURL }, { name: "vocanova_csrf", value: `recovery-csrf-${randomUUID()}`, url: baseURL }]);
  await page.goto("/discover/ordering-at-a-cafe/pour");
  await page.getByRole("button", { name: "Save" }).click();
}

test("word detail saves on 401, signs in, and explicitly resumes only its matching sentence", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await authenticate(page, context, baseURL);
  await page.request.post("http://127.0.0.1:8107/api/v1/auth/magic-links", {
    data: { email: "learner@example.test", returnTo: "/discover/ordering-at-a-cafe/pour" },
  });
  const input = page.getByRole("textbox", { name: /Write a sentence using pour/ });
  await input.fill("I pour coffee every morning.");
  await page.route("**/api/v1/sentence-feedback", async (route) => route.fulfill({ status: 401, contentType: "application/problem+json", body: JSON.stringify({ detail: "authentication required" }) }));
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await expect(page).toHaveURL(/\/signin\?returnTo=/);
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY))
    .not.toBeNull();
  await page.unroute("**/api/v1/sentence-feedback");
  await page.goto("/auth/magic?token=recovery-token&email=learner%40example.test&returnTo=%2Fdiscover%2Fordering-at-a-cafe%2Fpour");
  await expect(page).toHaveURL("/discover/ordering-at-a-cafe/pour");
  await expect(page.getByText("Your sentence was saved when your session expired.")).toBeVisible();
  await page.getByRole("button", { name: "Resume sentence" }).click();
  await expect(input).toHaveValue("I pour coffee every morning.");
});

test("rejects different owners, target mismatch, malformed and expired recovery", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await authenticate(page, context, baseURL);
  for (const item of [recovery({ ownerId: "another-user" }), recovery({ attemptId: "other-target" }), { malformed: true }, recovery({ createdAt: Date.now() - 30 * 60 * 1000 - 1 })]) {
    await page.evaluate(([key, value]) => sessionStorage.setItem(key as string, JSON.stringify(value)), [KEY, item]);
    await page.reload();
    await expect(page.getByText("Your sentence was saved when your session expired.")).toHaveCount(0);
    await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY)).toBeNull();
  }
});

test("home restores selection and review restores the historical attempt without a new review", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await authenticate(page, context, baseURL);
  await page.goto("/home");
  await page.evaluate(([key, value]) => sessionStorage.setItem(key as string, JSON.stringify(value)), [KEY, recovery({ source: "daily_mission", attemptId: "uw-mean-pour", path: "/home" })]);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Choose a saved word to practice" })).toHaveValue("uw-mean-pour");
  await page.evaluate(([key, value]) => sessionStorage.setItem(key as string, JSON.stringify(value)), [KEY, recovery({ source: "review", attemptId: "historical-review-attempt", path: "/reviews" })]);
  let reviewPosts = 0;
  await page.route("**/api/v1/reviews/submissions", async (route) => { reviewPosts += 1; await route.continue(); });
  await page.goto("/reviews");
  await expect(page.getByRole("heading", { name: "Resume sentence practice" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Practice with pour/ })).toBeVisible();
  expect(reviewPosts).toBe(0);
});

test("discard, successful feedback, and logout clear recovery", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await authenticate(page, context, baseURL);
  for (const action of ["Discard saved sentence", "Check my sentence", "Log out"] as const) {
    await page.evaluate(([key, value]) => sessionStorage.setItem(key as string, JSON.stringify(value)), [KEY, recovery()]);
    await page.reload();
    if (action === "Check my sentence") await page.getByRole("button", { name: "Resume sentence" }).click();
    await page.getByRole("button", { name: action }).click();
    if (action === "Check my sentence") await expect(page.getByText("Correct", { exact: true })).toBeVisible();
    if (action === "Log out") await expect(page).toHaveURL("/signin");
    await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY)).toBeNull();
  }
});

test("successful account deletion clears recovery", async ({ page, context }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL!;
  await authenticate(page, context, baseURL);
  await page.evaluate(
    ([key, value]) => sessionStorage.setItem(key as string, JSON.stringify(value)),
    [KEY, recovery()],
  );
  await page.goto("/settings/account");
  await page.getByRole("button", { name: "I want to delete my account" }).click();
  await page.getByRole("textbox", { name: "Type the confirmation phrase" }).fill("delete my account");
  await page.getByRole("button", { name: "Permanently deactivate my account" }).click();
  await expect.poll(() => page.evaluate((key) => sessionStorage.getItem(key as string), KEY)).toBeNull();
});
