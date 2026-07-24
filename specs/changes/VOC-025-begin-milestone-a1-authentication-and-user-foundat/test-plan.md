# VOC-025 — Test Plan

No test, fixture, log, OpenAPI example, or evidence may contain a real provider credential, production URL/data, raw session token, or magic-link bearer. Discover installed commands at the adopted base; missing integration, staging credential, or browser tooling is never a pass.

## VOC-025-TEST-00 — Migration and persistence invariants
- Covers: `VOC-025-AC-00`; Preconditions: T00 and disposable PostgreSQL.
- Procedure: apply migrations and test unique identity/FK/status/expiry/revocation/one-use invariants and hashed bearer storage.
- Expected result: migrations and constraints pass without raw bearer storage. Evidence: `VOC-025-EV-00`.

## VOC-025-TEST-01 — Migration compatibility and recovery
- Covers: `VOC-025-AC-00`, `VOC-025-AC-07`; Preconditions: T00.
- Procedure: run adopted migration validation and disposable forward/recovery rehearsal; confirm startup never migrates production.
- Expected result: versioned, recoverable migration with intact identity data. Evidence: `VOC-025-EV-01`.

## VOC-025-TEST-02 — Magic-link happy path
- Covers: `VOC-025-AC-01`; Preconditions: T01, fake email provider.
- Procedure: request/consume a verified test-email link, then repeat; assert user/identity/session state through test APIs.
- Expected result: correct single internal identity and session. Evidence: `VOC-025-EV-02`.

## VOC-025-TEST-03 — Magic-link negative cases
- Covers: `VOC-025-AC-01`; Preconditions: T01.
- Procedure: consume expired, replayed, malformed, tampered, and wrong-environment links; compare registered/unregistered responses and inspect storage/logs.
- Expected result: no session, enumeration, or bearer leak. Evidence: `VOC-025-EV-03`.

## VOC-025-TEST-04 — Auth rate limiting
- Covers: `VOC-025-AC-01`; Preconditions: T01, deterministic clock.
- Procedure: exceed adopted request/consume limits, advance clock, retry.
- Expected result: provider work is protected and service resumes after reset. Evidence: `VOC-025-EV-04`.

## VOC-025-TEST-05 — Google OAuth happy path
- Covers: `VOC-025-AC-02`; Preconditions: T02, fake OAuth provider.
- Procedure: execute valid start/callback and allowed existing-identity link.
- Expected result: state validates and exactly one permitted identity/session exists. Evidence: `VOC-025-EV-05`.

## VOC-025-TEST-06 — Google OAuth failure and attack paths
- Covers: `VOC-025-AC-02`; Preconditions: T02.
- Procedure: test missing/replayed/mismatched state, callback/provider errors, unverified data, ambiguous link, and disabled user.
- Expected result: no session/credential/account disclosure or identity corruption. Evidence: `VOC-025-EV-06`.

## VOC-025-TEST-07 — Session creation, cookie, and navigation
- Covers: `VOC-025-AC-03`, `VOC-025-AC-05`; Preconditions: relevant T01/T02/T04 complete.
- Procedure: authenticate by both methods, inspect cookie/server record, navigate protected routes within lifetime.
- Expected result: opaque secure session works without sliding expiry. Evidence: `VOC-025-EV-07`.

## VOC-025-TEST-08 — Expiry, revocation, logout, and disabled user
- Covers: `VOC-025-AC-03`, `VOC-025-AC-05`; Preconditions: T01/T04.
- Procedure: expire/revoke/disable test records, logout, then retry private API/routes.
- Expected result: all access is rejected; logout clears client state and invalidates server session. Evidence: `VOC-025-EV-08`.

## VOC-025-TEST-09 — CSRF enforcement
- Covers: `VOC-025-AC-03`, `VOC-025-AC-04`; Preconditions: T01/T03.
- Procedure: send unsafe authenticated requests with absent, malformed, mismatched, and valid `X-CSRF-Token`.
- Expected result: invalid cases fail; valid requests reach ordinary validation. Evidence: `VOC-025-EV-09`.

## VOC-025-TEST-10 — Token confidentiality and logging
- Covers: `VOC-025-AC-03`; Preconditions: T01/T02.
- Procedure: inspect responses, errors, logs, database rows, OpenAPI and generated artifacts.
- Expected result: raw session/link/OAuth/secrets are absent or hashed. Evidence: `VOC-025-EV-10`.

