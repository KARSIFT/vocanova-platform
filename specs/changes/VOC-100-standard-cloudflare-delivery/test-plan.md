# VOC-100 — Test Plan

## VOC-100-TEST-00 — Package lifecycle and one-PR shape

- Covers: `VOC-100-AC-00`
- Procedure: run governance validation and inspect adopted bookkeeping, task mapping,
  path inventory, and absence of self-effectiveness fields.
- Expected: exact adopted SHA, true authorization fields, one task/implementation PR,
  no recursive future package gate, and all external effects separately held.
- Evidence: `VOC-100-EV-00`

## VOC-100-TEST-01 — GitHub environment boundary

- Covers: `VOC-100-AC-01`
- Procedure: sanitize API readback for environment name, selected branch policy,
  secret names, and repository secret names; scan logs/diffs/artifacts.
- Expected: staging permits only `develop`; exactly two environment secret names;
  neither name at repository scope; no values disclosed.
- Evidence: `VOC-100-EV-01`

## VOC-100-TEST-02 — Token contract and rotation

- Covers: `VOC-100-AC-01`
- Procedure: verify token against Cloudflare's verification endpoint and sanitized
  permission/account readback; rehearse replacement-first/revoke-old procedure without
  storing the value.
- Expected: one account, Workers Scripts Edit and D1 Edit only, usable across
  dispatches, maximum 90-day rotation, no DNS/billing/production-data permissions.
- Evidence: `VOC-100-EV-01`

## VOC-100-TEST-03 — Positive staging event

- Covers: `VOC-100-AC-02`
- Procedure: run credential-free policy fixtures for manual `develop` staging with
  exact confirmation, event SHA, active staging manifest, and zero cost.
- Expected: gate passes without network or secret access and produces only sanitized
  resource/smoke outputs.
- Evidence: `VOC-100-EV-02`

## VOC-100-TEST-04 — Negative events and rollback discovery

- Covers: `VOC-100-AC-02`
- Procedure: test push/PR events, wrong ref, wrong confirmation, nonzero cost, wrong
  account/resources, absent secrets, held staging, production selection, missing or
  mixed current deployments, and failed promotion/smoke.
- Expected: each invalid case fails before mutation; valid current deployments yield
  exact API/web rollback IDs; promotion/smoke failure invokes Worker rollback only.
- Evidence: `VOC-100-EV-02`

## VOC-100-TEST-05 — Retained Cloudflare staging invariants

- Covers: `VOC-100-AC-03`
- Procedure: run delivery policy/smoke tests, all four Wrangler dry runs, generated
  type checks, migration-order validation, secret scan, and production comparison.
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
- Procedure: run all local/hosted commands, inventory changed paths, scan historical
  packages for zero diffs, and obtain Cloudflare, security/settings, and R4 reviews.
- Expected: all checks and reviews PASS with zero blockers on the exact final SHA;
  one implementation PR is eligible for a distinct non-author merge.
- Evidence: `VOC-100-EV-05`
