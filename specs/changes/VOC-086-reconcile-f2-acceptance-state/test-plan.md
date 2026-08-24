# VOC-086 — Test Plan

## VOC-086-TEST-00 — Exact integration source

Verify the active record binds PR #108 head `a8694932671ad9c44fd2a97c128b14e6089e5faf`,
merge `36d526bdec83e28b17aa30a6814d42b92f058ec1`, review/hosted evidence, and post-merge
CI `32634654242`, Governance `32634654225`, and Security `32634654343`.

## VOC-086-TEST-01 — Active/history separation

Verify each designated living surface reports repository/local F2 complete while
candidate-era pending language is labelled historical rather than active.

## VOC-086-TEST-02 — Boundary preservation

Independently reject F3/A1/P1-P5 acceptance, staging/production/live claims, external
mutation, or release of VOC-080-HOLD-00/01/02.

## VOC-086-TEST-03 — Focused fail-closed fixtures

Mutate one surface and one invariant at a time: stale status, missing SHA/merge/run,
current/history conflation, later-gate promotion, hold removal, and malformed evidence.
Each fixture must fail for the intended concrete reason.

## VOC-086-TEST-04 — Aggregate contract

Prove the foundation aggregate invokes the validator exactly once and fails when its
command or a designated surface is omitted.

## VOC-086-TEST-05 — Proportional validation

Run focused Node tests/validator, foundation aggregate, `pnpm validate`, Python
governance tests, governance validator/classifier, Prettier, audit at the high threshold,
and `git diff --check`. Record unavailable checks honestly.

## VOC-086-TEST-06 — Independent and rollback proof

Obtain different-actor exact-SHA general and R4 specialist verdicts. Rehearse each task
in reverse order and the final candidate revert in disposable worktrees; compare exact
trees and remove the worktrees. Record hosted and post-merge results.
