/* global fetch */

import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

import { assertCleanWorkerdOutput } from "../../apps/web/scripts/test-workerd.mjs";
import { LOCAL_DEVELOPMENT_CONTRACT } from "./local-development-policy.mjs";
import {
  READINESS_TIMEOUT_MS,
  SupervisedChildren,
  assertPortsAvailable,
  waitForReadiness,
} from "./local-development-supervisor.mjs";
import {
  assertRepositoryTreeUnchanged,
  buildDisposableLocalStackPlan,
  captureRepositoryTree,
  migrateDisposableLocalD1,
  prepareDisposableLocalStack,
  readDisposableD1Evidence,
} from "./local-stack-smoke.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const webRequire = createRequire(
  resolve(repositoryRoot, "apps/web/package.json"),
);
const { chromium } = webRequire("@playwright/test");
const learnerId = "b1000000-0000-4000-8000-000000000001";
const sessionToken = "local-learner-loop-session-token";
const csrfToken = "local-learner-loop-csrf-token";

function databasePath(stateDirectory) {
  const paths = [];
  const collect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collect(path);
      else if (path.endsWith(".sqlite") && !path.endsWith("metadata.sqlite"))
        paths.push(path);
    }
  };
  collect(stateDirectory);
  assert.equal(paths.length, 1, "one disposable D1 database must exist");
  return paths[0];
}

export function seedDisposableLearner(stateDirectory, now = new Date()) {
  const database = new DatabaseSync(databasePath(stateDirectory));
  const timestamp = now.toISOString();
  try {
    database
      .prepare(
        `INSERT INTO users (id, email, display_name, status, onboarding_status, created_at, updated_at)
         VALUES (?1, ?2, 'Local learner', 'active', 'not_started', ?3, ?3)`,
      )
      .run(learnerId, "local-learner-loop@example.test", timestamp);
    database
      .prepare(
        `INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
         VALUES (?1, ?2, ?3, ?4, ?5)`,
      )
      .run(
        randomUUID(),
        learnerId,
        createHash("sha256").update(sessionToken).digest("hex"),
        timestamp,
        new Date(now.getTime() + 86_400_000).toISOString(),
      );
  } finally {
    database.close();
  }
}

function inspect(stateDirectory) {
  const database = new DatabaseSync(databasePath(stateDirectory), {
    readOnly: true,
  });
  try {
    return {
      attempts: database
        .prepare(
          "SELECT count(*) AS count FROM review_attempts WHERE user_id = ?1",
        )
        .get(learnerId).count,
      rewards: database
        .prepare(
          "SELECT count(*) AS count FROM confidence_point_ledger WHERE user_id = ?1 AND reason = 'review_correct'",
        )
        .get(learnerId).count,
      saved: database
        .prepare("SELECT count(*) AS count FROM user_words WHERE user_id = ?1")
        .get(learnerId).count,
      mission: database
        .prepare(
          "SELECT status, reviews_completed FROM daily_mission_snapshots WHERE user_id = ?1 ORDER BY local_date DESC LIMIT 1",
        )
        .get(learnerId),
    };
  } finally {
    database.close();
  }
}

async function completeOnboarding(page) {
  await page.goto(`${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}/home`);
  await page.getByRole("radio", { name: /A2/ }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Native language").fill("en");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: "Travel", exact: true }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: "Travel", exact: true }).check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("radio", { name: /5 words/ }).check();
  await page.getByRole("button", { name: "Finish setup" }).click();
  await page.waitForURL(/\/home$/);
}

async function saveAirportWords(page) {
  await page.goto(
    `${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}/discover/travel-airport`,
  );
  const links = await page
    .locator('a[href^="/discover/travel-airport/"]')
    .evaluateAll((items) =>
      items.slice(0, 5).map((item) => item.getAttribute("href")),
    );
  assert.equal(
    links.length,
    5,
    "the original airport catalog must expose five words",
  );
  for (const link of links) {
    await page.goto(`${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}${link}`);
    await page.getByRole("button", { name: /^Save / }).click();
    await page.getByRole("button", { name: "Saved" }).waitFor();
  }
}

async function completeReviews(page) {
  let captured;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/v1/reviews/submissions") && !captured) {
      captured = {
        body: request.postData(),
        key: request.headers()["idempotency-key"],
      };
    }
  });
  await page.goto(`${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}/reviews`);
  for (let index = 0; index < 5; index += 1) {
    const showAnswer = page.getByRole("button", { name: "Show answer" });
    if (await showAnswer.count()) await showAnswer.click();
    else {
      const correct = page.locator("button").filter({ hasText: "(correct)" });
      await correct.first().click();
    }
    await page.getByRole("button", { name: "Good" }).click();
  }
  await page.getByText("You reached today’s review target.").waitFor();
  assert.ok(
    captured?.body && captured.key,
    "a real review request must be captured",
  );
  return captured;
}

