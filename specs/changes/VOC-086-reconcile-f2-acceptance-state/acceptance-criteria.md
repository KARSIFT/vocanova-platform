# VOC-086 — Acceptance Criteria

## VOC-086-AC-00 — Active F2 truth is exact

- Requirements: `VOC-086-D00`, `D01`, `D02`
- Tasks: `VOC-086-T00`
- Tests: `VOC-086-TEST-00`, `TEST-01`
- Evidence: `VOC-086-EV-00`
- Result: candidate-implemented-pending-exact-review-hosted-proof-and-merge

All six living surfaces report repository/local F2 complete using PR #108 exact head,
merge, and post-merge evidence. Candidate-era facts remain historical and no active
field calls the satisfied integration gate pending.

## VOC-086-AC-01 — Later gates remain held

- Requirements: `VOC-086-D04`, `D05`
- Tasks: `VOC-086-T00`, `T01`
- Tests: `VOC-086-TEST-02`
- Evidence: `VOC-086-EV-01`
- Result: partially-satisfied-by-t00-candidate-pending-review-hosted-proof-and-merge-and-t01

F3, staging, A1/P1-P5 acceptance, production, deployment, and live verification remain
unclaimed; VOC-080-HOLD-00/01/02 remain held.

## VOC-086-AC-02 — Drift fails closed

- Requirements: `VOC-086-D03`
- Tasks: `VOC-086-T01`
- Tests: `VOC-086-TEST-03`, `TEST-04`
- Evidence: `VOC-086-EV-02`
- Result: pending

Deterministic, network-free fixtures independently reject a stale status, missing exact
evidence, history/current conflation, later-gate promotion, hold release, and aggregate
omission on every designated active surface.

## VOC-086-AC-03 — Final evidence is independently bound

- Requirements: `VOC-086-D06`, `D07`
- Tasks: `VOC-086-T02`
- Tests: `VOC-086-TEST-05`, `TEST-06`
- Evidence: `VOC-086-EV-03`
- Result: pending

Each exact task revision has different-actor review, applicable R4 specialist evidence,
hosted checks, reversible rollback proof, normal merge evidence, and passing final
post-merge checks before issue #131 closes.
