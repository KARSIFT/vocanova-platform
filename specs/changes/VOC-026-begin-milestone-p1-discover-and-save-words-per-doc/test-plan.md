# VOC-026 — Test Plan

No test, fixture, seed file, OpenAPI example, or evidence may contain a real secret,
production URL/data, another learner's personal content, or a raw session/CSRF token.
Discover installed commands at the adopted base; a missing integration, staging credential,
seed-scope decision (`VOC-026-DEP-02`), or browser tool is never reported as a pass — it is a
recorded limitation or blocker.

## VOC-026-TEST-00 — Content and user-words migration invariants
- Covers: `VOC-026-AC-00`; Preconditions: T00, disposable PostgreSQL.
- Procedure: apply T00 migrations and assert the unique/partial-unique indexes, FKs, status
  and check constraints for `canonical_words`, `word_meanings`, `word_examples`,
  `usage_notes`, `journey_situations`, `journey_words`, and `user_words` (incl.
  `(language_code, normalized_text)`, `(word_id, meaning_order)`,
  `(journey_situation_id, meaning_id)`,
  `(user_id, meaning_id) where deleted_at is null`, `review_step` 0–7,
  `relevance_score` 1–100).
- Expected result: migrations and constraints pass; production startup does not migrate.
  Evidence: `VOC-026-EV-00`.

## VOC-026-TEST-01 — Migration compatibility, recovery, and seed rerun-safety
- Covers: `VOC-026-AC-00`, `VOC-026-AC-01`; Preconditions: T00, adopted `D01` scope.
- Procedure: run the adopted migration validation and disposable forward/recovery rehearsal;
  run the seed command twice against a clean DB; assert no duplicate content/relationship rows
  and duplicate normalized words rejected; confirm fixed-UUID relationships resolve.
- Expected result: recoverable migration, rerunnable deterministic seed, intact content.
  Evidence: `VOC-026-EV-01`.

## VOC-026-TEST-02 — Situation list read API
- Covers: `VOC-026-AC-02`; Preconditions: T01, seeded DB.
- Procedure: call `GET /api/v1/journey-situations` authenticated and paginated; assert DTO
  shape, stable operation ID, cursor pagination, and that no Ent model/id leaks.
- Expected result: list matches seed within the adopted `D01` scope. Evidence: `VOC-026-EV-02`.

## VOC-026-TEST-03 — Situation drill-down and saved overlay
- Covers: `VOC-026-AC-02`, `VOC-026-AC-04`; Preconditions: T01, a requester with saved and
  unsaved meanings.
- Procedure: call `GET /api/v1/journey-situations/{slug}`; assert the meaning entries and the
  request-scoped `isSaved` overlay reflect the requester only, per the adopted `D03` resolution.
- Expected result: overlay matches the requester's `user_words` exactly. Evidence: `VOC-026-EV-03`.

## VOC-026-TEST-04 — Word-detail read API
- Covers: `VOC-026-AC-02`, `VOC-026-AC-04`; Preconditions: T01.
- Procedure: call the word-detail read endpoint for a valid and an unknown word/slug; assert
  meanings, examples, and usage-notes DTOs and saved overlay for the requester.
- Expected result: 200 with full detail for valid; 404 for unknown. Evidence: `VOC-026-EV-04`.

## VOC-026-TEST-05 — Read API authentication and authorization
- Covers: `VOC-026-AC-02`; Preconditions: T01.
- Procedure: call each read endpoint unauthenticated, with an expired/revoked/disabled session,
  and as two learners; assert no cross-learner saved overlay or personal data.
- Expected result: 401 when unauthenticated; no cross-learner leakage. Evidence: `VOC-026-EV-05`.

## VOC-026-TEST-06 — Read API contract and OpenAPI drift
- Covers: `VOC-026-AC-02`; Preconditions: T01.
- Procedure: regenerate OpenAPI, run drift/golden checks, and verify the matched client compiles
  and the DTO validation/error shapes agree.
- Expected result: committed OpenAPI/client agree; no Ent/internal exposure. Evidence: `VOC-026-EV-06`.

