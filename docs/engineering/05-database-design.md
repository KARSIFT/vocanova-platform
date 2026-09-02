# 05 — VocaNova Database Design

## 1. Source of truth

Cloudflare D1 is the application database. The executable schema lives in the forward-only SQL
migrations under [`apps/api-worker/migrations`](../../apps/api-worker/migrations/). This document
explains the design; when a column-level detail matters, the migrations are authoritative.

The Worker never mutates schema at startup. Local development and CI apply the same ordered
migrations to disposable D1 databases. Production migration and deployment are separate operational
actions and are not automated by pull-request workflows.

## 2. D1 encodings

- Tables are SQLite `STRICT` tables unless a composite-key table uses `WITHOUT ROWID, STRICT`.
- UUID-shaped identifiers are lowercase 36-character `TEXT` values created by the application.
- UTC timestamps are canonical millisecond RFC 3339 `TEXT` values such as
  `2026-08-22T12:34:56.789Z`.
- Local dates are `TEXT` values in `YYYY-MM-DD` form; timezone names are IANA strings.
- Booleans are constrained `INTEGER` values in `{0, 1}`.
- Flexible payloads use `TEXT` guarded by `json_valid(...)`; there is no `jsonb` column type.
- Foreign keys use `ON DELETE RESTRICT` for learner and learning history. Soft-delete/status fields
  preserve history where the product requires it.
- Application integers must remain safe JavaScript integers. Values that can exceed that range are
  represented without lossy `number` conversion.

## 3. Table inventory

The seven current migrations create 31 tables:

- Foundation: `platform_metadata`.
- Identity and accounts: `users`, `external_identities`, `sessions`, `magic_links`, `oauth_states`,
  `user_settings`, `user_onboarding_profiles`, `email_change_links`,
  `account_deletion_requests`, `auth_rate_limits`.
- Content, learning, and reviews: `canonical_words`, `word_meanings`, `word_examples`, `usage_notes`,
  `journey_situations`, `journey_words`, `user_words`, `idempotency_keys`, `review_attempts`.
- Missions and gamification: `daily_mission_snapshots`, `daily_activity_summaries`,
  `confidence_point_ledger`, `streak_states`, `grace_day_ledger`.
- Sentences and AI: `learner_sentences`, `ai_feedback_attempts`, `ai_feedback_reports`,
  `ai_usage_counters`, `ai_generation_events`, `ai_generation_leases`.

There is no `feature_audit_logs` table in the active schema.

## 4. Identity and authentication

`users` is the internal identity root. Provider identities live in `external_identities`, so product
tables reference VocaNova user IDs rather than provider IDs. `sessions`, `magic_links`, and
`oauth_states` store hashes and bounded expiry state; raw authentication tokens are never stored.

`email_change_links` supports single-use address changes. `account_deletion_requests` records the
deactivation and scheduled purge state. `auth_rate_limits` stores bounded authentication buckets.
The optional synthetic-test-account flag is constrained so at most one synthetic account can
exist.

## 5. Settings and account lifecycle

`user_settings` is one-to-one with `users` and stores timezone, review target, review rhythm,
notification choices, application language, and display name. Account deletion first deactivates
the user, revokes access, and records an idempotent deletion request; later anonymization requires a
separately implemented and operated process.

## 6. Onboarding

`user_onboarding_profiles` is one-to-one with `users`. It stores English level, native language,
learning goal, main use case, initial daily review target, and completion time. Onboarding seeds
settings but does not create a second source of truth for later preference changes.

## 7. Vocabulary content and saved words

`canonical_words` owns normalized English word forms. `word_meanings` owns definitions and part of
speech; `word_examples` and `usage_notes` attach ordered teaching material to a meaning.

`user_words` links a learner to a meaning and stores status, source, review step, next-review time,
review counters, and soft-delete/mastery state. A partial unique index prevents more than one active
saved row for the same learner and meaning.

## 8. Journey discovery

`journey_situations` stores the discoverable situation, slug, level band, category, status, and
display order. `journey_words` links meanings into a situation with relevance, core-word, and display
ordering. The implemented discovery order is explicit display order followed by stable meaning ID.

## 9. Saved-word reviews and scheduling

