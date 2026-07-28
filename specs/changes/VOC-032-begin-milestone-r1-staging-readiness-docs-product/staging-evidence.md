# VOC-032 — R1 Staging Readiness: Staging and Rollback Evidence

## Purpose

This document records the evidence required by `VOC-032-AC-09`/`AC-10`/`AC-12`
(via `VOC-032-TEST-21`/`TEST-22`/`TEST-24`). It is drafted before adoption/
implementation; it is updated as `T00`–`T12` merge to record the
in-repository evidence actually produced, and — unlike every prior
milestone's `staging-evidence.md`, which has been blocked outright by a
non-existent F3 staging environment — this document is where that blockage
is finally supposed to end: `T09`/`T10` are this package's own tasks to
actually stand up and exercise the real environment, not evidence deferred to
some future package.

## Current status

As of this draft (2026-07-28), no task has been implemented. Once `T00`–`T08`,
`T11`, and `T12` merge, their in-repository evidence can be recorded here
without further external dependency. `T09` (migration/rollback rehearsal) and
`T10` (live AI-evaluation pass) additionally require the founder-provisioned
credentials named in `VOC-032-DEP-00` (SSH access), `VOC-032-DEP-01`
(Cloudflare certificate/DNS), and `VOC-032-DEP-03` (AI-provider staging
credentials) to exist before they can execute — this is a narrower,
concrete, credential-shaped blocker, not the open-ended "F3 does not exist"
blocker every prior milestone recorded. No R1-gate-complete declaration is
made here, and none can be made until `T00`–`T12` are implemented, the
founder-provisioned credentials exist, `T09`/`T10` actually run, and the
founder completes staging acceptance per DOC-12 §5.

## Planned in-repository evidence (produced by `T00`–`T12`, recorded as each task merges)

| Evidence | Requirement | Status / source |
| --- | --- | --- |
| `EV-00`..`EV-04` | Real DB-backed API server, health endpoint, kill switches, graceful shutdown | **Produced by `T00`** — `apps/api/cmd/api/main.go`, new production-wiring source file(s) in `apps/api/app/api/`. |
| `EV-05` | `.env.example` completeness | **Produced by `T01`** — `apps/api/.env.example`, `apps/web/.env.example`. |
| `EV-06`..`EV-07` | `apps/api` Dockerfile builds and serves healthy | **Produced by `T02`** — `apps/api/Dockerfile`. |
| `EV-08`..`EV-09` | `apps/web` Dockerfile builds and serves | **Produced by `T03`** — `apps/web/Dockerfile`, `apps/web/next.config.ts`. |
| `EV-10`..`EV-11` | Compose stack validates and comes up healthy locally | **Produced by `T04`** — `docker-compose.yml`. |
| `EV-12`..`EV-13` | nginx config valid, routes correctly, real-IP scoped | **Produced by `T05`** — nginx configuration file(s). Live Cloudflare-certificate verification recorded separately below (blocked). |
| `EV-14`..`EV-15` | Atlas applies the full migration set; re-apply is a no-op; down-files not auto-discovered | **Produced by `T06`** — `apps/api/atlas.hcl`, `apps/api/scripts/migrate.sh`. |
| `EV-16`..`EV-17` | Deploy workflow valid, build/push succeeds, fails closed on bad health check | **Produced by `T07`** — `.github/workflows/deploy-staging.yml` (or equivalent). Live SSH-deploy execution recorded separately below (blocked). |
| `EV-18`..`EV-20` | AI-evaluation gate passes at thresholds, fails on violation, wired as required check | **Produced by `T08`** — evaluation-gate command + CI wiring. |
| `EV-21` | Live migration and rollback rehearsal | **Blocked by `VOC-032-DEP-00`/`DEP-01`** — real server/credentials do not yet exist. Procedure documented below; live execution recorded as blocked. |
| `EV-22` | Live-provider AI evaluation pass | **Blocked by `VOC-032-DEP-03`** — staging AI-provider credentials do not yet exist. Procedure documented below; live execution recorded as blocked. |
| `EV-23` | `infra/README.md` accuracy | **Produced by `T11`.** |
| `EV-24`..`EV-25` | Installed-suite pass at final SHA; mock-inventory confirmation | **Produced by `T12` — see `T12 evidence` below.** |
| `EV-26` | Exact-SHA independent verification (per PR) | **Performed by Claude Code (different model binding) at each PR's exact final SHA** — this is not the implementer's evidence to record; it is produced by the independent-verification role and reported per-PR. |

