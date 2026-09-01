---
id: DOC-11
title: VocaNova DevOps and CI/CD Plan
version: 1.4
document_type: operations-plan
status: approved
owner: founder
canonical_path: docs/operations/11-devops-and-ci-cd.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-23
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
  - id: VOC-101-standing-staging-token-amendment
    title: "Operator-revoked standing Cloudflare staging token"
    adopted_in: VOC-101
    adopted_at: 2026-08-30
    approving_owner: approved-voc-101-package
    resolution_recorded_in: specs/changes/VOC-101-standing-staging-token/change.yaml
    notes: "Makes the unchanged least-privilege staging token valid until revoked, with fail-closed mandatory revocation, replacement, and incident handling."
  - id: VOC-100-standard-cloudflare-delivery-amendment
    title: "Standard protected-environment staging delivery"
    adopted_in: VOC-100
    adopted_at: 2026-08-28
    approving_owner: approved-voc-100-package
    resolution_recorded_in: specs/changes/VOC-100-standard-cloudflare-delivery/change.yaml
    notes: "Prospectively replaces the custom runtime binder with a manual SHA-bound dispatch, fresh AI review receipt, mechanical approval proxy, first-step approval-history validation, and independent operator-controlled token replacement. PR2 records the separately authorized exact staging environment and environment secret names; production remains held."
  - id: VOC-083-workerd-compatibility-amendment
    title: "Generated Worker inventory and fail-closed workerd diagnostics"
    adopted_in: VOC-083
    adopted_at: 2026-08-23
    approving_owner: approved-voc-083-package
    resolution_recorded_in: specs/changes/VOC-083-sentry-workerd-compatibility/change.yaml
    notes: "T02 makes deterministic OpenNext canonicalization, complete generated-module/reference/Wasm checks, and post-stdio-close workerd diagnostics mandatory before either web smoke can pass."
  - id: VOC-081-local-stack-amendment
    title: "Required disposable local Workers stack evidence"
    adopted_in: VOC-081
    adopted_at: 2026-08-23
    approving_owner: approved-voc-081-package
    resolution_recorded_in: specs/changes/VOC-081-f2-local-cloudflare-development/change.yaml
    notes: "T03 adds one credential-free local-stack job inside ci.yml and makes the stable CI aggregate require it; T04 records the integration-pending F2 evidence without releasing any live hold."
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
> what existed; they do not authorize or describe the final architecture. T03-T10
> completed the repository parity chain, and T11 removed the old runtime assets from
> the active tree. None of those repository changes inspected, mutated, or stopped a
> live server or created Cloudflare, DNS, secret, data, or deployment state.

> **Active amendment (`VOC-100-standard-cloudflare-delivery-amendment`, adopted
> 2026-08-28).** The exact synthetic staging Workers, D1, routes, seven schema-only
> migrations, rollback baselines, and public smoke remain retained historical evidence.
> VOC-100 prospectively replaces the custom binder with one protected GitHub
> environment: a manual SHA-bound `develop` dispatch, required checks, fresh
> non-author AI review receipt, mechanical approval proxy, and first-step approval-
> history validation before secrets. VOC-100 PR2 records that the separately
> authorized settings action created `cloudflare-staging` with exactly the two
> environment secret names and no matching repository or organization Actions secret
> names. No dispatch or deployment occurred. Production and learner-data holds remain
> unchanged.

<!-- VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN -->

VOC-101 makes the unchanged least-privilege token an operator-revoked standing
Cloudflare staging token valid until revoked. Mandatory triggers revoke first and
keep staging disabled until inactive-token verification and a valid replacement's
protected check pass; only voluntary replacement with no trigger may retain the prior
token through checks. The delivery runbook owns failure and incident handling.
Ordinary dispatch, revocation, and replacement need no package or PR and remain
independent of deployment.
<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->

| Capability   | Current repository state                                                                         | Separately held live state                                                       |
| ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Web          | Next.js 16 transformed by OpenNext and tested in local workerd as a Cloudflare Web Worker        | Cloudflare Worker version upload, route, and traffic activation                  |
| API          | TypeScript/Hono Module Worker with generated bindings and complete local workerd contract parity | Cloudflare Worker version upload, service binding, route, and traffic activation |
| Data         | Forward-only D1 migrations, local D1 tests, and compact retired PostgreSQL conversion fixtures   | Separate staging/production D1 creation and any remote migration                 |
| Web-to-API   | Local workerd service binding plus preserved HTTPS `/api/v1` contract                            | Environment-specific service binding and route activation                        |
| Assets/async | Workers Static Assets; Queue/Workflow/DO/R2 remain absent until a measured requirement           | Any separately reviewed product binding or resource                              |
| CI/CD        | Four deterministic workflows; credential-free dry runs and VOC-100 protected staging controls    | Environment-scoped version/migration/promotion after approved dispatch           |
| Secrets      | No deployment secrets in PRs or agents                                                           | Environment-scoped Cloudflare secret bindings unavailable to PRs/Ruflo           |
| Rollback     | Repository reverts plus mocked prior-Worker-version and forward-corrective D1 contracts          | Authorized version traffic restoration or separately authorized D1 recovery      |

