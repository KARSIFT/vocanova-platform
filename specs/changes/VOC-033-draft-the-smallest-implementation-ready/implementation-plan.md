# VOC-033 — Implementation Plan

## Preconditions and protected areas

This package was adopted by the founder gate on 2026-07-30; `change.yaml` records
approval, implementation authority, and automatic merge authority. All work touches
`apps/api/migrations`, an R3-protected path per
`docs/governance/change-risk-classification.md` and confirmed directly against
this package's exact file set in `specification.md`. Under active A-003,
routine R3 requires strengthened applicable controls and independent
verification, not standing steward/founder approval solely for being R3 — see
`CLAUDE.md`.

## File reconciliation and implementation sequence

All target files already exist; this package edits and adds, it creates no new
migration.

| File | Current state | This package's change |
| --- | --- | --- |
| `apps/api/migrations/*.sql` (13 files) | First line `-- atlas:txmode transaction` (invalid) | `VOC-033-T00`: change to `-- atlas:txmode file` |
| `apps/api/migrations/20260725130002_voc030_p4_gamification_tables.sql` | Contains redundant `CREATE UNIQUE INDEX streak_states_user_id_key` | `VOC-033-T00`: delete that statement (3 lines incl. blank line) |
| `apps/api/migrations/atlas.sum` | Hashes the current (broken) file set | `VOC-033-T00`: fully regenerated via `atlas migrate hash --dir "file://apps/api/migrations"` (Atlas v1.2.0) |
| `apps/api/migrations/atlas_directive_test.go` | Does not exist | `VOC-033-T01`: new file, 4 tests (2 real-file, 2 synthetic-fixture) |
| `apps/api/migrations/atlas_apply_integration_test.go` | Does not exist | `VOC-033-T02`: new file, build-tag gated, 1 end-to-end test |
| `apps/api/migrations/migration_test.go` | Existing invariant tests | Unchanged |
| `apps/api/migrations/atlas_tooling_test.go` | Existing wrapper/hash/glob tests | Unchanged |
| `apps/api/migrations/README.md` | Existing operational note | Unchanged (already accurately describes the `.down.sql.example` discipline this package does not touch) |
| `apps/api/atlas.hcl`, `apps/api/scripts/migrate.sh` | VOC-032-T06 tooling | Unchanged |
| Any file outside `apps/api/migrations/` | — | Unchanged — out of scope |

Ordered steps, one PR per task, `T00 → T01 → T02` (see `tasks.md` for why this
order is physically required):

1. `VOC-033-T00`: apply the 13 directive edits and the one deletion; regenerate
   `atlas.sum`; run `go test ./apps/api/migrations/...` to confirm the
   existing `TestAtlasSumExistsAndMatchesMigrationCount` and
   `TestMigrationsDirectoryHasNoForwardDiscoveredDownFiles` still pass
   unchanged; run `go vet ./apps/api/migrations/...` and `gofmt -l` (no output
   expected — this task adds no Go code, only SQL/text edits).
2. `VOC-033-T01`: add `atlas_directive_test.go`; run
   `go test ./apps/api/migrations/...` and confirm all tests (existing +
   new) pass; run `gofmt -l apps/api/migrations/atlas_directive_test.go` (no
   output expected) and `go vet ./apps/api/migrations/...`.
3. `VOC-033-T02`: add `atlas_apply_integration_test.go`; run
   `go build -tags=integration ./apps/api/migrations/...` to confirm it
   compiles under the build tag; run
   `go test -tags=integration ./apps/api/migrations/...` locally (Docker +
   Atlas v1.2.0 required) and confirm it passes; run
   `go test ./apps/api/migrations/...` (no tag) and confirm the new file is
   excluded from the default build (package still compiles and all
   non-integration tests still pass).

## Validation and independent verification

Deterministic commands, run per PR at the exact final SHA:

```bash
cd apps/api && go vet ./migrations/...
cd apps/api && gofmt -l migrations/
cd apps/api && go test ./migrations/...
cd apps/api && go build -tags=integration ./migrations/...
bash scripts/governance/classify-change-risk.sh --base <base_sha> --head <head_sha>
bash scripts/governance/validate-governance.sh
git diff --check <base_sha> <head_sha>
```

`VOC-033-T02`'s own integration test
(`go test -tags=integration ./apps/api/migrations/...`) additionally requires
Docker and the pinned Atlas v1.2.0 binary; run it wherever those are available
(implementer's machine, or any CI runner with Docker) and record the output as
`VOC-033-EV-03`. Its absence from a runner is a clean skip, not a required-check
failure — see `VOC-033-D02`.

Claude Code independent review is bound to the exact final SHA of each PR, per
`CLAUDE.md`: confirms scope is limited to `apps/api/migrations/`, confirms no
`*.down.sql.example` file was touched, confirms the risk classification matches
the path floor (R3, no R4 escalation), confirms Codex (or whichever implementer
model is bound) did not approve or merge its own PR, and reports every still-
required R3 gate. Codex may implement and prepare the PR; it cannot approve or
merge its own work.

## Deployment and rollback

This package deploys nothing — see `release-plan.md`. If a merged commit from
this package needs to be undone, the correct mechanism is a plain `git revert`
of the specific PR's merge commit; because no schema in a live database is
ever successfully touched by the broken pre-fix migration set (Atlas aborts
before running SQL), there is no live-database state to reconcile. Owner of
any such revert decision: whoever discovers the regression, following this
repository's normal PR process — no special authority beyond the routine R3
review this package's own PRs already require. Last-known-good reference: this
package's own `base_sha`, `d6b41ee95476fe1e365b1dd46dda5ef57212c4fd`.
