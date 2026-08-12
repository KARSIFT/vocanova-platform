# VOC-074 — VOC-065-T01's Fix Does Not Resolve the `reviews_completed` Increment Bug

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #539](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/539),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-074
- Title: VOC-065-T01's Fix Does Not Resolve the `reviews_completed` Increment Bug
- Canonical path:
  `specs/changes/VOC-074-voc-065-t01-s-fix-does-not-resolve-the-reviews`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R3` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination; path floor measured
  at drafting time is `R1`)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issues:
  - [#539](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/539) (this
    package's requirement source)
  - [#482](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/482)
    (original never-increments report — still open; VOC-065 addressed only the
    wiring gap)
  - [#450](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450)
    (original VOC-053 decrease symptom — remains open; not re-litigated here)
- Related packages and PRs:
  - [VOC-065](specs/changes/VOC-065-real-backend-write-path-bug-reviews-completed)
    — T01 (PR #523) wired P4 dependencies; T02 verification (PR #529) must not
    be treated as satisfying AC-03 until this package closes
  - [VOC-063](specs/changes/VOC-063-voc-053-investigation-exhausted-3-independent)
    — step-7 retry hardening; still valid; this package does not weaken it

## Why this exists

After VOC-065-T01 merged (PR #523), staging core-loop E2E runs report step 7
passing — but the VOC-050-T02 diagnostic DB dump (present in
`deploy-staging.yml`) shows today's `daily_mission_snapshots.reviews_completed`
still stuck at `0`, with `updated_at` unchanged across runs ~1h43m apart despite
the suite reporting success:

| Run | Dump time | `reviews_completed` (today) | `updated_at` |
|-----|-----------|------------------------------|--------------|
| [31575459316](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31575459316) | 07:51 UTC | `0` | `2026-08-12 07:50:56` |
| [31583230574](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31583230574) | 09:34 UTC | `0` | `2026-08-12 07:50:56` (unchanged) |

Step 7's invariant `reviewedAfter >= reviewedBefore + reviewedCards` holds
**vacuously** when `reviewedCards = 0` (e.g. synthetic account queue already
exhausted for the day, or reviews silently not counted). VOC-065-T02's
independent review (PR #529) correctly returned `VERDICT: FAIL` for this reason.

VOC-065-T01's wiring fix may have addressed a real gap, but it is not the
complete root cause — or a second defect remains in the
`SubmitReview` → `applyP4ReviewWiring` → `IncrementReviewsCompleted` path.

## What this package does

1. **Confirm the residual root cause** (`VOC-074-T00`) with direct evidence
   against a live or reproducible path, distinguishing a real increment defect
   from synthetic-account queue exhaustion.
2. **Fix the confirmed cause** (`VOC-074-T01`) narrowly, with regression
   coverage.
3. **Harden staging E2E step 7** (`VOC-074-T02`) so a vacuous
   `reviewedCards = 0` pass can never again satisfy AC-03.
4. **Verify on real staging** (`VOC-074-T03`) with `reviewedCards >= 1`, step
   7 pass, and diagnostic-dump confirmation that `reviews_completed` /
   `updated_at` advanced.

## What this package deliberately does NOT do

- Not a reopening of VOC-053 or a fold-in to VOC-063.
- Not a closure of issue #450's original decrease symptom.
- Not an assumed merge or approval of VOC-065-T02 (PR #529) as satisfying
  VOC-065-AC-03.
- Not an assumed historical backfill of under-counted mission rows (see
  `VOC-074-DEP-01`) unless adoption expands scope.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization
  field at its unadopted default.

## Open questions for the reviewing human

See `specification.md`. The most important at adoption:

1. Accept proposed `R3` semantic elevation above the measured `R1` path floor.
2. Accept forward-fix-only default (`VOC-074-DEP-01`), or expand to a
   corrective migration / backfill.
3. Whether synthetic-account queue reset / seeding belongs in this package or a
   follow-up if T00 confirms queue exhaustion (`VOC-074-DEP-03`).

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
