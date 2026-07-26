# VOC-030 — Test Plan

No test, fixture, seed file, OpenAPI example, or evidence may contain a real
secret, production URL/data, another learner's personal content, or a raw
session/CSRF token. Discover installed commands at the adopted base; a
missing integration, staging credential, open decision (`VOC-030-DEP-02`
through `DEP-04`), or browser tool is never reported as a pass — it is a
recorded limitation or blocker.

## VOC-030-TEST-00 — New-table migration invariants
- Covers: `VOC-030-AC-00`; Preconditions: T00, disposable PostgreSQL.
- Procedure: apply the T00 migration and assert FKs, uniqueness
  (`(user_id, local_date)` on both `daily_mission_snapshots` and
  `daily_activity_summaries`; one `streak_states` row per user; ledger
  idempotency-key uniqueness), check constraints (`review_target` 5–100,
  `longest_streak_count >= current_streak_count`, nonzero ledger amounts), and
  no `ON DELETE CASCADE` onto either ledger.
- Expected result: migration and constraints pass; production startup does not
  migrate. Evidence: `VOC-030-EV-00`.

## VOC-030-TEST-01 — Migration compatibility and no A1/P1/P2/P3 regression
- Covers: `VOC-030-AC-00`; Preconditions: T00.
- Procedure: run the adopted migration validation and disposable
  forward/recovery rehearsal against an existing VOC-028 DB; assert
  `users`/`external_identities`/`canonical_words`/`word_meanings`/
  `user_words`/`review_attempts`/`learner_sentences`/`ai_feedback_attempts`
  schemas are byte-for-byte unchanged.
- Expected result: recoverable migration; no prior-milestone schema regression.
  Evidence: `VOC-030-EV-01`.

## VOC-030-TEST-02 — `user_settings` lazy creation and resolution chain (`D01`)
- Covers: `VOC-030-AC-01`; Preconditions: T00, `D01` resolved.
- Procedure: read timezone/target resolution for a user with no
  `user_settings` row (assert lazy creation with schema defaults), a user with
  a stored non-default `timezone`/`daily_review_target` (assert those values
  win), and a request supplying a client timezone with no stored row (assert
  the client value is used and validated).
- Expected result: resolution chain matches the adopted `D01` order. Evidence:
  `VOC-030-EV-02`.

## VOC-030-TEST-03 — Invalid client-supplied timezone rejected
- Covers: `VOC-030-AC-01`, `VOC-030-R02`; Preconditions: T00.
- Procedure: supply a non-IANA timezone string and assert it is rejected
  (falls back to UTC or a stable error, per the adopted design) rather than
  silently stored or used in date-boundary math.
- Expected result: invalid timezone never corrupts local-date computation.
  Evidence: `VOC-030-EV-03`.

## VOC-030-TEST-04 — Reward configuration matches DOC-06 §11 exactly
- Covers: `VOC-030-AC-02`; Preconditions: T00.
- Procedure: assert the pure reward function returns +2/+1/+2/+5/+6/+10/+3/+2
  for add-word / review-Again / review-Hard / review-Good / review-Easy /
  mission-complete / sentence-submitted / AI-feedback-received respectively.
- Expected result: values match DOC-06 §11 exactly. Evidence: `VOC-030-EV-04`.

## VOC-030-TEST-05 — Streak reconciliation: advance, protect, and break
- Covers: `VOC-030-AC-02`; Preconditions: T00.
- Procedure: drive the pure streak function through: today-already-completed
  (no-op), yesterday-completed (advance by one), yesterday-missed with an
  available grace day (protect, `grace_day_ledger` entry, snapshot
  `status='protected'`), and yesterday-missed with no grace day or a
  two-plus-day gap (reset to 0, `status='broken'`).
- Expected result: all four transitions match specification.md's algorithm.
  Evidence: `VOC-030-EV-05`.

