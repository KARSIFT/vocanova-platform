# VOC-033 — Tasks

Ordered PR sequence: `T00 → T01 → T02`. This order is physically required, not
stylistic: `T01`'s regression tests assert that no migration file has an invalid
`atlas:txmode` value or a duplicate inline-UNIQUE/explicit-index pair — if `T01`
merged before `T00`, its own tests would fail against the still-broken files it
is meant to guard going forward, breaking auto-advance. `T02`'s integration test
requires `atlas migrate apply` to actually succeed, which is only true once
`T00`'s fixes are in place. Each task is independently reviewable in one pull
request and stays R3-proposed (path floor R3 for `apps/api/migrations/*`,
confirmed against this package's exact file set in `specification.md` "Risk and
protected areas"); each requires Claude Code exact-SHA review per this
repository's `CLAUDE.md`.

## VOC-033-T00 — Fix the txmode directive and the duplicate index; regenerate atlas.sum

- Requirement source: `VOC-033-D00`, `VOC-033-D01`
- Acceptance criteria: `VOC-033-AC-00`, `VOC-033-AC-01`, `VOC-033-AC-02`
- Tests: `VOC-033-TEST-00`, `VOC-033-TEST-01`, `VOC-033-TEST-02`
- Evidence: `VOC-033-EV-00`, `VOC-033-EV-01`
- Status: pending

In each of the 13 files in `apps/api/migrations/*.sql`, change the first line
from `-- atlas:txmode transaction` to `-- atlas:txmode file`. Change nothing
else in any of those 13 files' first lines or surrounding comment text beyond
this one substitution.

In `apps/api/migrations/20260725130002_voc030_p4_gamification_tables.sql`,
delete the two-line (plus its preceding blank line, per the existing file's
formatting) statement:

```sql
CREATE UNIQUE INDEX streak_states_user_id_key
  ON streak_states (user_id);
```

Leave the `streak_states` table's own `CREATE TABLE` block, including the
`user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT` column
definition, completely unchanged. Do not touch any `*.down.sql.example` file.

Regenerate `apps/api/migrations/atlas.sum` by running
`atlas migrate hash --dir "file://apps/api/migrations"` using Atlas v1.2.0 (the
version already pinned by `.github/workflows/deploy-staging.yml`'s
`https://release.ariga.io/atlas/atlas-linux-amd64-v1.2.0` install step — do not
use a different Atlas version or the `atlasgo.sh` convenience installer's
latest, which may resolve to a different release and produce a different hash
algorithm revision). Commit the regenerated file in full (it is fully
replaced, not hand-edited).

Combined diff size: 13 one-line changes, 1 three-line deletion, and one fully
regenerated `atlas.sum`. No other file changes in this task.

## VOC-033-T01 — Add general regression tests for both defect classes

- Requirement source: `VOC-033-D03`
- Acceptance criteria: `VOC-033-AC-03`, `VOC-033-AC-04`
- Tests: `VOC-033-TEST-03`, `VOC-033-TEST-04`
- Evidence: `VOC-033-EV-02`
- Status: pending

Add a new Go test file under `apps/api/migrations/` (proposed name:
`atlas_directive_test.go`, package `migrations_test`, matching the existing
`atlas_tooling_test.go`/`migration_test.go` package and directory convention)
containing:

- A test that reads every `*.sql` file in the migrations directory, extracts
  any line matching `-- atlas:txmode <value>`, and fails if `<value>` is not
  exactly `none` or `file`. This must run over the whole directory by globbing
  `*.sql`, not by naming each of the 13 files individually, so a migration
  added after this package merges is covered automatically (`VOC-033-AC-03`'s
  "generally" requirement, `VOC-033-D03`).
- A second test that writes a synthetic single-file fixture to `t.TempDir()`
  containing `-- atlas:txmode transaction` (the exact value this package
  fixes) and asserts the same validator logic used above rejects it. This
  proves the validator actually catches the regression, not merely that
  today's already-fixed files happen to pass (mirrors the fixture pattern
  `atlas_tooling_test.go`'s wrapper tests already use for the analogous
  purpose).