async function replayReview(request) {
  const response = await fetch(
    `${LOCAL_DEVELOPMENT_CONTRACT.apiOrigin}/api/v1/reviews/submissions`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `vocanova_session=${sessionToken}; vocanova_csrf=${csrfToken}`,
        "x-csrf-token": csrfToken,
        "idempotency-key": request.key,
      },
      body: request.body,
    },
  );
  assert.equal(response.status, 200, "the captured review replay must succeed");
}

async function practiceOnHome(page) {
  await page.goto(`${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}/home`);
  const input = page.getByRole("textbox", { name: /Write a sentence using/ });
  const label = await input.getAttribute("aria-label");
  const target =
    label?.replace(/^Write a sentence using (.+)$/, "") ?? "boarding pass";
  await input.fill(`I used ${target} at the airport today.`);
  await page.getByRole("button", { name: "Check my sentence" }).click();
  await page
    .getByText("We cannot check this right now. Please try again later.")
    .waitFor();
}

export async function runLocalLearnerLoop({
  childFactory = () => new SupervisedChildren(),
  portCheck = assertPortsAvailable,
} = {}) {
  const workspace = mkdtempSync(
    join(tmpdir(), "vocanova-local-stack-learner-"),
  );
  const stateDirectory = join(workspace, "state");
  const before = captureRepositoryTree(repositoryRoot);
  const plan = buildDisposableLocalStackPlan(stateDirectory);
  let children;
  let browser;
  try {
    await portCheck(plan.ports);
    prepareDisposableLocalStack(plan);
    migrateDisposableLocalD1(stateDirectory);
    migrateDisposableLocalD1(stateDirectory);
    const initialization = readDisposableD1Evidence(stateDirectory);
    assert.equal(initialization.health, "ok");
    assert.ok(
      initialization.migrationCount > 0,
      "migrations must be replay-safe",
    );
    seedDisposableLearner(stateDirectory);
    children = childFactory();
    const api = children.start(plan.api);
    await waitForReadiness(plan.apiReadiness, {
      childRecord: api,
      fetchImpl: fetch,
      readinessTimeoutMs: READINESS_TIMEOUT_MS,
      ports: plan.ports.map(({ port }) => port),
    });
    const web = children.start(plan.web);
    await waitForReadiness(plan.webReadiness, {
      childRecord: web,
      fetchImpl: fetch,
      readinessTimeoutMs: READINESS_TIMEOUT_MS,
      ports: plan.ports.map(({ port }) => port),
    });
    assert.equal(
      (await fetch(`${LOCAL_DEVELOPMENT_CONTRACT.apiOrigin}/api/v1/me`)).status,
      401,
    );
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "vocanova_session",
        value: sessionToken,
        url: LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
        httpOnly: true,
        sameSite: "Lax",
      },
      {
        name: "vocanova_csrf",
        value: csrfToken,
        url: LOCAL_DEVELOPMENT_CONTRACT.webOrigin,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    await completeOnboarding(page);
    await saveAirportWords(page);
    assert.equal(inspect(stateDirectory).saved, 5);
    const review = await completeReviews(page);
    const beforeReplay = inspect(stateDirectory);
    await replayReview(review);
    assert.deepEqual(
      inspect(stateDirectory),
      beforeReplay,
      "replaying a review must not duplicate an attempt or reward",
    );
    await page.goto(`${LOCAL_DEVELOPMENT_CONTRACT.webOrigin}/progress`);
    await page.getByText("Completed").first().waitFor();
    await practiceOnHome(page);
    return inspect(stateDirectory);
  } finally {
    await browser?.close();
    await children?.stopAll("SIGTERM");
    for (const record of children?.records ?? [])
      assertCleanWorkerdOutput(
        `${record.label} learner loop`,
        record.output ?? "",
        record.diagnostics ?? [],
      );
    await portCheck(plan.ports);
    if (existsSync(stateDirectory))
      assert.equal(readDisposableD1Evidence(stateDirectory).health, "ok");
    rmSync(workspace, { force: true, recursive: true });
    assert.equal(
      existsSync(workspace),
      false,
      "disposable learner state must be removed",
    );
    assertRepositoryTreeUnchanged(
      before,
      captureRepositoryTree(repositoryRoot),
    );
  }
}

export function validateLocalLearnerLoopCliArguments(args) {
  return args.length === 0
    ? []
    : [
        "test:local-learner-loop accepts no arguments; topology and disposable state are fixed",
      ];
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = validateLocalLearnerLoopCliArguments(process.argv.slice(2));
  if (errors.length > 0) {
    process.stderr.write(`${errors.join("\n")}\n`);
    process.exitCode = 2;
  } else await runLocalLearnerLoop();
}