No current workflow run can deploy to Preview or Production. Staging requires manual
`develop` dispatch, exact SHA confirmation, same-run checks, the fresh AI review
receipt, approval-history validation before any secret is evaluated, exact account
and resource checks, and the protected `cloudflare-staging` environment. VOC-100 PR2
records the separately authorized environment/secrets truth and explicit acceptance
of the shared-account receipt-forgery residual; it does not dispatch or deploy.
Production traffic or D1 migration remains held by `HOLD-01`, and production learner
data by `HOLD-02`.

### 1.1 Deterministic GitHub Actions foundation

The workflow inventory is exactly four files and has one responsibility per file:

| Workflow         | Stable evidence                                                                                                        | Trigger and authority                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ci.yml`         | foundation/retirement, packages, web, Worker API, disposable local stack, held delivery policy, and `CI / ci required` | PR/push validation plus a held manual gate; no eligible live deployment in current state |
| `governance.yml` | `structure`, `changed-path risk`, and read-only `merge eligibility`                                                    | Pull-request evidence plus protected-branch structure checks; no GitHub write            |
| `quality.yml`    | accessibility and Lighthouse, summarized by `Quality / quality required`                                               | Web/shared/lockfile changes on pull requests only                                        |
| `security.yml`   | dependency audit and secret scan, summarized by `Security / security required`                                         | Pull requests and protected-branch pushes; no secret consumption                         |

All runner jobs have explicit timeouts and Bash semantics. Every external action uses
a reviewed full commit SHA, and every checkout disables persisted credentials. A local
composite action reuses the pinned Node and pnpm setup. Its cache contains only pnpm's
content-addressed store; `node_modules` is not
cached, the lockfile remains frozen, and a cache hit never skips a check. Browser
reports are uploaded only on failure and retained for three days. Fail-fast aggregation
is explicit: the stable `required` result is blocked by any failed, cancelled, or
skipped subsystem, and the same script has a synthetic negative contract test.
The measured adoption baseline contained 204 `foundation` tests: a reviewed PR run
finished in 14m33s and an identical-tree push run was cancelled by the former
15-minute ceiling at 15m16s. Unrelated reviewed base growth subsequently brought the
full wildcard-discovered corpus to 211 tests. The exact 20-minute timeout preserves
that unfiltered suite with five minutes of bounded headroom; a future timeout or
near-cap run requires new defect intake and reviewed evidence rather than another
silent increase or any test weakening.

VOC-081 adds `pnpm ci:local-stack` as a distinct required job inside `ci.yml`. It uses
fresh OS-temporary D1 state, loopback-only Workers, a non-secret service-binding marker,
one controlled restart, negative lifecycle fixtures, and bounded cleanup. The stable
aggregate explicitly needs its result; synthetic policy proves a failed local-stack
result cannot pass `CI / ci required`. The job has read-only permissions and receives
no Cloudflare credential, remote binding, environment, or deploy capability.

VOC-083-T02 makes both web smoke owners fail closed on generated and runtime evidence.
`ci:web` now builds OpenNext before compatibility analysis; that analysis performs a
fresh credential-free Wrangler dry run, hashes and classifies every generated artifact,
verifies the explicit final-bundle canonicalization record, requires every executable
reference in every remaining OpenNext and dry-run JavaScript module to resolve, and
rejects every unsupported runtime Wasm construction. Superseded traced JavaScript is
removed only after its digest, size, and reason are recorded; static/runtime assets are
retained. The disposable local-stack path independently builds and scans fresh output
before startup. Both paths use the same bounded, redacted, line-aware incremental
collector, retain early hard diagnostics, join split chunks, and classify after child
and stdio close, so an HTTP 200 or process exit cannot hide a late unhandled rejection,
compile/runtime error, or unsupported WebAssembly API diagnostic. The standalone web
smoke may retry only a recognized loopback bind collision, for at most three fresh,
distinct port attempts with bounded selection; it strips inherited Sentry DSN, token,
and credential variables. Configuration, runtime, and unknown startup failures remain
immediately terminal.

The subsystem `pnpm ci:*` commands are local entry points, not CI-only behavior;
`pnpm validate` remains the full pre-review gate. This design follows the applicable
parts of mature Workers/Hono/OpenNext repositories—pinned dependencies, focused checks,
non-short-circuiting evidence, and workerd-oriented separation—without importing their
release bots, write permissions, vendor services, or repository scale.

VOC-080-T03 makes `pnpm ci:web` the credential-free Worker gate. It transforms the
Next.js build through OpenNext, then verifies the complete generated-artifact manifest
and every remaining module/reference compatibility invariant, committed Wrangler types, a Wrangler dry
run, the 3 MiB compressed target, and the local startup profile before sending
representative static/SSR/RSC/middleware/auth/API requests through two Workers in local
workerd. A plain `next build` remains useful for UI checks but is not Cloudflare
compatibility evidence. No T03 command uploads a version, queries an account,
provisions a resource, or deploys.

VOC-080-T04 adds the separate `worker api` CI job without adding a workflow file. It
verifies generated D1 bindings, Hono operational OpenAPI, the frozen 25-operation
`/api/v1` migration baseline, API-client path compatibility, privacy-safe
problems/logs, explicit credentialed CORS, prepared statements, a forward STRICT D1
migration applied from empty and replayed in workerd, static safety rules, build, and
credential-free Wrangler dry-run. T10 adds distinct staging/production environments
with non-resource D1/route sentinels, credential-free dry runs, and held
migration/version/promotion/rollback behavior. Real IDs, routes, environment secrets,
and activation evidence remained absent in T10. Later, VOC-094 created the bounded
synthetic staging resource tuple, and VOC-100 PR2 records the separately authorized
`cloudflare-staging` environment and environment secret names. No dispatch or
deployment occurred.

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

**Historical amended (v1.1) infrastructure baseline** (2026-07-30, adopted via VOC-032;
founder as approving owner; superseded in the repository on 2026-08-23 by
VOC-080-T11). This is the shape `T00`–`T09` actually built. It is retained as a
historical record, not as a claim about any live server that T11 did not inspect:

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
| Deploy automation                                                       | Paused after VOC-078-T03. Historical workflows deployed by SSH. T10 later added a held manual Cloudflare state machine, but its committed manifest blocks before environment jobs or secrets; it neither builds/pushes deployment images nor polls server health. T03 and T10 did not change runtime assets or servers; T11 later removed old assets from Git only and still made no live-server claim.                                         |
| Error monitoring                                                        | Sentry remains embedded in application runtime code. VOC-078-T03 removed the scheduled Sentry-to-GitHub workflow, so GitHub no longer queries Sentry or files monitoring issues automatically.                                                                                                                                                                                                                                                  |
| Uptime monitoring                                                       | Better Stack / UptimeRobot (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                          |
| Harness, Terraform/OpenTofu, Cloudflare D1/KV/Durable Objects/Queues/R2 | Deferred post-MVP (unchanged)                                                                                                                                                                                                                                                                                                                                                                                                                   |

This table is historical evidence, not an implementation target or authority to procure
vendors, incur spend, create infrastructure, deploy, or release. Each such action requires its
own approved change package and the authority applicable at execution time. The v1.1 rows above
record the staging tier built by VOC-032 `T00`–`T09`; T11 removed its repository assets without
inspecting or asserting its live state. RL1/RL2 technical activation remains disabled per
`docs/governance/a003-transition-state.yaml` and is not authorized by this amendment.
**Updated 2026-08-08**: production-tier deployment and autonomous production
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
> - **`apps/web` began reporting errors to Sentry in `VOC-051-T01`.** Its historical
>   implementation used `@sentry/nextjs` across the browser, server, and edge runtimes;
>   previously only `apps/api` reported errors. `VOC-083-T01/T02` superseded that SDK/runtime
>   detail with exact `@sentry/cloudflare@10.69.0` Worker/request instrumentation and
>   `@sentry/react@10.69.0` browser instrumentation, with no `@sentry/nextjs` dependency or
>   source import. The current adapters remain no-ops when their DSNs are unset, matching
>   `apps/api`'s existing behaviour, so an unconfigured environment reports nothing rather than
>   failing.
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
>   Application Sentry instrumentation and the four-project evidence remained present when that
>   automation was removed; `VOC-083` later adapted the web SDK/runtime boundary as recorded
>   above. No current repository automation queries Sentry or opens monitoring issues.
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
