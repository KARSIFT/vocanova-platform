# VOC-086 — Tasks

## VOC-086-T00 — Reconcile living F2 evidence

- Status: candidate-on-adopted-base-b44c41256153cfefc40739b9e7eeb5dff6eb72ad-pending-exact-review-r4-specialist-hosted-proof-and-merge
- Requirements: `VOC-086-D00`, `D01`, `D02`, `D04`, `D05`
- Acceptance: `VOC-086-AC-00`, `AC-01`
- Tests: `VOC-086-TEST-00`, `TEST-01`, `TEST-02`
- Evidence: `VOC-086-EV-00`, `EV-01`
- Risk: R4

Update the six living surfaces plus
`scripts/foundation/voc081-f2-evidence-policy.{mjs,test.mjs}` atomically. Preserve
candidate history, exact integration proof, exclusions, and inherited holds.

## VOC-086-T01 — Make F2 status drift fail closed

- Status: blocked-on-VOC-086-T00
- Requirements: `VOC-086-D03`, `D04`, `D05`, `D06`
- Acceptance: `VOC-086-AC-01`, `AC-02`
- Tests: `VOC-086-TEST-03`, `TEST-04`
- Evidence: `VOC-086-EV-02`
- Risk: R4

Add exhaustive positive and independent negative fixtures for all designated surfaces.
Keep validation network-free and foundation-aggregated.

## VOC-086-T02 — Final verification and closure

- Status: blocked-on-VOC-086-T01
- Requirements: `VOC-086-D06`, `D07`
- Acceptance: `VOC-086-AC-03`
- Tests: `VOC-086-TEST-05`, `TEST-06`
- Evidence: `VOC-086-EV-03`
- Risk: R4

Record exact task/review/hosted/rollback evidence. Issue #131 remains open until normal
merge into `develop` and applicable post-merge checks pass.
