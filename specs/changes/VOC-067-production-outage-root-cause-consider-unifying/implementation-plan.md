# VOC-067 — Implementation Plan

## Preconditions and protected areas

Do not begin implementation until this package is adopted (`status: adopted`,
`approval_status` approved per house adoption convention,
`implementation_authorized: true` / `implementation.authorized: true` in
`change.yaml`). Additionally:

- T02–T05 require `VOC-067-DEP-00` resolved to shared nginx and
  `VOC-067-DEP-01`/`DEP-02` accepted (or explicitly amended) in T00's record.
- T01 may proceed once adopted even if DEP-00 is still being finalized,
  because the HEALTHCHECK defect is independent.
- Protected areas: `infra/`, `.github/workflows/deploy-staging.yml`,
  `.github/workflows/deploy-production.yml`, secrets-boundary behavior,
  Cloudflare production origin settings (ops). Path floor R3; proposed
  package risk R4 — founder authority required for the shared-nginx
  supersession of `VOC-037-D00` if that path is chosen.

Any change to deploy sequencing or host layout must update the affected
workflow header comments and `infra/README.md` in the same PR, per
repository practice (stale docs that claim the remap is required would be
worse than silence).

## File reconciliation and implementation sequence

1. **`VOC-067-T00`** — Write the decision record under this package directory
   (and link it from `README.md` / `tasks.md` status notes). No production
   cutover in this task.
2. **`VOC-067-T01`** — Edit HEALTHCHECK in
   `infra/docker-compose.yml` and `infra/docker-compose.production.yml`.
   Keep `05-default.conf` reject behavior. Verify health status.
3. **`VOC-067-T02`** (shared path) — Add/adjust shared-edge compose and nginx
   include layout; attach both networks; resolve single `default_server`;
   update `infra/README.md`. Prefer reversible steps: bring shared edge up,
   prove Host routing on origin, then stop publishing conflicting binds from
   the old per-tier nginx services.
4. **`VOC-067-T03`** (shared path) — Update both deploy workflows for
   per-tier write + `nginx -t` + reload only; update header comments; confirm
   secrets-boundary rehearsal still passes.
5. **`VOC-067-T04`** (shared path) — Remove `:8443` workarounds only after
   origin `:443` serves production per T00's order (may be same release train
   as T05, but must not race ahead of live `:443`).
6. **`VOC-067-T05`** (shared path) — Execute Cloudflare remap removal; capture
   external verification and rollback evidence.

If T00 selects dual-nginx harden instead: cancel T02–T05 here and implement
only what T00 names (or spin a follow-up package) — do not silently keep
shared-nginx tasks pending.

## Validation and independent verification

Deterministic commands before claiming repository tasks complete:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Infra/workflow changes also need:

- `docker compose ... config` on touched compose files
- `nginx -t` with the intended mount set (pattern already documented in
  `infra/README.md` / nginx.conf headers)
- Real host verification for HEALTHCHECK and cutover (credentials are
  founder/ops held; missing live access is a limitation, not a pass)

Independent verification (per `CLAUDE.md`) must bind the exact commit SHA,
confirm Codex did not approve/merge its own implementation, confirm A-003
authority model, and report every still-required R3/R4/EHR/adoption/
activation gate — especially founder acceptance of `VOC-067-DEP-02` if
shared nginx was implemented.

## Deployment and rollback

Authorization: this package does **not** itself authorize production
deployment. After adoption and task merges, existing auto-promotion /
`deploy-production.yml` on `main` push behavior applies per `AGENTS.md`
(2026-08-08 founder delegation), unless the adopting human records a
narrower, temporary hold for the cutover window.

Rollout sequence (shared path, default): T01 → T02 (shared edge up, old
port publishes drained per plan) → T03 → verify origin `:443` → Cloudflare
remap removal (T05) → T04 port-normalization → final external checks.

Rollback trigger: either tier unreachable on `:443` after cutover, or shared
reload taking both tiers down, or OAuth/CORS regressions after `:8443`
removal. Mechanisms: restore Cloudflare origin-port override; redeploy prior
compose/workflow digests; re-publish prior nginx generation. Accountable
owner: named in T00/T05 evidence. Last-known-good: pre-cutover dual-nginx +
remap configuration that served origin `:8443` successfully (as proven in
the outage investigation itself).
