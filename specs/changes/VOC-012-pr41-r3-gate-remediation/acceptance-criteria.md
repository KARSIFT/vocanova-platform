# VOC-012 Acceptance Criteria

## VOC-012-AC-01 — Package precedes remediation

The complete nine-file package and index entry are independently verified, human-
merged, and separately synchronized before a PR #41 revert begins.

Traceability: `R01`; `T01`, `T02`; `TEST-01`; `EV-01`, `EV-05`, `EV-06`.

## VOC-012-AC-02 — Failure evidence is exact

PR #41 base, candidate, merge, timestamp, parent, tree identity, checks, zero comments,
zero reviews, and absent canonical pre-merge report match Git and live GitHub.

Traceability: `R02`, `R04`; `T03`; `TEST-02`; `EV-02`.

## VOC-012-AC-03 — No retrospective validation

No later post or historical evidence is represented as curing PR #41; the external
report remains non-reusable and PR #41 remains procedurally invalid.

Traceability: `R03`, `R04`, `R09`; `T03`, `T07`; `TEST-03`; `EV-02`.

## VOC-012-AC-04 — Exact governed revert

The separately gated revert mechanically reverses exactly PR #41's ten paths, restores
their pre-PR-41 state, and preserves VOC-012 and unrelated later history.

Traceability: `R05`, `R06`; `T04`; `TEST-04`, `TEST-05`; `EV-07`.

## VOC-012-AC-05 — Fresh adoption is separate and atomic

After revert merge, a new candidate atomically restores VOC-011's complete nine files
and index entry from then-current `develop`, without starting PR #40 remediation.

Traceability: `R07`, `R08`; `T06`; `TEST-06`; `EV-08`.

## VOC-012-AC-06 — Fresh evidence precedes merge

A new independent report identifies the exact fresh candidate and is canonically
posted before its authorized human merge. No PR #41 evidence is reused.

Traceability: `R08`, `R09`, `R14`; `T07`; `TEST-07`, `TEST-13`; `EV-09`, `EV-11`.

## VOC-012-AC-07 — Lifecycle truth is synchronized

A final separate sync records exact package, revert, fresh-adoption, verification, and
merge evidence while permanently preserving PR #41's invalid status.

Traceability: `R10`; `T08`; `TEST-08`; `EV-10`.

## VOC-012-AC-08 — Protected exclusions hold

No application, dependency, governance-authority, workflow, deployment,
infrastructure, production, secret, release, activation, VOC-010, or VOC-006 path
changes in this package candidate.

Traceability: `R11`, `R12`; `T02`, `T05`; `TEST-09`; `EV-03`, `EV-12`.

## VOC-012-AC-09 — Activation remains disabled

The transition-state file is byte-unchanged and all six automation, activation, and
production values remain false or disabled.

Traceability: `R12`; `T05`; `TEST-10`; `EV-04`.

## VOC-012-AC-10 — Risk and deterministic gates pass

Each stage is at least R3 and passes governance, YAML/link, diff, exact-scope, hosted,
and reverse-apply/tree checks.

Traceability: `R13`; `T09`; `TEST-11`, `TEST-12`; `EV-05`, `EV-11`.

## VOC-012-AC-11 — Separation of duties holds

Codex does not approve or merge; every exact candidate receives fresh independent
verification, and material changes invalidate earlier evidence.

Traceability: `R14`; `T09`; `TEST-13`; `EV-11`.

## VOC-012-AC-12 — Issue and nested work remain gated

Issue #39 stays open. PR #40 remediation, VOC-006 correction, F2-I04, deployment, and
release remain blocked until the applicable preceding remediation completes.

Traceability: `R10`, `R11`; `T08`; `TEST-14`; `EV-10`, `EV-12`.
