# VOC-027 — Acceptance Criteria

Acceptance criteria are observable, stable, security-aware, and bidirectionally
traceable to requirements (`D00`–`D05`), tasks (`T00`–`T04`), tests
(`VOC-027-TEST-*`), and evidence. `D02` (prompt-type contract contradiction),
`D03` (which prompt type first), `D04` (review-session UX/flow), and `D05`
(Home due-count wiring) are open founder decisions; the affected criteria's exact
observable outcome is written against the draft's proposed resolution and must be
adjusted at adoption to the founder's resolution. `D06` records the adopted
resolutions.

## VOC-027-AC-00 — review_attempts persistence and migration integrity

- Requirement source: `VOC-027-D00`, DOC-05 §§9,15,18–20
- Tasks: `VOC-027-T00`
- Tests: `VOC-027-TEST-00`, `VOC-027-TEST-01`
- Evidence: `VOC-027-EV-00`, `VOC-027-EV-01`
- Result: pending

Ent/Atlas create `review_attempts` with the required FKs
(`user_id → users`, `user_word_id → user_words`, `meaning_id → word_meanings`),
partial-unique idempotency index on
`(user_id, client_attempt_id) where client_attempt_id is not null`, check
constraints (`review_step_before`/`_after` 0–7, `prompt_type` in the adopted `D02`
enum, `result` in `correct`/`incorrect`/`skipped`, `rating` nullable only when no
rating applies), and no `ON DELETE CASCADE` from `user_words`. Empty-db migration
and disposable recovery rehearsal preserve integrity; production migration never
runs at API startup. The `user_words` schema is **not** changed by this package.

## VOC-027-AC-01 — Scheduling domain applies the rating rules exactly once

- Requirement source: `VOC-027-D00`, DOC-05 §9, DOC-06 §10
- Tasks: `VOC-027-T00`
- Tests: `VOC-027-TEST-02`, `VOC-027-TEST-03`
- Evidence: `VOC-027-EV-02`, `VOC-027-EV-03`
- Result: pending

The pure scheduling domain function maps `(prior_review_step, result, rating)` to
`(new_review_step, next_review_at, counters)` exactly per DOC-06 §10: Again → step
back with floor 0; two consecutive incorrect/Again attempts → reset to 0; Hard →
same step; Good/Easy → step forward with cap 7; `correct_review_count <= total_
review_count`; `consecutive_correct_count`/`consecutive_incorrect_count` reset
appropriately; `last_result`/`last_rating`/`last_reviewed_at` updated. The backend
owns the interval-to-`next_review_at` mapping. The function is deterministic and
unit-tested for every branch incl. floors, caps, and the two-consecutive reset.

## VOC-027-AC-02 — Due-queue read API is correct, contract-consistent, and requester-scoped

- Requirement source: `VOC-027-D00`, `VOC-027-D01`, DOC-05 §9 (due-word rule), DOC-07
- Tasks: `VOC-027-T01`
- Tests: `VOC-027-TEST-04`..`VOC-027-TEST-07`, `VOC-027-TEST-12`
- Evidence: `VOC-027-EV-04`..`VOC-027-EV-07`, `VOC-027-EV-12`
- Result: pending

`GET /api/v1/reviews/due` returns explicit DTOs (never Ent models) for the
authenticated requester only, using the DOC-05 §9 due-word rule exactly
(`status in ('new','learning','reviewing') and deleted_at is null and
(next_review_at is null or next_review_at <= now())`). A saved-but-never-reviewed
word (`next_review_at` null, the `VOC-026-D04` state) is returned as due. Stable
operation ID, committed OpenAPI, cursor pagination, no cross-learner rows
(404/private-resource for any mismatch; no enumeration), unauthenticated → 401.

## VOC-027-AC-03 — Review submission updates the schedule exactly once, under idempotency and CSRF

- Requirement source: `VOC-027-D00`, DOC-05 §§9,15, DOC-06 §§8–10, DOC-07
- Tasks: `VOC-027-T02`
- Tests: `VOC-027-TEST-08`..`VOC-027-TEST-12`, `VOC-027-TEST-15`
- Evidence: `VOC-027-EV-08`..`VOC-027-EV-12`, `VOC-027-EV-15`
- Result: pending