`review_attempts` is append-only review evidence linked to the learner, saved word, and meaning. It
records prompt type, objective result, optional learner rating, step transition, response time, and
idempotent client attempt ID.

The current scheduler uses steps `0..7` and ratings **Again / Hard / Good / Easy**:

- Again moves back with a floor of 0.
- Two consecutive incorrect results reset the item to step 0.
- Hard keeps the current step.
- Good and Easy advance with a cap of 7.

Objective result and scheduling rating remain separate. The implemented prompt types are
`multiple_choice` and `self_check`. `user_words.next_review_at` and review counters are updated in the
same logical write as the attempt.

## 10. Missions and daily activity

`daily_mission_snapshots` freezes a learner's targets, counters, policy version, timezone, local
date, and completion state for one day. Preference changes affect future snapshots, not an existing
day. `daily_activity_summaries` stores daily aggregate progress for the Progress screen.

## 11. Learner sentences and AI feedback

`learner_sentences` stores the original and normalized sentence, source surface, status, and links to
the learner and optional vocabulary rows. `ai_feedback_attempts` stores provider/model/prompt
versions, request hash, structured feedback JSON, lifecycle status, and redacted failure metadata.
Successful attempts require a completion time; failed attempts require an error code.

`ai_feedback_reports` records one learner report per feedback attempt. `ai_usage_counters` and
`ai_generation_events` enforce and explain user/global request and cost limits.
`ai_generation_leases` prevents concurrent generation for one learner and expires deterministically.

## 12. Confidence Points and streaks

`confidence_point_ledger` is the source of truth for points. Each entry records a nonzero amount,
resulting balance, reason, source, optional idempotency key, and validated metadata JSON; there is no
mutable points balance on `users`.

`streak_states` stores the current and longest streak plus local-date/timezone state.
`grace_day_ledger` records earned or consumed protection with an idempotent source. Mission,
activity, points, and streak updates that belong to one user action are applied atomically.

## 13. Idempotency and atomic writes

`idempotency_keys` scopes a key by learner and operation and binds it to a request fingerprint.
Reusing the same key for a different payload fails. Review, save-word, sentence-feedback, mission,
points, and account-lifecycle writes use D1 prepared statements and atomic `batch()` boundaries where
one invariant spans several statements.

## 14. Ownership and integrity

Repositories always scope private reads and writes by the authenticated user. Foreign keys,
`CHECK` constraints, unique/partial indexes, and application validation defend the same invariants at
different layers. Dynamic values use bound parameters. Core business tables do not use broad
cascading deletes.

## 15. Operational metadata and conversion guard

`platform_metadata` stores versioned operational JSON such as import checkpoints and the exact
reconciliation write lock. Migration `0007_reconciliation_write_guard.sql` installs triggers that
freeze converted tables while this lock exists; the importer releases it only after the bounded
reconciliation report completes.

## 16. Privacy, retention, and deletion

Collect only data needed for authentication, learning, safety, and product operation. Never store
raw session, magic-link, OAuth, or provider tokens. Do not put learner sentence text or private
provider payloads in logs or analytics. Learner-owned rows remain isolated by `user_id`.

Account deletion currently deactivates access and records a purge deadline. A complete irreversible
purge/anonymization worker is not present in this repository; it must be implemented, legally
reviewed, tested against every learner-data table, and operationally authorized before production
claims promise completed erasure.

## 17. Migration workflow

Add a new numbered, forward-only SQL migration; do not edit an applied migration. Validate a fresh
database, repeat application, upgrades from supported states, foreign keys, constraints, indexes,
repository behavior, and rollback-safe failure handling. Use expand/migrate/contract sequencing for
breaking changes. Pull-request CI performs only local migrations and dry runs.

## 18. Synthetic PostgreSQL conversion

The compact retired-source manifest and conversion code exist only to test deterministic
PostgreSQL-to-D1 mapping with synthetic fixtures. Conversion normalizes identifiers, timestamps,
JSON, booleans, safe integers, foreign-key order, bounded batches, checksums, checkpoints, and domain
aggregates. It rejects non-synthetic exports. See the
[data-conversion guide](../operations/data-conversion.md) for rehearsal and recovery commands.
