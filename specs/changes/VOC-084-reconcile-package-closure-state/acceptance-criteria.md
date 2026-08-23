# VOC-084 — Acceptance Criteria

## VOC-084-AC-00 — The closure inventory is exact and complete

- Requirements: `VOC-084-D00`, `VOC-084-D01`
- Tasks: `VOC-084-T00`
- Tests: `VOC-084-TEST-00`
- Evidence: `VOC-084-EV-00`
- Result: pending

A machine-readable inventory covers every implementation task in VOC-080 through
VOC-083 and records the applicable exact heads, PRs, merge commits, review evidence,
hosted evidence, rollback evidence, final results, and preserved failures. No
placeholder, ambiguous revision, or self-authored review is accepted. Every committed
file in the four target package directories is enumerated and classified exactly once
as `active-claim`, `historical`, or `prospective`; none is implicitly excluded.

## VOC-084-AC-01 — VOC-080 and VOC-081 active package state matches evidence

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Tasks: `VOC-084-T01`
- Tests: `VOC-084-TEST-01`
- Evidence: `VOC-084-EV-01`
- Result: pending

VOC-080 T00-T12 and AC-00-AC-11, plus VOC-081 T00-T04 and AC-00-AC-07,
are reconciled to their repository outcomes. VOC-080 live holds remain held. VOC-081
does not claim F3, A1, production, Windows-native, or live activation.

## VOC-084-AC-02 — VOC-082 and VOC-083 active package state matches evidence

- Requirements: `VOC-084-D00` through `VOC-084-D03`
- Tasks: `VOC-084-T02`
- Tests: `VOC-084-TEST-02`
- Evidence: `VOC-084-EV-02`
- Result: pending

VOC-082 T00-T01 and AC-00-AC-08, plus VOC-083 T00-T03 and AC-00-AC-05,
are reconciled to their exact integrated outcomes. Prior FAILs remain explicit and no
Cloudflare, Sentry, production, launch, or broader orchestration outcome is claimed.

## VOC-084-AC-03 — Closure consistency fails closed locally

- Requirements: `VOC-084-D01`, `VOC-084-D03`, `VOC-084-D04`
- Tasks: `VOC-084-T03`
- Tests: `VOC-084-TEST-03`, `VOC-084-TEST-04`
- Evidence: `VOC-084-EV-03`
- Result: pending

The foundation aggregate runs a network-free validator. Positive repository state
passes. Negative fixtures independently reject stale active status, missing evidence,
rewritten FAIL history, released/missing holds, identifier drift, placeholders, and
aggregate omission with concrete reasons. It also rejects missing, duplicate, invalid,
or content-inconsistent per-file classifications.

## VOC-084-AC-04 — Issue outcomes and unrelated settings scope remain truthful

- Requirements: `VOC-084-D02`, `VOC-084-D05`
- Tasks: `VOC-084-T04`
- Tests: `VOC-084-TEST-05`
- Evidence: `VOC-084-EV-04`
- Result: pending

After merge and passing post-merge checks, issue #85 records repository-only VOC-080
completion and the three still-held external actions; issue #118 records the closure
repair. Issue #119 remains open. No settings or live system is mutated.

## VOC-084-AC-05 — Final evidence is exact, independent, hosted, and reversible

- Requirements: all
- Tasks: `VOC-084-T04`
- Tests: `VOC-084-TEST-05`, `VOC-084-TEST-06`
- Evidence: `VOC-084-EV-05`
- Result: pending

Every task revision has proportionate deterministic validation, hosted evidence,
different-role exact-SHA review, resolved blocking findings, and reverse-order
repository rollback. The final merged `develop` revision passes applicable CI,
Governance, Quality, and Security workflows without live action.
