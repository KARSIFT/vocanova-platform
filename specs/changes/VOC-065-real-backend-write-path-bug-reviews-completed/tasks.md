# VOC-065 — Tasks

## VOC-065-T00 — Confirm the write-path root cause with direct evidence

- Requirement source: issue #482; `specification.md` findings and
  `VOC-065-DEP-00`
- Acceptance criteria: `VOC-065-AC-00`
- Tests: `VOC-065-TEST-00`
- Evidence: `VOC-065-EV-00` (`t00-evidence.md`)
- Status: pending

No product fix is written in this task. Confirm which cause explains run
31429774964 and the general failure of `reviews_completed` to advance after
real UI reviews.

Required investigation order (stop early only if a candidate is *confirmed*
with direct evidence; otherwise continue):

1. **Primary — composition-root wiring.** Re-read
   `apps/api/app/api/production.go` and confirm whether the live reviews
   repository is constructed without `WithGamificationService` /
   `WithMissionsService`. Trace `SubmitReview` → the nil-guard around
   `applyP4ReviewWiring` → `IncrementReviewsCompleted`. Record exact file/line
   evidence. If possible against staging for the failing run (or a reproduction),
   check whether `review_attempts` rows were inserted for the synthetic user
   around the run time while `daily_mission_snapshots.reviews_completed` stayed
   0 — that pattern confirms "P2 write succeeded, P4 mission wiring skipped."
2. **Secondary — client/test short-circuit.** Inspect
   `reviewOneCard()` in `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`
   and `review-session.tsx`'s submit path: does the test return `true` before
   `client.submitReview` completes? Does the UI advance only after a successful
   response? Rule in or out with evidence.
3. **Secondary — `(user_id, local_date)` write-key mismatch.** Trace how
   `applyP4ReviewWiring` resolves timezone/`LocalDate` vs the daily-mission
   read path and the diagnostic dump's filter. Only needed if (1) does not
   fully explain the evidence.
4. **Secondary — synthetic-account queue race.** Re-check whether
   `reviewedCards=2` can be counted without real submissions under current
   helpers (VOC-053-T00 addendum history). Only needed if (1)–(2) do not
   explain it.

Record in `t00-evidence.md`: the confirmed cause, exact evidence, and why
each other candidate was ruled out or left inconclusive. Do not start T01's
fix until this evidence names a specific cause.

## VOC-065-T01 — Fix the confirmed write-path root cause

- Requirement source: `specification.md` scope item 2; `VOC-065-D00`; depends
  on `VOC-065-T00`
- Acceptance criteria: `VOC-065-AC-01`, `VOC-065-AC-02`
- Tests: `VOC-065-TEST-01`, `VOC-065-TEST-02`, `VOC-065-TEST-03`
- Evidence: `VOC-065-EV-01` (`t01-evidence.md`)
- Status: pending — blocked on `VOC-065-T00` naming a specific
  evidence-backed cause

Implement the narrowest fix for the cause T00 confirmed.

If T00 confirms the primary `production.go` wiring gap:

1. Construct `gamSvc` / `missionsSvc` before the reviews repository.
2. Pass `WithGamificationService(gamSvc)` and `WithMissionsService(missionsSvc)`
   into `reviews.NewPostgreSQLRepository`.
3. Add a deterministic regression test that fails if the live composition root
   omits those options (preferred) or an equivalent wiring assertion the
   implementer documents in evidence — the existing
   `TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring` proves
   nil-deps skip P4 SQL but does **not** prove production wires them.

If T00 confirms a different cause, fix that cause only; do not also "drive-by"
wire production.go unless evidence shows it is part of the same defect.

Do not add a historical backfill migration unless adoption explicitly expanded
`VOC-065-DEP-01`. Do not weaken staging E2E step 7.

## VOC-065-T02 — Verify the fix on real staging

- Requirement source: issue #482 failure evidence; `specification.md` scope
  item 3
- Acceptance criteria: `VOC-065-AC-03`, `VOC-065-AC-04`
- Tests: `VOC-065-TEST-04`
- Evidence: `VOC-065-EV-02` (`t02-evidence.md`)
- Status: pending — depends on `VOC-065-T01` landing and a real staging
  deploy running with it

No further source change is expected (beyond any narrow gap this verification
surfaces). After `VOC-065-T01` merges to `develop`, confirm a real
`deploy-staging.yml` run of `tests/staging-e2e/core-loop.staging.spec.ts`:

- Step 5 reports `reviewedCards >= 1` (preferably >= 2, matching the failing
  run's shape).
- Step 7 passes: `reviewedAfter >= reviewedBefore + reviewedCards` under the
  existing VOC-063 retry bounds.
- Record workflow run URL, counter values, and — if the VOC-050-T02 diagnostic
  dump still runs — that today's snapshot `reviews_completed` / `updated_at`
  advanced consistently with the reviews performed.

If step 7 still fails with the same never-increments pattern, this task's
scope includes diagnosing that residual gap only — not unrelated changes.

Tasks preserve scope, separation of duties, and rollback safety. No task may
be dispatched before this package is adopted.
