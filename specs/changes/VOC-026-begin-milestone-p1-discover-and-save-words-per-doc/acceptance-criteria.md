# VOC-026 — Acceptance Criteria

Acceptance criteria are observable, stable, security-aware, and bidirectionally traceable
to requirements (`D00`–`D06`), tasks (`T00`–`T05`), tests (`VOC-026-TEST-*`), and evidence.
`D01`, `D03`, `D04`, and `D05` are open founder decisions; the affected criteria's exact
observable outcome is written against the draft's proposed resolution and must be adjusted
at adoption to the founder's resolution. `D06` records the adopted resolutions.

## VOC-026-AC-00 — Canonical content and user-words persistence integrity

- Requirement source: `VOC-026-D00`, DOC-05 §§7–9,18–20
- Tasks: `VOC-026-T00`
- Tests: `VOC-026-TEST-00`, `VOC-026-TEST-01`
- Evidence: `VOC-026-EV-00`, `VOC-026-EV-01`
- Result: pending

Ent/Atlas create `canonical_words`, `word_meanings`, `word_examples`, `usage_notes`,
`journey_situations`, `journey_words`, and `user_words` with the required uniqueness,
partial-unique indexes, FKs, status/check constraints (incl.
`canonical_words (language_code, normalized_text)`,
`word_meanings (word_id, meaning_order)`,
`journey_words (journey_situation_id, meaning_id)`,
`user_words (user_id, meaning_id) where deleted_at is null`,
`review_step` 0–7). Empty-db migration and disposable recovery rehearsal preserve
integrity; production migration never runs at API startup.

## VOC-026-AC-01 — Deterministic canonical seed is rerunnable and scope-bounded

- Requirement source: `VOC-026-D01`, DOC-05 §§19,20
- Tasks: `VOC-026-T00`
- Tests: `VOC-026-TEST-01`
- Evidence: `VOC-026-EV-01`
- Result: pending

The seed command loads versioned JSON with fixed UUIDs in one transaction, is safe to
rerun (idempotent insert/restore), and covers exactly the adopted MVP seed-data scope
(`VOC-026-D01`/`D06`). Duplicate normalized words are rejected; seed rerun does not create
duplicate journey relationships or duplicate content rows.

## VOC-026-AC-02 — Discovery and word-detail read API is correct and contract-consistent

- Requirement source: `VOC-026-D00`, `VOC-026-D02`, `VOC-026-D03`, DOC-05 §8, DOC-07
- Tasks: `VOC-026-T01`
- Tests: `VOC-026-TEST-02`..`VOC-026-TEST-06`, `VOC-026-TEST-14`
- Evidence: `VOC-026-EV-02`..`VOC-026-EV-06`, `VOC-026-EV-14`
- Result: pending

`GET /api/v1/journey-situations`, `GET /api/v1/journey-situations/{slug}`, and the
word-detail read endpoint return explicit DTOs (never Ent models) with stable operation
IDs, committed OpenAPI, cursor pagination for lists, and a requester-scoped saved-state
overlay. Saved state reflects the authenticated requester only (not any other learner).
Unknown slugs/words return 404; unauthenticated calls are rejected (401). The discovery
list follows the adopted `D03` resolution (show-all-with-overlay or exclude-saved) exactly.

## VOC-026-AC-03 — Save and unsave are secure, idempotent, and requester-scoped

- Requirement source: `VOC-026-D00`, `VOC-026-D02`, `VOC-026-D04`, DOC-06 §§8–10, DOC-07
- Tasks: `VOC-026-T02`
- Tests: `VOC-026-TEST-07`..`VOC-026-TEST-11`, `VOC-026-TEST-13`
- Evidence: `VOC-026-EV-07`..`VOC-026-EV-11`, `VOC-026-EV-13`
- Result: pending

