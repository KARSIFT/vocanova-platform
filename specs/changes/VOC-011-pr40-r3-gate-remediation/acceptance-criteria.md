# VOC-011 Acceptance Criteria

## VOC-011-AC-01 — Package precedes remediation

The nine-file package is independently verified, human-merged, and separately
synchronized before a revert candidate is prepared.

Traceability: `R01`; `T01`, `T02`; `TEST-01`; `EV-01`, `EV-05`, `EV-06`.

## VOC-011-AC-02 — Failure evidence is exact

All PR #40 SHAs, timestamp, tree, states, check results, and zero comment/review counts
match live GitHub and Git.

Traceability: `R02`; `T03`; `TEST-02`; `EV-02`.

## VOC-011-AC-03 — No retrospective validation

No external report or historical evidence is posted/reused as PR #40 or fresh-
candidate verification.

Traceability: `R03`, `R08`; `T03`, `T07`; `TEST-03`; `EV-02`, `EV-09`.

## VOC-011-AC-04 — Exact governed revert

The revert changes exactly PR #40's ten paths, restores their pre-merge state, and
preserves VOC-011 and all unrelated history.

Traceability: `R04`, `R05`; `T04`; `TEST-04`, `TEST-05`; `EV-07`.

## VOC-011-AC-05 — Fresh adoption is separate and atomic

A new candidate from post-revert `develop` atomically adds the complete VOC-010
package and index entry without other changes.

Traceability: `R06`, `R07`; `T06`; `TEST-06`; `EV-08`.

## VOC-011-AC-06 — Fresh independent evidence precedes merge

The fresh candidate receives a new exact-SHA report recorded on its PR before an
authorized human merge.

Traceability: `R07`–`R09`; `T07`; `TEST-07`; `EV-09`.

## VOC-011-AC-07 — Lifecycle truth is synchronized

A separate final sync records exact package, revert, and fresh-adoption evidence and
truthfully enables only the later VOC-006 correction stage.

Traceability: `R10`; `T08`; `TEST-08`; `EV-10`.

## VOC-011-AC-08 — Protected exclusions hold

No application, dependency, governance-authority, workflow, deployment,
infrastructure, production, secret, release, or activation-state path changes.

Traceability: `R11`; `T05`; `TEST-09`; `EV-03`.

## VOC-011-AC-09 — Activation remains disabled

All six automation/activation values remain false or disabled throughout.

Traceability: `R09`, `R11`; `T05`; `TEST-10`; `EV-04`.

## VOC-011-AC-10 — Risk and deterministic gates pass

Each stage is at least R3 and passes governance, YAML/link, diff, exact-scope, hosted,
and reverse-apply/tree checks.

Traceability: `R12`; `T09`; `TEST-11`, `TEST-12`; `EV-05`, `EV-11`.

## VOC-011-AC-11 — Separation of duties holds

Codex does not approve/merge, and every material candidate change requires re-review.

Traceability: `R09`, `R12`; `T09`; `TEST-13`; `EV-11`.

## VOC-011-AC-12 — Issue and later work remain gated

Issue #39 stays open and no VOC-006 correction or F2-I04 work begins before valid
remediation completion.

Traceability: `R10`, `R13`; `T08`; `TEST-14`; `EV-10`, `EV-12`.
