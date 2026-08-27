# VOC-100 — Acceptance Criteria

## VOC-100-AC-00 — One adopted package creates no recursive gate

- Requirements: `VOC-100-D00`, `VOC-100-D10`, `VOC-100-D11`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-00`
- Evidence: `VOC-100-EV-00`
- Result: pending

Before plan merge, the exact reviewed candidate is recorded as adopted with both
implementation authorization fields true. The adopted package contains no false
future `authority_effective`, postmerge self-bookkeeping requirement, or planned
second implementation PR.

## VOC-100-AC-01 — Staging uses only environment-scoped credentials

- Requirements: `VOC-100-D02`, `VOC-100-D03`, `VOC-100-D07`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-01`, `VOC-100-TEST-02`
- Evidence: `VOC-100-EV-01`
- Result: pending

Sanitized GitHub readback proves `cloudflare-staging` is selected-branch restricted
to `develop` and contains exactly `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` as environment secret names. Repository secret readback shows
neither name. No secret value appears anywhere in evidence.

## VOC-100-AC-02 — Manual staging delivery has a small deterministic gate

- Requirements: `VOC-100-D04`, `VOC-100-D05`, `VOC-100-D06`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-03`, `VOC-100-TEST-04`
- Evidence: `VOC-100-EV-02`
- Result: pending

The workflow has no five-record binder inputs or network comment fetch. A staging
dispatch fails on any trigger other than manual, any ref other than `develop`, wrong
confirmation, nonzero cost, account/resource drift, missing secrets, or held
manifest. Required same-run validation finishes before the environment job. Current
API/web deployment IDs are captured before promotion and used for Worker rollback.

## VOC-100-AC-03 — Existing staging safety remains intact

- Requirements: `VOC-100-D01`, `VOC-100-D05`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-05`
- Evidence: `VOC-100-EV-03`
- Result: pending

All exact staging resources, D1 placement/migrations, immutable upload/promotion,
smoke, synthetic-only data, privacy, and Free/$0 assertions pass. Negative tests prove
wrong account, resource, binding, route, migration order, or cost fails before write.

## VOC-100-AC-04 — Production remains separate and impossible to activate

- Requirements: `VOC-100-D08`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-06`
- Evidence: `VOC-100-EV-04`
- Result: pending

Production uses a separate future environment/token and `main` restriction. Current
tests prove production remains held with sentinels intact, no production secret is
required or exposed in PR/staging jobs, and staging authorization cannot select or
mutate production.

## VOC-100-AC-05 — Final implementation is coherent and independently verified

- Requirements: `VOC-100-D09`, `VOC-100-D10`, `VOC-100-D11`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-07`
- Evidence: `VOC-100-EV-05`
- Result: pending

One implementation PR updates every inventoried living surface, passes all local and
hosted checks, and receives fresh exact-SHA Cloudflare, security/settings, and R4
PASS reviews before a different actor merges it. Historical packages remain
unchanged.
