# VOC-009 Release Plan

## Package adoption

PR #33 adopted exact package candidate
`3a9da8ded7e79711fc5ea0b8dbc83155b23dff41` at canonical `develop` commit
`f28b670c0ea41577a91379e7d29618db38dd8a0a`. Deterministic and hosted validation
passed, exact-revision independent verification returned `PASS` in comment
`5031390973`, exact-revision founder R4 approval was recorded in comment `5032416230`,
and the authorized human merge followed those gates. Codex did not approve or merge
the package.

After this lifecycle synchronization is validly merged, package authority becomes
active only for preparation of the separate governed revert candidate. Package
adoption does not retroactively validate PR #32 and does not approve the revert.

## Revert

The next stage is a separate R4 repository-documentation PR restoring the exact PR #32 base
state for all 22 paths. It has no deployment or external release. Independent
verification and founder approval must precede its authorized human merge.

## Fresh adoption

Fresh adoption is another separate R4 PR from post-revert `develop`. It re-presents the
reviewed reconciliation with a complete equivalence/difference record. New exact-SHA
independent verification and founder approval must precede merge; no earlier evidence
is reusable.

## Technical activation and production

There is no preview requirement, staging or production deployment, vendor action,
Control Plane change, RL1/RL2 activation, automatic/autonomous merge, or autonomous
production release. Technical flags remain false/disabled.

## Evidence and closure

Package evidence is recorded in PR #33 and this lifecycle sync. Preserve PR #32 and
its `FAIL` permanently. Final lifecycle synchronization records
the package, revert, fresh adoption, all exact evidence, canonical merges, and final
document status. Issue #29 remains open until that synchronization is validly merged.

## Rollback

Each phase is repository-only and independently reversible by a governed revert to its
immediately previous consistent tree. Never rewrite history to conceal PR #32. No
schema, data, secret, vendor, environment, deployment, or production recovery applies.
