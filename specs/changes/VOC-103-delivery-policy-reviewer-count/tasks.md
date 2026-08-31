# VOC-103 — Tasks

## VOC-103-T00 — Correct and verify reviewer-rule counting

- Requirements: `VOC-103-D00` through `VOC-103-D06`
- Acceptance: `VOC-103-AC-00` through `VOC-103-AC-04`
- Tests: `VOC-103-TEST-00` through `VOC-103-TEST-04`
- Evidence: `VOC-103-EV-00` through `VOC-103-EV-04`
- Risk: R3
- Pull requests: exactly one implementation PR after adoption
- Dependencies: exact plan adoption on `develop`
- Status: pending

Change only required-reviewer selection in the delivery-policy evaluator and its
focused test file. Preserve exact reviewer and independent branch-policy validation,
run the required checks, and obtain exact-SHA specialist and independent R3 evidence.
Do not perform any settings, secret, Cloudflare, dispatch, deployment, migration,
traffic, production, spending, or data action.
