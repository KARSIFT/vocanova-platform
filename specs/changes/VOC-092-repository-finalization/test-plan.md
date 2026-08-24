# VOC-092 — Test Plan

## VOC-092-TEST-00 — Package authority and R4 contract

- Covers: `VOC-092-AC-00`
- Procedure: validate lifecycle metadata, one-task/one-implementation-PR shape, exact
  action holds, complete R4 evidence, distinct actors, reviewed SHA binding, and no
  automatic-merge executor claim.
- Expected: package remains blocked until every real prerequisite is present; risk and
  external-action authority are never inferred from each other.
- Evidence: `VOC-092-EV-00`

## VOC-092-TEST-01 — Settings mutation and truthfulness

- Covers: `VOC-092-AC-01`
- Procedure: prove every `VOC-085-HOLD-00` field, capture timestamped GET pre-state,
  apply the exact one-field PATCH, capture GET post-state, parse the YAML record, run installed settings truthfulness/foundation
  tests, and compare every living claim. Negative-check a stale `false` claim and a
  mutation claim without evidence.
- Expected: live and canonical current values are `true`, rollback is exact, historical
  snapshots remain unchanged, and inconsistent fixtures fail.
- Evidence: `VOC-092-EV-01`

## VOC-092-TEST-02 — Frozen promotion and tree equality

- Covers: `VOC-092-AC-02`
- Procedure: record exact main/develop SHAs and aggregate diff, inspect workflow
  triggers, bind review to the exact release head, monitor hosted checks, merge via PR,
  and compare post-merge tree objects and file diffs.
- Expected: the reviewed develop tree is represented exactly on main through a merge
  commit; no workflow performs deployment or live publication.
- Evidence: `VOC-092-EV-02`

## VOC-092-TEST-03 — Fail-closed remote and local cleanup

- Covers: `VOC-092-AC-03`, `VOC-092-AC-04`
- Procedure: for every candidate, record exact name/path, tip, PR state, merged/reachable
  proof, worktree porcelain status, active-process/ownership result, unique-commit
  result, action result, and recreation command. Negative fixtures include `main`,
  `develop`, open PR, no merged proof, remote ref still attached to a worktree, dirty
  index, untracked file, detached unique commit, and unique backup ref.
- Expected: only exact merged/recoverable remote refs and clean disposable local
  artifacts qualify. Every negative fixture is retained; no glob, broad recursive
  deletion, force removal/ref deletion, garbage collection, or reflog expiry occurs.
- Evidence: `VOC-092-EV-03`

## VOC-092-TEST-04 — Exact review, rollback, final audit, and closure

- Covers: `VOC-092-AC-00` through `VOC-092-AC-05`
- Procedure: run governance/classifier/diff checks; rehearse docs rollback; obtain
  exact-SHA general/R4 and specialist reviews; inspect hosted and post-merge checks;
  read back settings, PRs/issues, branches/worktrees, and main/develop trees; attach
  recovery evidence before issue closure.
- Expected: all applicable checks pass, blockers are zero, only intentional local
  exceptions remain, issue #151 closes last, and no deployment/live action occurred.
- Evidence: `VOC-092-EV-04`

## Test strategy rationale

This is repository-operations work, so direct API/Git read-backs, exact manifests,
installed governance/settings guards, exact-SHA review, and recovery rehearsal are
more relevant than application validation. If any application/shared-package path
changes, stop and return to planning rather than claiming narrower checks suffice.
