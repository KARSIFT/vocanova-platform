# VOC-012 — Tasks

## VOC-012-T00 — Add typed radius scale and wire into the package entry point

- Requirement source: `VOC-012-D00`
- Acceptance criteria: `VOC-012-AC-00`, `VOC-012-AC-01`, `VOC-012-AC-02`
- Tests: `VOC-012-TEST-00`, `VOC-012-TEST-01`, `VOC-012-TEST-02`
- Evidence: `VOC-012-EV-00`, `VOC-012-EV-01`, `VOC-012-EV-02`
- Status: pending

Single task (per VOC-010's and VOC-011's precedent: splitting one
tightly-coupled change across multiple per-task PRs fails review, since
each PR is reviewed against the whole package's acceptance criteria
independently):

1. Create `packages/design-tokens/src/radius.ts` exporting a readonly
   `radius` object with the exact six keys and values in
   `VOC-012-AC-00`'s table.
2. Update `packages/design-tokens/src/index.ts` to add
   `export { radius } from "./radius.js";`, preserving the existing
   `spacing`, `neutral`, and `fontSize` export lines unchanged.

Scoped to introduce no new dependency, script, or protected-path change, and
to preserve VOC-010's and VOC-011's existing exports exactly as they are.
