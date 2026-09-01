# VOC-106 — Acceptance Criteria

## VOC-106-AC-00 — Fresh, reviewable release promotion

- Requirement source: `VOC-106-D00`–`D03`
- Tasks: `VOC-106-T00`
- Tests: `VOC-106-TEST-00`, `VOC-106-TEST-01`
- Evidence: `VOC-106-EV-00`, `VOC-106-EV-01`
- Result: pending

The `main`-targeted PR from
`release/voc-106-<frozen-develop-short-sha>` names this package and uses an
identifiable merge commit. Fresh evidence proves the head is an exact SHA/tree alias
of frozen develop, frozen main is the merge base with zero main-only commits, compare
has no extra content, and prospective/actual merge trees equal frozen develop/head.
Applicable checks, complete R4 evidence, different-actor exact review, resolved
blockers, and separate non-author merger pass. Any drift closes and abandons the
immutable attempt without deleting/rewriting it; a fresh collision-free attempt gets
complete new evidence.

## VOC-106-AC-01 — Required post-promotion synchronization

- Requirement source: `VOC-106-D04`
- Tasks: `VOC-106-T01`
- Tests: `VOC-106-TEST-02`, `VOC-106-TEST-03`
- Evidence: `VOC-106-EV-02`, `VOC-106-EV-03`
- Result: pending

The synchronization PR uses a short-lived current-`develop` head—not permanent
`main`—merges current `main` ancestry into it, receives fresh exact review, and
merge-commits into `develop`.

## VOC-106-AC-02 — Final history and safety proof

- Requirement source: `VOC-106-D05`–`D06`
- Tasks: `VOC-106-T00`, `VOC-106-T01`
- Tests: `VOC-106-TEST-04`, `VOC-106-TEST-05`
- Evidence: `VOC-106-EV-04`, `VOC-106-EV-05`
- Result: pending

Readback proves the actual release tree equals the frozen develop/head tree, both
permanent branches remain, `main` is an ancestor of `develop`, and `develop` is zero
commits behind `main`; evidence records names, exact SHAs, trees, and nonexecuted
recovery commands for both successfully merged short-lived heads and proves no
settings query/mutation, manual deletion, or live-system action occurred.
