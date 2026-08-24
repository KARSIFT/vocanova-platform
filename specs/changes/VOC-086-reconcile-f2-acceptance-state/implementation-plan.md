# VOC-086 — Implementation Plan

PR #133 merged the independently reviewed and adopted plan as
`b44c41256153cfefc40739b9e7eeb5dff6eb72ad`, so repository-only implementation is
authorized. T00 is now a candidate pending fresh exact-revision general and R4
specialist review, hosted proof, and normal merge; T01 and T02 remain blocked on their
predecessors.

1. `VOC-086-T00`: from the adopted plan merge, atomically reconcile the six living F2
   surfaces and the existing VOC-081 evidence-validator baseline. Preserve candidate
   history and bind exact PR #108 integration/post-merge facts.
2. `VOC-086-T01`: from T00, extend the deterministic validator and focused fixtures to
   cover every designated surface and every false-current/later-gate/hold-release mode.
3. `VOC-086-T02`: from T01, inventory the exact chain, run complete proportional
   validation, rehearse reverse-order and candidate rollback in disposable worktrees,
   obtain fresh exact-SHA general and specialist review, record hosted proof, merge
   normally, monitor post-merge checks, then close issue #131.

Each task uses an isolated branch/worktree, a draft stacked PR, a different builder and
reviewer actor, and a separate merge actor. Reviewers receive completed evidence and may
not duplicate long suites or start background processes without a concrete need.

Any unrelated defect becomes a separate issue. No task may deploy, query or mutate live
systems/settings, use secrets/production data, promote `main`, or delete a branch.
