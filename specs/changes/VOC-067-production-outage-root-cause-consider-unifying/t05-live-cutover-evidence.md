---
evidence_id: VOC-067-EV-05
task_id: VOC-067-T05
acceptance_criteria: VOC-067-AC-06
tests: VOC-067-TEST-06
date: 2026-08-12
related_change: VOC-067
accountable_owner: m-e-h-r-d-a-a-d (founder; VOC-067-DEP-03)
cloudflare_remap_api_status: unconfirmed
---

# VOC-067-T05 — Live cutover verification and rollback evidence

Attempt 2 remediates independent review of commit
`7d5a740a9a7ed3b799463aea1d8c4b90d758ea73` (FAIL). That revision retired
`vocanova-production-nginx` and treated external `:443` HTTP 200 plus a missing
token as AC-06. TEST-06: missing Cloudflare credentials is a recorded
limitation, **not a pass**. External `:443` 200 does not prove remap absence
while a host-side `:8443` bridge may still be running (pre-cutover
remap → `:8443` also yields edge 200).

## Summary

| Requirement | Result |
| --- | --- |
| Shared edge serves both tiers on ordinary `:443` | **Pass (external)** — HTTPS checks succeed for all four hostnames (§2). Does **not** by itself prove remap absence. |
| Cloudflare origin-port remap removed or absent | **Unconfirmed** — `cloudflare_remap_api_status: unconfirmed`. No production-token `--verify-only` / `--apply` transcript. TEST-06 fail-closed. |
| Rollback documented and credible | **Pass (documented + offline rehearsal)** — `--restore` on the production script path; steps in §4. Live API rollback not rehearsed. |
| Temporary `:8443` bridge | **Kept** — `vocanova-production-nginx` restored in compose and deploy reload. Must not be retired until this frontmatter is `absent`. |

T00 ordered cutover step 4 (Cloudflare API remap removal) is **not** complete.
This revision restores a safe dual-publish repository state and fail-closed
tooling so founder/ops can run the API cutover without recreating issue #485.

## 1. Repository tooling (VOC-067-DEP-03)

| Artifact | Purpose |
| --- | --- |
| `infra/scripts/cloudflare_origin_port_remap.py` | Single mutation implementation (verify / remove / restore) |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` | `--verify-only`, `--apply`, `--restore`; live modes require a token |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh` | Offline harness that **invokes the production script** |
| `infra/scripts/verify-voc067-cutover.sh` | External HTTPS `:443` checks (not a remap proof) |
| `scripts/foundation/voc067-cutover-bridge-gate.test.mjs` | Fails if compose drops the `:8443` bridge while this frontmatter is not `absent` |
| `deploy-production.yml` input `voc067_cloudflare_origin_cutover` | Repository-driven API using `PRODUCTION_CLOUDFLARE_API_TOKEN`. `verify-only` / `restore` are a dedicated job (no deploy). `apply` deploys, then removes remap after smoke. |

Operator sequence (production GitHub environment secrets). Keep the `:8443`
bridge until step 2 exits 0:

```bash
# Preconditions: shared edge healthy; origin :443 routing proven on host (T00 step 3).

infra/scripts/verify-voc067-cutover.sh

PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only

# If FOUND: dispatch deploy-production.yml with
# voc067_cloudflare_origin_cutover=apply (runs --apply after smoke), or:
PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --apply

infra/scripts/verify-voc067-cutover.sh
```

Expected `--verify-only` success (then set `cloudflare_remap_api_status: absent`
in this file before any bridge retirement):

```
OK: no origin rules remap production hosts to port 8443
```

## 2. External `:443` verification (VOC-067-TEST-06, partial)

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

Contrast with VOC-066-T02 evidence (pre-shared-edge): `https://production.vocanova.site/`
(edge `:443`) returned **502** while `:8443` returned **200**. Current external
`:443` production 200 is consistent with shared-edge Host routing **or** with
the still-possible remap → `:8443` bridge path. It is **not** AC-06 remap
confirmation.

## 3. Cloudflare API verification (not a pass)

`PRODUCTION_CLOUDFLARE_API_TOKEN` is founder/ops-held and is **not** available
in this implementer run. Live `--verify-only` / `--apply` was not executed.

Without a token, the production script now **fails closed** for every live
mode, including `--verify-only`:

```
ERROR: CLOUDFLARE_API_TOKEN (or PRODUCTION_CLOUDFLARE_API_TOKEN) is required for --verify-only/--apply/--restore
Missing Cloudflare credentials is a VOC-067-TEST-06 failure, not a pass.
```

