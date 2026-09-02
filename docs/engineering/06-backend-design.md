# 06 — VocaNova Backend Design

## Current backend

[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) defines a
TypeScript Module Worker using Hono, generated bindings, typed repositories, and D1 as the backend.
The feature boundaries, workflows, authorization rules, idempotency, and observable `/api/v1`
behavior below are current requirements.

## 1. Overview

Cloudflare TypeScript modular-monolith API Worker: Hono routing, schema-driven validation/OpenAPI,
generated binding types, typed domain/repository boundaries, D1 persistence, REST-first `/api/v1`,
server-managed sessions, canonical UTC timestamps, and IANA timezone handling.

## 2. Architecture principles

Modular monolith, feature-oriented business modules, explicit D1 atomicity and consistency
boundaries, idempotent important writes, secure-by-default, and no premature services or queues.

## 3. Backend modules

Business: `identity`, `users`, `content`, `learning`, `reviews`, `missions`, `gamification`,
`writingai`, `accounts`. Infrastructure: `foundation`, `app`. Rules: business may import foundation;
foundation must never import business; writes belong to their owning module; cross-module
coordination happens through services, not direct cross-module table access.

## 4. Project structure

```text
apps/api-worker/
  src/{identity,content,missions,ai-feedback,repositories,domain,http,data-conversion}/
  src/{app,config,index}.ts
  migrations/
  openapi/
  scripts/
  test/
```

## 5. API design

Hono, `/api/v1`, schema-driven OpenAPI, and a deterministic drift check against the committed
contract and API client. [07](07-api-contract-and-dto-design.md) defines stability rules. Main
groups remain auth, current user, discovery, user words, reviews, daily missions, gamification,
learner sentences, and account lifecycle.

## 6. Authentication

Google OAuth + email magic link, no password login in MVP. Sessions: D1-stored, secure
HttpOnly cookies, hashed session tokens, 30-day lifetime, no sliding renewal initially. Magic links:
15-minute expiry, single use, stored hashed.

## 7. Authorization and validation

`/me` routes require authentication; private resources return 404 (not 403) when inaccessible to the
requester; deleted users can't authenticate. DTO validation (required fields, formats, lengths,
enums) is separate from domain validation (learning rules, review rules, mission rules, reward
rules).

## 8. Atomicity and D1 repository usage

Prepared statements are mandatory for dynamic values. Typed repository interfaces isolate D1 from
domain logic. Top-level use-case services own atomic D1 `batch()` operations and session-consistency
requirements for review submission, word addition, account deletion, and reward creation. A Durable
Object requires a measured invariant that an atomic batch cannot safely represent.

## 9. Idempotency

Required for: review submission, adding words, learner sentences, AI feedback, account deletion.
Storage: idempotency key + authenticated-user scope + operation scope + request fingerprint,
unique on `(user_id, scope, key)`. The same key from different users is isolated. Duplicate
processing for the same user and scope (reused key with a different fingerprint or still in
progress) returns `409`.

## 10. Core learning workflows

**Review ratings: Again / Hard / Good / Easy.** Result
and rating are distinct. Objective incorrect answers record `Again`; objective correct answers
allow Hard/Good/Easy; self-check result is derived from the rating. MVP movement: Again → step back
with a floor of 0; two consecutive incorrect/Again attempts → reset to step 0; Hard → same step;
Good/Easy → step forward with a cap of 7 (matches [05](05-database-design.md) §9). Word addition:
creates `user_words`, starts at review step 1 in the UI-visible sense (backend detail: initial
`review_step=0` per the DB check constraint, first review moves it forward), `next_review_at = now`,
awards a Confidence Point reward once. Daily mission snapshots always include the review target and
counter; they may also include versioned new-word and sentence-practice targets/counters. Optional
goals do not block core mission or streak completion unless a later policy version says otherwise.
Snapshots are created lazily using the user's timezone.

## 11. Gamification

Confidence Points source of truth: `confidence_point_ledger` (see [05](05-database-design.md) §12).
Reward configuration (values, not schema — these live in backend config, not a DB constraint):

```text
Add word:               +2
Review — Again:         +1
Review — Hard:          +2
Review — Good:          +5
Review — Easy:          +6
Daily mission complete: +10
Sentence submitted:     +3
AI feedback received:   +2
```

Streak: increases only after full daily-mission completion. Grace days: earn one every 7 completed
days, maximum balance 2 (matches `grace_day_ledger` semantics).

## 12. AI feedback

Workflow: save learner sentence → request AI feedback → store feedback attempt → reward completion.
Provider abstraction: `FeedbackProvider` interface. Rules: 8-second provider timeout and 10-second
total request budget (see [09](09-ai-features.md) §18, the authoritative timeout/retry policy), no
real AI calls in CI, fake provider for tests, rate limits applied.

## 13. Timezone

Store timestamps in UTC; store user timezone as an IANA string; calculate daily logic from local
date. Timezone resolution priority: user settings → onboarding answer → browser timezone → UTC
fallback.

## 14. Account deletion

Immediately deactivate the account and revoke all sessions, then complete a staged, retryable,
verified purge/anonymization. Delete or irreversibly anonymize identifiers, learner-generated text,
AI feedback, and reports. Retain history only when de-identified and no longer linkable to the
learner. Legal review is required before production; see [05](05-database-design.md) §16.

## 15. Background jobs

There is no background-job runner or queue in the current application. Workflows are synchronous,
and cleanup is not currently automated.

## 16. Security and observability

Structured JSON logs and request IDs. Never log tokens, secrets, or private learner content.
HTTPS, CSRF protection, CORS allowlist, secure cookies, hashed tokens, input validation.

## 17. Testing

Required target evidence: unit, service, HTTP, workerd, local D1 repository/migration, contract
parity, authorization, atomicity/consistency, security, contract-snapshot, and
retired-source conversion tests.

## 18. Domain implementation order

Worker/backend foundation → D1 foundation → authentication → user profile/settings →
content/discovery → user words → daily missions → review engine → gamification → AI
feedback → account lifecycle → production hardening. Deliver coherent changes through
focused GitHub pull requests with relevant tests.
