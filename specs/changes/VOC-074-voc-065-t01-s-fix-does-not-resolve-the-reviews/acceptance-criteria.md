# VOC-074 — Acceptance Criteria

## VOC-074-AC-00 — Residual write-path root cause is confirmed with direct evidence

- Requirement source: issue #539; `specification.md` / `VOC-074-DEP-00`
- Tasks: `VOC-074-T00`
- Tests: `VOC-074-TEST-00`
- Evidence: `VOC-074-EV-00`
- Result: pending

`t00-evidence.md` names a specific root cause for the post-VOC-065-T01
never-increments symptom (runs 31575459316 / 31583230574 and the general
failure mode), with exact file/line and/or live staging evidence. It explicitly
addresses whether `reviewedCards = 0` on the passing runs is queue exhaustion
or a masked increment failure. Each drafting-time candidate is either confirmed,
ruled out, or honestly marked inconclusive with what was tried. No product fix
is required in T00 itself.

## VOC-074-AC-01 — Successful review submission increments `reviews_completed` after the fix

- Requirement source: `VOC-074-D00`; issue #539
- Tasks: `VOC-074-T01`
- Tests: `VOC-074-TEST-01`, `VOC-074-TEST-02`
- Evidence: `VOC-074-EV-01`
- Result: pending

After T01, a successful `SubmitReview` against the live composition root
advances today's `daily_mission_snapshots.reviews_completed` for the submitting
user (capped at `review_target` as today). A path that only touches
`updated_at` or `review_attempts` without incrementing the mission counter is a
failed criterion.

## VOC-074-AC-02 — Regression coverage prevents re-introducing the confirmed gap

- Requirement source: `specification.md` scope item 2
- Tasks: `VOC-074-T01`
- Tests: `VOC-074-TEST-03`
- Evidence: `VOC-074-EV-01`
- Result: pending

A deterministic automated test fails if the confirmed cause is re-introduced.
The test is documented in `t01-evidence.md` with how to run it.

## VOC-074-AC-03 — Staging E2E cannot pass step 7 vacuously when zero cards were reviewed

- Requirement source: issue #539; `VOC-074-D00`
- Tasks: `VOC-074-T02`
- Tests: `VOC-074-TEST-04`
- Evidence: `VOC-074-EV-02`
- Result: pending

`core-loop.staging.spec.ts` fails (or skips with an explicit, blocking outcome
if adoption chooses skip-over-pass — default is **fail**) when step 5 returns
`reviewedCards < 1`. On every run that reaches step 7, test output or
annotations record `reviewedBefore`, `reviewedCards`, and `reviewedAfter`
regardless of pass/fail. A run with `reviewedCards = 0` must not report step 7
as passed.

## VOC-074-AC-04 — Real staging verification proves increments with DB-consistent evidence

- Requirement source: issue #539; `specification.md` scope item 4
- Tasks: `VOC-074-T03`
- Tests: `VOC-074-TEST-05`
- Evidence: `VOC-074-EV-03`
- Result: pending

A real `deploy-staging.yml` run after T01 and T02 merge executes
`tests/staging-e2e/core-loop.staging.spec.ts` with `reviewedCards >= 1`, step 7
passes with `reviewedAfter >= reviewedBefore + reviewedCards`, and the
diagnostic dump shows today's snapshot `reviews_completed` and `updated_at`
advanced consistently with the reviews performed. Evidence records the run URL
and observed integers.

## VOC-074-AC-05 — VOC-063/VOC-065 boundaries respected; VOC-065-T02 not treated as closure

- Requirement source: issue #539; `VOC-074-DEP-02`
- Tasks: `VOC-074-T01`, `VOC-074-T02`, `VOC-074-T03`
- Tests: `VOC-074-TEST-05`
- Evidence: `VOC-074-EV-01`, `VOC-074-EV-02`, `VOC-074-EV-03`
- Result: pending

This package does not revert VOC-065-T01's wiring fix, does not weaken
VOC-063's bounded retry, does not reopen VOC-053, and does not close issue
#450. VOC-065-T02 (PR #529) is not recorded as satisfying VOC-065-AC-03 until
this package's T03 evidence closes the residual gap.
