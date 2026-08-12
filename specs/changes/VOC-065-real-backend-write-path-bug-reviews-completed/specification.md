# VOC-065 — Fix Real Backend Write Path So `reviews_completed` Increments: Specification

## Objective and requirement source

Close the gap reported in
[GitHub issue #482](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/482):
on 2026-08-10 ~20:38 UTC, `deploy-staging.yml` run
[31429774964](https://github.com/KARSIFT/vocanova-platform-sandbox/actions/runs/31429774964)
failed `tests/staging-e2e/core-loop.staging.spec.ts` step 7 under
VOC-063-T01's newly-merged bounded retry hardening:

```
Error: Step 7 reviewed-today counter did not reach the expected minimum after 4 attempt(s):
reviewedBefore=0, reviewedCards=2, minimumExpected=2, observed=[0, 0, 0, 0]
```

The same job's VOC-050-T02 diagnostic DB dump:

```
 local_date | timezone | review_target | reviews_completed | status |          updated_at
------------+----------+---------------+-------------------+--------+-------------------------------
 2026-08-10 | UTC      |            20 |                 0 | open   | 2026-08-10 00:13:45.299156+00
 2026-08-09 | UTC      |            20 |                 0 | open   | 2026-08-09 08:06:03.51608+00
(2 rows)
```

Today's row's `updated_at` is hours before the test run. The counter never left
0 across four independent fresh reads, and the snapshot row was never updated
— despite step 5 reporting `reviewedCards=2` through the real UI.

This is distinct from VOC-053 / issue #450's original symptom (a same-run
*decrease* `reviewedBefore=1` → `reviewedAfter=0`). VOC-063 correctly hardened
the read path and is out of scope here. Issue #450 stays open.

**Objective:** after this package's implementation, a successful review
submission against real staging (and production, via the same composition root)
actually increments `daily_mission_snapshots.reviews_completed` for the
submitting user's today-row, so Home's "words reviewed today" counter and
staging E2E step 7 reflect real progress.

## Confirmed findings (from issue #482 and independent re-check during drafting)

- VOC-063-T01's retry loop (4 attempts, fresh `page.goto("/home")` + fresh
  counter read, 1.5s apart) worked as designed and did not mask a persistent
  write failure.
- The diagnostic dump rules out a pure stale-read/caching explanation for *this*
  failure: the DB row itself was never touched.
- `apps/api/business/reviews/postgres.go`'s `SubmitReview` only calls
  `applyP4ReviewWiring` (which calls `missions.IncrementReviewsCompleted`) when
  **both** `r.gamification != nil` and `r.missions != nil`. When either is nil,
  P2 review_attempts / user_words writes still commit successfully — the UI can
  look correct while the mission counter never moves. Confirmed by reading the
  guard at the P4 wiring block and by
  `TestPostgreSQLRepositorySubmitReviewP4NilDependenciesNoP4Wiring`.
- **Primary drafting-time candidate:** `apps/api/app/api/production.go`
  constructs:
  - `reviewsRepo := reviews.NewPostgreSQLRepository(db, clk)` with **no**
    `WithGamificationService` / `WithMissionsService` options.
  - Then separately constructs `gamSvc` / `missionsSvc` and registers them for
    **read** routes via `RegisterMissions(api, missionsSvc)`.
  - Result: live `POST` review submissions succeed without ever calling
    `IncrementReviewsCompleted`; `GET` daily-mission continues to serve the
    untouched snapshot (`reviews_completed = 0`). This matches issue #482's
    evidence exactly.
- Construction order in `production.go` currently creates `reviewsRepo` *before*
  `gamSvc`/`missionsSvc`, so a fix must reorder (create missions/gamification
  first, then pass them into the reviews repository options).
- Secondary candidates from issue #482 remain open until T00 rules them out:
  1. `reviewOneCard()` (or the real UI flow) short-circuiting after the
     "Good"/rating click without a completed submit request.
  2. Write path resolving a different `(user_id, local_date)` than the read /
     diagnostic dump (issue #450 ruled this out for the *read* path; write path
     is separately unconfirmed).
  3. Synthetic-account queue race making `reviewedCards=2` a false positive
     relative to real submissions.

## Scope and non-goals

In scope:

