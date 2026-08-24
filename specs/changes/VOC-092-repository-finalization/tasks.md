# VOC-092 — Tasks

## VOC-092-T00 — Finalize promotion, branch lifecycle, and repository evidence

- Requirements: `VOC-092-D00` through `VOC-092-D11`
- Acceptance criteria: `VOC-092-AC-00` through `VOC-092-AC-05`
- Tests: `VOC-092-TEST-00` through `VOC-092-TEST-04`
- Evidence: `VOC-092-EV-00` through `VOC-092-EV-04`
- Risk: R4
- Implementation pull-request mapping: one settings/documentation PR into `develop`;
  the separately reviewed promotion PR is the mandatory release boundary for the same
  task, not another implementation task
- Status: pending plan adoption

In one coherent outcome, enable automatic deletion of merged branches, immediately
reconcile canonical settings truth, promote the frozen verified integrated tree to
`main`, remove exact recoverable merged-only remote refs and exact clean disposable
local artifacts, preserve dirty/unique safety exceptions, and attach the final audit
and recovery evidence before issue closure.

This is intentionally one minimum-sufficient task because all actions resolve the same
repository-finalization objective and share one operator, sequencing chain, evidence
record, and recovery boundary. More task IDs would add coordination and exact-review
overhead without creating an independently releasable or rollback-safe outcome.
