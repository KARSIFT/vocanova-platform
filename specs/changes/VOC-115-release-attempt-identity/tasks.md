# VOC-115 — Tasks

## VOC-115-T00 — Enforce durable retry-safe release-attempt state

- Requirements: `VOC-115-D00` through `VOC-115-D15`
- Acceptance criteria: `VOC-115-AC-00` through `VOC-115-AC-06`
- Tests: `VOC-115-TEST-00` through `VOC-115-TEST-09`
- Evidence: `VOC-115-EV-00` through `VOC-115-EV-09`
- Implementation: one corrected revision of draft PR #215 into `develop`
- Risk: R4
- Status: draft; prohibited pending exact reviews, adoption, bookkeeping review, and
  normal plan merge

A different builder reconciles exactly 27 paths and implements the pure validator/test.
The outcome covers atomic target selection and same-target coalescence, the held
no-bypass ruleset prerequisite, SHA-bound attempts, exact capture/stable schemas,
two-pass reconstruction, stale terminal, multiplicity cleanup, actor/crash boundaries,
immutable same-D retry, release topology, rollback, and monitoring.

One task/PR is minimum-sufficient because living policy, adopted packages, and
enforcement share one safety invariant and rollback boundary. A split creates
contradictory or unenforced current truth and disproportionate coordination/review
overhead.
