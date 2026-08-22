---
id: DOC-11
title: VocaNova DevOps and CI/CD Plan
version: 1.3
document_type: operations-plan
status: approved
owner: founder
canonical_path: docs/operations/11-devops-and-ci-cd.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-22
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-10
  - DOC-16
  - DOC-19
related_decisions:
  - ADR-0003
adoption_change: VOC-008
amendments:
  - id: VOC-080-ci-foundation-amendment
    title: "Four-workflow deterministic CI foundation"
    adopted_in: VOC-080
    adopted_at: 2026-08-22
    approving_owner: approved-voc-080-package
    resolution_recorded_in: specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml
    notes: "T01 splits CI into stable subsystem checks and aggregates, adds reusable pinned setup and correctness-neutral caches, and records supported GitHub hardening without adding deployment authority."
  - id: VOC-080-cloudflare-native-amendment
    title: "Cloudflare Workers and D1 replace the active owned-server target"
    adopted_in: VOC-080
    adopted_at: 2026-08-22
    approving_owner: founder-direction-with-independent-plan-review
    resolution_recorded_in: specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml
    notes: "ADR-0003 is the current target. The prior Render and VOC-032 self-hosted rows remain historical evidence; no live Cloudflare resource or deployment is created by this documentation task."
  - id: VOC-032-§1-amendment
    title: "§1 target-infrastructure baseline amended to self-hosted Docker Compose + nginx on vocanova.site"
    adopted_in: VOC-032
    adopted_at: 2026-07-30
    approving_owner: founder
    resolution_recorded_in: specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/change.yaml
    notes: "Supersedes the prior Render Web Service + Cloudflare Workers + Render PostgreSQL rows in §1's target-infrastructure table and the vocanova.com domain set, per VOC-032-D02 (resolved at adoption 2026-07-28, founder-gate delegation). The superseded rows are annotated, not silently deleted, consistent with this repository's existing convention for amending an approved document (see DOC-15 §17.0 and the A-003 active-authority notice in DOC-16). Detailed in §1's amendment note below."
  - id: VOC-051-§1-amendment
    title: "§1 Error monitoring row extended to cover apps/web browser-side reporting and the hourly Sentry-to-GitHub-issue monitoring workflow"
    adopted_in: VOC-051
    adopted_at: 2026-08-08
    approving_owner: founder
    resolution_recorded_in: specs/changes/VOC-051-add-hourly-sentry-based-log-error-monitoring/change.yaml
    notes: "Sentry remains embedded in runtime applications, but VOC-078-T03 removed the scheduled GitHub workflow that queried Sentry and opened issues. The four-project historical layout and VOC-051 implementation evidence remain valid history; no repository automation currently polls those projects."
source_files:
  - path: 10-development-workflow.md
    sha256: 5b815f2fa19b799726a83dffd46664037e6afa66df0655cab2261b3aed7e56fb
---

# 11 — VocaNova DevOps and CI/CD Plan

## 1. Environments and infrastructure

Canonical environments: Local, Preview (per-PR, temporary, isolated, no production data/secrets),
Staging (from `develop`), Production (from `main`).

> **Active amendment (`VOC-080-cloudflare-native-amendment`, adopted 2026-08-22).**
> [ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) supersedes
> both the original Render split and VOC-032's later self-hosted Docker/Nginx stack as
> the active target. The historical tables and runbooks below are preserved to explain
> what existed; they do not authorize or describe the final architecture. T00 changes
> repository documentation only and does not inspect a server or create Cloudflare,
> DNS, secret, data, or deployment state.

| Capability   | Current repository state                                                                            | VOC-080 target                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Web          | OpenNext/workerd parity plus held T10 delivery config; historical Docker assets remain              | Next.js 16 through OpenNext on a Cloudflare Web Worker                                         |
| API          | Full Hono/D1 contract parity plus held T10 delivery config and Go/Huma reference                    | TypeScript Module Worker using Hono and generated bindings                                     |
| Data         | Local D1 forward migration/tests plus PostgreSQL source reference                                   | Separate local/staging/production Cloudflare D1 databases                                      |
| Web-to-API   | HTTPS server path                                                                                   | Cloudflare service binding where practical; HTTPS contract remains `/api/v1`                   |
| Assets/async | Docker/Nginx and synchronous server assumptions                                                     | Workers Static Assets; Queue/Workflow/DO/R2 only for a measured requirement                    |
| CI/CD        | Four deterministic workflows; credential-free three-environment dry runs and held T10 state machine | Separately activated environment-scoped version/migration/promotion jobs inside `ci.yml`       |
| Secrets      | No deployment secrets in PRs or agents                                                              | Environment-scoped Cloudflare secret bindings unavailable to PRs/Ruflo                         |
| Rollback     | Historical image/server procedure                                                                   | Recorded prior Worker versions plus expand/migrate/contract and forward-corrective D1 handling |

