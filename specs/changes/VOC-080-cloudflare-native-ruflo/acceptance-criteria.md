# VOC-080 — Acceptance Criteria

## VOC-080-AC-00 — The architecture and authority transition is canonical

- Requirements: `VOC-080-D00` through `VOC-080-D10`
- Tasks: `VOC-080-T00`, `VOC-080-T02`, `VOC-080-T11`
- Tests: `VOC-080-TEST-00`, `VOC-080-TEST-11`
- Evidence: `VOC-080-EV-00`, `VOC-080-EV-11`
- Result: pending

Two accepted ADRs and every affected active document consistently describe Cloudflare Workers/D1,
the four-workflow CI/CD model, the staged migration, Ruflo's external permission envelope, and the
separation between repository merge and live activation. Historical records remain historical.

## VOC-080-AC-01 — CI/CD is understandable, least-privilege, and reproducible

- Requirements: `VOC-080-D00`, `VOC-080-D01`, `VOC-080-D07`
- Tasks: `VOC-080-T01`
- Tests: `VOC-080-TEST-01`, `VOC-080-TEST-02`
- Evidence: `VOC-080-EV-01`, `VOC-080-EV-02`
- Result: pending

The inventory is exactly four workflows. External actions use full commit SHAs, checkouts do not
persist credentials, jobs declare minimal permissions, untrusted PR text is data, stable checks map
to local commands, failures identify a subsystem, caches are non-authoritative, and pull requests
cannot access Cloudflare deployment credentials.

## VOC-080-AC-02 — Supported repository settings match documented reality

- Requirements: `VOC-080-D00`
- Tasks: `VOC-080-T01`
- Tests: `VOC-080-TEST-02`
- Evidence: `VOC-080-EV-02`
- Result: pending

Default workflow permissions are read-only. Action allow-list/SHA policy and merge strategies are
hardened where the current GitHub plan supports them and otherwise recorded as unavailable. No doc
claims branch protection, rulesets, required checks, or deployment review that the private Free
repository does not host.

## VOC-080-AC-03 — The Next.js web app runs under OpenNext/workerd

- Requirements: `VOC-080-D03`, `VOC-080-D10`
- Tasks: `VOC-080-T03`
- Tests: `VOC-080-TEST-03`
- Evidence: `VOC-080-EV-03`
- Result: pending

The web workspace builds through OpenNext, generates binding types, passes its unit/middleware/E2E,
accessibility and Lighthouse checks, serves representative SSR/RSC/static/authenticated-shell
requests in workerd, and passes deterministic Wrangler dry-run, compressed-size, and startup checks.

## VOC-080-AC-04 — Worker API foundation preserves the public contract

- Requirements: `VOC-080-D04`, `VOC-080-D05`
- Tasks: `VOC-080-T04`
- Tests: `VOC-080-TEST-04`
- Evidence: `VOC-080-EV-04`
- Result: pending

A TypeScript Module Worker using Hono, generated bindings, typed domain/repository boundaries, D1
migrations, structured errors/logging, health/config endpoints, and generated OpenAPI exists. Contract
generation has a fail-closed drift test against the committed API/client artifacts.

## VOC-080-AC-05 — Identity and learner-owned data are parity-proven

- Requirements: `VOC-080-D04` through `VOC-080-D06`
- Tasks: `VOC-080-T05`, `VOC-080-T06`, `VOC-080-T07`
- Tests: `VOC-080-TEST-05`, `VOC-080-TEST-06`, `VOC-080-TEST-07`
- Evidence: `VOC-080-EV-05`, `VOC-080-EV-06`, `VOC-080-EV-07`
- Result: pending

Auth/sessions/accounts/settings, content/discovery/learning/reviews, and missions/gamification/progress
match the Go reference for successful, error, idempotent, unauthorized, and cross-user fixtures. All
atomicity and consistency invariants are represented by tested D1 operations.

## VOC-080-AC-06 — AI, email, privacy, and observability are Worker-compatible

- Requirements: `VOC-080-D02`, `VOC-080-D04`, `VOC-080-D10`
- Tasks: `VOC-080-T08`
- Tests: `VOC-080-TEST-08`
- Evidence: `VOC-080-EV-08`
- Result: pending

AI feedback and evaluation, provider HTTP calls, safety/moderation, email delivery, feature kill
switches, bounded retries, rate/cost controls, and privacy-safe observability pass deterministic
Worker tests. Normal CI uses no paid provider or secret.

## VOC-080-AC-07 — PostgreSQL-to-D1 conversion is deterministic and reversible before cutover

- Requirements: `VOC-080-D05`, `VOC-080-D06`
- Tasks: `VOC-080-T09`
- Tests: `VOC-080-TEST-09`
- Evidence: `VOC-080-EV-09`
- Result: pending

Synthetic PostgreSQL-shaped fixtures convert to D1-compatible data with stable IDs, counts,
relationships, timestamps, JSON, uniqueness, and domain aggregates. Re-running is safe, partial
failure is recoverable, reconciliation is machine-readable, and logs contain no secrets or learner
content. No production data is accessed.

## VOC-080-AC-08 — Staging and production deployment controls fail closed

- Requirements: `VOC-080-D00`, `VOC-080-D07`, `VOC-080-D10`
- Tasks: `VOC-080-T10`
- Tests: `VOC-080-TEST-10`
- Evidence: `VOC-080-EV-10`
- Result: pending

Credential-free PRs dry-run both Workers. Staging and production configurations use separate names,
D1 bindings, secrets, routes, and environments. Exact Worker versions, migration order, smoke tests,
promotion, rollback, non-cancellation, cost limits, and action holds are enforced and tested without
performing an unauthorized live deployment.

## VOC-080-AC-09 — Ruflo is useful but cannot become authority

- Requirements: `VOC-080-D08`
- Tasks: `VOC-080-T02`
- Tests: `VOC-080-TEST-00`, `VOC-080-TEST-11`
- Evidence: `VOC-080-EV-00`, `VOC-080-EV-11`
- Result: pending

The audited Ruflo release/integrity and external installation are documented. A synthetic orchestration
rehearsal shows isolated planner/builder/reviewer/task-orchestrator roles and GitHub evidence handoff.
Guards fail if tracked launchers, issue triggers, AGENTS overwrite behavior, autonomous merge/close,
Cloudflare credentials, production access, or deployment authority are introduced.

## VOC-080-AC-10 — Old server assets retire only after full parity

- Requirements: `VOC-080-D09`
- Tasks: `VOC-080-T11`
- Tests: `VOC-080-TEST-11`
- Evidence: `VOC-080-EV-11`
- Result: pending

Only after AC-03 through AC-09 pass, a dedicated reviewed revision removes active Go/PostgreSQL,
Docker, Compose, Nginx, host scripts, and server instructions; validators and indexes match the final
Cloudflare architecture. The change makes no claim about live server state and has a repository-only
rollback.

## VOC-080-AC-11 — Final evidence is exact, hosted, independent, and rollback-tested

- Requirements: all
- Tasks: `VOC-080-T12`
- Tests: `VOC-080-TEST-12`
- Evidence: `VOC-080-EV-12`
- Result: pending

Every task has local deterministic evidence, hosted Actions on its exact SHA, a different-role exact-SHA
review with blocking findings resolved, and a reversible task rollback. Final inventory proves the four
workflows, Cloudflare target, Ruflo boundary, action holds, and absence of unauthorized live mutations.
