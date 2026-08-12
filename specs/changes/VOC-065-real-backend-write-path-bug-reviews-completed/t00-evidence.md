# VOC-065-T00 — Write-path root-cause evidence

**Task:** VOC-065-T00  
**Package:** VOC-065  
**Evidence ID:** VOC-065-EV-00  
**Investigation date:** 2026-08-11  
**Reviewed revision:** working tree on branch `agent/voc-065-voc-065-t00` (develop tip)

## Confirmed root cause

**Composition-root wiring gap in `apps/api/app/api/production.go`:** the live
reviews PostgreSQL repository is constructed **without**
`WithGamificationService` and `WithMissionsService`. `SubmitReview` therefore
commits P2 writes (`review_attempts`, `user_words`) but **never** calls
`applyP4ReviewWiring` → `missions.IncrementReviewsCompleted`, so
`daily_mission_snapshots.reviews_completed` and `updated_at` stay untouched.

This fully explains deploy-staging run
[31429774964](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31429774964)
(~2026-08-10 20:38 UTC): step 5 reported `reviewedCards=2` (real successful
review submissions through the UI), step 7 observed `reviewedBefore=0` and
`observed=[0, 0, 0, 0]` across four fresh reads, and the VOC-050-T02 diagnostic
dump showed today's row still at `reviews_completed=0` with `updated_at`
hours before the test run.

## Evidence chain (primary candidate)

### 1. Live composition root omits P4 dependencies on the reviews repository

```663:669:apps/api/app/api/production.go
	reviewsRepo := reviews.NewPostgreSQLRepository(db, clk)
	reviewsSvc := reviews.NewService(reviewsRepo, learningIdem, clk)

	gamRepo := gamification.NewRepository(db)
	gamSvc := gamification.NewService(gamRepo)
	missionsRepo := missions.NewRepository(db)
	missionsSvc := missions.NewService(missionsRepo, gamSvc)
```

- Line 663: `reviews.NewPostgreSQLRepository(db, clk)` — **no**
  `WithGamificationService` / `WithMissionsService` options.
- Lines 666–669: `gamSvc` and `missionsSvc` are created **after** `reviewsRepo`
  is already fixed without those services.
- Line 734 (same file): `RegisterMissions(api, missionsSvc)` wires missions
  only for **read** routes (`GET /api/v1/daily-mission`, etc.), not into the
  reviews write repository.

No other production wiring path constructs the reviews repository with P4
options (grep across `apps/api/app/api/` finds only the line above).

### 2. `SubmitReview` skips P4 wiring when either dependency is nil

```300:304:apps/api/business/reviews/postgres.go
	if r.gamification != nil && r.missions != nil {
		if err := r.applyP4ReviewWiring(ctx, tx, req, attemptID, now); err != nil {
			return nil, err
		}
	}
```

With nil `gamification` and `missions` on the repository struct (the default
when options are not passed), this guard never enters `applyP4ReviewWiring`.

### 3. `applyP4ReviewWiring` is the only write path to `IncrementReviewsCompleted`

Inside `applyP4ReviewWiring` (lines 341–377 of `postgres.go`):

1. `r.gamification.GetSettings` — resolve timezone / review target
2. `r.missions.EnsureTodaySnapshot` — lazy-create today's snapshot row
3. `r.missions.IncrementReviewsCompleted` — `UPDATE daily_mission_snapshots
   SET reviews_completed = LEAST(reviews_completed + 1, review_target),
   updated_at = NOW() WHERE user_id = $1 AND local_date = $2`

No other code path in the reviews package increments `reviews_completed` on
review submission.

### 4. Existing unit test proves nil-deps configuration skips all P4 SQL

`TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring` in
`apps/api/business/reviews/postgres_p4_test.go` (lines 73–126) constructs
`NewPostgreSQLRepository(db, clock)` with no options, submits a review, and
asserts `mock.ExpectationsWereMet()` — meaning only P2 SQL (SELECT user_words,
INSERT review_attempts, UPDATE user_words, COMMIT) ran. The test comment
explicitly documents the intended contract: nil gamification or missions means
"no P4 SQL is issued."

**Important limitation:** this test proves the *repository behavior* when
deps are nil; it does **not** prove production wires the deps. T00's
production.go read closes that gap.

### 5. Staging failure evidence matches "P2 succeeded, P4 never ran"

From issue #482 / package specification (run 31429774964):

| Signal | Observed value | Interpretation |
|--------|----------------|----------------|
| Step 5 `reviewedCards` | 2 | UI advanced through two review cycles (requires successful `submitReview` responses — see secondary analysis below) |
| Step 7 `reviewedBefore` | 0 | Read path served untouched snapshot |
| Step 7 `observed` (4 attempts) | `[0, 0, 0, 0]` | VOC-063 retry hardening ruled out stale read |
| Diagnostic `reviews_completed` (today) | 0 | DB row never incremented |
| Diagnostic `updated_at` (today) | `2026-08-10 00:13:45+00` | Row not touched during ~20:38 test run |
| Diagnostic `timezone` | UTC | Matches write-path default when settings unset |

