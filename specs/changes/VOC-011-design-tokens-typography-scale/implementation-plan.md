# VOC-011 — Implementation Plan

## Preconditions and protected areas

Package status is `implementation-ready` and `implementation.authorized: true`
in `change.yaml`, with `authority_issue: 4` matching this package's GitHub
issue. Depends on VOC-010's `spacing`/`neutral` exports already merged to
`develop` (they are — `base_sha` postdates that merge). No protected areas
are touched.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently exports
`spacing` (from `./spacing.js`) and `neutral` (from `./colors.js`). Both
must be preserved unchanged.

Ordered steps (single task):

1. Create `packages/design-tokens/src/typography.ts` implementing
   `VOC-011-AC-00` — compute each value using the method in
   `specification.md` `VOC-011-D00`, don't estimate or round loosely.
2. Update `packages/design-tokens/src/index.ts` to add
   `export { fontSize } from "./typography.js";` (note the `.js` extension —
   required by this package's NodeNext module resolution, as established in
   VOC-010) without touching the two existing export lines.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

Independent verification: the reviewer re-checks each of the seven
`fontSize` values in `VOC-011-AC-00`'s table individually against an
independently computed reference (not a spot check), per `CLAUDE.md`.

## Deployment and rollback

`release.deployment: prohibited`. Rollback is a plain `git revert` of the
merge commit; nothing consumes these exports yet.
