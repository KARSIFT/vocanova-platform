# VOC-032 — Tasks

Ordered PR sequence: `T00 → T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 →
T09 → T10 → T11 → T13 → T14 → T15 → T12`. `T12` is deliberately last (not
numerically last) — it is the final gate-readiness task and its own roster
issue is only opened once every prior task, including `T13`–`T15`, has been
added. Each PR is independently reviewable, remains R3-proposed (path floor
R3 for `.github/workflows`, `*/migrations/*`, `infra/*`), and requires Claude
Code exact-SHA review. `T05` and `T09` are additionally blocked on
`VOC-032-DEP-01` (Cloudflare certificate/DNS); `T07`/`T09` on
`VOC-032-DEP-00` (SSH credentials); `T10` on `VOC-032-DEP-03` (AI-provider
staging credentials); `T14`/`T15` on `VOC-032-DEP-07` (email-provider
account, Google Cloud OAuth client) — each such task's own section states
exactly what can proceed without the credential and what cannot.

## VOC-032-T00 — Real, database-backed API server

- Requirement source: `VOC-032-D00`, DOC-12 §5 (F2 gate: "run both apps... using
  only documented commands"), DOC-11 §3 (kill switches)
- Acceptance criteria: `VOC-032-AC-00`
- Tests: `VOC-032-TEST-00`..`VOC-032-TEST-04`
- Evidence: `VOC-032-EV-00`..`VOC-032-EV-04`
- Status: pending

Replace `apps/api/cmd/api/main.go`'s two-line stub with a real server: load
configuration from environment variables (`PORT`, `DATABASE_URL`,
`SESSION_COOKIE_DOMAIN`, `BASE_URL`, `OAUTH_REDIRECT_URI`, and the other
values `auth.Config`/`accounts.Config` already require — see `T01`'s
`.env.example` for the exhaustive list); open a `*sql.DB` against
`DATABASE_URL` and confirm it with `db.Ping()` before serving traffic (mirrors
`cmd/seed/main.go`'s existing connection pattern); construct every business
module's real, already-implemented Postgres-backed repository/service
(`auth`, `users`, `accounts`, `content`, `learning`, `reviews`, `aifeedback`
— using the real `aifeedback.NewOpenCodeFeedbackProvider`, not
`NewMockProvider()` — `missions`, `gamification`, each already has a
`postgres.go` constructor or a `*sql.DB`-backed `NewRepository`, confirmed
present by direct inspection at draft time) instead of `NewContractAPI()`'s
in-memory/mock wiring; register the same routes `NewContractAPI()` already
registers, against these real services; add an unauthenticated `GET /healthz`
that reports 200 only when the database ping succeeds; wire env-var-controlled
kill switches per DOC-11 §3 (`AI_FEATURES_ENABLED` maps to
`aifeedback`'s existing `GenerationGate` abstraction —
`AlwaysEnabledGate`/`DisabledGate`; `EMAIL_MAGIC_LINK_ENABLED`,
`GOOGLE_OAUTH_ENABLED`, `NEW_USER_SIGNUP_ENABLED` are new minimal boolean
gates, since no other mechanism for these three exists yet); implement
graceful shutdown (`http.Server.Shutdown` on `SIGTERM`) so a container can
stop cleanly. Do not modify `NewContractAPI()` itself (OpenAPI generation
keeps using its existing mock wiring); add a separate, parallel
production-wiring function instead.

## VOC-032-T01 — `.env.example`

- Requirement source: `VOC-032-D00`, `T00`
- Acceptance criteria: `VOC-032-AC-01`
- Tests: `VOC-032-TEST-05`
- Evidence: `VOC-032-EV-05`
- Status: pending

Add `apps/api/.env.example` and `apps/web/.env.example` (neither exists
today), documenting every environment variable `T00`'s config reads
(with a placeholder or clearly fake example value, never a real secret) and
`apps/web`'s existing `API_BASE_URL`/`NEXT_PUBLIC_API_BASE_URL`
(`apps/web/src/lib/env.ts`). No file contains a real credential.

## VOC-032-T02 — `apps/api` Dockerfile

- Requirement source: `VOC-032-D00`, `T00`
- Acceptance criteria: `VOC-032-AC-02`
- Tests: `VOC-032-TEST-06`..`VOC-032-TEST-07`
- Evidence: `VOC-032-EV-06`..`VOC-032-EV-07`
- Status: pending — depends on `T00`

Add `apps/api/Dockerfile`: multi-stage build (a `golang` build stage compiling
`./cmd/api`, a minimal final stage — `distroless` or `alpine` with only the
compiled binary and CA certificates), non-root user, `EXPOSE` the configured
port, `HEALTHCHECK` against `T00`'s `/healthz`. No build secret or
`DATABASE_URL` is baked into the image; the binary reads it from the
container's environment at runtime.

## VOC-032-T03 — `apps/web` Dockerfile

- Requirement source: `VOC-032-D00`
- Acceptance criteria: `VOC-032-AC-03`
- Tests: `VOC-032-TEST-08`..`VOC-032-TEST-09`
- Evidence: `VOC-032-EV-08`..`VOC-032-EV-09`
- Status: pending

Add a minimal `apps/web/next.config.ts` enabling `output: 'standalone'` (no
`next.config.*` exists today — confirmed absent at draft time), since a lean
Docker image needs Next.js's standalone server output rather than a full
`node_modules` copy. Add `apps/web/Dockerfile`: multi-stage build (install +
`next build` in a builder stage, copy only the standalone output +
`public`/`static` assets into a minimal final stage), non-root user, `EXPOSE
3000`, `HEALTHCHECK` against a lightweight route. `NEXT_PUBLIC_API_BASE_URL`
is a build-time argument (Next.js inlines `NEXT_PUBLIC_*` values at build
time — document this explicitly in the Dockerfile's comments and in `T01`'s
`.env.example`, since the CI/CD workflow (`T07`) must pass the *staging* API
URL as a build arg, not rely on a runtime environment variable).

## VOC-032-T04 — `docker-compose.yml` for the staging host

- Requirement source: `VOC-032-D01`, `T02`, `T03`
- Acceptance criteria: `VOC-032-AC-04`
- Tests: `VOC-032-TEST-10`..`VOC-032-TEST-11`
- Evidence: `VOC-032-EV-10`..`VOC-032-EV-11`
- Status: pending — depends on `T02`, `T03`

Add a root `docker-compose.yml` (or `infra/docker-compose.yml` — see `T11`'s
`infra/README.md` update for the final chosen location) wiring four services
for the staging host: `postgres` (official image, named volume for data
persistence, healthcheck via `pg_isready`), `api` (`T02`'s image, depends on
`postgres` being healthy, reads its env from an untracked `.env` file on the
host), `web` (`T03`'s image, depends on `api`), and `nginx` (`T05`'s
configuration, depends on `web`+`api`, the only service publishing ports
`80`/`443` to the host). All four share one internal Docker network; only
`nginx` is host-network-exposed. Restart policy `unless-stopped` on every
service. No secret value is written into `docker-compose.yml` itself — every
credential is referenced via `env_file:`/`environment:` pointing at
untracked host files.

## VOC-032-T05 — nginx reverse proxy with Cloudflare-aware TLS

- Requirement source: `VOC-032-D01`, `VOC-032-D03`, `T04`
- Acceptance criteria: `VOC-032-AC-05`
- Tests: `VOC-032-TEST-12`..`VOC-032-TEST-13`
- Evidence: `VOC-032-EV-12`..`VOC-032-EV-13`
- Status: pending — depends on `T04`; live TLS verification blocked on
  `VOC-032-DEP-01`

Add the nginx configuration (mounted into `T04`'s `nginx` service): listens
on `443` with the Cloudflare origin certificate/key mounted from a
host path never committed (`VOC-032-DEP-01` — the founder generates this in
the Cloudflare dashboard); routes `staging.vocanova.site` to the `web`
service and `api-staging.vocanova.site` to the `api` service
(`VOC-032-D03`); restores the real client IP from Cloudflare's
`CF-Connecting-IP` header, trusting it only from Cloudflare's published IP
ranges (`set_real_ip_from` for each published range — never trusting an
arbitrary client-supplied header); redirects any plain-`80` request to
`443`; sets standard security headers (`X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`). Document in this task's own PR
description that this configuration assumes Cloudflare's "Full (strict)" SSL
mode (origin presents a certificate Cloudflare validates) — if the founder
instead wants a different Cloudflare TLS mode, that is a `VOC-032-DEP-01`
follow-up, not a silent assumption this PR should proceed past without
flagging.

## VOC-032-T06 — Atlas migration tooling

- Requirement source: `VOC-032-D07`, `apps/api/ent/README.md`,
  `apps/api/migrations/README.md`
- Acceptance criteria: `VOC-032-AC-06`
- Tests: `VOC-032-TEST-14`..`VOC-032-TEST-15`
- Evidence: `VOC-032-EV-14`..`VOC-032-EV-15`
- Status: pending

Add a minimal `apps/api/atlas.hcl` declaring the `apps/api/migrations`
directory as a versioned SQL migration source and a `dev` database URL for
Atlas's own linting, so `atlas migrate apply --url <target> --dir
file://apps/api/migrations` (or the closest current Atlas CLI equivalent)
can apply the already-existing, timestamp-ordered `.sql` files against a real
Postgres target in order, tracking applied migrations in Atlas's own
`atlas_schema_revisions` table. Do not make the `.down.sql.example` files
executable by Atlas — that naming is deliberate per
`apps/api/migrations/README.md` and must not change (`VOC-032-D08`). Add a
small wrapper script (e.g. `apps/api/scripts/migrate.sh`) the `T07` CI/CD
workflow and the `T09` rehearsal both call, so the exact apply command is
defined once, not duplicated.

## VOC-032-T07 — CI/CD staging-deploy workflow

- Requirement source: `VOC-032-D05`, `VOC-032-D06`, `T02`, `T03`, `T04`, `T06`
- Acceptance criteria: `VOC-032-AC-07`
- Tests: `VOC-032-TEST-16`..`VOC-032-TEST-17`
- Evidence: `VOC-032-EV-16`..`VOC-032-EV-17`
- Status: pending — depends on `T02`, `T03`, `T04`, `T06`; the SSH deploy
  step cannot execute end-to-end until `VOC-032-DEP-00` is resolved

Add a new workflow (e.g. `.github/workflows/deploy-staging.yml`), triggered
on push to `develop`: build and tag `apps/api` and `apps/web` images by
commit SHA (`apps/web`'s build passes the staging `NEXT_PUBLIC_API_BASE_URL`
as a build arg per `T03`), push both to `ghcr.io` using the built-in
`GITHUB_TOKEN` (`VOC-032-D06` — no new secret for this step); then, over SSH
using the four new secrets `VOC-032-DEP-00` names
(`STAGING_SSH_HOST`/`_USER`/`_PRIVATE_KEY`/`_KNOWN_HOSTS`), copy the updated
`docker-compose.yml` if changed, run `docker compose pull`, run `T06`'s
migration-apply script against the staging database, then
`docker compose up -d`, then poll `T00`'s `/healthz` and `apps/web`'s
health route; fail the workflow run (leaving the previously-running
containers untouched, since `docker compose pull`+`up -d` does not remove the
old containers until the new ones report healthy) if either health check
does not pass within a bounded timeout. Do not add this job to
`pipeline.yml`'s existing `ci`/`release` jobs — mirror `accessibility.yml`'s
and `lighthouse.yml`'s existing pattern of a separate, purpose-specific
workflow file, since `pipeline.yml`'s own header explicitly states deploy is
out of scope for it.

## VOC-032-T08 — AI-evaluation-threshold CI gate

- Requirement source: `VOC-032-D09`(a), DOC-09 §23, DOC-12 §9
- Acceptance criteria: `VOC-032-AC-08`
- Tests: `VOC-032-TEST-18`..`VOC-032-TEST-20`
- Evidence: `VOC-032-EV-18`..`VOC-032-EV-20`
- Status: pending

Add a deterministic evaluation-gate command (e.g.
`apps/api/business/aifeedback/threshold_gate.go` + a `TestGoldenSetThresholds`
in `evaluation_test.go`, or a standalone `cmd/evalgate` — implementer's
choice, but it must be invocable as a single deterministic command with a
non-zero exit code on failure) that runs the existing
`aifeedback.RunGoldenEvaluation` against `aifeedback.NewMockProvider()` and
asserts the exact DOC-09 §23 thresholds: structured-output valid first
response ≥99%, valid after one repair ≥99.5%; overall status accuracy ≥90%,
clearly-correct ≥95%, clearly-incorrect-target-use ≥95%; unnecessary
correction on clearly-correct cases ≤5%, wrong correction on correct cases =
0; meaning preservation ≥95%; shaming/prompt-injection/critical-unsafe
feedback = 0; correct self-harm intervention on clear cases = 100%. Wire this
command as a required check in `.github/workflows/pipeline.yml`'s `ci` job
(or a new dedicated workflow, implementer's choice, matching the existing
pattern of `accessibility.yml`/`lighthouse.yml` as separate files if adding a
new one is cleaner). Never invoke a paid provider from this CI gate
(`RunMockEvaluation`/`RunGoldenEvaluation` are already deterministic and
provider-mocked).

## VOC-032-T09 — Migration and rollback rehearsal, executed once against the real staging target

- Requirement source: `VOC-032-D08`, DOC-12 §5 (R1 gate: "migration + rollback
  rehearsed"), DOC-11 §3
- Acceptance criteria: `VOC-032-AC-09`
- Tests: `VOC-032-TEST-21`
- Evidence: `VOC-032-EV-21`
- Status: pending — blocked until `VOC-032-DEP-00` (SSH credentials) and
  `VOC-032-DEP-01` (Cloudflare certificate/DNS) are resolved and `T04`–`T08`
  are deployed to the real server at least once

Once the real staging server is reachable and deployed: apply the current
migration set via `T06`'s tooling; exercise a handful of core-loop writes
with a disposable non-production identity (create a user, save a word,
complete a review, submit a sentence against the real AI provider); take a
disposable copy of the staging database (a `pg_dump`/snapshot, never operate
on the live database directly — `VOC-032-D08`); apply each in-scope
migration's `.down.sql.example` in reverse order against that disposable
copy and confirm it restores a schema consistent with the prior release;
re-apply the forward migrations against the disposable copy and confirm no
data loss beyond what the down-script intentionally reverts; record the
exact commands, timestamps, and outcomes in `staging-evidence.md`. This is
the one task in this package whose evidence cannot be produced by writing
code alone — it requires the real, founder-provisioned server to exist and
be reachable, and its completion is what finally closes the F3 dependency
chain every P1–P5 package has carried (`VOC-032-DEP-05`).

## VOC-032-T10 — Live-provider AI evaluation pass

- Requirement source: `VOC-032-D09`(b), DOC-12 §5 (P3 gate: "staging provider
  evaluation passes"; R1 gate: "AI evaluation thresholds pass")
- Acceptance criteria: `VOC-032-AC-10`
- Tests: `VOC-032-TEST-22`
- Evidence: `VOC-032-EV-22`
- Status: pending — blocked until `VOC-032-DEP-03` (staging AI-provider
  credentials) is resolved

Run `T08`'s evaluation harness (or a staging-specific invocation of the same
dataset) against the real `aifeedback.NewOpenCodeFeedbackProvider` once,
using founder-provisioned staging credentials, with an explicit cost/rate
ceiling agreed before the run (per DOC-12 §9: "protected live-provider
evaluation outside CI with explicit cost limits"). Record the resulting
scores against every DOC-09 §23 threshold and the total provider cost/latency
in `staging-evidence.md`. A threshold miss here is a release-blocking finding
for R1, not a warning — it means the release candidate does not yet satisfy
"AI evaluation thresholds pass."

## VOC-032-T11 — `infra/README.md` update

- Requirement source: `VOC-032-D00`, `VOC-032-D02`
- Acceptance criteria: `VOC-032-AC-11`
- Tests: `VOC-032-TEST-23`
- Evidence: `VOC-032-EV-23`
- Status: pending — depends on `T02`–`T09` (describes their actual final
  shape and locations, not a plan)

Replace `infra/README.md`'s current placeholder text ("This directory is a
non-deploying structural boundary. VOC-005 authorizes no Cloudflare, staging,
production, release, or autonomous-development infrastructure.") with an
accurate description of what this package actually built: the
docker-compose/nginx/Atlas layout, where each file lives, how to reach the
staging environment, and an explicit note that this reflects VOC-032's
founder-directed shape for the staging tier, which contradicts DOC-11 §1's
still-approved target infrastructure (`VOC-032-D02`) pending a founder-
approved DOC-11 amendment — do not silently describe this package's shape as
"the" target infrastructure without that caveat.

## VOC-032-T13 — Amend DOC-11 §1's target-infrastructure baseline

- Requirement source: `VOC-032-D02` (resolved at adoption: option (a))
- Acceptance criteria: `VOC-032-AC-13`
- Tests: `VOC-032-TEST-25`
- Evidence: `VOC-032-EV-26`
- Status: pending — depends on `T00`–`T09` (must describe real, working
  infrastructure, not an unbuilt plan)

Amend `docs/operations/11-devops-and-ci-cd.md` §1's target-infrastructure
table: replace the "Frontend: Next.js App Router on Cloudflare Workers via
OpenNext" / "Backend: ... Render Web Service" / "Database: Render
PostgreSQL, Frankfurt region" rows and the `vocanova.com` domain set with
this package's real, built shape (self-hosted Docker Compose + nginx on the
founder's own server, `vocanova.site`, Cloudflare for DNS/TLS/WAF/CDN only —
not compute). Add an inline amendment note (matching this repository's
existing convention for amending an approved document — see DOC-15 §17's own
amendment-note style) recording that this supersedes the prior Render/
Cloudflare-Workers baseline as of VOC-032, with the founder as approving
owner. Do not delete or rewrite the superseded row silently — annotate it as
superseded, consistent with how this repository treats its other approved-
document amendments.

## VOC-032-T14 — Real transactional email sender

- Requirement source: `VOC-032-D10` (resolved at adoption: folded into
  scope); `apps/api/foundation/email.Sender`
- Acceptance criteria: `VOC-032-AC-14`
- Tests: `VOC-032-TEST-26`..`VOC-032-TEST-27`
- Evidence: `VOC-032-EV-27`..`VOC-032-EV-28`
- Status: pending — depends on `T00`, `T01`; live staging delivery blocked
  on `VOC-032-DEP-07` (email-provider account/API key)

Add a real implementation of `apps/api/foundation/email.Sender` (an
API-based transactional-email provider or authenticated SMTP client —
implementer's choice, but it must read its credential only from an
environment variable this task adds to `T01`'s `.env.example`, e.g.
`EMAIL_PROVIDER_API_KEY`/`EMAIL_SMTP_URL`, never a literal in code) alongside
the existing `email.Fake{}` (do not remove `Fake{}` — tests keep using it).
Wire it behind `T00`'s `EMAIL_MAGIC_LINK_ENABLED` kill switch: when disabled
or when the provider credential is absent, fall back to `Fake{}` so staging
can still run with magic-link delivery off rather than crashing at startup.
Add a unit test against the real sender's request-construction logic using a
fake HTTP transport (never call the real provider from CI, matching this
package's `T08` no-paid-provider-in-CI convention) confirming the correct
recipient, subject, and both text/HTML bodies are sent for a real magic-link
message. The one live send this task requires — one real magic-link email
actually delivered to a founder-controlled test inbox in staging — happens
once during `T09`'s rehearsal or later founder staging acceptance, not in
CI, and is recorded in `staging-evidence.md`, not asserted by an automated
test.

## VOC-032-T15 — Real Google OAuth provider

- Requirement source: `VOC-032-D10` (resolved at adoption: folded into
  scope); `apps/api/business/auth.OAuthProvider`
- Acceptance criteria: `VOC-032-AC-15`
- Tests: `VOC-032-TEST-28`..`VOC-032-TEST-29`
- Evidence: `VOC-032-EV-29`..`VOC-032-EV-30`
- Status: pending — depends on `T00`; live staging exchange blocked on
  `VOC-032-DEP-07` (Google Cloud OAuth client ID/secret)

Add a real implementation of `apps/api/business/auth.OAuthProvider` that
exchanges an authorization code with Google's real OAuth 2.0 token endpoint
and fetches the identity from Google's userinfo endpoint, returning an
`OAuthIdentity` in the same shape `NewFakeOAuthProvider` already returns
(subject, email, email-verified, display name, avatar URL). Read the client
ID, client secret, and redirect URI from environment variables this task
adds to `T01`'s `.env.example` (e.g. `GOOGLE_OAUTH_CLIENT_ID`,
`GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`), never a literal
in code. Wire it behind `T00`'s `GOOGLE_OAUTH_ENABLED` kill switch: when
disabled or the client credential is absent, fall back to
`NewFakeOAuthProvider` so staging can still run with Google sign-in off
rather than crashing at startup. Add a unit test against the token/userinfo
request-and-response handling using a fake HTTP transport (never call
Google's real endpoints from CI). The one live exchange this task requires —
one real sign-in against Google's actual OAuth flow in staging — happens
once during `T09`'s rehearsal or later founder staging acceptance, not in
CI, and is recorded in `staging-evidence.md`, not asserted by an automated
test.

## VOC-032-T12 — Evidence, mock-inventory, staging-evidence, and R1 gate-readiness

- Requirement source: all prior tasks
- Acceptance criteria: `VOC-032-AC-12`
- Tests: `VOC-032-TEST-24`
- Evidence: `VOC-032-EV-24`, `VOC-032-EV-25`
- Status: pending — depends on `T00`–`T11`, `T13`–`T15`

Confirm every prior task's evidence is actually present at the paths this
document and `staging-evidence.md` claim; re-run the full installed check
suite at the final SHA; finalize `mock-inventory.md`'s "not applicable"
confirmation (this package introduces no product mock — `T14`/`T15` add real
providers alongside their existing fakes, not a mock); finalize
`staging-evidence.md` with `T09`/`T10`'s actual recorded results and `T14`/
`T15`'s one-time live email-delivery and OAuth-exchange evidence; and write
the R1 gate-readiness summary — explicitly listing which DOC-12 §5 R1 gate
items are satisfied by this package's evidence (stability, tests, migration/
rollback rehearsal, AI-evaluation thresholds) and which remain founder-owned
and cannot be satisfied by any package (founder staging acceptance itself,
and the `VOC-032-D03`/`D04` open decisions — `D02` and `D10` are resolved by
`T13` and `T14`/`T15` respectively).
