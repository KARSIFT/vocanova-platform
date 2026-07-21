# VOC-009 Acceptance Criteria

## VOC-009-AC-01 — Complete bounded package

All nine package files and the canonical specs index bind the exact incident,
requirements, two-stage remediation, tests, evidence, risk, gates, and rollback.

Traceability: `VOC-009-R01`–`VOC-009-R03`; `VOC-009-T01`, `VOC-009-T02`;
`VOC-009-TEST-01`; `VOC-009-EV-01`–`VOC-009-EV-03`.

## VOC-009-AC-02 — Truthful incident record

The exact PR #32 base/candidate/merge, missing pre-merge gates, retrospective `FAIL`,
founder direction, and byte-identical content finding are recorded without claiming
retroactive validation.

Traceability: `VOC-009-R02`, `VOC-009-R03`, `VOC-009-R13`; `VOC-009-T03`;
`VOC-009-TEST-02`; `VOC-009-EV-04`, `VOC-009-EV-05`.

## VOC-009-AC-03 — Non-authoritative containment

DOC-00 through DOC-12 are explicitly unavailable as implementation authority until
the full remediation sequence completes; issue #29 remains open.

Traceability: `VOC-009-R04`, `VOC-009-R15`; `VOC-009-T04`; `VOC-009-TEST-03`;
`VOC-009-EV-06`.

## VOC-009-AC-04 — Exact revert fidelity

The separately prepared revert affects exactly the PR #32 path set and restores each
resulting tree to the exact pre-PR-32 base without deleting or rewriting audit history.

Traceability: `VOC-009-R05`, `VOC-009-R06`, `VOC-009-R12`; `VOC-009-T05`;
`VOC-009-TEST-04`, `VOC-009-TEST-05`; `VOC-009-EV-07`, `VOC-009-EV-08`.

## VOC-009-AC-05 — Revert gates precede merge

The exact revert revision passes checks, independent verification, and founder R4
approval before an authorized human merge; no pending gate exists at merge time.

Traceability: `VOC-009-R07`, `VOC-009-R17`–`VOC-009-R19`; `VOC-009-T06`;
`VOC-009-TEST-06`; `VOC-009-EV-09`, `VOC-009-EV-10`.

## VOC-009-AC-06 — Fresh adoption fidelity

The fresh adoption re-presents the reviewed reconciliation after the valid revert;
every difference from PR #32 candidate `c2154042` is explicit and reviewed.

Traceability: `VOC-009-R08`–`VOC-009-R12`; `VOC-009-T07`, `VOC-009-T08`;
`VOC-009-TEST-07`, `VOC-009-TEST-08`; `VOC-009-EV-11`.

## VOC-009-AC-07 — Fresh adoption gates precede merge

The exact fresh adoption revision passes semantic/deterministic checks, independent
verification, and founder R4 approval before an authorized human merge.

Traceability: `VOC-009-R10`, `VOC-009-R11`, `VOC-009-R17`–`VOC-009-R19`;
`VOC-009-T09`; `VOC-009-TEST-09`; `VOC-009-EV-12`, `VOC-009-EV-13`.

## VOC-009-AC-08 — Evidence chain preserved

The package, both remediation PRs, retrospective failure, founder direction, exact
approvals, merges, and final lifecycle status remain traceable without reused evidence.

Traceability: `VOC-009-R03`, `VOC-009-R11`, `VOC-009-R13`, `VOC-009-R14`; `VOC-009-T10`;
`VOC-009-TEST-10`; `VOC-009-EV-14`.

## VOC-009-AC-09 — No external or protected effect

No governance, application, workflow, dependency, schema, infrastructure, secret,
data, deployment, production, release, or autonomy state changes.

Traceability: `VOC-009-R16`, `VOC-009-R19`; `VOC-009-T11`;
`VOC-009-TEST-11`; `VOC-009-EV-15`.

## VOC-009-AC-10 — Deterministic validation

Every installed applicable check passes on each exact revision, or the work stops with
the limitation truthfully recorded.

Traceability: `VOC-009-R17`; `VOC-009-T06`, `VOC-009-T09`, `VOC-009-T11`;
`VOC-009-TEST-12`; `VOC-009-EV-16`.

## VOC-009-AC-11 — Governed closure

Issue #29 closes only after the final synchronization records a valid revert and valid
fresh adoption sequence with all exact evidence.

Traceability: `VOC-009-R14`, `VOC-009-R15`; `VOC-009-T10`;
`VOC-009-TEST-13`; `VOC-009-EV-17`.

## VOC-009-AC-12 — Reversible repository-only remediation

Package, revert, fresh adoption, and synchronization changes each have an independently
reviewable repository revert and no external recovery requirement.

Traceability: `VOC-009-R20`; `VOC-009-T11`; `VOC-009-TEST-14`;
`VOC-009-EV-18`.
