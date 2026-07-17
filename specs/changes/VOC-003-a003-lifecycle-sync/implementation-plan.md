# Implementation Plan

## File reconciliation and implementation sequence

1. Verify the exact remote `develop` base and PR #8 evidence.
2. Synchronize `a003-transition-state.yaml` and A-003 frontmatter only.
3. Reconcile stale current-state authority language while preserving history.
4. Add the complete VOC-003 package and protected R4 path coverage.
5. Update validators and named fail-closed tests for the synchronized active state.
6. Run every required local validation and inspect the exact diff.
7. Commit, push, and open an unmerged draft PR.

## Deployment and rollback

There is no deployment. Before dependent changes, rollback is a revert of the
VOC-003 commit followed by rerunning governance validation. A rollback must not
falsely claim that the historically completed A-003 activation never occurred; any
authority rollback requires a separately governed R4 change.