- A test that parses every `CREATE TABLE` block across the migrations
  directory for inline `<col> ... UNIQUE` column constraints, and separately
  collects every `CREATE UNIQUE INDEX <name> ON <table> (<col>)` statement
  with no `WHERE` clause, then fails if any table+column pair appears in both
  sets. Must not flag multi-column unique indexes or partial (`WHERE ...`)
  unique indexes, both of which this migration set already uses correctly
  elsewhere (e.g. `confidence_point_ledger_user_id_idempotency_key_key`,
  `user_words_user_id_meaning_id_active_key`) — a false positive on either
  pattern is itself a bug in this new test, not a migration defect.
- A fourth test, mirroring the txmode fixture pattern, that writes a synthetic
  fixture reproducing the exact `streak_states_user_id_key` shape (inline
  `UNIQUE` plus a colliding explicit `CREATE UNIQUE INDEX`) and asserts the
  validator rejects it.

Do not modify `apps/api/migrations/migration_test.go` or
`apps/api/migrations/atlas_tooling_test.go`; both are expected to keep passing
unchanged (per `VOC-033-AC-00`'s down-file-discovery guard reference).

## VOC-033-T02 — Prove atlas migrate apply succeeds end to end against disposable Postgres 16

- Requirement source: specification.md "Scope and non-goals" item 5, `VOC-033-D02`
- Acceptance criteria: `VOC-033-AC-05`, `VOC-033-AC-06`
- Tests: `VOC-033-TEST-05`, `VOC-033-TEST-06`
- Evidence: `VOC-033-EV-03`, `VOC-033-EV-04`
- Status: pending

Add a new Go test file under `apps/api/migrations/` (proposed name:
`atlas_apply_integration_test.go`), gated by a build tag (proposed:
`//go:build integration`) so it is excluded from the default `go test ./...`
build entirely — see `VOC-033-D02` for why this is a deliberate,
flagged-for-the-adopter tradeoff rather than a CI-wired guarantee. The test:

1. Skips immediately (`t.Skip`, with a clear message) if `docker` or `atlas`
   is not found on `PATH` via `exec.LookPath`, so the test is safe to leave in
   the tree even on a runner without either tool.
2. Starts a disposable `postgres:16-alpine` container via `docker run --rm -d`
   bound to `127.0.0.1` on a free, dynamically chosen port (do not hardcode a
   port that could collide with a developer's own local Postgres), with
   `t.Cleanup` guaranteeing `docker rm -f` runs even on test failure.
3. Polls `pg_isready` (via `docker exec`) until the container accepts
   connections, bounded by a short timeout (propose 30s) so a genuinely broken
   environment fails the test instead of hanging CI/a developer's terminal.
4. Runs `atlas migrate apply --url <the container's connection string> --dir "file://."` from the migrations directory and asserts a zero exit code and no
   error output, proving the full 13-file set applies cleanly from empty state
   (`VOC-033-AC-05`, first half).
5. Runs the identical `atlas migrate apply` command a second time against the
   now-migrated database and asserts the output indicates no pending
   migrations (Atlas's own "no migration files to execute" message, or
   equivalent zero-changes signal), proving re-apply is a no-op
   (`VOC-033-AC-05`, second half).
6. Never asserts or claims anything about a real staging or production
   database; the container is exclusively local and disposable
   (`VOC-033-AC-06`).

Document, in a comment at the top of the new file, exactly how to run it
locally (`go test -tags=integration ./apps/api/migrations/...`) and that it is
intentionally not part of the default `go test ./...` / `pnpm run test:api`
path, cross-referencing `VOC-033-D02` and noting it does not replace or
substitute for the parent package's own live rehearsal against the real staging
target. Those infrastructure dependencies were verified resolved at VOC-033
adoption, but T09 remains a separate live-evidence task.