No current workflow run can deploy to Preview, Staging, or Production. T10's manual
jobs exist after Worker/D1 parity, but the committed manifest, D1/route sentinels, and
missing authority evidence block before secrets. Live staging requires
`VOC-080-HOLD-00`, production traffic or D1 migration requires `HOLD-01`, and
production learner data requires `HOLD-02`.

### 1.1 Deterministic GitHub Actions foundation

The workflow inventory is exactly four files and has one responsibility per file:

| Workflow         | Stable evidence                                                                                          | Trigger and authority                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ci.yml`         | foundation, packages, web, Worker API, transitional Go API, held delivery policy, and `CI / ci required` | PR/push validation plus a held manual gate; no eligible live deployment in current state |
| `governance.yml` | `structure`, `changed-path risk`, and read-only `merge eligibility`                                      | Pull-request evidence plus protected-branch structure checks; no GitHub write            |
| `quality.yml`    | accessibility and Lighthouse, summarized by `Quality / quality required`                                 | Web/shared/lockfile changes on pull requests only                                        |
| `security.yml`   | dependency audit and secret scan, summarized by `Security / security required`                           | Pull requests and protected-branch pushes; no secret consumption                         |

All runner jobs have explicit timeouts and Bash semantics. Every external action uses
a reviewed full commit SHA, and every checkout disables persisted credentials. A local
composite action reuses the pinned Node, pnpm, and optional Go setup. Its caches contain
only pnpm's content-addressed store and Go download/build caches; `node_modules` is not
cached, the lockfile remains frozen, and a cache hit never skips a check. Browser
reports are uploaded only on failure and retained for three days. Fail-fast aggregation
is explicit: the stable `required` result is blocked by any failed, cancelled, or
skipped subsystem, and the same script has a synthetic negative contract test.

The subsystem `pnpm ci:*` commands are local entry points, not CI-only behavior;
`pnpm validate` remains the full pre-review gate. This design follows the applicable
parts of mature Workers/Hono/OpenNext repositories—pinned dependencies, focused checks,
non-short-circuiting evidence, and workerd-oriented separation—without importing their
release bots, write permissions, vendor services, or repository scale.

VOC-080-T03 makes `pnpm ci:web` the credential-free Worker gate. It verifies committed
Wrangler types, scans the runtime boundary, transforms the Next.js build through
OpenNext, performs a Wrangler dry run, enforces the 3 MiB compressed target and records
the local startup profile, then sends representative static/SSR/RSC/middleware/auth/API
requests through two Workers in local workerd. A plain `next build` remains useful for
UI checks but is not Cloudflare compatibility evidence. No T03 command uploads a
version, queries an account, provisions a resource, or deploys.

VOC-080-T04 adds the separate `worker api` CI job without adding a workflow file. It
verifies generated D1 bindings, Hono operational OpenAPI, the canonical 25-operation
Go `/api/v1` migration baseline, API-client path compatibility, privacy-safe
problems/logs, explicit credentialed CORS, prepared statements, a forward STRICT D1
migration applied from empty and replayed in workerd, static safety rules, build, and
credential-free Wrangler dry-run. T10 adds distinct staging/production environments
with non-resource D1/route sentinels, credential-free dry runs, and held
migration/version/promotion/rollback behavior. Real IDs, routes, environment secrets,
and activation evidence remain absent.

VOC-080-T05 extends that existing job rather than adding a workflow. The second
forward migration and workerd fixtures cover 13 identity/account operations, secure
cookies, token hashing/expiry/replay, OAuth state, requester isolation, CSRF,
settings/onboarding idempotency, email change, deactivation rollback, and rate/kill
switches. Email and OAuth stay injected, credential-free boundaries; the task neither
contacts providers nor provisions or migrates a remote D1 database.

VOC-080-T06 through T08 complete the 25-operation Worker contract inventory and
extend the same job through five forward D1 migrations. Workerd fixtures cover
content/reviews, missions/progress, sentence-feedback persistence, deterministic
validation and safety, bounded provider repair/timeouts, persistent rate/cost and
concurrency gates, the provider-neutral email HTTP boundary, and redacted
`waitUntil` telemetry. Normal CI uses mocks and no paid-provider secret. The
committed local runtime keeps `AI_GENERATION_ENABLED=false`; enabling or wiring a
real provider remains separate from this credential-free parity proof.

VOC-080-T09 extends the same job through seven forward D1 migrations. The sixth
preserves the synthetic-account marker; the seventh installs fail-closed write guards
for every converted table while exact multi-invocation reconciliation owns its
plan-bound lock. The synthetic conversion, bounded import, interruption/retry,
forward-correction, exact signed aggregates, and privacy-safe reconciliation suite is
credential-free and never contacts a remote D1 database.

> **Amendment note (`VOC-032-§1-amendment`, adopted 2026-07-30 via VOC-032; founder as approving
> owner).** The Frontend/Backend/Database rows of the target-infrastructure table below and the
> `vocanova.com` domain set in the next paragraph were the **original (v1.0) baseline** as of
> 2026-07-21. They are **superseded as of 2026-07-30** by the real, working infrastructure the
> VOC-032 change package actually built (`T00`–`T09`): self-hosted Docker Compose + nginx on the
> founder's own 2 vCPU / 4 GB staging server, with Cloudflare used **only** for DNS, TLS, WAF,
> and CDN — not for compute. The new shape replaces Render Web Service, Cloudflare Workers via
> OpenNext, and Render PostgreSQL with the founder's own server running the four-service stack
> `postgres` + `api` (Go, Docker image) + `web` (Next.js, Docker image, `output: 'standalone'`)
>
> - `nginx`, and replaces the `vocanova.com` apex with `vocanova.site` (with
>   `staging.vocanova.site` and `api-staging.vocanova.site` as the staging subdomains). The
>   superseded rows are retained in place and marked **~~strikethrough~~** below so this section
>   preserves the v1.0 historical record of what DOC-11 originally targeted, exactly as DOC-15 §17.0
>   retains the A-001 prose that A-003 actually supersedes and DOC-16 retains its A-003
>   active-authority notice. The amended (v1.1) baseline immediately follows.

**Original (v1.0) target infrastructure baseline** (2026-07-21 — 2026-07-29, **superseded as of
2026-07-30 by `VOC-032-§1-amendment`**; retained in place as historical record):

| Area                                                                    | Decision (v1.0)                                           | Status                                                                                                                                      |
| ----------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                                                                | ~~Next.js App Router on Cloudflare Workers via OpenNext~~ | **Superseded 2026-07-30 by `VOC-032-§1-amendment`**                                                                                         |
| Backend                                                                 | ~~Go modular monolith, Docker image, Render Web Service~~ | **Superseded 2026-07-30 by `VOC-032-§1-amendment`**                                                                                         |
| Database                                                                | ~~Render PostgreSQL, Frankfurt region~~                   | **Superseded 2026-07-30 by `VOC-032-§1-amendment`**                                                                                         |
| CI/CD                                                                   | GitHub Actions                                            | Unchanged                                                                                                                                   |
| Container registry                                                      | GitHub Container Registry                                 | Unchanged                                                                                                                                   |
| DNS/TLS/WAF/CDN                                                         | Cloudflare                                                | **Narrowed 2026-07-30 by `VOC-032-§1-amendment`** to DNS/TLS/WAF/CDN only — Cloudflare no longer hosts compute (see amended baseline below) |
| Error monitoring                                                        | Sentry                                                    | Unchanged                                                                                                                                   |
| Uptime monitoring                                                       | Better Stack / UptimeRobot                                | Unchanged                                                                                                                                   |
| Harness, Terraform/OpenTofu, Cloudflare D1/KV/Durable Objects/Queues/R2 | Deferred post-MVP                                         | Unchanged                                                                                                                                   |

**Amended (v1.1) target infrastructure baseline** (2026-07-30, adopted via VOC-032; founder as
approving owner). This is the shape `T00`–`T09` actually built and that the staging environment
is currently deployed against — not a plan:

| Area                                                                    | Decision (v1.1, as actually built by VOC-032 `T00`–`T09`)                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                                                                | Next.js App Router, Docker image (`apps/web/Dockerfile`), `output: 'standalone'` build, served from the `web` service on the founder's own server, reachable at `https://staging.vocanova.site` in staging                                                                                                                                                                                                                                      |
| Backend                                                                 | Go modular monolith, Docker image (`apps/api/Dockerfile`), running as the `api` service on the founder's own server, reachable at `https://api-staging.vocanova.site` in staging; env-driven `LoadProductionConfig` refuses to start without a reachable database and the four DOC-11 §3 kill switches                                                                                                                                          |
| Database                                                                | PostgreSQL 16 (`postgres:16-alpine`), running as the `postgres` service in the same Docker Compose stack on the founder's own server, named volume for persistence, `pg_isready` healthcheck; reachable only on the internal `vocanova-net` Docker network, never on a host port                                                                                                                                                                |
| CI/CD                                                                   | GitHub Actions (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Container registry                                                      | GitHub Container Registry (unchanged) — `ghcr.io/karsift/vocanova-api:sha-<sha>` and `ghcr.io/karsift/vocanova-web:sha-<sha>` per DOC-11 §2's existing build-once / promote-by-digest model                                                                                                                                                                                                                                                     |
| Orchestration                                                           | Docker Compose (`infra/docker-compose.yml`) — four services (`postgres` + `api` + `web` + `nginx`) on a single internal network (`vocanova-net`); only `nginx` publishes host ports `80`/`443`                                                                                                                                                                                                                                                  |
| Reverse proxy / TLS termination                                         | `nginx` service (the only host-published service) terminates TLS using a Cloudflare-issued origin certificate (`VOC-032-DEP-01`); real client IP restored from `CF-Connecting-IP` only when the connection genuinely originates from Cloudflare's published IP ranges (never `0.0.0.0/0`); `staging.vocanova.site` → `web`, `api-staging.vocanova.site` → `api`; plain-`80` redirects to `443`; standard security headers set on every response |
| DNS/TLS/WAF/CDN (edge)                                                  | Cloudflare (narrowed role) — DNS, TLS, WAF, and CDN only; **no Cloudflare compute** (no Workers, no OpenNext, no Cloudflare D1/KV/Durable Objects/Queues/R2 at the edge)                                                                                                                                                                                                                                                                        |
| Atlas migration tooling                                                 | `apps/api/atlas.hcl` + `apps/api/scripts/migrate.sh` apply the existing `apps/api/migrations/*.sql` set; `.down.sql.example` files remain non-executable by Atlas per the existing `apps/api/migrations/README.md` rule                                                                                                                                                                                                                         |
| Deploy automation                                                       | Paused after VOC-078-T03. Historical workflows deployed by SSH. T10 later added a held manual Cloudflare state machine, but its committed manifest blocks before environment jobs or secrets; it neither builds/pushes deployment images nor polls server health. Runtime assets and servers were not changed by either repository-only transition.                                                                                             |
| Error monitoring                                                        | Sentry remains embedded in application runtime code. VOC-078-T03 removed the scheduled Sentry-to-GitHub workflow, so GitHub no longer queries Sentry or files monitoring issues automatically.                                                                                                                                                                                                                                                  |
| Uptime monitoring                                                       | Better Stack / UptimeRobot (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                          |
| Harness, Terraform/OpenTofu, Cloudflare D1/KV/Durable Objects/Queues/R2 | Deferred post-MVP (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                                   |

This table is an implementation target, not authority to procure vendors, incur spend, create
infrastructure, deploy, or release. Each such action requires its own approved change package and
the authority applicable at execution time. The v1.1 rows above describe the staging tier that
already exists as a result of VOC-032 `T00`–`T09`; RL1/RL2 technical activation remains
disabled per `docs/governance/a003-transition-state.yaml` and is not authorized by this
amendment. **Updated 2026-08-08**: production-tier deployment and autonomous production
release, previously also listed here as disabled, are no longer disabled -
`docs/governance/a003-transition-state.yaml` itself now records both as enabled,
following the founder's explicit authorization (see `AGENTS.md`'s "Release and
deployment authority"). This amendment still does not itself authorize them; that
authorization came from a separate, later decision.

**Domains (v1.1, post-`VOC-032-§1-amendment`):** `vocanova.site` apex (reserved, not currently
used by the staging tier), `staging.vocanova.site` (web app, browser-facing — the staging tier's
apex), `api-staging.vocanova.site` (Go API, browser and server-side fetch target). The
`vocanova.com` / `app.vocanova.com` / `api.vocanova.com` / `staging.vocanova.com` /
`api-staging.vocanova.com` domain set that v1.0 named is **superseded** by this paragraph; if
the founder later wants to migrate to `vocanova.com` as the production domain, that is a
separate, founder-approved DOC-11 amendment, not an implicit consequence of this one. Separate
Google OAuth clients, AI-provider keys, and Sentry environments per environment tier; no
production secrets ever reachable from preview/staging/CI (unchanged from v1.0).

> **Amendment note (`VOC-051-§1-amendment`, adopted 2026-08-08 via VOC-051; founder as approving
> owner).** Sentry remains the error-monitoring tool both tables above already name — this
> amendment supersedes nothing and retires nothing. It records what VOC-051 built around that
> unchanged choice, so the "Error monitoring" row no longer under-describes the mechanism actually
> in place:
>
> - **`apps/web` now reports errors to Sentry** (`VOC-051-T01`), via `@sentry/nextjs` across the
>   browser, server, and edge runtimes. Previously only `apps/api` did. The SDK is a no-op when its
>   DSN is unset, matching `apps/api`'s existing behaviour, so an unconfigured environment reports
>   nothing rather than failing.
> - **The "separate Sentry environments per environment tier" requirement in the paragraph above is
>   satisfied by separate Sentry _projects_, not only by the `environment` event tag.** VOC-051
>   adopted a four-project layout — `prod-api`, `prod-web`, `stage-api`, `stage-web` under the
>   `vocanova` organization — one per application per tier, each with its own DSN held in its own
>   GitHub Actions secret. The per-tier `SENTRY_ENVIRONMENT` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` tag
>   is still set on top of that. The full layout record, including which secret feeds which project,
>   is in `specs/changes/VOC-051-add-hourly-sentry-based-log-error-monitoring/t00-evidence.md` §3.
>   This also closed a gap: `apps/api` staging had no Sentry wiring at all before VOC-051.
> - **Historical Sentry automation is paused.** VOC-051 added a daily workflow that queried all
>   four projects using a read-only Sentry integration token and opened deduplicated GitHub issues.
>   VOC-078-T03 removed that workflow and its GitHub permission/secret consumption. Application
>   Sentry instrumentation and the four-project evidence remain unchanged; no current repository
>   automation queries Sentry or opens monitoring issues.
> - **Uptime/liveness monitoring is untouched** by this amendment — the "Uptime monitoring" row's
>   Better Stack / UptimeRobot choice remains as stated and unimplemented here.

## 2. Release artifacts and deployment ordering

The VOC-080 target produces exact-revision OpenNext web and Hono API Worker builds, D1 migration
manifests, and immutable Cloudflare version identifiers. The intended sequence is **build once →
test under workerd → verify in staging → promote the exact versions to production**. Deployment
order: resolve release manifest → validate exact checks/review/holds → acquire environment lock →
confirm D1 recovery readiness → migration preflight → apply compatible migration → upload/promote
API and web versions → readiness/smoke/parity tests → record outcome. Production work is never
automatically cancelled after migration begins.

Release authority and technical activation are separate. R0–R4 and RL1–RL3 determine evidence,
not personal approval by label. Required accountable authority depends on a specifically defined
production action, external effect, or launch event, plus any actual EHR trigger. The deployment
sequence may run only after the live governance
and technically enabled gates permit it; failed migrations, health checks, or smoke tests stop the
deployment and invoke the governed rollback path. See the
[canonical governance index](../governance/README.md) and [DOC-19](../archive/19-governance-reconciliation-notes.md).

## 3. Rollback

Roll forward first; rollback application code only when safe; never automatically reverse production
migrations. Web/API rollback promotes previous known-good Worker versions. D1 rollback is not
automatic — prefer a corrective forward migration; use Time Travel restore only with separate
destructive-action authority when data integrity is at risk and roll-forward is unsafe. Required kill switches:
`AI_FEATURES_ENABLED`, `EMAIL_MAGIC_LINK_ENABLED`, `GOOGLE_OAUTH_ENABLED`,
`NEW_USER_SIGNUP_ENABLED`.

## 4. Backups, monitoring, incidents

D1 recovery/Time Travel availability, export strategy, and a separately authorized restore rehearsal
must be recorded before launch; the accepted RPO/RTO must fit the chosen Cloudflare plan and product
risk. Severity levels SEV1 (outage/data-integrity risk) through SEV4 (minor); every SEV1/2
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
