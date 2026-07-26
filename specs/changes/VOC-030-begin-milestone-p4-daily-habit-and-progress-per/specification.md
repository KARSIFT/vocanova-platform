# VOC-030 — Begin Milestone P4: Daily Habit and Progress: Specification

## Objective and requirement source

Deliver the DOC-12 §5 P4 gate: daily missions, streak rules, progress
aggregates, the Home dashboard, and cross-capability consistency turn the
isolated P1 (save), P2 (review), and P3 (sentence + AI feedback) actions into
one daily habit, so that **missions accurately reflect completed behavior,
progress is understandable, and duplicate/failed/unauthorized actions can't
create false progress.** This package creates the `missions` and
`gamification` business modules (DOC-06 §3) and their persistence
(`daily_mission_snapshots`, `daily_activity_summaries`,
`confidence_point_ledger`, `streak_states`, `grace_day_ledger` — DOC-05
§§10,12), wires the reward configuration (DOC-06 §11) into the existing P1
word-addition, P2 review-submission, and P3 AI-feedback-orchestration
transactions (replacing the P3 `StubMissionUpdater` with a real
implementation), adds the `GET /api/v1/daily-mission` and
`GET /api/v1/progress` read APIs (DOC-07), and wires the Home and Progress
screens to that real data (DOC-08), retiring the remaining P4-pending mocks.
Authority: DOC-12 §5 (P4 paragraph), DOC-00 §3 (gamification model), DOC-05
§§4,6,10,12,18 (timezone strategy, `user_settings`, mission/activity/ledger
tables, migration order), DOC-06 §§10,11,13 (mission-snapshot creation, reward
values, timezone resolution), DOC-07 (API surface), DOC-08 (Home/Progress UX),
and the supplied request. The A1 auth/requester context (VOC-025), P1
`content`/`learning` foundation (VOC-026), P2 `reviews` module +
`review_attempts` history (VOC-027), and P3 `aifeedback` module +
`learner_sentences`/`ai_feedback_attempts` history (VOC-028) carry forward
unchanged except at the specific transaction points this package extends.

## Scope and non-goals

In scope:

1. **`missions` and `gamification` business modules** (DOC-06 §3) — each
   exposes transaction-scoped functions callable from *inside* a caller's
   existing `*sql.Tx`, never opening their own transaction, so the P1/P2/P3
   callers' single-transaction requirement (DOC-05 §15) is preserved when they
   call into `missions`/`gamification`. `gamification` owns
   `confidence_point_ledger`, `streak_states`, `grace_day_ledger`, the reward
   configuration (DOC-06 §11), and the streak/grace-day domain logic.
   `missions` owns `daily_mission_snapshots`, `daily_activity_summaries`, the
   lazy per-user-per-local-date snapshot creation, and the real
   `MissionUpdater` implementation the `aifeedback` module already declares an
   interface seam for.
2. **New tables and their migrations** (DOC-05 §§10,12,18 — added after
   `ai_feedback_attempts`, the last table any prior milestone created; DOC-05
   §18's canonical from-scratch ordering is a logical dependency order, not a
   mandate to reorder migrations already applied by VOC-026/027/028):
   - `daily_mission_snapshots`: `user_id`, `local_date`, `timezone` (copied
     from the resolved effective timezone at creation, DOC-05 §4),
     `review_target integer` (5–100), `reviews_completed integer` (`<=`
     `review_target`), optional `new_word_target`/`new_words_completed`,
     optional `sentence_practice_target`/`sentence_practices_completed`,
     `policy_version text` (starts at `p4-mission-policy-v1`), `status`
     (`open`/`completed`/`missed`/`protected`), `completed_at` (required when
     `status='completed'`), `grace_applied boolean`, `grace_day_id`. Unique on
     `(user_id, local_date)`.
   - `daily_activity_summaries`: `user_id`, `local_date`, `timezone`, counters
     `reviews_attempted/_correct/_skipped`, `words_discovered/_added`,
     `sentences_submitted`, `ai_feedback_received`,
     `confidence_points_earned/_spent`. Unique on `(user_id, local_date)`. A
     fast aggregate for Home/streak/Progress reads — `review_attempts`,
     `learner_sentences`, `ai_feedback_attempts`, and
     `confidence_point_ledger` remain the record of truth.
   - `confidence_point_ledger`: append-only, `amount integer` (nonzero, may be
     negative), `balance_after`, `reason`, `source_type`, `source_id`,
     `idempotency_key`, `metadata jsonb`, `occurred_at`. Unique on
     `(user_id, idempotency_key) where idempotency_key is not null`. The
     `reason`/`source_type` enum gap versus DOC-06 §11 is `VOC-030-D02` below
     — not silently resolved.
   - `streak_states`: one row per user (unique), `current_streak_count`,
     `longest_streak_count` (check `>=` current), `last_completed_local_date`,
     `last_activity_local_date`, `timezone`, `status`
     (`active`/`at_risk`/`broken`).
   - `grace_day_ledger`: append-only, `amount` (nonzero), `balance_after`,
     `reason`
     (`earned_by_streak`/`manual_grant`/`used_for_missed_day`/`expired`/`admin_adjustment`),
     `source_type` (`daily_mission`/`streak`/`admin`), `applied_to_local_date`,
     `timezone`, `idempotency_key`. Same idempotency pattern as the point
     ledger.
   - `user_settings` (DOC-05 §6, `VOC-030-D01`): one row per user,
     `timezone text default 'UTC'`, `daily_review_target integer default 20`
     (check 5–100), `review_interval_preset text default 'vocanova_default'`,
     `notifications_enabled`, `marketing_emails_enabled`,
     `app_language default 'en'` — the full DOC-05 §6 shape is created (schema
     completeness with the approved design), but this package reads/writes
     only `timezone` and `daily_review_target`; no public Settings API/UI is
     built. Rows are created lazily on first use with schema defaults, mirroring
     the DOC-06 §10 lazy-snapshot-creation pattern.
