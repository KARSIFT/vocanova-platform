# VOC-030 — P4 Daily Habit and Progress Staging Evidence

## Scope and authority

This document is drafted **before adoption** and records the procedures that
will produce `T06`'s staging evidence once the package is adopted, `D01`–`D05`
are resolved, and F3 staging exists. It contains no completed evidence yet and
does not declare the DOC-12 P4 milestone gate complete.

Live staging exercises are blocked by two dependencies:
- `VOC-030-DEP-02`: the F3 staging environment does not yet exist (carried
  from VOC-026-DEP-03 / VOC-027-DEP-02 / VOC-028-DEP-04).
- `D01`–`D05`: open founder decisions that shape `T00`–`T03`'s implementation;
  staging exercises are only meaningful against the adopted resolutions.

## In-repository evidence (to be produced by `T00`–`T06`)

| Evidence | Requirement | Status |
| --- | --- | --- |
| `EV-00`/`EV-01` | New-table migration invariants and no A1/P1/P2/P3 regression | Not yet produced — depends on `T00` |
| `EV-02`/`EV-03` | `user_settings` resolution chain, timezone validation | Not yet produced — depends on `T00`, `D01` |
| `EV-04`..`EV-08` | Reward config, streak/grace-day domain logic, idempotency-key derivation, transaction-scoping | Not yet produced — depends on `T00` |
| `EV-09`..`EV-11` | P1 word-add wiring, exactly-once, no P1 regression | Not yet produced — depends on `T01` |
| `EV-12`..`EV-16` | P2 review-submission wiring, mission completion, streak, no P2 regression | Not yet produced — depends on `T02` |
| `EV-17`..`EV-20` | P3 real `MissionUpdater`, rewards gated on success, no P3 regression | Not yet produced — depends on `T03` |
| `EV-21`..`EV-25` | `GetDailyMission`/`GetProgress` contract, auth, balance correctness, OpenAPI/client drift | Not yet produced — depends on `T04` |
| `EV-26`..`EV-29` | Home/Progress wiring, cross-capability consistency, empty/error states | Not yet produced — depends on `T05` |
| `EV-30`..`EV-33` | Cross-cutting duplicate/failed/unauthorized-safety, multi-day streak-break | Not yet produced — depends on `T01`–`T04`, `T06` |
| `EV-34` | Installed deterministic/security suite + extended mock-inventory | Not yet produced — depends on each PR |
| `EV-37` | Exact-SHA independent verification, each PR | Not yet produced — depends on each PR |

## Staging exercise plan (blocked by F3 + `D01`–`D05`)

Once `VOC-030-DEP-02` and `D01`–`D05` are resolved and a non-production F3
environment is available, the following exercises must be executed and their
results recorded here or in PR evidence.

### EV-35 — Save → review → submit-sentence → mission-completes → progress-reads

1. With a non-production learner identity that has **no pre-existing
   activity** (per `D05`, no retroactive backfill applies), save a word,
   submit reviews until the daily review target is met, and submit a sentence
   for AI feedback.
2. Verify the mission transitions to `completed`, the streak advances by one,
   and the appropriate point awards appear in the ledger exactly once each.
3. Call `GET /api/v1/daily-mission` and `GET /api/v1/progress` and verify both
   agree with each other and with what Home/Progress render.
4. Repeat the review-submission and sentence-submission steps with a replayed
   idempotency key and verify no duplicate reward or double completion.

### EV-36 — New-tables rollback rehearsal

1. Record current `daily_mission_snapshots`, `confidence_point_ledger`,
   `streak_states`, `grace_day_ledger`, and `user_settings` state for a test
   learner.
2. Apply the VOC-030 build and migration in staging.
3. Run several mission-completing flows, then perform a rollback to the
   previously known-good revision.
4. Verify that:
   - All committed `confidence_point_ledger`/`grace_day_ledger` rows created
     before the rollback remain immutable.
   - `daily_mission_snapshots`/`streak_states`/`user_settings` state is
     preserved.
   - The P1/P2/P3 write paths remain functional after rollback (the P3
     `StubMissionUpdater` fallback keeps the AI-feedback flow itself working
     even if `missions` is rolled back independently).

## Cross-capability consistency check

1. Load Home and Progress for the same non-production identity in the same
   session.
2. Verify the streak figure shown on each screen is identical.
3. Verify Home's mission progress bar matches the `reviewsCompleted`/
   `reviewTarget` values `GetDailyMission` returns at that instant.

## Rollback triggers

Per `VOC-030` implementation-plan §Deployment and rollback / release-plan
§Rollback, initiate rollback on:

- False mission/streak/point state reaching a learner.
- Suspected cross-user exposure of progress data.
- A confirmed duplicate reward in production.
- Inconsistent Home-vs-Progress figures.
- A regression in the underlying P1/P2/P3 write paths this package extends.
- Migration or schema failure.

## Rollback procedure

1. Preserve immutable `confidence_point_ledger`/`grace_day_ledger` history:
   never drop committed reward rows.
2. Preserve `daily_mission_snapshots`/`streak_states`/`user_settings` state.
3. Restore the pre-P4 P1/P2/P3 transaction behavior cleanly (verify the
   `StubMissionUpdater` fallback keeps P3 functional if needed).
4. Revert the deployment to the last-known-good revision.
5. Validate with non-production identities.
6. Record the last-known-good revision and the rollback reason.

## Limitations / open dependencies

- `VOC-030-DEP-02`: F3 staging does not exist, so `EV-35`/`EV-36` cannot be
  run live. Procedures are documented; live execution is recorded as blocked.
- `D01`–`D05`: open founder decisions. Any staging exercise run before
  adoption would be against an unapproved, possibly-wrong design and is not
  performed by this draft.
- Accessibility automation for the Home/Progress wiring is not yet
  implemented; recorded as a limitation, not a pass.

## Follow-up work

- Execute `EV-35`/`EV-36` once F3 staging and the `D01`–`D05` resolutions are
  available.
- P5: fold the daily-habit loop into the full cross-feature integration and
  reliability pass.
- A future Settings package: expose `user_settings` through a real API/UI.
