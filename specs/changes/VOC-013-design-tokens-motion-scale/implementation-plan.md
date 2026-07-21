# VOC-013 — Implementation Plan

## Preconditions and protected areas

Package status is `implementation-ready` and `implementation.authorized: true`
in `change.yaml`, with `authority_issue: 7` matching this package's GitHub
issue. Depends on VOC-010's/VOC-011's/VOC-012's exports already merged to
`develop`. No protected areas are touched.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently exports
`spacing`, `neutral`, `fontSize`, and `radius`. All four must be preserved
unchanged.

This package is dispatched as two separate task runs, deliberately (see
`README.md` "Process note"):

**`VOC-013-T00`** (dispatched first, attempt 1):
1. Create `packages/design-tokens/src/duration.ts` implementing
   `VOC-013-AC-00` — five literal `ms` string values, taken verbatim from
   the table.

This task alone does not touch `index.ts` and does not create `easing.ts`.
The resulting PR is reviewed against the *whole package's* acceptance
criteria (`VOC-013-AC-00` through `VOC-013-AC-03`), including
`VOC-013-AC-02`, which this task alone cannot satisfy. A FAIL verdict here
is the expected, correct outcome of attempt 1 — not an implementation bug.

**Remediation (attempt 2 of `VOC-013-T00`, dispatched automatically by
`remediate.yml` on FAIL):**
2. Create `packages/design-tokens/src/easing.ts` implementing
   `VOC-013-AC-01` — four literal `cubic-bezier(...)`/`"linear"` string
   values, taken verbatim from the table.
3. Update `packages/design-tokens/src/index.ts` to add
   `export { duration } from "./duration.js";` and
   `export { easing } from "./easing.js";` (`.js` extensions required by
   this package's NodeNext module resolution) without touching the four
   existing export lines.

The attempt-2 prompt automatically includes the attempt-1 reviewer's
findings (per `implement.yml`), which should point at exactly the gap
`VOC-013-AC-02` describes.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

Independent verification: the reviewer re-checks each of the five
`duration` and four `easing` values individually against the file
contents, per `CLAUDE.md`.

## Deployment and rollback

`release.deployment: prohibited`. Rollback is a plain `git revert` of the
merge commit; nothing consumes these exports yet.
