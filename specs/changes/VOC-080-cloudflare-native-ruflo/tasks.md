# VOC-080 — Tasks

## VOC-080-T00 — Adopt Cloudflare and Ruflo architecture decisions

- Requirements: `VOC-080-D00` through `VOC-080-D10`
- Acceptance: `VOC-080-AC-00`
- Tests: `VOC-080-TEST-00`
- Evidence: `VOC-080-EV-00`
- Status: pending-adoption

Add two accepted ADRs (Cloudflare runtime/data/deployment and external Ruflo orchestration), reconcile
the ADR/doc indexes, and update DOC-04/05/06/07/08/09/10/11/12/15/16 plus contributor/governance
guidance. Preserve product requirements and historical records. Record the current compatibility
inventory and rejected alternatives.

## VOC-080-T01 — Refactor the four-workflow CI/CD foundation

- Requirements: `VOC-080-D00`, `VOC-080-D01`, `VOC-080-D07`
- Acceptance: `VOC-080-AC-01`, `VOC-080-AC-02`
- Tests: `VOC-080-TEST-01`, `VOC-080-TEST-02`
- Evidence: `VOC-080-EV-01`, `VOC-080-EV-02`
- Status: blocked-by-T00

Keep exactly four workflows while introducing stable subsystem checks, local setup reuse, caches that
do not affect correctness, strict shells, immutable pins, `persist-credentials: false`, least
permissions, bounded artifacts, and deterministic path classification if beneficial. Harden supported
repository settings and immediately reconcile the settings guide. Do not add deployment credentials
or live Cloudflare calls.

## VOC-080-T02 — Establish pinned external Ruflo orchestration

- Requirements: `VOC-080-D08`
- Acceptance: `VOC-080-AC-09`
- Tests: `VOC-080-TEST-00`, `VOC-080-TEST-11`
- Evidence: `VOC-080-EV-00`, `VOC-080-EV-11`
- Status: blocked-by-T00

Audit and pin Ruflo's exact release/integrity; document/install it outside the repository without
running a force initializer; define hierarchical roles, worktree ownership, evidence handoff,
reviewer non-duplication, memory privacy, and deny-by-default permissions. Extend guards so tracked
Ruflo launchers, authority overrides, issue triggers, autonomous GitHub completion, Cloudflare
credentials, or deployment calls fail closed. Rehearse with a synthetic repository-only task.

## VOC-080-T03 — Adapt Next.js web to OpenNext/workerd

- Requirements: `VOC-080-D03`, `VOC-080-D10`
- Acceptance: `VOC-080-AC-03`
- Tests: `VOC-080-TEST-03`
- Evidence: `VOC-080-EV-03`
- Status: blocked-by-T02

Add the OpenNext adapter, locked Wrangler config and generated types, build/preview/dry-run commands,
representative workerd tests, and size/startup measurement. Reconcile environment handling, server
headers/cookies, middleware, Sentry, and API service binding. Preserve current UI behavior; do not
deploy.

## VOC-080-T04 — Build Worker API and D1 contract foundation

- Requirements: `VOC-080-D04`, `VOC-080-D05`
- Acceptance: `VOC-080-AC-04`
- Tests: `VOC-080-TEST-04`
- Evidence: `VOC-080-EV-04`
- Status: blocked-by-T02

Create the Worker API workspace with Hono, schema validation/OpenAPI generation, generated bindings,
typed domain/repository boundaries, local D1, initial migrations, structured errors/logging, health
and config behavior, Vitest pool/workerd tests, and contract drift checks. Keep Go as reference.

## VOC-080-T05 — Port identity, sessions, accounts, and settings

- Requirements: `VOC-080-D04` through `VOC-080-D06`
- Acceptance: `VOC-080-AC-05`
- Tests: `VOC-080-TEST-05`
- Evidence: `VOC-080-EV-05`
- Status: blocked-by-T04

Port Google OAuth state, magic links, sessions, auth middleware, account lifecycle, email-change,
deletion, onboarding, and settings. Prove secure cookie, token hashing/expiry, replay prevention,
rate limits, kill switches, unauthorized and cross-user behavior, and D1 atomicity against parity
fixtures. External email remains mocked.

