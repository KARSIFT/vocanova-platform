# VOC-066 — Acceptance Criteria

## VOC-066-AC-00 — Staging and production nginx HEALTHCHECKs no longer fail by construction against the catch-all

- Requirement source: issue #484; `specification.md` scope item for `VOC-066-T00`;
  `VOC-066-D00`
- Tasks: `VOC-066-T00`
- Tests: `VOC-066-TEST-00`, `VOC-066-TEST-01`
- Evidence: `VOC-066-EV-00`
- Result: pending

Observable outcome: both `infra/docker-compose.yml` and
`infra/docker-compose.production.yml` define an nginx `healthcheck.test` that,
when nginx is running with the package's conf changes (if any), receives a
successful HTTP response (2xx, or an explicitly accepted 3xx if Approach B is
authorized with redirect-safe probing). The probe must not be a bare
`http://127.0.0.1/` with no Host header and no dedicated health path while the
default catch-all still returns `444` for that request. Staging and production
use the same approach (`VOC-066-DEP-01`).

## VOC-066-AC-01 — Unrecognized-Host catch-all hardening remains for non-health traffic

- Requirement source: issue #484 (must not undo intentional 444 policy);
  VOC-032-D03 as cited in `05-default.conf`; `specification.md` non-goals
- Tasks: `VOC-066-T00`
- Tests: `VOC-066-TEST-02`
- Evidence: `VOC-066-EV-00`
- Result: pending

Observable outcome: a request to the default server for a non-health path (at
minimum `GET /` with absent or unrecognized Host on :80 and :443) still results
in nginx closing with `444` (or equivalent no-response catch-all behavior). If
Approach A adds `/healthz`, that exception is exact-match only and does not
proxy to `web`/`api` or return application content.

## VOC-066-AC-02 — Deterministic regression check catches bare catch-all-failing probes

- Requirement source: issue #484 impact (health signal must stay trustworthy);
  `specification.md` `VOC-066-T01`
- Tasks: `VOC-066-T01`
- Tests: `VOC-066-TEST-03`
- Evidence: `VOC-066-EV-01`
- Result: pending

Observable outcome: a deterministic check (script or test wired into normal CI /
documented `pnpm`/shell validation) fails if either compose file's nginx
HEALTHCHECK regresses to a bare `http://127.0.0.1/` probe incompatible with the
444 catch-all, and passes against the post-fix files. Implementer records how
the check encodes the chosen approach (path assertion and/or Host-header
assertion).

## VOC-066-AC-03 — Live containers report healthy without breaking real traffic

- Requirement source: issue #484 evidence of permanent unhealthy while site works;
  `specification.md` `VOC-066-T02`
- Tasks: `VOC-066-T02`
- Tests: `VOC-066-TEST-04`
- Evidence: `VOC-066-EV-02`
- Result: pending

Observable outcome: after the fixed config is loaded into running containers
(recreate/redeploy per `VOC-066-DEP-02`), `docker inspect` (or `docker ps`) shows
staging nginx healthy; once production has picked up the same revision,
production nginx is healthy too. Concurrently: real hostname HTTPS check still
returns 200 for the web vhost used on that tier, and a deliberately
unrecognized-Host `GET /` still yields `444`/connection-close behavior.
