# VOC-027 — Begin Milestone P2: Review Saved Words: Specification

## Objective and requirement source

Deliver the DOC-12 §5 P2 gate: the spaced-repetition review system end to end —
scheduling domain, due-queue, review session, response submission, and completion
— so that saved words enter the schedule, due words can be reviewed, responses
update the schedule exactly once, and learners get an accurate completion state.
This package activates the `user_words` scheduling fields VOC-026 deliberately
left at their schema defaults/null (`VOC-026-D04`), creates the `review_attempts`
immutable-history table, exposes the due-queue and review-submission APIs (DOC-07
Review system), and wires a review experience into the app under the A1 auth
shell. Authority: DOC-12 §5 (P2 paragraph), DOC-05 §§9,15, DOC-06 §10, DOC-07
(Review system; Idempotency; Security rules), and the supplied request.

## Scope and non-goals

In scope:
1. `review_attempts` persistence — one Ent schema file
   (`apps/api/ent/schema/reviewattempt.go`) + reviewed versioned Atlas migration
   per DOC-05 §9 constraints (immutable history, one row per submitted answer,
   `user_id`, `user_word_id`, `meaning_id`, `attempt_type`, `prompt_type`,
   `result`, `rating`, `review_step_before`/`_after` (0–7), `answered_at`,
   `response_time_ms`, `selected_option_meaning_id`, `typed_answer`,
   `was_hint_used`, `source`, `client_attempt_id`, `metadata jsonb`; partial unique
   on `(user_id, client_attempt_id) where client_attempt_id is not null` — the
   idempotency guard), following the DOC-05 §18 migration order
   (`user_words → review_attempts`).
2. The scheduling domain logic owned by the backend (DOC-06 §10): apply a
   `(result, rating)` to the prior `review_step` and compute the new step/next
   state — Again → step back with a floor of 0; two consecutive
   incorrect/Again attempts → reset to step 0; Hard → same step; Good/Easy →
   step forward with a cap of 7 — plus the `next_review_at` interval-to-step
   mapping (backend-owned), and the counters (`total_review_count`,
   `correct_review_count`, `consecutive_*_count`, `last_reviewed_at`,
   `last_result`, `last_rating`). Implemented as pure domain code (no Huma/chi,
   no Ent writes inside the domain function) exercised by unit tests, so the
   transaction layer in T02 can call it deterministically.
3. Requester-scoped due-queue read API `GET /api/v1/reviews/due` implementing
   the DOC-05 §9 due-word rule exactly — `status in ('new','learning',
   'reviewing') and deleted_at is null and (next_review_at is null or
   next_review_at <= now())` — keyed to the authenticated requester, with
   requester-scoped ownership (no cross-learner rows; 404/private-resource for
   any mismatch), explicit DTOs (never Ent models), cursor pagination, stable
   operation IDs, and the committed OpenAPI artifact.
