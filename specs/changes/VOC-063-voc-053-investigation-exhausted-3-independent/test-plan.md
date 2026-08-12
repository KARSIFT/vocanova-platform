# VOC-063 — Test Plan

## VOC-063-TEST-00 — VOC-053 supersession documentation is complete and accurate

- Covers: `VOC-063-AC-00`
- Preconditions: Issue #473 thread and third-pass evidence available as reference.
- Procedure: Review `VOC-063-T00`'s diff to
  `specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today/tasks.md`
  (and any README note). Confirm `VOC-053-T00` marked complete,
  `VOC-053-T01`/`T02` marked cancelled/superseded-by-VOC-063 with issue #473
  link. Confirm VOC-053 `change.yaml` adoption fields are unchanged. Confirm
  any closed GitHub issues reference supersession.
- Expected result: Documentation accurately reflects investigation completion
  and fix-path supersession; issue #450 remains open.
- Evidence: `VOC-063-EV-00`

## VOC-063-TEST-01 — VOC-053-DEP-00 diagnostic fully removed

- Covers: `VOC-063-AC-01`
- Preconditions: `VOC-063-T01` diff available.
- Procedure: Search `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` for
  `recordHomeResponseDiagnostic`, `voc-053-diagnostic`, and
  `VOC-053-DEP-00`. Confirm zero matches remain.
- Expected result: Diagnostic function and all call sites deleted.
- Evidence: `VOC-063-EV-01`

## VOC-063-TEST-02 — Retry implementation is bounded and preserves the invariant

- Covers: `VOC-063-AC-02`
- Preconditions: `VOC-063-T01` diff available.
- Procedure: Read step 7 and any extracted helper. Verify:
  - Assertion is still `reviewedAfter >= reviewedBefore + reviewedCards` (or
    equivalent strict inequality).
  - Max attempts is between 2 and 5 inclusive.
  - Wait interval is between 500ms and 3s inclusive.
  - No unbounded `while (true)` or equivalent without a hard attempt cap.
  - `testInfo.annotations` records retry usage when attempts > 1.
  - Chosen parameters are documented in the PR description and evidence file.
- Expected result: Bounded retry with unchanged invariant; parameters within
  `VOC-063-DEP-02` guardrails.
- Evidence: `VOC-063-EV-01`

## VOC-063-TEST-03 — Local workspace validation passes for apps/web

- Covers: `VOC-063-AC-02` (static correctness)
- Preconditions: `VOC-063-T01` branch builds.
- Procedure: Run `apps/web` lint and typecheck per `docs/development.md`.
- Expected result: No new lint or type errors introduced by the spec file edit.
- Evidence: `VOC-063-EV-01`

## VOC-063-TEST-04 — Real staging core-loop E2E passes with hardened step 7

- Covers: `VOC-063-AC-03`, `VOC-063-AC-04`
- Preconditions: `VOC-063-T01` merged to `develop`; a real `deploy-staging.yml`
  run executes against staging with the merged revision.
- Procedure: Observe the workflow run log for
  `tests/staging-e2e/core-loop.staging.spec.ts`. Record step 7 outcome,
  `reviewedBefore`/`reviewedCards`/`reviewedAfter` values, and any retry
  annotations.
- Expected result: Full spec passes; step 7 succeeds; evidence recorded in
  `VOC-063-EV-02`.
- Evidence: `VOC-063-EV-02`

## Rollback coverage

Rolling back means reverting `VOC-063-T01`'s spec-file diff. Validation:
confirm the reverted spec is syntactically valid (`pnpm lint`/`typecheck`) and
that a subsequent staging deploy runs it without new errors (the original
intermittent step-7 failure may return — that is the known pre-VOC-063 state,
not a failed rollback).

No data rollback is required.

## Constraints

No test in this plan uses secrets or production data. `VOC-063-TEST-04` uses only
the existing synthetic smoke-test account already provisioned for staging E2E by
VOC-050.