## VOC-030-TEST-06 — Grace-day earn/cap rule
- Covers: `VOC-030-AC-02`; Preconditions: T00.
- Procedure: simulate 7, 14, and 21 consecutive completed days and assert a
  grace day is earned every 7th, capped at a balance of 2 (the 21st-day earn
  attempt is a no-op once the cap is already held).
- Expected result: earn-every-7/cap-2 rule holds. Evidence: `VOC-030-EV-06`.

## VOC-030-TEST-07 — Per-source-event idempotency-key derivation is deterministic
- Covers: `VOC-030-AC-02`; Preconditions: T00.
- Procedure: derive the ledger idempotency key twice for the same source
  event (same `user_words`/`review_attempts`/`learner_sentences`/
  `ai_feedback_attempts` row ID) and assert identical keys; derive for two
  different source rows and assert distinct keys.
- Expected result: deterministic, collision-free derivation. Evidence:
  `VOC-030-EV-07`.

## VOC-030-TEST-08 — `missions`/`gamification` are transaction-scoped (no own-transaction opens)
- Covers: `VOC-030-AC-02`, `VOC-030-R07`; Preconditions: T00.
- Procedure: assert the exported `missions`/`gamification` functions accept an
  existing `*sql.Tx` parameter and never call `Begin()`/open a new connection
  transaction themselves (static/code-shape assertion or a test double that
  fails the test if a second transaction is opened).
- Expected result: no cross-module transaction violation. Evidence:
  `VOC-030-EV-08`.

