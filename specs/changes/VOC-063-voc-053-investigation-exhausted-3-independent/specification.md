# VOC-063 — Supersede VOC-053 With Staging Core-Loop E2E Step-7 Retry Hardening: Specification

## Objective and requirement source

Close the blocked `VOC-053` fix path and replace it with bounded test hardening
for `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`'s step 7, per
[GitHub issue #473](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/473).

The original symptom — a same-run, same-day decrease in the "words reviewed
today" counter during staging core-loop E2E step 7 — was reported in
[issue #450](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450)
(run [31332238452](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31332238452),
2026-08-09). `VOC-053` was adopted to investigate and fix the root cause.
After three independent investigation passes, all named candidates are ruled
out by direct evidence (see `README.md`'s summary table and issue #473's thread).
A real staging run on 2026-08-10
([31371614353](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31371614353))
passed step 7 cleanly.

The objective of this successor package is therefore:

1. Record that `VOC-053`'s investigation is complete and its fix tasks are
   superseded (not left indefinitely blocked).
2. Harden step 7 to tolerate a possible transient/unreproduced stale read
   without abandoning the monotonic-progress invariant the assertion checks.
3. Remove the temporary `VOC-053-DEP-00` diagnostic code now that its question
   is answered.

Issue #450 remains open for the original symptom. This package does not claim
the symptom is resolved in production code; it changes how the staging gate
detects it.

## Confirmed findings (from issue #473 and independent re-check during drafting)

- `VOC-053-T00` produced three independent investigation passes. The third
  pass (issue #473, comment
  [5238054774](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450#issuecomment-5238054774))
  had live staging/production access neither prior attempt had and ruled out
  all three original candidates with direct evidence.
- `apps/web/tests/staging-e2e/core-loop.staging.spec.ts` step 7 (lines 407-412)
  currently performs a single `page.goto("/home")`, reads `reviewedAfter` once
  via `readReviewedTodayCount`, and asserts
  `reviewedAfter >= reviewedBefore + reviewedCards` with no retry.
- `recordHomeResponseDiagnostic` (lines 94-126) and its two call sites (steps 1
  and 7) are temporary VOC-053-DEP-00 diagnostics flagged for removal once
  caching is ruled out — which issue #473 confirms.
- `apps/web/src/app/(app)/home/page.tsx` remains a plain async Server Component
  with no client state and no fallback counter value — re-confirmed in issue #473,
  ruling out a client-side transient-render explanation.

## Scope and non-goals

In scope:

- `VOC-063-T00`: Update `specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today/`
  package documentation to record that `VOC-053-T00` is complete, `VOC-053-T01`
  and `VOC-053-T02` are cancelled/superseded-by-VOC-063, and link to issue #473's
  evidence as the closure rationale. Close any still-open GitHub issues tracking
  `VOC-053-T01`/`VOC-053-T02` with a reference to this supersession. Do **not**
  alter VOC-053's adopted `change.yaml` status/authorization fields.
- `VOC-063-T01`: In `apps/web/tests/staging-e2e/core-loop.staging.spec.ts`:
  - Remove `recordHomeResponseDiagnostic` and both call sites.
  - Replace step 7's bare one-shot `reviewedAfter` read with a bounded
    retry-and-reverify mechanism that re-reads the counter after brief waits
    when the first read fails the invariant, then asserts the same inequality
  once a passing read is obtained or the bound is exhausted.
  - Record in test annotations when retries were needed (count and final values).
- `VOC-063-T02`: Verify the hardened spec passes in a real `deploy-staging.yml`
  run and record the observed `reviewedBefore`/`reviewedCards`/`reviewedAfter`
  values (and whether retries fired).

Non-goals / explicitly excluded:

- Not fixing production application code (`apps/web`, `apps/api`, nginx, etc.).
  Three investigation passes found no evidence-backed defect to fix.
- Not re-litigating or closing issue #450. The original symptom may still recur;
  this package changes the gate's tolerance, not the underlying system.
- Not an unbounded poll-until-pass, permanent assertion weakening, or removal
  of the step 7 check. The invariant
  `reviewedAfter >= reviewedBefore + reviewedCards` must still be enforced;
  only the read may be retried within explicit bounds.
- Not changing the synthetic-account reuse design, other test steps, or
  `deploy-staging.yml` workflow configuration.
- Not modifying `tests/e2e/core-loop.spec.ts` (PR-time mock-backend spec).

## Risk and protected areas

Builder assessment: the only code change is to
`apps/web/tests/staging-e2e/core-loop.staging.spec.ts` (path floor `R1` per
`scripts/governance/classify-change-risk.sh`). `VOC-063-T00` touches only
`specs/changes/VOC-053-*/` markdown documentation (path floor `R0`).

This package proposes `R2` for the change as a whole because the combined
consequence is an operational change to the staging deploy gate: a more tolerant
step 7 may pass when a genuine regression would have failed on the first read.
That is a deliberate, human-reviewed trade-off reversing VOC-053's adopted
non-goal, not a path-classifier artifact. The independent verifier must confirm
the implemented retry bounds are genuinely bounded and that the invariant itself
is unchanged.

No protected governance, workflow, secret-handling, migration, or production
infrastructure area is directly touched. EHR is not triggered.

## Decisions, contradictions, security, and privacy

`VOC-063-D00` (recorded here for traceability; formal decision numbering
applies after adoption): After three independent investigation passes exhausting
all of issue #450's named candidates with direct live evidence, and with a
clean real staging E2E pass on 2026-08-10, the appropriate forward path is
test resilience for a possible transient read rather than continuing to search
for a backend defect no investigation pass has located. This supersedes
`VOC-053-T01`/`VOC-053-T02`'s fix-with-evidence scope.

**Contradiction with VOC-053 (explicit, not silently resolved):** VOC-053's
adopted `specification.md` non-goals state "No weakening, retrying,
polling-until-pass, or removal of the step 7 assertion." This package
deliberately proposes bounded retrying of the *read*, not removal or weakening
of the assertion. Adoption of VOC-063 is the authority gate for that scope
change (`VOC-063-DEP-01`).

Open questions for the reviewing human:

1. **`VOC-063-DEP-01` — Explicit acceptance of superseding VOC-053's adopted
   non-goal.** Does the reviewing human accept that the staging gate's step 7
   may tolerate bounded transient read mismatches rather than continuing the
   VOC-053 fix path? This is the central adoption decision.
2. **`VOC-063-DEP-02` — Exact retry parameters.** This package requires bounded
   retries but does not fix the exact numbers. The implementer must propose
   values in `VOC-063-T01`'s PR and evidence, staying within these guardrails:
   - Maximum attempts: at least 2, at most 5 (including the initial read).
   - Wait between attempts: at least 500ms, at most 3s.
   - Total step-7 timeout: must remain within Playwright's existing test timeout
     (do not raise the global test timeout solely for this retry loop).
   - Must still fail (not pass silently) if no read satisfies the invariant
     within the bound.
   - Must record via `testInfo.annotations` when any retry was needed.
3. **Whether issue #450 should receive a cross-link comment when VOC-063 closes.**
   Out of scope for implementation unless the adopting human directs it; the
   issue stays open either way.

No new secret, credential, or personal-data handling is introduced. The
synthetic smoke-test account remains the only account used.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None. No schema, seed, or production data change.
- **Analytics:** None.
- **Accessibility:** None. No UI change.
