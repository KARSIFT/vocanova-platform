# VOC-092 — Acceptance Criteria

## VOC-092-AC-00 — Exact authority and evidence are complete before external mutation

- Requirements: `VOC-092-D00`, `D10`, `D11`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-00`, `TEST-04`
- Evidence: `VOC-092-EV-00`, `EV-04`
- Result: pending

The adopted package and implementation/promotion PRs identify exact revisions,
different non-author reviewers, complete R4 evidence, resolved blockers, and explicit
authority for each setting/deletion action; read-only automatic-merge metadata is not
misrepresented as an executor.

## VOC-092-AC-01 — Automatic merged-branch deletion is enabled and documented truthfully

- Requirements: `VOC-092-D01` through `D03`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-01`, `TEST-04`
- Evidence: `VOC-092-EV-01`, `EV-04`
- Result: pending

The live repository returns `delete_branch_on_merge: true`, the one-field mutation and
rollback payload/owner are recorded under a completed `VOC-085-HOLD-00` action record,
and every living settings description plus the truthfulness guard matches the same
fresh observation through one reviewed implementation PR.

## VOC-092-AC-02 — The exact integrated tree is promoted through a reviewed release PR

- Requirements: `VOC-092-D04`, `D05`, `D08`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-02`, `TEST-04`
- Evidence: `VOC-092-EV-02`, `EV-04`
- Result: pending

A different-actor-reviewed `develop`-to-`main` PR merges the frozen integrated tree
with an identifiable merge commit; tree equality and post-merge checks pass, and no
deployment or live action occurs.

## VOC-092-AC-03 — Only exact recoverable merged-only remote refs are deleted

- Requirements: `VOC-092-D06`, `D08`, `D09`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-03`, `TEST-04`
- Evidence: `VOC-092-EV-03`, `EV-04`
- Result: pending

The canonical manifest records every deleted branch, exact tip, merged PR/reachability
proof, and recreation path. `main`, `develop`, open-PR, ambiguous, unique, or active
refs are not deleted.

## VOC-092-AC-04 — Local cleanup preserves every dirty or unique artifact

- Requirements: `VOC-092-D07` through `D09`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-03`, `TEST-04`
- Evidence: `VOC-092-EV-03`, `EV-04`
- Result: pending

Clean disposable worktrees and merged branches are removed normally. Dirty or unique
state, including the drafting-time VOC-090 worktree and backup ref unless later proven
safe, remains intact and is explicitly reported.

## VOC-092-AC-05 — Final canonical audit closes the outcome without deployment

- Requirements: `VOC-092-D09`
- Task: `VOC-092-T00`
- Tests: `VOC-092-TEST-04`
- Evidence: `VOC-092-EV-04`
- Result: pending

Issue #151 receives final setting, PR/issue, branch/worktree, tree-equality, hosted-check,
recovery, and no-live-action evidence before closure.
