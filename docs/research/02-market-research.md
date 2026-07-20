---
id: DOC-02
title: VocaNova Market Research
version: 1.0
document_type: market-research
status: approved
owner: founder
canonical_path: docs/research/02-market-research.md
approved_at: 2026-07-21
last_reviewed_at: 2026-07-21
review_cycle: when-needed
supersedes: null
related_documents:
  - DOC-00
  - DOC-01
related_decisions: []
adoption_change: VOC-008
source_files:
  - path: 02-market-research.md
    sha256: 6de75b467781bb90297b2a663c16be613cddd24b0efafa58cefe6de395e314c5
---
# 02 — VocaNova Market Research

## Positioning

Vocanova competes in the crowded language-learning app space, but differentiates from the dominant
pattern (Duolingo-style gamified multiple-choice/translation exercises) by requiring learners to
**produce** original sentences using target vocabulary and receive **focused, encouraging AI
feedback** on that specific usage — not a general grammar or essay grade.

Positioning statement: Vocanova is for A2–B1 learners who already know some English and want to
practically **use** vocabulary in real situations, not restart from beginner exercises or grind
abstract grammar drills.

## Why this gap exists

- Duolingo-style apps optimize for engagement/retention via short selectable-answer exercises; they
  rarely ask learners to generate original language, so learners can "pass" exercises without being
  able to actually produce the word in a sentence.
- Traditional grammar/essay-correction tools (Grammarly-style) are too broad and not
  vocabulary-focused; they also assume higher proficiency and longer-form writing than an A2–B1
  learner typically produces.
- Flashcard/SRS apps (Anki-style) handle spaced repetition well but provide no production practice
  and no feedback loop at all.

Vocanova's bet: combining situation-based practical vocabulary discovery + spaced repetition +
lightweight sentence production + narrow AI feedback is a real, underserved gap between these three
categories.

## Naming note: "Confidence Points"

This document is the first in the corpus to use the term **Confidence Points** as the name for
Vocanova's point/reward system (earlier docs used only generic gamification language). The term is
adopted as settled product vocabulary in [DOC-01](../product/01-mvp-prd.md) and used consistently
throughout the rest of these documents — see
[the migration notes](../product/README-migration-notes.md#3-confidence-points-origin) for detail.

## Target learner validation

Confirms the A2–B1, globally-distributed, mobile-first, practical-use-motivated learner profile
already stated in the Product Bible. Learners are motivated by near-term practical outcomes (travel,
work, daily conversation) more than long-term academic or exam goals, though exam/study remain
supported onboarding paths, not the primary wedge.

## Competitive risk

The core risk this research flags: AI sentence feedback is the product's differentiator, but it is
also the most expensive, highest-latency, and highest-risk-of-being-wrong feature to build well.
This is why [09](../engineering/09-ai-features.md) treats AI feedback as a single, tightly-scoped MVP capability with
strict non-goals, rather than opening it up into a general AI tutor — a broader AI surface would be
easier to copy and harder to get right at launch.