## VOC-030-TEST-09 — Word-add reward: happy path and exactly-once
- Covers: `VOC-030-AC-03`; Preconditions: T01.
- Procedure: add a word and assert exactly one `+2` ledger entry; re-add the
  same word (idempotent per P1's own dedup) and assert no second entry.
- Expected result: exactly-once reward. Evidence: `VOC-030-EV-09`.

## VOC-030-TEST-10 — Word-add: failed insert awards nothing
- Covers: `VOC-030-AC-03`, `VOC-030-AC-08`; Preconditions: T01.
- Procedure: force a failing word-addition (e.g. invalid meaning ID) and
  assert no ledger entry and no activity-counter change.
- Expected result: no reward on failure. Evidence: `VOC-030-EV-10`.

## VOC-030-TEST-11 — Pre-existing P1 behavior unchanged
- Covers: `VOC-030-AC-03`, `VOC-030-R01`; Preconditions: T01.
- Procedure: re-run the VOC-026 word-addition test suite (response shape,
  error cases, discovery-exclusion behavior) against the T01 code and assert
  no regression.
- Expected result: byte-for-byte unchanged P1 behavior. Evidence:
  `VOC-030-EV-11`.

## VOC-030-TEST-12 — Review reward: rating-tiered amounts and exactly-once
- Covers: `VOC-030-AC-04`; Preconditions: T02.
- Procedure: submit Again/Hard/Good/Easy reviews and assert the corresponding
  +1/+2/+5/+6 ledger entries, each exactly once even under a replayed
  `client_attempt_id`.
- Expected result: correct amounts, exactly-once. Evidence: `VOC-030-EV-12`.

## VOC-030-TEST-13 — Mission-completion transition on target met
- Covers: `VOC-030-AC-04`; Preconditions: T02.
- Procedure: submit reviews until `reviews_completed` reaches
  `review_target`; assert the snapshot transitions to `status='completed'`,
  `completed_at` is set, a `+10` award is recorded, and the streak advances —
  all exactly once, with a subsequent review that local day not re-triggering
  completion.
- Expected result: single, correct completion transition. Evidence:
  `VOC-030-EV-13`.

## VOC-030-TEST-14 — Streak advance/protect/break driven from real review submissions
- Covers: `VOC-030-AC-04`; Preconditions: T02, `D04` resolved.
- Procedure: complete missions on consecutive days, skip a day with a grace
  day available (assert protection per the adopted `D04` mode), then skip
  two-plus days (assert break).
- Expected result: streak state matches `TEST-05`'s pure-function behavior
  when driven end-to-end. Evidence: `VOC-030-EV-14`.

## VOC-030-TEST-15 — Replayed submission never double-rewards or double-completes
- Covers: `VOC-030-AC-04`, `VOC-030-AC-08`; Preconditions: T02.
- Procedure: replay the same `client_attempt_id` after a completing
  submission and assert no second point award, no second mission-completion
  transition, and no second streak advance.
- Expected result: exactly-once end to end. Evidence: `VOC-030-EV-15`.

## VOC-030-TEST-16 — Pre-existing P2 behavior unchanged
- Covers: `VOC-030-AC-04`, `VOC-030-R01`; Preconditions: T02.
- Procedure: re-run the VOC-027 review-submission test suite (schedule
  transitions, idempotency, error cases, cross-user 404) against the T02 code
  and assert no regression.
- Expected result: byte-for-byte unchanged P2 behavior. Evidence:
  `VOC-030-EV-16`.

## VOC-030-TEST-17 — Real `MissionUpdater` replaces the stub
- Covers: `VOC-030-AC-05`; Preconditions: T03.
- Procedure: submit a mock-provider sentence-feedback flow to
  `succeeded`/`feedback_ready` and assert `missionCompleted` in the public
  result reflects a real backend decision (true when the mission actually
  completes, not an unconditional `false`).
- Expected result: stub fully replaced. Evidence: `VOC-030-EV-17`.

## VOC-030-TEST-18 — Sentence/AI-feedback rewards: exactly-once, only on success
- Covers: `VOC-030-AC-05`; Preconditions: T03.
- Procedure: assert exactly one `+3` and one `+2` award on a successful
  attempt; assert a `pending`, `failed`, or `cancelled` attempt status awards
  neither.
- Expected result: rewards gated on success only, exactly once. Evidence:
  `VOC-030-EV-18`.

## VOC-030-TEST-19 — Blocked/self-harm outcomes trigger no reward or mission update
- Covers: `VOC-030-AC-05`, `VOC-030-AC-08`; Preconditions: T03.
- Procedure: drive a blocked and a self-harm-intervention outcome (per
  VOC-028-AC-06) through the T03 code and assert no ledger entry, no
  activity-counter change, and `missionCompleted=false`.
- Expected result: safety outcomes never create progress. Evidence:
  `VOC-030-EV-19`.

## VOC-030-TEST-20 — Pre-existing P3 behavior unchanged
- Covers: `VOC-030-AC-05`, `VOC-030-R01`; Preconditions: T03.
- Procedure: re-run the VOC-028 orchestration/safety/dedup/rate-limit test
  suite against the T03 code and assert no regression, and that the provider
  call is still never held inside a DB transaction.
- Expected result: byte-for-byte unchanged P3 behavior. Evidence:
  `VOC-030-EV-20`.

## VOC-030-TEST-21 — `GetDailyMission` contract and lazy creation
- Covers: `VOC-030-AC-06`; Preconditions: T04.
- Procedure: call `GET /api/v1/daily-mission` for a user with no snapshot yet
  (assert lazy creation with the resolved timezone/target) and for a user with
  an existing snapshot (assert it is returned unmodified except for
  reconciliation); assert response fields match specification.md item 5.
- Expected result: contract correct; lazy creation works. Evidence:
  `VOC-030-EV-21`.

## VOC-030-TEST-22 — `GetProgress` contract and shared streak object
- Covers: `VOC-030-AC-06`; Preconditions: T04.
- Procedure: call `GET /api/v1/progress` and assert
  `confidencePointsBalance`, `streak`, and a 7-entry `completionHistory` are
  present; assert the `streak` object is byte-identical to the one returned by
  `GetDailyMission` for the same user at the same instant.
- Expected result: contract correct; Home/Progress streak sources agree.
  Evidence: `VOC-030-EV-22`.

## VOC-030-TEST-23 — Authentication and self-scoping on both reads
- Covers: `VOC-030-AC-06`; Preconditions: T04.
- Procedure: call both endpoints unauthenticated (401); confirm neither
  endpoint accepts a caller-supplied user/ID parameter that could be used to
  enumerate another learner.
- Expected result: 401 unauthenticated; no cross-user parameter exists.
  Evidence: `VOC-030-EV-23`.

## VOC-030-TEST-24 — Confidence-points balance correctness
- Covers: `VOC-030-AC-06`; Preconditions: T04.
- Procedure: award a sequence of point events and assert
  `confidencePointsBalance` equals the ledger's running sum (`balance_after`
  of the latest entry), including a negative `admin_adjustment` case.
