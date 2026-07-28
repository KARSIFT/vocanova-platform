# VOC-032 — Begin Milestone R1: Staging Readiness: Specification

## Objective and requirement source

Begin DOC-12 §5 R1: validate the release candidate under real, production-like
staging conditions, with no new product scope beyond fixes for release-blocking
defects, gated on **stable in staging, no unresolved critical/high blocker, all
required tests pass, migration + rollback rehearsed, AI evaluation thresholds
pass, founder completes staging acceptance, scope frozen after** (DOC-12 §5,
R1 paragraph). R1 depends on scope-complete P5 (DOC-12 §6); P5's own package
(VOC-031, adopted) states its acceptance gate itself has not passed, because
live staging evidence has been blocked since VOC-025 by one missing
dependency: DOC-12 §3's F3 "Staging Foundation" milestone has never been
built and has no change package of its own (`VOC-032-D00`, `VOC-032-D04`).
Authority: DOC-12 §5 (F3 and R1 paragraphs), DOC-12 §6 (dependency rules),
DOC-11 (DevOps/CI-CD plan — target infrastructure, release ordering, rollback,
kill switches), DOC-09 §23 (AI evaluation thresholds), `apps/api/ent/README.md`
and `apps/api/migrations/README.md` (existing migration-authority and
rollback-rehearsal rules), and the supplied free-text request, which records a
founder decision on deploy shape for this milestone and confirms a real,
already-provisioned server and domain (`VOC-032-D01`).

## Scope and non-goals

Scope is a fixed ordered thirteen-task sequence (`T00`–`T12`, detailed in
`tasks.md`): a real, database-backed API server (`T00`, replacing today's
two-line `cmd/api/main.go` stub — see `VOC-032-D00`); a documented `.env.example`
(`T01`); Dockerfiles for `apps/api` and `apps/web` (`T02`–`T03`); a
`docker-compose.yml` wiring `web`+`api`+`postgres`+`nginx` for the staging host
(`T04`); an nginx reverse-proxy configuration with Cloudflare-aware TLS
(`T05`); Atlas migration tooling so the already-declared "Atlas is the
migration authority" rule has something to execute (`T06`, `VOC-032-D07`); a
CI/CD workflow that builds, pushes, and deploys to the staging server on
merge to `develop` (`T07`); an AI-evaluation-threshold CI gate (`T08`,
`VOC-032-D09`); a migration-and-rollback rehearsal actually executed once
against the real staging target (`T09`); one live-provider AI evaluation pass
recorded as R1 gate evidence (`T10`); an `infra/README.md` update reflecting
the real state (`T11`); and evidence/mock-inventory/staging-evidence/gate
readiness (`T12`).

Excluded: any new learner-facing product feature or screen; production
deployment, RL1/RL2 technical activation, or autonomous production release
(all remain disabled per `docs/governance/a003-transition-state.yaml`); a real
transactional-email sender or a real Google OAuth provider implementation
(neither exists anywhere in this repository today — only `email.Fake{}` and
`auth.NewFakeOAuthProvider` — this draft records the gap, `VOC-032-D10`, but
does not close it); amending DOC-11 itself (this package can only flag the
contradiction it creates, `VOC-032-D02`, not resolve an approved document);
opening a separate F3 change package (this draft folds F3's undone
infrastructure scope into R1 instead, `VOC-032-D04`); R2/L1 work itself.

## Risk and protected areas

