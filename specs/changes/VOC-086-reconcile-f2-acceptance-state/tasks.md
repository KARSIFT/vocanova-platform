# VOC-086 — Tasks

## VOC-086-T00 — Reconcile living F2 evidence

- Status: complete-exact-SHA-5f19974b44761e05a899f6ea50178eedd891d663-merged-through-PR-134
- Requirements: `VOC-086-D00`, `D01`, `D02`, `D04`, `D05`
- Acceptance: `VOC-086-AC-00`, `AC-01`
- Tests: `VOC-086-TEST-00`, `TEST-01`, `TEST-02`
- Evidence: `VOC-086-EV-00`, `EV-01`
- Risk: R4

Update the six living surfaces plus
`scripts/foundation/voc081-f2-evidence-policy.{mjs,test.mjs}` atomically. Preserve
candidate history, exact integration proof, exclusions, and inherited holds.

The reviewed head `5f19974b44761e05a899f6ea50178eedd891d663` merged as
`b0ce5b84c1530e97762c0235a094651028690d3f` through PR #134. Its distinct general and
R4 specialist reviews, hosted proof, and post-merge checks are recorded on that PR.

## VOC-086-T01 — Make F2 status drift fail closed

- Status: candidate-on-b0ce5b84c1530e97762c0235a094651028690d3f-pending-exact-review-r4-specialist-hosted-proof-and-merge
- Requirements: `VOC-086-D03`, `D04`, `D05`, `D06`
- Acceptance: `VOC-086-AC-01`, `AC-02`
- Tests: `VOC-086-TEST-03`, `TEST-04`
- Evidence: `VOC-086-EV-02`
- Risk: R4

Add exhaustive positive and independent negative fixtures for all designated surfaces.
Keep validation network-free and foundation-aggregated.

This candidate must receive fresh exact-SHA general and R4 specialist review, hosted
proof, and normal merge before T02 can begin.

## VOC-086-T02 — Final verification and closure

- Status: blocked-on-VOC-086-T01
- Requirements: `VOC-086-D06`, `D07`
- Acceptance: `VOC-086-AC-03`
- Tests: `VOC-086-TEST-05`, `TEST-06`
- Evidence: `VOC-086-EV-03`
- Risk: R4

Record exact task/review/hosted/rollback evidence. Issue #131 remains open until normal
merge into `develop` and applicable post-merge checks pass.
