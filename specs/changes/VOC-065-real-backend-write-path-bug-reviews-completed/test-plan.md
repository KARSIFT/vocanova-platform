# VOC-065 — Test Plan

## VOC-065-TEST-00 — Root-cause evidence is complete and specific

- Covers: `VOC-065-AC-00`
- Preconditions: Issue #482 thread and run 31429774964 evidence available;
  repository sources readable.
- Procedure: Review `t00-evidence.md`. Confirm it:
  - Names one confirmed cause (or honestly states remaining ambiguity — which
    fails this criterion; T01 must not proceed on ambiguity).
  - Includes exact file/line and/or live staging evidence for the confirmation.
  - Addresses the primary `production.go` wiring candidate and issue #482's
    secondary candidates (confirmed, ruled out, or inconclusive with what was
    tried).
- Expected result: A single, evidence-backed cause suitable to drive T01.
- Evidence: `VOC-065-EV-00`

## VOC-065-TEST-01 — Unit/integration proof that SubmitReview advances the mission

- Covers: `VOC-065-AC-01`
- Preconditions: T01 branch builds; test DB/sqlmock available as existing
  reviews P4 tests use.
- Procedure: Run the existing P4 wiring tests under
  `apps/api/business/reviews/` (e.g. Good-rating path that expects
  `IncrementReviewsCompleted`) plus any new test T01 adds for the live
  composition root. Confirm a successful correct/"Good" submission path issues
  the mission increment SQL when missions/gamification are wired.
- Expected result: Tests pass; increment path is exercised when dependencies
  are present.
- Evidence: `VOC-065-EV-01`

## VOC-065-TEST-02 — Nil-deps path remains explicitly characterized

- Covers: `VOC-065-AC-01` (negative / characterization)
- Preconditions: Same as TEST-01.
- Procedure: Confirm
  `TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring` (or
  successor) still documents that nil missions/gamification skips P4 SQL —
  so production must not accidentally rely on that configuration.
- Expected result: Characterization test still passes; production wiring no
  longer uses the nil configuration if that was the confirmed cause.
- Evidence: `VOC-065-EV-01`

## VOC-065-TEST-03 — Regression test fails if the confirmed gap returns

- Covers: `VOC-065-AC-02`
- Preconditions: T01 adds a regression test.
- Procedure: Read the new test. Confirm it would fail under the pre-fix
  composition (e.g. reviews repo constructed without
  `WithMissionsService`/`WithGamificationService` in the live production
  constructor path, or an equivalent assertion). Run it green on the fixed
  tree.
- Expected result: Regression test exists, is deterministic, and is green on
  the fix.
- Evidence: `VOC-065-EV-01`

## VOC-065-TEST-04 — Real staging core-loop E2E proves increments

- Covers: `VOC-065-AC-03`, `VOC-065-AC-04`
- Preconditions: `VOC-065-T01` merged to `develop`; a real `deploy-staging.yml`
  run executes against staging with that revision.
- Procedure: Observe the workflow log for
  `tests/staging-e2e/core-loop.staging.spec.ts`. Record step 5
  `reviewedCards`, step 7 outcome and values, any VOC-063 retry annotations,
  and diagnostic dump rows if present. Confirm VOC-063 retry bounds/invariant
  were not weakened in the T01 diff.
- Expected result: Full spec passes; step 7 succeeds with real increment;
  package boundaries respected.
- Evidence: `VOC-065-EV-02`

## Rollback coverage

Rolling back means reverting `VOC-065-T01`. Validation: applicable `apps/api`
tests still pass on the reverted tree; a subsequent staging deploy runs. If
the primary candidate was real, mission non-increment may return — that is the
known pre-fix defect, not a failed rollback.

No data rollback is required under the default forward-fix-only scope.

## Constraints

No test in this plan uses secrets or production user data.
`VOC-065-TEST-04` uses only the existing synthetic smoke-test account already
provisioned for staging E2E by VOC-050.
