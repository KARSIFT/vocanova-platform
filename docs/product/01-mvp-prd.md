# 01 — VocaNova MVP PRD

## 1. Product baseline

The product vision, target learner, learning loop, gamification, spaced repetition, and AI-feedback
principles are defined in the [Product Bible](00-product-bible.md). This PRD defines the bounded MVP surface and
completion criteria.

## 2. MVP core screens (3-tab navigation)

- **Home** — Today's Mission, streak, due-review count, quick entry to discovery and sentence
  practice.
- **Journey** — situation-based discovery (Airport, Restaurant, Hotel Check-in, Job Interview, Daily
  Conversation, Work Meeting, University Class, etc.), word detail, save/unsave.
- **Progress** — Confidence Points, streak, completion history, motivation-focused summary.

Sentence practice is **not** a fourth tab — it's a reusable component surfaced from Home, Word
Detail, and Review Completion. See [03](../design/03-ui-ux-design.md).

There is **no dedicated sentence-history screen in MVP.** Progress includes a bounded recent
sentence-practice section, while history remains part of the existing three-tab information
architecture rather than a separate destination.

## 3. MVP completion criteria

The MVP is done when an authenticated A2–B1 learner can, on a responsive mobile-first web app:

1. discover practical vocabulary by situation;
2. view useful word information (meaning, part of speech, examples, usage notes);
3. save and remove saved words;
4. review due words through the spaced-repetition loop;
5. write a sentence using a selected word and receive AI feedback;
6. complete a daily mission and see it reflected in progress/streak;
7. see a meaningful, backend-authoritative progress summary;
8. do all of the above through Google OAuth or email magic-link authentication, with no password
   login in MVP.

## 4. Explicit MVP exclusions

Native mobile app (React Native/Expo — architected for, not built), leaderboards, badges, social
challenges, rewards store, subscriptions/monetization, teacher dashboards, multi-provider AI
routing, model fine-tuning, complex microservices, message queues without a proven need. Full list
in the [MVP implementation plan](12-mvp-implementation-plan.md) §10.
