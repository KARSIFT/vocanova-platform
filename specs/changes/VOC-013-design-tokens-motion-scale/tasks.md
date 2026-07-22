# VOC-013 — Tasks

Deliberately kept as two tasks instead of consolidated into one — see
`README.md` "Process note" and `specification.md` `VOC-013-D01`. This is a
one-off process experiment for this package only, to exercise
`remediate.yml`'s automatic retry-after-FAIL path. Only `VOC-013-T00` is
dispatched directly; `VOC-013-T01`'s work is expected to happen as part of
the automatic attempt-2 retry of `VOC-013-T00`, not as its own separate
dispatch.

## VOC-013-T00 — Add typed duration scale

- Requirement source: `VOC-013-D00`
- Acceptance criteria: `VOC-013-AC-00`
- Tests: `VOC-013-TEST-00`
- Evidence: `VOC-013-EV-00`
- Status: pending

1. Create `packages/design-tokens/src/duration.ts` exporting a readonly
   `duration` object with the exact five keys and values in
   `VOC-013-AC-00`'s table.

Scoped to this file only. Does not touch `index.ts` and does not create
`easing.ts` — those belong to `VOC-013-T01`. Note that the package's full
acceptance criteria (`VOC-013-AC-02` in particular) require both, so a PR
containing only this task's work is not expected to pass independent
review on its own; see `implementation-plan.md`.

## VOC-013-T01 — Add typed easing scale and wire both scales into the package entry point

- Requirement source: `VOC-013-D00`
- Acceptance criteria: `VOC-013-AC-01`, `VOC-013-AC-02`, `VOC-013-AC-03`
- Tests: `VOC-013-TEST-01`, `VOC-013-TEST-02`, `VOC-013-TEST-03`
- Evidence: `VOC-013-EV-01`, `VOC-013-EV-02`, `VOC-013-EV-03`
- Status: pending

1. Create `packages/design-tokens/src/easing.ts` exporting a readonly
   `easing` object with the exact four keys and values in
   `VOC-013-AC-01`'s table.
2. Update `packages/design-tokens/src/index.ts` to add
   `export { duration } from "./duration.js";` and
   `export { easing } from "./easing.js";`, preserving the existing
   `spacing`, `neutral`, `fontSize`, and `radius` export lines unchanged.

Scoped to introduce no new dependency, script, or protected-path change,
and to preserve VOC-010's/VOC-011's/VOC-012's existing exports exactly as
they are.
