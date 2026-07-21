# VOC-010 — Implementation Plan

## Preconditions and protected areas

Package status is `implementation-ready` and `implementation.authorized: true`
in `change.yaml`, with `authority_issue: 1` matching this package's GitHub
issue. No protected areas are touched — see `impact-analysis.md`.

## File reconciliation and implementation sequence

Existing target: `packages/design-tokens/src/index.ts` currently contains only
`export {};` and a comment stating tokens were deferred out of VOC-005. That
comment should be removed as part of this change since it is no longer
accurate once tokens are added.

Ordered steps:

1. Create `packages/design-tokens/src/spacing.ts` implementing `VOC-010-AC-00`.
2. Create `packages/design-tokens/src/colors.ts` implementing `VOC-010-AC-01`.
3. Update `packages/design-tokens/src/index.ts` to re-export both, implementing
   `VOC-010-AC-02`, removing the now-stale "intentionally outside VOC-005"
   comment.

Each step is independently reversible (revert the one file) without affecting
the others.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:packages
pnpm run typecheck:packages
pnpm run build:packages
```

Independent verification: the reviewer role re-reads this specification and
`acceptance-criteria.md` against the exact PR diff and exact commit SHA, per
`CLAUDE.md`'s required-review steps, and reports `PASS`,
`PASS WITH NON-BLOCKING FINDINGS`, or `FAIL`.

## Deployment and rollback

`release.deployment: prohibited` — this package has no release/deployment
step; merging to `develop` is the entire scope. Rollback is a plain `git
revert` of the merge commit; no data or migration rollback is applicable.
