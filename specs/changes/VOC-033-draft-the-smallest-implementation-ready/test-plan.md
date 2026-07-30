# VOC-033 — Test Plan

## VOC-033-TEST-00 — All 13 migration files declare a valid txmode directive

- Covers: `VOC-033-AC-00`
- Preconditions: `VOC-033-T00` merged.
- Procedure: `grep -n "atlas:txmode" apps/api/migrations/*.sql` on all 13 files;
  confirm each reports exactly `-- atlas:txmode file` and no file reports
  `transaction` or any other value. Cross-check with the general validator
  added in `VOC-033-T01` (`VOC-033-TEST-03`) passing.
- Expected result: 13 matches, all `file`; zero matches for any other value.
- Evidence: `VOC-033-EV-00`

## VOC-033-TEST-01 — Duplicate index removed, inline constraint intact

- Covers: `VOC-033-AC-01`
- Preconditions: `VOC-033-T00` merged.
- Procedure: `grep -n "streak_states_user_id_key\|user_id uuid NOT NULL UNIQUE" apps/api/migrations/20260725130002_voc030_p4_gamification_tables.sql`.
- Expected result: no match for `CREATE UNIQUE INDEX streak_states_user_id_key`;
  exactly one match for the inline `user_id uuid NOT NULL UNIQUE ...` column
  definition, unchanged from before this package.
- Evidence: `VOC-033-EV-00`

## VOC-033-TEST-02 — atlas.sum matches the fixed file set

- Covers: `VOC-033-AC-02`
- Preconditions: `VOC-033-T00` merged; Atlas v1.2.0 binary available
  (`https://release.ariga.io/atlas/atlas-linux-amd64-v1.2.0`, matching
  `.github/workflows/deploy-staging.yml`'s pin).
- Procedure: run `atlas migrate hash --dir "file://apps/api/migrations"` and
  confirm `git diff --exit-code apps/api/migrations/atlas.sum` reports no
  difference (i.e., the committed file already matches the freshly computed
  hash). Also run `go test ./apps/api/migrations/...` and confirm the existing
  `TestAtlasSumExistsAndMatchesMigrationCount` (unchanged by this package)
  still passes.
- Expected result: no diff; existing test passes.
- Evidence: `VOC-033-EV-01`

## VOC-033-TEST-03 — Txmode validator rejects an invalid value (regression proof)

- Covers: `VOC-033-AC-03`
- Preconditions: `VOC-033-T01` merged.
- Procedure: `go test -run TestAllMigrationsUseValidAtlasTxmode ./apps/api/migrations/...`
  (real files, expect pass) and
  `go test -run TestTxmodeValidatorRejectsInvalidValue ./apps/api/migrations/...`
  (synthetic fixture reproducing `-- atlas:txmode transaction`, expect the
  fixture assertion to confirm the validator flags it — i.e., the test itself
  passes because it correctly detects the injected defect).
- Expected result: both tests pass; the second test's pass specifically
  confirms detection capability, not just today's clean state.
- Evidence: `VOC-033-EV-02`

## VOC-033-TEST-04 — Duplicate-index validator rejects a collision (regression proof)

- Covers: `VOC-033-AC-04`
- Preconditions: `VOC-033-T01` merged.
- Procedure: `go test -run TestNoMigrationHasDuplicateInlineUniqueIndex ./apps/api/migrations/...`
  (real files, expect pass — including confirming no false positive against
  `confidence_point_ledger_user_id_idempotency_key_key` or
  `user_words_user_id_meaning_id_active_key`, both partial/multi-column) and
  `go test -run TestDuplicateIndexValidatorRejectsRegression ./apps/api/migrations/...`
  (synthetic fixture reproducing the `streak_states_user_id_key` shape).
- Expected result: both tests pass; no false positive on the two named
  legitimate partial/multi-column indexes; the fixture test's pass confirms
  detection capability.
- Evidence: `VOC-033-EV-02`

## VOC-033-TEST-05 — Full apply from empty state, then idempotent re-apply

- Covers: `VOC-033-AC-05`
- Preconditions: `VOC-033-T00` and `VOC-033-T02` merged; Docker available;
  Atlas v1.2.0 binary available on `PATH`.
- Procedure: `go test -tags=integration -run TestAtlasApplySucceedsFromEmptyState -v ./apps/api/migrations/...`
  (name illustrative; implementer names the actual test per `VOC-033-T02`).
- Expected result: test starts a disposable `postgres:16-alpine` container,
  applies all 13 migrations successfully (matching the manual verification
  already performed during this package's own drafting: 13 migrations, 74 SQL
  statements, full success, ~370ms), then a second apply reports zero pending
  migrations. Container is removed on completion regardless of outcome.
- Evidence: `VOC-033-EV-03`

## VOC-033-TEST-06 — No file outside apps/api/migrations changed; no port opened; no deployment claimed

- Covers: `VOC-033-AC-06`
- Preconditions: `VOC-033-T00`, `VOC-033-T01`, `VOC-033-T02` merged.
- Procedure: `git diff --name-only <base_sha>...<candidate_sha>` and confirm
  every changed path is under `apps/api/migrations/`; inspect the new
  integration test's container invocation and confirm it binds only to
  `127.0.0.1`; inspect the PR description and this package's own
  `staging-evidence`-adjacent notes (if any are added at implementation time)
  for any claim of a real staging/production deploy having occurred as part of
  this package, and confirm none exists.
- Expected result: diff confined to `apps/api/migrations/`; container bound to
  loopback only; no deployment claim present.
- Evidence: `VOC-033-EV-04`

## Rollback coverage

This package makes no schema change beyond removing a redundant index
statement that never successfully applied against any real database (the
migration set has never successfully applied end to end before this package,
per the T06 follow-up finding) — there is nothing to roll back in a live
database sense. If `VOC-033-T00`'s file edits themselves need to be reverted
post-merge (e.g. a mistake found later), the correct rollback is a plain
git revert of the specific commit(s); no `.down.sql.example` file is added,
changed, or exercised by this package, and none needs to be. `VOC-032-D08`'s
disposable-copy-first rule for actual database recovery is unaffected and
continues to apply to `VOC-032-T09`'s own rehearsal once it runs against a
real database.
