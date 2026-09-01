# VOC-112 — Impact Analysis

## Consequence and protected areas

This is R3 protected repository work. A provider-wiring error could leak credentials,
create or link the wrong learner identity, bypass authorization, permit token/state
replay, disclose account existence, or make a disabled feature contact a provider.
Protection covers auth/session entry, OAuth/email credentials, personal identity,
requester isolation, Worker bindings, and security evidence.

| Area                                    | Status            | Evidence or required work                                                                                                       |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Product scope and UX                    | Affected          | Completes the already approved two-method A1 implementation boundary; no new method or P1+ behavior.                            |
| Living documents and decisions          | Affected          | Add pending A1 staging runbook and update only directly stale development/operations provider-boundary wording.                 |
| Frontend and accessibility              | Not affected      | No web path may change; existing sign-in/magic-link/logout and accessibility suites are required regression evidence.           |
| Backend and API contracts               | Affected          | New provider adapters and default factory; public endpoints/DTOs remain compatible.                                             |
| Database and migrations                 | Not affected      | Existing seven D1 migrations and identity schema remain unchanged.                                                              |
| Authentication and authorization        | Affected          | R3 provider, session-entry, state, cookie, CSRF, and cross-user controls.                                                       |
| Privacy, personal data, audio, or voice | Affected          | Synthetic identity tests only; live personal/test identity use is prohibited here. No audio/voice.                              |
| Security and secrets                    | Affected          | Binding-name/interface and strict redaction; no values or settings mutation.                                                    |
| Analytics                               | Not affected      | No analytics event or identity correlation added.                                                                               |
| AI behavior/providers                   | Not affected      | No AI provider, prompt, cost, or evaluation change.                                                                             |
| Infrastructure and deployment           | Affected but held | Worker config/types may declare disabled interfaces; tuple, switches, deployment workflow, and external state remain unchanged. |
| Testing                                 | Affected          | Adapter, factory, workerd, security, browser, path, secret, and rollback evidence.                                              |
| Support and operations                  | Affected          | Pending staging procedure and failure/rollback triggers; no live execution.                                                     |

## Failure modes and mitigations

- **R00 — credential or bearer disclosure:** runtime-only inputs, fake transports,
  literal no-redirect requests, 16,384/65,536-byte streamed ceilings, unconditional
  reader cleanup, bounded fields, log/artifact scans, and specialist review.
- **R01 — OAuth account takeover/link collision:** state cookie + one-use D1 state,
  HTTPS exchange, strict verified identity, transactional existing linking, replay and
  two-user negatives.
- **R02 — fake fallback in live mode:** centralized factory; enabled+incomplete fails
  unavailable before network/session; explicit tests prove no fake identity/delivery.
- **R03 — enumeration or abuse:** preserve generic magic-link response, D1 rate limits,
  synthetic registered/unregistered equivalence, provider-call-count assertions.
- **R04 — cross-user/private-data access:** preserve requester-scoped services, 401/404
  rules, CSRF, user-scoped idempotency, and two-user tests.
- **R05 — unsafe redirects:** retain exact return allowlist and fixed HTTPS provider
  endpoints; invalid destinations and mismatched state fail.
- **R06 — configuration enables live auth by merge:** committed staging/production
  switches remain false, provider vars remain exact disabled sentinels, secret values
  are absent, and reconciled delivery-policy maps/holds pass.
- **R07 — false A1 completion:** runbook results remain pending; a later exact live
  evidence change is required to update DOC-12 milestone state.
- **R08 — rollback invalidates trust incorrectly:** repository revert only; no schema
  rollback. Later activation must disable switches/remove credentials or restore the
  prior Worker version while treating D1/session state conservatively.
- **R09 — oversized/never-ending provider response exhausts Worker resources:** strict
  declared-length checks, decoded-chunk byte ceilings independent of length/transfer,
  8-second abort, and cancel/release finalization on every response path.
- **R10 — redirects exfiltrate secrets or magic links:** every provider fetch uses
  `redirect: "error"`; tests prove no token form, bearer, header, or email payload is
  forwarded to a redirect target.
- **R11 — unsafe URL/header injection:** literal Google origins, credential/query/
  fragment-free email and avatar URLs, bounded Google-hosted avatar, and CR/LF/control-
  free sender/recipient/subject validation.
- **R12 — one malformed provider disables the other:** capability-local construction
  and mixed-state tests keep the complete provider usable without fake fallback.
- **R13 — hardened sender invalidates an excluded parity fixture:** authorize the exact
  existing AI/email observability test, replace its display-name sender with the strict
  mailbox, preserve its 100-ms injected timeout, no-retry and redaction assertions, and
  separately prove the production factory explicitly passes mandatory 8,000 ms.

## Data, migration, privacy, and cost

No schema or migration changes are allowed. Synthetic test users and example-invalid
domains are sufficient. No production/learner data, provider credential, raw bearer,
live endpoint response, analytics identifier, immutable Worker version, or private
email address enters evidence. No provider choice, contract, paid plan, or spend is
authorized; any such decision is a later action-specific record.

## Rollback and external-effect boundary

Before merge, close the PR for zero external effect. After merge, a separately reviewed
repository revert removes the adapters/factory/binding contract/tests/runbook and
restores the exact adopted base. It does not reverse D1 or alter any live service.
Because switches remain disabled and credentials absent, repository merge itself sends
no email and performs no OAuth exchange. Any later external activation must define its
own disable/remove/previous-version rollback and session-safety evidence.
