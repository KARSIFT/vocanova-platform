# 07 — VocaNova API Contract and DTO Design

## Current contract

The committed OpenAPI 3.1 artifact at
`apps/api-worker/openapi/worker-foundation.openapi.json` describes the public `/api/v1` API. Hono
routes and Zod schemas implement it, and the API client and drift checks keep the generated surface
aligned. Read that artifact or `packages/api-client/src/index.ts` for exact fields; this document
explains the conventions.

## Transport and identity

The API is a Cloudflare TypeScript Module Worker using Hono and D1. It supports Google OAuth and
email magic links, server-managed sessions, secure HttpOnly cookies, UUID identifiers, RFC 3339 UTC
timestamps, and IANA timezone names.

Authenticated unsafe requests require the double-submit CSRF token in `X-CSRF-Token`.
Session-establishment auth endpoints are intentionally exempt. Operations that create
retry-sensitive records also require `Idempotency-Key`: adding user words, review submissions,
sentence-feedback submissions, and account-deletion requests. Keys are scoped by authenticated user
and operation.

Magic-link requests optionally carry a `returnTo` path (at most 2048 characters).
The server includes a validated local app route in the emailed link; the frontend
validates it again before navigating. Missing or unsupported paths fall back to
`/home`. OAuth retains configured exact return URLs and also accepts documented
protected app routes under the configured app base origin. External origins,
credentials, backslashes, control characters and unsupported routes are not
accepted through this local-route extension. No return path changes session or
token semantics. Saved-word detail return paths preserve an encoded word segment and
its meaning query through sign-in. Encoded question marks and hashes stay inside that
segment; encoded separators, control characters, and nested encodings are rejected.

## DTO and response conventions

Routes expose explicit DTOs rather than persistence rows. Validation is defined by each route's Zod
schema; clients must not rely on undeclared fields being retained. Paginated responses contain
`items` and may contain `nextCursor`.

Request failures use a problem-details-shaped response:

```json
{
  "type": "about:blank",
  "title": "Request Failed",
  "status": 422,
  "detail": "The request is invalid.",
  "requestId": "01J2XYZ"
}
```

Some sentence-feedback validation, moderation, provider, and crisis outcomes are successful HTTP
responses with business-level `errorCode`, `errorMessage`, `canRetry`, or
`crisisResourceMessage` fields. Callers must handle both HTTP problems and these result outcomes.

## Main route groups

- Authentication, current-user settings, onboarding, and account lifecycle
- Vocabulary discovery, journeys, saved words, and review submissions
- Daily mission, progress, points, and streaks
- Sentence feedback and feedback reports

Review prompts currently use `multiple_choice` and `self_check`. `result` and `rating` are distinct;
the backend owns review-step and scheduling rules.

Sentence feedback is synchronous at the API boundary:

```text
POST /api/v1/sentence-feedback
POST /api/v1/sentence-feedback/{attemptId}/reports
GET /api/v1/sentence-feedback/history
```

A stored learning result may have status `correct`, `needs_improvement`, or `incorrect`. The result
also reports retryability, report state, and optional business-error fields. Provider names,
prompts, token usage, and costs are not public. The history read is owner-scoped, cursor-paginated,
and returns only completed learner-facing feedback fields. See [09](09-ai-features.md) §9–10.

Account deletion immediately deactivates the user and revokes sessions. Its response contains the
deletion request identifier, timestamps, and replay state; it does not expose internal purge-job
progress.

## Contract maintenance

`GET /api/v1/progress` returns the latest seven persisted mission snapshots, newest first. It is
not a calendar-week feed and does not fill in missing dates. Each `completionHistory` entry retains
its compatible `completed` boolean (`true` for `completed` and `protected`) and may include the
persisted `status` (`open`, `completed`, `missed`, or `protected`). Status is optional for rollout
compatibility: clients receiving an older entry must use a neutral completed/not-completed label
rather than infer a richer state. Streak grace-day balances are server-authoritative and must be
displayed as returned.

Route definitions provide stable operation IDs and schemas to the OpenAPI generator. Any observable
change must update the route/schema, committed OpenAPI artifact, API client, and relevant tests
together. Validation covers contract drift, authentication, CSRF, cross-user isolation,
idempotency, D1 behavior, and Worker execution.
