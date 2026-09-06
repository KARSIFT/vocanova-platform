import { randomUUID } from "node:crypto";

import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";

async function authenticate(
  context: BrowserContext,
  baseURL: string,
  prefix: string,
) {
  const csrfToken = `${prefix}-csrf-${randomUUID()}`;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `${prefix}-${randomUUID()}`,
      url: baseURL,
    },
    { name: "vocanova_csrf", value: csrfToken, url: baseURL },
  ]);
  return csrfToken;
}

async function holdSentenceFeedback(page: Page) {
  let requestCount = 0;
  let releaseRequest: (() => void) | undefined;
  let notifyRequestStarted: (() => void) | undefined;
  const requestStarted = new Promise<void>((resolve) => {
    notifyRequestStarted = resolve;
  });
  const requestReleased = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  await page.route("**/api/v1/sentence-feedback", async (route) => {
    requestCount += 1;
    notifyRequestStarted?.();
    await requestReleased;
    await route.continue();
  });

  return {
    requestStarted,
    release: () => releaseRequest?.(),
    requestCount: () => requestCount,
  };
}

async function verifyPendingStatusAndFocusedResult(
  page: Page,
  input: Locator,
  sentence: string,
) {
  const heldRequest = await holdSentenceFeedback(page);
  const submit = page.getByRole("button", { name: "Check my sentence" });

  await input.fill(sentence);
  await submit.click();
  await heldRequest.requestStarted;

  await expect(
    page.getByRole("status", { name: "Checking sentence…" }),
  ).toBeVisible();
  await expect(submit).toBeDisabled();

  // A disabled native submit control cannot produce another form submission,
  // including when a second pointer activation reaches it while the request
  // remains in flight.
  await submit.click({ force: true });
  expect(heldRequest.requestCount()).toBe(1);

  heldRequest.release();
  const result = page.getByRole("status", { name: "Feedback result: Correct" });
  await expect(result).toBeVisible();
  await expect(result).toBeFocused();
  expect(heldRequest.requestCount()).toBe(1);
}

test.describe("Sentence feedback submission status and result focus", () => {
  test("announces submission and focuses feedback from Word Detail", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await authenticate(context, baseURL, "sentence-focus-word-detail");

    await page.goto("/discover/ordering-at-a-cafe/pour");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();

    await verifyPendingStatusAndFocusedResult(
      page,
      page.getByRole("textbox", { name: /Write a sentence using pour/ }),
      "I will pour the coffee into a cup.",
    );
  });

  test("announces submission and focuses feedback from Home", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    await authenticate(context, baseURL, "sentence-focus-home");
    await context.addCookies([
      { name: "e2e_home_fixture", value: "caught-up", url: baseURL },
    ]);

    await page.goto("/home");

    await verifyPendingStatusAndFocusedResult(
      page,
      page.getByRole("textbox", { name: /Write a sentence using arrival/ }),
      "My arrival is at noon.",
    );
  });

  test("announces submission and focuses feedback after review completion", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL) throw new Error("Expected a Playwright base URL.");
    const csrfToken = await authenticate(
      context,
      baseURL,
      "sentence-focus-review",
    );
    const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
    const savedWord = await page.request.post(
      `http://127.0.0.1:${mockApiPort}/api/v1/user-words`,
      {
        data: { meaningId: "mean-pour", source: "journey" },
        headers: { "X-CSRF-Token": csrfToken },
      },
    );
    expect(savedWord.ok()).toBeTruthy();

    await page.goto("/reviews");
    await page.getByRole("button", { name: "Show answer" }).click();
    await page.getByRole("button", { name: "Good", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Review session complete" }),
    ).toBeVisible();

    await verifyPendingStatusAndFocusedResult(
      page,
      page.getByRole("textbox", { name: /Write a sentence using pour/ }),
      "I will pour the coffee into a cup.",
    );
  });
});
