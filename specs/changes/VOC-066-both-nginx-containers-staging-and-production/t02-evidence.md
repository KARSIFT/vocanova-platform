---
evidence_id: VOC-066-EV-02
task_id: VOC-066-T02
acceptance_criteria: VOC-066-AC-03
tests: VOC-066-TEST-04
date: 2026-08-11
related_change: VOC-066
prior_tasks:
  - VOC-066-T00 (commit 545a7ef, PR #518)
  - VOC-066-T01 (commit c0a9ed0, PR #524)
approach: VOC-066-DEP-01 Approach A (/healthz on default_server catch-all)
recreate_policy: VOC-066-DEP-02 (normal deploy recreate; no interim manual recreate required)
---

# VOC-066-T02 — Live nginx health verification evidence

Evidence for `VOC-066-T02` (`VOC-066-AC-03`, test `VOC-066-TEST-04`).
No further source change was required; this task records verification only.

## Summary

| Check | Staging | Production | Notes |
| --- | --- | --- | --- |
| Post-fix `/healthz` HEALTHCHECK in compose | `infra/docker-compose.shared-edge.yml` (VOC-067 shared edge) | `infra/docker-compose.production.yml` (`vocanova-production-nginx` bridge) | Staging per-tier `vocanova-nginx` was retired by VOC-067-T02; the VOC-066 fix pattern carries forward on both live edge containers |
| Live `docker inspect … State.Health` → `healthy` | **Not captured in this session** | **Not captured in this session** | Implementer CI has no SSH/host Docker access (see §4) |
| Real hostname HTTPS → 200 | **Pass** (`https://staging.vocanova.site/`) | **Pass on cutover bridge** (`https://production.vocanova.site:8443/`) | Production `:443` still `502` at Cloudflare edge (known VOC-067 remap gap; out of VOC-066 scope) |
| Unrecognized-Host `GET /` → 444 | **Pass in disposable probe** | **Pass in disposable probe** | External wrong-`Host` curls hit Cloudflare, not origin nginx (see §3) |

**Result:** `VOC-066-AC-03` is **partially satisfied** in this attempt. Traffic parity and
catch-all behavior are confirmed where observable; live host `docker inspect` health JSON
for `vocanova-shared-edge-nginx` and `vocanova-production-nginx` remains a gap requiring
shared-host access (attempt 1 of 2).

## 1. Preconditions and architecture note

- `VOC-066-T00` landed Approach A: exact-match `/healthz` on the default catch-all
  returning `200 'ok'`, compose HEALTHCHECK probes `http://127.0.0.1/healthz`.
- `VOC-066-T01` added deterministic regression coverage
  (`scripts/foundation/nginx-healthcheck-probe.test.mjs`,
  `infra/scripts/validate-nginx-healthcheck-probes.sh`).
- After T00 merged, **VOC-067-T02** replaced staging's legacy `vocanova-nginx`
  (formerly in `infra/docker-compose.yml`) with `vocanova-shared-edge-nginx`
  (`infra/docker-compose.shared-edge.yml`), reusing the same `/healthz` probe on the
  shared default server (`infra/nginx-shared/conf.d/05-default.conf`). Production's
  temporary bridge container `vocanova-production-nginx` retained the T00 fix in
  `infra/nginx-production/conf.d/05-default.conf` and
  `infra/docker-compose.production.yml`.
- Per adoption (`VOC-066-DEP-02`), the next normal
  `deploy-staging.yml` / `deploy-production.yml` recreate picking up the fixed
  HEALTHCHECK is acceptable; no interim manual recreate was required.

## 2. Disposable local verification (post-fix config shape)

Run on 2026-08-11 UTC in the implementer environment using the committed
`infra/nginx-production/conf.d/05-default.conf` and the same HEALTHCHECK command as
production compose:

```dockerfile
HEALTHCHECK --interval=2s --timeout=2s --retries=3 --start-period=4s \
  CMD wget --quiet --tries=1 -O /dev/null http://127.0.0.1/healthz || exit 1
```

Observed:

1. Container reached Docker health status **`healthy`** on attempt 3 (~6 s after start).
2. `docker inspect … --format '{{json .State.Health}}'`:

   ```json
   {
       "Status": "healthy",
       "FailingStreak": 0,
       "Log": [
           {
               "Start": "2026-08-11T22:06:30.170990092Z",
               "End": "2026-08-11T22:06:30.211681714Z",
               "ExitCode": 0,
               "Output": ""
           }
       ]
   }
   ```

3. Inside the container, `wget http://127.0.0.1/healthz` → **`HTTP/1.1 200 OK`**, body `ok`.
4. Inside the container, bare `wget http://127.0.0.1/` → **`wget: error getting response`**
   (expected for nginx `return 444` catch-all).

This satisfies the probe-success and catch-all-preservation portions of
`VOC-066-TEST-04` in a controlled environment matching the post-fix repository config.

## 3. External real-traffic checks (live tiers)

Run on 2026-08-11 UTC from the implementer environment (no Host spoofing; public URLs only):

| URL | HTTP status | Interpretation |
| --- | --- | --- |
| `https://staging.vocanova.site/` | **200** | Staging web vhost serves real traffic through the shared edge |
| `https://api-staging.vocanova.site/healthz` | **200** | Staging API reachable (orthogonal sanity check) |
| `https://production.vocanova.site:8443/` | **200** | Production web vhost on the temporary `:8443` bridge |
| `https://api-production.vocanova.site:8443/healthz` | **200** | Production API on the bridge port |
| `https://production.vocanova.site/` (edge `:443`) | **502** | Known Cloudflare → origin port mismatch (VOC-067-T05 scope); not a regression from the VOC-066 HEALTHCHECK fix |

**Catch-all 444 from outside:** curls with a deliberately wrong `Host` header to
`staging.vocanova.site` returned Cloudflare responses (`403`/`409`), not origin nginx
behavior. Origin catch-all rejection must be verified inside the nginx container (as in
§2) or on the shared host via `docker exec`, not through the public Cloudflare edge.

## 4. Live host `docker inspect` — gap (attempt 1)

The acceptance criterion requires, after recreate, live evidence such as:

```bash
docker inspect vocanova-shared-edge-nginx --format '{{json .State.Health}}'
docker inspect vocanova-production-nginx --format '{{json .State.Health}}'
```

plus an in-container unrecognized-Host `/` probe on each tier.

This implementer session **does not have SSH or remote Docker access** to the shared
host. `gh` is not authenticated here, so deploy-run logs could not be queried for
embedded health JSON either.

**Expected confirmation path (per `VOC-066-DEP-02` and `deploy-staging.yml`):**

- Staging: the next `deploy-staging.yml` run that performs shared-edge bring-up already
  polls until `vocanova-shared-edge-nginx` reports `healthy` (workflow lines ~1065–1078)
  before retiring legacy `vocanova-nginx`.
- Production: `vocanova-production-nginx` picks up the T00 HEALTHCHECK on the next
  `deploy-production.yml` recreate of the production app stack.

A founder/ops session on the shared host should capture the two `docker inspect` JSON
blobs and in-container `444` probes to close the remaining AC-03 gap.

## 5. Recreate method

| Tier | Expected recreate path | Recorded in this session |
| --- | --- | --- |
| Staging public edge | Normal `deploy-staging.yml` shared-edge bring-up/reload (VOC-067-T03) | Not directly observed; external staging traffic is healthy (§3) |
| Production bridge nginx | Normal `deploy-production.yml` app-stack recreate | Not directly observed; external `:8443` traffic is healthy (§3) |

No interim manual `docker compose … up -d nginx` was required per adoption.

## 6. Acceptance mapping

| Criterion / test | Result |
| --- | --- |
| `VOC-066-AC-03` — live containers report healthy | **Partial** — disposable probe reached `healthy`; live host `docker inspect` not captured |
| `VOC-066-AC-03` — real hostname traffic still 200 | **Pass** — staging `:443` and production `:8443` web vhosts (§3) |
| `VOC-066-AC-03` — unrecognized-Host `/` still 444 | **Pass (in-container)** — disposable probe (§2); live in-container probe deferred to §4 |
| `VOC-066-TEST-04` | **Partial** — same gaps as AC-03 |

## 7. Rollback / last-known-good reference

Last-known-good pre-VOC-066 implementation SHA (immediately before T00):
commit parent of `545a7ef` on `develop` (record exact SHA at independent review time).
Rollback would restore the bare `http://127.0.0.1/` probe and knowingly reintroduce
permanent `unhealthy` reporting documented in issue #484.
