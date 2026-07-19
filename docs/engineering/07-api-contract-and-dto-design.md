---
id: DOC-07
title: VocaNova API Contract and DTO Design
version: 1.0
document_type: api-contract
status: proposed
owner: founder
canonical_path: docs/engineering/07-api-contract-and-dto-design.md
approved_at: null
last_reviewed_at: 2026-07-19
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-04
  - DOC-05
  - DOC-06
  - DOC-08
  - DOC-09
related_decisions: []
adoption_change: VOC-007
source_files:
  - path: 07-api-contract-and-dto-design.md
    sha256: c1b44de8d2edd02a98098b03b6839f553c594a8225e7371952751a8e19f6883e
---
# 07 — VocaNova API Contract and DTO Design

> **Lifecycle notice:** This document is proposed and is not an authoritative implementation input until separately adopted. Words such as “approved” within the imported body describe the source snapshot, not this repository lifecycle.

## Core API decisions

REST base path `/api/v1`. Go + Huma v2 + chi. PostgreSQL + Ent. Server-managed PostgreSQL sessions.
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

**Idempotency** (header `Idempotency-Key`, 24h retention) required for: `POST /api/v1/user-words`,
`POST /api/v1/reviews/submissions`, `POST /api/v1/learner-sentences`,
`POST /api/v1/account-deletion-requests`.

## Review system

```text
GET  /api/v1/reviews/due
POST /api/v1/reviews/submissions
```

Prompt types: `meaning_choice`, `word_choice`, `self_check` (see [05](05-database-design.md) §9 for the
full prompt-type list including `typing`/`sentence_usage`, which are a later superset — these three
were the initial MVP set). Scheduling: correct answer moves one step forward; incorrect answer moves
one step back; **two incorrect answers in a row reset to step 0** (reconciled — see above); backend
owns scheduling logic.

## Daily mission

```text
GET /api/v1/daily-mission
```

Targets: reviews, new words, learner sentences. Uses learner-local dates and timezone.

## Progress and gamification

Included: Confidence Points, streaks, daily mission completion, progress counts/history. Not
included in MVP: leaderboards, badges, social challenges, rewards store.

## Learner sentences and AI feedback

```text
POST /api/v1/learner-sentences
GET  /api/v1/learner-sentences
GET  /api/v1/learner-sentences/{id}
```

Feedback is async-capable; statuses: `pending`/`completed`/`failed`/`skipped`. The frontend never
sees model names, prompts, or token/cost data. The learning-facing feedback status enum
(`correct`/`needs_improvement`/`incorrect`) and full field contract are defined in
[09](09-ai-features.md) §10 — that is the canonical source, not restated here.

## Account deletion

Immediate anonymization, session revocation, remove personal information, preserve anonymized
analytics data where needed.

## OpenAPI rules

Operation IDs: `<Verb><Resource>` (e.g. `GetCurrentUser`, `SubmitReview`,
`CreateLearnerSentence`). Must include examples, validation metadata, error responses, stable
operation IDs.

## Testing requirements

Unit, handler, service, contract tests, OpenAPI golden-file checks, PostgreSQL integration, auth
tests, CSRF tests, idempotency tests.

## Codex handoff

Implement DTOs first → never expose Ent models → add auth/CSRF/idempotency middleware → implement
routes per the approved contract → tests before acceptance → export OpenAPI artifacts.

## Claude Code review

DTO correctness, contract compliance, security middleware, OpenAPI changes, test coverage, no leaked
internal data.
