# VOC-063 — Acceptance Criteria

## VOC-063-AC-00 — VOC-053 fix path is formally closed and superseded

- Requirement source: issue #473; `specification.md` scope item 1
- Tasks: `VOC-063-T00`
- Tests: `VOC-063-TEST-00`
- Evidence: `VOC-063-EV-00`
- Result: pending

`specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today/tasks.md`
records `VOC-053-T01` and `VOC-053-T02` as cancelled/superseded-by-VOC-063
with a link to issue #473's evidence. `VOC-053-T00` is recorded as complete
(investigation objective satisfied). VOC-053's adopted `change.yaml` status and
authorization fields are unchanged. Any still-open GitHub issues for
`VOC-053-T01`/`VOC-053-T02` are closed with a supersession reference.

## VOC-063-AC-01 — VOC-053-DEP-00 diagnostic is removed

- Requirement source: issue #473 cleanup scope; `specification.md` scope item 3
- Tasks: `VOC-063-T01`
- Tests: `VOC-063-TEST-01`
- Evidence: `VOC-063-EV-01`
- Result: pending

`recordHomeResponseDiagnostic` and every call site are removed from
`apps/web/tests/staging-e2e/core-loop.staging.spec.ts`. No
`voc-053-diagnostic` annotations remain in the spec file.

## VOC-063-AC-02 — Step 7 uses bounded retry-and-reverify without weakening the invariant

- Requirement source: issue #473; `specification.md` scope item 2 and
  `VOC-063-DEP-02` guardrails
- Tasks: `VOC-063-T01`
- Tests: `VOC-063-TEST-02`, `VOC-063-TEST-03`
- Evidence: `VOC-063-EV-01`
- Result: pending

Step 7 still asserts `reviewedAfter >= reviewedBefore + reviewedCards`. When
the first read fails that inequality, the spec re-navigates to `/home` and/or
re-reads the counter within explicit bounds (2–5 attempts total, 500ms–3s
between attempts, within the existing test timeout). The step fails if no read
satisfies the invariant within the bound. The chosen parameters and any retry
usage are recorded in `testInfo.annotations`.

## VOC-063-AC-03 — Real staging core-loop E2E passes with the hardened step 7

- Requirement source: issue #473 (clean pass on run 31371614353 establishes
  feasibility); `specification.md` scope item 4
- Tasks: `VOC-063-T02`
- Tests: `VOC-063-TEST-04`
- Evidence: `VOC-063-EV-02`
- Result: pending

After `VOC-063-T01` merges to `develop`, a real `deploy-staging.yml` run
executes `tests/staging-e2e/core-loop.staging.spec.ts` through step 7 without
failure. The evidence records the workflow run URL, observed
`reviewedBefore`/`reviewedCards`/`reviewedAfter` values, and whether step 7's
retry loop fired.

## VOC-063-AC-04 — VOC-052-T01 staging E2E evidence path remains unblocked

- Requirement source: issue #450's impact section (carried forward from VOC-053);
  operational dependency on the staging gate passing
- Tasks: `VOC-063-T02`
- Tests: `VOC-063-TEST-04`
- Evidence: `VOC-063-EV-02`
- Result: pending

The staging core-loop E2E check in `deploy-staging.yml` passes in full on a
real run after this package's changes land, providing the evidence VOC-052-T01
needs. This criterion records the unblocking effect; it does not modify
VOC-052's own scope.
