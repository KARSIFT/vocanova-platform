# VOC-112 — Test Plan

No test contacts Google, an email provider, Cloudflare, GitHub settings, or a live
endpoint. No fixture/evidence contains a **real** provider response, delivered email,
credential, token, code, personal email/address data, account identifier, Worker
version, or learner data. Required synthetic JSON responses, opaque bearers/codes, and
`example.test` identities are allowed only in local fake-transport fixtures and must be
visibly synthetic.

## VOC-112-TEST-00 — Baseline and contract preservation

- Covers: `VOC-112-AC-00`
- Procedure: inventory the adopted base; run migration replay, OpenAPI/client drift,
  identity parity, and exact schema/migration diff checks before and after.
- Expected: no D1 migration, public contract, DTO, client, or P1+ expansion; all prior
  identity/account behavior remains passing.
- Evidence: `VOC-112-EV-00`

## VOC-112-TEST-01 — Google adapter requests and negatives

- Covers: `VOC-112-AC-01`
- Procedure: use fake fetch for the three literal endpoints. Assert exact authorization
  GET query, token POST form/headers/`redirect:error`, and user-info GET bearer/header/
  `redirect:error`. Assert the accepted token field set and reject refresh/unknown,
  wrong-type, overbound fields. For both responses cover exact-ceiling success,
  declared Content-Length over ceiling, dishonest within-limit length followed by
  oversize, missing/chunked length oversize, malformed/leading-zero Content-Length,
  timeout/network/read error, non-2xx, allowed JSON media-type parameters, rejected
  non-JSON content, invalid JSON/shape, and instrumented cancellation/release on every
  success, error, timeout, redirect, and oversize path. Cover exact subject/email/
  verified/name bounds, ignored unknown user-info claims, and avatar scheme/host/port/
  credentials/query/fragment/byte-limit negatives. Attempt 3xx
  redirects and prove code/client-secret and access-token are never sent to the target.
- Expected: exact safe requests and bounded identity on success; generic fail-closed
  behavior otherwise; token retains at most 16,384 bytes and user-info 65,536 bytes
  independent of headers/transfer; every reader cancels/releases; no secret escapes.
- Evidence: `VOC-112-EV-01`

## VOC-112-TEST-02 — Email adapter requests and negatives

- Covers: `VOC-112-AC-02`
- Procedure: inject fake fetch and test endpoint/sender/token/message validation,
  URL credentials/query/fragment/port, CR/LF/control/header injection, authorization/
  payload, exact endpoint/mailbox/subject/text/serialized-body/API-key byte bounds,
  exact timeout, 2xx, non-2xx, network error, redirect:error, and response cancellation.
  A fake redirect target must prove it receives no API bearer, recipient, subject, or
  magic-link payload. Compare registered/unregistered public responses.
- Expected: no real network; valid request is exact; failures are generic and redact
  bearer/link/email details; public request behavior does not enumerate accounts.
- Evidence: `VOC-112-EV-02`

Also run `apps/api-worker/test/ai-email-observability-parity.test.ts`: its positive
sender fixture must use `noreply@example.test`, retain the bounded synthetic 100-ms
constructor timeout, assert the hardened payload, HTTPS/bearer/no-retry contract, and
retain provider-error body redaction. Separate factory tests must prove runtime
construction requires and explicitly passes 8,000 ms rather than relying on the
direct-constructor default.

## VOC-112-TEST-03 — Factory, bindings, switches, and secrets

- Covers: `VOC-112-AC-01`, `AC-02`, `AC-05`
- Procedure: table-test each switch off/on against absent, partial, malformed, unsafe,
  and complete synthetic configuration; count network/session calls; regenerate/check
  Worker types; assert the exact six names, required-vs-ignored matrix, mandatory
  `AUTH_PROVIDER_TIMEOUT_MS="8000"`, four committed literals, no aliases/secret values,
  and both complete-A/malformed-or-disabled-B directions. Mutate each new root/staging/
  production policy var to prove exact-map rejection; run safety/delivery/secret scans.
- Expected: disabled needs no credentials; enabled+complete uses real adapters;
  everything else is unavailable with zero network/session/fake fallback. Staging and
  production remain disabled/held and current GitHub Actions secret names unchanged.
- Evidence: `VOC-112-EV-03`

## VOC-112-TEST-04 — Identity/session security matrix

