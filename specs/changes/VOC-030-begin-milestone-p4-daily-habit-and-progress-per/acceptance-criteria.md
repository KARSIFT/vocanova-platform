# VOC-030 — Acceptance Criteria

Acceptance criteria are observable, stable, security-aware, and bidirectionally
traceable to requirements (`D00`–`D05`), tasks (`T00`–`T06`), tests
(`VOC-030-TEST-*`), and evidence. `D01`–`D05` are **open founder decisions**;
the criteria below are written against this draft's proposed defaults and must
be re-verified against whatever the founder actually resolves at adoption.

## VOC-030-AC-00 — New tables and migration integrity

- Requirement source: `VOC-030-D00`, DOC-05 §§10,12,16,18
- Tasks: `VOC-030-T00`
- Tests: `VOC-030-TEST-00`, `VOC-030-TEST-01`
- Evidence: `VOC-030-EV-00`, `VOC-030-EV-01`
- Result: pending

Ent/Atlas create `daily_mission_snapshots`, `daily_activity_summaries`,
`confidence_point_ledger`, `streak_states`, and `grace_day_ledger` exactly per
DOC-05 §§10,12 (fields, checks, and uniqueness as specified in
specification.md item 2), added after `ai_feedback_attempts`. No `ON DELETE
CASCADE` onto `confidence_point_ledger`/`grace_day_ledger`. No existing
A1/P1/P2/P3 table, column, or constraint is altered. Empty-db migration and
disposable recovery rehearsal preserve integrity; production migration never
runs at API startup.

## VOC-030-AC-01 — `user_settings` dependency and timezone/target resolution (`D01`)

- Requirement source: `VOC-030-D00`, `VOC-030-D01`, DOC-05 §§4,6, DOC-06 §13
- Tasks: `VOC-030-T00`
- Tests: `VOC-030-TEST-02`, `VOC-030-TEST-03`
- Evidence: `VOC-030-EV-02`, `VOC-030-EV-03`
- Result: pending — blocked on `D01` resolution at adoption

The `user_settings` table (DOC-05 §6, schema-complete) is created; rows are
created lazily on first use with schema defaults (`timezone='UTC'`,
`daily_review_target=20`). The resolved timezone/target chain is
`user_settings` (if a stored non-default value exists) → a validated
request-time client-supplied IANA timezone → UTC / default 20. An
unrecognized client-supplied timezone value is rejected, not silently
defaulted. `daily_mission_snapshots.timezone` copies the resolved *effective*
timezone at snapshot-creation time and does not change if `user_settings` is
later updated (DOC-05 §4). No public Settings API/UI is built.

## VOC-030-AC-02 — Reward configuration, streak reconciliation, and grace-day domain logic

- Requirement source: `VOC-030-D00`, DOC-00 §3, DOC-05 §12, DOC-06 §11
- Tasks: `VOC-030-T00`
- Tests: `VOC-030-TEST-04`..`VOC-030-TEST-08`
- Evidence: `VOC-030-EV-04`..`VOC-030-EV-08`
- Result: pending

Pure, unit-tested domain functions (no Huma/chi, no direct Ent writes) exist
for: the exact DOC-06 §11 reward table (Add word +2; Review Again +1 / Hard +2
/ Good +5 / Easy +6; Daily mission complete +10; Sentence submitted +3; AI
feedback received +2); streak reconciliation computed at read/write time from
`daily_mission_snapshots` (today-completed no-op; yesterday-completed
advances; yesterday-missed-with-available-grace-day protects via
`grace_day_ledger`/`status='protected'`; otherwise resets to 0/`broken`); a
grace day earned every 7 completed days capped at a balance of 2; and
deterministic per-source-event idempotency-key derivation for every
point/grace-day ledger insert. No queue/cron job is introduced (DOC-06 §15);
reconciliation is lazy, matching the DOC-06 §10 snapshot-creation pattern.

