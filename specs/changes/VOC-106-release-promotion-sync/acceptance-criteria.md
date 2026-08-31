# VOC-106 — Acceptance Criteria

## VOC-106-AC-00 — Fresh, reviewable release promotion

- Requirement source: `VOC-106-D00`–`D02`
- Tasks: `VOC-106-T00`
- Tests: `VOC-106-TEST-00`, `VOC-106-TEST-01`
- Evidence: `VOC-106-EV-00`, `VOC-106-EV-01`
- Result: pending

The `develop` → `main` PR names this package, uses an identifiable merge commit, and
has a fresh exact source/base freeze, passing applicable checks, complete R4 evidence,
different-actor exact review, resolved blockers, and separate non-author merger. Any
movement invalidates instead of reusing evidence.

## VOC-106-AC-01 — Required post-promotion synchronization

- Requirement source: `VOC-106-D03`
- Tasks: `VOC-106-T01`
- Tests: `VOC-106-TEST-02`, `VOC-106-TEST-03`
- Evidence: `VOC-106-EV-02`, `VOC-106-EV-03`
- Result: pending

The synchronization PR uses a short-lived current-`develop` head—not permanent
`main`—merges current `main` ancestry into it, receives fresh exact review, and
merge-commits into `develop`.

## VOC-106-AC-02 — Final history and safety proof

- Requirement source: `VOC-106-D04`–`D06`
- Tasks: `VOC-106-T00`, `VOC-106-T01`
- Tests: `VOC-106-TEST-04`, `VOC-106-TEST-05`
- Evidence: `VOC-106-EV-04`, `VOC-106-EV-05`
- Result: pending

Readback proves `main` is an ancestor of `develop` and `develop` is zero commits
behind `main`; evidence records recovery commands for any automatically deleted
short-lived head and proves no setting or live-system action occurred.
