# VOC-066 — Both nginx Containers Report Unhealthy Permanently: Specification

## Objective and requirement source

Restore a truthful Docker HEALTHCHECK for the staging and production nginx
containers so they report `healthy` when nginx is up and serving, and report
`unhealthy` only when nginx is actually failing — without weakening the
intentional `444` catch-all for unrecognized Host traffic.

Grounded in
[GitHub issue #484](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/484)
(opened 2026-08-11), including its live host evidence (`docker ps`,
`docker inspect` ExitCode 1 / `wget: error getting response`, nginx access logs
showing `444` for Wget probes, successful real-hostname checks), the identical
broken HEALTHCHECK in both compose files, and the requirement that the fix apply
to both `infra/docker-compose.yml` and `infra/docker-compose.production.yml` in
the same change. Not yet approved — see `change.yaml`'s
`requirement_approval_status`.

## Confirmed findings (from issue #484 and drafting-time re-read)

- Staging HEALTHCHECK (`infra/docker-compose.yml`, nginx service):  
  `wget --quiet --tries=1 -O /dev/null http://127.0.0.1/ || exit 1`
- Production HEALTHCHECK (`infra/docker-compose.production.yml`, nginx service):
  identical string.
- Staging catch-all (`infra/nginx/conf.d/05-default.conf`): `server_name _;`
  with `return 444;` on both :80 and :443 default_server blocks (VOC-032-D03
  hardening).
- Production catch-all (`infra/nginx-production/conf.d/05-default.conf`): same
  `return 444` policy on the combined default_server block.
- Real web vhosts (`10-staging-web.conf`, `10-production-web.conf`): port 80
  redirects with `301 https://$host$request_uri`; TLS on 443 proxies to
  `web:3000`. Production `server_name` is the deploy-time-substituted
  `__PRODUCTION_WEB_HOST__` (default `production.vocanova.site` per
  `deploy-production.yml`).
- Staging nginx already has `depends_on: condition: service_healthy` on `web`
  and `api`, but nothing currently depends on nginx being healthy — so the
  permanent unhealthy state has not blocked compose bring-up, only made the
  signal useless.

## Scope and non-goals

In scope:

- `VOC-066-T00`: Change the nginx HEALTHCHECK mechanism so a successful probe
  means "nginx accepted a deliberate health request," not "an unrecognized Host
  somehow got past the catch-all." Apply the chosen approach to **both** staging
  and production in the same implementation PR. Depending on `VOC-066-DEP-01`:
  - **Approach A (recommended):** add a narrow `/healthz` (exact-match location)
    on both default catch-all configs that returns HTTP 200 with a tiny plain
    body, keep `444` for all other paths on unrecognized Host, and point both
    compose HEALTHCHECKs at `http://127.0.0.1/healthz` (or the chosen path).
  - **Approach B (alternative):** keep catch-all configs unchanged; change both
    compose HEALTHCHECKs to send a correct `Host:` header (and, if needed, probe
    HTTPS on 127.0.0.1 with certificate check disabled) so the request matches a
    real vhost without relying on the catch-all. Must not break on the port-80
    `301` → HTTPS redirect (see open question 1).
- `VOC-066-T01`: Deterministic regression check that fails if either compose
  file's nginx HEALTHCHECK regresses to a bare `http://127.0.0.1/` (no Host /
  no dedicated health path) while the catch-all still returns 444 for that
  request shape.
- `VOC-066-T02`: Live verification after recreate that staging (and, once
  production has picked up the change, production) nginx reports `healthy`, that
  real hostname traffic still returns 200, and that unrecognized-Host non-health
  requests still get `444`.

Non-goals / explicitly excluded:

- Unifying or consolidating the two nginx containers (companion issue named by
  #484 — `VOC-066-DEP-03`).
- Changing real vhost routing, TLS certs, Cloudflare, upstream `web`/`api`
  proxies, security headers, or application code.
- Adding new monitoring/alerting products; this only restores Docker's own health
  field.
- Weakening the catch-all to accept bare `/` with no Host (that would defeat
  VOC-032-D03 scanner hardening).
- Immediate production recreate authority — open question 2 / `release-plan.md`.

## Risk and protected areas

Builder assessment: expected paths are under `infra/`, which
`scripts/governance/classify-change-risk.sh` floors at R3, and
`docs/governance/change-risk-classification.md` names production infrastructure
as an R3 category. This package proposes `R3` for the change as a whole (see
`change.yaml`). No schema, secrets, auth decision logic, or governance-authority
change is in scope, so no higher class is proposed — but the reviewing human's
judgment and the path classifier on the real task file list govern, not this
proposal.

EHR is not triggered. No protected governance/workflow YAML is touched unless an
implementer expands scope (forbidden).

## Decisions, contradictions, security, and privacy

`VOC-066-D00` (recorded for traceability; formal decision numbering applies after
adoption): Docker's nginx HEALTHCHECK must exercise a deliberate, always-available
probe path that does not depend on defeating the unrecognized-Host `444` policy.
The catch-all's scanner-hardening purpose (VOC-032-D03) remains in force for
non-health traffic.

No contradiction with prior packages is recorded: VOC-032 deliberately installed
the 444 catch-all; the compose HEALTHCHECK was written as if a bare local GET
were meaningful. This package reconciles those without reversing the catch-all
policy.

Security/privacy:

- Approach A exposes a minimal "nginx is up" signal on `/healthz` for requests
  that hit the default server (including scanners that guess `/healthz`). That
  is an intentional, narrow exception; it must not proxy to upstreams or return
  application data. All other unrecognized-Host paths stay `444`.
- Approach B does not enlarge the catch-all surface but couples the probe to a
  real hostname and possibly TLS/`--no-check-certificate` inside the container.
- No secrets, credentials, or personal data are introduced.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None.
- **Analytics:** None.
- **Accessibility:** None. No UI change.

## Open questions

1. **`VOC-066-DEP-01` — Approach A vs B.** This package recommends Approach A
   (`/healthz` on the catch-all + compose probe to that path) because:
   - Port-80 real vhosts issue `301` to HTTPS; busybox `wget` following that
     redirect to the public hostname from inside the container is fragile
     (DNS/TLS/loopback).
   - Production's `server_name` is a deploy-time placeholder
     (`__PRODUCTION_WEB_HOST__`); baking a Host header into compose must stay
     consistent with whatever host is substituted at deploy.
   - A dedicated health location keeps staging and production probe strings
     identical and independent of hostname.
   Adoption must explicitly accept A, or authorize B with written constraints
   (how redirects/TLS are handled; which Host values; staging vs production
   parity).

2. **`VOC-066-DEP-02` — Recreate timing.** After merge/deploy artifacts update,
   do operators need an interim `docker compose ... up -d nginx` (or equivalent)
   on staging and/or production before the next full deploy, so health status
   becomes truthful immediately?

3. **Health path name.** If Approach A is chosen, is `/healthz` the required
   path (matches the API's existing `/healthz` naming elsewhere in infra docs),
   or may the implementer use another exact-match path (e.g. `/nginx-health`) as
   long as both tiers and the regression check agree? Default assumption if
   adoption is silent: `/healthz`.
