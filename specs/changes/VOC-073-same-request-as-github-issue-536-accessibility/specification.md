# VOC-073 — Close Accessibility Test Coverage Gap: Specification

## Objective and requirement source

Close the Playwright + axe-core accessibility test gap reported in
[GitHub issue #536](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/536).

After VOC-031-T07b, `apps/web/tests/e2e/` scans the core learning loop but not four
entry surfaces that every learner hits before or beside that loop:

- **`/signin`** — `apps/web/src/app/signin/page.tsx` (OAuth button + magic-link
  form; highest-traffic unauthenticated entry).
- **`/`** — `apps/web/src/app/page.tsx` (root landing placeholder).
- **`/auth/magic`** — `apps/web/src/app/auth/magic/page.tsx` and
  `magic-link-page-content.tsx` (magic-link consume; client-side loading/error
  states; success redirects to `/home`).
- **`/settings/account`** — `apps/web/src/app/(app)/settings/account/page.tsx`
  (email change + account deletion; highest-stakes settings sub-screen).

Issue #536 requires four new spec files — `signin-accessibility.spec.ts`,
`landing-accessibility.spec.ts`, `auth-magic-accessibility.spec.ts`, and
`settings-account-accessibility.spec.ts` — following the same axe-core pattern as
`home-accessibility.spec.ts` and sibling T07b specs, running them, and fixing real
findings rather than assuming the pages are clean.

**Objective:** every listed route has a dedicated accessibility spec in CI
(`.github/workflows/accessibility.yml` → `pnpm --filter @vocanova/web test:e2e`)
that passes with zero critical/serious axe-core violations at 360px, 430px, and
1280×720, with keyboard-reachability and non-color-only assertions where the T07b
pattern applies.

## Confirmed findings (from repository inspection during drafting)

- `apps/web/tests/e2e/README.md` T07b coverage matrix lists nine screens; `/signin`,
  `/`, and `/auth/magic` are absent. `/settings/account` is listed but implemented
  as a second test inside `settings-accessibility.spec.ts`, not a dedicated file.
- Existing harness is complete and reusable: `axe-helper.ts` defines
  `scanForAxeViolations` (WCAG 2.2 AA tags), `assertKeyboardReachable`, and
  `assertNonColorOnlyFeedback`. `playwright.config.ts` already defines the three
  viewport projects. `mock-api-server.mjs` supports unauthenticated routes and
  `POST /api/v1/auth/magic-links/consume` for magic-link flows.
- `/signin` is a public server component with a labelled email input, OAuth button,
  and `role="alert"` status messages in `auth-forms.tsx`.
- `/` is a minimal placeholder (`<main>` with a single `<p>` — likely to surface
  landmark/heading-structure findings under axe).
- `/auth/magic` is a client component: incomplete query params render a stable error
  state; valid consume redirects to `/home` before a post-success scan is
  practical; API failure renders a stable error with a "Back to sign in" link.
- `/settings/account` already has a passing T07b-style test in
  `settings-accessibility.spec.ts` (lines 63–100 at drafting time) — extraction,
  not re-invention, is the expected deliverable for T03.

## Scope and non-goals

In scope:

- **`VOC-073-T00`**: Add `signin-accessibility.spec.ts`; run; fix any real
  critical/serious axe, keyboard, or non-color-only findings on `/signin` and its
  `_components/`.
- **`VOC-073-T01`**: Add `landing-accessibility.spec.ts`; run; fix any real findings
  on `/` (`apps/web/src/app/page.tsx`).
- **`VOC-073-T02`**: Add `auth-magic-accessibility.spec.ts`; run; fix any real
  findings on `/auth/magic` pages/components for the scan state(s) adoption
  authorizes (`VOC-073-DEP-01`).
- **`VOC-073-T03`**: Add `settings-account-accessibility.spec.ts` by extracting the
  existing `/settings/account` test from `settings-accessibility.spec.ts`; remove
  the duplicate from the settings spec if adoption confirms `VOC-073-DEP-00`; update
  `apps/web/tests/e2e/README.md` coverage matrix and layout section; fix any new or
  latent findings on `/settings/account`.

Non-goals / explicitly excluded:

- Lighthouse performance/accessibility budget expansion (separate tooling under
  `apps/web/tests/lighthouse/`).
- Functional auth-flow E2E beyond what accessibility scanning requires (covered by
  `core-loop.spec.ts` for the happy path).
- Marketing redesign of `/` or copy changes beyond what accessibility remediation
  requires (`VOC-073-DEP-02`).
- Changes to `axe-helper.ts` rule sets or global suppressions without a separate
  approved package.
- `mock-api-server.mjs` changes unless a scan state genuinely cannot be reached
  without a minimal fixture addition (must stay read-only for unrelated routes).

## Risk and protected areas

Builder assessment: primary touch is `apps/web/tests/e2e/` (new specs, README) with
conditional page/component edits only where axe or the T07b helpers fail.

Path classifier floor measured at drafting time: **R3**, established by
`apps/web/src/app/auth/magic/page.tsx` and
`apps/web/src/app/auth/magic/_components/magic-link-page-content.tsx` if T02 must
fix violations there.

This package proposes **R2** because the semantic work is test coverage plus
accessibility remediation (markup, ARIA, contrast, focus), not authentication logic,
session policy, or API contract changes. The independent verifier must re-run
`scripts/governance/classify-change-risk.sh` against each task's real file list and
may raise to R3 if fixes exceed a11y remediation.

No governance, workflow-YAML, migration, secret-handling, or infra area is in default
scope. EHR is not triggered. Under active A-003, routine R2/R3 does not require
standing technical-steward or founder approval merely for risk class; strengthened
verification still applies.

## Decisions, contradictions, security, and privacy

`VOC-073-D00` (recorded here for traceability; formal decision numbering applies
after adoption): High-traffic entry pages that VOC-031-T07b omitted must receive the
same automated axe-core bar as core-loop screens before they are treated as
accessibility-complete in CI.

No contradiction with VOC-031: T07b scoped "core-loop screens" explicitly; issue
#536 is additive coverage for entry routes, not a reinterpretation of T07a's/T07b's
closed scope.

Open questions for the reviewing human:

1. **`VOC-073-DEP-00` — Settings extraction.** When
   `settings-account-accessibility.spec.ts` lands, should the `/settings/account`
   test be removed from `settings-accessibility.spec.ts` in the same PR?
   **Recommended:** yes — one spec per screen, no duplicate CI time.
2. **`VOC-073-DEP-01` — Auth/magic scan states.** The success path redirects to
   `/home`. Which stable states must T02 scan?
   - **Minimum recommended:** incomplete link (`/auth/magic` with no `token`/`email`
     query params) → error copy + optional "Back to sign in" link.
   - **Optional at adoption:** invalid-token API error state; Suspense loading
     fallback from `page.tsx`. Document chosen states in the spec file header.
3. **`VOC-073-DEP-02` — Landing placeholder scope.** `/` currently shows foundation
   placeholder copy only. Confirm remediation is limited to accessibility fixes
   (landmarks, headings, contrast) without a product/marketing rewrite.

No new secret, credential, or personal-data handling is introduced. Tests continue
to use the existing mock API server and fixture data.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None.
- **Analytics:** None expected.
- **Accessibility:** Primary effect of this package. New CI-enforced scans on four
  routes; any failing violations must be fixed in page markup/styles/components, not
  suppressed in tests.