Proposed **R3** (proposal only — not a determination), matching the
`docs/governance/change-risk-classification.md` R3 row verbatim ("production
infrastructure... CI/CD, rollback... secrets") and the path-based floor
`scripts/governance/classify-change-risk.sh` computes for every path this
package touches: `.github/workflows/*`, `*/migrations/*`, `infra/*`, and any
`*/auth/*`-adjacent file (R3 each). No path in this package's affected areas
matches the classifier's R4 list. Protected: `apps/api/migrations` and
`apps/api/ent/schema` (no schema change, but the migration-tooling and
rollback-rehearsal mechanism is new); `apps/api/business/auth`'s existing
token/session/rate-limit primitives (read, reused for real wiring in `T00`,
never modified); `.github/workflows/pipeline.yml` and any new deploy workflow
(first-ever deploy automation and first-ever named GitHub Actions secrets in
this repository); and the real staging host and DNS zone this package's `T09`
rehearsal executes against directly. One consequence inside this otherwise-
routine-R3 package is flagged rather than silently absorbed: this is the
**first time this repository's automation reaches a real, internet-reachable
server and a real DNS zone**, and the first time GitHub Actions secrets beyond
the built-in `GITHUB_TOKEN` are introduced. Under A-003, routine `develop`-
merge automation is already live and proven (§10); this package's deploy
target is staging, not production, so it does not implicate the still-disabled
production/RL1/RL2 gate (§11/12) — but the founder should treat the SSH-key,
Cloudflare-certificate, and DNS provisioning steps this package depends on
(`VOC-032-DEP-00`/`DEP-01`) with the same care as any other credential grant,
since a compromised deploy key or an over-broad nginx/Cloudflare configuration
would have real, if non-production, blast radius. `VOC-032-D02`'s DOC-11
contradiction and `VOC-032-D10`'s email/OAuth gap are recorded, not resolved,
here.

## Decisions, contradictions, security, and privacy

`VOC-032-D00` — **Carry-forward gap confirmation (confirmed 2026-07-28, by
direct repository inspection).** No F3 change package exists; every P1–P5
package (VOC-025 through VOC-031) has carried forward the same open
dependency, "the F3 staging environment does not yet exist." `apps/api/cmd/api/main.go`
is a two-line stub (`func run() error { return nil }`) with no
`http.ListenAndServe`, no config loading, and no database connection — nothing
in this repository today assembles the already-implemented business-module
handlers (`apps/api/app/api/*.go`, exercised only via `NewContractAPI()`'s
in-memory/mock wiring for OpenAPI generation) into a runnable, DB-backed
server. No `Dockerfile`, `docker-compose.yml`, `nginx` config, Atlas config
(`atlas.hcl`), or `.env.example` exists anywhere in the tracked repository.
No workflow in `.github/workflows/` references deploy, staging, Docker
build/push, or any deployment target; `pipeline.yml`'s own header states
"Deploy is out of scope." The AI-evaluation harness
(`apps/api/business/aifeedback/evaluation.go`, `gate.go`) exists and is
tested, but no CI job runs it and no code asserts the DOC-09 §23 numeric
thresholds programmatically. Only `email.Fake{}` (`apps/api/foundation/email`)
and `auth.NewFakeOAuthProvider` exist for magic-link email and Google OAuth
respectively — no real implementation of either exists.

`VOC-032-D01` — **Founder-directed deploy shape, recorded as given, not
invented by this draft.** The supplied request states the deploy target now
exists and is real: a 2 vCPU / 4 GB RAM server and the domain `vocanova.site`
on Cloudflare DNS, and that "the founder has decided the deploy shape for this
milestone": Docker Compose (`web`+`api`+`postgres`) fronted by nginx, TLS via
Cloudflare (origin certificate or Cloudflare-proxied) in front of nginx, with
deploy-to-staging becoming pipeline-automated on merge to `develop` (this
draft's own choice of trigger point, delegated explicitly to the planner —
`VOC-032-D05`).

`VOC-032-D02` — **Unresolved contradiction with DOC-11 §1 (recorded, not
silently resolved).** DOC-11's approved target-infrastructure baseline is:
frontend on Cloudflare Workers via OpenNext (not Docker/nginx), backend as a
Go Docker image on Render Web Service (not a self-hosted Docker Compose host),
database as Render PostgreSQL (not a containerized Postgres on the same box),
and domains `vocanova.com` / `app.vocanova.com` / `api.vocanova.com` with
staging equivalents `staging.vocanova.com` / `api-staging.vocanova.com` — a
different top-level domain than the real, founder-provisioned `vocanova.site`.
DOC-11 §1 itself states this table "is an implementation target, not authority
to procure vendors, incur spend, create infrastructure, deploy, or release" —
but it is still the currently *approved* target, and this package's founder-
directed shape does not match it. Per DOC-12 §11's change-control rule, an
implementation conflict with an approved document is documented, not silently
overridden. This draft proceeds with the founder's explicit, in-hand
direction for **this milestone's staging shape only** (self-hosted Docker
Compose + nginx + Cloudflare DNS/TLS on the real provisioned server), and
records that DOC-11 itself needs a founder-approved amendment to either (a)
adopt this shape as the new target for the staging tier (and possibly
production too, superseding Render/Cloudflare-Workers), or (b) explicitly
scope this package's work as an interim/staging-only arrangement distinct from
a still-future DOC-11-conformant production target. This draft does not
decide (a) vs (b) — that is a founder decision (`VOC-032-DEP-02`).