`POST /api/v1/reviews/submissions` runs **exactly** the DOC-05 §15
review-submission transaction **minus** the daily-mission / point-ledger / streak
steps (which do not exist yet): lock `user_words` → validate ownership →
idempotency check on `(user_id, client_attempt_id)` → insert `review_attempts`
(immutable) → update `user_words` (step, counters, last result, last rating,
`next_review_at`) → commit. Requires `X-CSRF-Token` (invalid → 403) and user+
operation-scoped `Idempotency-Key` (DOC-07). Replaying the same
`client_attempt_id`/fingerprint is idempotent (no duplicate attempt, schedule
updated exactly once); reusing the same key with a changed fingerprint → 409; the
same key from a different user is isolated. No `daily_mission_snapshots`,
`confidence_point_ledger`, `streak_states`, or `daily_activity_summaries` rows are
created (those tables do not exist; P4 is out of scope). Another learner cannot
submit/read/infer the requester's review (404). An invalid/unknown `user_word_id`
or a rating not permitted for the result (e.g. an objective-incorrect answer that
is not `Again`) is rejected with a stable error and no partial state.

## VOC-027-AC-04 — Review experience is wired into the app with an accurate completion state

- Requirement source: `VOC-027-D00`, `VOC-027-D03`, `VOC-027-D04`, DOC-12 §5 P2
- Tasks: `VOC-027-T03`
- Tests: `VOC-027-TEST-16`..`VOC-027-TEST-18`
- Evidence: `VOC-027-EV-16`..`VOC-027-EV-18`
- Result: pending

A new `(app)` review route wires the real due-queue + submission APIs under the
A1 session. A learner can see due words, submit a response (CSRF + idempotent
client method), advance through the due queue, and see an accurate completion
state per the adopted `D03`/`D04` resolutions. Prompt types are `multiple_choice`
and/or `self_check` per the adopted `D02`/`D03` enum and order; `typing`/
`sentence_usage` are not built. A zero-due-words ("all caught up") state and a
session-completion state are present per `D04`. Saved/reviewed state stays
consistent with `user_words` across navigation; no client DB access or duplicated
authorization.

## VOC-027-AC-05 — Home due-count and mock-field disposition are correct

- Requirement source: `VOC-027-D05`, VOC-026-D05, DOC-12 §5 P2
- Tasks: `VOC-027-T04`
- Tests: `VOC-027-TEST-19`, `VOC-027-TEST-20`
- Evidence: `VOC-027-EV-19`, `VOC-027-EV-20`
- Result: pending

Per the adopted `D05` resolution: Home's `dueReviewWords` is either wired to the
real `GET /api/v1/reviews/due` count (option (a)) or retained mock-pending-P2 with
an explicit label (option (b)). The other `MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE`
fields (mission target, reviewed-today count, streak, Confidence Points, weekly
completion history) stay mock-pending-P4 and are not presented as real P2 data.
The deterministic mock-inventory check verifies the dispositions and that no
P3/P4 API route, table, or behavior was invented.

## VOC-027-AC-06 — P2 evidence, staging, and rollback readiness are complete

- Requirement source: `VOC-027-D00`, DOC-12 §5 P2
- Tasks: `VOC-027-T00`..`VOC-027-T04`
- Tests: `VOC-027-TEST-13`, `VOC-027-TEST-21`..`VOC-027-TEST-24`
- Evidence: `VOC-027-EV-13`, `VOC-027-EV-21`..`VOC-027-EV-24`
- Result: pending

Applicable checks, review-domain/migration/contract/auth/idempotency tests,
exact-SHA reviews, and the deterministic mock-inventory test pass. Staging tests
for due-queue → submit → schedule-update-exactly-once → completion, cross-user
denial, CSRF, idempotency, and the review-attempts/user-words rollback rehearsal
are documented and ready to run once the F3 staging environment exists
(`VOC-027-DEP-02`). This enables — but does not itself declare — the DOC-12 P2
gate evaluation; the milestone gate is not satisfied by package merge or staging
deploy alone.