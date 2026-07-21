# VOC-013 — Test Plan

## VOC-013-TEST-00 — Duration scale matches the exact declared values

- Covers: `VOC-013-AC-00`
- Preconditions: `packages/design-tokens/src/duration.ts` exists.
- Procedure: compare each of the five `duration` values against both the
  acceptance criteria table and the actual file contents, value by value.
- Expected result: all five values match exactly, including the `ms`
  suffix.
- Evidence: `VOC-013-EV-00`

## VOC-013-TEST-01 — Easing scale matches the exact declared values

- Covers: `VOC-013-AC-01`
- Preconditions: `packages/design-tokens/src/easing.ts` exists.
- Procedure: compare each of the four `easing` values against both the
  acceptance criteria table and the actual file contents, value by value.
- Expected result: all four values match exactly, including exact
  `cubic-bezier(...)` argument formatting.
- Evidence: `VOC-013-EV-01`

## VOC-013-TEST-02 — Entry point gains duration and easing without disturbing existing exports

- Covers: `VOC-013-AC-02`
- Preconditions: `VOC-013-T01` complete.
- Procedure: inspect `packages/design-tokens/src/index.ts`; confirm both
  `duration` and `easing` are re-exported and that the pre-existing
  `spacing`/`neutral`/`fontSize`/`radius` export lines are byte-for-byte
  unchanged from the merged VOC-012 state.
- Expected result: six named exports resolve from the package entry point;
  no regression to the four pre-existing ones. A revision with only
  `duration` present does not satisfy this test.
- Evidence: `VOC-013-EV-02`

## VOC-013-TEST-03 — Full deterministic check suite passes

- Covers: `VOC-013-AC-03`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:packages
  pnpm run typecheck:packages
  pnpm run build:packages
  ```
- Expected result: all three exit zero, no new findings anywhere else in
  the workspace.
- Evidence: `VOC-013-EV-03`

No security/authorization/migration/rollback test is applicable — same
reasoning as VOC-010/011/012. No secrets or production data used.