## VOC-026-TEST-07 — Save happy path
- Covers: `VOC-026-AC-03`; Preconditions: T02, authenticated requester.
- Procedure: `POST /api/v1/user-words` with a valid meaningId, CSRF, and `Idempotency-Key`; assert
  the created/restored `user_words` row per the adopted `D04` resolution and the returned DTO.
- Expected result: one saved row; no P2/P4 side-effects (unless `D04` adds them). Evidence: `VOC-026-EV-07`.

## VOC-026-TEST-08 — Save idempotency and replay
- Covers: `VOC-026-AC-03`; Preconditions: T02.
- Procedure: replay the same key/fingerprint; reuse the same key with a changed fingerprint;
  reuse the same key as a different user; save an already-saved meaning.
- Expected result: no duplicate; 409 on conflicting same-user fingerprint; users isolated;
  already-saved is idempotent. Evidence: `VOC-026-EV-08`.

## VOC-026-TEST-09 — Unsave and authorization
- Covers: `VOC-026-AC-03`; Preconditions: T02.
- Procedure: `DELETE /api/v1/user-words/{meaningId}` for the requester's saved row; attempt to
  delete another learner's saved meaning by known/guessed meaningId; delete an unsaved meaning.
- Expected result: requester's row soft-deleted; others return 404; unsaved is 404 or idempotent
  per adopted shape, with no cross-learner inference. Evidence: `VOC-026-EV-09`.

## VOC-026-TEST-10 — Save/unsave CSRF and auth enforcement
- Covers: `VOC-026-AC-03`; Preconditions: T02.
- Procedure: send POST/DELETE with absent, malformed, and mismatched `X-CSRF-Token`; call
  unauthenticated and with a disabled session.
- Expected result: invalid CSRF → 403; unauthenticated/disabled → 401. Evidence: `VOC-026-EV-10`.

## VOC-026-TEST-11 — Save invalid meaning and integrity
- Covers: `VOC-026-AC-03`; Preconditions: T02.
- Procedure: save an archived/unknown meaningId; save within a situation whose meaning is inactive.
- Expected result: stable error, no partial `user_words` row, integrity intact. Evidence: `VOC-026-EV-11`.

## VOC-026-TEST-12 — Installed deterministic and security suite
- Covers: `VOC-026-AC-07`; Preconditions: each PR complete.
- Procedure: run relevant `pnpm validate`/`pnpm test`/`pnpm build`, Go format/vet/test/build, web
  lint/typecheck/build/format, `scripts/governance/*` checks as applicable, content/migration/
  contract/auth tests from adopted scripts.
- Expected result: available checks pass; absent checks reported honestly. Evidence: `VOC-026-EV-12`.

## VOC-026-TEST-13 — Saved-words list and cross-screen data source
- Covers: `VOC-026-AC-03`, `VOC-026-AC-05`; Preconditions: T02.
- Procedure: `GET /api/v1/user-words` for the requester; assert DTO, pagination, owner scope, and
  that it is the single source used by Home/Discover/Progress for saved state.
- Expected result: requester-scoped saved list; no cross-learner rows. Evidence: `VOC-026-EV-13`.

## VOC-026-TEST-14 — DTO, contract, and OpenAPI drift (combined)
- Covers: `VOC-026-AC-02`, `VOC-026-AC-03`; Preconditions: T01, T02.
- Procedure: run generation/golden checks across all P1 routes; inspect DTO validation and error
  shapes; verify the matched `@vocanova/api-client` methods and types.
- Expected result: routes, OpenAPI, and client agree; no Ent/internal data. Evidence: `VOC-026-EV-14`.

## VOC-026-TEST-15 — Discover and Situation screens wired
- Covers: `VOC-026-AC-04`; Preconditions: T03, seeded API.
- Procedure: render Discover and the situation drill-down via server components; assert they call
  the real API, show saved state per `D03`, and contain no `MOCK_*` import.
- Expected result: real-data rendering; mock constants removed. Evidence: `VOC-026-EV-15`.