## VOC-030-AC-03 — P1 word-addition reward wiring

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, DOC-06 §§10,11
- Tasks: `VOC-030-T01`
- Tests: `VOC-030-TEST-09`..`VOC-030-TEST-11`
- Evidence: `VOC-030-EV-09`..`VOC-030-EV-11`
- Result: pending — `D02`/`D03` open

Inside the existing P1 word-addition transaction
(`apps/api/business/learning/postgres.go`), a successfully inserted
`user_words` row triggers exactly one `+2` `confidence_point_ledger` entry
(idempotency key derived from the `user_words` row ID) and, only if `D03`
activates the optional new-word mission goal, one `daily_activity_summaries.words_added`
increment and one `daily_mission_snapshots.new_words_completed` increment. A
failed insert, a duplicate/idempotent word-add, or a re-add of a previously
removed word writes no duplicate reward. No A1/P1 behavior outside this one
addition is changed.

## VOC-030-AC-04 — P2 review-submission reward, mission, and streak wiring

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, `VOC-030-D04`, DOC-05 §§12,15, DOC-06 §§10,11
- Tasks: `VOC-030-T02`
- Tests: `VOC-030-TEST-12`..`VOC-030-TEST-16`
- Evidence: `VOC-030-EV-12`..`VOC-030-EV-16`
- Result: pending — `D02`/`D03`/`D04` open

