# VOC-102 — Tasks

## VOC-102-T00 — Correct and verify native Fetch response decoding

- Requirements: `VOC-102-D00` through `VOC-102-D06`
- Acceptance: `VOC-102-AC-00` through `VOC-102-AC-04`
- Tests: `VOC-102-TEST-00` through `VOC-102-TEST-04`
- Evidence: `VOC-102-EV-00` through `VOC-102-EV-04`
- Risk: R3
- Pull requests: exactly one implementation PR after adoption
- Dependencies: exact plan adoption on `develop`
- Status: pending

Change only the response-decoding helper and its focused test file, preserve every
existing delivery control, run the required checks, and obtain exact-SHA specialist
and independent R3 evidence. Do not perform any settings, secret, Cloudflare,
dispatch, deployment, migration, traffic, production, spending, or data action.
