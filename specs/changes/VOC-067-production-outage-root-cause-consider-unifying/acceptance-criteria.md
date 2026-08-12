# VOC-067 — Acceptance Criteria

## VOC-067-AC-00 — Edge-architecture decision is recorded before shared-edge implementation

- Requirement source: issue #485; `VOC-067-DEP-00`, `VOC-067-DEP-01`,
  `VOC-067-DEP-02`, `VOC-067-DEP-03`
- Tasks: `VOC-067-T00`
- Tests: `VOC-067-TEST-00`
- Evidence: `VOC-067-EV-00`
- Result: pending

T00's decision record states, in writing: (a) shared nginx **or** dual-nginx +
Cloudflare harden; (b) lifecycle ownership (who may recreate vs reload); (c)
whether `VOC-037-D00`/`D01`'s separate-ports / separate-nginx clause is
superseded; (d) Cloudflare cutover order and accountable operator. No T02–T05
implementation PR opens until (a)–(d) are recorded as accepted for the chosen
path.

## VOC-067-AC-01 — Both nginx HEALTHCHECKs report healthy when nginx is serving

- Requirement source: issue #485 ("HEALTHCHECK is permanently broken");
  `VOC-067-DEP-04`
- Tasks: `VOC-067-T01`
- Tests: `VOC-067-TEST-01`
- Evidence: `VOC-067-EV-01`
- Result: pending

After T01, `docker inspect` (or compose health status) for staging nginx and
production nginx (or the eventual shared edge container, if T01 is applied
there) shows `healthy` under normal operation. Unmatched-Host requests still
do not receive a normal 2xx site response (catch-all reject behavior preserved).

## VOC-067-AC-02 — Shared nginx binds host 80/443 and routes both tiers by Host/SNI

- Requirement source: issue #485 proposed direction; `specification.md`
  proposed design defaults
- Tasks: `VOC-067-T02`
- Tests: `VOC-067-TEST-02`
- Evidence: `VOC-067-EV-02`
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves to shared nginx

One nginx process listens on host `80`/`443`, is attached to both
`vocanova-net` and `vocanova-production-net`, and routes
`staging.vocanova.site` / `api-staging.vocanova.site` to staging upstreams and
`production.vocanova.site` / `api-production.vocanova.site` to production
upstreams. Production no longer requires publishing `8081`/`8443` for public
HTTPS.

## VOC-067-AC-03 — Per-tier deploy pipelines cannot write the other tier's nginx config or certs

- Requirement source: issue #485 isolation constraints; `VOC-037-D01`
- Tasks: `VOC-067-T03`
- Tests: `VOC-067-TEST-03`
- Evidence: `VOC-067-EV-03`
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves to shared nginx

`deploy-staging.yml` may change only staging's nginx conf/certs tree;
`deploy-production.yml` may change only production's. Neither workflow gains a
step that writes, `chown`s, or extracts into the other tier's nginx or secrets
paths. Reload of the shared process is allowed only after `nginx -t` succeeds.

## VOC-067-AC-04 — A failed nginx -t on one tier's deploy leaves the other tier serving

- Requirement source: issue #485 lifecycle tradeoff; `VOC-067-DEP-01`
- Tasks: `VOC-067-T03`
- Tests: `VOC-067-TEST-04`
- Evidence: `VOC-067-EV-03`
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves to shared nginx

If a deploy writes a broken vhost fragment and `nginx -t` fails, that deploy
fails closed, the shared nginx process is not reloaded/recreated, and the
other tier's already-loaded config continues to serve.

## VOC-067-AC-05 — Production public URLs no longer require :8443 once shared edge is live

- Requirement source: issue #485 (ordinary `:443 → origin :443`); VOC-041 /
  VOC-042 workaround reversal
- Tasks: `VOC-067-T04`
- Tests: `VOC-067-TEST-05`
- Evidence: `VOC-067-EV-04`
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves to shared nginx

Production `API_BASE_URL`, deploy-emitted `BASE_URL` / OAuth redirect /
allow-list values, and documented client-facing production HTTPS URLs use
ordinary hostnames without `:8443`. Repository docs no longer claim the
Cloudflare origin-port remap is required for production on this host.

## VOC-067-AC-06 — Live cutover: Cloudflare remap removed; both tiers healthy on :443

- Requirement source: issue #485 root-cause removal; `VOC-067-DEP-03`
- Tasks: `VOC-067-T05`
- Tests: `VOC-067-TEST-06`
- Evidence: `VOC-067-EV-05`
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves to shared nginx

After cutover, Cloudflare no longer remaps production hostnames to origin
`:8443`. External HTTPS to staging and production web/API hostnames on `:443`
returns success responses consistent with pre-cutover origin health.
Rollback steps (restore remap and/or prior compose generation) are recorded
and confirmed workable.

## VOC-067-AC-07 (alternate path) — Dual-nginx + Cloudflare harden, only if DEP-00 rejects shared nginx

- Requirement source: issue #485 (design decision, not mandate);
  `VOC-067-DEP-00`
- Tasks: `VOC-067-T00` (record), plus any follow-up tasks the decision record
  explicitly adds in place of T02–T05
- Tests: `VOC-067-TEST-07`
- Evidence: `VOC-067-EV-00`, plus whatever evidence the alternate tasks define
- Result: pending — evaluated only if `VOC-067-DEP-00` resolves against shared
  nginx

If shared nginx is rejected, T00 records the alternate hardening scope
(monitoring/alerting on the remap, documented recovery, ownership) and
cancels T02–T05 as out-of-scope for this package rather than leaving them
indefinitely pending. T01 remains in scope either way.
