# VOC-117 — Tasks

## VOC-117-T00 — Replace the signal-test sleep with a bounded child-ready handshake

- Requirements: `VOC-117-D00` through `VOC-117-D11`
- Acceptance criteria: `VOC-117-AC-00` through `VOC-117-AC-08`
- Tests: `VOC-117-TEST-00` through `VOC-117-TEST-08`
- Evidence: `VOC-117-EV-00` through `VOC-117-EV-08`
- Implementation PR: one future PR after adoption
- Implementation paths: exactly `scripts/foundation/local-development-supervisor.test.mjs`
- Risk: R3 semantic foundation-verifier effect
- Status: draft; implementation prohibited

After adoption, add the test-only sentinel/waiter, update both parameterized signal
fixtures, add bounded readiness negatives and exact mutations, prove all supervisor
runtime/package/workflow/docs preservation surfaces unchanged, run the complete local
and hosted evidence set, obtain specialist plus independent cross-model exact-SHA R3
PASS reviews, and monitor the exact merge result. A single task is the
minimum-sufficient traceability boundary: fixture, helper, assertions, negatives,
preservation proof, and rollback must remain coherent.

The package author cannot review or adopt this plan. The future builder cannot review
its implementation; a distinct non-author actor performs the exact review and merge.
Cross-model evidence is scoped defense in depth, not authority.
