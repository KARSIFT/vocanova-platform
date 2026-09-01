# VOC-112 — Acceptance Criteria

## VOC-112-AC-00 — Existing A1 foundation is preserved

- Requirements: `VOC-112-D00`, `D05`, `D07`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-00`, `TEST-05`
- Evidence: `VOC-112-EV-00`, `EV-05`
- Result: pending adoption and implementation

The final diff adds only the remaining provider/readiness boundary, preserves the D1
schema and public `/api/v1` contract, and keeps every existing identity, session,
authorization, onboarding, account, web-shell, and P1+ boundary passing.

## VOC-112-AC-01 — Google OAuth adapter is bounded and confidential

- Requirements: `VOC-112-D01`, `D03`, `D04`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-01`, `TEST-03`
- Evidence: `VOC-112-EV-01`, `EV-03`
- Result: pending adoption and implementation

Fake-transport tests prove authorization URL, HTTPS token exchange, user-info mapping,
literal endpoints/methods/parameters/headers, no redirects, accepted token fields,
timeouts, malformed/non-2xx rejection, verified identity, safe avatar, exact
16,384/65,536-byte ceilings independent of declared length, and no secret/token/code/
raw-response disclosure. Every token and user-info success/error/declared-oversize/
chunked-oversize path cancels and releases its reader. Missing/partial config or a
disabled switch makes only that method unavailable without a call or session.

## VOC-112-AC-02 — Transactional email adapter is bounded and confidential

- Requirements: `VOC-112-D02`, `D03`, `D04`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-02`, `TEST-03`
- Evidence: `VOC-112-EV-02`, `EV-03`
- Result: pending adoption and implementation

Fake-transport tests prove validated HTTPS request construction, bounded timeout/body,
header/sender safety, no redirects, 2xx success, non-2xx/network failure, response
cancellation, and redaction. Redirects receive no bearer, recipient/header, or
magic-link payload. Public requests remain enumeration resistant; tokens remain
hashed/single-use. The existing AI/email observability-parity fixture uses the required
ASCII mailbox and preserves its 100-ms injected-test timeout/no-retry/redaction intent;
production construction explicitly passes mandatory 8,000 ms. Disabled/incomplete
config sends nothing and never falls back fake.

## VOC-112-AC-03 — Session, authorization, and web journey remain secure

- Requirements: `VOC-112-D05`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-04`, `TEST-05`
- Evidence: `VOC-112-EV-04`, `EV-05`
- Result: pending adoption and implementation

Both synthetic provider journeys issue the correct secure cookies and preserve normal
navigation/onboarding. Replay, expiry, logout reuse, disabled user, invalid CSRF,
unauthenticated access, provider error, and all two-user access attempts fail without
identity/session corruption or private-data disclosure. Auth UI accessibility passes.

## VOC-112-AC-04 — Staging acceptance is truthful and separately held

- Requirements: `VOC-112-D06`, `D09`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-06`
- Evidence: `VOC-112-EV-06`
- Result: pending adoption and implementation

The runbook contains complete exact-SHA, provider, auth, abuse, redaction, kill-switch,
and rollback procedures, but every live result is marked pending separate authority.
Its index and deterministic policy/negative tests pass. No provider setup,
setting/secret action, dispatch/deployment, test identity, or A1 completion claim occurs.

## VOC-112-AC-05 — Configuration, scope, and rollback fail closed

- Requirements: `VOC-112-D03`, `D04`, `D07`, `D09`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-03`, `TEST-07`
- Evidence: `VOC-112-EV-03`, `EV-07`
- Result: pending adoption and implementation

Staging/production switches and inherited holds remain off/held, current GitHub Actions
secret interface remains unchanged, the exact six new provider configuration/binding
names have no aliases/committed secret values, the four exact committed var literals
match delivery-policy maps/tests, mixed capability states behave independently,
generated bindings are current, and sixteen-path/secret scans pass. A disposable
reverse restores the adopted base tree without external or D1 action.

## VOC-112-AC-06 — Exact revision is independently verified

- Requirements: `VOC-112-D08`
- Task: `VOC-112-T00`
- Tests: `VOC-112-TEST-08`
- Evidence: `VOC-112-EV-08`
- Result: pending adoption and implementation

All deterministic hosted checks pass at the exact final SHA; different non-author
actors provide security/authorization specialist and independent R3 PASS verdicts;
every blocker is resolved on a newly checked SHA; a separate non-author merges.
