# VOC-081 Tasks

## VOC-081-T00 — Canonical local contract and policy

- Requirements: R01, R05
- Acceptance: AC-01, AC-04
- Tests: TEST-00
- Evidence: EV-00
- Status: authorized-after-pr-102-merge

Define canonical ports/origins/state, set supported Next configuration to prevent
generated nested agent files, update the local OAuth callback and identity-parity
fixture from 8787 to 8080, regenerate `worker-configuration.d.ts` through the existing
`types:write` entry point, make the authority guard reject generated markers at any
repository depth, extend environment/config consistency, and add a pure fail-closed
local-development policy with negative fixtures. Do not launch processes.

## VOC-081-T01 — Local D1 initialization

- Requirements: R00, R05
- Acceptance: AC-00
- Tests: TEST-01
- Evidence: EV-01
- Status: blocked-by-T00

Add `dev:init` and app-level migration entry points using explicit local config, `DB`,
state path, and forward migrations. Test empty, repeat, failed migration, wrong env,
remote flag, and state isolation. No remote resource or destructive developer reset.

## VOC-081-T02 — Supervised fast and two-Worker development loops

- Requirements: R01, R02, R03
- Acceptance: AC-01, AC-02
- Tests: TEST-02
- Evidence: EV-02
- Status: blocked-by-T01

Implement the Node supervisor, port preflight, API readiness, Next fast loop,
OpenNext/workerd loop, shared local persistence, cross-command service binding, bounded
signal cleanup, and concrete error reporting. Use no shell backgrounding or daemon.

## VOC-081-T03 — Disposable local-stack smoke and CI requirement

- Requirements: R04, R05, R06
- Acceptance: AC-03, AC-04, AC-05
- Tests: TEST-03, TEST-04
- Evidence: EV-03, EV-04
- Status: blocked-by-T02

Add the full disposable integration smoke, lifecycle failure fixtures, tree-clean
contract, `ci:local-stack`, and a required `local stack` job inside `ci.yml`. Keep all
four workflows credential-free and deployment jobs held/skipped.

## VOC-081-T04 — F2 evidence, rollback, review, and hosted proof

- Requirements: all
- Acceptance: AC-06, AC-07
- Tests: TEST-05, TEST-06
- Evidence: EV-05, EV-06
- Status: blocked-by-T03

Reconcile docs and indexes; produce the exact F2 repository/local evidence record; run
full repository, local-stack, governance, quality, security, and rollback validation;
obtain different-role exact-SHA review; publish stacked draft PR evidence; and restore
intended bases. Do not merge, deploy, mutate settings, or release inherited holds.
