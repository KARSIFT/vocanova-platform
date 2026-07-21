# VOC-010 — Tasks

## VOC-010-T00 — Add typed spacing scale, neutral color palette, and wire both into the package entry point

- Requirement source: `VOC-010-D00`
- Acceptance criteria: `VOC-010-AC-00`, `VOC-010-AC-01`, `VOC-010-AC-02`, `VOC-010-AC-03`
- Tests: `VOC-010-TEST-00`, `VOC-010-TEST-01`, `VOC-010-TEST-02`, `VOC-010-TEST-03`
- Evidence: `VOC-010-EV-00`, `VOC-010-EV-01`, `VOC-010-EV-02`, `VOC-010-EV-03`
- Status: pending

Consolidated into a single task (originally drafted as three: T00/T01/T02).
Each task produces its own PR reviewed independently against this package's
full acceptance criteria, so splitting this tightly-coupled, three-file
change across separate PRs meant no individual PR could ever pass review
until the others also merged — a package-design defect caught by the first
real independent-review run against this package, not a limitation of the
files themselves. One task now covers all three steps:

1. Create `packages/design-tokens/src/spacing.ts` exporting a readonly
   `spacing` object with the seven keys and 4px-base values specified in
   `VOC-010-AC-00`.
2. Create `packages/design-tokens/src/colors.ts` exporting a readonly
   `neutral` object with the ten grayscale steps specified in
   `VOC-010-AC-01`.
3. Update `packages/design-tokens/src/index.ts` to re-export `spacing` (from
   `./spacing`) and `neutral` (from `./colors`), removing the stale
   "intentionally outside VOC-005" placeholder comment, per `VOC-010-AC-02`.

Scoped to preserve VOC-005's existing build/lint/typecheck wiring and
introduce no new dependency, script, or protected-path change.
