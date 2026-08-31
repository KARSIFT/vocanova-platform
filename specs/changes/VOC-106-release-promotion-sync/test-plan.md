# VOC-106 — Test Plan

## VOC-106-TEST-00 — Release fresh-freeze and invalidation

- Covers: `VOC-106-AC-00`
- Procedure: fetch both protected refs; record SHA/tree/merge-base/divergence/compare;
  deliberately compare the recorded values after every review/check boundary.
- Expected result: evidence is exact or discarded and freshly recreated after drift.
- Evidence: `VOC-106-EV-01`

## VOC-106-TEST-01 — Reviewed release merge method and boundary

- Covers: `VOC-106-AC-00`
- Procedure: inspect exact PR metadata, required checks/reviews, merge method and
  resulting commit; inspect the PR event’s workflow outcomes.
- Expected result: merge commit only; R4 evidence complete; no deployment/dispatch or
  settings action; permanent `develop` remains safe.
- Evidence: `VOC-106-EV-01`

## VOC-106-TEST-02 — Short-lived synchronization construction

- Covers: `VOC-106-AC-01`
- Procedure: after release, fetch current refs and prove the synchronization branch
  began at current `develop`, merged current `main`, and is the PR head.
- Expected result: permanent `main` is never the PR head; a new exact freeze exists.
- Evidence: `VOC-106-EV-02`

## VOC-106-TEST-03 — Reviewed synchronization merge method

- Covers: `VOC-106-AC-01`
- Procedure: inspect exact sync PR checks, different-actor review, blocker status,
  merger identity, and merge method.
- Expected result: a separately reviewed merge commit reaches `develop`.
- Evidence: `VOC-106-EV-03`

## VOC-106-TEST-04 — Final ancestry and zero-behind proof

- Covers: `VOC-106-AC-02`
- Procedure: after synchronization, run `git merge-base --is-ancestor origin/main
origin/develop` and `git rev-list --right-only --count origin/develop...origin/main`.
- Expected result: first command exits 0 and second returns `0`.
- Evidence: `VOC-106-EV-04`

## VOC-106-TEST-05 — Scope and recoverability negative checks

- Covers: `VOC-106-AC-02`
- Procedure: read back settings/action audit and branch list; verify no settings,
  dispatch, deployment, Cloudflare/DNS, secret/data, spend, or manual deletion action
  occurred; if the short-lived head was automatically deleted, test the recorded
  recreate syntax against its known SHA without executing it.
- Expected result: only permitted repository history changes occurred.
- Evidence: `VOC-106-EV-05`
