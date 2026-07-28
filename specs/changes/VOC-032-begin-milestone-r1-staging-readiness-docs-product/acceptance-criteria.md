# VOC-032 — Acceptance Criteria

Acceptance criteria are observable, stable, security-aware, and bidirectionally
traceable to requirements (`D00`–`D10`), tasks (`T00`–`T12`), tests
(`VOC-032-TEST-*`), and evidence. `D02`, `D03`, `D04`, and `D10` are open or
this-draft-proposed decisions; the criteria below are written against this
draft's proposed defaults and must be re-verified against whatever the
founder actually confirms at adoption.

## VOC-032-AC-00 — Real, database-backed API server

- Requirement source: `VOC-032-D00`
- Tasks: `VOC-032-T00`
- Tests: `VOC-032-TEST-00`..`VOC-032-TEST-04`
- Evidence: `VOC-032-EV-00`..`VOC-032-EV-04`
- Result: pending

`cmd/api` starts a real HTTP server that loads configuration from the
environment, refuses to serve traffic if the database is unreachable,
registers every existing contract route against real Postgres-backed
services (not the mock/in-memory wiring `NewContractAPI()` uses for OpenAPI
generation), exposes `GET /healthz` reporting the live database-connection
state, honors the four DOC-11 §3 kill-switch environment variables, and
shuts down gracefully on `SIGTERM`.

## VOC-032-AC-01 — `.env.example`

- Requirement source: `VOC-032-D00`
- Tasks: `VOC-032-T01`
- Tests: `VOC-032-TEST-05`
- Evidence: `VOC-032-EV-05`
- Result: pending

`apps/api/.env.example` and `apps/web/.env.example` exist, and every
environment variable `T00`'s config reads and `apps/web/src/lib/env.ts`
already reads is documented with a placeholder value. Neither file contains
a real secret.

## VOC-032-AC-02 — `apps/api` Dockerfile

- Requirement source: `VOC-032-D00`
- Tasks: `VOC-032-T02`
- Tests: `VOC-032-TEST-06`..`VOC-032-TEST-07`
- Evidence: `VOC-032-EV-06`..`VOC-032-EV-07`
- Result: pending

`docker build` on `apps/api/Dockerfile` produces an image; running it with a
valid `DATABASE_URL` reachable results in `/healthz` reporting healthy within
a bounded startup time; the image runs as a non-root user and contains no
baked-in secret.

## VOC-032-AC-03 — `apps/web` Dockerfile

- Requirement source: `VOC-032-D00`
- Tasks: `VOC-032-T03`
- Tests: `VOC-032-TEST-08`..`VOC-032-TEST-09`
- Evidence: `VOC-032-EV-08`..`VOC-032-EV-09`
- Result: pending

`docker build` on `apps/web/Dockerfile` (using Next.js's `output: 'standalone'`
build) produces an image that serves the app on the expected port; the image
runs as a non-root user; `NEXT_PUBLIC_API_BASE_URL` is documented as a
build-time argument, not a runtime environment variable.

## VOC-032-AC-04 — `docker-compose.yml` for the staging host

- Requirement source: `VOC-032-D01`
- Tasks: `VOC-032-T04`
- Tests: `VOC-032-TEST-10`..`VOC-032-TEST-11`
- Evidence: `VOC-032-EV-10`..`VOC-032-EV-11`
- Result: pending

`docker compose config` validates without error; `docker compose up` locally
brings up `postgres`, `api`, `web`, and `nginx` with `api`/`web` reporting
healthy once `postgres` is healthy; no service other than `nginx` publishes a
host port; no secret value appears literally in the compose file itself.

## VOC-032-AC-05 — nginx reverse proxy with Cloudflare-aware TLS

- Requirement source: `VOC-032-D01`, `VOC-032-D03`
- Tasks: `VOC-032-T05`
- Tests: `VOC-032-TEST-12`..`VOC-032-TEST-13`
- Evidence: `VOC-032-EV-12`..`VOC-032-EV-13`
- Result: pending — live TLS verification blocked by `VOC-032-DEP-01`

nginx's configuration syntax-validates (`nginx -t`); local (non-TLS or
self-signed-substitute) proxying correctly routes a `staging.vocanova.site`
Host header to `web` and `api-staging.vocanova.site` to `api`; `80` redirects
to `443`; `set_real_ip_from` is scoped to Cloudflare's published ranges, not
`0.0.0.0/0`. Live Cloudflare-issued-certificate verification against the real
domain is recorded as blocked until `VOC-032-DEP-01` resolves, not asserted
as passing.

## VOC-032-AC-06 — Atlas migration tooling

