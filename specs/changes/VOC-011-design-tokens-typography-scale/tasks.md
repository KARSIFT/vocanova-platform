# VOC-011 — Tasks

## VOC-011-T00 — Add typed typography scale and wire into the package entry point

- Requirement source: `VOC-011-D00`
- Acceptance criteria: `VOC-011-AC-00`, `VOC-011-AC-01`, `VOC-011-AC-02`
- Tests: `VOC-011-TEST-00`, `VOC-011-TEST-01`, `VOC-011-TEST-02`
- Evidence: `VOC-011-EV-00`, `VOC-011-EV-01`, `VOC-011-EV-02`
- Status: pending

Single task (VOC-010 established that splitting one tightly-coupled change
across multiple per-task PRs fails review, since each PR is reviewed
against the whole package's acceptance criteria independently):

1. Create `packages/design-tokens/src/typography.ts` exporting a readonly
   `fontSize` object with the exact seven keys and values in
   `VOC-011-AC-00`'s table.
2. Update `packages/design-tokens/src/index.ts` to add
   `export { fontSize } from "./typography.js";`, preserving the existing
   `spacing` and `neutral` export lines unchanged.

Scoped to introduce no new dependency, script, or protected-path change, and
to preserve VOC-010's existing exports exactly as they are.
