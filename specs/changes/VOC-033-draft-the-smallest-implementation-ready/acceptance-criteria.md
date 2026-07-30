# VOC-033 — Acceptance Criteria

**Adopted 2026-07-30 — these acceptance criteria are binding for implementation.**

## VOC-033-AC-00 — Every forward migration file declares a valid Atlas txmode

Every file in `apps/api/migrations/*.sql` (all 13: `20260724210000` through
`20260725140002`) declares `-- atlas:txmode file` as its per-file directive; none
declares `transaction`, `all` (invalid in a per-file directive), or any other
value. No `*.down.sql.example` file is renamed, edited, or made executable.

- Requirement source: `VOC-033-D00`
- Tasks: `VOC-033-T00`
- Tests: `VOC-033-TEST-00`
- Evidence: `VOC-033-EV-00`
- Result: pending

## VOC-033-AC-01 — No duplicate unique index in the gamification migration

`20260725130002_voc030_p4_gamification_tables.sql` no longer contains the
explicit `CREATE UNIQUE INDEX streak_states_user_id_key` statement. The inline
`user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT` column
definition on `streak_states` is unchanged and continues to enforce the same
one-row-per-user invariant via Postgres's auto-created index.

- Requirement source: `VOC-033-D01`
- Tasks: `VOC-033-T00`
- Tests: `VOC-033-TEST-01`
- Evidence: `VOC-033-EV-00`
- Result: pending

## VOC-033-AC-02 — atlas.sum matches the fixed file set under the pinned Atlas version

`apps/api/migrations/atlas.sum` is regenerated with Atlas v1.2.0 (the exact
version pinned in `.github/workflows/deploy-staging.yml`) against the fixed
13-file set, and its per-file hash count matches the committed `*.sql` file
count.

- Requirement source: specification.md "Scope and non-goals" item 3
- Tasks: `VOC-033-T00`
- Tests: `VOC-033-TEST-02`
- Evidence: `VOC-033-EV-01`
- Result: pending

## VOC-033-AC-03 — A regression test rejects any invalid txmode value, generally

A deterministic Go test fails if any file in `apps/api/migrations/*.sql`, now or
in the future, declares an `atlas:txmode` per-file directive value other than
`none` or `file`. The test is proven to actually catch the regression (not just
observe today's files happen to pass) via a synthetic fixture reproducing the
exact `transaction` value this package fixes.

- Requirement source: `VOC-033-D03`
- Tasks: `VOC-033-T01`
- Tests: `VOC-033-TEST-03`
- Evidence: `VOC-033-EV-02`
- Result: pending

## VOC-033-AC-04 — A regression test rejects inline-UNIQUE/explicit-index collisions, generally

A deterministic Go test fails if any migration, now or in the future, defines
both an inline `UNIQUE` column constraint and a separate, non-partial
`CREATE UNIQUE INDEX` on the exact same column(s) of the same table. The test is
proven to actually catch the regression via a synthetic fixture reproducing the
exact `streak_states_user_id_key` collision this package fixes. The test does
not flag legitimate multi-column or partial (`WHERE ...`) unique indexes, which
this migration set already uses correctly elsewhere (e.g.
`confidence_point_ledger_user_id_idempotency_key_key`).

- Requirement source: `VOC-033-D03`
- Tasks: `VOC-033-T01`
- Tests: `VOC-033-TEST-04`
- Evidence: `VOC-033-EV-02`
- Result: pending

## VOC-033-AC-05 — Proof that atlas migrate apply succeeds from empty state

A deterministic, disposable-PostgreSQL-16-backed Go integration test proves that
`atlas migrate apply` (pinned Atlas v1.2.0), run against the fixed 13-file
migration set, succeeds from a completely empty database, and that a second
`atlas migrate apply` run immediately afterward against the now-migrated
database reports no pending migrations (idempotent no-op), matching the
`EV-14`/`EV-15` "re-apply is a no-op" evidence item named in VOC-032's
`staging-evidence.md`.

- Requirement source: specification.md "Scope and non-goals" item 5
- Tasks: `VOC-033-T02`
- Tests: `VOC-033-TEST-05`
- Evidence: `VOC-033-EV-03`
- Result: pending

## VOC-033-AC-06 — No product behavior, no public port, no fabricated deployment evidence

No file outside `apps/api/migrations/` is modified. No public database port is
opened by any test or tooling this package adds. No staging or production
deployment is performed, and no such deployment's success is claimed as
evidence anywhere in this package.

- Requirement source: specification.md "Scope and non-goals"
- Tasks: `VOC-033-T00`, `VOC-033-T01`, `VOC-033-T02`
- Tests: `VOC-033-TEST-06`
- Evidence: `VOC-033-EV-04`
- Result: pending