## VOC-026-TEST-16 — Word-Detail screen save/unsave interaction
- Covers: `VOC-026-AC-04`, `VOC-026-AC-05`; Preconditions: T03.
- Procedure: open word detail, save and unsave via the real control; assert the call is
  CSRF+idempotent and the screen state updates consistently.
- Expected result: save/unsave reach the API and update saved state end-to-end. Evidence: `VOC-026-EV-16`.

## VOC-026-TEST-17 — Screen accessibility and routing
- Covers: `VOC-026-AC-04`; Preconditions: T03.
- Procedure: run installed a11y tools or inspect labels, focus, keyboard, semantic status, saved
  label/badge (non-color-only), and mobile behavior; assert unknown slugs/words `notFound()`.
- Expected result: requirements hold; absent automation recorded as limitation. Evidence: `VOC-026-EV-17`.

## VOC-026-TEST-18 — Saved-state consistency across home/discover/progress
- Covers: `VOC-026-AC-05`; Preconditions: T04 (blocked until `D05` resolved).
- Procedure: save a word from Word-Detail, navigate through Discover → Situation → Home → Progress;
  unsave and revisit; assert consistency per the adopted `D05` resolution.
- Expected result: saved state persists consistently across all screens. Evidence: `VOC-026-EV-18`.

## VOC-026-TEST-19 — P4 mock-field disposition on Home/Progress
- Covers: `VOC-026-AC-05`, `VOC-026-AC-06`; Preconditions: T04, `D05` resolved.
- Procedure: inspect Home/Progress for any retained P4 mock fields; assert they are labelled as
  mock-pending-P4 (or replaced per `D05`) and not presented as real P1 learner data.
- Expected result: disposition matches `D05`/`D06`; no invented P4 behavior. Evidence: `VOC-026-EV-19`.

## VOC-026-TEST-20 — Mock-decommission inventory check
- Covers: `VOC-026-AC-06`; Preconditions: T05.
- Procedure: run the deterministic mock-inventory check; list every VOC-010–VOC-024 mock touched by
  P1 and compare to the decommission/retain mapping.
- Expected result: in-scope mocks gone from real sources; no P2–P4 route/table/behavior invented;
  retained mocks explicitly labelled. Evidence: `VOC-026-EV-20`.

## VOC-026-TEST-21 — Staging discover→save→consistency→unsave
- Covers: `VOC-026-AC-07`; Preconditions: F3 staging exists (`VOC-026-DEP-03`), seeded content.
- Procedure: with non-production identities complete the full P1 loop across screens.
- Expected result: P1 flow evidence recorded without production data. Evidence: `VOC-026-EV-21`.

## VOC-026-TEST-22 — Staging authorization, CSRF, and idempotency validation
- Covers: `VOC-026-AC-07`; Preconditions: F3 staging exists.
- Procedure: repeat unauthenticated, cross-user, CSRF-negative, and idempotency-replay tests in
  staging; inspect redacted signals.
- Expected result: no bypass, cross-user access, or duplicate writes. Evidence: `VOC-026-EV-22`.

## VOC-026-TEST-23 — Content and user-words rollback rehearsal
- Covers: `VOC-026-AC-07`; Preconditions: staged candidate, approved procedure.
- Procedure: rehearse non-production content/user-words migration rollback; validate canonical
  content integrity, requester `user_words` integrity, and that unsafe/soft-deleted rows stay
  soft-deleted.
- Expected result: controlled recovery; no learner-data corruption. Evidence: `VOC-026-EV-23`.

## VOC-026-TEST-24 — Exact-SHA independent verification
- Covers: `VOC-026-AC-07`; Preconditions: each PR at its final SHA.
- Procedure: Claude Code binds to the exact final SHA per PR and verifies scope, classifier floor,
  migration safety, requester scope, idempotency, CSRF, contract drift, secrets/logging,
  accessibility, staging/rollback evidence, and implementer separation; reports remaining R3/R4/
  adoption/activation gates.
- Expected result: PASS / PASS WITH NON-BLOCKING FINDINGS / FAIL with exact evidence; the
  implementer did not approve or merge its own work. Evidence: `VOC-026-EV-24`.