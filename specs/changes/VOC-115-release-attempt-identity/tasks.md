# VOC-115 — Tasks

## VOC-115-T00 — Correct release-attempt identity across current policy

- Requirements: `VOC-115-D00` through `VOC-115-D12`
- Acceptance criteria: `VOC-115-AC-00` through `VOC-115-AC-05`
- Tests: `VOC-115-TEST-00` through `VOC-115-TEST-07`
- Evidence: `VOC-115-EV-00` through `VOC-115-EV-07`
- Implementation mapping: one corrected revision of draft PR #215 into `develop`
- Risk: R4
- Status: draft; implementation prohibited pending exact plan reviews, adoption,
  bookkeeping review, and normal plan merge

After adoption, a different builder reconciles exactly the 25 declared paths. The
revision adds full-SHA-plus-monotonic-sequence attempt identity, atomic allocation,
exact ownership/handoff, safe collision progression, immutable abandonment, same-
develop retry, recovery, and complete positive/negative evidence while preserving
every VOC-106 topology, review, merge, sync, rollback, and external-action boundary.

One task and PR are minimum-sufficient because living policy and both adopted packages
form one attempt-identity invariant and rollback unit. Splitting would publish a
contradictory partial state and add coordination, elapsed-time, context, repeated-
check, exact-review, and bookkeeping overhead without a safe releasable boundary.
