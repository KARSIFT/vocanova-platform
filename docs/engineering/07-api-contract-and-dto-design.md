---
id: DOC-07
title: VocaNova API Contract and DTO Design
version: 1.1
document_type: api-contract
status: approved
owner: founder
canonical_path: docs/engineering/07-api-contract-and-dto-design.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-22
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-04
  - DOC-05
  - DOC-06
  - DOC-08
  - DOC-09
related_decisions:
  - ADR-0003
source_files:
  - path: 07-api-contract-and-dto-design.md
    sha256: c1b44de8d2edd02a98098b03b6839f553c594a8225e7371952751a8e19f6883e
---

# 07 — VocaNova API Contract and DTO Design

## Current contract

The public `/api/v1` OpenAPI contract and observable behavior are the migration seam
defined by [ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md).
Hono and schema-driven TypeScript DTOs are the runtime implementation. T11 replaced
the former Go/Huma oracle with the frozen parity snapshot after deterministic drift
and parity tests passed. No
endpoint may silently change because its storage moves from PostgreSQL to D1.

## Core API decisions

REST base path `/api/v1`. TypeScript Module Worker + Hono + generated OpenAPI. D1-backed typed
repositories and server-managed D1 sessions.
Google OAuth + email magic link. Secure HttpOnly session cookie. CSRF via double-submit cookie
(`X-CSRF-Token`). UUIDv7-preferred IDs. RFC3339 UTC timestamps. IANA timezone names.

## API principles

Never expose Ent models directly — always explicit request/response DTOs. Keep contracts
frontend-friendly. Strict validation, reject unknown fields. Standard error responses. OpenAPI is
the contract source. Avoid unnecessary MVP complexity.

## Response standards

Success responses are direct DTOs. Lists use:

```json
{ "items": [], "nextCursor": null, "hasMore": false }
```

Errors:

```json
{
  "code": "validation_failed",
  "message": "Some request fields are invalid.",
  "fieldErrors": [],
  "requestId": "01J2XYZ",
  "retryable": false
}
```

Pagination: cursor-based, default limit 20, max 50, opaque cursors, no generic sorting in MVP.

## Security rules

**CSRF**: `X-CSRF-Token` required for POST/PATCH/DELETE.

**Idempotency** (header `Idempotency-Key`, 24h retention) is scoped to the authenticated user and
operation; the same key used by different users must remain isolated. It is required for:
`POST /api/v1/user-words`,
`POST /api/v1/reviews/submissions`, `POST /api/v1/learner-sentences`,
`POST /api/v1/account-deletion-requests`.

## Review system

```text
GET  /api/v1/reviews/due
POST /api/v1/reviews/submissions
```

Prompt types: `meaning_choice`, `word_choice`, `self_check` (see [05](05-database-design.md) §9 for the
full prompt-type list including `typing`/`sentence_usage`, which are a later superset — these three
were the initial MVP set). `result` and `rating` are distinct. Objective incorrect answers record
`Again`; objective correct answers allow Hard/Good/Easy; self-check result derives from the rating.
Again steps back with a floor of 0, two consecutive incorrect/Again attempts reset to 0, Hard stays,
and Good/Easy step forward with a cap of 7. The backend owns scheduling logic.

## Daily mission

```text
GET /api/v1/daily-mission
```

The persisted snapshot always contains a review target/counter and policy version. New-word and
sentence-practice targets/counters are optional bonuses and do not block core completion unless a
later policy version says otherwise. Uses learner-local dates and timezone.

## Progress and gamification

Included: Confidence Points, streaks, daily mission completion, progress counts/history. Not
included in MVP: leaderboards, badges, social challenges, rewards store.

## Learner sentences and AI feedback

```text
POST /api/v1/learner-sentences
GET  /api/v1/learner-sentences
GET  /api/v1/learner-sentences/{id}
```

Feedback is async-capable. Public processing statuses are
`pending`/`completed`/`failed`/`skipped`; only `completed` carries a learning result of
`correct`/`needs_improvement`/`incorrect`. Persistence uses attempt states
`pending`/`succeeded`/`failed`/`cancelled`. The frontend never sees model names, prompts, or
token/cost data. The full field contract is defined in
[09](09-ai-features.md) §9–10 — that is the canonical source, not restated here.

## Account deletion

The API immediately deactivates the account and revokes sessions, then reports progress for a
staged, retryable purge/anonymization. It must not promise synchronous completion. Learner content,
AI feedback, reports, and identifiers are deleted or irreversibly anonymized; only de-identified,
unlinkable aggregates may remain, subject to legal review.

## OpenAPI rules

The generated operational OpenAPI 3.1 artifact is committed at
`apps/api-worker/openapi/worker-foundation.openapi.json`; CI compares it with the
frozen retired-source contract snapshot and API client.
Operation IDs: `<Verb><Resource>` (e.g. `GetCurrentUser`, `SubmitReview`,
`CreateLearnerSentence`). Must include examples, validation metadata, error responses, stable
operation IDs.

## Testing requirements

Unit, handler, service, workerd, contract-snapshot, OpenAPI golden-file, local D1 integration/migration,
auth, CSRF, cross-user, atomicity, consistency, and idempotency tests.

## Implementation order

Implement DTOs first → never expose Ent models → add auth/CSRF/idempotency middleware → implement
routes per the approved contract → tests before acceptance → export OpenAPI artifacts.

## Review checklist

DTO correctness, contract compliance, security middleware, OpenAPI changes, test coverage, no leaked
internal data.
