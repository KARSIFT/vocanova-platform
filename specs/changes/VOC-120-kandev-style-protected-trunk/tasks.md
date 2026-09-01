# VOC-120 — Tasks

## VOC-120-T01 — Prepare and activate protected-trunk controls

- Requirements: `VOC-120-D00` through `VOC-120-D13`
- Acceptance criteria: `VOC-120-AC-01`, `VOC-120-AC-03`, `VOC-120-AC-04`,
  `VOC-120-AC-05`, `VOC-120-AC-06`, `VOC-120-AC-08`, `VOC-120-AC-09`,
  `VOC-120-AC-10`
- Tests: `VOC-120-TEST-01` through `VOC-120-TEST-05`
- Evidence: `VOC-120-EV-02`, `VOC-120-EV-03`, `VOC-120-EV-04`
- Implementation PR: `VOC-120-PR1`
- Status: blocked-on-adoption

Create the concise policy/contributor surfaces, dual-compatible path-aware aggregate
gates, review model, EHR runbook, and control inventory. Merge and promote under the
pre-change process, perform the final history synchronization, then activate and
verify native GitHub protections through the held settings action.

## VOC-120-T02 — Remove legacy governance and finalize main-only operation

- Requirements: `VOC-120-D01` through `VOC-120-D14`
- Acceptance criteria: `VOC-120-AC-01` through `VOC-120-AC-10`
- Tests: `VOC-120-TEST-01` through `VOC-120-TEST-06`
- Evidence: `VOC-120-EV-05`, `VOC-120-EV-06`
- Implementation PR: `VOC-120-PR2`
- Status: blocked-on-t01-settings-readback

From protected `main`, delete superseded package, validator, polling, duplicated
authority, release-head, and reverse-sync machinery; reconcile all remaining active
surfaces; verify complete history and rollback; and retire `develop` only after its
separate held action is satisfied.
