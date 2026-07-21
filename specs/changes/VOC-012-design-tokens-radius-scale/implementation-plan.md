# VOC-012 — Implementation Plan

## Preconditions and protected areas

Package status is `implementation-ready` and `implementation.authorized: true`
in `change.yaml`, with `authority_issue: 6` matching this package's GitHub
issue. Depends on VOC-010's and VOC-011's exports already merged to
`develop` (they are — `base_sha` postdates both merges). No protected areas
are touched.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently exports
`spacing` (from `./spacing.js`), `neutral` (from `./colors.js`), and
`fontSize` (from `./typography.js`). All three must be preserved unchanged.

Ordered steps (single task):

1. Create `packages/design-tokens/src/radius.ts` implementing
   `VOC-012-AC-00` — six literal `px` string values, taken verbatim from
   the table, no computation.
2. Update `packages/design-tokens/src/index.ts` to add
   `export { radius } from "./radius.js";` (`.js` extension required by
   this package's NodeNext module resolution, as established in VOC-010)
   without touching the three existing export lines.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

Independent verification: the reviewer re-checks each of the six `radius`
values in `VOC-012-AC-00`'s table individually against the file contents,
per `CLAUDE.md`.

## Deployment and rollback

`release.deployment: prohibited`. Rollback is a plain `git revert` of the
merge commit; nothing consumes these exports yet.
