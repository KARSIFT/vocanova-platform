# VOC-081 Tasks

## VOC-081-T00 — Canonical local contract and policy

- Requirements: R01, R05
- Acceptance: AC-01, AC-04
- Tests: TEST-00
- Evidence: EV-00
- Status: complete; merged through PR #103 as `45480d66fef0247d1d411b9141aebf239eea9142`.

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
- Status: complete; merged through PR #104 as `7d508361c7f9b63430f859e92a7512e960426d7a`.

Add `dev:init` and app-level migration entry points using explicit local config, `DB`,
state path, and forward migrations. Test empty, repeat, failed migration, wrong env,
remote flag, and state isolation. No remote resource or destructive developer reset.

## VOC-081-T02 — Supervised fast and two-Worker development loops

- Requirements: R01, R02, R03
- Acceptance: AC-01, AC-02
- Tests: TEST-02
- Evidence: EV-02
- Status: complete; merged through PR #106 as `e33fe3050e00cf4c64894a8392bda9cfd1f68337`.

Implement the Node supervisor, port preflight, API readiness, Next fast loop,
OpenNext/workerd loop, shared local persistence, cross-command service binding, bounded
signal cleanup, and concrete error reporting. Use no shell backgrounding or daemon.

## VOC-081-T03 — Disposable local-stack smoke and CI requirement

- Requirements: R04, R05, R06
- Acceptance: AC-03, AC-04, AC-05
- Tests: TEST-03, TEST-04
- Evidence: EV-03, EV-04
- Status: complete; merged through PR #107 as `eb32cadf1f58941094d8359d1e82ea43af2306cd`.

Add the full disposable integration smoke, lifecycle failure fixtures, tree-clean
contract, `ci:local-stack`, and a required `local stack` job inside `ci.yml`. Keep all
four workflows credential-free and deployment jobs held/skipped.

## VOC-081-T04 — F2 evidence, rollback, review, and hosted proof

- Requirements: all
- Acceptance: AC-06, AC-07
- Tests: TEST-05, TEST-06
- Evidence: EV-05, EV-06
- Status: complete; final head `a8694932671ad9c44fd2a97c128b14e6089e5faf` merged through PR #108
  as `36d526bdec83e28b17aa30a6814d42b92f058ec1`; post-merge evidence is recorded in the
  VOC-084 closure inventory.

Reconcile docs and indexes; produce the exact F2 repository/local evidence record; run
full repository, local-stack, governance, quality, security, and rollback validation;
obtain different-role exact-SHA review; publish stacked draft PR evidence; and restore
intended bases. These outcomes are complete at the merged T04 revision. Do not deploy,
mutate settings, or release inherited holds; F3, A1, Windows-native, staging, production,
and live activation remain outside this package.
