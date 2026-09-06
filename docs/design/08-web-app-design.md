# 08 — VocaNova Web Application Design

## Current runtime

[ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md) defines the
Next.js 16 App Router, Server Components, SSR, middleware, and OpenNext Cloudflare Worker runtime. The web
calls the Hono API Worker through a service binding where practical and never accesses
D1 directly. Compatibility is proven under workerd; `next build` alone is not evidence.

## Summary

Responsive, mobile-first Next.js web application integrated with the `/api/v1` Worker API. Core loop:
discover useful words → save → review with spaced repetition → use words in learner sentences →
receive lightweight AI feedback → build daily habit.

## Frontend foundation

Next.js App Router + TypeScript, transformed by `@opennextjs/cloudflare` and executed on Workers.
The Hono `/api/v1` Worker is the backend authority. Single repo,
frontend under `apps/web` per [04](../engineering/04-technical-architecture.md) §5. pnpm, Tailwind,
Server Components, route-local client components, React state and native forms, Playwright, and
Node-based middleware and compatibility tests.

## Architecture

```text
apps/web/src/app/         # routes, layouts, and route-local components
apps/web/src/lib/         # cookies, environment, session, and API transport
apps/web/tests/e2e/       # browser and accessibility coverage
apps/web/tests/lighthouse/ # performance budgets and runner
```

Feature areas: auth, onboarding, dashboard, discovery, words, reviews, sentences, progress,
settings.

## Routing

Authenticated product routes use the `(app)` group. Public, authentication, and onboarding routes
live directly under `app/`.

```text
/
/signin
/auth/magic
/onboarding
/home
/discover
/discover/saved
/discover/saved/[word]
/discover/[situation]
/discover/[situation]/[word]
/reviews
/progress
/settings
/settings/account
```

There is deliberately **no** sentence-history route (see [03](03-ui-ux-design.md) §2): sentence
practice is a component, not a route.

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
  tip, and an optional fixed-reason feedback report (see [09](../engineering/09-ai-features.md) for
  the full contract).
- **Progress**: simple, motivation-focused, backend-authoritative.
- **Settings**: learning preferences, account basics, account deletion with confirmation.

## API integration

The shared hand-maintained TypeScript client in `packages/api-client` calls `/api/v1` with
`credentials: "include"`, `X-CSRF-Token` on unsafe methods, `Idempotency-Key` support, and no
frontend token storage. Contract-drift tests compare Worker operations, the committed OpenAPI
artifact, the compatibility snapshot, and client route coverage.

## Quality standards

Mobile-first: target 360–430px, minimum 44px touch targets. Accessibility: WCAG 2.2 AA target,
keyboard support, focus management, screen-reader-friendly forms. Performance: lightweight
dependencies, route-level code splitting, Lighthouse targets Performance 85+ / Accessibility 95+ /
Best Practices 90+.

## Implementation order

OpenNext/workerd adaptation → UI foundation → OpenAPI/API client parity → routes/layouts →
authentication → onboarding → core learning loop → tests, accessibility,
Lighthouse, dry-run, size, and startup evidence.

## Review checklist

Architecture boundaries, API contract usage, security, auth/session behavior, CSRF/idempotency,
accessibility, loading/error states, tests, Worker compatibility, and overengineering.

## MVP completion criteria

Authentication, onboarding, home mission loop, discovery, saved words, review, sentence feedback,
progress, settings/account management all work; CI contract checks exist; critical flows are tested.
(Matches the [MVP PRD](../product/01-mvp-prd.md) §3 — restated here only as the web-app-specific checklist,
not a separate decision.)
