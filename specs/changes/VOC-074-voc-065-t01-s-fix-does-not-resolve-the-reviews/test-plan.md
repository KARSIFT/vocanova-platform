# VOC-074 — Test Plan

## VOC-074-TEST-00 — Root-cause evidence is complete and distinguishes queue exhaustion

- Covers: `VOC-074-AC-00`
- Preconditions: Issue #539 thread; runs 31575459316 / 31583230574 logs;
  repository sources readable; staging access as existing workflows use.
- Procedure: Review `t00-evidence.md`. Confirm it:
  - Names one confirmed cause (or honestly states remaining ambiguity — which
    fails this criterion unless adoption explicitly scoped T02-only).
  - States whether `reviewedCards = 0` on the cited runs was queue exhaustion
    or could not be determined.
  - Includes exact file/line and/or live staging evidence for the confirmation.
  - Addresses runtime increment path, `updated_at`-without-increment, write-key
    mismatch, and queue exhaustion (confirmed, ruled out, or inconclusive).
- Expected result: A single, evidence-backed cause (or explicit T02-only scope)
  suitable to drive T01/T02.
- Evidence: `VOC-074-EV-00`

## VOC-074-TEST-01 — Unit/integration proof that SubmitReview advances the mission

- Covers: `VOC-074-AC-01`
- Preconditions: T01 branch builds; test DB/sqlmock available as existing P4
  tests use.
- Procedure: Run applicable tests under `apps/api/business/reviews/` and
  `apps/api/business/missions/` plus any new test T01 adds. Confirm a successful
  review submission path issues the mission increment when dependencies are
  wired and the confirmed defect is fixed.
- Expected result: Tests pass; increment path is exercised for the fixed scenario.
- Evidence: `VOC-074-EV-01`

## VOC-074-TEST-02 — Characterization tests for nil-deps and snapshot edge cases remain valid

- Covers: `VOC-074-AC-01` (negative / characterization)
- Preconditions: Same as TEST-01.
- Procedure: Confirm existing characterization tests (e.g.
  `TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring`,
  `TestPostgreSQLRepositoryIncrementReviewsCompletedSnapshotMissing`) still pass
  and remain accurate after T01. Production must not rely on nil configuration.
- Expected result: Characterization tests pass; fix does not break documented
  skip paths.
- Evidence: `VOC-074-EV-01`

## VOC-074-TEST-03 — Regression test fails if the confirmed gap returns

- Covers: `VOC-074-AC-02`
- Preconditions: T01 adds a regression test (unless T00 scoped product fix out).
- Procedure: Read the new test. Confirm it would fail under the pre-fix behavior
  T00 documents. Run it green on the fixed tree.
- Expected result: Regression test exists, is deterministic, and is green on the
  fix.
- Evidence: `VOC-074-EV-01`

## VOC-074-TEST-04 — Staging E2E rejects vacuous step-7 pass

- Covers: `VOC-074-AC-03`
- Preconditions: T02 branch; local or CI ability to run/lint the spec file.
- Procedure: Review the T02 diff. Confirm:
  - Step 5 failure (or blocking skip) when `reviewedCards < 1`.
  - Step 7 always logs `reviewedBefore`, `reviewedCards`, `reviewedAfter`.
  - VOC-063 retry constants and invariant unchanged.
  Optionally run the spec locally if staging credentials are unavailable — at
  minimum, code review confirms the vacuous case throws/fails before step 7.
- Expected result: Vacuous `reviewedCards = 0` cannot yield a green step 7.
- Evidence: `VOC-074-EV-02`

## VOC-074-TEST-05 — Real staging core-loop E2E proves increments with diagnostic dump

- Covers: `VOC-074-AC-04`, `VOC-074-AC-05`
- Preconditions: T01 (if applicable) and T02 merged to `develop`; a real
  `deploy-staging.yml` run executes against staging with that revision.
- Procedure: Observe the workflow log for
  `tests/staging-e2e/core-loop.staging.spec.ts`. Record step 5 `reviewedCards`,
  step 7 values from annotations/logs, workflow run URL, and diagnostic dump
  rows. Confirm VOC-065-T01 wiring was not reverted and VOC-065-T02 is not
  cited as closure without this evidence.
- Expected result: Full spec passes with `reviewedCards >= 1`; step 7 succeeds
  with real increment; dump confirms DB movement; package boundaries respected.
- Evidence: `VOC-074-EV-03`

## Rollback coverage

Rolling back means reverting T01 and/or T02 commits. Validation: applicable
`apps/api` and web tests still pass on the reverted tree; a subsequent staging
deploy runs. If T01 fixed a real increment defect, mission non-increment may
return — that is the known pre-fix state.

No data rollback is required under the default forward-fix-only scope.

## Constraints

No test in this plan uses secrets or production user data.
`VOC-074-TEST-05` uses only the existing synthetic smoke-test account already
provisioned for staging E2E by VOC-050.
