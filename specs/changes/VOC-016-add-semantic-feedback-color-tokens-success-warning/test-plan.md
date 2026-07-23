# VOC-016 — Test Plan

## VOC-016-TEST-00 — Feedback scale matches the exact declared values and shape

- Covers: `VOC-016-AC-00`
- Preconditions: `packages/design-tokens/src/feedback.ts` exists.
- Procedure: run `pnpm run typecheck:packages` and `pnpm run build:packages`;
  then compare the file contents against `VOC-016-AC-00`, value by value:
  1. Confirm `feedback` has exactly three top-level keys, `success`, `warning`,
     and `error`.
  2. Confirm each sub-ramp has exactly the ten keys
     `50,100,200,300,400,500,600,700,800,900` in that order — the identical key
     set as `neutral` in `colors.ts`.
  3. Compare all thirty hex values against the three acceptance tables,
     byte-for-byte (leading `#`, lowercase, six digits).
  4. Confirm each ramp is monotonic light→dark from `50` to `900`.
- Expected result: zero typecheck/build errors; all thirty values match exactly;
  all three ramps monotonic; key sets identical to `neutral`.
- Evidence: `VOC-016-EV-00`

## VOC-016-TEST-01 — Each ramp carries a WCAG 2.2 AA text-contrast-capable step

- Covers: `VOC-016-AC-01`
- Preconditions: `VOC-016-TEST-00` complete (values confirmed).
- Procedure: for each ramp's `800` and `900` step, compute the WCAG 2.x contrast
  ratio against `#ffffff` using the standard formula — linearize each sRGB channel
  (`c/255`, then `c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`), compute
  `L = 0.2126·R + 0.7152·G + 0.0722·B`, and take `(1.0 + 0.05) / (L_step + 0.05)`.
  This is a pure, reproducible calculation (a throwaway `node -e` snippet or
  equivalent — no package script or dependency is added). Confirm all six ratios
  are ≥ 4.5:1.
- Expected result: every `success`/`warning`/`error` `800` and `900` step ≥ 4.5:1
  against white, so each feedback state has an AA body-text-capable step on a light
  background. (For the planner-proposed values, all six comfortably pass; if hues
  were substituted at adoption, any `800`/`900` step below 4.5:1 fails this test
  and must be darkened before merge.)
- Evidence: `VOC-016-EV-01`

## VOC-016-TEST-02 — Entry point gains feedback without disturbing existing exports

- Covers: `VOC-016-AC-02`
- Preconditions: `VOC-016-T00` complete.
- Procedure: inspect `packages/design-tokens/src/index.ts`; confirm `feedback` is
  re-exported and that the pre-existing
  `spacing`/`neutral`/`brand`/`fontSize`/`radius`/`duration`/`easing`/`elevation`
  export lines are byte-for-byte unchanged from the merged VOC-015 state.
  Separately confirm `packages/design-tokens/src/colors.ts` (the `neutral` ramp)
  and `packages/design-tokens/src/brand.ts` (the `brand` scale) are untouched.
- Expected result: nine named exports resolve from the package entry point; no
  regression to the eight pre-existing ones; `neutral` and `brand` unchanged.
- Evidence: `VOC-016-EV-02`

## VOC-016-TEST-03 — Full deterministic check suite passes

- Covers: `VOC-016-AC-03`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:packages
  pnpm run typecheck:packages
  pnpm run build:packages
  ```
- Expected result: all three exit zero, no new findings anywhere else in the
  workspace.
- Evidence: `VOC-016-EV-03`

No security/authorization/migration/rollback test is applicable — same reasoning
as VOC-010→VOC-015 (purely additive static string literals, zero consumers). No
secrets or production data used. The `VOC-016-TEST-01` contrast check covers the
*contrast-capability* half of DOC-03 §10 that this value-only package can verify;
the "no information by color alone" half (icon/text labels) is a consuming-
component obligation and is out of scope until the tokens are consumed by a
rendered surface (see `impact-analysis.md`, `VOC-016-R04`).
