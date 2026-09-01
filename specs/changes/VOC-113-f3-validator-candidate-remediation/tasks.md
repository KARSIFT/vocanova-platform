# VOC-113 — Tasks

## VOC-113-T00 — Correct the stopped VOC-105 validator and replacement evidence

- Requirement source: `VOC-113-D00` through `VOC-113-D09`
- Acceptance criteria: `VOC-113-AC-00` through `VOC-113-AC-07`
- Tests: `VOC-113-TEST-00` through `VOC-113-TEST-07`
- Evidence: `VOC-113-EV-00` through `VOC-113-EV-07`
- Implementation pull-request mapping: corrected revision of draft PR #209
- Risk: R4
- Status: draft; implementation prohibited

After reviewed adoption and plan merge, change exactly the VOC-105 validator and
focused test on PR #209. Govern the replacement candidate using the unchanged 12-path
manifest framing, complete corpus-wide disclosure/vocabulary/action/boundary/history
checks, exact delivery/rollback validation, and the full negative matrix. Run all
deterministic/hosted/rollback checks and obtain fresh exact-head specialist and
independent cross-model R4 reviews before a separate non-author merge.

One task is the largest safe coherent unit: validator behavior, its exhaustive test
proof, exact candidate identity, PR evidence, and full VOC-105 rollback are one
releasable control boundary. Splitting would leave either unproved policy code or a
known-invalid candidate and would add branch, coordination, elapsed-time, repeated-
check, exact-review, and bookkeeping overhead without an independent outcome.
