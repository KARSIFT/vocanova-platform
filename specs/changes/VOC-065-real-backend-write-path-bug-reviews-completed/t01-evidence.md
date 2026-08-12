# VOC-065-T01 — Write-path fix and regression coverage

**Task:** VOC-065-T01  
**Package:** VOC-065  
**Evidence ID:** VOC-065-EV-01  
**Root cause (from T00):** composition-root wiring gap in `production.go`  
**Investigation date:** 2026-08-11

## Fix applied

`apps/api/app/api/production.go` now:

1. Constructs `gamSvc` and `missionsSvc` **before** the reviews repository.
2. Builds the reviews repository via `newProductionReviewsRepository`, passing
   `WithGamificationService(gamSvc)` and `WithMissionsService(missionsSvc)`.

`SubmitReview` therefore enters `applyP4ReviewWiring` →
`missions.IncrementReviewsCompleted` on the live staging/production composition
root, advancing `daily_mission_snapshots.reviews_completed` for today's row.

## Regression test

Two deterministic tests in `apps/api/app/api/production_test.go`:

| Test | What it guards |
|------|----------------|
| `TestProductionReviewsRepositoryWiresP4Dependencies` | The extracted `newProductionReviewsRepository` helper wires both P4 deps (`HasP4Wiring() == true`). |
| `TestProductionGo_NewProductionAPIConstructsP4WiredReviewsRepository` | `production.go` calls `newProductionReviewsRepository(db, clk, gamSvc, missionsSvc)` and does not regress to bare `reviews.NewPostgreSQLRepository(db, clk)` without options. |

`HasP4Wiring()` was added to `apps/api/business/reviews/postgres.go` for
construction-time introspection. Existing
`TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring` still proves
nil-deps skip P4 SQL at the repository layer; the new tests prove the **live**
composition root does not leave those deps nil.

## How to run

From the repository root (with Go toolchain available):

```bash
cd apps/api
go test ./app/api -run 'TestProductionReviewsRepositoryWiresP4Dependencies|TestProductionGo_NewProductionAPIConstructsP4WiredReviewsRepository' -count=1
go test ./business/reviews -run 'TestPostgreSQLRepositorySubmitReviewP4' -count=1
```

Broader API validation per `docs/development.md`:

```bash
pnpm validate
```

## Acceptance criterion mapping

- **VOC-065-AC-01:** satisfied — live composition root wires P4 deps so
  `SubmitReview` can increment `reviews_completed`.
- **VOC-065-AC-02:** satisfied — regression tests above fail if wiring is
  omitted again.
- **VOC-065-TEST-01 / TEST-02 / TEST-03:** covered by repository P4 tests
  (existing) plus new production wiring tests (this task).

## Out of scope (unchanged)

- No migration / historical backfill (`VOC-065-DEP-01`).
- No staging E2E change (T02).
- VOC-063 step-7 retry bounds untouched.
