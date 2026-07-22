# VOC-012 — Test Plan

## VOC-012-TEST-00 — Radius scale matches the exact declared values

- Covers: `VOC-012-AC-00`
- Preconditions: `packages/design-tokens/src/radius.ts` exists.
- Procedure: run `pnpm run typecheck:packages` and `pnpm run build:packages`;
  compare each of the six `radius` values against both the acceptance
  criteria table and the actual file contents, value by value.
- Expected result: zero typecheck/build errors; all six values match
  exactly, including the `px` suffix.
- Evidence: `VOC-012-EV-00`

## VOC-012-TEST-01 — Entry point gains radius without disturbing existing exports

- Covers: `VOC-012-AC-01`
- Preconditions: `VOC-012-T00` complete.
- Procedure: inspect `packages/design-tokens/src/index.ts`; confirm
  `radius` is re-exported and that the pre-existing `spacing`/`neutral`/
  `fontSize` export lines are byte-for-byte unchanged from the merged
  VOC-011 state.
- Expected result: four named exports resolve from the package entry
  point; no regression to the three pre-existing ones.
- Evidence: `VOC-012-EV-01`

## VOC-012-TEST-02 — Full deterministic check suite passes

- Covers: `VOC-012-AC-02`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:packages
  pnpm run typecheck:packages
  pnpm run build:packages
  ```
- Expected result: all three exit zero, no new findings anywhere else in
  the workspace.
- Evidence: `VOC-012-EV-02`

No security/authorization/migration/rollback test is applicable — same
reasoning as VOC-010/VOC-011. No secrets or production data used.
