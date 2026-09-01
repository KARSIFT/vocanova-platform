# VOC-113 — Tasks

## VOC-113-T00 — Correct the stopped VOC-105 validator and replacement evidence

- Requirement source: `VOC-113-D00` through `VOC-113-D10`
- Acceptance criteria: `VOC-113-AC-00` through `VOC-113-AC-08`
- Tests: `VOC-113-TEST-00` through `VOC-113-TEST-08`
- Evidence: `VOC-113-EV-00` through `VOC-113-EV-08`
- Implementation pull-request mapping: corrected revision of draft PR #209
- Risk: R4
- Status: adopted; declared repository implementation authorized after normal reviewed
  non-author plan merge

After reviewed adoption and plan merge, change exactly the VOC-105 validator and
focused test on PR #209. Govern the replacement candidate using the unchanged 12-path
manifest framing plus clean HEAD/file identity, context-bound public identifiers and
procedures, narrow F3 history/current checks, exact delivery/rollback validation, and
the full negative matrix. Run deterministic/hosted/rollback checks, obtain fresh
exact-head specialist and independent cross-model R4 reviews before a separate
non-author merge, and complete the bounded post-merge monitoring.

One task is the largest safe coherent unit: validator behavior, its exhaustive test
proof, exact candidate identity, PR evidence, and full VOC-105 rollback are one
releasable control boundary. Splitting would leave either unproved policy code or a
known-invalid candidate and would add branch, coordination, elapsed-time, repeated-
check, exact-review, and bookkeeping overhead without an independent outcome.