- Covers: `VOC-112-AC-03`
- Procedure: run workerd/D1 cases for both flows, OAuth cookie/stored state, link/state
  replay and expiry, provider error, disabled user, secure cookie attributes, session
  navigation, logout reuse, CSRF absent/mismatch, rate limits, identity-link rollback,
  and two-user guessed-ID/idempotency isolation.
- Expected: happy paths create exactly one correct identity/session; every attack/fault
  creates no unauthorized session, cross-user result, partial identity, or disclosure.
- Evidence: `VOC-112-EV-04`

## VOC-112-TEST-05 — Web journey and accessibility

- Covers: `VOC-112-AC-00`, `AC-03`
- Procedure: run the existing sign-in/magic-link/onboarding/protected-shell/logout
  browser and accessibility suites with deterministic mock API; cover keyboard/focus,
  semantic status/error, mobile layout, return path, session expiry, and auth rejection.
- Expected: normal navigation persists, logout/expiry returns to accessible sign-in,
  failures are understandable and non-enumerating, and no protected render precedes
  API-backed authorization.
- Evidence: `VOC-112-EV-05`

## VOC-112-TEST-06 — Pending staging record truthfulness

- Covers: `VOC-112-AC-04`
- Procedure: inspect the runbook for exact SHA/attempt, real email/OAuth, navigation,
  logout, unauthenticated/cross-user/CSRF/abuse/redaction, kill-switch, and rollback
  procedures; run `a1-staging-acceptance-policy.test.mjs` positive and one-invariant-
  at-a-time negatives for missing index/step/hold, completion/live claim, secret, and
  personal data.
- Expected: complete procedure, every result pending separate authority, and no
  prohibited disclosure or inferred A1 acceptance.
- Evidence: `VOC-112-EV-06`

## VOC-112-TEST-07 — Full validation, path, and rollback

- Covers: `VOC-112-AC-05`
- Procedure: run focused suites, `pnpm ci:worker-api`, applicable web e2e/accessibility,
  `pnpm ci:delivery`, `pnpm ci:foundation`, `pnpm validate`, governance/risk/diff checks,
  exact sixteen-path audit, and a disposable full base-to-head reverse rehearsal.
- Expected: all installed checks pass, only the exact sixteen paths change,
  no network/external action occurs, and reverse restores the exact base tree.
- Evidence: `VOC-112-EV-07`

## VOC-112-TEST-08 — Exact-SHA verification and hosted evidence

- Covers: `VOC-112-AC-06`
- Procedure: bind security/authorization specialist and independent R3 verdicts to the
  exact final SHA, verify authorship separation, hosted checks, eligibility reasons,
  non-author merge, and post-merge checks/readback.
- Expected: two distinct non-author PASS verdicts, no blocker, normal separate merge,
  and no A1 completion or external-action claim.
- Evidence: `VOC-112-EV-08`

## Commands

- `pnpm --filter @vocanova/api-worker test`
- `pnpm --filter @vocanova/api-worker types:check`
- `pnpm --filter @vocanova/api-worker safety:check`
- `pnpm --filter @vocanova/api-worker openapi:check`
- `pnpm --filter @vocanova/api-worker contract:check`
- `pnpm --filter @vocanova/api-worker dry-run`
- `node --test scripts/foundation/a1-staging-acceptance-policy.test.mjs`
- `pnpm ci:worker-api`
- applicable committed web e2e/accessibility commands discovered in
  `apps/web/package.json` and `docs/development.md`
- `pnpm ci:delivery`
- `pnpm ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

Do not invent a command or report an unavailable/live check as passing.

## Evidence definitions

- `VOC-112-EV-00`: baseline/schema/contract compatibility results.
- `VOC-112-EV-01`: Google adapter request, parsing, failure, and redaction results.
- `VOC-112-EV-02`: email adapter request, failure, enumeration, and redaction results.
- `VOC-112-EV-03`: factory/config/binding/switch/secret/delivery-policy results.
- `VOC-112-EV-04`: workerd identity/session/authorization security matrix.
- `VOC-112-EV-05`: web journey, expiry/logout, and accessibility results.
- `VOC-112-EV-06`: sanitized pending staging-runbook truth audit.
- `VOC-112-EV-07`: full validation, path, no-live, and rollback rehearsal.
- `VOC-112-EV-08`: exact reviews, hosted checks, merge, and post-merge readback.
