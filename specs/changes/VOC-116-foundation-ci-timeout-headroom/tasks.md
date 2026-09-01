# VOC-116 — Tasks

## VOC-116-T00 — Restore and prove bounded foundation timeout headroom

- Requirements: `VOC-116-D00` through `VOC-116-D10`
- Acceptance criteria: `VOC-116-AC-00` through `VOC-116-AC-07`
- Tests: `VOC-116-TEST-00` through `VOC-116-TEST-07`
- Evidence: `VOC-116-EV-00` through `VOC-116-EV-07`
- Implementation PR: one future PR after adoption
- Risk: R3
- Status: draft; implementation prohibited

After adoption, change exactly six paths in one coherent PR: set only the foundation
job cap to 20 minutes, enforce that exact value and fail-closed aggregate behavior,
add the complete negative fixture matrix, synchronize living documentation, run full
local/hosted/rollback evidence, obtain different-actor exact-revision review, and
complete issue #218 monitoring.

One task is the largest safe coherent unit. Workflow behavior, validator, tests,
documentation, rollback, and evidence share one control boundary; splitting them
would produce an unenforced or falsely documented state and add coordination,
elapsed-time, repeated-check, exact-review, and bookkeeping overhead.