`POST /api/v1/user-words` saves a meaning for the authenticated requester under the adopted
`D04` resolution (`status='new'`, `source` per request origin, `review_step=0`; no P2/P4
side-effects unless `D04` adds them) with valid `X-CSRF-Token`, required user-scoped
`Idempotency-Key`, and one transaction. `DELETE /api/v1/user-words/{meaningId}` removes the
requester's saved row (soft-delete) with CSRF; another learner cannot add/remove/read/infer
it (404). Replaying the same idempotency key does not duplicate; reusing the same key with a
changed fingerprint returns 409; the same key used by different users is isolated. Saving an
already-saved meaning is idempotent, not an error. Saving an inactive/unknown meaning fails
with a stable error and no partial state.

## VOC-026-AC-04 — Discover, Situation drill-down, and Word-Detail screens are wired to the real API

- Requirement source: `VOC-026-D02`, `VOC-026-D03`, DOC-12 §5 P1
- Tasks: `VOC-026-T03`
- Tests: `VOC-026-TEST-15`..`VOC-026-TEST-17`, `VOC-026-TEST-19`
- Evidence: `VOC-026-EV-15`..`VOC-026-EV-17`, `VOC-026-EV-19`
- Result: pending

The Discover situation list, the Situation drill-down word list (with saved state per the
adopted `D03` resolution), and the Word-Detail screen (meanings, examples, usage notes,
save/unsave control) are served from the real API under the A1 auth shell; the VOC-021 and
VOC-022 mock constants are removed (not retained as fallback). Routing uses stable slugs;
unknown slugs/words use the existing `notFound()` behaviour; saved state reflects the
authenticated learner. No client DB access or duplicated authorization.

## VOC-026-AC-05 — Saved state is consistent across Home, Discover, and Progress

- Requirement source: `VOC-026-D05`, DOC-12 §5 P1
- Tasks: `VOC-026-T04`
- Tests: `VOC-026-TEST-18`, `VOC-026-TEST-19`
- Evidence: `VOC-026-EV-18`, `VOC-026-EV-19`
- Result: pending

Saving a word from Word-Detail is reflected on Home, Discover/Situation, and Progress per
the adopted `D05` resolution: a saved word persists consistently across navigation and
screens; removing it is reflected consistently. Any out-of-scope P4 mock fields retained on
Home/Progress are explicitly labelled/mock-dispositioned (not presented as real P1 learner
data) per `D05`/`D06`; no P2–P4 behavior is invented.

## VOC-026-AC-06 — Mock decommissioning does not invent later milestones

- Requirement source: `VOC-026-D05`, VOC-025-D05
- Tasks: `VOC-026-T05`
- Tests: `VOC-026-TEST-20`
- Evidence: `VOC-026-EV-20`
- Result: pending

Only the in-scope mocks (VOC-019 home mock fields that map to real P1 saved state, VOC-020
progress fields that map to real P1 saved state, `MOCK_DISCOVER_SITUATIONS`,
`MOCK_SITUATION_WORD_LISTS`) are replaced by real API sources. The deterministic
mock-inventory check verifies each mock's disposition (decommissioned-to-real-P1 /
retained-as-mock-pending-P4) and that no P2–P4 API route, table, or behavior was invented.

## VOC-026-AC-07 — P1 evidence, staging, and rollback readiness are complete

- Requirement source: `VOC-026-D00`, DOC-12 §5 P1
- Tasks: `VOC-026-T00`..`VOC-026-T05`
- Tests: `VOC-026-TEST-12`, `VOC-026-TEST-21`..`VOC-026-TEST-24`
- Evidence: `VOC-026-EV-12`, `VOC-026-EV-21`..`VOC-026-EV-24`
- Result: pending

Applicable checks, content/migration/contract/auth tests, exact-SHA reviews, and the
deterministic mock-inventory test pass. Staging tests for discover/save/unsave consistency,
cross-user denial, CSRF, idempotency, and the session/content-rollback rehearsal are
documented and ready to run once the F3 staging environment exists (`VOC-026-DEP-03`). This
enables — but does not itself declare — the DOC-12 P1 gate evaluation; the milestone gate is
not satisfied by package merge or staging deploy alone.