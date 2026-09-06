import { randomUUID } from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const WORD = "pour";
const DEFINITION = "to make liquid flow into a container";

async function authenticate(
  context: BrowserContext,
  baseURL: string,
  mutationFixture: {
    hold?: "save" | "remove";
    failure?: "save" | "remove";
  } = {},
) {
  const domain = new URL(baseURL).hostname;
  await context.addCookies([
    {
      name: "vocanova_session",
      value: `word-detail-pending-${randomUUID()}`,
      domain,
      path: "/",
    },
    {
      name: "vocanova_csrf",
      value: `word-detail-pending-csrf-${randomUUID()}`,
      domain,
      path: "/",
    },
    ...(mutationFixture.hold
      ? [
          {
            name: "e2e_word_detail_mutation_hold",
            value: mutationFixture.hold,
            domain,
            path: "/",
          },
        ]
      : []),
    ...(mutationFixture.failure
      ? [
          {
            name: "e2e_word_detail_mutation_failure",
            value: mutationFixture.failure,
            domain,
            path: "/",
          },
        ]
      : []),
  ]);
}

async function setMutationFixture(
  context: BrowserContext,
  baseURL: string,
  name: "e2e_word_detail_mutation_hold" | "e2e_word_detail_mutation_failure",
  value: "save" | "remove",
) {
  await context.addCookies([
    {
      name,
      value,
      domain: new URL(baseURL).hostname,
      path: "/",
    },
  ]);
}

async function releaseMutation(page: Page, action: "save" | "remove") {
  const mockApiPort = process.env.MOCK_API_PORT ?? "8080";
  await expect
    .poll(async () => {
      const response = await page.request.post(
        `http://127.0.0.1:${mockApiPort}/__e2e/release-word-detail-mutation?action=${action}`,
      );
      return response.status();
    })
    .toBe(204);
}

function saveButton(page: Page) {
  return page.getByRole("button", {
    name: `Save ${WORD}: ${DEFINITION}`,
  });
}

function removeButton(page: Page) {
  return page.getByRole("button", {
    name: `Remove ${WORD} from saved words`,
  });
}

test.describe("Word Detail save pending feedback", () => {
  test("truthfully holds save and removal while submitting each mutation once", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL)
      throw new Error("Expected Playwright to configure a base URL.");
    await authenticate(context, baseURL, { hold: "save" });

    const saveRequests: string[] = [];
    const removalRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith("/api/v1/user-words")) {
        saveRequests.push(request.method());
      }
      if (
        request.method() === "DELETE" &&
        request.url().includes("/api/v1/user-words/")
      ) {
        removalRequests.push(request.method());
      }
    });

    await page.goto("/discover/ordering-at-a-cafe/pour");
    await saveButton(page).focus();
    await saveButton(page).press("Enter");

    const saving = page.getByRole("button", {
      name: `Saving ${WORD}: ${DEFINITION}`,
    });
    await expect(saving).toHaveText("Saving...");
    await expect(saving).toBeDisabled();
    await expect(saving).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("status")).toHaveText(`Saving ${WORD}.`);
    await page.keyboard.press("Enter");
    await expect.poll(() => saveRequests).toEqual(["POST"]);

    await releaseMutation(page, "save");
    await expect(
      page.getByRole("heading", {
        name: `Practice with ${WORD} — ${DEFINITION}`,
      }),
    ).toBeFocused();
    await expect(
      page.getByText("Review state: Due now", { exact: true }),
    ).toBeVisible();

    await setMutationFixture(
      context,
      baseURL,
      "e2e_word_detail_mutation_hold",
      "remove",
    );
    await removeButton(page).focus();
    await removeButton(page).press("Enter");

    const removing = page.getByRole("button", {
      name: `Removing ${WORD} from saved words`,
    });
    await expect(removing).toHaveText("Removing...");
    await expect(removing).toBeDisabled();
    await expect(removing).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("status")).toHaveText(
      `Removing ${WORD} from saved words.`,
    );
    await page.keyboard.press("Enter");
    await expect.poll(() => removalRequests).toEqual(["DELETE"]);

    await releaseMutation(page, "remove");
    await expect(page.getByText(/^Review state:/)).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: `Practice with ${WORD} — ${DEFINITION}`,
      }),
    ).toHaveCount(0);
    await expect(saveButton(page)).toBeVisible();
  });

  test("keeps the prior state truthful when a held save or removal fails", async ({
    page,
    context,
  }, testInfo) => {
    const baseURL = testInfo.project.use.baseURL;
    if (!baseURL)
      throw new Error("Expected Playwright to configure a base URL.");
    await authenticate(context, baseURL, { hold: "save", failure: "save" });
    await page.goto("/discover/ordering-at-a-cafe/pour");

    await saveButton(page).click();
    await expect(
      page.getByRole("button", { name: `Saving ${WORD}: ${DEFINITION}` }),
    ).toBeDisabled();
    await releaseMutation(page, "save");
    await expect(
      page
        .getByRole("alert")
        .getByText("Unable to update saved state. Please try again."),
    ).toBeVisible();
    await expect(saveButton(page)).toBeFocused();
    await expect(saveButton(page)).toBeEnabled();
    await expect(page.getByText(/^Review state:/)).toHaveCount(0);

    await context.clearCookies({ name: "e2e_word_detail_mutation_failure" });
    await saveButton(page).press("Enter");
    await expect(
      page.getByRole("heading", {
        name: `Practice with ${WORD} — ${DEFINITION}`,
      }),
    ).toBeFocused();

    await setMutationFixture(
      context,
      baseURL,
      "e2e_word_detail_mutation_hold",
      "remove",
    );
    await setMutationFixture(
      context,
      baseURL,
      "e2e_word_detail_mutation_failure",
      "remove",
    );
    await removeButton(page).click();
    await expect(
      page.getByRole("button", { name: `Removing ${WORD} from saved words` }),
    ).toBeDisabled();
    await releaseMutation(page, "remove");
    await expect(
      page
        .getByRole("alert")
        .getByText("Unable to update saved state. Please try again."),
    ).toBeVisible();
    await expect(removeButton(page)).toBeFocused();
    await expect(removeButton(page)).toBeEnabled();
    await expect(
      page.getByText("Review state: Due now", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: `Practice with ${WORD} — ${DEFINITION}`,
      }),
    ).toBeVisible();
  });
});