`VOC-032-D03` — **Staging subdomain proposal (open until founder confirms
DNS).** This draft proposes `staging.vocanova.site` (web) and
`api-staging.vocanova.site` (API), mirroring DOC-11 §1's existing
staging-subdomain naming convention adapted to the real domain, rather than
deploying to the apex `vocanova.site` directly. Keeping the apex domain
unused by this milestone avoids any appearance that a staging deploy is a
production activation, and avoids colliding with whatever the apex domain is
eventually used for. The founder must create the corresponding Cloudflare DNS
A/AAAA records pointed at the provisioned server's IP and confirm proxy
("orange-cloud") status (`VOC-032-DEP-01`).

`VOC-032-D04` — **F3/R1 scope-folding, recorded and flagged for founder
confirmation.** DOC-12 §3 lists F3 "Staging Foundation" as a distinct
milestone (repeatable staging deploy, automated migrations, smoke tests,
observability baseline, rollback/redeploy workflow, rehearsed failure) that
gates A1 through P5's acceptance, and lists R1 "Staging Readiness" as a later,
separate milestone that validates the release candidate under conditions F3
was supposed to already provide (DOC-12 §6: "R1 depends on scope-complete
P5"). No F3 package has ever been opened. The supplied request instructs
beginning R1 while describing exactly F3's undone infrastructure scope (a real
staging deploy, migrations, rollback rehearsal). This draft treats VOC-032 as
the package that finally closes the F3 dependency chain
(`VOC-025-DEP-01` → `VOC-026-DEP-03` → `VOC-027-DEP-02` → `VOC-028-DEP-04` →
`VOC-030-DEP-02` → `VOC-031-DEP-02`) as a byproduct of building what R1
itself needs, rather than requiring a separate F3 package first. This framing
is this draft's own choice, not a founder instruction verbatim, and is
recorded for explicit founder confirmation (`VOC-032-DEP-04`) rather than
silently assumed.

`VOC-032-D05` — **CI/CD trigger point (planner's call, as the request
explicitly delegates).** The staging-deploy workflow triggers on push to
`develop` — i.e., every merge — matching F3's documented "develop→staging
deploy workflow" wording in DOC-12 §5 exactly, rather than a tagged
release-candidate trigger. A tag-based trigger was considered and rejected:
it would require inventing a new tagging convention this repository does not
have, and DOC-12's own F3 wording already names the develop-push model.

