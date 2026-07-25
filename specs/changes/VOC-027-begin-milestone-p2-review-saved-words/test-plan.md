# VOC-027 — Test Plan

No test, fixture, seed file, OpenAPI example, or evidence may contain a real
secret, production URL/data, another learner's personal content, or a raw
session/CSRF token. Discover installed commands at the adopted base; a missing
integration, staging credential, open decision (`VOC-027-DEP-01`), or browser
tool is never reported as a pass — it is a recorded limitation or blocker.

## VOC-027-TEST-00 — review_attempts migration invariants
- Covers: `VOC-027-AC-00`; Preconditions: T00, disposable PostgreSQL.
- Procedure: apply T00 migration and assert FKs to `users`/`user_words`/
  `word_meanings`, partial-unique idempotency index on
  `(user_id, client_attempt_id) where client_attempt_id is not null`, check
  constraints (`review_step_before`/`_after` 0–7, `prompt_type` in the adopted
  `D02` enum, `result` in `correct`/`incorrect`/`skipped`, `rating` nullable only
  when no rating applies), and no `ON DELETE CASCADE`. Confirm `user_words`
  schema is unchanged.
- Expected result: migration and constraints pass; production startup does not
  migrate. Evidence: `VOC-027-EV-00`.

## VOC-027-TEST-01 — Migration compatibility, recovery, and exclusivity
- Covers: `VOC-027-AC-00`; Preconditions: T00.
- Procedure: run the adopted migration validation and disposable
  forward/recovery rehearsal against an existing VOC-026 DB; assert
  `review_attempts` is creatable only after `user_words`, and that a
  pre-existing `user_words` row can receive attempts.
- Expected result: recoverable migration; `user_words → review_attempts` order
  respected. Evidence: `VOC-027-EV-01`.

## VOC-027-TEST-02 — Scheduling domain: Again/Hard/Good/Easy step transitions
- Covers: `VOC-027-AC-01`; Preconditions: T00 pure domain function.
- Procedure: for representative prior steps (0, 1, 4, 7), apply each
  `(result, rating)` and assert the new step: Again floors to 0 (steps back),
  Hard holds, Good/Easy advance with cap 7; `next_review_at` set by the
  backend-owned interval-to-step mapping; counters and `last_*` updated.
- Expected result: every branch matches DOC-06 §10 exactly. Evidence:
  `VOC-027-EV-02`.

## VOC-027-TEST-03 — Scheduling domain: two consecutive incorrect/Again reset
- Covers: `VOC-027-AC-01`, DOC-05 §20; Preconditions: T00.
- Procedure: from a non-zero step, apply two consecutive
  incorrect/Again transitions and assert `review_step` resets to 0; verify
  `consecutive_incorrect_count` increments across the first and resets on a
  subsequent correct; verify `correct_review_count <= total_review_count`.
- Expected result: reset-to-0 on two consecutive incorrect/Again; counters
  consistent. Evidence: `VOC-027-EV-03`.

## VOC-027-TEST-04 — Due-queue read API happy path
- Covers: `VOC-027-AC-02`; Preconditions: T01, seeded DB + a requester with
  saved words.
- Procedure: call `GET /api/v1/reviews/due` authenticated and paginated; assert
  DTO shape, stable operation ID `GetReviewsDue`, cursor pagination, and no Ent
  model/id leak.
- Expected result: list contains exactly the requester's due words
  (`status in ('new','learning','reviewing')` and
  `(next_review_at is null or next_review_at <= now())`). Evidence:
  `VOC-027-EV-04`.

## VOC-027-TEST-05 — Never-reviewed word is due (null next_review_at)
- Covers: `VOC-027-AC-02`, `VOC-027-D01`; Preconditions: T01, a freshly saved
  (VOC-026-D04) word with `next_review_at` null.
- Procedure: call `GET /api/v1/reviews/due`; assert the never-reviewed saved word
  is returned (null `next_review_at` is a due state per DOC-05 §9).
- Expected result: the P1-saved word appears in the due queue without any P1
  change. Evidence: `VOC-027-EV-05`.

## VOC-027-TEST-06 — Due-queue authentication, authorization, cross-user denial
- Covers: `VOC-027-AC-02`; Preconditions: T01.
- Procedure: call `GET /api/v1/reviews/due` unauthenticated, with an
  expired/revoked/disabled session, and as two learners with different saved
  words; assert no cross-learner due words or personal data.
- Expected result: 401 when unauthenticated/disabled; no cross-learner leakage
  (404/private-resource for any mismatch). Evidence: `VOC-027-EV-06`.

