# VOC-072 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package and each task are approved and implementation is
authorized (AGENTS.md: an issue alone is not implementation authority). Adoption
must resolve `VOC-072-DEP-00` and `VOC-072-DEP-01` before `VOC-072-T01` proceeds.

Expected targets:

| Area | Floor | Notes |
| --- | --- | --- |
| `.github/workflows/deploy-production.yml` | R3 | Cutover job + apply step env only |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` | R3 | Docs / optional error clarity |
| `infra/README.md` | R3 | Operator credential guidance |
| GitHub production secrets | Human ops | No git commits of values |

VOC-067 shared-edge and bridge state must remain unchanged until verify-only
reports remap absent (existing gate tests).

## File reconciliation and implementation sequence

Drafting-time targets (read; do not edit outside the package until authorized):

| File | Role |
| --- | --- |
| `.github/workflows/deploy-production.yml` | `voc067-cloudflare-cutover` job; `--apply` step env |
| `infra/scripts/cloudflare-remove-production-origin-port-remap.sh` | Token env precedence; zone lookup |
| `infra/README.md` | Operator cutover sequence |

No conflicting in-flight package against cutover credential wiring is known at
drafting time.

Ordered steps:

1. **`VOC-072-T00` — Human provisioning.**
   Founder/ops creates Cloudflare token and GitHub secret; writes
   `t00-token-provisioning-evidence.md` under this package directory.

2. **`VOC-072-T01` — Repository wiring PR.**
   - If dedicated secret (recommended): add
     `PRODUCTION_CLOUDFLARE_ZONE_ORIGIN_RULES_TOKEN` (or DEP-01 name) to cutover
     job and `--apply` step; extend script to prefer that env var for live API
     modes while keeping `PRODUCTION_CLOUDFLARE_API_TOKEN` fallback for backward
     compatibility during rotation.
   - If reuse path: document token replacement in evidence; no workflow env name
     change; verify AI sync block still valid.
   - Update README operator section.
   - Run offline selftests and governance validation.

3. **`VOC-072-T02` — Live verify-only.**
   Dispatch production workflow; record `t02-verify-only-evidence.md`. No source
   change unless dispatch reveals a wiring bug.

## Validation and independent verification

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
bash infra/scripts/cloudflare-remove-production-origin-port-remap.selftest.sh
node --test scripts/foundation/voc067-cutover-bridge-gate.test.mjs
```

Plus `VOC-072-TEST-00` through `VOC-072-TEST-04`. T02 adds production workflow
evidence — missing production dispatch is **not** a pass for AC-02.

Independent verification (CLAUDE.md): bind review to exact final commit SHA;
confirm ACs with evidence; confirm no secret values in diff; confirm Codex/
implementer did not approve or merge their own work; report still-required
R3/R4/EHR/adoption/activation gates. Under active A-003, routine R3 does not
require standing steward/founder approval merely for being R3; this package sets
`automatic_merge_allowed: false` so founder eyes remain on develop merge for
production-secrets wiring.

## Deployment and rollback

This package does not authorize remap removal or general production deploy.
Effect of T02 is a read-only `--verify-only` API call plus CI execution.

Rollback:

- **Credential rollback:** revoke new Cloudflare token in dashboard; remove or
  revert GitHub secret; redeploy prior workflow revision if env names changed.
- **Workflow rollback:** revert T01 commit; cutover job returns to prior (broken)
  binding — documented known state from issue #535.
- **Cutover rollback (if `--apply` run later under VOC-067):** existing
  `--restore` path in `cloudflare-remove-production-origin-port-remap.sh`.

Owner: founder/ops (`m-e-h-r-d-a-a-d` per VOC-067-DEP-03) for secret and dispatch
actions; implementer named in T01 PR for repository wiring.
