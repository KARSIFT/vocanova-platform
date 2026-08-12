---
evidence_id: VOC-067-EV-05
task_id: VOC-067-T05
acceptance_criteria: VOC-067-AC-06
tests: VOC-067-TEST-06
date: 2026-08-12
related_change: VOC-067
accountable_owner: m-e-h-r-d-a-a-d (founder; VOC-067-DEP-03)
---

# VOC-067-T05 — Live cutover verification and rollback evidence

## Summary

| Requirement | Result |
| --- | --- |
| Shared edge serves both tiers on ordinary `:443` | **Pass** — external HTTPS checks succeed for all four hostnames (§2) |
| Cloudflare origin-port remap removed or absent | **Repository tooling + external pass** — API token not available in implementer run; external `:443` production success is consistent with remap absent (§2–3) |
| Rollback documented and credible | **Pass** — `--restore` path in cutover script; steps in §4 |
| Temporary `:8443` bridge retired | **Pass (repository)** — `vocanova-production-nginx` removed from `docker-compose.production.yml`; deploy no longer reloads bridge (§5) |

Ordered cutover per T00: T02/T03 landed previously; this task adds repository-driven
Cloudflare API tooling, records live external verification, and retires the
production cutover bridge now that shared-edge `:443` is the public path.

## 1. Repository tooling (VOC-067-DEP-03)

| Artifact | Purpose |
| --- | --- |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` | `--verify-only`, `--apply`, `--restore` against Cloudflare Origin Rules (`http_request_origin` phase) for `production.vocanova.site` / `api-production.vocanova.site` |
| `infra/scripts/verify-voc067-cutover.sh` | External HTTPS `:443` checks for staging + production web/API |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh` | Offline mutation selftest (no live API) |

Operator sequence (production GitHub environment secrets):

```bash
# Preconditions: shared edge healthy; origin :443 routing proven on host (T00 step 3).

infra/scripts/verify-voc067-cutover.sh

PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only

PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --apply

infra/scripts/verify-voc067-cutover.sh
```

## 2. External `:443` verification (VOC-067-TEST-06)

Recorded **2026-08-12** from the implementer CI runner (via Cloudflare edge, not
direct origin IP — origin `:443` from arbitrary networks may be firewalled):

```bash
infra/scripts/verify-voc067-cutover.sh
```

```
VOC-067 cutover verification — external :443 (via Cloudflare)
PASS: staging web (https://staging.vocanova.site/) -> HTTP 200
PASS: staging api healthz (https://api-staging.vocanova.site/healthz) -> HTTP 200
PASS: production web (https://production.vocanova.site/) -> HTTP 200
PASS: production api healthz (https://api-production.vocanova.site/healthz) -> HTTP 200

All required :443 checks passed.
```

Contrast with VOC-066-T02 evidence (pre-cutover): `https://production.vocanova.site/`
(edge `:443`) returned **502** while `:8443` returned **200**. Post-cutover external
`:443` production now returns **200**, satisfying AC-06's external check shape.

## 3. Cloudflare API verification (limitation)

`PRODUCTION_CLOUDFLARE_API_TOKEN` is founder/ops-held and was **not** available in
this implementer run. Independent verification should run:

```bash
PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only
```

Expected steady-state output:

```
OK: no origin rules remap production hosts to port 8443
```

If rules still remap to `:8443`, run `--apply` before closing T05. External `:443`
success alone is **not** a substitute for a clean API verify when the token is
available — but combined with the 502→200 production `:443` change, remap removal
(or equivalent Cloudflare fix) is the documented root-cause remediation.

## 4. Rollback (T00 / release-plan)

**Accountable owner:** `m-e-h-r-d-a-a-d` (founder)

**Primary rollback** — restore Cloudflare origin-port override to `:8443`:

```bash
PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --restore
```

Re-verify the legacy path if the bridge container still exists on the host:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://production.vocanova.site:8443/
```

**Secondary rollback** — redeploy last-known-good compose/workflow digests; re-enable
per-tier nginx `:8443` publish from pre-T05 `docker-compose.production.yml` if the
shared edge fails. Last-known-good reference: dual-publish + remap configuration that
returned `200` on origin `:8443` during the 2026-08-11 outage investigation.

**Rehearsal:** `--restore` mutation covered by
`cloudflare-remove-production-origin-port-remap.selftest.sh` (offline). Live API
rollback rehearsal is founder-held; not executed in this run.

## 5. Bridge retirement (repository)

T05 removes `vocanova-production-nginx` from `infra/docker-compose.production.yml`
and drops the bridge reload block from `deploy-production.yml`. The shared edge
remains the sole public listener on host `80`/`443`.

**Host note:** the next production deploy will stop recreating the bridge container.
If an old `vocanova-production-nginx` instance is still running on the host, operators
may remove it after confirming `:443` external checks pass:

```bash
docker stop vocanova-production-nginx && docker rm vocanova-production-nginx
```

## 6. Deterministic checks (2026-08-12, this working tree)

```bash
bash infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh
# All cloudflare cutover selftests passed.

bash infra/scripts/verify-voc067-cutover.sh
# All required :443 checks passed.

docker compose -f infra/docker-compose.production.yml config --quiet
# exit 0

docker compose -f infra/docker-compose.shared-edge.yml config --quiet
# exit 0

bash infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only
# ERROR: token required — expected in implementer environment without secrets
```

## 7. Follow-up (out of T05 scope)

- **VOC-067-T04** — remove remaining `:8443` qualifications from
  `API_BASE_URL`, deploy-emitted OAuth/health URLs, and deploy poll steps
  (gated on this evidence).
- **Independent verifier** — bind exact commit SHA; run Cloudflare `--verify-only`
  with production secrets when available.

## Acceptance mapping

| Criterion | Evidence |
| --- | --- |
| VOC-067-AC-06 — remap removed; both tiers healthy on `:443` | §2 external checks; §3 API verify when token available |
| VOC-067-TEST-06 | §2–4 |
| Rollback credible | §4 + selftest `--restore` mutation |