## Staging exercise plan (blocked by founder-provisioned credentials, not by a missing environment)

Once `VOC-032-DEP-00`/`DEP-01`/`DEP-03` resolve and `T00`–`T08` are deployed
to the real server at least once, the following exercises must be executed
and their results appended to this document.

### `EV-21` — Migration and rollback rehearsal

1. Confirm the real staging server is reachable via the founder-provisioned
   SSH credentials and that `T07`'s workflow has successfully deployed
   `T00`–`T06` at least once.
2. Apply the current migration set via `T06`'s tooling against the real
   staging Postgres.
3. Create a disposable non-production identity; exercise a handful of
   core-loop writes (save a word, complete a review, submit a sentence
   against the real AI provider).
4. Take a disposable copy of the staging database (`pg_dump` or an
   equivalent snapshot) — never operate on the live staging database
   directly for the remainder of this procedure.
5. Apply each in-scope migration's `.down.sql.example` in reverse order
   against the disposable copy; confirm the resulting schema is consistent
   with the prior release (no orphaned constraint, no dangling foreign key).
6. Re-apply the forward migrations against the disposable copy; confirm no
   data loss beyond what the down-scripts intentionally revert.
7. Record every command, its timestamp, and its outcome below this list once
   run.

### `EV-22` — Live-provider AI evaluation pass

1. Confirm founder-provisioned staging AI-provider credentials exist and an
   explicit cost/rate ceiling has been agreed for this run.
2. Run `T08`'s evaluation harness (or a staging-specific invocation of the
   same dataset) against `aifeedback.NewOpenCodeFeedbackProvider`.
3. Record the resulting scores against every DOC-09 §23 threshold, plus
   total cost and latency, below once run. Any threshold miss is a
   release-blocking finding for R1, not a warning.

## Rollback triggers

Per this package's implementation-plan.md §Deployment and rollback /
release-plan.md §Rollback, initiate application rollback on:

- A deploy that leaves `/healthz` unhealthy past the workflow's timeout.
- A migration apply failure against the real staging database.
- An nginx misconfiguration exposing an internal service or misrouting
  traffic between the two staging subdomains.
- Any credential or secret value found in a committed file.
- A rollback-rehearsal result showing a down-file no longer matches its
  forward migration (a finding to fix, not to silently route around).

## Rollback procedure

Redeploy the previous known-good image tag via `T07`'s workflow (or
manually, over the same SSH access, if the workflow itself is what is
broken). Never automate a database rollback — prefer a corrective forward
migration; restore from backup only when data integrity is genuinely at
risk, and only ever against a disposable copy first to confirm the
corrective action's effect, exactly as the rehearsal procedure above
demonstrates. The last-known-good revision is recorded at the future release
decision.

## Relationship to the F3 dependency chain

Every P1–P5 package (VOC-025 through VOC-031) has carried forward the same
open dependency: "the F3 staging environment does not yet exist." This
package's `T09` is the first task in this repository's history to actually
close that dependency — but closing it here does not retroactively declare
any prior milestone's own gate passed. Each of P1–P5 would still need its own
staging exercise, run against this now-real environment and recorded in its
own `staging-evidence.md`, before that milestone's DOC-12 §5 gate can be
declared complete. This document records VOC-032's own R1 evidence only.
