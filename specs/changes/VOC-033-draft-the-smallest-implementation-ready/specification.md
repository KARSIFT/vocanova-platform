# VOC-033 — Atlas Migration txmode Directive and Duplicate-Index Fix: Specification

**Adopted 2026-07-30 — implementation authorized for this exact scope.**

## Objective and requirement source

Make the existing `apps/api/migrations/*.sql` set actually applicable by Atlas, so
`VOC-032-T09`'s migration-and-rollback rehearsal (and the first real staging deploy
it precedes) can run at all. Today it cannot: every one of the 13 forward migration
files begins with `-- atlas:txmode transaction`, a value Atlas v1.x's per-file
`atlas:txmode` directive does not accept (only `none` and `file` are valid in a
per-file directive; `all` is valid only as a global `atlas.hcl` setting). Atlas
aborts `migrate apply` at directive-parsing time, before running any SQL. A second,
independent defect in the same protected file set — a duplicate unique index in
`20260725130002_voc030_p4_gamification_tables.sql` — would abort the very first
real apply attempt even after the directive is fixed.

Requirement authority:

- `specs/changes/VOC-032-begin-milestone-r1-staging-readiness-docs-product/staging-evidence.md`'s
  "T06 follow-ups" section, which documents both defects in detail (confirmed
  locally by VOC-032's implementer against an Atlas v1.2.0-canary build and a
  disposable Postgres 16) and explicitly names "open a new change package (e.g.
  VOC-033)" as its recommended, minimum-blast-radius resolution path.
- `.karsift/lessons.md`'s 2026-07-29 entries recording the same two defects as
  standing lessons for any future work touching Atlas tooling or the migration
  files.
- GitHub Actions run
  [30555539008](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/30555539008)
  (workflow `deploy-staging`, triggered by the push to `develop` at this package's
  own `base_sha`, `d6b41ee95476fe1e365b1dd46dda5ef57212c4fd`; conclusion `failure`).
  Confirmed live via the unauthenticated GitHub REST API at draft time
  (2026-07-30): the job's `Build and push`, `Configure SSH host key verification`,
  and `Copy deploy bundle to staging host` steps all succeeded; `Deploy to staging
  host` failed; both healthz-polling steps were skipped as a consequence. This is
  consistent with — but, because job-log download requires repository-admin
  authentication this planning environment does not have, not independently
  text-confirmed as — the migration-apply failure this package fixes. See
  `impact-analysis.md` for the exact limitation and for `VOC-033-DEP-02`'s note
  that this run's success up through the SSH/copy steps suggests
  `VOC-032-DEP-00` (SSH credentials) may now be resolved in practice, ahead of
  what `staging-evidence.md` currently records.
- The supplied free-text request, which fixes the exact resolution choice among
  the two options `staging-evidence.md` left open (delete the directive line vs.
  set it to `file`): use `-- atlas:txmode file` for explicit intent.

## Scope and non-goals

In scope:

1. Change the per-file directive in all 13 `apps/api/migrations/*.sql` files from
   the invalid `-- atlas:txmode transaction` to the valid
   `-- atlas:txmode file` (Atlas's default transaction-per-file behavior, made
   explicit rather than left as an unstated default).
2. Remove the redundant explicit
   `CREATE UNIQUE INDEX streak_states_user_id_key ON streak_states (user_id);`
   from `20260725130002_voc030_p4_gamification_tables.sql`. The inline
   `user_id uuid NOT NULL UNIQUE` constraint on the same line already causes
   Postgres to auto-create a unique index of that exact name; the explicit
   statement collides with it on the very first apply against a fresh database.
3. Regenerate `apps/api/migrations/atlas.sum` against the fixed file set, using
   the same Atlas v1.2.0 binary already pinned by
   `.github/workflows/deploy-staging.yml` (`release.ariga.io/atlas/atlas-linux-amd64-v1.2.0`).
4. Add deterministic Go tests, general over the whole migrations directory (not
   hardcoded to only the 13 files or only `streak_states`), that fail if any
   migration file ever declares an invalid `atlas:txmode` value again, and that
   fail if any migration ever pairs an inline `UNIQUE` column constraint with a
   separate non-partial `CREATE UNIQUE INDEX` on the same column(s) of the same
   table.
5. Add a deterministic, disposable-PostgreSQL-16-backed Go integration test that
   proves `atlas migrate apply` (pinned Atlas v1.2.0) succeeds from a completely
   empty database against the full, fixed 13-file set, and that a second apply
   against the now-migrated database is a no-op.

Explicitly out of scope (non-goals):

- Any change to a `*.down.sql.example` file, including renaming it or making it
  executable. `VOC-032-D08`'s rule that recovery down-files stay outside Atlas's
  `*.sql` forward-apply glob is unmodified and unaffected; the existing
  `TestMigrationsDirectoryHasNoForwardDiscoveredDownFiles` guard in
  `apps/api/migrations/atlas_tooling_test.go` is expected to keep passing
  unchanged.
- Any column, type, constraint, index name (other than the one deleted index),
  or row-data semantic change. Both fixes are mechanical: a comment-line value
  change and the deletion of a statement that duplicated an already-enforced
  invariant.