`VOC-032-D06` — **Deploy/registry model.** Build once per merge, tag both
images by commit SHA, push to GitHub Container Registry using the built-in
`GITHUB_TOKEN` (no new secret needed for this step — consistent with DOC-11
§2's already-approved "build once... Go API OCI image
`ghcr.io/vocanova/vocanova-api:sha-<sha>`" artifact model), then connect to
the staging host over SSH to pull the new images and restart via
`docker compose`. This needs exactly four new repository secrets beyond the
built-in token: `STAGING_SSH_HOST`, `STAGING_SSH_USER`,
`STAGING_SSH_PRIVATE_KEY`, `STAGING_SSH_KNOWN_HOSTS` (`VOC-032-DEP-00`) — a
registry-push model was chosen over a self-hosted runner or a webhook-pull
agent on the box specifically to avoid needing any additional long-lived
credential or open inbound port beyond SSH.

`VOC-032-D07` — **Migration tooling.** `apps/api/ent/README.md` already
states "Versioned Atlas SQL remains the migration authority," but no Atlas
configuration exists anywhere in the repository — that statement is currently
aspirational. This package adds a minimal `atlas.hcl` pointed at
`apps/api/migrations` so the already-versioned, timestamp-ordered `.sql` files
can actually be applied by the designated tool, rather than introducing a
parallel ad hoc SQL runner.

`VOC-032-D08` — **Rollback rehearsal model.** `apps/api/migrations/README.md`
already states the `.down.sql.example` files are "deliberately not executable
by Atlas" and exist "only for disposable recovery rehearsal," and that
"production recovery must be separately approved." This package's rollback
rehearsal (`T09`) is therefore a manual, evidenced, one-time procedure run
against a disposable copy of the staging database — never an automated
pipeline step, and never run directly against the live staging database
without first taking a disposable copy. This matches DOC-11 §3 ("Database
rollback is not automatic... restore from backup only when data integrity is
at risk").

`VOC-032-D09` — **AI evaluation gate, two tiers.** (a) A deterministic,
mock-provider golden-set evaluation (`aifeedback.RunGoldenEvaluation` against
`aifeedback.NewMockProvider()`) wired as a required CI check that asserts the
exact DOC-09 §23 numeric thresholds (structured-output validity, status
accuracy, meaning preservation, and the several zero-tolerance categories),
failing the build if any threshold is missed — never depending on a paid
provider in normal CI, per DOC-12 §9. (b) One live-provider evaluation pass,
executed once against the real, already-implemented
`aifeedback.NewOpenCodeFeedbackProvider` in the staging environment with
founder-provisioned credentials (`VOC-032-DEP-03`), recorded as R1's own "AI
evaluation thresholds pass" gate evidence — separate from and in addition to
(a), mirroring DOC-12 P3's existing "staging provider evaluation passes"
requirement.

`VOC-032-D10` — **Flagged gap, not resolved by this draft: no real email
sender or real Google OAuth provider exists.** Grepping the entire `apps/api`
tree finds exactly one real, non-fake external-service integration:
`aifeedback.NewOpenCodeFeedbackProvider` (the AI feedback provider). Magic-link
delivery uses only `apps/api/foundation/email.Fake{}`, and Google OAuth uses
only `auth.NewFakeOAuthProvider` — there is no real SMTP/transactional-email
client and no real Google OAuth client anywhere in this repository. DOC-12's
own A1 gate reads "supported auth methods work in staging," and R1's own gate
reads "stable in staging" — neither can be fully demonstrated while magic-link
emails are faked (never actually delivered) and Google OAuth is faked (never
actually exchanges a real token with Google). This draft does **not** add a
real email sender or real Google OAuth client: doing so is a materially
separate scope of engineering work, was not named in the supplied request's
own bounded deliverable list, and needs new third-party accounts (an email-
provider account and a Google Cloud OAuth client) that only the founder can
provision. It is recorded here as a significant, discovered limitation: until
it is closed, "staging acceptance" can at most cover the non-auth-delivery
parts of the core loop, plus auth mechanics that do not depend on a real
email/OAuth round-trip (e.g., session lifecycle, authorization, magic-link
token validation logic itself). The founder must explicitly accept this
limitation or direct that closing it be folded into this package or a
tightly-scoped follow-up before staging acceptance is granted
(`VOC-032-DEP-06`).

**Security and privacy.** No secret is committed by this package; every
credential (`STAGING_SSH_PRIVATE_KEY`, the Cloudflare origin certificate/key,
any staging database password, any AI-provider API key) is referenced only by
GitHub Actions secret name or an env-file path never committed, per
`.env.example`'s own documented convention. The nginx configuration restores
the real client IP from Cloudflare's `CF-Connecting-IP` header only when the
connection genuinely originates from Cloudflare's published IP ranges,
preventing header spoofing from a direct connection to the origin. The
`T00` server bootstrap wires but does not weaken any existing
`apps/api/business/auth` rate-limiting, session, or token-hash primitive. The
staging environment is explicitly non-production: no real learner data,
consistent with DOC-11 §1's "no production data/secrets" rule for
non-production tiers.

## Data, migrations, analytics, and accessibility

No new table, column, or constraint is added by this package — every existing
migration file already exists (`apps/api/migrations/2026072*...sql`). This
package adds the tooling to *apply* them (Atlas, `T06`) and the rehearsal that
proves rollback is possible (`T09`), not new schema. Analytics: none — this is
infrastructure-only work with no learner-facing behavior change. Accessibility:
not applicable — no frontend UI change; `apps/web`'s existing
`next.config.ts` addition (`T03`, enabling `output: 'standalone'` for a lean
Docker image) is a build-configuration change with no rendered-output effect.