## VOC-027-TEST-07 — Due-queue contract and OpenAPI drift
- Covers: `VOC-027-AC-02`; Preconditions: T01.
- Procedure: regenerate OpenAPI, run drift/golden checks, verify the matched
  client compiles and the DTO validation/error shapes agree.
- Expected result: committed OpenAPI/client agree; no Ent/internal exposure.
  Evidence: `VOC-027-EV-07`.

## VOC-027-TEST-08 — Review submission happy path
- Covers: `VOC-027-AC-03`; Preconditions: T02, authenticated requester with a
  due word.
- Procedure: `POST /api/v1/reviews/submissions` with a valid `user_word_id`,
  prompt per the adopted `D02` enum, `result`/`rating` consistent with DOC-06
  §10, CSRF, and `Idempotency-Key`; assert one `review_attempts` row, the
  `user_words` row is updated exactly once (step, counters, last result/rating,
  `next_review_at`), per the T00 domain function.
- Expected result: one attempt row; exactly-once schedule update. Evidence:
  `VOC-027-EV-08`.

## VOC-027-TEST-09 — Submission idempotency and replay (exactly once)
- Covers: `VOC-027-AC-03`; Preconditions: T02.
- Procedure: replay the same `client_attempt_id`/fingerprint (assert idempotent,
  no duplicate attempt, schedule updated exactly once — not advanced twice);
  reuse the same key with a changed fingerprint (assert 409); reuse the same key
  as a different user (assert isolated, succeeds independently).
- Expected result: no duplicate; 409 on conflicting same-user fingerprint; users
  isolated. Evidence: `VOC-027-EV-09`.

## VOC-027-TEST-10 — Submission authorization and CSRF
- Covers: `VOC-027-AC-03`; Preconditions: T02.
- Procedure: submit without `X-CSRF-Token`, with a mismatched token, and without
  a session; attempt to submit against another learner's `user_word_id` by known/
  guessed id; assert no cross-learner inference.
- Expected result: invalid CSRF → 403; unauthenticated/disabled → 401; another
  learner's word → 404. Evidence: `VOC-027-EV-10`.

## VOC-027-TEST-11 — Submission invalid input and integrity
- Covers: `VOC-027-AC-03`; Preconditions: T02.
- Procedure: submit an invalid/unknown `user_word_id`; a `result`/`rating` pair
  not permitted by DOC-06 §10 (objective-incorrect must be `Again`); an
  out-of-range step; assert the transaction leaves no partial state (no
  `review_attempts` row, `user_words` unchanged).
- Expected result: stable error; atomicity intact; no P4 rows created. Evidence:
  `VOC-027-EV-11`.

## VOC-027-TEST-12 — Contract and OpenAPI drift (reviews combined)
- Covers: `VOC-027-AC-02`, `VOC-027-AC-03`; Preconditions: T01, T02.
- Procedure: run generation/golden checks across the review routes; inspect DTO
  validation and error shapes; verify the matched client methods/types.
- Expected result: routes, OpenAPI, and client agree; no Ent/internal data;
  `Idempotency-Key` required on the submission route. Evidence: `VOC-027-EV-12`.

## VOC-027-TEST-13 — Installed deterministic and security suite
- Covers: `VOC-027-AC-06`; Preconditions: each PR complete.
- Procedure: run relevant `pnpm validate`/`pnpm test`/`pnpm build`, Go
  format/vet/test/build, web lint/typecheck/build/format, `scripts/governance/*`
  checks as applicable, review-domain/migration/contract/auth/idempotency tests
  from adopted scripts, and the extended mock-inventory check.
- Expected result: available checks pass; absent checks reported honestly.
  Evidence: `VOC-027-EV-13`.

## VOC-027-TEST-14
Reserved (criteria reference keeps AC-03 numbering contiguous with TEST-12 slot)
— see TEST-15 for the immutable-history assertion.

## VOC-027-TEST-15 — Submission leaves immutable history; schedule update atomicity
- Covers: `VOC-027-AC-03`, `VOC-027-AC-00`; Preconditions: T02.
- Procedure: after a successful submission and a replayed idempotent submission,
  assert `review_attempts` rows are immutable (not updated) and the
  `review_step_before`/`_after` snapshot the actual transition once; assert a
  simulated mid-transaction failure (test double) leaves neither an attempt row
  nor a schedule update.
- Expected result: history is append-only and consistent with the current state;
  partials roll back. Evidence: `VOC-027-EV-15`.

