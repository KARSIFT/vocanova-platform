# VOC-016 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package is adopted and implementation is authorized: a
human sets `status`, `approval_status`, `implementation_authorized`, and
`implementation.authorized`, and records a founder-approved implementation-ready
state against `docs/design/03-ui-ux-design.md` in `change.yaml` (all at unadopted
defaults in this draft), confirms or replaces the proposed feedback hue values and
the `feedback`/`error` naming (`VOC-016-DEP-04`), and confirms the contrast target
(`VOC-016-DEP-05`). Depends on the VOC-010→VOC-015 exports already merged to
`develop` (present at authoring time). No protected areas are touched.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently exports
`spacing` (from `./spacing.js`), `neutral` (from `./colors.js`), `brand` (from
`./brand.js`), `fontSize` (from `./typography.js`), `radius` (from `./radius.js`),
`duration` (from `./duration.js`), `easing` (from `./easing.js`), and `elevation`
(from `./elevation.js`). All eight must be preserved unchanged. The existing
`neutral` ramp (`colors.ts`) and `brand` scale (`brand.ts`) must not be modified —
`feedback` is a new, separate file.

New target: `packages/design-tokens/src/feedback.ts` does not yet exist; it is
created fresh.

Ordered steps (single task, `VOC-016-T00`):

1. Create `packages/design-tokens/src/feedback.ts` implementing `VOC-016-AC-00`
   and `VOC-016-AC-01` — a readonly `feedback` object with three sub-ramps,
   `success`, `warning`, and `error`, each with the ten literal hex values from
   the acceptance tables, no computation. Match the sibling files' exact shape
   (readonly, string keys quoted as in `colors.ts`/`brand.ts`), e.g. (proposed
   values — `VOC-016-DEP-04`):
   ```ts
   export const feedback: Readonly<
     Record<string, Readonly<Record<string, string>>>
   > = {
     success: {
       "50": "#ecfdf5",
       "100": "#d1fae5",
       "200": "#a7f3d0",
       "300": "#6ee7b7",
       "400": "#34d399",
       "500": "#10b981",
       "600": "#059669",
       "700": "#047857",
       "800": "#065f46",
       "900": "#064e3b",
     },
     warning: {
       "50": "#fffbeb",
       "100": "#fef3c7",
       "200": "#fde68a",
       "300": "#fcd34d",
       "400": "#fbbf24",
       "500": "#f59e0b",
       "600": "#d97706",
       "700": "#b45309",
       "800": "#92400e",
       "900": "#78350f",
     },
     error: {
       "50": "#fff1f2",
       "100": "#ffe4e6",
       "200": "#fecdd3",
       "300": "#fda4af",
       "400": "#fb7185",
       "500": "#f43f5e",
       "600": "#e11d48",
       "700": "#be123c",
       "800": "#9f1239",
       "900": "#881337",
     },
   };
   ```
   (The exact `Readonly<...>` line-wrapping is illustrative; let `prettier`
   format it. If the founder substituted different hues at adoption, use those
   values instead — but they must still pass the `VOC-016-AC-01` contrast check.)
2. Update `packages/design-tokens/src/index.ts` to add
   `export { feedback } from "./feedback.js";` (the `.js` extension is required by
   this package's NodeNext module resolution, as established in VOC-010) without
   touching the eight existing export lines.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

(Optionally `pnpm run format:check` to confirm formatting, since `packages` is in
the prettier target set.)

Contrast check (`VOC-016-AC-01`, no new package script/dependency): compute the
WCAG 2.x contrast ratio of each ramp's `800` and `900` step against `#ffffff`
using the standard relative-luminance formula and confirm each is ≥4.5:1. This is
a pure, reproducible calculation over the six hex values; it can be run as a
throwaway `node -e` snippet or by hand — it does **not** introduce a test runner
or dependency into the package (kept consistent with the VOC-010→VOC-015
inspection-based approach).

Independent verification: the reviewer re-checks each of the thirty `feedback`
values in `VOC-016-AC-00`'s tables individually against the file contents,
byte-for-byte, confirms all three ramps are monotonic and key-aligned with
`neutral`, independently recomputes the `VOC-016-AC-01` contrast ratios, and
confirms the eight pre-existing exports and the `neutral`/`brand` values are
unchanged, per `CLAUDE.md`. The verifier binds its verdict to the exact reviewed
commit SHA and confirms the implementer did not self-approve or self-merge.

## Deployment and rollback

`release.deployment: prohibited`. Rollback is a plain `git revert` of the merge
commit; nothing consumes these exports yet. Last-known-good reference is `develop`
at this package's (adoption-time) `base_sha`.
