# VOC-012 — Release Plan

## Release and deployment authorization

Not applicable. `release.deployment` is `prohibited` — merging to `develop`
is the entire scope.

## Preconditions, monitoring, and outcome

Exact revision: the implementation PR's head commit, bound in the
reviewer's verdict per `CLAUDE.md`. No monitoring applicable. Outcome:
this package is authorized for automatic merge if CI is green and the
independent reviewer's verdict is PASS or PASS WITH NON-BLOCKING FINDINGS
— the merge-gate's `auto_merge_enabled` switch is on for this repo and
this package's risk (R1) is below R4. The founder's "approved" comment
remains a valid merge decision regardless, at any point.

## Rollback

Trigger: post-merge discovery of a wrong `radius` value or a broken
`typecheck:packages`/`build:packages`. Mechanism: `git revert` of the merge
commit — safe and complete, nothing consumes these exports yet. Owner:
founder. Last-known-good reference: `develop` at this package's `base_sha`
(`0f55dfb419133a1ea060826d957480263a109ac0`).

## Independent verification, human approvals, and closure

Independent verification: exact-SHA reviewer verdict, per `CLAUDE.md`,
checking each of the six `radius` values individually. Closure: issue #6
closes on merge (or, since this merges to `develop` rather than `main`,
requires the same manual closure step VOC-010/VOC-011 used).
