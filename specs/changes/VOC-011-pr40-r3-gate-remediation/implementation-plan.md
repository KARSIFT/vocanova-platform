# VOC-011 Implementation Plan

## Preconditions and stop conditions

This package PR changes only nine new VOC-011 files and `specs/README.md`. No
remediation begins until the exact package is independently verified, human-merged,
and its adoption lifecycle separately synchronized.

Stop for renewed authority if any stage requires an application, dependency,
governance-authority, workflow, deployment, production, activation, F2-I04, VOC-006
correction, or unrelated package change.

## Stage 0 — Package adoption and sync

1. Verify direction `5047420157`, live base, PR #40 failure evidence, and instructions.
2. Add the complete package and index entry only.
3. Run all package validation and publish a draft R3 PR.
4. Obtain exact-SHA independent review and authorized human merge.
5. Separately synchronize package candidate/review/merge evidence and authority.

## Stage 1 — Governed revert

1. Fetch then-current `develop` and confirm valid stage-0 lifecycle.
2. Derive PR #40's exact ten-path patch from Git history.
3. Reverse only that patch while preserving VOC-011 and later valid history.
4. Prove restored pre-PR-40 state for those paths and zero excluded changes.
5. Validate, publish, independently verify, and stop for human merge.

## Stage 2 — Fresh VOC-010 adoption

1. Fetch post-revert `develop` and confirm VOC-010 is absent/non-authoritative.
2. Recreate the approved complete VOC-010 package/index atomically from issue #39.
3. Treat content equivalence as evidence only; bind checks to the new candidate SHA.
4. Post a fresh independent report on the PR before authorized human merge.

## Stage 3 — Final remediation sync

Record exact VOC-011 package, revert, and fresh VOC-010 candidate/review/merge
evidence. Mark remediation complete and VOC-010 validly adopted. Only after this sync
merges may the separately scoped VOC-006 correction begin. Issue #39 remains open.

## Rollback

Before merge, close the relevant draft and delete its branch. After merge, use a
governed revert or forward correction preserving immutable failure/remediation
history. Each rollback proves reverse tree identity and re-runs all applicable checks.
No application, dependency, data, secret, environment, deployment, or production
recovery applies.
