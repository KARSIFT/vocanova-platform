# VOC-067 — Test Plan

## VOC-067-TEST-00 — Decision record completeness

- Covers: `VOC-067-AC-00`
- Preconditions: `VOC-067-T00` evidence file exists under this package.
- Procedure: Read the decision record and confirm it explicitly resolves
  `VOC-067-DEP-00`, `DEP-01`, `DEP-02`, and `DEP-03` (or records a deliberate
  deferral with owner for DEP-03 only if shared path is rejected). Confirm
  T02–T05 are either authorized or cancelled.
- Expected result: No silent defaults; human-accepted path is unambiguous.
- Evidence: `VOC-067-EV-00`

## VOC-067-TEST-01 — Nginx HEALTHCHECK becomes healthy without weakening Host reject

- Covers: `VOC-067-AC-01`
- Preconditions: T01 diff applied; ability to run compose locally or inspect
  staging (prefer non-production).
- Procedure:
  1. Confirm container health status becomes `healthy` under normal boot.
  2. Send a request with unknown/missing Host to port 80 (or the published
     HTTP port) and confirm it is still rejected (no normal site 200 from a
     real vhost).
- Expected result: HEALTHCHECK healthy; catch-all reject preserved.
- Evidence: `VOC-067-EV-01`

## VOC-067-TEST-02 — Host-based routing on shared edge (shared path only)

- Covers: `VOC-067-AC-02`
- Preconditions: T02 landed; shared nginx listening on origin `80`/`443`.
- Procedure: From the host or an external network, curl each of
  `staging.vocanova.site`, `api-staging.vocanova.site`,
  `production.vocanova.site`, `api-production.vocanova.site` against origin
  `:443` with matching `Host:` / SNI and confirm responses reach the correct
  tier (e.g. staging vs production distinguishing health or headers). Run
  `nginx -t` inside the shared container.
- Expected result: All four hostnames route correctly on `:443`; `nginx -t`
  exits 0; production does not depend on `:8443` for this check.
- Evidence: `VOC-067-EV-02`

## VOC-067-TEST-03 — Deploy write isolation (shared path only)

- Covers: `VOC-067-AC-03`
- Preconditions: T03 workflow diffs available.
- Procedure: Review both workflows for any path that writes, extracts into,
  or `chown`s the peer tier's nginx/secrets tree. Prefer also running
  `infra/scripts/rehearse-production-secrets-boundary.sh` (or its selftest)
  where environment allows.
- Expected result: No cross-tier write; staging owns only its tree; production
  owns only its tree; reload does not imply peer write.
- Evidence: `VOC-067-EV-03`

## VOC-067-TEST-04 — Failed nginx -t fails closed (shared path only)

- Covers: `VOC-067-AC-04`
- Preconditions: Disposable or staging-safe way to inject a deliberately
  broken vhost fragment for one tier (never leave production broken).
- Procedure: Apply an invalid fragment for one tier, run the deploy's
  `nginx -t` + reload sequence (or the exact extracted commands), observe
  exit code and that the shared process did not reload a bad config; confirm
  the other tier's hostname still responds.
- Expected result: Non-zero failure; peer tier still serves; no container
  recreate required for the failure path.
- Evidence: `VOC-067-EV-03`

## VOC-067-TEST-05 — :8443 removed from production URL configuration (shared path only)

- Covers: `VOC-067-AC-05`
- Preconditions: T04 landed; production origin serving on `:443`.
- Procedure: Grep/inspect compose + `deploy-production.yml` for remaining
  production client URL `:8443` qualifications that are still presented as
  steady-state; curl production web/API on `:443`; spot-check OAuth redirect
  configuration no longer advertises `:8443`.
- Expected result: Steady-state production HTTPS URLs are unported hostnames;
  docs match.
- Evidence: `VOC-067-EV-04`

## VOC-067-TEST-06 — Cloudflare remap removed; external :443 success (shared path only)

- Covers: `VOC-067-AC-06`
- Preconditions: T05 cutover window; operator access to Cloudflare settings.
- Procedure: Confirm origin-port override absent for production hostnames;
  externally request staging and production web/API over HTTPS `:443`;
  record results. Optionally confirm restoring the remap still works as
  rollback (or document why remap restore was rehearsed offline).
- Expected result: Both tiers reachable via ordinary Cloudflare `:443 →
  origin :443`; rollback path recorded.
- Evidence: `VOC-067-EV-05`

## VOC-067-TEST-07 — Alternate-path gate (only if DEP-00 rejects shared nginx)

- Covers: `VOC-067-AC-07`
- Preconditions: T00 selected dual-nginx + Cloudflare harden.
- Procedure: Confirm T02–T05 are cancelled in package docs/issues; confirm
  alternate hardening scope and owner are written; confirm T01 still
  scheduled or done.
- Expected result: No orphan shared-nginx tasks left pending without
  authority.
- Evidence: `VOC-067-EV-00`

## Rollback coverage

Shared path: restore Cloudflare origin-port override; redeploy last-known-good
compose/workflow digests; re-enable prior nginx publish ports if needed.
HEALTHCHECK-only rollback: revert the compose HEALTHCHECK diff.

## Constraints

Tests must not embed secrets or use real end-user production data.
Failure-mode tests that inject bad nginx config must not be left active on
production. Missing Cloudflare or SSH credentials is a recorded limitation,
not a pass.
