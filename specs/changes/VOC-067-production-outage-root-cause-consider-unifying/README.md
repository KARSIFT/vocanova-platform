# VOC-067 — Unify Staging/Production nginx Into One Shared-but-Isolated Edge

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #485](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/485),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-067
- Title: Production Outage Root Cause — Unify Staging/Production nginx Into One
  Shared-but-Isolated Edge on :80/:443
- Canonical path:
  `specs/changes/VOC-067-production-outage-root-cause-consider-unifying`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R4` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination). Path floor for
  expected `infra/` and `.github/workflows/` edits is `R3`.
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issue:
  [#485](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/485)
- Related accepted decisions this package may supersede in part:
  [VOC-037-D00](specs/changes/VOC-037-begin-milestone-r2-production-readiness-docs/t00-production-hosting-decision-record.md)
  (shared-host, logically isolated; separate ports / separate nginx today) and
  [VOC-037-D01](specs/changes/VOC-037-begin-milestone-r2-production-readiness-docs/t01-production-secrets-decision-record.md)
  (directory / compose / deploy-user isolation)

## Why this exists

On 2026-08-11, `production.vocanova.site` and `api-production.vocanova.site`
returned persistent Cloudflare-edge `502 Bad Gateway` while the origin was
healthy end-to-end:

| Check | Result |
|---|---|
| Production containers (`vocanova-production-postgres/api/web/nginx`) | Up and healthy on the host |
| Curl host public IP `:8443` with correct `Host:` (on-box and external) | `200` reliably |
| Host ports 80, 443, 8081, 8443 from outside | Open and reachable |
| Cloudflare edge → origin for production hostnames | Failed (the only failing hop) |

Production nginx publishes `8081:80` / `8443:443` because staging nginx already
owns host `80`/`443` on this shared host (`VOC-037-D00`). Public production
HTTPS therefore depends on a Cloudflare `:443 → origin :8443` remap — the
exact control that broke. Issue #485 asks to consider removing that remap class
entirely by putting one shared nginx on ordinary `80`/`443` with Host-based
routing, while keeping config, certs, secrets, and deploy write scopes isolated
per tier.

The same investigation found both nginx containers' Docker `HEALTHCHECK`
permanently broken (probe hits the catch-all `return 444` default server). That
fix is in scope regardless of whether shared nginx is adopted.

## What this package does

1. **Records the edge-architecture decision** (`VOC-067-T00`): shared nginx vs
   dual-nginx + Cloudflare harden; lifecycle ownership; isolation relative to
   `VOC-037-D00`/`D01`; Cloudflare cutover order.
2. **Fixes nginx HEALTHCHECK** (`VOC-067-T01`): both compose files, independent
   of the shared-edge decision.
3. **Implements shared-edge infra in-repo** (`VOC-067-T02`), **preserves
   per-tier deploy write isolation** (`VOC-067-T03`), **removes `:8443`
   workarounds** once production is on `:443` (`VOC-067-T04`), and **verifies
   live cutover + rollback** (`VOC-067-T05`) — only if shared nginx is adopted
   in T00.

## What this package deliberately does NOT do

- Does not adopt, authorize, implement, or merge itself.
- Does not weaken `VOC-037-D00`/`D01` secrets, directory-tree, compose-project,
  or deploy-user isolation — only the "separate nginx process / separate host
  ports" clause is under reconsideration, and only with explicit human
  acceptance (`VOC-067-DEP-02`).
- Does not grant either deploy pipeline write access to the other tier's nginx
  config or certs.
- Does not move staging and production onto a shared database, shared secrets
  tree, or shared upstream containers.
- Does not itself edit Cloudflare settings in git (ops evidence only in T05).
- Does not fold unrelated application-feature work into this package.

## Open questions for the reviewing human

See `specification.md`. The most important:

1. **`VOC-067-DEP-00`** — Adopt shared nginx, or keep dual nginx and harden
   Cloudflare's origin-port override instead?
2. **`VOC-067-DEP-01`** — Accept (or amend) the proposed lifecycle defaults:
   dedicated shared-edge compose; routine deploys only `nginx -t` + reload;
   recreate is rare/gated.
3. **`VOC-067-DEP-02`** — Explicit acceptance that sharing the nginx *process*
   supersedes the separate-ports / separate-nginx part of `VOC-037-D00`/`D01`.

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This
package carries no standing approval; adoption, implementation authorization,
independent verification, and any required founder approval remain to be
recorded against the exact implemented revision, per `AGENTS.md` and
`CLAUDE.md`. Under active A-003, routine R3 does not by itself require standing
technical-steward approval; the proposed R4 classification here (revising
`VOC-037-D00`) does require founder authority if the shared-nginx path is
chosen.