## VOC-080-T06 — Port content, discovery, save, and review scheduling

- Requirements: `VOC-080-D04` through `VOC-080-D06`
- Acceptance: `VOC-080-AC-05`
- Tests: `VOC-080-TEST-06`
- Evidence: `VOC-080-EV-06`
- Status: blocked-by-T05

Port canonical vocabulary, journeys, save/unsave, learner words, cursors, review queues/attempts,
scheduling, and idempotency. Validate ordering, due-time semantics, duplicate protection, and
cross-user isolation under D1.

## VOC-080-T07 — Port missions, gamification, streaks, and progress

- Requirements: `VOC-080-D04` through `VOC-080-D06`
- Acceptance: `VOC-080-AC-05`
- Tests: `VOC-080-TEST-07`
- Evidence: `VOC-080-EV-07`
- Status: blocked-by-T06

Port daily snapshots, local-date/timezone rules, confidence ledger, rewards, streaks, grace days,
progress, and cross-capability atomic updates. Prove idempotency, concurrency, partial-failure, and
deterministic domain parity.

## VOC-080-T08 — Port AI feedback, email boundary, and observability

- Requirements: `VOC-080-D02`, `VOC-080-D04`, `VOC-080-D10`
- Acceptance: `VOC-080-AC-06`
- Tests: `VOC-080-TEST-08`
- Evidence: `VOC-080-EV-08`
- Status: blocked-by-T07

Port sentence/feedback persistence, validation, safety/moderation, provider adapters, bounded retries,
cost/rate gates, evaluation fixtures, email HTTP boundary, feature kill switches, and privacy-safe
Workers observability. Use mocks in CI and no paid-provider secret.

## VOC-080-T09 — Build and rehearse PostgreSQL-to-D1 conversion

- Requirements: `VOC-080-D05`, `VOC-080-D06`
- Acceptance: `VOC-080-AC-07`
- Tests: `VOC-080-TEST-09`
- Evidence: `VOC-080-EV-09`
- Status: blocked-by-T08

Implement deterministic export-shape validation, type conversion, D1 import chunks, resumability,
idempotency, foreign-key ordering, redaction, counts/checksums/domain reconciliation, and failure
recovery. Rehearse only with synthetic/non-production fixtures. Production-data access stays held.

## VOC-080-T10 — Add staged Cloudflare deployment and rollback controls

- Requirements: `VOC-080-D00`, `VOC-080-D07`, `VOC-080-D10`
- Acceptance: `VOC-080-AC-08`
- Tests: `VOC-080-TEST-10`
- Evidence: `VOC-080-EV-10`
- Status: blocked-by-T03-and-T09

Within `ci.yml`, add credential-free PR dry runs and environment-scoped staging/production jobs for
D1 migration, immutable version upload, smoke/parity/E2E evidence, explicit promotion, outcome, and
rollback. Prove fork/PR secret denial, SHA binding, staging/production isolation, and non-cancellation
after migration start. Do not activate live environments until the named holds complete.

## VOC-080-T11 — Retire active server runtime and stale infrastructure

- Requirements: `VOC-080-D09`
- Acceptance: `VOC-080-AC-00`, `VOC-080-AC-10`
- Tests: `VOC-080-TEST-11`
- Evidence: `VOC-080-EV-11`
- Status: blocked-by-AC-03-through-AC-09

After a complete parity inventory, remove the active Go/PostgreSQL runtime, Dockerfiles, Compose,
Nginx, host scripts, and server-specific tests/instructions; reconcile validators, package scripts,
docs, examples, and protected paths. Preserve historical packages and explicitly state that no live
server was inspected or stopped.

## VOC-080-T12 — Final verification, rollback, and transition record

- Requirements: all
- Acceptance: `VOC-080-AC-11`
- Tests: `VOC-080-TEST-12`
- Evidence: `VOC-080-EV-12`
- Status: blocked-by-T11

Run the full repository/Worker/D1/web/security/governance suites, hosted Actions, semantic inventory,
synthetic migration and deployment rehearsals, reverse-order task rollback, and exact-SHA independent
specialist review. Record current hosted settings and whether live staging/production remains held or
was separately activated. Produce a self-contained visual architecture and close only evidenced work.
