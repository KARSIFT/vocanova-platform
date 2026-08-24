# VOC-088 — Test Plan

## VOC-088-TEST-00 — Exhaustive normalized mapping and due boundary

- Covers: `VOC-088-AC-00`
- Preconditions: exported pure `projectWordReviewState`; isolated workerd D1 after
  committed migrations; USER_A fixture; repository clock seam available for a
  counting/incrementing function.
- Procedure: table-drive `projectWordReviewState(status, nextReviewAt, nowIso)` with
  `nowIso` fixed at `2026-08-24T12:00:00.000Z` through these exact cases:

  | Status      | `next_review_at`           | Expected        |
  | ----------- | -------------------------- | --------------- |
  | `new`       | null                       | `due`           |
  | `new`       | `2026-08-24T12:00:00.000Z` | `due`           |
  | `new`       | `2026-08-24T12:00:00.001Z` | `new`           |
  | `learning`  | `2026-08-24T11:59:59.999Z` | `due`           |
  | `learning`  | `2026-08-24T12:00:00.001Z` | `learning`      |
  | `reviewing` | `2026-08-24T12:00:00.000Z` | `due`           |
  | `reviewing` | `2026-08-24T12:00:00.001Z` | `reviewing`     |
  | `mastered`  | null and a past value      | `mastered`      |
  | `ignored`   | null and a past value      | `not_reviewing` |
  | `archived`  | null and a past value      | `not_reviewing` |

  Also pass null status and assert null, then pass an unsupported non-null status and
  assert the exact `Error("unsupported user_words status")` throw directly through the
  pure seam without inserting an invalid D1 row or weakening its status constraint.

  Separately seed at least two active meanings for `flat-white` and active USER_A
  `learning` rows scheduled at `2026-08-24T12:00:00.000Z` and
  `2026-08-24T12:00:00.001Z`, ordered in that sequence. Inject a counting/incrementing
  repository clock whose first call returns `2026-08-24T12:00:00.000Z` and whose
  second call would return `2026-08-24T12:00:00.001Z`. Call
  `getWord(USER_A, "flat-white")` once and assert clock call count `1` and ordered
  `reviewState` values `["due", "learning"]`. A per-meaning clock would call twice and
  incorrectly make the second meaning due.

- Expected result: exact exhaustive mapping, inclusive equality, direct fail-closed
  unsupported-status evidence, and one shared request instant across multiple meanings;
  no calendar/day inference.
- Evidence: `VOC-088-EV-00`

## VOC-088-TEST-01 — Unsaved, soft-deleted, saved identifiers, and minimized DTO

- Covers: `VOC-088-AC-00`
- Preconditions: TEST-00 harness.
- Procedure: request with no row, active row, then the same row soft-deleted. Assert the
  full meaning keys in each response and negative-check `reviewStep`, `nextReviewAt`,
  `status`, and all other raw schedule fields.
- Expected result: absent/deleted is `{ saved: false, reviewState: null }` with no
  `userWordId`; active has `saved: true`, its requester-owned `userWordId`, and a valid
  state. Content/examples/notes remain identical and ordered.
- Evidence: `VOC-088-EV-00`

## VOC-088-TEST-02 — Real-session requester isolation and authentication

- Covers: `VOC-088-AC-01`
- Preconditions: USER_A and USER_B plus distinct active rows for the same meaning;
  deterministic opaque tokens stored only as SHA-256 hashes in two synthetic sessions
  expiring at `9999-12-31T23:59:59.999Z`.
- Procedure: call the real app route twice with the corresponding
  `vocanova_session=<token>` cookie, using USER_A state `due` and USER_B state
  `mastered` with different `userWordId`s. Then call without a session.
- Expected result: each authenticated call is `200` and returns only its own ID/state;
  no payload contains the other learner's values. Anonymous remains `401`. No auth
  source is edited.
- Evidence: `VOC-088-EV-01`

