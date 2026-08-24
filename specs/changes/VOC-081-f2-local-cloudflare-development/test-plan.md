# VOC-081 Test Plan

## Reconciled evidence outcome

The complete T00-T04 deterministic, hosted, exact-revision review, rollback, and
post-merge evidence is recorded in the VOC-084 closure inventory. These procedures
remain the reproducible repository/local F2 evidence contract; completion does not
establish F3, A1/product acceptance, Windows-native support, staging, production, or
live activation.

## VOC-081-TEST-00 — Contract and authority negatives

- Covers: AC-01, AC-04
- Procedure: validate canonical origins/ports/state and mutate fixtures with silent port
  fallback, top-level `agentRules` drift, generated markers in nested agent files,
  OAuth callback/identity-fixture port drift, remote bindings/flags, deploy,
  staging/production env, auto-provision, shell backgrounding, and missing bounded waits.
- Expected: canonical source passes; every unsafe fixture fails with a concrete reason.
- Evidence: EV-00.

## VOC-081-TEST-01 — Local D1 initialization

- Covers: AC-00
- Procedure: apply all migrations to empty disposable D1, repeat, inspect migration
  table and health, inject a failing migration in an isolated fixture, and prove a
  different state root is empty. Inspect command construction for explicit local-only
  flags/config/binding/persistence.
- Expected: empty/repeat succeed, prior migrations survive fixture failure, roots are
  isolated, and remote/staging variants are rejected.
- Evidence: EV-01.

## VOC-081-TEST-02 — Supervisor lifecycle and two-loop behavior

- Covers: AC-01, AC-02
- Procedure: unit-test command arrays/readiness/state machine, then exercise controlled
  child fixtures for successful startup, occupied web/API ports, API-not-ready, first-
  child exit, SIGINT, SIGTERM, and forced bounded escalation. Start both actual loops
  proportionally and confirm expected origins.
- Expected: no silent fallback/orphan/hang; sibling cleanup and exit codes are exact.
- Evidence: EV-02.

## VOC-081-TEST-03 — Real disposable local stack

- Covers: AC-03, AC-04
- Procedure: build web, initialize disposable D1, start API then web under workerd,
  query health/config/direct API/static/SSR/middleware, make a server request whose API
  result carries an observable non-secret transport/release marker, restart, re-query
  persisted technical state, stop, and compare repository status/child inventory.
- Expected: all responses and marker agree; D1 persists; no provider call, nested agent
  file, dirty tracked tree, or process remains.
- Evidence: EV-03.

## VOC-081-TEST-04 — Hosted aggregation and no-live contract

- Covers: AC-05
- Procedure: run `ci:local-stack`, workflow policy, synthetic failed local-stack
  aggregate, action pin/permission scan, secret scan failure contract, and hosted exact-
  SHA four-workflow graph. Inspect CI jobs for skipped delivery/staging/production.
- Expected: local stack is required, failure blocks aggregate, four workflows pass, and
  no credential/live/deploy path runs.
- Evidence: EV-04.

## VOC-081-TEST-05 — Documentation and F2-state inventory

- Covers: AC-06
- Procedure: scan every living root/development/operations/product instruction and
  compare it to package scripts/config/policy. Reject claims of staging, A1, product,
  production, branch-protection, or live activation.
- Expected: one coherent command contract; F2 local evidence is exact and later gates
  remain explicitly held.
- Evidence: EV-05.

## VOC-081-TEST-06 — Full exact-SHA and rollback proof

- Covers: AC-07
- Procedure: `pnpm validate`, subsystem/local-stack commands, governance shell/risk/
  Python tests, audit, diff/format checks, hosted four-workflow proof, independent
  exact-SHA review, and reverse-order task rollback in a disposable worktree.
- Expected: every required check passes; each predecessor tree is reproduced; no live
  query/mutation or fabricated enforcement.
- Evidence: EV-06.

Reviewers receive completed test evidence and are explicitly prohibited from duplicating
long suites or starting background processes.
