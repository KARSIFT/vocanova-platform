---
evidence_id: VOC-072-EV-00
task_id: VOC-072-T00
acceptance_criteria: VOC-072-AC-00
tests: VOC-072-TEST-00
date: 2026-08-13
related_change: VOC-072
accountable_owner: m-e-h-r-d-a-a-d (founder/ops; VOC-067-DEP-03)
gate_status: pending_operator_execution
voc072_dep_00: dedicated_secret
voc072_dep_01_secret_name: PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN
---

# VOC-072-T00 — Cloudflare zone/Origin-Rules token provisioning evidence

## Gate status: PENDING — founder/ops execution required

**`VOC-072-AC-00` is NOT satisfied at this revision.** This implementer run has
no Cloudflare dashboard access, no write access to the GitHub **production**
environment, and cannot verify whether a zone-capable secret already exists.
The decisions, runbook, and verification steps below are complete; the
founder/ops operator must execute §3–§4 and fill §5 before this gate can close
and `VOC-072-T01` may proceed.

| Requirement | Status |
| --- | --- |
| `VOC-072-DEP-00` resolved (dedicated vs reuse) | **Recorded** — dedicated secret (§1) |
| `VOC-072-DEP-01` resolved (secret name) | **Recorded** — `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` (§1) |
| Cloudflare API token created with correct scopes | **Pending** — operator §3 |
| GitHub production environment secret set | **Pending** — operator §4 |
| Redacted audit record (no secret values in git) | **This file** — operator completes §5 |

## 1. Adoption decisions (`VOC-072-DEP-00` / `VOC-072-DEP-01`)

Recorded at T00 per `tasks.md` (DEP decisions are not resolved in
`change.yaml`'s drafting-time dependency block; T00 is the authoritative
record for T01 wiring).

### `VOC-072-DEP-00` — Dedicated secret (chosen)

**Decision:** Add a **dedicated** production GitHub secret for Cloudflare zone
read and Origin Rules edit. Do **not** broaden `PRODUCTION_CLOUDFLARE_API_TOKEN`.

**Rationale:**

- Issue #535 and `VOC-037-EV-06` confirm the existing
  `PRODUCTION_CLOUDFLARE_API_TOKEN` is scoped for **Workers AI provider sync**
  (`deploy-production.yml` writes `AI_PROVIDER_API_KEY` from that secret).
- `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` calls
  `GET /zones?name=vocanova.site` before reading or mutating the
  `http_request_origin` ruleset. The Workers-AI-scoped token returns an empty
  `result` array → `ERROR: zone not found` in CI (fail-closed per
  `VOC-067-TEST-06`).
- Least privilege: cutover tooling needs Zone Read + Origin Rules Edit on
  `vocanova.site` only; Workers AI sync should keep its narrow scope
  (`VOC-072-R00` / `VOC-072-R01`).

**Rejected alternative:** Reuse/broaden `PRODUCTION_CLOUDFLARE_API_TOKEN` —
higher blast radius if leaked; requires re-verifying Workers AI sync after
scope change; not chosen.

### `VOC-072-DEP-01` — Secret name

**Decision:** `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN`

`VOC-072-T01` must bind `voc067-cloudflare-cutover` and the post-smoke
`--apply` step to this secret. Workers AI sync continues using
`PRODUCTION_CLOUDFLARE_API_TOKEN` and `PRODUCTION_CLOUDFLARE_ACCOUNT_ID`
unchanged.

## 2. Repository context (verified read-only)