3. **Pure, unit-tested domain logic**, no Huma/chi, no direct Ent writes inside
   the domain functions themselves (mirrors the P2 `scheduling.go` pattern):
   - **Timezone/target resolution** (DOC-06 §13, adapted per `VOC-030-D01`
     because `user_onboarding_profiles` has no data source yet): read
     `user_settings.timezone`/`daily_review_target` if the row's values are
     non-default →, else a request-time client-supplied IANA timezone → else
     UTC / the DOC-05 §6 default of 20.
   - **Streak reconciliation**, computed at read/write time from
     `daily_mission_snapshots` (DOC-05 §12: "Backend calculates transitions
     from `daily_mission_snapshots`" — there is no queue system in MVP, DOC-06
     §15, so this cannot be a scheduled job): comparing `streak_states`'
     `last_completed_local_date` to "today" (in the resolved timezone) at
     every mission read or mission-completion write —
     (a) today already completed → no-op; (b) yesterday completed → today's
     completion advances the streak by one; (c) yesterday missed and a grace
     day is available and unused → consume one `grace_day_ledger` entry
     (`used_for_missed_day`), mark yesterday's snapshot `status='protected'`,
     `grace_applied=true`, and the streak continues uninterrupted; (d)
     yesterday missed with no grace day available, or two or more days missed
     → `current_streak_count` resets to 0, `status='broken'`. A grace day is
     earned (`earned_by_streak`) every 7 *completed* days, capped at a balance
     of 2 (DOC-00 §3, DOC-06 §11).
   - **Reward configuration** (DOC-06 §11, exact values): Add word +2, Review
     Again +1 / Hard +2 / Good +5 / Easy +6, Daily mission complete +10,
     Sentence submitted +3, AI feedback received +2. Values live in backend
     config, not a DB constraint (DOC-05 §12).
   - **Per-source-event idempotency keys** for every point/grace-day ledger
     insert, deterministic from the triggering row's own ID (e.g.
     `user_word:<id>:added`, `review_attempt:<id>:rated`,
     `learner_sentence:<id>:submitted`, `ai_feedback_attempt:<id>:received`,
     `daily_mission:<user_id>:<local_date>:completed`,
     `streak:<user_id>:<local_date>:grace_day_earned`) so a retried or
     re-entered transaction can never award the same reward twice — this is
     the primary mechanism satisfying the DOC-12 §5 "duplicate ... actions
     can't create false progress" gate requirement.
