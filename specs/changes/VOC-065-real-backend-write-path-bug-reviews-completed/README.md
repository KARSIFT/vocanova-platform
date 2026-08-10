# VOC-065 — Fix Real Backend Write Path So `reviews_completed` Increments

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #482](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/482),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-065
- Title: Fix Real Backend Write Path So `reviews_completed` Increments On Review
  Submission
- Canonical path:
  `specs/changes/VOC-065-real-backend-write-path-bug-reviews-completed`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R3` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination; path floor measured
  at drafting time is `R1`)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issues:
  - [#482](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/482) (this
    package's requirement source)
  - [#450](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450)
    (original VOC-053 decrease symptom — remains open; not re-litigated here)
- Related but distinct packages:
  - [VOC-063](specs/changes/VOC-063-voc-053-investigation-exhausted-3-independent)
    — step-7 retry hardening; already working; correctly surfaced this bug
  - [VOC-053](specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today)
    — investigation of a different symptom (same-run decrease); fix path
    superseded by VOC-063

## Why this exists

A real staging core-loop E2E run on 2026-08-10 ~20:38 UTC
([run 31429774964](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31429774964))
failed step 7 under VOC-063-T01's newly-merged bounded retry:

```
Error: Step 7 reviewed-today counter did not reach the expected minimum after 4 attempt(s):
reviewedBefore=0, reviewedCards=2, minimumExpected=2, observed=[0, 0, 0, 0]
```

The retry hardening worked as designed: four independent fresh `/home` loads
never saw the counter move. The same job's diagnostic DB dump shows today's
`daily_mission_snapshots` row still at `reviews_completed = 0` with
`updated_at` hours before the test — the row was never touched. This is
evidence that the review submission never reached/committed
`IncrementReviewsCompleted`, despite the UI treating two cards as successfully
reviewed.

That is a different failure mode from VOC-053 / issue #450 (a same-run
*decrease* from 1 → 0). Issue #482 asks for a separate package.

## What this package does

1. **Confirm the write-path root cause** (`VOC-065-T00`) with direct evidence,
   starting from the drafting-time primary candidate (production composition-root
   wiring) and the secondary candidates named in issue #482.
2. **Fix the confirmed cause** (`VOC-065-T01`) narrowly, with a regression test
   that would have caught it.
3. **Verify on real staging** (`VOC-065-T02`) that after N UI reviews,
   `reviews_completed` actually increments (DB and/or step 7), including under
   VOC-063's hardened step-7 retry.

## What this package deliberately does NOT do

- Not a reopening of VOC-053 or a fold-in to VOC-063.
- Not a closure of issue #450's original decrease symptom.
- Not a weakening, removal, or further relaxation of step 7 (VOC-063 already
  hardened the read; this package fixes the write).
- Not an assumed historical backfill of under-counted mission rows (see
  `VOC-065-DEP-01` / open question 2) unless adoption expands scope.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization
  field at its unadopted default.

## Open questions for the reviewing human

See `specification.md`. The most important at adoption:

1. Accept proposed `R3` semantic elevation above the measured `R1` path floor.
2. Accept forward-fix-only default (`VOC-065-DEP-01`), or expand to a
   corrective migration / backfill.

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
