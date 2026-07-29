---
id: DOC-11
title: VocaNova DevOps and CI/CD Plan
version: 1.0
document_type: operations-plan
status: approved
owner: founder
canonical_path: docs/operations/11-devops-and-ci-cd.md
approved_at: 2026-07-21
last_reviewed_at: 2026-07-21
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-10
  - DOC-16
  - DOC-19
related_decisions: []
adoption_change: VOC-008
source_files:
  - path: 10-development-workflow.md
    sha256: 7fdd38cb7f877051907cc68e0930ece507fe3466dab3e008795c2827eeb21aaf
---
# 11 — VocaNova DevOps and CI/CD Plan

## 1. Environments and infrastructure

Canonical environments: Local, Preview (per-PR, temporary, isolated, no production data/secrets),
Staging (from `develop`), Production (from `main`).

**Target infrastructure baseline** (concrete source decision — supersedes any vaguer "managed containers"
placeholder in earlier architecture drafts):

| Area | Decision |
|---|---|
| Frontend | Next.js App Router on Cloudflare Workers via OpenNext |
| Backend | Go modular monolith, Docker image, Render Web Service |
| Database | Render PostgreSQL, Frankfurt region |
| CI/CD | GitHub Actions |
| Container registry | GitHub Container Registry |
| DNS/TLS/WAF/CDN | Cloudflare |
| Error monitoring | Sentry |
| Uptime monitoring | Better Stack / UptimeRobot |
| Harness, Terraform/OpenTofu, Cloudflare D1/KV/Durable Objects/Queues/R2 | Deferred post-MVP |

This table is an implementation target, not authority to procure vendors, incur spend, create
infrastructure, deploy, or release. Each such action requires its own approved change package and
the authority applicable at execution time.

Domains: `vocanova.com` (marketing), `app.vocanova.com` (web app), `api.vocanova.com` (Go API),
staging equivalents `staging.vocanova.com` / `api-staging.vocanova.com`. Separate Google OAuth
clients, AI-provider keys, and Sentry environments per environment tier; no production secrets ever
reachable from preview/staging/CI.

## 2. Release artifacts and deployment ordering

Every deployable candidate produces three immutable artifacts: frontend OpenNext bundle, Go API OCI
image (`ghcr.io/karsift/vocanova-api:sha-<sha>`), Atlas migration OCI image. Production deploys by
digest, never by rebuilding from source: **build once → test in staging → promote exactly to
production.** Deployment order: resolve release manifest → validate artifacts → acquire environment
lock → confirm backup readiness → migration preflight → run migration → verify → deploy API by
digest → wait for readiness → deploy frontend → verify → smoke tests → record → notify. Production
deployments are never automatically cancelled once migration work has begun.

Release authority and technical activation are separate. The required human authority
depends on the effective R0–R4 risk, RL1–RL3 release class, any predefined founder-controlled launch
event, and any actual EHR trigger. The deployment sequence may run only after the live governance
and technically enabled gates permit it; failed migrations, health checks, or smoke tests stop the
deployment and invoke the governed rollback path. See the
[canonical governance index](../governance/README.md) and [DOC-19](19-governance-reconciliation-notes.md).

## 3. Rollback

Roll forward first; rollback application code only when safe; never automatically reverse production
migrations. Frontend/backend rollback = redeploy previous known-good artifact by digest. Database
rollback is not automatic — prefer a corrective forward migration; restore from backup only when
data integrity is at risk and roll-forward is unsafe. Required kill switches:
`AI_FEATURES_ENABLED`, `EMAIL_MAGIC_LINK_ENABLED`, `GOOGLE_OAUTH_ENABLED`,
`NEW_USER_SIGNUP_ENABLED`.

## 4. Backups, monitoring, incidents

Paid managed PostgreSQL with automated backups and point-in-time recovery where available; restore
tested before launch, then monthly for the first three months, then quarterly. RPO ≤24h, RTO same
business day. Severity levels SEV1 (outage/data-integrity risk) through SEV4 (minor); every SEV1/2
records date, environment, impact, detection, root cause, actions, rollback/roll-forward decision,
follow-up. Founder owns incident decision-making during MVP; GitHub issues track technical follow-up.

## 5. Production and launch readiness (checklists, condensed)

**Production-ready** requires: DNS/TLS configured, both services deployable, migrations tested,
secrets configured, OAuth/email verified, Sentry + uptime monitoring active, smoke tests passing,
backup/restore tested, rollback and incident runbooks documented, branch protection + Dependabot +
secret scanning enabled, AI budget cap configured, no production secrets/data reachable from
non-production tiers.

**Launch-ready** additionally requires: the full core MVP journey verified end to end on mobile,
privacy policy and terms published, a support/contact path, founder alerting confirmed, and an
accepted cost budget.