- `VOC-065-T00`: Confirm, with direct evidence, which cause explains run
  31429774964 (and the general write-path failure). Prefer confirming or
  falsifying the production.go wiring gap first; then the issue #482 secondary
  candidates. Record evidence in `t00-evidence.md`.
- `VOC-065-T01`: Fix the confirmed cause narrowly. If the primary candidate
  holds: wire `WithGamificationService(gamSvc)` and `WithMissionsService(missionsSvc)`
  into the live reviews repository in `production.go` (reorder construction as
  needed), and add a deterministic regression test that fails when the live
  composition root omits those options (or an equivalent construction-time /
  wiring assertion the implementer records). Do not broaden into unrelated
  review-scheduling or UI refactors.
- `VOC-065-T02`: Verify on a real `deploy-staging.yml` run that after the fix,
  reviewing N cards through the real UI increments `reviews_completed` (step 7
  passes with `reviewedAfter >= reviewedBefore + reviewedCards`, and preferably
  the diagnostic dump / equivalent shows `updated_at` and count advancing).

Non-goals / explicitly excluded:

- Not folding into VOC-063 or reopening VOC-053's cancelled fix path.
- Not closing or re-litigating issue #450's original decrease symptom.
- Not weakening, removing, or further changing step 7's invariant or VOC-063
  retry bounds (unless T00 proves the *only* defect is a test false-positive —
  in that case, any test-only fix stays narrowly scoped and must still preserve
  the invariant).
- Not an assumed historical backfill of under-counted
  `daily_mission_snapshots` rows (`VOC-065-DEP-01`) unless adoption expands
  scope.
- Not changing synthetic-account minting (VOC-050), seed content (VOC-052), or
  deploy workflow structure except as strictly required by a confirmed cause.

## Risk and protected areas

Builder assessment: expected code touch is `apps/api/app/api/production.go` plus
a focused regression test under `apps/api/`. Path classifier floor for that set
(and the staging E2E verify target) measured at drafting time: **R1**.

This package proposes **R3** because the semantic consequence — if the primary
candidate is real — is that production and staging never advance the daily
mission counter after reviews for any user. That is a core-loop product
correctness failure, not a path-classifier artifact. The independent verifier
must re-run `classify-change-risk.sh` against the real task file list and may
raise further if a migration path is taken.

No governance, workflow-YAML, secret-handling, or (by default) migration area
is touched. EHR is not triggered. Under active A-003, routine R3 does not
require standing technical-steward or founder approval merely for being R3;
strengthened verification still applies. R4 is not anticipated.

## Decisions, contradictions, security, and privacy

`VOC-065-D00` (recorded here for traceability; formal decision numbering
applies after adoption): A successful review submission must advance today's
`daily_mission_snapshots.reviews_completed` for the submitting user. A UI that
appears to complete a review while leaving the mission snapshot untouched is a
product defect, whether caused by composition-root wiring, a handler bug, or a
client/test short-circuit.

No contradiction with VOC-063: that package deliberately changed only the
staging gate's read tolerance after VOC-053's investigation exhausted its named
candidates. This package addresses a newly evidenced write-path failure that
VOC-063's hardening made conclusive.

Open questions for the reviewing human:

1. **`VOC-065-DEP-00` — Confirm primary candidate vs alternatives.** Adoption
   may proceed with T00 still required to confirm; the human should note whether
   the drafting-time `production.go` wiring gap is accepted as the starting
   investigation priority (recommended) or whether another candidate should be
   prioritized.
2. **`VOC-065-DEP-01` — Historical under-counts.** Default proposed scope is
   forward-fix only. Should adoption expand to a corrective migration /
   backfill for staging and/or production rows left at `reviews_completed = 0`
   despite existing `review_attempts`? Expanding would touch the protected
   `apps/api/migrations/` path (path floor R3) and needs an explicit decision.
3. **Cross-link to issue #450.** Out of scope for implementation unless the
   adopting human directs a comment noting this distinct write-path finding;
   issue #450 stays open either way.

No new secret, credential, or personal-data handling is introduced. Staging
verification continues to use only the existing synthetic smoke-test account.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None by default. Forward-fix only. See open question 2
  / `VOC-065-DEP-01` if adoption expands.
- **Analytics:** None expected. Mission/progress counters are product state, not
  a new analytics pipeline.
- **Accessibility:** None. No intentional UI change unless T00 forces a narrow
  client submit/await fix.
