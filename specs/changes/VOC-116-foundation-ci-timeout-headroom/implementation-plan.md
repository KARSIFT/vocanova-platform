# VOC-116 — Implementation Plan

Implementation is prohibited until this exact plan revision is independently reviewed,
adopted, updated with bookkeeping, freshly reviewed as required, and normally merged.

## Technical approach

1. On a short-lived implementation branch from then-current `develop`, change only the
   foundation job scalar in `.github/workflows/ci.yml` from 15 to 20.
2. Add an exported exact foundation timeout constant/invariant to
   `workflow-policy.mjs`. Parse the top-level foundation job boundary independently of
   other jobs; require one job, one unquoted integer timeout key, and value 20.
3. Extend `workflow-policy.test.mjs` with canonical positive and isolated negative
   mutations for wrong ranges/types/cardinality/placement plus every nonsuccess
   aggregate result.
4. Synchronize the three exact living documents with the measured contract.

## Components affected

Exactly the six paths listed in `change.yaml`; no generated file, package script,
dependency, historical package, or other workflow is affected.

## Data-model, API, migration, deployment, and feature flags

None. Merge changes repository CI configuration only. It does not dispatch or deploy.
No flag, schema, data migration, GitHub setting, environment, or external action exists.

## Security controls

Preserve top-level read-only permissions, non-persisted checkout credentials, pinned
action SHAs, frozen dependency installation, current concurrency, and no secrets. The
validator remains network-free. Exact upper-bound enforcement prevents accidental
unbounded drift.

## Testing approach

Run the focused workflow-policy suite first, including one-mutant-at-a-time negatives.
Run `pnpm run ci:foundation` and require its final Node test report to show 204 passed,
zero failed/cancelled/skipped/todo. Run `pnpm validate`, governance, risk, diff, and
format checks. Hosted CI must show both `foundation` and `ci required` success below 20
minutes. Any content edit invalidates exact-revision review and requires fresh review.

## Rollback approach

Before merge, close the implementation PR for zero repository effect. After merge,
revert its complete coherent change through a normal reviewed PR; verify the six paths
equal the implementation first parent and the old 15-minute value is restored. Do not
delete or weaken tests during rollback. Rehearse reverse and reapply in a disposable
worktree before merge.

## Implementation sequence

1. Confirm exact base and clean isolated worktree.
2. Edit only six declared paths.
3. Run focused mutation tests and path/command invariants.
4. Run full foundation, workspace, governance, risk, diff, and format checks.
5. Rehearse scoped reverse/reapply and confirm clean identity.
6. Push an ordinary short-lived branch and open one implementation PR with exact binder.
7. Obtain hosted checks and different-actor exact-revision R3 PASS; remediate then repeat if needed.
8. A separate non-author may merge only the eligible exact revision.
9. Complete bounded post-merge monitoring and attach evidence to issue #218.

## Known technical risks

YAML boundary parsing can accidentally inspect another job or accept duplicate keys;
fixtures cover both. Runtime variance may still exceed 20 minutes; monitoring treats
that as new evidence, not permission to auto-expand. The reported 204 count can grow
under later adopted work; the no-omission contract remains authoritative, while a
future legitimate count change updates evidence through its own governed scope.

## Action boundaries

Ordinary branch push and PR creation after adoption are repository preparation. The
package prohibits self-review/approval/merge and all settings, secret, dispatch,
deployment, release, production, data, or live actions.
