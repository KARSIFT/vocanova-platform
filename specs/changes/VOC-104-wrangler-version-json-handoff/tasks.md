# VOC-104 — Tasks

## VOC-104-T00 — Complete and verify the version-list JSON handoff

- Requirements: `VOC-104-D00` through `VOC-104-D07`
- Acceptance: `VOC-104-AC-00` through `VOC-104-AC-05`
- Tests: `VOC-104-TEST-00` through `VOC-104-TEST-05`
- Evidence: `VOC-104-EV-00` through `VOC-104-EV-05`
- Risk: R3
- Pull requests: exactly one implementation PR after adoption
- Dependencies: exact plan adoption on `develop`
- Status: pending

Change only the workflow handoff and the focused delivery inspector/tests. Require
each version-list command to finish into its own temporary file before exact-tag
resolution, preserve the pre-promotion failure boundary and every adjacent delivery
control, run the required checks, and obtain exact-SHA specialist and independent R3
evidence. Do not perform any settings, secret, Cloudflare, dispatch, deployment,
migration, upload, promotion, rollback, traffic, production, spending, or data action.
