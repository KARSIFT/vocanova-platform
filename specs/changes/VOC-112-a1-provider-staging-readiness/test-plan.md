# VOC-112 — Test Plan

No test contacts Google, an email provider, Cloudflare, GitHub settings, or a live
endpoint. No fixture/evidence contains a real credential, token, code, email address,
provider response, account identifier, Worker version, or learner data.

## VOC-112-TEST-00 — Baseline and contract preservation

- Covers: `VOC-112-AC-00`
- Procedure: inventory the adopted base; run migration replay, OpenAPI/client drift,
  identity parity, and exact schema/migration diff checks before and after.
- Expected: no D1 migration, public contract, DTO, client, or P1+ expansion; all prior
  identity/account behavior remains passing.
- Evidence: `VOC-112-EV-00`

## VOC-112-TEST-01 — Google adapter requests and negatives

- Covers: `VOC-112-AC-01`
- Procedure: use injected fake fetch for authorization URL, code exchange, and userinfo;
  cover success, timeout/network error, non-2xx, invalid content/JSON, missing/oversized
  fields, unverified email, absent subject, and malicious endpoint/config inputs.
- Expected: exact safe requests and bounded identity on success; generic fail-closed
  behavior otherwise; no raw provider token/code/secret/response escapes.
- Evidence: `VOC-112-EV-01`

## VOC-112-TEST-02 — Email adapter requests and negatives

- Covers: `VOC-112-AC-02`
- Procedure: inject fake fetch and test endpoint/sender/token/message validation,
  authorization/payload, bounded timeout/body, 2xx, non-2xx, network error, and response
  cancellation. Compare registered/unregistered magic-link public responses.
- Expected: no real network; valid request is exact; failures are generic and redact
  bearer/link/email details; public request behavior does not enumerate accounts.
- Evidence: `VOC-112-EV-02`

## VOC-112-TEST-03 — Factory, bindings, switches, and secrets

- Covers: `VOC-112-AC-01`, `AC-02`, `AC-05`
- Procedure: table-test each switch off/on against absent, partial, malformed, unsafe,
  and complete synthetic configuration; count network/session calls; regenerate/check
  Worker types; assert the exact six provider configuration/binding names and absence
  of aliases/committed secret values; run Worker safety/delivery and secret-pattern
  scans.
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
  procedures; scan for completion claims, secrets, private data, or live results.
- Expected: complete procedure, every result pending separate authority, and no
  prohibited disclosure or inferred A1 acceptance.
- Evidence: `VOC-112-EV-06`

## VOC-112-TEST-07 — Full validation, path, and rollback

- Covers: `VOC-112-AC-05`
- Procedure: run focused suites, `pnpm ci:worker-api`, applicable web e2e/accessibility,
  `pnpm ci:delivery`, `pnpm ci:foundation`, `pnpm validate`, governance/risk/diff checks,
  exact allowed-path audit, and a disposable full base-to-head reverse rehearsal.
- Expected: all installed checks pass, only adopted paths/generated outputs change,
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
