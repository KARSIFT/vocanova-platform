# VOC-081 Acceptance Criteria

## VOC-081-AC-00 — Clean-checkout initialization is local, repeatable, and migrated

- Requirements: R00, R05
- Tasks: T00, T01
- Tests: TEST-00, TEST-01
- Evidence: EV-00, EV-01
- Result: pending

From a frozen install, `pnpm dev:init` creates only ignored local state, applies all
committed migrations to `DB`, succeeds again without destructive reset, and is rejected
if any remote/staging/production/provisioning capability is introduced.

## VOC-081-AC-01 — Ports, origins, and browser/service-binding paths agree

- Requirements: R01, R03
- Tasks: T00, T02
- Tests: TEST-00, TEST-02
- Evidence: EV-00, EV-02
- Result: pending

Web is fixed to 3000 and API to 8080; CORS/auth/callback/return/public/server origins
match. Direct browser API requests and web server requests through `API` reach the same
local API revision. Port conflicts fail rather than silently rebinding.

## VOC-081-AC-02 — Both development loops are supervised and reversible

- Requirements: R02, R03
- Tasks: T02
- Tests: TEST-02
- Evidence: EV-02
- Result: pending

`pnpm dev` owns Next hot reload plus the local API Worker. `pnpm dev:workers` owns both
workerd Workers. Readiness is bounded; child failure propagates; SIGINT/SIGTERM stops
every child; no daemon or orphan remains.

## VOC-081-AC-03 — Local-stack smoke proves D1 and the Worker boundary

- Requirements: R04
- Tasks: T03
- Tests: TEST-03
- Evidence: EV-03
- Result: pending

The disposable smoke proves empty/repeat migrations, health/config, direct API,
web static/SSR/middleware, observable service binding, one controlled D1 persistence
restart, negative lifecycle cases, and clean termination without external access.

## VOC-081-AC-04 — Development never rewrites repository authority

- Requirements: R02, R05
- Tasks: T00, T03
- Tests: TEST-00, TEST-03
- Evidence: EV-00, EV-03
- Result: pending

Starting/stopping either loop creates no nested generated `AGENTS.md`, `CLAUDE.md`,
or orchestrator state and leaves the tracked tree clean apart from documented ignored
build/local-state output. Existing authority guards remain at least as strong.

## VOC-081-AC-05 — CI remains four-workflow, credential-free, and fail-closed

- Requirements: R05, R06
- Tasks: T03
- Tests: TEST-04
- Evidence: EV-04
- Result: pending

The exact four workflows remain. `ci.yml` requires local-stack evidence where
applicable; PR jobs cannot receive deployment credentials or make remote calls; a
synthetic local-stack failure prevents `ci required` from passing.

## VOC-081-AC-06 — F2 evidence is accurate and does not claim F3/A1 acceptance

- Requirements: R06, R07
- Tasks: T04
- Tests: TEST-05
- Evidence: EV-05
- Result: pending

Docs and the final record agree with executable commands. They disclose platform
limitations and say F2 repository/local acceptance becomes effective only after merge;
F3 staging, A1 product acceptance, production, and all VOC-080 holds remain held.

## VOC-081-AC-07 — Final evidence is exact, independent, hosted, and rollback-tested

- Requirements: all
- Tasks: T04
- Tests: TEST-06
- Evidence: EV-06
- Result: pending

Every task has proportional local validation, hosted path-applicable proof, different-
role exact-SHA review, resolved findings, and repository rollback. The final revision
passes full validation and reverse-order rollback without live-system mutation.