- Expected result: balance matches the ledger exactly. Evidence:
  `VOC-030-EV-24`.

## VOC-030-TEST-25 — Contract and OpenAPI drift (daily-mission, progress)
- Covers: `VOC-030-AC-06`; Preconditions: T04.
- Procedure: regenerate OpenAPI, run drift/golden checks, verify the matched
  client compiles, and that no Ent/internal type leaks through either DTO.
- Expected result: OpenAPI/client agree; no internal exposure. Evidence:
  `VOC-030-EV-25`.

## VOC-030-TEST-26 — Home wiring: mission progress bar and streak
- Covers: `VOC-030-AC-07`; Preconditions: T05.
- Procedure: render Home for a user with an in-progress mission and assert
  the progress bar/streak figure reflect the real `GetDailyMission` response,
  not `MOCK_HOME_STATE`.
- Expected result: `MOCK_HOME_STATE`'s three retired fields no longer drive
  the UI. Evidence: `VOC-030-EV-26`.

## VOC-030-TEST-27 — Progress wiring: points, streaks, completion history
- Covers: `VOC-030-AC-07`; Preconditions: T05.
- Procedure: render Progress for a user with mixed completion history and
  assert Confidence Points total, streak figures, and the 7-day completion
  strip reflect the real `GetProgress` response, with correct day-of-week
  labels derived from `localDate`.
- Expected result: `MOCK_PROGRESS_STATE`'s four retired fields no longer
  drive the UI. Evidence: `VOC-030-EV-27`.

## VOC-030-TEST-28 — Cross-capability consistency: Home and Progress agree
- Covers: `VOC-030-AC-07`; Preconditions: T05.
- Procedure: load Home and Progress for the same user in the same session and
  assert the displayed streak figures are identical (both trace to the one
  shared backend `streak` object).
- Expected result: no Home-vs-Progress disagreement. Evidence:
  `VOC-030-EV-28`.

## VOC-030-TEST-29 — Loading, day-one-empty, and error states
- Covers: `VOC-030-AC-07`; Preconditions: T05.
- Procedure: render Home/Progress for a brand-new learner with no snapshot or
  history yet, and simulate a backend error; assert no fabricated fallback
  value is shown and both states are accessible (non-color-only, labelled).
- Expected result: honest empty/error states. Evidence: `VOC-030-EV-29`.

## VOC-030-TEST-30 — Cross-cutting: duplicate actions across all three transactions
- Covers: `VOC-030-AC-08`; Preconditions: T01–T04.
- Procedure: replay a word-add, a review submission, and a sentence-feedback
  submission each twice (via their existing idempotency mechanisms) and
  assert zero duplicate ledger entries, zero double-counted mission/activity
  counters, and zero double mission completions across all three.
- Expected result: exactly-once across every wired action. Evidence:
  `VOC-030-EV-30`.

## VOC-030-TEST-31 — Cross-cutting: failed/incomplete actions across all three transactions
- Covers: `VOC-030-AC-08`; Preconditions: T01–T03.
- Procedure: force a failure/incomplete state in each of the three wired
  flows (invalid word-add, invalid review submission, AI-feedback validation
  failure/safety block) and assert none awards a reward or updates a
  mission/activity counter.