4. **Wiring real mission/activity/point/streak updates into the three existing
   write transactions**, each inside the caller's own existing transaction
   (never a new/separate write, never held open across an external call):
   - P1 word addition (`apps/api/business/learning/postgres.go`, the `INSERT
     INTO user_words` transaction): add the daily-activity
     `words_added` counter, the mission's optional `new_words_completed`
     counter (only if `D03` activates that optional goal), and the `+2`
     word-add point award, once per successfully inserted `user_words` row.
   - P2 review submission (`apps/api/business/reviews/postgres.go`, the
     transaction that currently commits after updating `user_words` — see
     `VOC-027-DEP-*`, whose own scope explicitly excluded these steps "those
     tables do not exist yet"): add the daily-activity review counters, the
     mission's `reviews_completed` counter, the rating-tiered point award
     (Again/Hard/Good/Easy), the streak reconciliation, and — when the
     review-target (and any active optional targets) are met for the first
     time that local day — the daily-mission-completion transition
     (`status='completed'`, `completed_at`, `+10` points, streak advance).
   - P3 AI-feedback orchestration (`apps/api/business/aifeedback/service.go`
     line 294 `s.mission.Update(...)`, `apps/api/business/aifeedback/mission.go`):
     implement a real `MissionUpdater` in the new `missions` module and wire it
     in place of `NewStubMissionUpdater()`, so `missionCompleted` finally
     reflects reality instead of always `false`. Add the sentence-submitted
     (`+3`) and AI-feedback-received (`+2`) point awards and the optional
     `sentence_practices_completed` mission counter (only if `D03`
     activates it), following the DOC-05 §15 pending-row workflow already
     established by P3 — the reward/mission update happens in the **same**
     post-provider-call update step that marks the attempt
     `succeeded`/sentence `feedback_ready`, never inside the pending-row phase
     and never for `failed`/`cancelled` attempts or blocked/self-harm safety
     outcomes (VOC-028-AC-06).
5. **`GET /api/v1/daily-mission`** (DOC-07): requester-scoped read returning
   today's snapshot — `localDate`, `timezone`, `reviewTarget`,
   `reviewsCompleted`, optional `newWordTarget`/`newWordsCompleted`, optional
   `sentencePracticeTarget`/`sentencePracticesCompleted`, `status`,
   `completedAt`, `policyVersion`, and a shared `streak` object
   (`currentStreakCount`, `longestStreakCount`, `status`,
   `graceDayBalance`). Lazily creates today's snapshot on first read of a new
   local day if one doesn't exist yet (DOC-06 §10).
6. **`GET /api/v1/progress`** (DOC-07): requester-scoped read returning
   `confidencePointsBalance` (the ledger's running balance, not recomputed by
   summing on every request), the same shared `streak` object as
   `GET /api/v1/daily-mission` (both backed by one `gamification` call, so Home
   and Progress can never disagree), and a bounded `completionHistory`: the
   learner's last 7 local calendar days, each with `localDate` and a
   `completed` boolean sourced from `daily_mission_snapshots.status`. No
   generic pagination is introduced for this bounded, UI-sized read (DOC-07
   "avoid unnecessary MVP complexity").
7. **Home and Progress screen wiring**: retire `MOCK_HOME_STATE`'s
   `missionTargetWords`/`reviewedWordsToday`/`currentStreakDays` (Home calls
   `GET /api/v1/daily-mission`, unchanged due-review-count wiring from
   `VOC-027-D05` stays as is) and `MOCK_PROGRESS_STATE`'s
   `confidencePointsTotal`/`currentStreakDays`/`longestStreakDays`/
   `completionHistory` (Progress calls `GET /api/v1/progress`, deriving each
   day-of-week label from the returned `localDate`). Cross-capability
   consistency is structural, not a UI convention: Home and Progress read the
   same backend streak source, and Home's mission progress reads the same
   `daily_mission_snapshots` row the P2/P3 transactions just updated.
8. **Duplicate/failed/unauthorized-safety verification** (the DOC-12 §5 P4
   gate's own wording): dedicated tests proving that (a) a retried/duplicated
   review submission, word addition, or sentence-feedback request — already
   guarded by each module's own idempotency key — cannot award a second
   reward or double-count a mission counter; (b) a failed or still-pending
   action (validation rejection, safety block, provider failure, an AI
   feedback attempt that never reaches `succeeded`) awards nothing and updates
   no counter; (c) an unauthenticated, cross-user, or otherwise unauthorized
   request never reaches a reward-granting code path, because every
   reward/mission update happens strictly inside the already-authorized P1/P2/P3
   transaction, never through a separately reachable endpoint.
9. Reconcile mock fields touched by P4 (item 7 above), extend the
   deterministic mock-inventory check, collect staging evidence, rollback
   rehearsal, and P4 gate readiness.

Out of scope (do not invent): a general Settings screen/API beyond the minimal
`user_settings` row this package needs (`D01`); onboarding-profile capture
(`user_onboarding_profiles`); leaderboards, badges, social challenges, rewards
store (DOC-12 §10); retroactive point/mission/streak credit for pre-activation
P1–P3 activity (`D05`); P5 cross-feature reliability/accessibility/performance
polish; revisiting A1/P1/P2/P3 mechanics beyond the three specific transaction
points listed above; production deployment; real secrets.

## Risk and protected areas

Proposed **R3** — not a determination. Protected paths: `/apps/api/migrations`
and `/apps/api/ent/schema` (five new tables plus `user_settings` — R3 path
floor), the new `/apps/api/business/missions` and
`/apps/api/business/gamification` modules (first-party reward/streak
correctness, false-progress prevention), and — distinctly — the **existing**
`/apps/api/business/learning`, `/apps/api/business/reviews`, and
`/apps/api/business/aifeedback` write transactions this package modifies:
those paths were each independently reviewed and accepted under VOC-026/027/028
and now receive new writes inside their existing transaction boundary, so a
mistake here can corrupt an already-shipped, already-relied-upon flow, not just
a new one. Under A-003, routine R3 needs strengthened controls and exact-SHA
independent verification, not standing steward/founder approval solely for
being R3; R4 founder authority is unchanged. `D01`–`D05` below are **open**
product/scope/schema decisions that become R4 once decided. This draft does
not decide them and does not modify any P1/P2/P3 write path itself.

## Decisions, contradictions, security, and privacy

`VOC-030-D00` — **Carry-forward confirmation (confirmed at draft time,
2026-07-26).** Direct inspection of `apps/api/ent/schema/`,
`apps/api/migrations/`, and `apps/api/business/` confirms: the A1
auth/session/requester-context, the P1 `content`/`learning` modules and
`canonical_words`/`word_meanings`/`word_examples`/`usage_notes`/`user_words`
tables, the P2 `reviews` module + `review_attempts` table, and the P3
`aifeedback` module + `learner_sentences`/`ai_feedback_attempts` tables all
exist and match their respective packages' descriptions. The P3
`MissionUpdater`/`StubMissionUpdater` seam at
`apps/api/business/aifeedback/mission.go` exists exactly as VOC-028-D01
described: `s.mission.Update(...)` is called once, after successful
persistence, and always returns `false, nil` today. Confirmed **not** to
exist: `daily_mission_snapshots`, `daily_activity_summaries`,
`confidence_point_ledger`, `streak_states`, `grace_day_ledger` (DOC-05
§§10,12), and — a finding beyond what VOC-028-D00 checked — `user_settings`
and `user_onboarding_profiles` (DOC-05 §6) also do not exist; no prior
milestone captured onboarding answers or built a Settings surface, and DOC-12's
milestone roadmap (§3) has no dedicated Settings milestone. No A1/P1/P2/P3
mechanic is re-litigated by this draft; the three write-transaction changes
below are additive within each transaction's existing boundary.

`VOC-030-D01` — **OPEN founder decision.** `user_settings` (DOC-05 §6) does
not exist, and P4 cannot compute a timezone-aware, per-learner-configurable
daily mission without a timezone and a review-target source. This draft
proposes: create the full DOC-05 §6 `user_settings` table now (schema-complete
with the approved design) but read/write only `timezone` and
`daily_review_target`; build no public Settings API or UI (that remains a
separate, future package's scope, since DOC-12 has no milestone that currently
owns it); resolve timezone as `user_settings.timezone` → a request-time
client-supplied IANA timezone → UTC fallback — a documented adaptation of the
DOC-06 §13 priority chain, since the "onboarding answer" step has no data
source until `user_onboarding_profiles` exists. **Not decided by this draft.**
An alternative the founder may prefer: skip persistence entirely and resolve
timezone purely per-request (client-supplied → UTC) with a hardcoded
`daily_review_target` of 20 for every learner until a real Settings package
exists — smaller surface, but forecloses any near-term per-learner
customization and diverges further from the approved DOC-05 §6 design.

`VOC-030-D02` — **OPEN contradiction, not resolved by this draft.** DOC-05
§12's `confidence_point_ledger.reason` enum
(`review_correct`/`daily_mission_completed`/`sentence_submitted`/
`ai_feedback_received`/`streak_bonus`/`admin_adjustment`) and `source_type`
enum (`review_attempt`/`daily_mission`/`learner_sentence`/
`ai_feedback_attempt`/`streak`/`admin`) have no value for the DOC-06 §11 "Add
word: +2" reward, and label all four review-rating point tiers with the single
`review_correct` reason even though DOC-06 §11 still prices "Review — Again:
+1" despite `Again` being the *incorrect*-rating case. Per DOC-12 §11's
change-control rule, this is a genuine conflict between two approved
documents and is recorded here, not silently resolved. Proposed minimal
reconciliation for the founder to accept or redirect: add `word_added` to
`reason` and `user_word` to `source_type` (closes the blocking gap — without
it, word-add point awards have no valid `reason` value to write); keep
`review_correct` as the shared reason across all four review-rating awards,
which is a non-blocking naming mismatch (data is still correctly attributable
via `source_type='review_attempt'` and the ledger's own `amount`) that a future
package may rename without a schema break.

`VOC-030-D03` — **OPEN founder decision.** DOC-05 §10 defines the optional
`new_word_target`/`new_words_completed` and
`sentence_practice_target`/`sentence_practices_completed` mission counters as
**bonus goals that do not block core mission or streak completion unless a
later, versioned policy explicitly changes that rule.** This draft proposes
leaving both optional goals **disabled** (null) for the initial P4 activation
— only the review target gates mission and streak completion — because
enabling them adds cross-module coupling surface (P1 word-add and P3
sentence-submission would each need to know their contribution toward the
same daily snapshot) without being required by the DOC-12 §5 P4 gate wording.
**Not decided by this draft**; if the founder wants either bonus goal active
at launch, `policy_version` should advance from `p4-mission-policy-v1`
accordingly.

`VOC-030-D04` — **OPEN founder decision.** Grace-day consumption: this draft
proposes **fully automatic** application when a grace day is available and a
day was missed (no learner action, no confirmation prompt) — matching DOC-00
§3's "gentle reset" framing and the ledger's own earned/used semantics, which
describe no UI trigger. An alternative is a learner-facing "use a grace day?"
confirmation before the streak is protected. **Not decided by this draft.**

`VOC-030-D05` — **OPEN founder decision.** Confidence Points, mission
snapshots, and streak state start **clean at this package's activation** — no
retroactive backfill for P1/P2/P3 actions (saved words, reviews, sentences)
that occurred before the migration lands, including any pre-existing staging
or internal test-account activity. This draft proposes no backfill: the ledger
is append-only and represents real-time events, and fabricating historical
entries for actions that predate reward wiring would misrepresent both the
ledger and the streak/mission gate's own "accurately reflect completed
behavior" requirement. **Not decided by this draft.**

`VOC-030-D06` (reserved) — the composite record of `D01`–`D05` above is
recorded only at adoption, once the founder has actually resolved them; this
draft does not pre-fill it.

### Security and privacy

`daily_mission_snapshots`, `daily_activity_summaries`, `confidence_point_ledger`,
`streak_states`, `grace_day_ledger`, and `user_settings` are all
requester-owned personal state: minimize, requester-scoped, never expose
another learner's mission/streak/point/settings data, and return 404 (not 403)
for any owner mismatch, consistent with A1/P1/P2/P3. `user_settings.timezone`
is the first field this package persists that is derived from client-supplied
input (the request-time IANA timezone fallback in `D01`) — validate it against
the IANA timezone database before storing or using it in daily-date math;
reject unrecognized values rather than silently defaulting, so a malformed
client value can't corrupt another day's boundary calculation. No new
cross-user write surface is introduced: every reward/mission/streak write
happens inside the already-authenticated, already-CSRF/idempotency-protected
P1/P2/P3 transactions, never through a new public write endpoint (the two new
routes in scope, `GET /api/v1/daily-mission` and `GET /api/v1/progress`, are
both reads). No secret, credential, or provider detail is introduced by this
package.

## Data, migrations, analytics, and accessibility

Migrations: reviewed versioned Atlas SQL, added after `ai_feedback_attempts`
(the last table any prior milestone created), following the DOC-05 §18
dependency ordering logically even though it cannot be physically reordered
against already-applied migrations. No `ON DELETE CASCADE` onto
`confidence_point_ledger` or `grace_day_ledger` (DOC-05 §16 — immutable
history during the active-account lifecycle); `daily_mission_snapshots`,
`daily_activity_summaries`, `streak_states`, and `user_settings` are
deletion-dependent per DOC-05 §16 (retain only if de-identified and
unlinkable, otherwise delete — owned by the future account-deletion work, not
built here). Migration tests assert the new FKs, unique constraints (one
snapshot/activity-summary per user per local date, one streak-state row per
user), check constraints (`review_target` 5–100, `longest_streak_count >=
current_streak_count`, nonzero ledger amounts), and that no existing
A1/P1/P2/P3 table or constraint is altered. Analytics: `daily_activity_summaries`
and the ledgers are aggregate/structured counters, not free text — no learner
sentence or feedback content is duplicated into them; metrics grouped by
mission/streak status and reward reason only. Accessibility is material for
T05's Home/Progress wiring: labelled progress indicators (non-color-only
mission/streak state), visible focus, keyboard reachability, mobile layout,
and sensible loading/empty/error states for both new reads; absent automation
recorded honestly as a limitation, never a pass.
