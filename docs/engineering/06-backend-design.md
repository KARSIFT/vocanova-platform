---
id: DOC-06
title: VocaNova Backend Design
version: 1.0
document_type: backend-design
status: proposed
owner: founder
canonical_path: docs/engineering/06-backend-design.md
approved_at: null
last_reviewed_at: 2026-07-19
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-04
  - DOC-05
  - DOC-07
  - DOC-09
  - DOC-10
related_decisions: []
adoption_change: VOC-007
source_files:
  - path: 06-backend-design.md
    sha256: f2f5dd0159cbefc96df37d9a1fd78adb34e22680fa18fe356973ec76a69d2578
---
# 06 — VocaNova Backend Design

> **Lifecycle notice:** This document is proposed and is not an authoritative implementation input until separately adopted. Words such as “approved” within the imported body describe the source snapshot, not this repository lifecycle.

## 1. Overview

Go modular monolith backend: Go, PostgreSQL, Ent ORM, Atlas migrations, Huma v2, chi router, Uber Fx
DI, REST-first API, server-managed sessions, UTC timestamps, IANA timezone handling.

## 2. Architecture principles

Modular monolith, feature-oriented business modules, strong transaction boundaries, idempotent
important writes, secure-by-default, avoid premature microservices/queues.

## 3. Backend modules

Business: `identity`, `users`, `content`, `learning`, `reviews`, `missions`, `gamification`,
`writingai`, `accounts`. Infrastructure: `foundation`, `app`. Rules: business may import foundation;
foundation must never import business; writes belong to their owning module; cross-module
coordination happens through services, not direct cross-module table access.

## 4. Project structure

```text
backend/
  cmd/api/
  app/{bootstrap,api}/
  business/{identity,users,content,learning,reviews,missions,gamification,writingai,accounts}/
  foundation/{database,auth,web,idempotency,audit,clock,timezone,config,log}/
  ent/schema/
  migrations/
```

## 5. API design

Huma v2 + chi, `/api/v1` prefix, dynamic OpenAPI generation from Huma (no committed OpenAPI file
required purely for this reason — but see [07](07-api-contract-and-dto-design.md): a generated OpenAPI
artifact is committed for TypeScript codegen and drift detection, which is a separate, later
decision). Main groups: auth, current user, discovery, user words, reviews, daily missions,
gamification, learner sentences, account lifecycle.

## 6. Authentication

Google OAuth + email magic link, no password login in MVP. Sessions: PostgreSQL-stored, secure
HttpOnly cookies, hashed session tokens, 30-day lifetime, no sliding renewal initially. Magic links:
15-minute expiry, single use, stored hashed.

## 7. Authorization and validation

`/me` routes require authentication; private resources return 404 (not 403) when inaccessible to the
requester; deleted users can't authenticate. DTO validation (required fields, formats, lengths,
enums) is separate from domain validation (learning rules, review rules, mission rules, reward
rules).

## 8. Transactions and Ent usage

Ent used directly in services/query files. Repository interfaces are reserved for true external
boundaries (AI provider, email provider, clock) — not used as a blanket abstraction over Ent.
Top-level use-case services own transactions for: review submission, word addition, account
deletion, reward creation.

## 9. Idempotency

Required for: review submission, adding words, learner sentences, AI feedback, account deletion.
Storage: idempotency key + user scope + request fingerprint. Duplicate processing (reused key or
still in progress) returns `409`.

## 10. Core learning workflows

**Review ratings (canonical — see reconciliation note above): Again / Hard / Good / Easy.** MVP
movement: Again → step back; two consecutive Agains → reset to step 0 (matches
[05](05-database-design.md) §9 exactly); Hard → same step; Good/Easy → step forward. Word addition:
creates `user_words`, starts at review step 1 in the UI-visible sense (backend detail: initial
`review_step=0` per the DB check constraint, first review moves it forward), `next_review_at = now`,
awards a Confidence Point reward once. Daily mission goals: review N words (default 20), add up to 5
new words, optional sentence-practice bonus — created lazily using the user's timezone.

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
Provider abstraction: `FeedbackProvider` interface. Rules: 12-second provider timeout (see
[09](09-ai-features.md) §28 for the more precise 8s-provider/10s-total figures — that document is the
authoritative source for AI timeout/retry policy; treat this as an earlier, slightly looser draft of
the same rule), no real AI calls in CI, fake provider for tests, rate limits applied.

## 13. Timezone

Store timestamps in UTC; store user timezone as an IANA string; calculate daily logic from local
date. Timezone resolution priority: user settings → onboarding answer → browser timezone → UTC
fallback.

## 14. Account deletion

Deletion means anonymization + deactivation: remove email, avatar, OAuth identifiers, sessions,
learner-generated text; keep anonymized learning history where required (matches
[05](05-database-design.md) §16 exactly).

## 15. Background jobs

No queue system in MVP — synchronous workflows. Lightweight cleanup only: expired sessions, expired
magic links, old idempotency keys.

## 16. Security and observability

`log/slog`, request IDs, structured logs. Never log tokens, secrets, or private learner content.
HTTPS, CSRF protection, CORS allowlist, secure cookies, hashed tokens, input validation.

## 17. Testing

Required: unit, service, HTTP, PostgreSQL integration, migration, security tests. CI: `gofmt`,
`go vet`, `go test`, build, PostgreSQL integration tests. Later additions: `staticcheck`,
`govulncheck`, Ent consistency checks, Atlas validation.

## 18. Codex implementation order

Backend foundation → database foundation → authentication → user profile/settings →
content/discovery → user words → daily missions → review engine → gamification → AI feedback →
account lifecycle → production hardening. Phase-based, with GitHub PRs and Claude Code review for
important changes. Exact review and merge authority per risk class comes from the
[canonical governance index](../governance/README.md), not this backend design; [DOC-19](../operations/19-governance-reconciliation-notes.md)
provides non-authoritative orientation.
