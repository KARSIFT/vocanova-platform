# VOC-010 Implementation Plan

## Preconditions and stop conditions

The package PR contains only these nine files and `specs/README.md`. It must pass
deterministic/hosted checks and exact-SHA independent verification before authorized
human merge. Do not begin correction until canonical `develop` contains the adopted
package. Stop for renewed authority if work requires any excluded path or F2-I04.

## Stage 1 — Package adoption

1. Verify issue #39, comment `5045859897`, live `develop`, and immutable history.
2. Add the package and index entry without editing VOC-006.
3. Validate scope, YAML, links, governance structure, risk, whitespace, and rollback.
4. Publish a draft R3 PR, obtain exact-SHA independent verification, and stop for
   authorized human merge.

## Stage 2 — Later lifecycle correction

1. Fetch then-current `develop` and confirm valid stage-1 adoption.
2. Independently reproduce PR #20/#21/#22/#24 and issue #19 evidence.
3. Inventory stale lifecycle/authority claims in VOC-006 and `specs/README.md`.
4. Reconcile only those claims: completed F2-I03, exercised/exhausted authority,
   valid PR #22, abandoned PR #24, closed issue #19, and no later scope.
5. Run the complete correction validation matrix and inspect the full diff.
6. Publish a separate draft R3 PR, obtain fresh exact-SHA review, and stop for human
   merge.

## Stage 3 — Final lifecycle synchronization

After stage 2 merges, separately record exact package/correction candidate, review,
and merge evidence and the issue-closure condition. Verify and human-merge that exact
revision before issue #39 closes.

## Rollback

Before merge, close the draft and delete its branch. After merge, use a separately
governed revert or forward correction preserving immutable history. Re-run all
specification/governance checks and prove restored tree identity. No application,
dependency, data, secret, environment, deployment, or production recovery applies.
