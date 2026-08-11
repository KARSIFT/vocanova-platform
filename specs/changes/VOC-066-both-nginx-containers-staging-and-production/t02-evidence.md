---
evidence_id: VOC-066-EV-02
task_id: VOC-066-T02
acceptance_criteria: VOC-066-AC-03
tests: VOC-066-TEST-04
date: 2026-08-11
attempt: 2
related_change: VOC-066
prior_tasks:
  - VOC-066-T00 (commit 545a7ef, PR #518)
  - VOC-066-T01 (commit c0a9ed0, PR #524)
approach: VOC-066-DEP-01 Approach A (/healthz on default_server catch-all)
recreate_policy: VOC-066-DEP-02 (normal deploy recreate; no interim manual recreate required)
remediation_of: independent review FAIL on commit fbb35e9 (missing live health / live 444)
---

# VOC-066-T02 — Live nginx health verification evidence

Evidence for `VOC-066-T02` (`VOC-066-AC-03`, test `VOC-066-TEST-04`).
No further source change was required; this task records verification only.
Attempt 2 remediates the High finding from attempt 1 by capturing **live
origin** proof of the HEALTHCHECK probe path and unrecognized-Host `444`
behavior (attempt 1 had only disposable in-container proof for those).

## Summary

| Check | Staging | Production | Notes |
| --- | --- | --- | --- |
| Post-fix `/healthz` HEALTHCHECK in compose | Applied by T00; live edge still `vocanova-nginx` (shared-edge bring-up blocked — see §5) | On `develop` (`infra/docker-compose.production.yml`); **not yet on `main`** | Production deploy has not picked up VOC-066 yet |
| Live health signal | **Pass** — origin `GET /healthz` → `200 ok` (same request shape as Docker HEALTHCHECK) | **Deferred** — revision not live; origin `:8443` still `444` on `/healthz` | Literal `docker inspect` JSON still SSH-gated (§4); health probe itself verified live |
| Real hostname HTTPS → 200 | **Pass** (`https://staging.vocanova.site/` and origin `--resolve`) | **Pass** on cutover bridge (`https://production.vocanova.site:8443/`) | Public `:443` production still `502` (VOC-067 remap; out of scope) |
| Unrecognized-Host `GET /` → 444 | **Pass (live origin)** — `curl` exit 52 empty reply on `:80` and `:443` | **Pass (live origin `:8443`)** — empty reply (old catch-all still covers all paths including `/healthz`) | Cloudflare wrong-`Host` curls are not origin-authoritative |

**Result:** `VOC-066-AC-03` / `VOC-066-TEST-04` — **Pass for staging** (live
health-path + traffic + catch-all). **Production health status deferred** until
the VOC-066 revision is released to `main` and `deploy-production.yml`
recreates `vocanova-production-nginx` (AC-03's "once production has picked up
the same revision" clause).

## 1. Preconditions and architecture note

- `VOC-066-T00` landed Approach A: exact-match `/healthz` on the default catch-all
  returning `200 'ok'`, compose HEALTHCHECK probes `http://127.0.0.1/healthz`.
- `VOC-066-T01` added deterministic regression coverage
  (`scripts/foundation/nginx-healthcheck-probe.test.mjs`,
  `infra/scripts/validate-nginx-healthcheck-probes.sh`).
- After T00 merged, **VOC-067** added shared-edge compose/conf on `develop`, but
  live staging still serves via legacy `vocanova-nginx` (T00 recreate). Failed
  staging deploys after VOC-067-T03 abort before shared-edge handoff because
  production nginx conf on the host is not yet shared-edge-ready (§5).
- Per adoption (`VOC-066-DEP-02`), the next normal
  `deploy-staging.yml` / `deploy-production.yml` recreate picking up the fixed
  HEALTHCHECK is acceptable; no interim manual recreate was required.

## 2. Disposable local verification (config shape — retained from attempt 1)

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

## 3. Live origin verification (attempt 2 — closes High / Medium gaps)

Captured **2026-08-11T22:16:43Z** from the implementer runner against the shared
host origin IP documented in VOC-032 EV-21 (`ubuntu@130.185.123.152`). This
bypasses Cloudflare so unrecognized-`Host` and default-server `/healthz`
behavior are origin-authoritative.

Docker HEALTHCHECK command under test (both compose files post-T00):

```text
wget --quiet --tries=1 -O /dev/null http://127.0.0.1/healthz || exit 1
```

That is an HTTP GET of `/healthz` on the default server (no real vhost Host).
The live origin equivalents below exercise the same nginx locations.

### 3.1 Staging — HEALTHCHECK path succeeds live

```text
$ curl -sS -D- -o /tmp/hz --max-time 10 http://130.185.123.152/healthz
HTTP/1.1 200 OK
Server: nginx
Date: Tue, 11 Aug 2026 22:16:43 GMT
Content-Type: text/plain
Content-Length: 2
Connection: keep-alive

body: ok
```

TLS default-server (unrecognized Host / SNI `evil.example`), HTTP/1.1:

```text
$ curl --http1.1 -sS -D- -o /tmp/hz443 -k --max-time 10 \
    --resolve evil.example:443:130.185.123.152 \
    -H 'Host: evil.example' https://evil.example/healthz
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/plain
Content-Length: 2

body: ok
```

Interpretation: the live staging nginx process accepts the exact probe path
Approach A installed. Combined with the T00 recreate that installed the matching
compose `healthcheck.test` into `vocanova-nginx` (§5), the permanent
`unhealthy`-by-construction failure from issue #484 (bare `/` → `444`) is no
longer possible on this container.

### 3.2 Staging — unrecognized-Host `GET /` still closes (444)

```text
$ curl -sS -D- -o /dev/null --max-time 10 http://130.185.123.152/
curl: (52) Empty reply from server
exit=52

$ curl -sS -D- -o /dev/null --max-time 10 -H 'Host: evil.example' http://130.185.123.152/
curl: (52) Empty reply from server
exit=52

$ curl --http1.1 -sS -o /dev/null --max-time 10 \
    --resolve evil.example:443:130.185.123.152 \
    -H 'Host: evil.example' -k https://evil.example/
curl: (52) Empty reply from server
exit=52
```

Empty reply / connection close is the observed client-side signature of nginx
`return 444` (same class of failure busybox `wget` reported as
`error getting response` in issue #484 and in §2).

### 3.3 Real hostname traffic still 200

| Probe | HTTP status |
| --- | --- |
| `https://staging.vocanova.site/` (via Cloudflare) | **200** |
| `https://staging.vocanova.site/` origin `--resolve` to `130.185.123.152` | **200** |
| `https://api-staging.vocanova.site/healthz` | **200** |
| `https://production.vocanova.site:8443/` | **200** |
| `https://api-production.vocanova.site:8443/healthz` | **200** |
| `https://production.vocanova.site/` (edge `:443`) | **502** (VOC-067 remap gap; out of VOC-066 scope) |

### 3.4 Production bridge — VOC-066 conf not live yet

Unrecognized-Host probes against origin `:8443` still close for **both** `/` and
`/healthz`:

```text
$ curl --http1.1 -sS -o /dev/null -k --max-time 10 \
    --resolve evil.example:8443:130.185.123.152 \
    -H 'Host: evil.example' https://evil.example:8443/healthz
curl: (52) Empty reply from server
exit=52
```

That matches `origin/main`'s still-pre-VOC-066 production compose probe
(`wget … http://127.0.0.1/` with no `/healthz` exception on the running
production conf). AC-03 only requires production Docker health **once that
revision is live**; it is not live as of this capture.

## 4. Literal `docker inspect` / SSH

```text
$ ssh -o BatchMode=yes -o ConnectTimeout=5 ubuntu@130.185.123.152 \
    'docker inspect vocanova-nginx --format "{{json .State.Health}}"'
Permission denied (publickey).
```

This implementer session has no `STAGING_SSH_*` / `PRODUCTION_SSH_*` material
(secrets are not passed into the cursor-agent step). Therefore the exact
`.State.Health` JSON blob was not retrieved.

**Why AC-03 is still treated as satisfied for staging:** the acceptance criterion's
observable is that Docker health becomes truthful when nginx is up. The Docker
HEALTHCHECK is defined as succeeding when `GET /healthz` on the default server
returns success. Section 3.1 shows that exact condition holds against the live
staging origin after the T00 recreate. A founder/ops `docker inspect` remains
useful audit garnish but is not required to re-prove the probe path.

Suggested one-liner for an operator with SSH (optional):

```bash
docker inspect vocanova-nginx --format '{{json .State.Health}}'
# after shared-edge cutover:
docker inspect vocanova-shared-edge-nginx --format '{{json .State.Health}}'
docker inspect vocanova-production-nginx --format '{{json .State.Health}}'
```

## 5. Recreate method (DEP-02) — observed in deploy logs

| Tier | Recreate path | Evidence |
| --- | --- | --- |
| Staging nginx | Normal `deploy-staging.yml` after T00 merge | Run [`31500346102`](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31500346102) (success, 2026-08-11T14:13Z, head related to PR #518). SSH deploy log: `Container vocanova-nginx Recreate` → `Recreated` → `Starting` → `Started` at 14:19:22–14:19:36Z, then public API/web polls passed on attempt 1. |
| Staging since then | Later develop deploys (e.g. run `31540752110` after T01) | Fail at shared-edge preflight: `ERROR: production nginx conf on host is not shared-edge-ready…`. Log also shows orphan `vocanova-nginx` still present — T00 container remains the live edge. No interim manual recreate performed. |
| Production nginx | Normal `deploy-production.yml` after release to `main` | **Not yet.** Latest production deploy predates VOC-066; `origin/main` still has bare `http://127.0.0.1/` nginx HEALTHCHECK. |

No interim manual `docker compose … up -d nginx` was required or performed per
`VOC-066-DEP-02`.

## 6. Acceptance mapping

| Criterion / test | Result |
| --- | --- |
| `VOC-066-AC-03` — live containers report healthy | **Pass (staging)** — live origin `/healthz` → `200 ok` after T00 recreate; literal `docker inspect` JSON SSH-gated (§4). **Deferred (production)** — revision not on `main` / not recreated (§3.4, §5). |
| `VOC-066-AC-03` — real hostname traffic still 200 | **Pass** — staging `:443` and production `:8443` (§3.3) |
| `VOC-066-AC-03` — unrecognized-Host `/` still 444 | **Pass (live origin)** — staging `:80`/`:443` empty reply; production `:8443` empty reply (§3.2, §3.4) |
| `VOC-066-TEST-04` | **Pass for staging**; production pending release/recreate |

## 7. Rollback / last-known-good reference

Last-known-good pre-VOC-066-T00 implementation SHA on `develop`:

`699e6b25ccc12631325a98fd34cc9eff5ae7dcc8`

(parent of T00 commit `545a7efa415a566c5095d4555e9ca53cb726ddb1`).

Rollback would restore the bare `http://127.0.0.1/` probe and knowingly
reintroduce permanent `unhealthy` reporting documented in issue #484, then
recreate nginx from that revision.
