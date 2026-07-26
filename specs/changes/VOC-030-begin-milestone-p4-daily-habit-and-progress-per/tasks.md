# VOC-030 — Tasks

Ordered PR sequence: `T00 → T01 → T02 → T03 → T04 → T05 → T06`. Each PR is
independently reviewable, remains R3-proposed (path floor R3 for
migrations/schemas), and requires Claude Code exact-SHA review.
**`D01`–`D05` are open founder decisions; no task in this roster may proceed
past the decision(s) it depends on by guessing.** `T00` is blocked on `D01`
(`user_settings` scope) and `D02` (ledger enum contradiction); `T01`–`T03` are
additionally blocked on `D03` (optional mission goals) and, for `T02`, `D04`
(grace-day application); `T06`'s staging/evaluation interpretation depends on
`D05` (no retroactive backfill).

## VOC-030-T00 — `missions`/`gamification` modules, five new tables, `user_settings`, and pure domain logic

- Requirement source: `VOC-030-D00`, `VOC-030-D01`, `VOC-030-D02`, `VOC-030-D03`, `VOC-030-D04`, DOC-05 §§4,6,10,12,18, DOC-06 §§3,10,11,13, DOC-06 §15
- Acceptance criteria: `VOC-030-AC-00`, `VOC-030-AC-01`, `VOC-030-AC-02`
- Tests: `VOC-030-TEST-00`..`VOC-030-TEST-08`
- Evidence: `VOC-030-EV-00`..`VOC-030-EV-08`
- Status: pending — blocked on `D01`/`D02`

Add the `missions` and `gamification` Ent schemas + reviewed versioned Atlas
SQL for `daily_mission_snapshots`, `daily_activity_summaries` (owned by
`missions`), `confidence_point_ledger`, `streak_states`, `grace_day_ledger`
(owned by `gamification`), and `user_settings` (per the adopted `D01`
resolution), in DOC-05 §18 order (after `ai_feedback_attempts`), with FKs,
check constraints, uniqueness, and no `ON DELETE CASCADE` onto the two
ledgers. Apply the adopted `D02` reconciliation to
`confidence_point_ledger.reason`/`source_type`. Implement each module as
transaction-scoped: exported functions accept an existing `*sql.Tx` (or
equivalent) and never open their own transaction (DOC-06 §3). Implement pure
domain functions: the DOC-06 §11 reward table; timezone/target resolution per
the adopted `D01` chain, with IANA-timezone validation; lazy
`daily_mission_snapshots`/`user_settings` row creation; streak reconciliation
computed at read/write time from `daily_mission_snapshots` (no queue/cron —
DOC-06 §15); grace-day earn-every-7-days/cap-2 rule, gated by the adopted `D04`
application mode; and deterministic per-source-event idempotency-key
derivation for every ledger insert. Unit-test all domain functions in
isolation, with no Ent/Huma dependency. Rehearse disposable forward migration
and recovery; production migration never runs at API startup. No API routes,
no wiring into P1/P2/P3, no frontend in this PR.

## VOC-030-T01 — Wire word-addition reward into the P1 transaction

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, DOC-06 §§10,11
- Acceptance criteria: `VOC-030-AC-03`, `VOC-030-AC-08`
- Tests: `VOC-030-TEST-09`..`VOC-030-TEST-11`, `VOC-030-TEST-30`
- Evidence: `VOC-030-EV-09`..`VOC-030-EV-11`, `VOC-030-EV-30`
- Status: pending

Inside `apps/api/business/learning/postgres.go`'s existing word-addition
transaction, after the existing `INSERT INTO user_words` and before its
existing commit, call the `T00` `gamification` function to record the `+2`
word-add point award (idempotency key derived from the `user_words` row ID)
and, only if the adopted `D03` activates the optional new-word mission goal,
call the `T00` `missions` function to increment `daily_activity_summaries.words_added`
and `daily_mission_snapshots.new_words_completed`. Add a test proving the
pre-existing P1 word-addition behavior (response shape, error cases, dedup on
re-add) is byte-for-byte unchanged with the new steps present, plus tests
proving a duplicate/idempotent add or a failed insert awards nothing. No API
route change, no P2/P3/frontend change in this PR.

