# VOC-010 — Tasks

## VOC-010-T00 — Add typed spacing scale

- Requirement source: `VOC-010-D00`
- Acceptance criteria: `VOC-010-AC-00`
- Tests: `VOC-010-TEST-00`
- Evidence: `VOC-010-EV-00`
- Status: pending

Create `packages/design-tokens/src/spacing.ts` exporting a readonly `spacing`
object with the seven keys and 4px-base values specified in `VOC-010-AC-00`.

## VOC-010-T01 — Add typed neutral color palette

- Requirement source: `VOC-010-D00`
- Acceptance criteria: `VOC-010-AC-01`
- Tests: `VOC-010-TEST-01`
- Evidence: `VOC-010-EV-01`
- Status: pending

Create `packages/design-tokens/src/colors.ts` exporting a readonly `neutral`
object with the ten grayscale steps specified in `VOC-010-AC-01`.

## VOC-010-T02 — Wire both into the package entry point

- Requirement source: `VOC-010-D00`
- Acceptance criteria: `VOC-010-AC-02`
- Tests: `VOC-010-TEST-02`
- Evidence: `VOC-010-EV-02`
- Status: pending

Update `packages/design-tokens/src/index.ts` to re-export `spacing` (from
`./spacing`) and `neutral` (from `./colors`), removing the stale
"intentionally outside VOC-005" placeholder comment.

Tasks are scoped to preserve VOC-005's existing build/lint/typecheck wiring
and introduce no new dependency, script, or protected-path change.
