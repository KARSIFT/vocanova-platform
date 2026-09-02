# 04 — VocaNova Technical Architecture

## Current architecture

[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) is the current
runtime and data direction. VocaNova uses Next.js through OpenNext on a Cloudflare
Web Worker, a TypeScript/Hono Cloudflare API Worker, and Cloudflare D1. Compact contract and schema
snapshots preserve compatibility and synthetic conversion checks without retaining the retired server runtime.

## 1. Purpose and goals

Defines the technical architecture for Vocanova MVP: simple enough for a small team, secure by
default, scalable without premature complexity, ready for future mobile expansion.

## 2. Product technical direction

MVP platform: responsive, mobile-first web application, no native mobile app initially. Core loop:
discover → save → review (spaced repetition) → write sentence → receive AI feedback → build daily
habit.

## 3. Architecture principles

Modular monolith first; frontend/backend separated; business logic stays transport- and
storage-independent behind the `/api/v1` contract; D1 becomes the relational source of truth after
parity and separately authorized cutover. Prefer simple stable technologies, avoid premature
microservices, design for future mobile clients, keep explicit domain boundaries and testable
behavior, and record important choices as ADRs.

## 4. High-level architecture

```text
Browser
   |
Cloudflare Web Worker (Next.js + OpenNext)
   |  service binding / HTTPS /api/v1
   v
Cloudflare API Worker (TypeScript + Hono)
   |
   +-- Cloudflare D1
   +-- Google OAuth + email delivery boundary
   +-- AI provider abstraction
   +-- feature bindings and privacy-safe observability
```

Future mobile: Next.js Web + Expo Mobile both call the same `/api/v1` Worker contract.

## 5. Repository architecture

Single monorepo, `vocanova-platform`:

```text
vocanova-platform/
apps/
  web/          # Next.js/OpenNext Worker target
  api-worker/   # TypeScript/Hono/D1 API runtime
  mobile/       # Future Expo app
packages/
  api-client/
  design-tokens/
  eslint-config/
  typescript-config/
docs/
scripts/
.github/
```

## 6. Frontend architecture

Next.js (App Router) + React + TypeScript + Tailwind + shadcn/ui + TanStack Query + React Hook Form

- Zod + Vitest + React Testing Library + Playwright + pnpm. OpenNext adapts the app to Workers.
  The web Worker never accesses D1 directly; the `/api/v1` API Worker remains the business authority;
  server state uses TanStack Query.

## 7. Backend architecture

TypeScript Module Worker + Hono + schema-driven validation/OpenAPI + typed D1 repositories and
generated Cloudflare binding types. The modular-monolith business modules remain `auth`, `user`,
`settings`, `vocabulary`, `journey`, `review`, `sentence`, `aifeedback`, `mission`, `progress`, and
`streak`. Business logic must not depend directly on Hono, D1, auth SDKs, or AI SDKs.

## 8. API architecture

REST, JSON, versioned under `/api/v1`. The committed OpenAPI 3.1 artifact and generated API client
are the migration seam. The Worker API generates and compares its contract deterministically against
the committed reference; [06](06-backend-design.md) and [07](07-api-contract-and-dto-design.md)
define stability rules. Hono handles Worker routing and middleware.

## 9. Authentication

Google OAuth + email magic link, no password login in MVP. Internal identity tables
(`users`, `user_identities`/`external_identities`) decouple business data from the external identity
provider — business tables reference Vocanova user IDs, never provider IDs directly.

## 10. Database architecture

Cloudflare D1 with explicit SQLite schema and forward-only Wrangler migrations. Separate local,
staging, and production databases retain clear domain ownership, canonical UTC timestamp encoding,
and IANA timezone strings for daily logic. [05](05-database-design.md) defines the target mapping;
the retired PostgreSQL schema snapshot remains only a synthetic conversion oracle.

## 11. Spaced repetition

Deterministic stage-based scheduling (not FSRS in MVP). Rating scale, exact step mechanics, and
reset rule are canonical in [05](05-database-design.md) §9. Future algorithms can replace the
scheduler behind a stable interface.

## 12. Daily mission

A stable daily snapshot (user, local date, review target, selected items, completion status, policy
version). Settings changes apply from the next local day, not retroactively.

## 13. AI feedback architecture

AI purpose: help learners use vocabulary correctly. Canonical statuses are `correct` /
`needs_improvement` / `incorrect`; the authoritative model lives in [09](09-ai-features.md).
Architecture:
Business Service → Feedback Provider Interface → AI Provider. Rules: save the sentence before the AI
call, validate structured output, retry safely (bounded), store feedback history, control cost.

## 14. Progress and gamification

Backend owns Confidence Points, streaks, mission completion, and progress summaries. Points use an
event-based ledger with idempotency keys and transactional updates (see [05](05-database-design.md)
§12). Streak advances only after mission completion, uses local timezone, has gentle reset
behavior (grace days).

## 15. Background jobs

No Kafka, no complex queue in MVP. Simple synchronous workflows; lightweight cleanup jobs only
(expired sessions, expired magic links, old idempotency keys). Future: Temporal for long workflows,
transactional outbox for reliable events, if actually needed.

## 16. Security baseline

HTTPS only, strict CORS, security headers, input validation, authorization checks on every
learner-owned resource, rate limiting, secret management, secure database roles, privacy-aware
logging (no learner sentence text, no tokens/secrets in logs).

## 17. Observability

Structured logging, request IDs, OpenTelemetry, metrics, error tracking. Monitor API latency,
errors, database health, AI usage, job failures.

## 18. Testing strategy

API: unit, workerd, local D1 migration/repository, contract-snapshot, authorization, atomicity, and
consistency tests. Frontend: Vitest, React
Testing Library, Playwright, accessibility, Lighthouse, OpenNext build/dry-run, and workerd requests.
AI: fake-provider tests and evaluation fixtures; never a paid provider in normal CI. Coverage is
risk-based, not a flat percentage target.

## 19. GitHub workflow

The repository uses `main` as its only long-lived branch. Work is delivered through
focused short-lived branches, pull requests, product CI, review, and squash merges.
Large architectural changes are discussed in an issue first.

## 20. CI/CD

Backend/frontend tests, type checks, security checks, generated-code checks, Worker dry
runs, and D1 migration/parity checks belong in CI. Pull-request automation is
credential-free and does not deploy. A future remote-delivery workflow must keep
environment credentials isolated and document migration, smoke-test, and rollback
behavior.

## 21. Scalability strategy

Start with modular monolith; extract services only when scaling, ownership, or reliability actually
require it and boundaries are proven. No microservices for MVP.

## 22. Future mobile architecture

React Native + Expo + Expo EAS, same API, when mobile work actually starts. Offline support is
postponed until then.

## Final technology stack

Frontend: Next.js, TypeScript, Tailwind, shadcn/ui, OpenNext, Cloudflare Workers. Backend:
TypeScript, Hono, generated bindings, D1. Auth: Google OAuth + email magic link. AI: provider abstraction, one provider operated at
a time. Infrastructure: managed Cloudflare Workers/D1 with no owned server. Future: Expo; async
Cloudflare capabilities only after a measured requirement.
