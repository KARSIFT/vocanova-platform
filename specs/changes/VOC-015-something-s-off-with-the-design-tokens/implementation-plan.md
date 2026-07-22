# VOC-015 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package is adopted and implementation is authorized: a
human sets `status`, `approval_status`, `implementation.authorized`, and records
a founder-approved implementation-ready state against issue #15 in `change.yaml`
(all at unadopted defaults in this draft), and confirms or replaces the proposed
brand hue values (`VOC-015-DEP-04`). Depends on the VOC-010→VOC-014 exports
already merged to `develop` (present at authoring time). No protected areas are
touched.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently exports
`spacing` (from `./spacing.js`), `neutral` (from `./colors.js`), `fontSize`
(from `./typography.js`), `radius` (from `./radius.js`), `duration` (from
`./duration.js`), `easing` (from `./easing.js`), and `elevation` (from
`./elevation.js`). All seven must be preserved unchanged. The existing
`neutral` ramp in `packages/design-tokens/src/colors.ts` must not be modified —
`brand` is a new, separate file.

New target: `packages/design-tokens/src/brand.ts` does not yet exist; it is
created fresh.

Ordered steps (single task, `VOC-015-T00`):

1. Create `packages/design-tokens/src/brand.ts` implementing `VOC-015-AC-00` — a
   readonly `brand` object with two sub-ramps, `primary` and `secondary`, each
   with the ten literal hex values from the acceptance tables, no computation.
   Match the sibling files' exact shape, e.g. (proposed values —
   `VOC-015-DEP-04`):
   ```ts
   export const brand: Readonly<
     Record<string, Readonly<Record<string, string>>>
   > = {
     primary: {
       "50": "#eff6ff",
       "100": "#dbeafe",
       "200": "#bfdbfe",
       "300": "#93c5fd",
       "400": "#60a5fa",
       "500": "#3b82f6",
       "600": "#2563eb",
       "700": "#1d4ed8",
       "800": "#1e40af",
       "900": "#1e3a8a",
     },
     secondary: {
       "50": "#f5f3ff",
       "100": "#ede9fe",
       "200": "#ddd6fe",
       "300": "#c4b5fd",
       "400": "#a78bfa",
       "500": "#8b5cf6",
       "600": "#7c3aed",
       "700": "#6d28d9",
       "800": "#5b21b6",
       "900": "#4c1d95",
     },
   };
   ```
   (The exact `Readonly<...>` line-wrapping is illustrative; the implementer
   should let `prettier` format it. If the founder substituted different hues at
   adoption, use those values instead.)
2. Update `packages/design-tokens/src/index.ts` to add
   `export { brand } from "./brand.js";` (`.js` extension required by this
   package's NodeNext module resolution, as established in VOC-010) without
   touching the seven existing export lines.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

(Optionally `pnpm run format:check` to confirm formatting, since `packages` is in
the prettier target set.)

Independent verification: the reviewer re-checks each of the twenty `brand`
values in `VOC-015-AC-00`'s tables individually against the file contents,
byte-for-byte, confirms both ramps are monotonic and key-aligned with `neutral`,
and confirms the seven pre-existing exports and the `neutral` ramp are unchanged,
per `CLAUDE.md`. The verifier binds its verdict to the exact reviewed commit SHA
and confirms the implementer did not self-approve or self-merge.

## Deployment and rollback

`release.deployment: prohibited`. Rollback is a plain `git revert` of the merge
commit; nothing consumes these exports yet. Last-known-good reference is
`develop` at this package's (adoption-time) `base_sha`.
