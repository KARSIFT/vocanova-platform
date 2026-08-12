# VOC-074 — VOC-065-T01's Fix Does Not Resolve the `reviews_completed` Increment Bug: Specification

## Objective and requirement source

Close the gap reported in
[GitHub issue #539](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/539):
after VOC-065-T01 (PR #523) wired P4 gamification/missions dependencies into
`newProductionReviewsRepository`, staging core-loop E2E still passes while
authoritative DB evidence shows `daily_mission_snapshots.reviews_completed`
never advances for today's row on the synthetic smoke-test account.

Evidence from issue #539 (diagnostic dump step in `deploy-staging.yml`, present
since VOC-050-T02):

| Run | Time | `reviews_completed` (today) | `updated_at` |
|-----|------|------------------------------|--------------|
| [31575459316](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31575459316) | dump ~07:51 UTC | `0` | `2026-08-12 07:50:56` |
| [31583230574](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31583230574) | dump ~09:34 UTC | `0` | `2026-08-12 07:50:56` (unchanged) |

Both runs' Playwright suite reported `1 passed`. Step 7's assertion
`reviewedAfter >= reviewedBefore + reviewedCards` holds vacuously when
`reviewedCards = 0`. VOC-065-T02's independent review
([PR #529](https://github.com/KARSIFT/vocanova-platform-sandbox/pull/529))
correctly returned `VERDICT: FAIL` for lacking observed
`reviewedCards` / `reviewedBefore` / `reviewedAfter` integers on a passing run.

**Objective:** after this package's implementation, (a) a successful review
submission on staging actually increments today's
`daily_mission_snapshots.reviews_completed` for the submitting user, and (b) the
staging core-loop gate cannot pass step 7 without reviewing at least one card and
without DB-consistent counter evidence.

This package supersedes VOC-065-T02's verification obligation for the residual
never-increments symptom. It does not re-litigate VOC-065-T01's wiring fix —
that change stays — but addresses whatever defect remains after it.

## Confirmed findings (from issue #539 and independent re-check during drafting)

- VOC-065-T01 landed: `production.go` exposes
  `newProductionReviewsRepository(db, clk, gamSvc, missionsSvc)` with
  `WithGamificationService` / `WithMissionsService`, and
  `TestProductionReviewsRepositoryWiresP4Dependencies` guards the wiring
  statically. That closes the *drafting-time primary candidate* from issue #482
  but does **not** prove the increment path works at runtime on deployed staging.
- Post-T01 staging runs pass E2E while diagnostic dumps show `reviews_completed
  = 0` and `updated_at` frozen — the same class of symptom issue #482 reported,
  now with wiring present in source.
- Step 7 in `core-loop.staging.spec.ts` does not require `reviewedCards >= 1`.
  When step 5 exits with `reviewedCards = 0` (queue already empty / caught up),
  step 7 passes with `0 >= 0 + 0`. Playwright does not print
  `reviewedBefore` / `reviewedCards` / `reviewedAfter` on success — only on
  failure — so passing runs hide the vacuous case.
- `IncrementReviewsCompleted` SQL in `apps/api/business/missions/repository.go`
  sets both `reviews_completed = LEAST(reviews_completed + 1, review_target)` and
  `updated_at = NOW()` on a matching row. Issue #539 notes that `updated_at`
  **did** advance once today (`07:50:56`) while `reviews_completed` stayed `0` —
  a strong clue that some code path touches the snapshot row without incrementing
  the counter (e.g. `EnsureTodaySnapshot`, a no-op UPDATE, or a mismatched
  `(user_id, local_date)` key on the increment UPDATE returning no row while
  another path updates `updated_at`).
- `applyP4ReviewWiring` calls `EnsureTodaySnapshot` before
  `IncrementReviewsCompleted` and uses `snap.LocalDate` for the increment key.
  A timezone/`local_date` mismatch between ensure and increment, or between
  write and the diagnostic dump's "today" filter, remains an open candidate.

Drafting-time investigation starting points (from issue #539, non-prescriptive):

1. Re-trace `SubmitReview` → `applyP4ReviewWiring` → `IncrementReviewsCompleted`
   against a live staging request — confirm the P4 guard
   (`gamification != nil && missions != nil`) is true at runtime on the deployed
   image, not only in source.
2. Inspect whether any SQL touches `updated_at` without incrementing
   `reviews_completed` (triggers, `EnsureTodaySnapshot`, blanket `SET updated_at`).
3. Confirm whether the synthetic account's review queue was non-empty
   (`reviewedCards >= 1`) during runs 31575459316 / 31583230574, or whether
   same-day queue exhaustion explains `reviewedCards = 0`.
4. VOC-065-T02 (PR #529) must not merge as satisfying VOC-065-AC-03 until this
   package closes.

## Scope and non-goals

In scope:

- `VOC-074-T00`: Confirm, with direct evidence, which cause explains the
  post-T01 never-increments symptom and whether `reviewedCards = 0` on the
  passing runs is queue exhaustion or a masked write failure. Record evidence
  in `t00-evidence.md`.
- `VOC-074-T01`: Fix the confirmed cause narrowly. Add deterministic regression
  coverage that would fail under the pre-fix behavior T00 documents.
- `VOC-074-T02`: Harden `core-loop.staging.spec.ts` step 7 (and step 5 reporting
  as needed) so the suite **fails** when `reviewedCards < 1`, and always records
  `reviewedBefore`, `reviewedCards`, and `reviewedAfter` in test output or
  annotations on both pass and fail — eliminating vacuous passes.
- `VOC-074-T03`: Verify on a real `deploy-staging.yml` run after T01 and T02
  merge: `reviewedCards >= 1`, step 7 passes with real increments, and the
  diagnostic dump shows today's `reviews_completed` / `updated_at` advanced
  consistently.

Non-goals / explicitly excluded:

- Not reverting or re-litigating VOC-065-T01's wiring fix unless T00 proves it
  is incorrect or incomplete — T00 starts from "wiring is present; increment
  still broken or masked."
- Not folding into VOC-063 or reopening VOC-053's cancelled fix path.
- Not closing issue #450's original decrease symptom.
- Not merging or approving VOC-065-T02 (PR #529) as closure evidence for
  VOC-065-AC-03.
- Not weakening VOC-063's bounded retry bounds — T02 strengthens the invariant,
  not relaxes it.
- Not an assumed historical backfill (`VOC-074-DEP-01`) unless adoption expands
  scope.

## Risk and protected areas

Builder assessment: expected code touch is `apps/api/business/missions/` and/or
`apps/api/business/reviews/` plus `core-loop.staging.spec.ts`. Path classifier
floor for that set measured at drafting time: **R1**.

This package proposes **R3** because the semantic consequence is that staging
(and, via the same code path, production) daily-mission counters may still never
advance after reviews — a core-loop product correctness failure — and the
staging gate currently reports false confidence. The independent verifier must
re-run `classify-change-risk.sh` against the real task file list and may raise
further if a migration path is taken.

No governance, secret-handling, or (by default) migration area is touched. EHR
is not triggered. Under active A-003, routine R3 does not require standing
technical-steward or founder approval merely for being R3; strengthened
verification still applies.

## Decisions, contradictions, security, and privacy

`VOC-074-D00` (recorded here for traceability; formal decision numbering
applies after adoption): Staging E2E step 7 must not pass when zero cards were
reviewed in the journey. A passing suite with `reviews_completed` stuck at 0 in
the diagnostic dump is a product defect, a test defect, or both — not acceptable
closure evidence for issue #482 / #539.

No contradiction with VOC-065: T01 addressed the composition-root wiring gap
T00 there confirmed. This package addresses the residual symptom and the vacuous
E2E pass that VOC-065-T02's reviewer correctly rejected.

Open questions for the reviewing human:

1. **`VOC-074-DEP-00` — Root cause priority.** Adoption may proceed with T00
   still required; the human should note whether runtime tracing of the increment
   path (recommended first) or synthetic queue reset (if exhaustion is suspected)
   is the starting priority.
2. **`VOC-074-DEP-01` — Historical under-counts.** Default proposed scope is
   forward-fix only. Should adoption expand to a corrective migration / backfill
   for rows left at `reviews_completed = 0` despite existing `review_attempts`?
3. **`VOC-074-DEP-03` — Synthetic queue reset.** If T00 confirms same-day queue
   exhaustion is the reason `reviewedCards = 0`, should this package add a
   pre-step-5 queue reset for the smoke-test account (in E2E or
   `deploy-staging.yml`), or track that separately?
4. **`VOC-074-DEP-02` — VOC-065-T02 disposition.** Confirm VOC-065-T02 (PR #529)
   remains blocked until VOC-074-T03 evidence lands; note in adoption whether
   T03 supersedes T02's verification role.

No new secret, credential, or personal-data handling is introduced. Staging
verification continues to use only the existing synthetic smoke-test account.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None by default. Forward-fix only. See open question 2 /
  `VOC-074-DEP-01` if adoption expands.
- **Analytics:** None expected.
- **Accessibility:** None intentional. If T01 touches review UI, preserve existing
  accessibility patterns and the Tailwind `max-w-*` workaround (see
  `.karsift/lessons.md`).
