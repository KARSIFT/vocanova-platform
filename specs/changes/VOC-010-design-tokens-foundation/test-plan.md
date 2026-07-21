# VOC-010 — Test Plan

## VOC-010-TEST-00 — Spacing scale typechecks and matches the declared values

- Covers: `VOC-010-AC-00`
- Preconditions: `packages/design-tokens/src/spacing.ts` exists.
- Procedure: run `pnpm run typecheck:packages` and `pnpm run build:packages`;
  inspect the built/typechecked `spacing` export's keys and values against
  `VOC-010-AC-00`.
- Expected result: zero typecheck/build errors; all seven keys present with
  the exact specified string values.
- Evidence: `VOC-010-EV-00`

## VOC-010-TEST-01 — Neutral palette typechecks and matches the declared values

- Covers: `VOC-010-AC-01`
- Preconditions: `packages/design-tokens/src/colors.ts` exists.
- Procedure: run `pnpm run typecheck:packages` and `pnpm run build:packages`;
  inspect the `neutral` export's ten keys and hex values against
  `VOC-010-AC-01`.
- Expected result: zero typecheck/build errors; all ten steps present as
  valid 6-digit hex strings.
- Evidence: `VOC-010-EV-01`

## VOC-010-TEST-02 — Package entry point re-exports both

- Covers: `VOC-010-AC-02`
- Preconditions: `VOC-010-T00` and `VOC-010-T01` complete.
- Procedure: inspect `packages/design-tokens/src/index.ts`; confirm
  `spacing` and `neutral` are both re-exported as named exports and no stale
  placeholder comment remains.
- Expected result: both names resolve from the package entry point.
- Evidence: `VOC-010-EV-02`

## VOC-010-TEST-03 — Full deterministic check suite passes

- Covers: `VOC-010-AC-03`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:packages
  pnpm run typecheck:packages
  pnpm run build:packages
  ```
- Expected result: all three exit zero, no new findings anywhere else in the
  workspace.
- Evidence: `VOC-010-EV-03`

No positive/negative security or authorization test is applicable — this
package has no runtime behavior, no input handling, and no authorization
surface. No migration or rollback test is applicable per `impact-analysis.md`.
Tests use no secrets and no production data.
