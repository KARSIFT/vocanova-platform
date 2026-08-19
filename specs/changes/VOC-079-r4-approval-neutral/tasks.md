# VOC-079 — Tasks

## VOC-079-T00 — Reconcile canonical governance and contributor guidance

- Decisions: `VOC-079-D00`, `VOC-079-D01`, `VOC-079-D03` through `VOC-079-D05`
- Acceptance: `VOC-079-AC-00`, `VOC-079-AC-01`, `VOC-079-AC-05`
- Tests: `VOC-079-TEST-00`, `VOC-079-TEST-01`, `VOC-079-TEST-05`
- Evidence: `VOC-079-EV-00`, `VOC-079-EV-01`, `VOC-079-EV-05`
- Status: pending

Update every active authority description in one coherent change. Preserve historical
records as history and remove their ability to act as current policy.

## VOC-079-T01 — Remove the R4 hard block and test the evidence gate

- Decisions: `VOC-079-D01` through `VOC-079-D03`
- Acceptance: `VOC-079-AC-01` through `VOC-079-AC-03`, `VOC-079-AC-05`
- Tests: `VOC-079-TEST-01` through `VOC-079-TEST-03`, `VOC-079-TEST-05`
- Evidence: `VOC-079-EV-01` through `VOC-079-EV-03`, `VOC-079-EV-05`
- Status: blocked-by-VOC-079-DEP-01

After the external gate is retired, ensure no active merge policy blocks R4 by class.
Implement deterministic evidence validation and both eligible/ineligible R4 fixtures.

## VOC-079-T02 — Make package drafting consistent across R0–R4

- Decisions: `VOC-079-D02`, `VOC-079-D04`
- Acceptance: `VOC-079-AC-04`, `VOC-079-AC-05`
- Tests: `VOC-079-TEST-04`, `VOC-079-TEST-05`
- Evidence: `VOC-079-EV-04`, `VOC-079-EV-05`
- Status: pending

Update templates, examples, and validation. `false` remains a documented package-local
hold; VOC-079 remains the explicit pre-transition exception.

## VOC-079-T03 — Final reconciliation, review, and activation proof

- Decisions: all
- Acceptance: all
- Tests: all
- Evidence: `VOC-079-EV-00` through `VOC-079-EV-06`
- Status: pending

Run the complete suite and semantic inventory, obtain exact-revision independent
verification, record the one-time transition approval, and prove rollback without live
system mutation.
