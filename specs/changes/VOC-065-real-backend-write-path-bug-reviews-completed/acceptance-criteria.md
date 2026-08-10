# VOC-065 — Acceptance Criteria

## VOC-065-AC-00 — Write-path root cause is confirmed with direct evidence

- Requirement source: issue #482; `specification.md` / `VOC-065-DEP-00`
- Tasks: `VOC-065-T00`
- Tests: `VOC-065-TEST-00`
- Evidence: `VOC-065-EV-00`
- Result: pending

`t00-evidence.md` names a specific root cause for run 31429774964's
never-increments failure, with exact file/line and/or live staging evidence.
Each of the primary wiring candidate and issue #482's secondary candidates is
either confirmed, ruled out, or honestly marked inconclusive with what was
tried. No product fix is required in T00 itself.

## VOC-065-AC-01 — Successful review submission increments `reviews_completed`

- Requirement source: `VOC-065-D00`; issue #482
- Tasks: `VOC-065-T01`
- Tests: `VOC-065-TEST-01`, `VOC-065-TEST-02`
- Evidence: `VOC-065-EV-01`
- Result: pending

After the fix, a successful `SubmitReview` against the live composition root
advances today's `daily_mission_snapshots.reviews_completed` for the submitting
user (capped at `review_target` as today). A review that only writes
`review_attempts` / `user_words` without updating the mission snapshot is a
failed criterion.

## VOC-065-AC-02 — Regression coverage prevents re-introducing the gap

- Requirement source: `specification.md` scope item 2
- Tasks: `VOC-065-T01`
- Tests: `VOC-065-TEST-03`
- Evidence: `VOC-065-EV-01`
- Result: pending

A deterministic automated test fails if the confirmed cause is re-introduced
(for the primary candidate: if the live reviews repository is again constructed
without missions/gamification wiring). The test is documented in
`t01-evidence.md` with how to run it.

## VOC-065-AC-03 — Real staging core-loop E2E step 7 passes with real increments

- Requirement source: issue #482 failure shape; `specification.md` scope item 3
- Tasks: `VOC-065-T02`
- Tests: `VOC-065-TEST-04`
- Evidence: `VOC-065-EV-02`
- Result: pending

A real `deploy-staging.yml` run after `VOC-065-T01` merges executes
`tests/staging-e2e/core-loop.staging.spec.ts` through step 7 successfully,
with `reviewedCards >= 1` and
`reviewedAfter >= reviewedBefore + reviewedCards`. Evidence records the run
URL and observed values. Prefer also recording diagnostic-dump confirmation
that today's snapshot advanced.

## VOC-065-AC-04 — VOC-063 step-7 hardening remains intact; VOC-053/issue #450 not re-scoped

- Requirement source: issue #482 scope note; `VOC-065-DEP-02`
- Tasks: `VOC-065-T01`, `VOC-065-T02`
- Tests: `VOC-065-TEST-04`
- Evidence: `VOC-065-EV-01`, `VOC-065-EV-02`
- Result: pending

This package does not weaken VOC-063's bounded retry or the step-7 invariant,
does not reopen VOC-053's cancelled fix tasks, and does not close issue #450.
Any test-only change (only if T00 proved a false-positive) still preserves
`reviewedAfter >= reviewedBefore + reviewedCards`.
