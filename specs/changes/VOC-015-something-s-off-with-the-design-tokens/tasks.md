# VOC-015 — Tasks

## VOC-015-T00 — Add typed brand color scale and wire into the package entry point

- Requirement source: `VOC-015-D00`, `VOC-015-D01`
- Acceptance criteria: `VOC-015-AC-00`, `VOC-015-AC-01`, `VOC-015-AC-02`
- Tests: `VOC-015-TEST-00`, `VOC-015-TEST-01`, `VOC-015-TEST-02`
- Evidence: `VOC-015-EV-00`, `VOC-015-EV-01`, `VOC-015-EV-02`
- Status: pending

Single task (per VOC-010/011/012/014 precedent: splitting one tightly-coupled
change across multiple per-task PRs fails review, since each PR is reviewed
against the whole package's acceptance criteria independently):

1. Create `packages/design-tokens/src/brand.ts` exporting a readonly `brand`
   object with two sub-ramps, `primary` and `secondary`, each with the exact ten
   keys and hex values in `VOC-015-AC-00`'s tables. Match the sibling files'
   exact shape (readonly, string keys quoted as in `colors.ts`).
2. Update `packages/design-tokens/src/index.ts` to add
   `export { brand } from "./brand.js";` (the `.js` extension is required by this
   package's NodeNext module resolution, as established in VOC-010), preserving
   the existing `spacing`, `neutral`, `fontSize`, `radius`, `duration`,
   `easing`, and `elevation` export lines unchanged.

Scoped to introduce no new dependency, script, or protected-path change, and to
preserve the VOC-010→VOC-014 existing exports (especially the `neutral` ramp)
exactly as they are. This task is independently implementable and reviewable in
one pull request. It carries no migration or rollback complication beyond a plain
revert.

> If the founder substitutes different brand hues at adoption
> (`VOC-015-DEP-04`), the implementer uses the substituted values in step 1; the
> two steps and their ordering are otherwise unchanged.
