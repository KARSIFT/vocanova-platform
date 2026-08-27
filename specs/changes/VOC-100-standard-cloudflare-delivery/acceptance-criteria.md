# VOC-100 — Acceptance Criteria

## VOC-100-AC-00 — One adopted package creates no recursive gate

- Requirements: `VOC-100-D00`, `VOC-100-D10`, `VOC-100-D11`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-00`
- Evidence: `VOC-100-EV-00`
- Result: pending

Before plan merge, the exact reviewed candidate is recorded as adopted with both
implementation authorization fields true. The adopted package contains no false
future `authority_effective` or postmerge self-bookkeeping requirement. It records
exactly the two implementation PRs required by the one-time settings truth boundary.

## VOC-100-AC-01 — Staging uses only environment-scoped credentials

- Requirements: `VOC-100-D02`, `VOC-100-D03`, `VOC-100-D07`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-01`, `VOC-100-TEST-02`
- Evidence: `VOC-100-EV-01`
- Result: pending

Sanitized GitHub readback proves `cloudflare-staging` has required reviewer
`NegarJafari`, self-review prevention, admin bypass disabled, exactly one custom
deployment branch rule for `develop`, and exactly `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN` environment secret names. Repository and organization secret
readback show neither name. The account ID is classified non-secret; no token value
appears anywhere in evidence. Sanitized Cloudflare dashboard evidence proves the exact
account, two permissions, status, and maximum-90-day expiry before secret entry.

## VOC-100-AC-02 — Manual staging delivery has a small deterministic gate

- Requirements: `VOC-100-D04`, `VOC-100-D05`, `VOC-100-D06`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-03`, `VOC-100-TEST-04`
- Evidence: `VOC-100-EV-02`
- Result: pending

The workflow has no five-record binder inputs or comment fetch. A staging dispatch
fails unless the actor is `m-e-h-r-d-a-a-d`, ref is `develop`, confirmation includes
the exact event SHA, required same-run checks pass, live environment protections are
exact, `NegarJafari` approves, cost is zero, and account/resources/secrets match.
Current API/web deployment state must be one UUID at 100% each; those IDs are captured
before promotion and used for Worker rollback. PR/push/validation paths cannot read
or enter a job that can evaluate either environment secret.

## VOC-100-AC-03 — Existing staging safety remains intact

- Requirements: `VOC-100-D01`, `VOC-100-D05`
- Task: `VOC-100-T00`
- Tests: `VOC-100-TEST-05`
- Evidence: `VOC-100-EV-03`
- Result: pending

All exact staging resources, D1 placement/migrations, immutable upload/promotion,
smoke, synthetic-only data, privacy, and Free/$0 assertions pass. The exact locked
Wrangler staging migration, deployment-status readback, version promotion, and
rollback invocations parse without authentication; D1 migration apply contains no
unsupported experimental provisioning flags. Negative tests prove wrong account,
resource, binding, route, migration order, deployment traffic, or cost fails first.

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

The ordered delivery-control PR and documentation-only settings-truth PR update every
inventoried living surface, pass applicable local/hosted checks, and receive fresh
exact-SHA reviews before different actors merge them. No new package or plan is
created between them or for ordinary deployment. Historical packages remain
unchanged.