## VOC-088-TEST-03 — Runtime schema and generated committed OpenAPI

- Covers: `VOC-088-AC-02`
- Preconditions: Worker source builds and `createOpenApiDocument()` is available.
- Procedure: assert the canonical-word success schema marks `reviewState` required,
  nullable, and limited to the exact `D00` enum; run `openapi:write`, review only the
  expected nested diff, then run `openapi:check` and `contract:check`.
- Expected result: runtime and committed OpenAPI are identical; operation ID
  `GetCanonicalWord`, route, parameters, `200`, and unrelated schemas are unchanged;
  retired-source parity still passes.
- Evidence: `VOC-088-EV-02`

## VOC-088-TEST-04 — API-client consumption and declaration generation

- Covers: `VOC-088-AC-02`
- Preconditions: maintained client source mirrors the exact union/property.
- Procedure: make the existing canonical-word client fixture return
  `reviewState: "mastered"`, assert the parsed value, build packages, inspect the
  ignored generated declaration for the required nullable property, and run the
  package client test/typecheck.
- Expected result: one matching contract across client source/test/declaration; no new
  dependency, generator, or committed `dist` artifact.
- Evidence: `VOC-088-EV-02`

## VOC-088-TEST-05 — Direct mock fixture contract

- Covers: `VOC-088-AC-03`
- Preconditions: production-build Playwright harness and mock API on its configured
  loopback port.
- Procedure: resolve `baseURL` from `testInfo.project.use.baseURL`. For `unsaved`,
  `due`, `new`, `learning`, `reviewing`, `mastered`, and `not-reviewing`, set the
  host-scoped selector with the exact array-form call
  `await page.context().addCookies([{ name: "e2e_word_detail_review_state", value: fixture, url: baseURL }])`.
  In that same browser context, use the exact browser-associated request sequence:

  ```ts
  const mockApiPort = Number(process.env.MOCK_API_PORT ?? 8080);
  const fixtureResponse = await page.request.get(
    `http://127.0.0.1:${mockApiPort}/api/v1/canonical-words/pour`,
  );
  ```

  Deep-assert `saved`, optional `userWordId`, required `reviewState`, unchanged
  content, and absence of raw schedule keys. Before selecting the next fixture,
  complete the same-context SSR navigation/assertion in TEST-06. Clear the selector
  after the table and prove the default response remains stateful. Do not use
  `page.route`.

- Expected result: exact `D12` contract; selector affects only canonical-word GET.
- Evidence: `VOC-088-EV-03`

## VOC-088-TEST-06 — SSR copy, content, and accessibility

- Covers: `VOC-088-AC-03`
- Preconditions: for the current table row, its cookie is set and its direct
  `page.request.get` fixture assertion in TEST-05 has just passed in the same context.
- Procedure: before changing the fixture cookie, navigate that same context to
  `/discover/ordering-at-a-cafe/pour` and assert the exact `Review state:` text or its
  complete absence, saved/unsaved button, saved-only sentence practice, and unchanged
  definition/example/usage-note content. Repeat the set cookie -> direct mock GET ->
  SSR navigation/assertion sequence for every state. Retain axe, keyboard,
  heading/list, and non-color-only assertions across the existing 360 px, 430 px, and
  desktop projects.
- Expected result: all six public values have exact learner copy, unsaved has no row,
  no raw enum/step is shown, and zero critical/serious axe findings remain.
- Evidence: `VOC-088-EV-03`

## VOC-088-TEST-07 — Stateful save/refresh/practice/unsave/failure regression

- Covers: `VOC-088-AC-04`
- Preconditions: unique synthetic session cookie and matching readable CSRF cookie;
  no fixed review-state selector.
- Procedure: open unsaved Word Detail, save via the existing accessible button, wait
  for Saved plus refreshed `Review state: Due now` and sentence-practice entry, then
  unsave and wait for Save plus absence of state/practice. In a fresh isolated session,
  set `e2e_word_detail_save_failure=1`, attempt save, and assert the existing stable
  error, unchanged Save state, and absent state/practice. Inspect the exact source diff
  to confirm `router.refresh()` occurs only in the success branch and exactly once per
  confirmed mutation.
- Expected result: backend-confirmed coherence; payload/CSRF/idempotency/error behavior
  remains unchanged; failure does not mutate or refresh.
- Evidence: `VOC-088-EV-04`

## VOC-088-TEST-08 — Deterministic local validation

- Covers: `VOC-088-AC-05`
- Preconditions: exact installed toolchain from `docs/development.md`; no production
  secret or live resource.
- Procedure: run in this order and record exact output:

  ```bash
  pnpm --filter @vocanova/api-worker exec vitest run test/content-review-parity.test.ts
  pnpm --filter @vocanova/api-worker openapi:write
  pnpm --filter @vocanova/api-worker openapi:check
  pnpm --filter @vocanova/api-worker contract:check
  pnpm --filter @vocanova/api-client test
  pnpm run build:packages
  pnpm --filter @vocanova/web typecheck:e2e
  API_BASE_URL=http://127.0.0.1:8080 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 pnpm --filter @vocanova/web build
  pnpm --filter @vocanova/web exec playwright install chromium
  pnpm --filter @vocanova/web test:e2e -- discover-accessibility.spec.ts core-loop.spec.ts
  pnpm validate
  pnpm ci:worker-api
  pnpm ci:web
  pnpm exec prettier --check specs/changes/VOC-088-word-detail-review-state apps/api-worker/src/domain/content-learning.ts apps/api-worker/src/content/repository.ts apps/api-worker/src/content/routes.ts apps/api-worker/openapi/worker-foundation.openapi.json apps/api-worker/test/content-review-parity.test.ts packages/api-client/src/index.ts packages/api-client/src/index.test.ts apps/web/src/app/'(app)'/discover/'[situation]'/'[word]'/page.tsx apps/web/src/app/'(app)'/discover/'[situation]'/'[word]'/_components/meaning-save-button.tsx apps/web/tests/e2e/mock-api-server.mjs apps/web/tests/e2e/discover-accessibility.spec.ts
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

