# VOC-016 — Tasks

## VOC-016-T00 — Add typed semantic feedback color scale and wire into the package entry point

- Requirement source: `VOC-016-D00`, `VOC-016-D01`
- Acceptance criteria: `VOC-016-AC-00`, `VOC-016-AC-01`, `VOC-016-AC-02`, `VOC-016-AC-03`
- Tests: `VOC-016-TEST-00`, `VOC-016-TEST-01`, `VOC-016-TEST-02`, `VOC-016-TEST-03`
- Evidence: `VOC-016-EV-00`, `VOC-016-EV-01`, `VOC-016-EV-02`, `VOC-016-EV-03`
- Status: pending

Single task (per VOC-010/011/012/014/015 precedent: splitting one tightly-coupled
change across multiple per-task PRs fails review, since each PR is reviewed against
the whole package's acceptance criteria independently):

1. Create `packages/design-tokens/src/feedback.ts` exporting a readonly `feedback`
   object with three sub-ramps, `success`, `warning`, and `error`, each with the
   exact ten keys and hex values in `VOC-016-AC-00`'s tables. Match the sibling
   files' exact shape (readonly, string keys quoted as in `colors.ts`/`brand.ts`).
   The chosen values must satisfy the `VOC-016-AC-01` contrast property (each ramp's
   `800`/`900` step ≥4.5:1 against white).
2. Update `packages/design-tokens/src/index.ts` to add
   `export { feedback } from "./feedback.js";` (the `.js` extension is required by
   this package's NodeNext module resolution, as established in VOC-010),
   preserving the existing `spacing`, `neutral`, `brand`, `fontSize`, `radius`,
   `duration`, `easing`, and `elevation` export lines unchanged.

Scoped to introduce no new dependency, script, or protected-path change, and to
preserve the VOC-010→VOC-015 existing exports (especially the `neutral` ramp and
`brand` scale) exactly as they are. This task is independently implementable and
reviewable in one pull request. It carries no migration or rollback complication
beyond a plain revert.

> If the founder substitutes different feedback hues or a different group/sub-ramp
> name at adoption (`VOC-016-DEP-04`), the implementer uses the substituted values
> and names in steps 1–2; the two steps and their ordering are otherwise
> unchanged, and the substituted values must still pass `VOC-016-AC-01`.
