# VOC-073 — Test Plan

## VOC-073-TEST-00 — Sign-in accessibility spec passes locally and in CI

- Covers: `VOC-073-AC-00`
- Preconditions: `VOC-073-T00` implemented; `@vocanova/web` production build available;
  Playwright Chromium installed.
- Procedure:
  1. `pnpm run build:packages`
  2. `pnpm --filter @vocanova/web build`
  3. `pnpm --filter @vocanova/web exec playwright install --with-deps chromium` (if needed)
  4. `CI=1 pnpm --filter @vocanova/web exec playwright test signin-accessibility.spec.ts`
  5. Confirm three project runs (1280, 360, 430) and zero failures.
- Expected result: all sign-in accessibility tests pass; assertion messages name zero
  critical/serious violations.
- Evidence: `VOC-073-EV-00`

## VOC-073-TEST-01 — Landing accessibility spec passes locally and in CI

- Covers: `VOC-073-AC-01`
- Preconditions: `VOC-073-T01` implemented.
- Procedure: same build/install pattern as TEST-00, then
  `CI=1 pnpm --filter @vocanova/web exec playwright test landing-accessibility.spec.ts`.
- Expected result: all landing tests pass at three viewports.
- Evidence: `VOC-073-EV-01`

## VOC-073-TEST-02 — Auth/magic accessibility spec passes locally and in CI

- Covers: `VOC-073-AC-02`
- Preconditions: `VOC-073-T02` implemented; `VOC-073-DEP-01` scan states recorded in
  spec file header.
- Procedure: same build/install pattern, then
  `CI=1 pnpm --filter @vocanova/web exec playwright test auth-magic-accessibility.spec.ts`.
- Expected result: all authorized scan-state tests pass at three viewports.
- Evidence: `VOC-073-EV-02`

## VOC-073-TEST-03 — Settings/account dedicated spec passes; settings spec still passes

- Covers: `VOC-073-AC-03`
- Preconditions: `VOC-073-T03` implemented.
- Procedure:
  1. `CI=1 pnpm --filter @vocanova/web exec playwright test settings-account-accessibility.spec.ts`
  2. `CI=1 pnpm --filter @vocanova/web exec playwright test settings-accessibility.spec.ts`
  3. Confirm `settings-accessibility.spec.ts` contains only `/settings` coverage if
     `VOC-073-DEP-00` option (remove duplicate) was adopted.
- Expected result: both specs pass; no duplicate `/settings/account` test remains when
  extraction option is chosen.
- Evidence: `VOC-073-EV-03`

## VOC-073-TEST-04 — Full accessibility suite includes new specs (CI parity)

- Covers: `VOC-073-AC-04`
- Preconditions: all four tasks merged (or the task under review plus already-merged
  siblings for partial verification).
- Procedure:
  1. `CI=1 pnpm --filter @vocanova/web test:e2e` (same entry point as
     `.github/workflows/accessibility.yml`).
  2. Confirm output lists the four new spec files among executed tests.
  3. Confirm `axe-helper.ts` WCAG tag set unchanged (grep `WCAG_22_AA_TAGS`).
- Expected result: full suite green; harness bar unchanged.
- Evidence: `VOC-073-EV-04`

## VOC-073-TEST-05 — e2e README documents updated coverage matrix

- Covers: `VOC-073-AC-03`
- Preconditions: `VOC-073-T03` README edits landed.
- Procedure: read `apps/web/tests/e2e/README.md` and confirm:
  1. Matrix rows exist for `/signin`, `/`, `/auth/magic`, `/settings/account`.
  2. Layout section lists `signin-accessibility.spec.ts`,
     `landing-accessibility.spec.ts`, `auth-magic-accessibility.spec.ts`,
     `settings-account-accessibility.spec.ts`.
  3. `settings-accessibility.spec.ts` description says `/settings` only (post-extraction).
- Expected result: documentation matches implemented specs.
- Evidence: `VOC-073-EV-03`

## Independent verification commands (exact-SHA)

At independent review of each task PR, the verifier runs (or inspects CI logs for):

```bash
bash scripts/governance/classify-change-risk.sh --files-from <(git diff --name-only <base-sha> <candidate-sha>)
pnpm run build:packages
pnpm --filter @vocanova/web build
CI=1 pnpm --filter @vocanova/web test:e2e
```

Limitations: verifier must not treat a skipped Playwright install or missing Chromium
as a pass. Staging/production manual screen-reader testing is out of scope; automation
bar matches VOC-031-T07b.
