# VOC-100 — Tasks

## VOC-100-T00 — Replace the custom binder with standard environment delivery

- Requirements: `VOC-100-D00` through `VOC-100-D11`
- Acceptance criteria: `VOC-100-AC-00` through `VOC-100-AC-05`
- Tests: `VOC-100-TEST-00` through `VOC-100-TEST-07`
- Evidence: `VOC-100-EV-00` through `VOC-100-EV-05`
- Implementation pull-request mapping: ordered delivery-control PR followed after the
  separately authorized settings action by one documentation-only settings-truth PR
- Status: adopted; repository-only implementation authorized once this package is on
  `develop`; all external actions remain separately held

The task includes workflow, policy, tests, manifest, all living documentation,
sanitized one-time GitHub settings readback, full validation, exact-SHA reviews,
normal non-author merges, and a separately authorized standing staging delegation.
Task identity is traceability only and does not create external authority.

The builder must stop on scope expansion, unexpected settings state, repository or
organization secret duplication, broader token scope, paid-plan requirement,
production drift, non-synthetic data, ambiguous rollback versions, or any reviewer
blocker.
