# VOC-086 — Implementation Plan

PR #133 merged the independently reviewed and adopted plan as
`b44c41256153cfefc40739b9e7eeb5dff6eb72ad`, so repository-only implementation is
authorized. T00's exact head `5f19974b44761e05a899f6ea50178eedd891d663` received distinct
general and R4 specialist PASS reviews, hosted proof, and post-merge checks, then merged
through PR #134 as `b0ce5b84c1530e97762c0235a094651028690d3f`. T01's exact final head
`4920ac170ca1c527b00dc6e2061b86ef236dc95d` received distinct final general and R4
specialist PASS reviews, hosted proof, and post-merge checks, then merged through PR
#135 as `568d4491c59d3393b2b68ce91a42b2554d9eb9c6`. T02 is now the final candidate.

1. `VOC-086-T00`: from the adopted plan merge, atomically reconcile the six living F2
   surfaces and the existing VOC-081 evidence-validator baseline. Preserve candidate
   history and bind exact PR #108 integration/post-merge facts.
2. `VOC-086-T01`: from T00, extend the deterministic validator and focused fixtures to
   cover every designated surface and every false-current/later-gate/hold-release mode.
3. `VOC-086-T02`: from T01, inventory the exact chain, run complete proportional
   validation, rehearse reverse-order and candidate rollback in disposable worktrees,
   obtain fresh exact-SHA general and specialist review, record hosted proof on expected
   PR #136 or the final T02 PR if its number differs, merge normally, monitor post-merge
   checks, then close issue #131.

The T02 candidate records a timeless completion contract rather than a false pre-merge
completion claim: its own final SHA, exact-review URLs, hosted workflow URLs, merge SHA,
post-merge runs, and issue-closure URL cannot exist inside the T02 candidate commit.
Completion becomes effective only after those external facts are attached to the final
T02 PR and the normal merge/post-merge sequence succeeds.

Each task uses an isolated branch/worktree, a draft stacked PR, a different builder and
reviewer actor, and a separate merge actor. Reviewers receive completed evidence and may
not duplicate long suites or start background processes without a concrete need.

Any unrelated defect becomes a separate issue. No task may deploy, query or mutate live
systems/settings, use secrets/production data, promote `main`, or delete a branch.
