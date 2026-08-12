# VOC-074 — Tasks

## VOC-074-T00 — Confirm the residual write-path root cause with direct evidence

- Requirement source: issue #539; `specification.md` findings and
  `VOC-074-DEP-00`
- Acceptance criteria: `VOC-074-AC-00`
- Tests: `VOC-074-TEST-00`
- Evidence: `VOC-074-EV-00` (`t00-evidence.md`)
- Status: pending

No product fix is written in this task. Confirm which cause explains the
post-VOC-065-T01 never-increments symptom and whether the passing E2E runs had
`reviewedCards = 0` due to queue exhaustion or a masked write failure.

Required investigation order (stop early only if a candidate is *confirmed*
with direct evidence; otherwise continue):

1. **Runtime increment path.** Against staging (or a faithful local reproduction
   with the same composition root as production), trace one successful review
   submission: confirm `applyP4ReviewWiring` runs (P4 guard true), log or query
   whether `IncrementReviewsCompleted` executes, and whether the
   `daily_mission_snapshots` row for today's `(user_id, local_date)` advances.
   Compare with the diagnostic dump filter in `deploy-staging.yml`.
2. **`updated_at` without increment clue.** Inspect `EnsureTodaySnapshot`,
   `IncrementReviewsCompleted`, and any triggers or blanket `updated_at`
   updates on `daily_mission_snapshots`. Explain how `updated_at` reached
   `2026-08-12 07:50:56` while `reviews_completed` stayed `0`.
3. **Write-key mismatch.** Trace `(user_id, local_date, timezone)` resolution
   in `applyP4ReviewWiring` vs the daily-mission read path and the diagnostic
   dump's "today" row.
4. **Queue exhaustion vs real bug.** For runs 31575459316 / 31583230574,
   determine whether step 5 could legitimately return `reviewedCards = 0`
   (synthetic account caught up for the day). If inconclusive from logs alone,
   reproduce with a guaranteed-non-empty queue (manual staging check or
   controlled seed) and record `reviewedCards`.

Record in `t00-evidence.md`: the confirmed cause (or honest remaining ambiguity),
exact evidence, `reviewedCards` disposition for the cited runs, and why each
other candidate was ruled out or left inconclusive. Do not start T01 until this
evidence names a specific cause — or adoption expands scope if queue reset alone
is the answer (`VOC-074-DEP-03`).

## VOC-074-T01 — Fix the confirmed write-path root cause

- Requirement source: `specification.md` scope item 2; `VOC-074-D00`; depends
  on `VOC-074-T00`
- Acceptance criteria: `VOC-074-AC-01`, `VOC-074-AC-02`, `VOC-074-AC-05`
- Tests: `VOC-074-TEST-01`, `VOC-074-TEST-02`, `VOC-074-TEST-03`
- Evidence: `VOC-074-EV-01` (`t01-evidence.md`)
- Status: pending — blocked on `VOC-074-T00` naming a specific
  evidence-backed cause (unless T00 concludes the only defect is E2E vacuous
  pass — in that case T01 may be a no-op and T02 carries the product fix;
  record that explicitly in evidence)

Implement the narrowest fix for the cause T00 confirmed.

Examples keyed to drafting-time candidates (use only what T00 confirms):

- If runtime wiring is still nil or wrong: fix the composition/deploy path T00
  identifies — do not duplicate VOC-065-T01 unless evidence shows that fix is
  incomplete.
- If `IncrementReviewsCompleted` or `EnsureTodaySnapshot` has a SQL/logic bug:
  fix in `apps/api/business/missions/` (or reviews P4 wiring) with a focused test.
- If `(user_id, local_date)` mismatch: align write and read keys per existing
  timezone rules (DOC-06 / gamification settings resolution).

Add a deterministic regression test that fails under the pre-fix behavior T00
documents. Do not add a historical backfill migration unless adoption explicitly
expanded `VOC-074-DEP-01`.

## VOC-074-T02 — Harden staging E2E so step 7 cannot pass vacuously

- Requirement source: issue #539; `VOC-074-D00`; `VOC-074-DEP-03`
- Acceptance criteria: `VOC-074-AC-03`, `VOC-074-AC-05`
- Tests: `VOC-074-TEST-04`
- Evidence: `VOC-074-EV-02` (`t02-evidence.md`)
- Status: pending — may proceed in parallel with T01 once T00 clarifies whether
  queue reset is also required; must merge before T03

Edit `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` (and only
`deploy-staging.yml` or seed helpers if T00/`VOC-074-DEP-03` requires a
guaranteed-non-empty queue before step 5):

1. After step 5, **fail** (default) if `reviewedCards < 1` with a clear message
   including the observed count — do not reach step 7 with zero reviews.
2. Always record `reviewedBefore`, `reviewedCards`, and `reviewedAfter` in
   Playwright annotations or stdout on step 7 completion (pass or fail) so
   independent review and workflow logs need not infer values from a green run.
3. Preserve VOC-063's step-7 retry loop and invariant
   `reviewedAfter >= reviewedBefore + reviewedCards` — this task strengthens,
   not weakens, the gate.

If T00 confirms queue exhaustion is expected on repeat same-day runs, implement
the minimal queue reset/seeding T00 recommends (`VOC-074-DEP-03`) so step 5 can
 reliably reach `reviewedCards >= 1` without weakening the increment assertion.

## VOC-074-T03 — Verify the fix on real staging with DB-consistent evidence

- Requirement source: issue #539; `specification.md` scope item 4;
  `VOC-074-DEP-02`
- Acceptance criteria: `VOC-074-AC-04`, `VOC-074-AC-05`
- Tests: `VOC-074-TEST-05`
- Evidence: `VOC-074-EV-03` (`t03-evidence.md`)
- Status: pending — depends on `VOC-074-T01` (if applicable) and `VOC-074-T02`
  merging to `develop`

No further source change is expected unless verification surfaces a narrow gap.
After T01/T02 merge, record a real `deploy-staging.yml` run of
`tests/staging-e2e/core-loop.staging.spec.ts`:

- Step 5 reports `reviewedCards >= 1` with values visible in logs/annotations.
- Step 7 passes with real increments (not vacuous).
- Diagnostic dump shows today's `reviews_completed` and `updated_at` advanced
  consistently with the reviews performed.

This evidence supersedes VOC-065-T02's verification obligation for the residual
never-increments symptom. Do not treat VOC-065-T02 (PR #529) as closure until
this task's evidence is recorded.

## Task ordering notes

- T00 blocks T01 (unless T00 routes all product work to T02 — document explicitly).
- T02 should merge before T03; may parallel T01 when causes are independent.
- T03 is the package's staging closure task and satisfies what VOC-065-AC-03
  intended for the still-open symptom.
- No task may be dispatched before this package is adopted.

Tasks preserve scope, separation of duties, and rollback safety.
