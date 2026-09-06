# 00 — VocaNova Product Bible

## 1. What Vocanova is

Vocanova is an AI-powered practical English vocabulary learning platform for global A2–B1 learners,
delivered as a responsive, mobile-first web application (not a native app in MVP).

Core learning loop:

1. Discover practical words and phrases, organized by real-life situation (airport, restaurant,
   job interview, work meeting, daily conversation, etc.), not by abstract grammar topic.
2. Save words into personal vocabulary.
3. Review saved words on a spaced-repetition schedule.
4. Write an original sentence using a saved word.
5. Receive concise, encouraging, accurate AI feedback on that sentence.
6. Build a daily habit through a "Today's Mission," Confidence Points, and a gentle streak.

The product's differentiator versus Duolingo-style apps: the learner **produces** language (writes
their own sentence) instead of only selecting or translating a predefined answer, and feedback is
narrowly focused on correct use of the one target word, not general essay grading.

## 2. Target learner

- CEFR A2–B1, global, English as a second language.
- Motivated by practical, immediate use (travel, work, daily life, conversation) rather than exam
  prep or academic study, though "exam" and "study" remain supported onboarding goals.
- Mobile-first usage pattern: short daily sessions, not long study blocks.

## 3. Gamification model

- **Confidence Points** — the product's point/reward currency, earned for reviews, word additions,
  daily-mission completion, and sentence submissions. Source of truth is an append-only ledger
  (`confidence_point_ledger`), not a mutable balance field — see [05](../engineering/05-database-design.md) §12.
- **Streak** — advances only after a full daily mission is completed, uses the learner's local
  timezone, and has a gentle reset (grace days) rather than a hard break. Learners can confirm or
  change their IANA timezone in onboarding and Settings; it sets future daily reset boundaries.
  every 7 completed days, capped at a balance of 2.
- **Daily Mission ("Today's Mission")** — a stable, timezone-aware daily snapshot of a review target,
  optional new-word target, and optional sentence-practice bonus. Settings changes (e.g. changing
  daily review target) apply from the next local day, not retroactively.

## 4. Spaced repetition (high level)

MVP uses deterministic, step-based scheduling (steps 0–7), not a probabilistic algorithm like FSRS —
that's an explicit future swap point behind a stable scheduling interface, not an MVP requirement.
Learner-facing rating scale, exact schedule mechanics, and the reset rule are defined precisely in
[05](../engineering/05-database-design.md) §9 and [08](../design/08-web-app-design.md). The settled rule is:
**"Again / Hard / Good / Easy" ratings, `review_step` 0–7, two consecutive incorrect answers reset to
step 0.**

## 5. AI sentence feedback (high level)

One learner-facing AI capability in MVP: evaluate one learner-written sentence using a selected
target word/phrase and return a status of `correct`, `needs_improvement`, or `incorrect`, plus a
short explanation and (when needed) a corrected sentence. Full behavior, safety rules, prompt
architecture, and evaluation thresholds are in [09](../engineering/09-ai-features.md) — that document is the single
source of truth for AI behavior; don't restate feedback-label wording elsewhere.

Explicit MVP non-goals: open-ended AI chat, general AI tutor, essay correction, pronunciation
scoring, speech recognition, roleplay, AI-generated vocabulary as the authoritative content source,
user-selectable models. See [09](../engineering/09-ai-features.md) §1.

## 6. Product decisions

The founder/product owner sets product vision and material scope. GitHub issues and
pull requests record implementation decisions, review, and validation. Contributors
may propose improvements directly; large product or architectural changes should be
discussed in an issue before implementation.
