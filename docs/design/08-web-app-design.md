---
id: DOC-08
title: VocaNova Web Application Design
version: 1.1
document_type: web-application-design
status: approved
owner: founder
canonical_path: docs/design/08-web-app-design.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-22
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-03
  - DOC-04
  - DOC-07
  - DOC-09
related_decisions:
  - ADR-0003
adoption_change: VOC-008
source_files:
  - path: 08-web-app-design.md
    sha256: da9154f1962e52f5046c712e581f5627122f48aec86684b24f69de1b9ee129d5
---

# 08 — VocaNova Web Application Design

## Active VOC-080 runtime amendment

[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) keeps the
Next.js 16 App Router, Server Components, SSR, middleware, and current UI behavior,
but replaces standalone Docker hosting with OpenNext on a Cloudflare Worker. The web
calls the Hono API Worker through a service binding where practical and never accesses
D1 directly. Compatibility is proven under workerd; `next build` alone is not evidence.

## Summary

Responsive, mobile-first Next.js web application integrated with the `/api/v1` Worker API. Core loop:
discover useful words → save → review with spaced repetition → use words in learner sentences →
receive lightweight AI feedback → build daily habit.

## Frontend foundation

Next.js App Router + TypeScript, transformed by `@opennextjs/cloudflare` and executed on Workers.
The Hono `/api/v1` Worker is the backend authority. Single repo,
frontend under `apps/web` per [04](../engineering/04-technical-architecture.md) §5. pnpm. Tailwind +
shadcn/ui-style components. TanStack Query for server state, React state for UI state. React Hook
Form + Zod. Vitest, React Testing Library, Playwright.

## Architecture

```text
app/                # routes and layouts
src/features/       # product feature modules
src/shared/          # shared components, API client, utilities
tests/e2e/
```

Feature areas: auth, onboarding, dashboard, discovery, words, reviews, sentences, progress,
settings.

## Routing

Route groups: `(public)`, `(onboarding)`, `(app)`.

```text
/
/login
/magic-link
/onboarding
/home
/discover
/words
/words/[userWordId]
/review
/review/session
/progress
/settings
/settings/account
```

Note: there is deliberately **no** sentence-history route (see [03](03-ui-ux-design.md) §2 and
[the migration notes](../archive/README-migration-notes.md#4-sentence-history-screen-conflict)) —
sentence practice is a component, not a route.

## Core UX decisions

- **Home**: daily-mission focused; shows streak, next action, review summary, discovery entry,
  progress summary.
- **Discovery**: one word at a time; backend controls content/sequencing; save must succeed before
  moving forward.
- **Review**: focused session, show-answer active recall, **ratings: Again, Hard, Good, Easy**.
  Result and rating remain distinct: objective incorrect answers record `Again`; objective correct
  answers allow Hard/Good/Easy; self-check prompts derive result from the chosen rating. See
  [05](../engineering/05-database-design.md) §9 and [06](../engineering/06-backend-design.md) §10;
  the backend controls scheduling and progress.
- **Sentence practice**: part of the MVP core loop, reusable component, accessible from Home, Word
  Detail, and Review Completion; AI feedback includes result, correction, explanation, improvement
  tip (see [09](../engineering/09-ai-features.md) for the full contract).
- **Progress**: simple, motivation-focused, backend-authoritative.
- **Settings**: learning preferences, account basics, account deletion with confirmation.

## API integration

Generated API client against `/api/v1`, `credentials: "include"`, `X-CSRF-Token` on unsafe methods,
`Idempotency-Key` support, and no frontend token storage. TypeScript types derive from the committed
OpenAPI contract; Worker generation and client artifacts fail closed on drift.

## Quality standards

Mobile-first: target 360–430px, minimum 44px touch targets. Accessibility: WCAG 2.2 AA target,
keyboard support, focus management, screen-reader-friendly forms. Performance: lightweight
dependencies, route-level code splitting, Lighthouse targets Performance 85+ / Accessibility 95+ /
Best Practices 90+.

## Builder handoff order

OpenNext/workerd adaptation → UI foundation → OpenAPI/API client parity → TanStack Query →
routes/layouts → authentication → onboarding → core learning loop → tests, accessibility,
Lighthouse, dry-run, size, and startup evidence.

## Independent review

Architecture boundaries, API contract usage, security, auth/session behavior, CSRF/idempotency,
accessibility, loading/error states, tests, Worker compatibility, and overengineering. The reviewer
must be a different participant from the builder; no vendor is permanent.

## MVP completion criteria

Authentication, onboarding, home mission loop, discovery, saved words, review, sentence feedback,
progress, settings/account management all work; CI contract checks exist; critical flows are tested.
(Matches [DOC-01](../product/01-mvp-prd.md) §3 — restated here only as the web-app-specific checklist,
not a separate decision.)