## VOC-030-T02 — Wire review-submission reward, mission progress, and streak into the P2 transaction

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, `VOC-030-D04`, DOC-05 §§12,15, DOC-06 §§10,11
- Acceptance criteria: `VOC-030-AC-04`, `VOC-030-AC-08`
- Tests: `VOC-030-TEST-12`..`VOC-030-TEST-16`, `VOC-030-TEST-31`
- Evidence: `VOC-030-EV-12`..`VOC-030-EV-16`, `VOC-030-EV-31`
- Status: pending

Inside `apps/api/business/reviews/postgres.go`'s existing review-submission
transaction, after the existing `review_attempts` insert and `user_words`
schedule update and before its existing commit, call the `T00`
`gamification`/`missions` functions to: record the rating-tiered point award
(Again +1 / Hard +2 / Good +5 / Easy +6); update
`daily_activity_summaries` review counters and
`daily_mission_snapshots.reviews_completed`; run streak reconciliation; and,
when the review target (and any `D03`-active optional targets) are met for
the first time that local day, transition the mission to
`status='completed'`, set `completed_at`, record the `+10` completion award,
and advance the streak (applying the adopted `D04` grace-day mode when
relevant) — all inside the same transaction, exactly once. Add a test proving
the pre-existing P2 submission behavior (schedule transitions, idempotency,
error cases) is byte-for-byte unchanged with the new steps present, plus
tests proving a replayed submission never re-triggers a reward or
double-completes the mission. No P1/P3/frontend change in this PR.

## VOC-030-T03 — Wire AI-feedback reward and the real `MissionUpdater` into the P3 orchestration

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, DOC-05 §15, DOC-06 §11, VOC-028-D01
- Acceptance criteria: `VOC-030-AC-05`, `VOC-030-AC-08`
- Tests: `VOC-030-TEST-17`..`VOC-030-TEST-20`, `VOC-030-TEST-32`
- Evidence: `VOC-030-EV-17`..`VOC-030-EV-20`, `VOC-030-EV-32`
- Status: pending

Implement `missions.RealMissionUpdater` (or equivalent) satisfying the
existing `aifeedback.MissionUpdater` interface at
`apps/api/business/aifeedback/mission.go`, and wire it in place of
`NewStubMissionUpdater()` in `apps/api/business/aifeedback/service.go`'s
construction path. On a successful (`succeeded`/`feedback_ready`) attempt —
the same post-provider-call update step that currently calls
`s.mission.Update(...)` at line 294, never during the DOC-05 §15 pending-row
phase and never held across the provider call — record the `+3`
sentence-submitted award, the `+2` AI-feedback-received award, and, only if
the adopted `D03` activates the optional sentence-practice mission goal,
increment `sentence_practices_completed`; return the real
`missionCompleted` boolean from the mission/streak transition, replacing the
stub's always-`false`. A `pending`, `failed`, `cancelled`, blocked, or
self-harm-intervened attempt (VOC-028-AC-06) must reach neither the reward
nor the mission-update call. Add a test proving the pre-existing P3
orchestration behavior (safety outcomes, dedup, rate limits, error codes) is
unchanged with the real updater present, plus a test proving a failed/blocked
attempt triggers no reward. No P1/P2/frontend change in this PR; the mock
feedback provider remains the CI-only provider (VOC-028-AC-01/D02 unchanged).

## VOC-030-T04 — Daily-mission and progress read APIs

- Requirement source: `VOC-030-D00`, `VOC-030-D01`, DOC-07
- Acceptance criteria: `VOC-030-AC-06`
- Tests: `VOC-030-TEST-21`..`VOC-030-TEST-25`
- Evidence: `VOC-030-EV-21`..`VOC-030-EV-25`
- Status: pending

