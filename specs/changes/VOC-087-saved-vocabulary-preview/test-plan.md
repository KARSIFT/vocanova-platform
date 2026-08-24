# VOC-087 — Test Plan

## VOC-087-TEST-00 — Truncated fixture contract

- Covers: `VOC-087-AC-00`, `AC-01`
- Procedure: receive `{ page, baseURL }`, fail with a concrete fixture-configuration
  error if `baseURL` is absent, and execute this sequence before navigation:

  ```ts
  await page.context().addCookies([
    {
      name: "e2e_saved_words_fixture",
      value: "truncated-page",
      url: baseURL,
    },
  ]);
  const mockApiPort = Number(process.env.MOCK_API_PORT ?? 8080);
  const fixtureResponse = await page.request.get(
    `http://127.0.0.1:${mockApiPort}/api/v1/user-words?limit=10`,
  );
  ```

  Assert success, parse JSON, and deep-assert the exact `VOC-087-D06` response before
  visiting Progress. `page.request` is required because it is the API request context
  associated with the browser context and shares that context's cookie jar.

- Expected: the response has the exact 10 distinct ordered rows, stable fields, and
  `nextCursor: "e2e-saved-words-after-10"` specified by `VOC-087-D06`. Because cookies
  are scoped by host/path rather than port, the cookie set for configured web `baseURL`
  on `127.0.0.1` is sent to the mock on its configured `127.0.0.1` port.
- Evidence: `VOC-087-EV-00`, `VOC-087-EV-01`

## VOC-087-TEST-01 — No false total claim

- Covers: `VOC-087-AC-00`
- Procedure: after `VOC-087-TEST-00` succeeds in the same test/browser context, call
  `page.goto("/progress")` and scope assertions to the saved-vocabulary section. This
  navigation sends the fixture cookie to Next. Existing `createServerApiClient` reads
  the incoming `Cookie` header and copies it to the server-to-server mock API request,
  so SSR must select the same fixture. Do not use `page.route` as proof: it cannot
  intercept the server-side fetch.
- Expected: the exact heading and preview sentence from `VOC-087-D00` are visible;
  `10 words saved` and any length-derived total presentation are absent; rendering the
  same exact `VOC-087-D06` rows proves cookie forwarding reached the SSR fetch rather
  than falling back to the default empty state.
- Evidence: `VOC-087-EV-00`

## VOC-087-TEST-02 — Rows, definitions, order, and request bound

- Covers: `VOC-087-AC-01`
- Procedure: scope to the saved-vocabulary section and assert 10 native list items,
  each exact `VOC-087-D06` word/definition exactly once and in fixture order. Inspect the exact
  production diff to confirm `listSavedWords({ limit: 10 })` is unchanged and no cursor
  traversal or additional saved-word request was added. This source review is required
  because the server-component fetch is not observable through browser request events.
- Expected: the rendered list matches the first page exactly; the implementation keeps
  the existing one-request `limit=10` boundary and never follows `nextCursor`.
- Evidence: `VOC-087-EV-01`

## VOC-087-TEST-03 — Empty state

- Covers: `VOC-087-AC-02`
- Procedure: render Progress with the unchanged default empty fixture.
- Expected: the exact existing empty-state message is visible and the non-empty preview
  sentence/list are absent.
- Evidence: `VOC-087-EV-02`

## VOC-087-TEST-04 — Accessibility and auth preservation

- Covers: `VOC-087-AC-02`
- Procedure: retain and run the Progress axe, keyboard-reachability, non-color-only, and
  heading/list assertions at the configured 360 px, 430 px, and desktop viewports. Run
  the full Quality suite so existing unauthenticated/core-loop coverage also executes;
  inspect the production diff to confirm `requireAuthRedirect(error, "/progress")` and
  the server API request path are unchanged. Confirm `apps/web/src/lib/api-server.ts`
  and `apps/web/playwright.config.ts` are absent from the implementation diff: the test
  relies on their existing cookie-forwarding and baseURL/webServer configuration.
- Expected: zero critical/serious axe findings, valid semantics, no auth regression, and
  no changed auth/API code.
- Evidence: `VOC-087-EV-02`

## VOC-087-TEST-05 — Deterministic local validation

- Covers: `VOC-087-AC-03`
- Procedure: from the installed toolchain documented in `docs/development.md`, run:

  ```bash
  pnpm run build:packages
  API_BASE_URL=http://127.0.0.1:8080 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080 pnpm --filter @vocanova/web build
  pnpm --filter @vocanova/web exec playwright install chromium
  pnpm --filter @vocanova/web test:e2e -- progress-accessibility.spec.ts
  pnpm validate
  pnpm exec prettier --check specs/changes/VOC-087-saved-vocabulary-preview apps/web/src/app/'(app)'/progress/page.tsx apps/web/tests/e2e/mock-api-server.mjs apps/web/tests/e2e/progress-accessibility.spec.ts
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

- Expected: focused coverage and all applicable repository checks pass. Report any
  unavailable command rather than claiming it passed. The classifier reports no floor
  above R1 for the implementation paths.
- Evidence: `VOC-087-EV-03`

## VOC-087-TEST-06 — Review, hosted qualification, and rollback

- Covers: `VOC-087-AC-03`
- Procedure: in a disposable worktree, revert the exact implementation revision without
  committing and compare the three authorized paths to the pre-implementation base;
  then discard only that disposable worktree. Obtain a different-actor exact-SHA review
  and hosted CI, Governance, Security, and Quality results on the final PR revision.
  After normal merge, wait for applicable post-merge checks before issue closure.
- Expected: rollback tree equality, PASS with zero unresolved blockers, all required
  hosted checks green, normal merge evidence, passing post-merge checks, then issue #132
  closure. Any failure keeps merge or closure blocked as applicable.
- Evidence: `VOC-087-EV-03`

## Test strategy rationale

The existing stack already owns production-build Playwright coverage for Progress and a
stateful mock API. Extending that harness proves the real server-rendered output,
ordering, semantics, and responsive accessibility without adding a component/unit-test
framework or exporting presentation logic solely for tests. The direct mock-response
assertion prevents the regression case from silently ceasing to represent truncation;
the subsequent SSR render of the same rows proves the browser → Next → mock cookie
forwarding chain. `page.route` is deliberately excluded because it cannot observe the
server-component fetch. Existing `baseURL`, webServer, and `createServerApiClient`
behavior make the chain implementable within the three-file scope.
`pnpm validate` supplies the workspace baseline, while the path-triggered Quality
workflow supplies the full browser and Lighthouse qualification.
