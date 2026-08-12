# VOC-073 — Impact Analysis

## Security and privacy

No new secret handling, credential storage, or personal-data processing is introduced.
Tests continue to use the existing `mock-api-server.mjs` fixture user and local-only
URLs (`127.0.0.1`). Accessibility fixes (labels, ARIA, contrast) do not expand what
data the pages collect or transmit.

If T02 touches `/auth/magic`, changes must remain presentation-layer only — no
alteration to token validation, consume API calls, or redirect targets. The path floor
is R3 for those files; semantic review should confirm no auth weakening.

## Data and migrations

None. No database, migration, or API schema changes are in scope.

## Analytics and accessibility

**Primary impact area.** Four entry routes gain CI-enforced WCAG 2.2 AA axe-core scans
at 360px, 430px, and 1280×720 with keyboard-reachability and non-color-only checks.

User-visible effect: any real violations discovered during implementation will change
how assistive technologies and keyboard users experience `/signin`, `/`, `/auth/magic`,
and `/settings/account` in production after the normal auto-release path.

Risk mitigations:

- Follow existing `axe-helper.ts` bar — no new suppressions.
- Fix violations in page markup/styles; do not weaken tests.
- For `/auth/magic`, scan stable error/loading states only; do not block the success
  redirect path.

Lighthouse budgets remain unchanged; this package does not add Lighthouse coverage for
these routes.

## Risks, dependencies, and evidence

- `VOC-073-R00`: **Undiscovered violations on entry pages.** The pages have not been
  scanned under the T07b harness; axe may report critical/serious findings (especially
  on `/` placeholder landmark/heading structure). Mitigation: each task runs the spec
  before merge and fixes findings in scope.
- `VOC-073-R01`: **Auth/magic scan-state ambiguity.** Success path redirects before
  scan. Mitigation: `VOC-073-DEP-01` + T02 file-header documentation; default to
  incomplete-link error state.
- `VOC-073-R02`: **Duplicate CI coverage for `/settings/account`.** Currently tested
  inside `settings-accessibility.spec.ts`. Mitigation: extract + remove duplicate per
  `VOC-073-DEP-00` default.
- `VOC-073-DEP-00`: Settings extraction decision — see `specification.md`.
- `VOC-073-DEP-01`: Auth/magic scan states — see `specification.md`.
- `VOC-073-DEP-02`: Landing placeholder scope — see `specification.md`.
- `VOC-073-EV-00` … `VOC-073-EV-04`: Task PR CI logs + local `test:e2e` output recorded
  by implementer; independent verifier binds to exact reviewed SHA.

Dependency on VOC-031 harness (Playwright config, mock API, `accessibility.yml`) —
already shipped; no new tooling install required.