Add `GET /api/v1/daily-mission` (operation ID `GetDailyMission`) and
`GET /api/v1/progress` (operation ID `GetProgress`) to the API surface:
`RequireAuth`, explicit DTOs (never Ent models), self-scoped (no ID
parameter — nothing to enumerate), committed OpenAPI, and matched
`@vocanova/api-client` methods. `GetDailyMission` triggers lazy
snapshot/`user_settings` creation and streak reconciliation on read and
returns the fields in specification.md item 5 plus a shared `streak` object.
`GetProgress` returns `confidencePointsBalance`, the same shared `streak`
object (one `gamification` call backing both endpoints), and a bounded 7-day
`completionHistory` — no generic pagination. Unauthenticated → 401. No
frontend wiring in this PR.

## VOC-030-T05 — Home and Progress screen wiring; cross-capability consistency

- Requirement source: `VOC-030-D00`, DOC-08, VOC-019, VOC-020, VOC-027-D05
- Acceptance criteria: `VOC-030-AC-07`
- Tests: `VOC-030-TEST-26`..`VOC-030-TEST-29`
- Evidence: `VOC-030-EV-26`..`VOC-030-EV-29`
- Status: pending

In `apps/web/src/app/(app)/home/page.tsx`, replace `MOCK_HOME_STATE`'s
`missionTargetWords`/`reviewedWordsToday`/`currentStreakDays` with a real
`GET /api/v1/daily-mission` call (the P2-wired `dueReviewWords` read is
unchanged). In `apps/web/src/app/(app)/progress/page.tsx`, replace
`MOCK_PROGRESS_STATE`'s
`confidencePointsTotal`/`currentStreakDays`/`longestStreakDays`/
`completionHistory` with a real `GET /api/v1/progress` call, deriving each
day-of-week label from the returned `localDate`. Handle loading, a day-one
empty state (no snapshot/history yet), and error states without a
client-fabricated fallback value. No client DB access or duplicated
authorization; accessibility per specification.md's Data/accessibility
section.

## VOC-030-T06 — Duplicate/failed/unauthorized-safety verification, evaluation, mock-inventory, staging evidence, and P4 gate readiness

- Requirement source: `VOC-030-D00`, `VOC-030-D05`, DOC-12 §5 P4
- Acceptance criteria: `VOC-030-AC-08`, `VOC-030-AC-09`
- Tests: `VOC-030-TEST-30`..`VOC-030-TEST-36`
- Evidence: `VOC-030-EV-30`..`VOC-030-EV-36`
- Status: pending

Add the cross-cutting duplicate/failed/unauthorized-safety test suite
(`VOC-030-AC-08`) spanning `T01`–`T04` together (not only within each task in
isolation), including a multi-day-gap streak-break scenario
(`VOC-030-R06`) and a client-supplied-invalid-timezone rejection scenario
(`VOC-030-R02`). Update the deterministic mock-inventory check
(`scripts/foundation/mock-inventory.mjs`) to admit the new `missions`/
`gamification` modules/routes/schemas/migrations, record the
`MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE` field retirements from `T05`, and
assert no P5 route/table/behavior was invented. Per the adopted `D05`, record
that no retroactive point/mission/streak backfill was performed for
pre-activation P1/P2/P3 activity, and note this explicitly when interpreting
any staging exercise that reuses pre-existing test accounts. Collect the
mock-decommission inventory, staging evidence (rollback rehearsal for the six
new tables; save→review→submit-sentence→mission-completes→streak-advances→
progress-reads end-to-end), and P4 gate readiness. Do not declare the DOC-12
P4 gate complete.

### Deliverables

- `mock-inventory.md`: maps every mock touched by P4
  (`MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE`) to its disposition and records the
  new real P4 modules/tables/routes.
- `staging-evidence.md`: collects in-repository evidence and documents the
  staged exercises and rollback rehearsal that can only run once F3 exists.
- updated `scripts/foundation/mock-inventory.mjs` (+`.test.mjs`): deterministic
  check enforcing the new P4 boundaries and that no P5 route/table/behavior
  was invented.

### Blocker

`VOC-030-DEP-02` remains open: F3 staging does not exist, so the live staging
exercises cannot be executed. This task provides the procedures and the
in-repository evidence only; it does not declare the DOC-12 P4 gate complete.
