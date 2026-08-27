# VOC-100 — Test Plan

## VOC-100-TEST-00 — Package lifecycle and fixed two-PR shape

- Covers: `VOC-100-AC-00`
- Procedure: run governance validation and inspect adopted bookkeeping, task mapping,
  path inventory, and absence of self-effectiveness fields.
- Expected: exact adopted SHA, true authorization fields, one task/two ordered PRs,
  recorded split overhead, no recursive future package gate, and all external effects
  separately held.
- Evidence: `VOC-100-EV-00`

## VOC-100-TEST-01 — GitHub environment boundary

- Covers: `VOC-100-AC-01`
- Procedure: sanitize API readback for environment, required reviewer, self-review,
  admin bypass, complete custom branch-policy list, environment secret names, and
  repository/organization secret names; scan workflows/logs/diffs/artifacts.
- Expected: reviewer is only `NegarJafari`, self-review/admin bypass are false, the
  sole custom branch policy is `develop`, exactly two environment secret names exist,
  neither exists at broader scope, and no token value is disclosed.
- Evidence: `VOC-100-EV-01`

## VOC-100-TEST-02 — Token contract and rotation

- Covers: `VOC-100-AC-01`
- Procedure: use separately authorized Cloudflare dashboard policy readback to prove
  one-account/exact-permission/expiry scope; use verification endpoint only for status
  and expiry and Wrangler only for account identity; exercise create, verify, install,
  no-write environment credential check, revoke-old and every rollback boundary.
- Expected: one account, Workers Scripts Edit and D1 Edit only, no token-management/
  DNS/billing/data permission, usable across dispatches, expiry within 90 days, and
  the old token remains recoverable until the installed replacement passes no-write.
- Evidence: `VOC-100-EV-01`

## VOC-100-TEST-03 — Positive staging event

- Covers: `VOC-100-AC-02`
- Procedure: run credential-free fixtures for actor `m-e-h-r-d-a-a-d`, manual
  `develop`, SHA-bound confirmation, exact live environment-protection response,
  active staging manifest, zero cost, required jobs, then environment approval.
- Expected: pre-environment gate passes without secrets; only after `NegarJafari`
  approval may the environment job run and expose credentials to bounded steps.
- Evidence: `VOC-100-EV-02`

## VOC-100-TEST-04 — Negative events and rollback discovery

- Covers: `VOC-100-AC-02`
- Procedure: test wrong actor; push, PR, pull_request_target and reusable events;
  wrong ref/SHA confirmation; missing/wrong reviewer, self-review/admin bypass,
  extra/wrong branch policy; nonzero cost; broader secret duplication; wrong account/
  resources; absent environment secrets; production selection; missing/mixed/not-
  100%-single current deployments; and failed promotion/smoke. Parse the workflow job
  graph to prove no non-environment job can evaluate either secret reference.
- Expected: each invalid case fails before mutation; valid current deployments yield
  exact API/web rollback IDs; promotion/smoke failure invokes Worker rollback only.
- Evidence: `VOC-100-EV-02`

## VOC-100-TEST-05 — Retained Cloudflare staging invariants

- Covers: `VOC-100-AC-03`
- Procedure: run delivery policy/smoke tests, all four Wrangler dry runs, generated
  types, migration order, secret scan, and production comparison. Append `--help` to
  the exact locked-Wrangler staging D1 migration, deployments-status, version-deploy,
  and rollback argument shapes so parsing is credential-free; assert migration apply
  omits unsupported experimental provisioning/auto-create flags.
- Expected: exact resources/bindings/routes/D1/eeur, immutable versions, smoke,
  synthetic privacy, Free/$0, and forward-corrective D1 behavior remain enforced.
- Evidence: `VOC-100-EV-03`

## VOC-100-TEST-06 — Production separation

- Covers: `VOC-100-AC-04`
- Procedure: exercise production event fixtures and compare all production manifest,
  Wrangler, environment, secret, route, D1, traffic, and data sentinels.
- Expected: production always fails held; `main` and separate environment/token are
  necessary but insufficient until a later adopted package and exact action authority.
- Evidence: `VOC-100-EV-04`

## VOC-100-TEST-07 — Full exact revision verification

- Covers: `VOC-100-AC-05`
- Procedure: for PR1 and PR2 run applicable local/hosted commands, inventory paths,
  scan historical records for zero diffs, and obtain exact-SHA specialist/R4 reviews.
- Expected: all checks and reviews PASS with zero blockers on the exact final SHA;
  each implementation PR is eligible for a distinct non-author merge; PR2 is
  documentation-only and no plan/package was inserted between PR1 and PR2.
- Evidence: `VOC-100-EV-05`
