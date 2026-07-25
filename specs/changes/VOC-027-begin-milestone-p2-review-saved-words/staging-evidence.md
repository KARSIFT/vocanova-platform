# VOC-027 — P2 Staging and Rollback Evidence Collection

## Purpose

This document records the evidence required by `VOC-027-AC-06` (via
`VOC-027-TEST-13`, `VOC-027-TEST-20`..`VOC-027-TEST-24`). It collects the
in-repository evidence that can be produced without the F3 staging environment
and documents the staging exercises and rollback rehearsal that can only be run
once F3 exists.

## Current status

Execution of live staging evidence (`VOC-027-EV-21`..`VOC-027-EV-23`) is
**blocked** by `VOC-027-DEP-02`: the F3 staging environment does not yet exist
(carried from `VOC-026-DEP-03`). T00–T03 implement the code; T04 collects every
piece of evidence that can be produced in-repository and documents the remaining
staging/rollback work for F3.

No DOC-12 P2-complete declaration is made here.

## Evidence collected in repository

| Evidence ID      | Test                                                                        | Status       | Location                                                                                                                                                                                                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VOC-027-EV-13`  | `VOC-027-TEST-13` — Installed deterministic and security suite               | Collected    | `pnpm run validate`, `pnpm run test`, `pnpm run build`, `cd apps/api && go vet ./... && go test ./...`, the scripts/foundation tests, and the extended mock-inventory check                                                                                                                                |
| `VOC-027-EV-20`  | `VOC-027-TEST-20` — Mock-decommission inventory (P2)                        | Collected    | `scripts/foundation/mock-inventory.mjs`, `scripts/foundation/mock-inventory.test.mjs`, and `specs/changes/VOC-027-begin-milestone-p2-review-saved-words/mock-inventory.md`                                                                                                                               |
| `VOC-027-EV-21`  | `VOC-027-TEST-21` — Staging due-queue → submit → completion                 | **Blocked**  | Requires F3 staging with seeded content + due words and a non-production identity. See procedure below.                                                                                                                                                                                                    |
| `VOC-027-EV-22`  | `VOC-027-TEST-22` — Staging authorization, CSRF, and idempotency validation | **Blocked**  | Requires F3 staging with two isolated non-production users and CSRF/idempotency tooling. See procedure below.                                                                                                                                                                                              |
| `VOC-027-EV-23`  | `VOC-027-TEST-23` — review_attempts / user_words rollback rehearsal        | **Blocked**  | Requires a staged candidate, approved rollback procedure, and disposable PostgreSQL. See procedure below.                                                                                                                                                                                                  |
| `VOC-027-EV-24`  | `VOC-027-TEST-24` — Exact-SHA independent verification                      | **Required** | Performed by Claude Code on each T00–T04 final SHA; reports scope, classifier floor, migration/immutable-history safety, scheduling-rule correctness, requester scope, exactly-once idempotency, CSRF, the `D02` DOC-05/DOC-07 reconciliation, no P4 behavior, no P1 revisit, secrets/logging, a11y, evidence. |

## Staging due-queue → submit → completion procedure (EV-21)

When F3 staging is available, perform the following with non-production
identities only:

1. **Migrate and authenticate**
   - Ensure the F3 database has the VOC-027 P2 `review_attempts` migration
     applied on top of the VOC-026 P1 migrations and seed, with `user_words`
     scheduling fields present.
   - Authenticate as test user A through the A1 sign-in flow and obtain a valid
     `vocanova_session` and `vocanova_csrf` token pair.

2. **Establish due words**
   - Save at least one meaning via the P1 save flow so a `user_words` row exists
     with `next_review_at = null` (the VOC-026-D04 state).
   - Call `GET /api/v1/reviews/due`; assert the freshly saved word is returned
     (null `next_review_at` is a due state).

3. **Submit and verify exactly once**
   - Open the new review route, submit a `multiple_choice`/`self_check`
     response (per the adopted `D02`/`D03`) via the real control with
     `X-CSRF-Token` + `Idempotency-Key`.
   - Inspect the `review_attempts` row (append-only, snapshots
     `review_step_before`/`_after`) and the `user_words` row (step/counters/
     `next_review_at` updated exactly once per the T00 domain function).
   - Confirm no `daily_mission_snapshots` / `confidence_point_ledger` /
     `streak_states` / `daily_activity_summaries` rows were created.

4. **Replay idempotency**
   - Replay the same `client_attempt_id`/fingerprint; confirm no duplicate
     attempt and the schedule is **not** advanced twice.

5. **Completion state**
   - Review until the due queue drains; assert the accurate completion state and
     the "all caught up" empty state per `D04`.

## Staging authorization, CSRF, and idempotency validation procedure (EV-22)

When F3 staging is available:

1. **Unauthenticated access** — request `GET /api/v1/reviews/due` and
   `POST /api/v1/reviews/submissions` without a session; confirm `401`.
2. **Cross-user isolation** — as user B, attempt to submit against A's
   `user_word_id` by known id and to read A's due queue; confirm `404` and no
   leakage.
3. **CSRF enforcement** — submit without/mismatched `X-CSRF-Token` → `403`; valid
   pair → `200`/`201`.
4. **Idempotency enforcement** — replay same key/fingerprint (idempotent);
   reuse same key with a changed fingerprint → `409`; same key as a different
   user → isolated.
5. **Redaction** — inspect responses, logs, and OpenAPI; confirm no raw session/
   CSRF tokens, response times, or another learner's answers are exposed.

## review_attempts / user_words rollback rehearsal procedure (EV-23)

When a staged candidate is ready and the rollback procedure is approved:

1. **Pre-rollback** — snapshot the staging DB after the `review_attempts`
   migration and after review submissions; record the last-known-good revision;
   identify committed `review_attempts` rows and the mutated `user_words` rows.
2. **Rollback** — stop the API service, revert the code to the last-known-good
   revision, and restore the DB to the pre-migration state under the approved
   procedure (or otherwise follow the expand-and-contract plan adopted with the
   migration).
3. **Post-rollback safety** — confirm committed immutable `review_attempts`
   rows are preserved (not dropped) when the adopted plan keeps them; otherwise
   confirm their documented removal is intentional; confirm `user_words` schedule
   state written before the rollback window is preserved; confirm no raw tokens
   or personal answer/response-time data remain in logs.
4. **Service validation** — start the API, run health checks, confirm the review
   routes are unavailable until the next forward migration (or restored to a
   consistent pre-candidate state if retained).

## Dependency blocker

`VOC-027-DEP-02`: F3 staging environment must exist before the live staging
exercises (`VOC-027-EV-21`, `VOC-027-EV-22`, `VOC-027-EV-23`) can be executed.

`VOC-027-T04` provides the in-repository evidence and the documented procedures
only; it does not declare the DOC-12 P2 gate complete.