- Expected result: zero false progress from failure paths. Evidence:
  `VOC-030-EV-31`.

## VOC-030-TEST-32 — Cross-cutting: unauthorized/cross-user requests never reach a reward path
- Covers: `VOC-030-AC-08`; Preconditions: T01–T04.
- Procedure: attempt each of the three wired writes unauthenticated and as a
  cross-user request against another learner's resource, and attempt both new
  reads unauthenticated; assert 401/404 as appropriate and zero reward/mission
  side effects.
- Expected result: no unauthorized code path reaches a reward grant. Evidence:
  `VOC-030-EV-32`.

## VOC-030-TEST-33 — Multi-day-gap streak break surfaces correctly on read
- Covers: `VOC-030-AC-08`, `VOC-030-R06`; Preconditions: T04, T00.
- Procedure: complete a mission, then advance the clock (test double) by
  several days with no activity, then call `GET /api/v1/daily-mission`; assert
  the streak is reconciled to `broken`/0 on that read rather than showing a
  stale `active` status.
- Expected result: lazy reconciliation triggers correctly on read. Evidence:
  `VOC-030-EV-33`.

## VOC-030-TEST-34 — Installed deterministic and security suite
- Covers: `VOC-030-AC-09`; Preconditions: each PR complete.
- Procedure: run relevant `pnpm validate`/`pnpm test`/`pnpm build`, Go
  format/vet/test/build, web lint/typecheck/build/format,
  `scripts/governance/*` checks as applicable, and the extended
  mock-inventory check.
- Expected result: available checks pass; absent checks reported honestly.
  Evidence: `VOC-030-EV-34`.

## VOC-030-TEST-35 — Staging save→review→submit-sentence→mission-completes→progress-reads
- Covers: `VOC-030-AC-09`; Preconditions: F3 staging exists
  (`VOC-030-DEP-02`), `D01`–`D05` resolved, seeded content.
- Procedure: with non-production identities, save a word, submit reviews to
  meet the target, submit a sentence for feedback, and confirm the mission
  completes, the streak advances, and both `GetDailyMission`/`GetProgress`
  agree with what Home/Progress render.
- Expected result: P4 flow evidence recorded without production data.
  Evidence: `VOC-030-EV-35`.

## VOC-030-TEST-36 — New-tables rollback rehearsal
- Covers: `VOC-030-AC-09`; Preconditions: staged candidate, approved
  procedure.
- Procedure: rehearse non-production migration rollback for the six new
  tables; validate immutable committed `confidence_point_ledger`/
  `grace_day_ledger` rows are preserved, `daily_mission_snapshots`/
  `streak_states`/`user_settings` state is preserved, and the P1/P2/P3
  write paths continue to function (via the `StubMissionUpdater` fallback if
  `missions` itself is rolled back independently).
- Expected result: controlled recovery; no progress-history corruption; no
  P1/P2/P3 write-path outage. Evidence: `VOC-030-EV-36`.

## VOC-030-TEST-37 — Exact-SHA independent verification
- Covers: `VOC-030-AC-09`; Preconditions: each PR at its final SHA.
- Procedure: Claude Code binds to the exact final SHA per PR and verifies
  scope, the classifier floor, migration safety, no A1/P1/P2/P3 regression in
  each of `T01`–`T03`'s wired transaction, cross-module transaction discipline
  (`VOC-030-R07`), the duplicate/failed/unauthorized-safety guarantee with
  concrete evidence, requester scope on the two new reads, the `D01`/`D02`
  resolutions as actually implemented, contract/OpenAPI/client drift,
  accessibility of the Home/Progress wiring, staging/rollback evidence, and
  implementer separation; reports remaining R3/R4/adoption/activation gates.
- Expected result: `PASS` / `PASS WITH NON-BLOCKING FINDINGS` / `FAIL` with
  exact evidence; the implementer did not approve or merge its own work.
  Evidence: `VOC-030-EV-37`.