## VOC-025-TEST-11 — Invalid-session API rejection
- Covers: `VOC-025-AC-04`; Preconditions: T03.
- Procedure: call each private A1 route without, with malformed, expired/revoked, and disabled-user sessions.
- Expected result: consistent rejection and no private data. Evidence: `VOC-025-EV-11`.

## VOC-025-TEST-12 — Two-user cross-access denial
- Covers: `VOC-025-AC-04`; Preconditions: T03 and isolated test users/resources.
- Procedure: use user A to query/mutate user B by known/guessed route/query/body IDs.
- Expected result: no read/mutation/inference; inaccessible private resources return 404. Evidence: `VOC-025-EV-12`.

## VOC-025-TEST-13 — Idempotency scope isolation
- Covers: `VOC-025-AC-04`; Preconditions: T03 and an idempotent private operation.
- Procedure: reuse key across users and reuse same-user key with changed fingerprint.
- Expected result: users isolate; conflicting same-user replay returns 409. Evidence: `VOC-025-EV-13`.

## VOC-025-TEST-14 — DTO, contract, and OpenAPI drift
- Covers: `VOC-025-AC-04`; Preconditions: T00–T03.
- Procedure: run generation/golden checks and inspect DTO validation/error shapes.
- Expected result: routes, committed OpenAPI/client agree and expose no Ent/internal data. Evidence: `VOC-025-EV-14`.

## VOC-025-TEST-15 — Shell protection and return journey
- Covers: `VOC-025-AC-05`; Preconditions: T04, adopted D06.
- Procedure: visit every `(app)` route unauthenticated, authenticate both ways, verify adopted return/navigation behavior.
- Expected result: no protected render before auth; successful login reaches approved destination. Evidence: `VOC-025-EV-15`.

## VOC-025-TEST-16 — Web logout end-to-end
- Covers: `VOC-025-AC-05`; Preconditions: T04.
- Procedure: sign in, logout, revisit protected routes and private API.
- Expected result: session is invalidated end-to-end. Evidence: `VOC-025-EV-16`.

## VOC-025-TEST-17 — Auth UI accessibility
- Covers: `VOC-025-AC-05`; Preconditions: T04.
- Procedure: run installed a11y tools or inspect keyboard, labels, focus, semantic error/status, and mobile behavior.
- Expected result: requirements hold; absent automation is recorded as limitation. Evidence: `VOC-025-EV-17`.

## VOC-025-TEST-18 — Mock inventory and disposition
- Covers: `VOC-025-AC-06`; Preconditions: T05 and adopted D05.
- Procedure: list every VOC-010–VOC-024 mock and compare changes to adopted retain/wire/follow-up mapping.
- Expected result: no unapproved learning source conversion/misrepresentation. Evidence: `VOC-025-EV-18`.

## VOC-025-TEST-19 — Real-source authorization regression
- Covers: `VOC-025-AC-06`; Preconditions: T05 wires an approved source.
- Procedure: execute unauthenticated/two-user contract tests for every newly wired source.
- Expected result: requester scope holds and P1–P4 scope does not expand. Evidence: `VOC-025-EV-19`.

## VOC-025-TEST-20 — Installed deterministic and security suite
- Covers: `VOC-025-AC-07`; Preconditions: each PR complete.
- Procedure: run relevant workspace, Go format/vet/test/build, web lint/typecheck/build/format, migration, OpenAPI/client, dependency, and secret checks from adopted scripts.
- Expected result: available checks pass; absent checks are reported. Evidence: `VOC-025-EV-20`.

## VOC-025-TEST-21 — Staging auth and abuse validation
- Covers: `VOC-025-AC-07`; Preconditions: approved staging providers and T01/T02.
- Procedure: with non-production identities complete both methods, normal navigation, invalid link, logout, and rate-limit paths.
- Expected result: A1 auth/session gate evidence is recorded without production data. Evidence: `VOC-025-EV-21`.

## VOC-025-TEST-22 — Staging authorization and CSRF validation
- Covers: `VOC-025-AC-07`; Preconditions: T03/T04.
- Procedure: repeat unauthenticated, cross-user, revoked-session, CSRF-negative tests and inspect redacted signals.
- Expected result: no bypass/cross-user access or sensitive logs. Evidence: `VOC-025-EV-22`.

## VOC-025-TEST-23 — Rollback and recovery rehearsal
- Covers: `VOC-025-AC-07`; Preconditions: staged candidate and approved procedure.
- Procedure: rehearse non-production migration/auth rollback, validate service/integrity/session safety.
- Expected result: controlled recovery; unsafe sessions stay invalidated. Evidence: `VOC-025-EV-23`.