Pattern: `review_attempts` / `user_words` can commit while
`daily_mission_snapshots` stays at zero — exactly what nil-guarded P4 wiring
produces.

Direct staging DB query for `review_attempts` rows around the run time was not
executed in this T00 pass (no staging credentials in the implementer
environment). The diagnostic dump plus code trace is sufficient to confirm the
cause without it; T02 staging verification will provide live post-fix
confirmation.

## Secondary candidate analysis

### Secondary 1 — Client/test short-circuit before `submitReview` completes

**Ruled out** as the cause of run 31429774964.

**UI (`review-session.tsx`):** `submitAttempt` awaits the API before advancing:

```146:153:apps/web/src/app/(app)/reviews/_components/review-session.tsx
    try {
      const { data } = await client.submitReview(body, clientAttemptId, {
        headers: { "X-CSRF-Token": csrfToken },
      });
      setLastReviewedCard(currentCard);
      setLastReviewAttemptId(data.attemptId);
      setRemainingCount((count) => Math.max(0, count - 1));
      advance();
```

`advance()` (which moves to the next card or refetches the queue) runs only
after a successful response. On failure, an error is shown and the card does
not advance (lines 154–163).

**Test (`reviewOneCard`):** clicks rating/continue buttons and returns `true`,
but step 5's outer loop increments `reviewed` only after `reviewOneCard`
returns true, then waits for the next settled state:

```361:371:apps/web/tests/staging-e2e/core-loop.staging.spec.ts
        const didReview = await reviewOneCard(page);
        if (!didReview) {
          break;
        }
        reviewed++;
        await expect(caughtUpHeading.or(cardCounter).first()).toBeVisible();
```

The `expect` on `Card N of M` or caught-up heading requires the UI to have
advanced past the submitted card — which, per the UI code above, only happens
after `submitReview` succeeds. `reviewedCards=2` therefore implies at least
two successful `POST` review submissions, not button clicks alone.

The short-circuit hypothesis cannot explain `reviews_completed` staying at 0
**while** the UI genuinely completed two submissions: those submissions ran
through the live `reviewsSvc` backed by the unwired repository.

### Secondary 2 — `(user_id, local_date)` write-key mismatch

**Ruled out** for this failure. P4 wiring never executed, so no write key was
resolved on the submission path. If wiring were present, `applyP4ReviewWiring`
uses `snap.LocalDate` from `EnsureTodaySnapshot` (same missions service and
timezone resolution as `GetDailyMissionView` on the read path) and
`IncrementReviewsCompleted` updates `WHERE user_id = $1 AND local_date = $2`
with that same date (`repository.go` lines 188–193). The diagnostic dump
filters by synthetic user email and shows `local_date=2026-08-10, timezone=UTC`
— consistent with the read path step 7 uses. A key mismatch would be relevant
only if P4 wiring ran and updated a different row; here it never ran.

### Secondary 3 — Synthetic-account queue race inflating `reviewedCards`

**Ruled out** for run 31429774964.

- `reviewOneCard` returns `false` when it independently sees the caught-up
  heading (lines 235–237); step 5 breaks without incrementing `reviewed`.
- Step 5 waits for settled queue state before each iteration (lines 357–360).
- UI `advance()` only decrements remaining count and moves index after server
  success.

A race could theoretically return `true` without a submission only if the UI
advanced without `submitReview` completing — but the UI does not do that (see
Secondary 1). `reviewedCards=2` with persistent `reviews_completed=0` is the
signature of successful P2 commits with skipped P4 wiring, not a false-positive
count.

## Conclusion for T01

| Candidate | Status |
|-----------|--------|
| Primary: `production.go` missing `WithGamificationService` / `WithMissionsService` on reviews repo | **Confirmed** |
| Secondary: client/test short-circuit | **Ruled out** |
| Secondary: `(user_id, local_date)` write-key mismatch | **Ruled out** (P4 never ran) |
| Secondary: queue race false-positive `reviewedCards` | **Ruled out** |

**T01 should:** reorder construction in `production.go` so `gamSvc` /
`missionsSvc` exist before `reviewsRepo`, pass both options into
`reviews.NewPostgreSQLRepository`, and add a deterministic regression test
that fails if the live composition root omits them again.

## Commands run during T00

Read-only code inspection (no product code changes). No staging DB or workflow
rerun from this environment.

```bash
# Evidence gathering only — file reads and ripgrep across:
# apps/api/app/api/production.go
# apps/api/business/reviews/postgres.go
# apps/api/business/reviews/postgres_p4_test.go
# apps/api/business/missions/repository.go
# apps/web/tests/staging-e2e/core-loop.staging.spec.ts
# apps/web/src/app/(app)/reviews/_components/review-session.tsx
```

## Acceptance criterion mapping

- **VOC-065-AC-00:** satisfied — specific root cause named with file/line
  evidence; all candidates confirmed or ruled out as above.
- **VOC-065-TEST-00:** satisfied by this document (VOC-065-EV-00).