## VOC-027-TEST-16 — Review route wired to real due-queue + submission
- Covers: `VOC-027-AC-04`; Preconditions: T03, seeded API, due words present.
- Procedure: render the new review route via server components; assert it calls
  `GET /api/v1/reviews/due` and submits via the real client method with CSRF +
  `Idempotency-Key`; assert prompt rendering per the adopted `D02`/`D03` enum/
  order and `D04` flow.
- Expected result: real-data review; no client DB access or duplicated
  authorization. Evidence: `VOC-027-EV-16`.

## VOC-027-TEST-17 — Completion and zero-due states
- Covers: `VOC-027-AC-04`, `VOC-027-D04`; Preconditions: T03.
- Procedure: review until the due queue is drained and assert the accurate
  completion state; load the route with zero due words and assert the adopted
  zero-due ("all caught up") empty state per `D04`.
- Expected result: completion state matches the real due-queue; empty state is
  honest. Evidence: `VOC-027-EV-17`.

## VOC-027-TEST-18 — Review-screen accessibility and routing
- Covers: `VOC-027-AC-04`; Preconditions: T03.
- Procedure: run installed a11y tools or inspect labels, focus, keyboard
  reachability, semantic correct/incorrect status (non-color-only), mobile
  behavior, and authenticated routing under the A1 shell.
- Expected result: requirements hold; absent automation recorded as limitation.
  Evidence: `VOC-027-EV-18`.

## VOC-027-TEST-19 — Home due-count and P4 mock-field disposition
- Covers: `VOC-027-AC-05`; Preconditions: T04, `D05` resolved.
- Procedure: per the adopted `D05` resolution, assert Home's `dueReviewWords` is
  wired to the real due-queue count (option (a)) or explicitly retained
  mock-pending-P2 (option (b)); assert every other `MOCK_HOME_STATE`/
  `MOCK_PROGRESS_STATE` field stays mock-pending-P4 and is not presented as real
  P2 data.
- Expected result: disposition matches `D05`/`D06`; no invented P4 behavior.
  Evidence: `VOC-027-EV-19`.

## VOC-027-TEST-20 — Mock-decommission inventory check (P2)
- Covers: `VOC-027-AC-05`; Preconditions: T04.
- Procedure: run the extended deterministic mock-inventory check; verify the new
  `reviews` module/routes/`reviewattempt` schema/migration are admitted and
  every mock touched by P2 has the right disposition.
- Expected result: in-scope P2 mocks disposed correctly; no P3/P4 route/table/
  behavior invented; retained mocks explicitly labelled. Evidence:
  `VOC-027-EV-20`.

## VOC-027-TEST-21 — Staging due-queue → submit → completion
- Covers: `VOC-027-AC-06`; Preconditions: F3 staging exists (`VOC-027-DEP-02`),
  seeded content, due words.
- Procedure: with non-production identities complete the full P2 review loop end
  to end and confirm the schedule updates exactly once.
- Expected result: P2 flow evidence recorded without production data. Evidence:
  `VOC-027-EV-21`.

## VOC-027-TEST-22 — Staging authorization, CSRF, and idempotency validation
- Covers: `VOC-027-AC-06`; Preconditions: F3 staging exists.
- Procedure: repeat unauthenticated, cross-user, CSRF-negative, and
  idempotency-replay tests in staging; inspect redacted signals.
- Expected result: no bypass, cross-user access, or duplicate schedule update.
  Evidence: `VOC-027-EV-22`.

## VOC-027-TEST-23 — review_attempts / user_words rollback rehearsal
- Covers: `VOC-027-AC-06`; Preconditions: staged candidate, approved procedure.
- Procedure: rehearse non-production `review_attempts` migration rollback;
  validate immutable committed `review_attempts` rows are preserved (not dropped),
  `user_words` schedule state written before the rollback window is preserved,
  and unsafe rows are not resurrected.
- Expected result: controlled recovery; no learner-data or history corruption.
  Evidence: `VOC-027-EV-23`.

## VOC-027-TEST-24 — Exact-SHA independent verification
- Covers: `VOC-027-AC-06`; Preconditions: each PR at its final SHA.
- Procedure: Claude Code binds to the exact final SHA per PR and verifies scope,
  classifier floor, migration/immutable-history safety, scheduling-rule
  correctness, requester scope, exactly-once idempotency, CSRF, contract drift,
  the `D02` DOC-05/DOC-07 reconciliation, no P4 tables/behavior, no P1 revisit,
  secrets/logging, accessibility, staging/rollback evidence, and implementer
  separation; reports remaining R3/R4/adoption/activation gates.
- Expected result: `PASS` / `PASS WITH NON-BLOCKING FINDINGS` / `FAIL` with
  exact evidence; the implementer did not approve or merge its own work. Evidence:
  `VOC-027-EV-24`.