# VOC-063 — Supersede VOC-053 With Staging Core-Loop E2E Step-7 Retry Hardening

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #473](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/473),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-063
- Title: Supersede VOC-053 With Staging Core-Loop E2E Step-7 Retry Hardening After
  Three Independent Investigation Passes Exhaust All Candidates
- Canonical path: `specs/changes/VOC-063-voc-053-investigation-exhausted-3-independent`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R2` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issues:
  - [#473](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/473) (this
    package's requirement source)
  - [#450](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/450) (original
    symptom — remains open; not re-litigated here)
- Supersedes: [VOC-053](specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today)
  (`VOC-053-T01`/`VOC-053-T02` fix path only; `VOC-053-T00` investigation is
  treated as complete)

## Why this exists

[VOC-053](specs/changes/VOC-053-staging-core-loop-e2e-words-reviewed-today) was
adopted (PR #451) to find and fix the real cause of a same-run decrease in the
"words reviewed today" counter observed during staging core-loop E2E step 7 on
2026-08-09 (issue #450, run 31332238452). After three independent investigation
passes — two implementer attempts on `VOC-053-T00` plus a third pass with live
staging access documented in issue #473 — every candidate root cause issue #450
named is ruled out by direct evidence:

| Candidate | Ruling |
|---|---|
| (a) Next.js/CDN caching | Ruled out live — `cf-cache-status: DYNAMIC` on both `staging.vocanova.site/home` and `api-staging.vocanova.site/api/v1/daily-mission` across multiple Cloudflare colos; no `Cache-Control`/`proxy_cache` in nginx or Go API |
| (b) Backend timezone/local-date bug | Ruled out — two independent full traces of handler → service → repository; no path can produce a different `local_date` or decremented `reviews_completed` between requests seconds apart |
| (c) Cross-run deploy concurrency | Ruled out — job-level inspection shows `deploy-staging.yml`'s `concurrency: {group: staging-deploy}` lock serializes runs; the overlapping-run evidence from T00 attempt 2 was a false positive |

A real staging deploy + full core-loop E2E on 2026-08-10 (run
[31371614353](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31371614353))
passed cleanly, including step 7.

`VOC-053-T01` is gated on `VOC-053-T00` naming a specific evidence-backed cause
and explicitly forbids touching step 7. With all named candidates exhausted and no
fourth cause identified, the fix path cannot proceed as scoped. Issue #473 requests
a deliberate scope change: close/supersede VOC-053's blocked fix tasks and adopt
test hardening instead.

## What this package does

1. **Closes the VOC-053 fix path** (`VOC-063-T00`): mark `VOC-053-T01`/`VOC-053-T02`
   as cancelled/superseded-by-VOC-063 in the VOC-053 package docs; record that
   `VOC-053-T00`'s investigation objective is complete per issue #473's evidence.
2. **Hardens step 7** (`VOC-063-T01`): replace the bare one-shot
   `reviewedAfter` read with a bounded retry-and-reverify loop that still asserts
   `reviewedAfter >= reviewedBefore + reviewedCards`, but tolerates a possible
   transient read returning a stale lower value on the first load.
3. **Removes the temporary diagnostic** (`VOC-063-T01`): delete
   `recordHomeResponseDiagnostic` and its call sites — the VOC-053-DEP-00 caching
   question is answered by direct `curl` evidence in issue #473.
4. **Verifies on real staging** (`VOC-063-T02`): confirm the hardened spec passes
   in a real `deploy-staging.yml` run.

## What this package deliberately does NOT do

- Not a production code fix for the step-7 decrease symptom. Three investigation
  passes found no evidence-backed defect to fix.
- Not a re-litigation of issue #450. That issue stays open for symptom tracking.
- Not an unbounded poll-until-pass. Retries must be bounded, recorded, and still
  fail if the invariant never holds within the limit (see `specification.md`).
- Not a weakening of the invariant itself. The assertion remains
  `reviewedAfter >= reviewedBefore + reviewedCards`; only the read mechanism
  gains transient-tolerance.
- Does not adopt itself. `change.yaml` leaves every adoption/authorization field
  at its template default.

## Open questions for the reviewing human

See `specification.md`'s open questions. The most important:

1. **Explicit acceptance of superseding VOC-053's adopted non-goal** (`VOC-063-DEP-01`):
   VOC-053's specification explicitly forbade retrying or polling step 7. This
   package reverses that deliberately. Adoption must record that acceptance.
2. **Retry parameter bounds** (`VOC-063-DEP-02`): left to the implementer within
   the guardrails in `specification.md`.

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
