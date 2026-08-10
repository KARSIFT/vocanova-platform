# VOC-063 — Tasks

## VOC-063-T00 — Close VOC-053's fix path and record investigation completion

- Requirement source: issue #473; `specification.md` scope item 1; `VOC-063-DEP-00`
- Acceptance criteria: `VOC-063-AC-00`
- Tests: `VOC-063-TEST-00`
- Evidence: `VOC-063-EV-00`
- Status: pending

Documentation-only task. Update
`specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today/` to record:

- `VOC-053-T00`: status → complete (investigation objective satisfied per issue
  #473's three-pass evidence; link to
  https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450#issuecomment-5238054774
  and issue #473).
- `VOC-053-T01`, `VOC-053-T02`: status → cancelled, superseded-by VOC-063,
  with a one-line rationale (all named candidates exhausted; no evidence-backed
  production fix identified).
- Optional: add a short "Supersession" note to VOC-053's `README.md` pointing
  at this package.

Do **not** change VOC-053's adopted `change.yaml` fields (`status: adopted`,
`implementation_authorized: true`, etc.). Close any still-open GitHub issues
tracking `VOC-053-T01` or `VOC-053-T02` with a comment referencing this
supersession. Do not close issue #450.

No application or test code changes in this task.

## VOC-063-T01 — Harden step 7 and remove VOC-053-DEP-00 diagnostic

- Requirement source: issue #473; `specification.md` scope items 2 and 3;
  `VOC-063-DEP-02`
- Acceptance criteria: `VOC-063-AC-01`, `VOC-063-AC-02`
- Tests: `VOC-063-TEST-01`, `VOC-063-TEST-02`, `VOC-063-TEST-03`
- Evidence: `VOC-063-EV-01`
- Status: pending — may proceed in parallel with or after `VOC-063-T00`; does
  not depend on T00's merge if the supersession documentation is not needed
  to write the code change

In `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`:

1. **Remove** `recordHomeResponseDiagnostic` and both call sites (steps 1 and 7).
2. **Replace** step 7's bare one-shot read with a bounded retry-and-reverify
   helper (inline or extracted within the same file — no new shared test
   utility module unless the implementer records a specific reason). The helper
   must:
   - Preserve the invariant: `reviewedAfter >= reviewedBefore + reviewedCards`.
   - On first failure, re-`goto("/home")` and/or re-call `readReviewedTodayCount`
     after a wait, up to the bound in `specification.md`'s `VOC-063-DEP-02`
     guardrails.
   - Push a `testInfo.annotations` entry when retries were needed, recording
     attempt count and the values observed on each attempt.
   - Fail with a clear error showing all observed values if the bound is exhausted.
3. Record the chosen retry parameters (max attempts, interval, rationale) in
   this task's evidence file and PR description.

Do not change any other test step, the mock-backend PR-time spec, production
code, or workflow YAML.

## VOC-063-T02 — Verify hardened step 7 on real staging

- Requirement source: `specification.md` scope item 4; issue #473's clean pass
  establishes feasibility
- Acceptance criteria: `VOC-063-AC-03`, `VOC-063-AC-04`
- Tests: `VOC-063-TEST-04`
- Evidence: `VOC-063-EV-02`
- Status: pending — depends on `VOC-063-T01` landing and a real staging deploy
  running with it in place

No further source change is expected (beyond any narrow gap this verification
surfaces). After `VOC-063-T01` merges to `develop`, confirm a real
`deploy-staging.yml` run passes
`tests/staging-e2e/core-loop.staging.spec.ts` through step 7. Record:

- Workflow run URL.
- `reviewedBefore`, `reviewedCards`, `reviewedAfter` values from the run log
  or annotations.
- Whether step 7's retry loop fired and how many attempts were needed.

Prefer a run where the synthetic account already has `reviewedBefore >= 1` from
prior-run residue (the condition under which the original failure occurred),
but do not block closure on reproducing that exact state if the gate passes
reliably otherwise — the 2026-08-10 clean pass already demonstrated feasibility.

Tasks preserve scope, separation of duties, and rollback safety. Neither task
may be dispatched before this package is adopted.
