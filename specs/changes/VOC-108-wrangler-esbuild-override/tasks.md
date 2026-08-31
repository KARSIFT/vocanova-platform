# VOC-108 — Tasks

## VOC-108-T00 — Reconcile the scoped pnpm override and verify its resolution

- Requirement source: `VOC-108-D00` through `VOC-108-D06`
- Acceptance criteria: `VOC-108-AC-00` through `VOC-108-AC-04`
- Tests: `VOC-108-TEST-00` through `VOC-108-TEST-04`
- Evidence: `VOC-108-EV-00` through `VOC-108-EV-04`
- Implementation pull-request mapping: one coherent implementation PR
- Status: pending adoption

The task changes only the declared workspace override and mechanically necessary
lockfile entries. It does not alter local-stack code or controls; deterministic
resolution evidence is attached to the implementation record.
