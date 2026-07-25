# VOC-027 — Tasks

Mandatory PR order: `T00 → T01 → T02 → T03 → T04`. Each PR is independently
reviewable, remains R3-proposed (path floor R3 for migrations/schemas), and
requires Claude Code exact-SHA review. Tasks that depend on open founder
decisions (`D02`, `D03`, `D04`, `D05`) may not proceed past them by guessing;
record the adopted resolution in `D06` first.

## VOC-027-T00 — review_attempts persistence, migration, and the pure scheduling domain

- Requirement source: `VOC-027-D00`, `VOC-027-D01`, `VOC-027-D02`, DOC-05 §§9,15,18–20, DOC-06 §10
- Acceptance criteria: `VOC-027-AC-00`, `VOC-027-AC-01`
- Tests: `VOC-027-TEST-00`..`VOC-027-TEST-03`
- Evidence: `VOC-027-EV-00`..`VOC-027-EV-03`
- Status: pending

Add the `review_attempts` Ent schema (`apps/api/ent/schema/reviewattempt.go`) +
reviewed versioned Atlas SQL in DOC-05 §18 order (`user_words → review_attempts`),
with the partial unique idempotency index on
`(user_id, client_attempt_id) where client_attempt_id is not null`, FKs to
`users`/`user_words`/`word_meanings`, check constraints per DOC-05 §9, and no
`ON DELETE CASCADE`. Do **not** change the `user_words` schema (its scheduling
fields already exist; `VOC-027-D00`). Add the pure scheduling domain function
(`Again`/`Hard`/`Good`/`Easy` → step transitions + counters + `next_review_at`,
floor 0, cap 7, two-consecutive-Again reset) as backend-owned code in the new
`reviews` business module, with no Huma/chi and no Ent writes inside the domain
function — it is unit-tested in pure form. Rehearse disposable forward migration
and recovery; production migration never runs at API startup. No API routes, no
DTOs, no frontend in this PR. Blocked until `D02` (prompt-type contract
enum) is resolved.

## VOC-027-T01 — Due-queue read API with requester-scoped ownership

- Requirement source: `VOC-027-D00`, `VOC-027-D01`, DOC-05 §9 (due-word rule), DOC-07
- Acceptance criteria: `VOC-027-AC-02`
- Tests: `VOC-027-TEST-04`..`VOC-027-TEST-07`, `VOC-027-TEST-12`
- Evidence: `VOC-027-EV-04`..`VOC-027-EV-07`, `VOC-027-EV-12`
- Status: pending

Add the `reviews` business module read side + Huma route
`GET /api/v1/reviews/due` implementing the DOC-05 §9 due-word rule exactly, keyed
to the authenticated requester (service-level query scoping, never direct
cross-module table writes — DOC-06 §3). Enforce `RequireAuth`, 401, 404 for any
owner mismatch (no cross-learner enumeration), cursor pagination, stable
operation ID `GetReviewsDue`, explicit DTOs (never Ent models), committed
OpenAPI, and the matched `@vocanova/api-client` method. A saved-but-never-reviewed
word (`next_review_at` null) is returned as due. No submission write, no frontend
yet.

## VOC-027-T02 — Review submission write API: the §15 transaction minus P4 steps

- Requirement source: `VOC-027-D00`, `VOC-027-D02`, DOC-05 §§9,15, DOC-06 §§8–10, DOC-07
- Acceptance criteria: `VOC-027-AC-03`
- Tests: `VOC-027-TEST-08`..`VOC-027-TEST-12`, `VOC-027-TEST-15`
- Evidence: `VOC-027-EV-08`..`VOC-027-EV-12`, `VOC-027-EV-15`
- Status: pending