- Requirement source: `VOC-032-D07`, `VOC-032-D08`
- Tasks: `VOC-032-T06`
- Tests: `VOC-032-TEST-14`..`VOC-032-TEST-15`
- Evidence: `VOC-032-EV-14`..`VOC-032-EV-15`
- Result: pending

Atlas (or the closest current CLI) successfully applies every existing
`apps/api/migrations/*.sql` file in order against a disposable PostgreSQL
instance, tracking applied revisions; re-running the apply command is a
no-op (idempotent); no `.down.sql.example` file is discoverable/executable by
the forward-apply command.

## VOC-032-AC-07 — CI/CD staging-deploy workflow

- Requirement source: `VOC-032-D05`, `VOC-032-D06`
- Tasks: `VOC-032-T07`
- Tests: `VOC-032-TEST-16`..`VOC-032-TEST-17`
- Evidence: `VOC-032-EV-16`..`VOC-032-EV-17`
- Result: pending — live SSH-deploy execution blocked by `VOC-032-DEP-00`

The workflow YAML is syntactically valid and its build/tag/push-to-GHCR
steps succeed on a test push (verifiable without the SSH secrets); the
SSH-connect/deploy/migrate/health-check steps are correctly sequenced and
fail the run (without tearing down currently-running containers) on a health
check that does not pass within the configured timeout. Live end-to-end
execution of the SSH steps against the real server is recorded as blocked
until `VOC-032-DEP-00` resolves, not asserted as passing.

## VOC-032-AC-08 — AI-evaluation-threshold CI gate

- Requirement source: `VOC-032-D09`(a), DOC-09 §23
- Tasks: `VOC-032-T08`
- Tests: `VOC-032-TEST-18`..`VOC-032-TEST-20`
- Evidence: `VOC-032-EV-18`..`VOC-032-EV-20`
- Result: pending

The evaluation-gate command runs `RunGoldenEvaluation` against the mock
provider and passes when every DOC-09 §23 threshold is met; it fails (non-
zero exit) when a threshold is deliberately violated in a test fixture
(proving the gate actually enforces, not just reports); it is wired as a
required check and never invokes a paid provider.

## VOC-032-AC-09 — Migration and rollback rehearsal against the real staging target

- Requirement source: `VOC-032-D08`, DOC-12 §5 (R1 gate)
- Tasks: `VOC-032-T09`
- Tests: `VOC-032-TEST-21`
- Evidence: `VOC-032-EV-21`
- Result: pending — blocked by `VOC-032-DEP-00`, `VOC-032-DEP-01`

The full migration set is applied to the real staging database; a disposable
copy is created; every in-scope migration's `.down.sql.example` is applied in
reverse order to that disposable copy and produces a schema consistent with
the prior release; forward re-application succeeds with no unintended data
loss; the exact commands, timestamps, and outcomes are recorded in
`staging-evidence.md`. Live-only work: no dry-run or CI substitute satisfies
this criterion — it must be the real target.

## VOC-032-AC-10 — Live-provider AI evaluation pass

- Requirement source: `VOC-032-D09`(b), DOC-12 §5 (R1 gate)
- Tasks: `VOC-032-T10`
- Tests: `VOC-032-TEST-22`
- Evidence: `VOC-032-EV-22`
- Result: pending — blocked by `VOC-032-DEP-03`

One evaluation run against the real AI provider in staging produces scores
recorded against every DOC-09 §23 threshold, plus total cost/latency, within
a pre-agreed cost ceiling. A threshold miss is recorded as a release-blocking
finding, not silently passed.

## VOC-032-AC-11 — `infra/README.md` reflects real state

- Requirement source: `VOC-032-D00`, `VOC-032-D02`
- Tasks: `VOC-032-T11`
- Tests: `VOC-032-TEST-23`
- Evidence: `VOC-032-EV-23`
- Result: pending

`infra/README.md` accurately describes the actual docker-compose/nginx/Atlas
layout this package built (file locations, how to reach staging) and
explicitly notes the unresolved `VOC-032-D02` DOC-11 contradiction rather
than presenting this milestone's shape as uncontested target infrastructure.

## VOC-032-AC-12 — Evidence, mock-inventory, staging-evidence, and gate-readiness complete

- Requirement source: all prior criteria
- Tasks: `VOC-032-T12`
- Tests: `VOC-032-TEST-24`
- Evidence: `VOC-032-EV-24`, `VOC-032-EV-25`
- Result: pending

Every `EV-*` referenced above is actually present at its claimed path;
`mock-inventory.md` confirms no product mock was introduced;
`staging-evidence.md` records `T09`/`T10`'s actual results; the gate-readiness
summary correctly separates what this package's evidence satisfies from what
remains founder-owned (staging acceptance itself; `D02`/`D03`/`D04`/`D10`).
