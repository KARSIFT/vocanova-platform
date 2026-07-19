---
id: DOC-08
title: VocaNova Web Application Design
version: 1.0
document_type: web-application-design
status: proposed
owner: founder
canonical_path: docs/design/08-web-app-design.md
approved_at: null
last_reviewed_at: 2026-07-19
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-03
  - DOC-04
  - DOC-07
  - DOC-09
related_decisions: []
adoption_change: VOC-007
source_files:
  - path: 08-web-app-design.md
    sha256: da9154f1962e52f5046c712e581f5627122f48aec86684b24f69de1b9ee129d5
---
# 08 — VocaNova Web Application Design

> **Lifecycle notice:** This document is proposed and is not an authoritative implementation input until separately adopted. Words such as “approved” within the imported body describe the source snapshot, not this repository lifecycle.

## Summary

Responsive, mobile-first Next.js web application integrated with the Go backend API. Core loop:
discover useful words → save → review with spaced repetition → use words in learner sentences →
receive lightweight AI feedback → build daily habit.

## Proposed frontend foundation

Next.js App Router + TypeScript, deployed to Cloudflare (see [10](../operations/10-development-workflow.md) for the
concrete Cloudflare Workers + Render split). Go `/api/v1` is the backend authority. Single repo,
frontend under `/web` (or `apps/web` per [04](../engineering/04-technical-architecture.md) §5). pnpm. Tailwind +
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
[the migration notes](../product/README-migration-notes.md#4-sentence-history-screen-conflict)) —
sentence practice is a component, not a route.

## Core UX decisions

- **Home**: daily-mission focused; shows streak, next action, review summary, discovery entry,
  progress summary.
- **Discovery**: one word at a time; backend controls content/sequencing; save must succeed before
  moving forward.
- **Review**: focused session, show-answer active recall, **ratings: Again, Hard, Good, Easy**
  (canonical scale — see [05](../engineering/05-database-design.md) §9 and [06](../engineering/06-backend-design.md) §10 for how these
  map to `review_step` movement); backend controls scheduling/progress.
- **Sentence practice**: part of the MVP core loop, reusable component, accessible from Home, Word
  Detail, and Review Completion; AI feedback includes result, correction, explanation, improvement
  tip (see [09](../engineering/09-ai-features.md) for the full contract).
- **Progress**: simple, motivation-focused, backend-authoritative.
- **Settings**: learning preferences, account basics, account deletion with confirmation.

## API integration

Handwritten fetch wrapper against `/api/v1`, `credentials: "include"`, `X-CSRF-Token` on unsafe
methods, `Idempotency-Key` support, no frontend token storage. TypeScript types generated from Huma
OpenAPI via `openapi-typescript`; contract drift detected in CI.

## Quality standards

Mobile-first: target 360–430px, minimum 44px touch targets. Accessibility: WCAG 2.2 AA target,
keyboard support, focus management, screen-reader-friendly forms. Performance: lightweight
dependencies, route-level code splitting, Lighthouse targets Performance 85+ / Accessibility 95+ /
Best Practices 90+.

## Codex handoff order

Next.js setup → UI foundation → OpenAPI generation → API client → TanStack Query → routes/layouts →
authentication → onboarding → core learning loop → tests and accessibility.

## Claude Code review

Architecture boundaries, API contract usage, security, auth/session behavior, CSRF/idempotency,
accessibility, loading/error states, tests, overengineering.

## MVP completion criteria

Authentication, onboarding, home mission loop, discovery, saved words, review, sentence feedback,
progress, settings/account management all work; CI contract checks exist; critical flows are tested.
(Matches [DOC-01](../product/01-mvp-prd.md) §3 — restated here only as the web-app-specific checklist,
not a separate decision.)