4. Review submission write API `POST /api/v1/reviews/submissions` implementing
   **exactly** the DOC-05 §15 review-submission transaction, **minus** the
   daily-mission / point-ledger / streak steps (those tables do not exist yet —
   P4's job; do not invent them): lock the `user_words` row → validate ownership
   → idempotency check (`client_attempt_id`, user-scoped) → insert
   `review_attempts` (immutable) → update `user_words` (step, counters, last
   result, last rating, `next_review_at`) → commit. Required `Idempotency-Key`
   (user+operation-scoped, DOC-07) and `X-CSRF-Token` (DOC-07) on every
   submission. Idempotent on `(user_id, client_attempt_id)`; replay is safe and
   schedules exactly once; a reused key with a changed fingerprint returns 409
   (DOC-06 §9); the same key from a different user stays isolated.
5. Wire a review experience into the app — new route(s) as needed under the
   existing `(app)` auth shell — that lets a learner see due words, submit a
   response (CSRF + idempotent client method from T02), advance through the due
   queue, and see an accurate completion state (queue drained / words remaining).
   Prompt types are `multiple_choice` and `self_check` per DOC-05 §9 (the
   `typing`/`sentence_usage` superset is out of scope). The exact union/mix of
   prompt types built first and the review-session flow are founder decisions
   (`D03`/`D04`).
6. Reconcile the Home `dueReviewWords` P2-pending mock field with the now-real
   due-queue (per the adopted `D05` resolution), and collect the mock-decommission
   inventory, staging evidence, rollback rehearsal, and P2 gate readiness.

Out of scope (do not invent): sentence practice, AI feedback, moderation, prompt
provider, any P3 behavior; missions, streaks, Confidence Points,
daily-mission snapshots, daily-activity summaries, grace days, leaderboards, and
any P4 behavior — in particular do **not** add `next_review_at = now` on word-add
(P1 save behavior stays as `VOC-026-D04` left it: `next_review_at` null), do
**not** award Confidence Points on review, and do **not** create or touch
`daily_mission_snapshots` / `confidence_point_ledger` / `streak_states` /
`daily_activity_summaries` (none exist yet); `typing`/`sentence_usage` prompt
types; revisiting P1 word-addition (P1's `next_review_at = null` already satisfies
the DOC-05 due-word rule, so no P1 change is needed — see `D01`); onboarding/
profile/settings; account deletion; production deployment; real secrets; and any
invention not required to pass the P2 gate.

## Risk and protected areas

Proposed **R3** — not a determination. Protected paths: `/apps/api/migrations`
and `/apps/api/ent/schema` (data-integrity, immutable history, forward/backward
compatibility, recovery — R3 path floor), `/apps/api/business/reviews` (the first
learning-state-mutating workflow: requester-scoped owner writes, idempotency,
one-transaction scheduling update, immutable history, CSRF), and the committed
OpenAPI/client contract (drift). Under A-003, routine R3 needs strengthened
controls and exact-SHA independent verification, not standing steward/founder
approval solely for being R3; R4 founder authority is unchanged. Several
founder-level product/scope questions below (`D02`, `D03`, `D04`, `D05`) are
**open** and become R4 once decided; resolving them (the prompt-type contract
contradiction, the review-session UX/flow, the which-prompt-type-first choice, and
the zero-due-words / Home due-count wiring) is founder-controlled and is required
before the affected tasks proceed. This draft does not resolve them.

## Decisions, contradictions, security, and privacy

`VOC-027-D00` — **OPEN, adopted technical baseline (carry-forward).** P2 builds on
the VOC-025 A1 auth/session/requester-context (`Requester`/`RequesterUserID`),
`RequireAuth`, `CSRFMiddleware`, `AuthorizeOwner`, the user+operation-scoped
`Idempotency-Key` handling, and the OpenAPI generation/commit + matched
`@vocanova/api-client` pattern; and on the VOC-026 P1 `content`/`learning` modules,
`canonical_words`/`word_meanings`/`word_examples`/`usage_notes`/
`journey_situations`/`journey_words`/`user_words` tables, and the deterministic
seed. The same deny-by-default, requester-scoped, never-expose-Ent, explicit-DTO,
UTC/RFC3339, UUIDv7, `X-CSRF-Token` double-submit, `Idempotency-Key` user-scoped
rules apply. No auth/session mechanics or P1 content/save mechanics are
re-litigated here. Confirmed at draft time: `apps/api/ent/schema/userword.go`
already declares `review_step` (0–7), `next_review_at` (nullable),
`last_reviewed_at`, `last_result`, `last_rating`, `consecutive_correct_count`,
`consecutive_incorrect_count`, `total_review_count`, `correct_review_count`, and
indexes on `(user_id, status)` and `(user_id, next_review_at)` — so P2's schema
work is additive (`review_attempts`) only; no `user_words` schema change is in
scope.

`VOC-027-D01` — **RESOLVED at adoption (carry-forward, no action).** A word with a
null `next_review_at` (VOC-026's actual left-at-default state for every saved word)
is already due per DOC-05 §9's own due-word rule — `status in ('new','learning',
'reviewing') and (next_review_at is null or next_review_at <= now())`. P1's
word-addition behavior therefore already satisfies P2's scheduling entry point.
This package does **not** revisit `VOC-026-D04`, does **not** set
`next_review_at = now` on word-add, and does **not** change P1 save. Saved words
enter the schedule because they are saved with `next_review_at = null`, which is a
due state by definition. (Recorded as a resolution so the implementer does not
"fix" P1 by guessing.)

`VOC-027-D02` — **OPEN contradiction, naming/contract decision — founder or
delegated reviewer to settle at adoption.** DOC-05 §9 enumerates
`prompt_type` as `multiple_choice` / `self_check` / `typing` / `sentence_usage`
(MVP implements `multiple_choice` and `self_check` first), but DOC-07 §"Review
system" enumerates the initial MVP prompt types as `meaning_choice` /
`word_choice` / `self_check`. The two approved documents disagree on the
`multiple_choice`-vs-`meaning_choice`/`word_choice` names. The supplied request
directs `multiple_choice` and `self_check` only per DOC-05 §9. This package
proposes to adopt DOC-05 §9's `multiple_choice` + `self_check` as the
`prompt_type` enum values (and as the `review_attempts.prompt_type` check
constraint), and treat DOC-07's `meaning_choice`/`word_choice` as a draft-era
scription error to be reconciled at adoption — but **this is a contract
contradiction between two approved documents, not a naming taste choice**, so it
is flagged here, not silently resolved. If the founder prefers
`meaning_choice`/`word_choice`, the DTO/migration/tests in T00–T03 follow that
choice instead; either way DOC-07 must be reconciled with the adopted enum under
the DOC-12 §11 change-control rule (implementation convenience never overrides an
approved product decision; COD-07 is updated by decision, not by guessing) and
the superseded wording is retired via the canonical document process, not in this
package. T00–T03 may not proceed until `D02` is resolved.

`VOC-027-D03` — **OPEN founder product decision.** Which prompt types does P2
build first, and in what mix? `multiple_choice` and `self_check` are both MVP-per
DOC-05 §9, but the request explicitly leaves "which of multiple_choice/self_check
to build first if not both" as a founder decision. Building both doubles the
prompt-generation + grading surface for T02/T03; building one first is a smaller,
safer first learning-state-mutating PR. The package proposes — **not decides** —
to build `multiple_choice` first (it exercises the objective path: an incorrect
answer records `Again`; a correct answer permits Hard/Good/Easy) with `self_check`
either in the same T03 or a follow-up, and writes `D06` to record the founder's
choice at adoption. The affected AC/TEST are written against the proposed reading
and must be adjusted at adoption.

`VOC-027-D04` — **OPEN founder UX decision.** The exact review-session UI/flow —
single-card review vs. a list-then-review flow, whether to batch by situation, how
`response_time_ms` is measured client-side, whether to show step/interval to the
learner (DOC-05 hides the raw step behind a friendly interval), and how the
"accurate completion state" is presented (queue drained / words remaining today /
"you're all caught up") — is a founder product decision. This package proposes the
smallest flow that satisfies the P2 gate — a due-queue-driven single-card
reviewer with `multiple_choice` prompts, an explicit "you're all caught up" empty
state, and a per-session count of remaining due words — but does not decide it.
`D06` records the founder's resolution at adoption; T03 waits for it past the
proposal.

`VOC-027-D05` — **OPEN founder scope decision.** VOC-026's Home
`MOCK_HOME_STATE.dueReviewWords` was deliberately retained as
mock-pending-P2 (`VOC-026-D05`/`mock-inventory.md`). P2 now owns the real
due-count. Options: (a) wire `dueReviewWords` to `GET /api/v1/reviews/due` count
this milestone (small, in-scope-adjacent, completes the loop); (b) leave the mock
labelled mock-pending-P2 until a follow-up. T04's recommendation is (a) because
"saved words enter the schedule" · "due words can be reviewed" reads more coherently
when the Home due-count reflects the same due-queue. The other
`MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE` fields (mission target,
reviewed-today count, streak, Confidence Points, weekly completion history) stay
mock-pending-P4 — P4's job, explicitly **not** wired here. `D06` records the
founder's resolution.

### Security and privacy

`review_attempts` is learner-owned personal behavior history (what the learner
answered, how fast, which option) — personal data: minimize, requester-scoped,
never expose another learner's attempts, never log/analytics-identify answer
choices or response times. Submission is state-changing and schedule-mutating and
requires CSRF (`X-CSRF-Token`) and active auth; idempotency is required for
`POST /api/v1/reviews/submissions` (DOC-07) and scoped to the authenticated user
via `client_attempt_id`. Inaccessible or nonexistent owner resources return 404
(no enumeration of another learner's due words or attempts). Passwords, tokens,
OAuth, and session mechanics stay owned by A1. No real secrets or provider data
enter source. The scheduling domain logic must be unit-tested in pure form so a
transaction bug cannot double-apply a rating (which would corrupt the schedule);
the one-transaction submission must apply the schedule update exactly once even on
a replayed idempotency key.

## Data, migrations, analytics, and accessibility

Migrations: follow DOC-05 §18 order (`user_words → review_attempts`); reviewed
versioned Atlas SQL; forward/backward compatibility review; disposable PostgreSQL
rehearsal; explicit execution outside API startup; the `review_attempts` partial
unique index on `(user_id, client_attempt_id) where client_attempt_id is not null`
is the idempotency guard and must exist. No `ON DELETE CASCADE` onto
`review_attempts` or to `user_words` (DOC-05 §16 — immutable during active
lifecycle; accidental cascades could destroy learning history). Migration tests
assert the required unique/partial-unique indexes, FKs, check constraints
(`review_step_before`/`_after` 0–7, `prompt_type` in the adopted `D02` enum,
`result` in `correct`/`incorrect`/`skipped`, `rating` nullable-only-when-no-rating,
`client_attempt_id` partial uniqueness), idempotency double-submit safety,
two-consecutive-Again reset, step floor/cap, and the DOC-05 §20 cases in scope
(duplicate `client_attempt_id` doesn't duplicate an attempt; two consecutive
incorrect reviews reset `review_step` to 0). Analytics is excluded; review
answers/response-times are personal behavior data and must not be logged or
analytics-identified without a later privacy-reviewed change. Accessibility is
material for T03: the review card(s) must have labelled controls, visible focus,
semantic status for correct/incorrect non-color-only feedback, keyboard
reachability for the rating/submit control, mobile layout, and sensible
empty/loading/error/done states; absent automation is recorded honestly as a
limitation, never a pass.