- Expected result: all applicable commands pass; generated OpenAPI is clean after
  regeneration; classifier reports no floor above declared R2. Report unavailable or
  failed commands honestly and keep merge blocked.
- Evidence: `VOC-088-EV-05`

## VOC-088-TEST-09 — Scope, rollback, exact review, hosted checks, and closure

- Covers: `VOC-088-AC-05`
- Preconditions: final implementation commit and known exact pre-implementation base.
- Procedure: verify the diff contains exactly the eleven allowed files. In a disposable
  worktree, revert the implementation revision without committing and compare all
  authorized paths with the base; discard only the disposable worktree. Obtain a
  different-actor review of the exact final SHA and passing hosted CI, Governance,
  Security, and Quality evidence. After normal merge, wait for applicable post-merge
  checks and attach all links before issue closure.
- Expected result: tree equality on rollback; no unauthorized file/effect; exact-SHA
  PASS with zero unresolved blockers; hosted and post-merge success; then issue #139
  may close. Any failure keeps merge or closure blocked as applicable.
- Evidence: `VOC-088-EV-05`

## Test strategy rationale

The existing workerd D1 repository test owns deterministic clocks, migrations, and
requester-state parity; extending it proves the due predicate at the storage boundary.
Real session cookies prove the route does not merely pass a user ID correctly in a
direct repository call. Runtime-schema plus generated-artifact checks bind OpenAPI;
API-client compilation binds the maintained consumer. The existing production-build
Playwright/mock harness proves actual SSR, accessibility, and stateful save/sentence
practice behavior without adding a component framework or observing server fetches
through an inapplicable browser route interception. Full workspace/Worker/web and
hosted Quality checks provide the proportional R2 qualification.