| Artifact | Current binding | Notes |
| --- | --- | --- |
| `deploy-production.yml` job `voc067-cloudflare-cutover` | `PRODUCTION_CLOUDFLARE_API_TOKEN` | Fails zone lookup with Workers-AI token (issue #535) |
| `deploy-production.yml` step `VOC-067-T05 … (apply after healthy deploy)` | `PRODUCTION_CLOUDFLARE_API_TOKEN` | Same — T01 retargets to DEP-01 secret |
| `deploy-production.yml` AI provider sync | `PRODUCTION_CLOUDFLARE_API_TOKEN` + `PRODUCTION_CLOUDFLARE_ACCOUNT_ID` | **Unchanged** on dedicated path |
| `cloudflare-remove-production-origin-port-remap.sh` | `CLOUDFLARE_API_TOKEN` or `PRODUCTION_CLOUDFLARE_API_TOKEN` | T01 adds DEP-01 env precedence |

**Minimum Cloudflare API permissions** for the new token:

| Permission | Purpose |
| --- | --- |
| Zone → Read | `GET /zones?name=vocanova.site` (`resolve_zone_id`) |
| Zone → Origin Rules → Edit (or Account → Origin Rules → Edit scoped to zone) | `GET` / `PUT` `/zones/{id}/rulesets/phases/http_request_origin/entrypoint` and ruleset updates |

**Zone resources:** Include → Specific zone → `vocanova.site` only.

## 3. Operator runbook — Cloudflare dashboard

Accountable owner: `m-e-h-r-d-a-a-d` (or delegate with dashboard access).

1. Sign in to Cloudflare → **My Profile** → **API Tokens** → **Create Token**.
2. Use **Create Custom Token** (not a template — templates may omit Origin Rules).
3. **Token name** (suggested): `vocanova-platform VOC-072 zone origin-rules cutover`
   — record the exact display name in §5.
4. **Permissions** (minimum):
   - Zone → Zone → Read
   - Zone → Origin Rules → Edit  
     (If the dashboard offers Account-level Origin Rules Edit instead, restrict
     zone resources to `vocanova.site` only.)
5. **Zone Resources:** Include → Specific zone → `vocanova.site`.
6. **Account Resources:** None required unless the dashboard forces an account
   scope for Origin Rules — if so, limit to the account holding `vocanova.site`.
7. Create the token. Copy the value **once** — it will not be shown again.
   **Do not paste the token into git, PR comments, or this evidence file.**

## 4. Operator runbook — GitHub production environment

Repository: `KARSIFT/vocanova-platform-sandbox`

1. **Settings** → **Environments** → **production** → **Environment secrets**.
2. **New secret**
   - Name: `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` (per DEP-01)
   - Value: the Cloudflare token from §3
3. Confirm `PRODUCTION_CLOUDFLARE_API_TOKEN` is **unchanged** (Workers AI sync).
4. Optional audit (no values): from a machine with `gh` and production env access:

```bash
gh secret list --env production --repo KARSIFT/vocanova-platform-sandbox \
  | grep -E 'PRODUCTION_CLOUDFLARE'
```

Expected after provisioning: both `PRODUCTION_CLOUDFLARE_API_TOKEN` and
`PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` listed (plus
`PRODUCTION_CLOUDFLARE_ACCOUNT_ID`). Paste redacted `gh` output into §5.

## 5. Operator confirmation (fill before closing this gate)

Complete this section after §3–§4. **Never record the token string.**

| Field | Value |
| --- | --- |
| Operator GitHub handle | _pending_ |
| Provisioning date (UTC) | _pending_ |
| Cloudflare token display name | _pending_ |
| Cloudflare permissions summary | Zone Read + Origin Rules Edit on `vocanova.site` |
| GitHub secret name | `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` |
| `PRODUCTION_CLOUDFLARE_API_TOKEN` left unchanged | _pending yes/no_ |
| Redacted `gh secret list` excerpt | _pending_ |

When complete, update frontmatter `gate_status` to `resolved` and set
`VOC-072-AC-00` result to satisfied in `acceptance-criteria.md` via the
normal package closure process (not required in this T00 PR if ops lands in the
same founder session before merge).

## 6. Post-provisioning verification (operator)

Run **after** the secret exists. These steps do not mutate Origin Rules.

**Local or bastion** (token via env, not committed):

```bash
export PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN='…'   # from GitHub secret
export CLOUDFLARE_API_TOKEN="$PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN"

infra/scripts/cloudflare-remove-production-origin-port-remap.sh --verify-only
```

**Success criteria:**

- Exit code `0`
- **No** `ERROR: zone not found` (empty `GET /zones` result)
- Output includes either `OK: no origin rules remap production hosts to port 8443`
  or an explicit `FOUND` message — both prove zone resolution succeeded

**Not in T00 scope:** `workflow_dispatch` with
`voc067_cloudflare_origin_cutover=verify-only` — that is `VOC-072-T02` after
`VOC-072-T01` wires the workflow to DEP-01.

## 7. Downstream tasks

| Task | Dependency on T00 |
| --- | --- |
| `VOC-072-T01` | Requires DEP-00/DEP-01 (§1) and secret present (§4) before merge is meaningful |
| `VOC-072-T02` | Requires T01 merged + live `--verify-only` in production CI |

## 8. Method and limitations

- Repository facts in §2 read from this branch's tip:
  `.github/workflows/deploy-production.yml`,
  `infra/scripts/cloudflare-remove-production-origin-port-remap.sh`,
  `specs/changes/VOC-067-production-outage-root-cause-consider-unifying/t05-live-cutover-evidence.md`,
  `specs/changes/VOC-037-begin-milestone-r2-production-readiness-docs/t06-production-provisioning-evidence.md`.
- No Cloudflare API call, no GitHub secret read/write, and no production
  `workflow_dispatch` from this implementer environment.
- No secret values appear in this file or elsewhere in the diff.
