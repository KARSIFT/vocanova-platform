# VOC-073 — Acceptance Criteria

## VOC-073-AC-00 — `/signin` has a dedicated accessibility spec that passes in CI

- Requirement source: issue #536; `VOC-073-D00`; `specification.md` `VOC-073-T00`
- Tasks: `VOC-073-T00`
- Tests: `VOC-073-TEST-00`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-00`
- Result: pending

Observable outcome: `apps/web/tests/e2e/signin-accessibility.spec.ts` exists, follows
the T07b pattern (`scanForAxeViolations` + `assertKeyboardReachable` +
`assertNonColorOnlyFeedback`), runs on all three Playwright viewport projects, waits
for a stable render signal (e.g. heading "Sign in to Vocanova"), and passes with zero
critical/serious axe-core violations. Any real violations found during implementation
are fixed in `/signin` page/components — not suppressed or skipped.

## VOC-073-AC-01 — `/` (landing) has a dedicated accessibility spec that passes in CI

- Requirement source: issue #536; `VOC-073-D00`; `specification.md` `VOC-073-T01`;
  `VOC-073-DEP-02`
- Tasks: `VOC-073-T01`
- Tests: `VOC-073-TEST-01`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-01`
- Result: pending

Observable outcome: `apps/web/tests/e2e/landing-accessibility.spec.ts` exists for
`apps/web/src/app/page.tsx`, follows the T07b pattern, runs at 360px, 430px, and
1280×720, and passes with zero critical/serious axe-core violations. Remediation stays
within accessibility fixes on the current placeholder — not a marketing rewrite unless
adoption expands `VOC-073-DEP-02`.

## VOC-073-AC-02 — `/auth/magic` has a dedicated accessibility spec that passes in CI

- Requirement source: issue #536; `VOC-073-D00`; `specification.md` `VOC-073-T02`;
  `VOC-073-DEP-01`
- Tasks: `VOC-073-T02`
- Tests: `VOC-073-TEST-02`, `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-02`
- Result: pending

Observable outcome: `apps/web/tests/e2e/auth-magic-accessibility.spec.ts` exists,
documents which stable UI state(s) it scans (per adoption decision on
`VOC-073-DEP-01`), follows the T07b pattern for those states, runs on all three
viewport projects, and passes with zero critical/serious axe-core violations. Any
required fixes to `apps/web/src/app/auth/magic/` are accessibility-only.

## VOC-073-AC-03 — `/settings/account` has its own accessibility spec; settings spec is not duplicated

- Requirement source: issue #536; `VOC-073-D00`; `specification.md` `VOC-073-T03`;
  `VOC-073-DEP-00`
- Tasks: `VOC-073-T03`
- Tests: `VOC-073-TEST-03`, `VOC-073-TEST-04`, `VOC-073-TEST-05`
- Evidence: `VOC-073-EV-03`
- Result: pending

Observable outcome: `apps/web/tests/e2e/settings-account-accessibility.spec.ts`
exists with the `/settings/account` coverage (extracted from
`settings-accessibility.spec.ts`), passes with zero critical/serious violations plus
keyboard and non-color-only checks equivalent to the prior embedded test. If adoption
confirms `VOC-073-DEP-00`, `settings-accessibility.spec.ts` retains only the
`/settings` test — no duplicate `/settings/account` test. `apps/web/tests/e2e/README.md`
coverage matrix and layout section list the four new dedicated spec files.

## VOC-073-AC-04 — Accessibility workflow runs the new specs without weakening the harness

- Requirement source: issue #536; VOC-031-T07a/T07b acceptance bar; `axe-helper.ts`
- Tasks: `VOC-073-T00`, `VOC-073-T01`, `VOC-073-T02`, `VOC-073-T03`
- Tests: `VOC-073-TEST-04`
- Evidence: `VOC-073-EV-04`
- Result: pending

Observable outcome: `.github/workflows/accessibility.yml` (no edit required if path
filters already cover `apps/web/tests/e2e/**`) runs the four new specs as part of
`pnpm --filter @vocanova/web test:e2e` on PRs touching the web app. No new axe rule
suppressions, no lowered impact threshold, and no changes to `axe-helper.ts` WCAG tag
set without explicit separate approval.