Independent verification and founder/ops must run `--verify-only` with the
production token (or dispatch `deploy-production.yml` with
`voc067_cloudflare_origin_cutover=verify-only`). If rules still remap to
`:8443`, run `--apply` (dispatch `apply`) **before** changing
`cloudflare_remap_api_status` or retiring the bridge.

If the existing Workers-AI `PRODUCTION_CLOUDFLARE_API_TOKEN` lacks Zone Origin
Rules permission, that API error is a fail, not a pass — founder must grant
the needed scope or use a token that can read/update
`http_request_origin` for `vocanova.site`.

## 4. Rollback (T00 / release-plan)

**Accountable owner:** `m-e-h-r-d-a-a-d` (founder)

**Primary rollback** — restore Cloudflare origin-port override to `:8443`
(bridge is still defined in compose, so this path remains workable):

```bash
PRODUCTION_CLOUDFLARE_API_TOKEN=… \
  infra/scripts/cloudflare-remove-production-origin-port-remap.sh --restore
```

Or dispatch `deploy-production.yml` with `voc067_cloudflare_origin_cutover=restore`.

Re-verify the bridge path:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" https://production.vocanova.site:8443/
infra/scripts/verify-voc067-cutover.sh --include-8443-bridge
```

**Secondary rollback** — redeploy last-known-good compose/workflow digests.
Last-known-good reference: dual-publish + remap configuration that returned
`200` on origin `:8443` during the 2026-08-11 outage investigation.

**Rehearsal:** `--restore` mutation covered by
`cloudflare-remove-production-origin-port-remap.selftest.sh` invoking the
production script offline. Live API rollback rehearsal is founder-held; not
executed in this run.

## 5. Bridge retention (High finding remediation)

Attempt 1 removed `vocanova-production-nginx` from
`infra/docker-compose.production.yml` and dropped the deploy reload block.
This revision **restores** both. `compose up -d` without `--remove-orphans`
can leave a stopped-or-running orphan; keeping the service in compose means
the next production deploy recreates/keeps the listener on `8081`/`8443`.

Do **not** run `docker stop/rm vocanova-production-nginx` until §3 records
`--verify-only` exit 0 and this frontmatter is `absent`.

## 6. Deterministic checks (2026-08-12, this working tree)

```bash
bash infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh
# All cloudflare cutover selftests passed.

node --test scripts/foundation/nginx-healthcheck-probe.test.mjs \
  scripts/foundation/voc067-cutover-bridge-gate.test.mjs
# pass 4 / fail 0

docker compose -f infra/docker-compose.production.yml config --quiet
# exit 0

docker compose -f infra/docker-compose.shared-edge.yml config --quiet
# exit 0

docker compose -f infra/docker-compose.yml config --quiet
# exit 0

bash infra/scripts/verify-voc067-cutover.sh
# All required :443 checks passed.

bash infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only
# ERROR: CLOUDFLARE_API_TOKEN (or PRODUCTION_CLOUDFLARE_API_TOKEN) is required for --verify-only/--apply/--restore
# Missing Cloudflare credentials is a VOC-067-TEST-06 failure, not a pass.
# exit 1

bash scripts/governance/validate-governance.sh
# Repository foundation validation passed.
# Governance structure validation passed.

bash scripts/governance/classify-change-risk.sh
# Detected path-based risk floor: R3
# (package remains R4 for VOC-037 edge supersession / dual-tier cutover)
```

## 7. Follow-up (out of T05 repository scope; still required for AC-06)

- **Founder/ops** — run `--verify-only` with `PRODUCTION_CLOUDFLARE_API_TOKEN`;
  `--apply` if remap is still present; paste the transcript into this file and
  set `cloudflare_remap_api_status: absent`. Then a later revision may retire
  the bridge.
- **VOC-067-T04** — remove remaining `:8443` qualifications from
  `API_BASE_URL`, deploy-emitted OAuth/health URLs, and deploy poll steps.
  Hard-gated on this evidence recording `absent` (T00 order). Do not switch
  deploy `:8443` polls in T05.
- **Independent verifier** — bind exact commit SHA; do not treat missing
  credentials as a pass; confirm the `:8443` bridge is still in compose while
  status is `unconfirmed`.

## Acceptance mapping

| Criterion | Evidence |
| --- | --- |
| VOC-067-AC-06 — remap removed | **Not satisfied in this revision** (`unconfirmed`; TEST-06) |
| VOC-067-AC-06 — both tiers healthy on `:443` | §2 external checks (circumstantial; not remap proof) |
| VOC-067-TEST-06 | §2–5; credentials limitation recorded as failure of the remap clause |
| Rollback credible | §4 + selftest `--restore` via the production script |
| Issue #485 class not recreated by this PR | §5 bridge restored; gate test |
