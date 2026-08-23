# VOC-085 — Implementation Plan

## Preconditions and protected areas

No implementation begins until this plan receives a different-actor exact-SHA PASS,
the accountable adoption decision records that exact candidate, `status: adopted`,
and `implementation.authorized: true`. Adoption grants repository-only authority.

Protected areas include DOC-16, governance/settings guidance, the historical VOC-080
settings snapshot, the current-state record, the four-workflow boundary, and all
VOC-080 live-action holds.

## Ordered implementation

1. T00 adds the immutable current public-state record and verifies its fields against
   the read-only issue evidence.
2. T01 updates only active guidance and, if needed, DOC-16 metadata/history; it
   preserves historical snapshot files and labels future controls held.
3. T02 adds the smallest useful network-free truthfulness guard and negative fixtures,
   with no workflow, GitHub, or external side effects.
4. T03 performs inventory, validation, exact review, hosted proof, rollback, and
   post-merge closure recording.

Every task is a separate small draft PR, stacked on the adopted base or preceding
merged task. A reviewer that edits a revision becomes its builder; fresh checks and a
different reviewer are then required.

## Validation

Run the applicable commands, recording unavailable checks honestly:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base <base> --head HEAD
pnpm validate
python3 -m unittest discover -s tooling/governance/tests -p 'test_*.py'
git diff --check <base> HEAD
```

For T02, run the focused validator and foundation aggregate plus its negative fixtures.
Do not run slow or redundant suites in reviewers after completed exact evidence is
provided unless a specific review finding requires one.

## Independent review and hosted proof

Each task requires a different non-author reviewer bound to the exact final SHA,
concrete blocker resolution, and an explicit no-settings/no-live verdict. The PR body
records builder/reviewer provenance and exact evidence. Applicable CI, Governance,
Quality, and Security workflows are monitored; path-filtered non-runs are recorded as
not applicable, never as passing evidence. A separate non-author merge actor performs
the normal merge.

## Rollback

Rehearse reverse-order reverts in a disposable worktree and compare each tree with its
exact predecessor. If current guidance becomes inaccurate, revert the documentation
and validator commits; do not change hosted settings or attempt to repair the issue by
mutating external state. Issue #119 closure is a separate post-merge GitHub record and
must remain open until the final proof exists.
