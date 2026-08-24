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

- Status: complete-exact-SHA-4920ac170ca1c527b00dc6e2061b86ef236dc95d-merged-through-PR-135
- Requirements: `VOC-086-D03`, `D04`, `D05`, `D06`
- Acceptance: `VOC-086-AC-01`, `AC-02`
- Tests: `VOC-086-TEST-03`, `TEST-04`
- Evidence: `VOC-086-EV-02`
- Risk: R4

Add exhaustive positive and independent negative fixtures for all designated surfaces.
Keep validation network-free and foundation-aggregated.

The final head `4920ac170ca1c527b00dc6e2061b86ef236dc95d` merged as
`568d4491c59d3393b2b68ce91a42b2554d9eb9c6` through PR #135. Its final general and R4
specialist reviews, hosted proof, and post-merge checks are recorded on that PR. Two
superseded specialist FAIL verdicts remain historical evidence and are not rewritten.

## VOC-086-T02 — Final verification and closure

- Status: final-candidate-pending-own-exact-review-r4-specialist-hosted-proof-normal-merge-postmerge-checks-and-issue-131-closure
- Requirements: `VOC-086-D06`, `D07`
- Acceptance: `VOC-086-AC-03`
- Tests: `VOC-086-TEST-05`, `TEST-06`
- Evidence: `VOC-086-EV-03`
- Risk: R4

Record exact task/review/hosted/rollback evidence. This candidate cannot contain its own
final SHA, review URLs, hosted workflow URLs, merge SHA, post-merge runs, or issue
closure URL. Those belong to expected PR #136, or the final T02 PR if its number
differs. Issue #131 remains open until normal merge into `develop` and applicable
post-merge checks pass.
