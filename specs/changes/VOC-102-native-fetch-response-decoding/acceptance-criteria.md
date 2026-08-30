# VOC-102 — Acceptance Criteria

## VOC-102-AC-00 — Reviewed scope and authority

- Requirements: `VOC-102-D00`, `VOC-102-D06`
- Task: `VOC-102-T00`
- Tests: `VOC-102-TEST-00`
- Evidence: `VOC-102-EV-00`

Candidate `e6b102441ec6fdcf6c6e9f49c6172e49d9745276` has exact
Cloudflare/CI-security and independent R3 PASS reviews from distinct non-author
actors. VOC-102-ADOPT-01 records accountable adoption and authorizes only the
declared two-file repository implementation once this package is on `develop`.

## VOC-102-AC-01 — Native Fetch success is decoded

- Requirements: `VOC-102-D01`, `VOC-102-D04`
- Task: `VOC-102-T00`
- Tests: `VOC-102-TEST-01`
- Evidence: `VOC-102-EV-01`

With real native JSON `Response` instances for both environment endpoints, the gate
checks status and content type, decodes both bodies, validates the exact environment
projection, and returns an eligible credential-check decision with no reasons.

## VOC-102-AC-02 — Invalid responses fail closed

- Requirements: `VOC-102-D02`, `VOC-102-D04`
- Task: `VOC-102-T00`
- Tests: `VOC-102-TEST-02`
- Evidence: `VOC-102-EV-02`

Native non-2xx, non-JSON-content-type, and malformed-JSON responses each produce an
ineligible decision through the live-readback failure path. No case reaches an
environment job or includes a token, authorization header, or body content in its
reason.

## VOC-102-AC-03 — Decoded fixtures remain explicit and safe

- Requirements: `VOC-102-D03`, `VOC-102-D04`
- Task: `VOC-102-T00`
- Tests: `VOC-102-TEST-03`
- Evidence: `VOC-102-EV-03`

Injected plain decoded environment and branch-policy records remain accepted. A
response-like object, including a native `Response` with inherited `ok`, cannot use
that bypass.

## VOC-102-AC-04 — Existing delivery controls remain invariant

- Requirements: `VOC-102-D05`, `VOC-102-D06`
- Task: `VOC-102-T00`
- Tests: `VOC-102-TEST-04`
- Evidence: `VOC-102-EV-04`

The focused and complete foundation/delivery checks pass at the exact implementation
SHA; the diff contains only the two approved files; all existing negative delivery
cases and production holds remain effective; historical packages have zero diff; and
distinct non-author specialist and independent R3 reviews report no blocking finding.
