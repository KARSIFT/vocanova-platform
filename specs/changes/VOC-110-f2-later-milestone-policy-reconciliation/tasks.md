# VOC-110 — Tasks

## VOC-110-T00 — Reconcile F2 policy with the exact current F3 pointer

- Requirement source: `VOC-110-D00` through `VOC-110-D08`
- Acceptance criteria: `VOC-110-AC-00` through `VOC-110-AC-06`
- Tests: `VOC-110-TEST-00` through `VOC-110-TEST-06`
- Evidence: `VOC-110-EV-00` through `VOC-110-EV-06`
- Implementation pull-request mapping: one coherent implementation PR
- Risk: R3
- Status: pending review and adoption

Change only the VOC-081 validator and focused test. Preserve every immutable F2 fact,
historical boundary, false-claim/external-effect negative, and VOC-109 command-chain
test. Add exact atomic pre-VOC-105 and VOC-105 profile handling, exhaustive hybrid and
later-gate negatives, full validation/rollback proof, specialist and independent
review, and bounded first-real-integration observation. Do not edit or implement
VOC-105 and perform no external action.

One task is the minimum-sufficient unit because the parser and its positive/negative
proof form one protected replacement boundary. Splitting them would expose an
unproved validator state and duplicate branch, exact-SHA review, hosted-check,
coordination, elapsed-time, and bookkeeping overhead without a releasable or rollback-
safe boundary.
