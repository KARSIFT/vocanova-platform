# VOC-066 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package and each task are approved and implementation is
authorized (AGENTS.md: an issue alone is not implementation authority). Expected
targets are under `infra/` (R3 path floor). Adoption must have resolved
`VOC-066-DEP-01` (approach) before `VOC-066-T00` proceeds; if adoption is silent
on the health path name for Approach A, use `/healthz` per
`specification.md` open question 3.

## File reconciliation and implementation sequence

Drafting-time targets (read; do not edit outside the package until authorized):

| File | Role |
|---|---|
| `infra/docker-compose.yml` | Staging nginx HEALTHCHECK (identical broken probe) |
| `infra/docker-compose.production.yml` | Production nginx HEALTHCHECK (identical broken probe) |
| `infra/nginx/conf.d/05-default.conf` | Staging catch-all `444` (touched only for Approach A) |
| `infra/nginx-production/conf.d/05-default.conf` | Production catch-all `444` (touched only for Approach A) |

No conflicting in-flight package against these HEALTHCHECK lines is known at
drafting time. Companion nginx-unification work must not be folded in.

Ordered steps:

1. **`VOC-066-T00` — Apply the adopted approach to both tiers in one PR.**
   - If Approach A: update both `05-default.conf` files so an exact-match health
     location returns 200 on the default server; restructure `return 444` into a
     non-health `location` (or equivalent) so it still covers `/` and other paths;
     point both compose HEALTHCHECKs at `http://127.0.0.1/healthz` (or the agreed
     path). Keep interval/timeout/retries/start_period unless a concrete reason
     to change them is recorded in evidence.
   - If Approach B: leave catch-all conf unchanged; update both compose
     HEALTHCHECK commands per adoption constraints (Host header; HTTP vs HTTPS;
     redirect behavior). Staging Host must be `staging.vocanova.site`; production
     Host must match the deployed `__PRODUCTION_WEB_HOST__` substitution
     (default `production.vocanova.site`).
   - Update nearby compose comments so they no longer claim a bare local GET is
     sufficient "nginx is up" proof if that claim becomes false.
   - Verify with local `nginx -t` / compose config read and, where feasible,
     a disposable local compose run of the health probe.

2. **`VOC-066-T01` — Deterministic regression check.**
   Add a CI-wired or documented script/test that fails on regression to the
   bare catch-all-failing probe in either compose file, consistent with the
   approach chosen in T00. Prefer a small shell or existing infra selftest
   pattern under `infra/scripts/` if that matches house style; do not invent a
   second validation stack.

3. **`VOC-066-T02` — Live verification.**
   After recreate/redeploy on staging (and production once the revision is live
   there), record `docker inspect` health JSON, a successful real-hostname curl,
   and a failing unrecognized-Host `/` probe showing `444`/connection close.
   No further source change expected unless verification surfaces a gap.

## Validation and independent verification

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Plus `VOC-066-TEST-00` through `VOC-066-TEST-04`. Run any new regression script
from T01 as documented in that task's PR.

Independent verification (CLAUDE.md): bind the review to the exact final commit
SHA; confirm ACs with evidence; confirm non-goals preserved (no nginx
unification, no catch-all weakening beyond the exact health exception if A);
confirm Codex/implementer did not approve or merge their own work; report still-
required R3/R4/EHR/adoption/activation gates. Under active A-003, routine R3
does not require standing steward/founder approval merely for being R3;
strengthened controls and independent verification remain required.

## Deployment and rollback

This package does not authorize production deployment. Effect requires container
recreate so Docker picks up the new HEALTHCHECK and (for Approach A) remounted
conf. Rollout follows existing `deploy-staging.yml` / `deploy-production.yml`
(or an operator recreate per `VOC-066-DEP-02`).

Rollback: revert the compose (and conf, if any) changes and recreate nginx, or
redeploy the prior known-good artifact. No migration. Owner named in the
implementation PR at deploy time.