Inside the existing P2 review-submission transaction
(`apps/api/business/reviews/postgres.go`, before its existing commit), a
successfully recorded review attempt triggers exactly one rating-tiered point
award (Again +1 / Hard +2 / Good +5 / Easy +6), one
`daily_activity_summaries` review-counter update, one
`daily_mission_snapshots.reviews_completed` increment, and a streak
reconciliation call. When the review target (and any active optional targets)
are met for the first time that local day, the mission transitions to
`status='completed'`, `completed_at` is set, a `+10` point award is recorded,
and the streak advances by one — all inside the same transaction, exactly
once. A duplicate/replayed submission (already rejected or made idempotent by
P2's own `client_attempt_id` handling) never re-triggers any of the above. No
P1/P3 behavior is changed.

## VOC-030-AC-05 — P3 AI-feedback reward and real mission wiring (`MissionUpdater`)

- Requirement source: `VOC-030-D00`, `VOC-030-D02`, `VOC-030-D03`, DOC-05 §15, DOC-06 §11, VOC-028-D01
- Tasks: `VOC-030-T03`
- Tests: `VOC-030-TEST-17`..`VOC-030-TEST-20`
- Evidence: `VOC-030-EV-17`..`VOC-030-EV-20`
- Result: pending — `D02`/`D03` open

`apps/api/business/aifeedback/service.go`'s `s.mission` is wired to a real
`missions.MissionUpdater` implementation (replacing
`NewStubMissionUpdater()`); `missionCompleted` in the public
`SentenceFeedbackResult` now reflects a real write, not an always-false stub.
A successful (`succeeded`/`feedback_ready`) attempt triggers exactly one `+3`
sentence-submitted award, one `+2` AI-feedback-received award, and — only if
`D03` activates the optional sentence-practice mission goal — one
`sentence_practices_completed` increment; the reward/mission update happens in
the same post-provider-call update step that marks the attempt succeeded,
never during the pending-row phase (DOC-05 §15) and never held across the
provider call. A `pending`, `failed`, `cancelled`, blocked, or
self-harm-intervened attempt triggers no reward and no mission update
(consistent with VOC-028-AC-06). No P1/P2 behavior or any other P3 mechanic is
changed.

## VOC-030-AC-06 — Daily-mission and progress read APIs

- Requirement source: `VOC-030-D00`, `VOC-030-D01`, DOC-07
- Tasks: `VOC-030-T04`
- Tests: `VOC-030-TEST-21`..`VOC-030-TEST-25`
- Evidence: `VOC-030-EV-21`..`VOC-030-EV-25`
- Result: pending

`GET /api/v1/daily-mission` and `GET /api/v1/progress` are requester-scoped
reads with explicit DTOs (never Ent models), stable operation IDs
(`GetDailyMission`, `GetProgress`), committed OpenAPI, and matched
`@vocanova/api-client` methods. `GetDailyMission` lazily creates today's
snapshot on first read of a new local day and returns the fields listed in
specification.md item 5, including a shared `streak` object. `GetProgress`
returns `confidencePointsBalance`, the same shared `streak` object (backed by
one `gamification` call — Home and Progress cannot disagree), and a bounded
7-day `completionHistory`, with no unbounded pagination. Unauthenticated →
401; a resource owned by another user is never reachable (both reads are
implicitly self-scoped, no ID parameter exists to enumerate).

## VOC-030-AC-07 — Home/Progress frontend wiring and cross-capability consistency

- Requirement source: `VOC-030-D00`, DOC-08, VOC-019, VOC-020, VOC-027-D05
- Tasks: `VOC-030-T05`
- Tests: `VOC-030-TEST-26`..`VOC-030-TEST-29`
- Evidence: `VOC-030-EV-26`..`VOC-030-EV-29`
- Result: pending

`MOCK_HOME_STATE`'s `missionTargetWords`/`reviewedWordsToday`/
`currentStreakDays` and `MOCK_PROGRESS_STATE`'s
`confidencePointsTotal`/`currentStreakDays`/`longestStreakDays`/
`completionHistory` are retired and replaced with real
`GET /api/v1/daily-mission` / `GET /api/v1/progress` calls via
`@vocanova/api-client` under the A1 session; the P2-wired `dueReviewWords`
field (`VOC-027-D05`) is unchanged. Home's mission progress bar and streak
figure and Progress's streak figures always agree because both derive from the
same backend `streak` object. No client DB access or duplicated authorization.
Loading, empty (day-one learner with no snapshot yet), and error states are
handled without a client-side fabricated fallback value.

## VOC-030-AC-08 — Duplicate/failed/unauthorized actions can't create false progress

- Requirement source: `VOC-030-D00`, DOC-12 §5 P4 gate (exact wording)
- Tasks: `VOC-030-T01`..`VOC-030-T04`
- Tests: `VOC-030-TEST-30`..`VOC-030-TEST-33`
- Evidence: `VOC-030-EV-30`..`VOC-030-EV-33`
- Result: pending

Direct verification of the P4 gate's own safety wording, spanning all three
wired transactions and both new reads: (a) a retried/duplicated word-add,
review submission, or sentence-feedback request awards no second reward and
double-counts no mission/activity counter, relying on each module's own
existing idempotency guard plus the ledger's per-source-event idempotency key
as a second, independent line of defense; (b) a failed validation, a safety
block, a provider failure, or any attempt that never reaches a
success/`succeeded` state awards nothing and updates no counter; (c) an
unauthenticated or cross-user request never reaches a reward-granting code
path, because every reward/mission/streak write lives strictly inside an
already-authorized P1/P2/P3 transaction and no new write endpoint is added by
this package.

## VOC-030-AC-09 — Evidence, observability, staging, rollback, and P4 gate readiness

- Requirement source: `VOC-030-D00`, DOC-12 §5 P4
- Tasks: `VOC-030-T00`..`VOC-030-T06`
- Tests: `VOC-030-TEST-34`..`VOC-030-TEST-37`
- Evidence: `VOC-030-EV-34`..`VOC-030-EV-37`
- Result: pending — in-repository evidence only; live staging blocked until F3 exists

Applicable checks, the deterministic domain/migration/transaction/contract
tests this package adds, exact-SHA reviews, and the extended mock-inventory
test pass; mock-inventory verifies no P5 route/table/behavior was invented and
no P4-pending mock is left presented as real. Staging tests for
save→review→submit-sentence→mission-completes→streak-advances→progress-reads,
cross-user denial, and the new-tables rollback rehearsal are documented and
ready to run once F3 staging exists (`VOC-030-DEP-02`). This enables — but
does not itself declare — the DOC-12 P4 gate evaluation; the milestone gate is
not satisfied by package merge or staging deploy alone, and `D01`–`D05` must
be resolved before the affected tasks' evidence can be treated as final.