Add `POST /api/v1/reviews/submissions` running **exactly** the DOC-05 §15
review-submission transaction **minus** the daily-mission / point-ledger / streak
steps (those tables do not exist): lock the `user_words` row → validate ownership
→ idempotency check on `(user_id, client_attempt_id)` → insert `review_attempts`
(immutable) → call the T00 scheduling domain function → apply its result to
`user_words` (step, counters, last result, last rating, `next_review_at`) →
commit, exactly once. Require `X-CSRF-Token` and user+operation-scoped
`Idempotency-Key` (DOC-07). Replay idempotent; reused key + changed fingerprint →
409; cross-user key isolated; cross-user owner mismatch → 404. Reject an invalid
`user_word_id`, an out-of-range step, or a rating not permitted for the result
(objective-incorrect must be `Again`) with a stable error and no partial state.
Commit OpenAPI + matched client. No `daily_mission_snapshots`/`confidence_point_
ledger`/`streak_states`/`daily_activity_summaries` rows are created (do not invent
those tables or any P4 behavior). No frontend yet. Blocked until `D02` is resolved.

## VOC-027-T03 — Wire the review experience into the app

- Requirement source: `VOC-027-D00`, `VOC-027-D03`, `VOC-027-D04`, DOC-12 §5 P2
- Acceptance criteria: `VOC-027-AC-04`
- Tests: `VOC-027-TEST-16`..`VOC-027-TEST-18`
- Evidence: `VOC-027-EV-16`..`VOC-027-EV-18`
- Status: pending

Add the new `(app)` review route(s) (e.g. `/reviews`) wired to the real
due-queue + submission APIs via `@vocanova/api-client` under the A1 session. Per
the adopted `D03`/`D04` resolutions, render the due word, the prompt per the
adopted `D02` enum/`D03` order (`multiple_choice` and/or `self_check`; `typing`/
`sentence_usage` excluded), the rating/submit control (CSRF + the idempotent
client method from T02), the correct/incorrect non-color-only feedback, the
queue-advance behavior, and the accurate completion state incl. the zero-due
("all caught up") empty state. Keep saved/reviewed state consistent with
`user_words` across navigation; no client DB access or duplicated authorization.
This task is blocked until `D03` and `D04` are resolved into `D06`.

## VOC-027-T04 — Home due-count reconciliation, mock-decommission inventory, P2 staging evidence, and gate readiness

- Requirement source: `VOC-027-D00`, `VOC-027-D05`, VOC-026-D05, DOC-12 §5 P2
- Acceptance criteria: `VOC-027-AC-05`, `VOC-027-AC-06`
- Tests: `VOC-027-TEST-13`, `VOC-027-TEST-19`..`VOC-027-TEST-24`
- Evidence: `VOC-027-EV-13`, `VOC-027-EV-19`..`VOC-027-EV-24`
- Status: pending

Per the adopted `D05` resolution, wire (or explicitly retain mock-pending-P2)
Home's `dueReviewWords`; leave every other `MOCK_HOME_STATE`/`MOCK_PROGRESS_STATE`
field mock-pending-P4 labelled, not presented as real P2 data. Update the
deterministic mock-inventory check (`scripts/foundation/mock-inventory.mjs`) to
admit the new `reviews` module/routes/`reviewattempt` schema/migration and to
verify the P2-vs-P4 field dispositions; assert no P3/P4 route, table, or behavior
was invented. Where the F3 staging environment exists, exercise due-queue → submit
→ schedule-update-exactly-once → completion, cross-user denial, CSRF, idempotency,
and the review-attempts/user-words rollback rehearsal under non-production
identities; where it does not, record the in-repository evidence and documented
procedures and record live staging evidence as blocked by `VOC-027-DEP-02`. Do not
declare the DOC-12 P2 gate complete.

### Deliverables

- `mock-inventory.md`: maps every mock touched by P2 (notably the Home
  `dueReviewWords` field per `D05`) to its disposition
  (`decommissioned-to-real-P2`, `retained-as-mock-pending-P4`, or
  `retained-as-mock-pending-P2`), and records the new real P2 routes/tables.
- `staging-evidence.md`: collects in-repository evidence and documents the staged
  exercises and rollback rehearsal that can only run once F3 exists.
- updated `scripts/foundation/mock-inventory.mjs` (+`.test.mjs`): deterministic
  check enforcing the new P2 boundaries and that no P3/P4 route/table/behavior
  was invented.

### Blocker

`VOC-027-DEP-02` remains open: F3 staging does not exist, so the live staging
exercises (`EV-21`, `EV-22`, `EV-23`) cannot be executed. This task provides the
procedures and the in-repository evidence only; it does not declare the
DOC-12 P2 gate complete.