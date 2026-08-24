# VOC-093 — Acceptance Criteria

## VOC-093-AC-00 — The implementation shape stays one package, one task, one PR

- Requirements: `VOC-093-D00`, `D09`, `D11`
- Task: `VOC-093-T00`
- Tests: `VOC-093-TEST-00`, `TEST-04`
- Evidence: `VOC-093-EV-00`, `EV-04`
- Result: pending

The adopted package, implementation PR, reviews, and merge evidence show one coherent
implementation PR into `develop`, one task, exact-SHA independent verification, zero
unresolved blockers, and no false automatic-merge claim.

## VOC-093-AC-01 — develop records current main ancestry again without changing main

- Requirements: `VOC-093-D01`, `D02`, `D03`, `D07`
- Task: `VOC-093-T00`
- Tests: `VOC-093-TEST-01`, `TEST-04`
- Evidence: `VOC-093-EV-01`, `EV-04`
- Result: pending

Implementation uses a short-lived synchronization branch from current `develop`,
merges current `main` into that branch, and merges the PR into `develop` with a merge
commit. Post-merge evidence proves `main` is an ancestor of `develop`, GitHub reports
`develop` behind `main` by `0`, and `main` itself did not move because of this
package.

## VOC-093-AC-02 — Living release/governance surfaces describe the synchronization boundary truthfully

- Requirements: `VOC-093-D04`, `D05`, `D10`
- Task: `VOC-093-T00`
- Tests: `VOC-093-TEST-02`, `TEST-04`
- Evidence: `VOC-093-EV-02`, `EV-04`
- Result: pending

Every declared living release/governance surface is updated in the same PR to require
the post-promotion synchronization loop before branch finalization is considered
complete, while still stating truthfully that no workflow promotes to `main`, no
deployment is triggered by repository history alone, and no settings action is part of
this package.

## VOC-093-AC-03 — A deterministic guard prevents future omission of the boundary

- Requirements: `VOC-093-D06`
- Task: `VOC-093-T00`
- Tests: `VOC-093-TEST-02`
- Evidence: `VOC-093-EV-02`
- Result: pending

The repository gains a minimum deterministic policy/test that fails when the living
release/governance guidance omits the required post-promotion synchronization
boundary or confuses it with settings/deployment activity.

## VOC-093-AC-04 — Existing dirty and recovery state remains untouched

- Requirements: `VOC-093-D08`, `D10`
- Task: `VOC-093-T00`
- Tests: `VOC-093-TEST-03`, `TEST-04`
- Evidence: `VOC-093-EV-03`, `EV-04`
- Result: pending

The dirty VOC-090 worktree/branch and the repository's existing recovery exceptions
remain present. No branch deletion, worktree removal, settings mutation, deployment,
or other live external action occurs.
