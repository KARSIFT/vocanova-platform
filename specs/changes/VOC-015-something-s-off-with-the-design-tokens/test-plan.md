# VOC-015 — Test Plan

## VOC-015-TEST-00 — Brand scale matches the exact declared values and shape

- Covers: `VOC-015-AC-00`
- Preconditions: `packages/design-tokens/src/brand.ts` exists.
- Procedure: run `pnpm run typecheck:packages` and `pnpm run build:packages`;
  then compare the file contents against `VOC-015-AC-00`, value by value:
  1. Confirm `brand` has exactly two top-level keys, `primary` and `secondary`.
  2. Confirm each sub-ramp has exactly the ten keys
     `50,100,200,300,400,500,600,700,800,900` in that order — the identical key
     set as `neutral` in `colors.ts`.
  3. Compare all twenty hex values against the two acceptance tables,
     byte-for-byte (leading `#`, lowercase, six digits).
  4. Confirm each ramp is monotonic light→dark from `50` to `900`.
- Expected result: zero typecheck/build errors; all twenty values match exactly;
  both ramps monotonic; key sets identical to `neutral`.
- Evidence: `VOC-015-EV-00`

## VOC-015-TEST-01 — Entry point gains brand without disturbing existing exports

- Covers: `VOC-015-AC-01`
- Preconditions: `VOC-015-T00` complete.
- Procedure: inspect `packages/design-tokens/src/index.ts`; confirm `brand` is
  re-exported and that the pre-existing
  `spacing`/`neutral`/`fontSize`/`radius`/`duration`/`easing`/`elevation` export
  lines are byte-for-byte unchanged from the merged VOC-014 state. Separately
  confirm `packages/design-tokens/src/colors.ts` (the `neutral` ramp) is
  untouched.
- Expected result: eight named exports resolve from the package entry point; no
  regression to the seven pre-existing ones; `neutral` unchanged.
- Evidence: `VOC-015-EV-01`

## VOC-015-TEST-02 — Full deterministic check suite passes

- Covers: `VOC-015-AC-02`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:packages
  pnpm run typecheck:packages
  pnpm run build:packages
  ```
- Expected result: all three exit zero, no new findings anywhere else in the
  workspace.
- Evidence: `VOC-015-EV-02`

No security/authorization/migration/rollback test is applicable — same reasoning
as VOC-010→VOC-014 (purely additive static string literals, zero consumers). No
secrets or production data used. Contrast/accessibility testing is out of scope
until the tokens are consumed by a rendered surface (see `impact-analysis.md`).
