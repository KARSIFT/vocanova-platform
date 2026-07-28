# VOC-032 — Implementation Plan

## Preconditions and protected areas

Do not begin until this draft is adopted and the founder has confirmed
`VOC-032-D02` (DOC-11 contradiction disposition), `VOC-032-D03` (staging
subdomain/DNS), `VOC-032-D04` (F3/R1 scope-folding), and `VOC-032-D10`
(email/OAuth-gap disposition) — none of these may be silently assumed by the
implementer. `T05`, `T07`, `T09`, and `T10` are additionally blocked on
founder-provisioned credentials that do not exist yet (`VOC-032-DEP-00`
SSH access, `VOC-032-DEP-01` Cloudflare certificate/DNS, `VOC-032-DEP-03`
AI-provider staging credentials) — `T00`–`T04`, `T06`, `T08`, and `T11`–`T12`
can proceed without them, but must not claim live verification they cannot
perform. Protected: `apps/api/migrations`, `apps/api/ent/schema` (read-only
in this package — no schema change); `apps/api/business/auth`'s existing
token/session/rate-limit primitives (constructed and called, never modified);
`.github/workflows/*` (new deploy automation, first-ever named secrets); and
the real staging host/DNS zone `T09` touches directly. Preserve every
existing behavior of `NewContractAPI()` (OpenAPI generation) — `T00` adds a
parallel production-wiring path, it does not replace or alter the existing
one.

## File reconciliation and implementation sequence

First inventory the actual scaffold at the adopted base: confirm
`cmd/api/main.go` is still a stub, confirm which business modules have
`postgres.go`/`*sql.DB`-backed constructors already (confirmed present at
draft time for `auth`, `users`, `accounts`, `content`, `learning`, `reviews`,
`aifeedback`, `missions`, `gamification`), and confirm no Dockerfile,
compose file, nginx config, Atlas config, or deploy workflow has been added
by any other package merged since this draft (repeat the `VOC-032-D00`
inspection at the adopted base SHA). Then execute
`T00 → T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10 → T11 → T12`
in order; `T05`'s live-TLS verification and `T07`'s live-SSH-deploy
verification and `T09`/`T10`'s live rehearsal/evaluation wait for their
respective founder-provisioned dependencies rather than guessing a
substitute. Build the production API-wiring function in `T00` as a sibling
to `NewContractAPI()` in the same package, reusing its exact route-
registration calls (`RegisterAuth`, `RegisterContent`, `RegisterLearning`,
`RegisterReviews`, `RegisterAIFeedback`, `RegisterMissions`,
`RegisterOnboarding`, `RegisterSettings`, `RegisterEmailChangeLinks`,
`RegisterAccountDeletionRequests`) against real, Postgres-backed services
instead of duplicating registration logic. Commit `T06`'s migration wrapper
script once and have `T07`'s CI/CD workflow and `T09`'s manual rehearsal both
call it, so the exact apply command is defined in one place. Do not invent a
real email sender or real Google OAuth client (`VOC-032-D10` — out of
scope); do not modify DOC-11 itself (`VOC-032-D02` — flag only).

## Validation and independent verification

Run every installed relevant command discovered at implementation time: Go
`gofmt`/`go vet`/`go test`/`go build` (including the new `T00` server-wiring
and `T08` evaluation-gate code), web lint/typecheck/build,
`scripts/governance/validate-governance.sh` and
`scripts/governance/classify-change-risk.sh` as applicable, `docker build`
for both new Dockerfiles, `docker compose config`/`up` locally, `nginx -t`,
and the Atlas apply command against a disposable Postgres. Claude Code
independently reviews each exact final SHA for: scope and the classifier
floor; that no secret is committed anywhere (Dockerfiles, compose file,
`.env.example`, nginx config, CI/CD workflow); that `T00`'s production wiring
never weakens `auth`'s existing primitives; that `T05`'s real-IP
restoration is correctly scoped to Cloudflare's ranges; that `T07`'s deploy
workflow fails closed and does not tear down healthy running containers
before confirming new ones are healthy; that `T08`'s gate actually enforces
(fails on a violated threshold, not only reports); that `T09`/`T10`'s claims
are honestly scoped to what was actually, live-executed versus what remains
blocked; and that `VOC-032-D02`/`D03`/`D04`/`D10`'s open items are reported
as still-open, not silently resolved by the implementer. Missing credential,
DNS, or live-verification evidence remains a recorded blocker or limitation,
never a pass.

## Deployment and rollback

This draft authorizes no deployment. Future staging rollout (once adopted,
the open decisions are confirmed, and `VOC-032-DEP-00`/`DEP-01`/`DEP-03`
resolve) is ordered exactly as `T09`'s own procedure states: adopted-baseline
build/checks → apply migrations via `T06`'s tooling → deploy the four
containers → health/smoke via `T00`'s `/healthz` → exercise core-loop writes
with a disposable identity → take a disposable database copy → rollback
rehearsal on that copy → forward re-application → `T10`'s live AI-evaluation
pass → record everything in `staging-evidence.md`. Trigger rollback (of the
application deployment, per `T07`'s workflow design) on: a failing health
check after deploy; a migration apply failure; an nginx misconfiguration
exposing an internal port or misrouting a Host header; or any credential
appearing in a committed file. Per `VOC-032-D08`, database rollback itself is
never automated — a corrective forward migration is preferred, and a
restore from backup is reserved for genuine data-integrity risk, exactly as
DOC-11 §3 and `apps/api/migrations/README.md` already require.
