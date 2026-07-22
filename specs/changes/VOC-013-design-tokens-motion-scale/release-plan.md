# VOC-013 — Release Plan

## Release and deployment authorization

Not applicable. `release.deployment` is `prohibited` — merging to `develop`
is the entire scope.

## Preconditions, monitoring, and outcome

Exact revision: the implementation PR's head commit, bound in the
reviewer's verdict per `CLAUDE.md`. No monitoring applicable. Outcome
owner: founder (m-e-h-r-d-a-a-d), via the merge-gate's required human
"approved" comment (`automatic_merge_allowed: false` — deliberate for this
package, see `change.yaml`).

## Rollback

Trigger: post-merge discovery of a wrong `duration`/`easing` value or a
broken `typecheck:packages`/`build:packages`. Mechanism: `git revert` of
the merge commit — safe and complete, nothing consumes these exports yet.
Owner: founder. Last-known-good reference: `develop` at this package's
`base_sha` (`0f55dfb419133a1ea060826d957480263a109ac0`).

## Independent verification, human approvals, and closure

Independent verification: exact-SHA reviewer verdict, per `CLAUDE.md`,
potentially across two attempts (`VOC-013-T00` attempt 1, expected FAIL;
attempt 2, expected PASS if the retry does the full remaining work). Merge
requires the founder's explicit "approved" comment. Closure: issue #7
closes on merge to `main`, or via the same manual-closure step VOC-010/011
used for `develop`-only merges.
