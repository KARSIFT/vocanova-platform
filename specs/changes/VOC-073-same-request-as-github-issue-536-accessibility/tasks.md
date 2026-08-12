# VOC-073 — Tasks

None of the tasks below is implementation-authorized by this package. Adoption and
each task's own implementation authorization are separate. Tasks are ordered and
independently reviewable — one pull request per task is the default.

## VOC-073-T00 — Add `signin-accessibility.spec.ts` and fix `/signin` findings

- Requirement source: issue #536; `VOC-073-D00`
- Acceptance criteria: `VOC-073-AC-00`, `VOC-073-AC-04`
- Tests: `VOC-073-TEST-00`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-00`
- Status: pending — blocked on package adoption

Add `apps/web/tests/e2e/signin-accessibility.spec.ts` following the T07b pattern in
`onboarding-accessibility.spec.ts` / `settings-accessibility.spec.ts`:

1. `page.goto("/signin")` — no auth cookie required (public route).
2. Wait for stable render: `getByRole("heading", { name: "Sign in to Vocanova", level: 1 })`.
3. `scanForAxeViolations` → assert `criticalOrSerious` is empty (use `formatViolations`
   in the assertion message).
4. `assertKeyboardReachable` with conservative `minFocusable` / `minTabStops` for the
   OAuth button, email input, submit button, and divider copy.
5. `assertNonColorOnlyFeedback` for named copy (e.g. "Choose a sign-in method",
   "Email address", "Send sign-in link").
6. Assert `testInfo.project.name` matches `/^(home-desktop-1280|mobile-360|mobile-430)$/`.

Run locally:

```bash
pnpm --filter @vocanova/web build
pnpm --filter @vocanova/web exec playwright test signin-accessibility.spec.ts
```

Fix any real critical/serious axe findings (and keyboard/non-color failures) in
`apps/web/src/app/signin/` — markup, ARIA, labels, contrast, focus styles only.
Do not change OAuth or magic-link API behavior.

Record command output (passing) in PR description; no separate evidence file required
unless the independent verifier requests one.

## VOC-073-T01 — Add `landing-accessibility.spec.ts` and fix `/` findings

- Requirement source: issue #536; `VOC-073-D00`; `VOC-073-DEP-02`
- Acceptance criteria: `VOC-073-AC-01`, `VOC-073-AC-04`
- Tests: `VOC-073-TEST-01`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-01`
- Status: pending — blocked on package adoption; may run in parallel with T00 after
  adoption

Add `apps/web/tests/e2e/landing-accessibility.spec.ts` for `apps/web/src/app/page.tsx`:

1. `page.goto("/")`.
2. Wait for visible placeholder copy (e.g. `text=Vocanova web foundation is running.`).
3. Full T07b assertion trio (axe, keyboard, non-color-only) across all three viewport
   projects.

Run:

```bash
pnpm --filter @vocanova/web exec playwright test landing-accessibility.spec.ts
```

Fix real findings in `apps/web/src/app/page.tsx` only. Respect `VOC-073-DEP-02`:
accessibility remediation on the placeholder, not a marketing rewrite. Common expected
fixes: add a page-level heading, ensure `<main>` landmark semantics, sufficient
contrast — whatever axe reports.

## VOC-073-T02 — Add `auth-magic-accessibility.spec.ts` and fix `/auth/magic` findings

- Requirement source: issue #536; `VOC-073-D00`; `VOC-073-DEP-01`
- Acceptance criteria: `VOC-073-AC-02`, `VOC-073-AC-04`
- Tests: `VOC-073-TEST-02`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-02`
- Status: pending — blocked on package adoption and `VOC-073-DEP-01` resolution

Add `apps/web/tests/e2e/auth-magic-accessibility.spec.ts` for
`apps/web/src/app/auth/magic/page.tsx`.

**Scan-state guidance (default if adoption does not override `VOC-073-DEP-01`):**

- Navigate to `/auth/magic` **without** `token` and `email` query params.
- Wait for error copy: "This sign-in link is incomplete. Please request a new one."
- Run the T07b assertion trio on that stable error surface.
- If adoption authorizes additional states (invalid-token API error, Suspense loading
  fallback), add separate `test()` blocks with file-header documentation explaining why
  each state is stable enough to scan. Do **not** assert on the success path that
  redirects to `/home`.

`mock-api-server.mjs` already returns `200` for
`POST /api/v1/auth/magic-links/consume`; use it only if scanning the API-failure state
requires a deliberate bad token — do not broaden mock behavior for unrelated routes.

Run:

```bash
pnpm --filter @vocanova/web exec playwright test auth-magic-accessibility.spec.ts
```

Fix real findings in `apps/web/src/app/auth/magic/` only. Path floor is R3 — keep
changes to accessibility remediation (ARIA, `role="alert"`, contrast, focus, heading
structure). Do not alter consume/redirect logic.

## VOC-073-T03 — Extract `settings-account-accessibility.spec.ts` and update e2e docs

- Requirement source: issue #536; `VOC-073-D00`; `VOC-073-DEP-00`
- Acceptance criteria: `VOC-073-AC-03`, `VOC-073-AC-04`
- Tests: `VOC-073-TEST-03`, `VOC-073-TEST-04`, `VOC-073-TEST-05`
- Evidence: `VOC-073-EV-03`
- Status: pending — blocked on package adoption; logically last so README reflects
  all four new files, but may run in parallel with T00–T02 if PR descriptions cross-link

1. Create `apps/web/tests/e2e/settings-account-accessibility.spec.ts` by moving the
   existing `/settings/account` test from `settings-accessibility.spec.ts` (preserve
   assertions: heading "Account", keyboard floor, non-color selectors for deletion
   copy).
2. If adoption confirms `VOC-073-DEP-00`, remove the `/settings/account` test from
   `settings-accessibility.spec.ts` and update its file-header comment to cover
   `/settings` only.
3. Update `apps/web/tests/e2e/README.md`:
   - Add `/signin`, `/`, `/auth/magic` rows to the coverage matrix (all three
     viewports).
   - List the four new spec files in the layout section.
   - Note that `/settings/account` moved from `settings-accessibility.spec.ts` to its
     own file.

Run:

```bash
pnpm --filter @vocanova/web exec playwright test settings-account-accessibility.spec.ts settings-accessibility.spec.ts
```

Fix any new or latent findings on `/settings/account` components only.

## Task ordering notes

- T00–T03 are independent once adopted; parallel dispatch is acceptable.
- T03 should land after or alongside T00–T02 so the README matrix is complete in one
  revision, but each task's PR must be self-contained and reviewable alone.
- No task may be dispatched before this package is adopted.
- Do not edit `axe-helper.ts` rule sets or `.github/workflows/accessibility.yml` unless
  a task proves it necessary; path changes under `apps/web/**` already trigger the
  workflow.