- Any product-facing behavior change anywhere in `apps/api` or `apps/web`.
- Any change to `.github/workflows/*` (including `deploy-staging.yml`).
  `VOC-033-T02`'s integration test is designed to prove the fix without needing
  a CI workflow change (see `VOC-033-D02` below) — deliberately keeping this
  package's touched paths to `apps/api/migrations` alone.
- Opening any public database port, performing any staging or production
  deployment, or fabricating live deploy/rehearsal evidence. `VOC-032-T09`'s own
  live rehearsal against the real staging target remains that task's separate,
  still-credential-gated responsibility (`VOC-032-DEP-00`/`DEP-01`); this
  package only removes the tooling-level defect that would make T09 fail before
  it ever reaches the credential-gated steps.
- Re-litigating `VOC-032`'s own scope, decisions, or adoption state. This
  package is a narrow, additive follow-up.

## Risk and protected areas

`apps/api/migrations/*` is R3-floored by
`docs/governance/change-risk-classification.md` and confirmed directly against
this package's exact planned file set (13 `*.sql` edits, `atlas.sum`, and two new
`_test.go` files, all under `apps/api/migrations/`) using
`scripts/governance/classify-change-risk.sh --files-from`: every path reports
`R3`, and the computed floor is `R3`. Nothing in scope touches an R4 path
(`CODEOWNERS`, `.github/workflows/governance-policy.yml`,
`scripts/governance/*`, `docs/governance/amendments/*`, or any of the other R4
paths that script enumerates) or an R4-consequence area (no auth, no payments, no
secret, no production credential). Risk is proposed as **R3** and does not
escalate to R4 — this is a proposal for a human to review at adoption time, not a
determination; the repository's own path-based floor and a human's own judgment
govern the implemented tasks, not this proposal.

Protected areas touched: `apps/api/migrations/*.sql` (content edit, not
addition/removal of a migration — no new schema change), `apps/api/migrations/atlas.sum`
(regenerated), and two new `apps/api/migrations/*_test.go` files (additive). No
other path is touched. Under active A-003, this routine R3 work requires
strengthened applicable controls and independent verification, not standing
technical-steward or founder approval solely because it is R3.

## Decisions

`VOC-033-D00` — **Resolved.** Fix the invalid directive by changing
`-- atlas:txmode transaction` to `-- atlas:txmode file` in all 13 files, rather
than deleting the directive line entirely. Both are behaviorally identical
(`file` is Atlas's unstated per-file default), but the request explicitly
prefers the explicit form for clarity, and `staging-evidence.md`'s own follow-up
note already anticipated this exact choice as one of its two acceptable options.

`VOC-033-D01` — **Resolved.** Fix the duplicate index by removing the explicit
`CREATE UNIQUE INDEX streak_states_user_id_key` statement, keeping the inline
`UNIQUE` constraint. This is the smaller diff (2 lines vs. rewriting the column
definition) and `staging-evidence.md`'s own follow-up note already identified it
as the recommended direction; the inline constraint documents the invariant at
the column definition, which is the more readable location.

`VOC-033-D02` — **Resolved at founder adoption (2026-07-30): accept the
on-demand integration-test design.** `VOC-033-T02`'s proof that
`atlas migrate apply` succeeds end to end
is designed as a Go integration test gated by a build tag
(proposed: `//go:build integration`), invoked with `go test -tags=integration ./apps/api/migrations/...`,
that itself shells out to `docker run` for a disposable `postgres:16-alpine`
container and to a locally available `atlas` binary. It is **not** wired into
`pnpm run test` / `.github/workflows/pipeline.yml`'s default `go test ./...`
path, and this package does not add a Postgres service container or an Atlas
install step to any workflow file, since `.github/workflows/*` is out of this
package's declared scope (see "Scope and non-goals" above) and editing the
shared `ci.yml` is not even possible from this repository — it lives in
`KARSIFT/karsift-ai-infra`, a different repository this planner has no access
to. The practical consequence: this proof runs on-demand (developer machine, or
manually during `VOC-032-T09`'s own rehearsal), not automatically on every
future PR that touches `apps/api/migrations`. Permanent CI enforcement, if
later required, needs a separate, distinctly-scoped
follow-up package that touches `.github/workflows/pipeline.yml` and/or
`karsift-ai-infra`'s `ci.yml` — recorded here as a flagged tradeoff, not
silently decided either way.

`VOC-033-D03` — **Resolved.** The two new regression tests added in
`VOC-033-T01` must be general-purpose validators over the entire migrations
directory (every `*.sql` file, every table), not assertions hardcoded to only
today's 13 files or only the `streak_states` table. A migration added after
this package merges must be covered by the same guard automatically.

## Security and privacy

No secret, credential, or personal-data handling changes. No new environment
variable, no new network egress from application code (the new integration
test's `docker run`/`atlas` invocations are local, developer/CI-tooling-only
processes, not application runtime code, and touch only a disposable,
non-production Postgres instance on a random local port). No public database
port is opened by this package; the disposable Postgres container used for
verification during drafting was bound to `127.0.0.1` only and removed
immediately after use.

## Data, migrations, analytics, and accessibility

This package's entire purpose is a migration-directory correctness fix — see
"Scope and non-goals" above. No column, type, constraint, or index other than
the one duplicate index is changed; no row-data semantics change. No analytics
event is added, changed, or removed (none exist in this scope). No
accessibility surface exists in this scope (no UI, no user-facing text) — `None`
by direct inspection, not by omission.
