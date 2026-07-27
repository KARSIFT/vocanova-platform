---
id: DOC-12
title: VocaNova MVP Implementation Plan
version: 1.0
document_type: implementation-plan
status: approved
owner: founder
canonical_path: docs/product/12-mvp-implementation-plan.md
approved_at: 2026-07-21
last_reviewed_at: 2026-07-21
review_cycle: monthly
supersedes: null
related_documents:
  - DOC-00
  - DOC-01
  - DOC-03
  - DOC-04
  - DOC-10
  - DOC-11
  - DOC-13
  - DOC-18
related_decisions: []
adoption_change: VOC-008
source_files:
  - path: 11-implementation-roadmap.md
    sha256: e4745ab74e3951004d20e6fd580c56ee7939a316bb427adbc2a9b09ae54b05a3
---
# 12 — VocaNova MVP Implementation Plan

## 1. Product outcome

The MVP proves one loop: discover useful words → save → review with spaced repetition → write an
original sentence → receive focused AI feedback → complete daily missions → build a habit — on a
responsive mobile-first web app. See [DOC-01](01-mvp-prd.md) §3 for the exact completion
criteria; this document is about *sequencing* the build, not restating what "done" means.

## 2. Delivery hierarchy

`Milestone → Epic (<MILESTONE>-E<n>) → GitHub Issue (<MILESTONE>-I<n>) → Pull Request
(PR-<MILESTONE>-<n>)`. One PR = one coherent architectural/product change; unrelated issues are never
combined just to reduce PR count.

## 3. Milestone roadmap

| # | Milestone | Outcome | Depends on |
|---:|---|---|---|
| 1 | **F1** Repository Foundation | Governed, documented, protected, automation-ready repo | Adopted documentation baseline |
| 2 | **F2** Application Foundation | Runnable web/API/data/contract foundation | F1 |
| 3 | **F3** Staging Foundation | Repeatable staging delivery + rollback | F2 |
| 4 | **A1** Authentication and User Foundation | Secure authenticated learner identity | F3 |
| 5 | **P1** Discover and Save Words | Discover, inspect, save, unsave vocabulary | A1 |
| 6 | **P2** Review Saved Words | Spaced-repetition review sessions | P1 |
| 7 | **P3** Sentence Practice and AI Feedback | Original-sentence practice + focused feedback | P2 |
| 8 | **P4** Daily Habit and Progress | Daily missions + progress support habit formation | P3 |
| 9 | **P5** Integrated Core Loop | Full learner journey works as one coherent product | P4 |
| 10 | **R1** Staging Readiness | Release candidate validated under staging conditions | P5 |
| 11 | **R2** Production Readiness | Production, legal, security, ops readiness | R1 |
| 12 | **L1** Controlled Launch | Gradual, reversible, monitored MVP release | R2 |

Within this plan, the order is intentional; work may be prepared early, but a milestone
can't be *accepted* before its
dependency passes. A milestone is never "done" merely because its code merged — its acceptance gate
must pass (see §5).

As of this adoption, F1 and portions of the F2 scaffold exist in the repository, but the F2 gate
has not passed. This roadmap describes the target sequence; current completion must be evidenced by
separate adopted change packages and their acceptance records.

## 4. Roles (summary — authority comes from the [approval matrix](../governance/approval-matrix.md)
and its linked canonical governance; [DOC-19](../operations/19-governance-reconciliation-notes.md)
is orientation only)

Founder: approves milestone scope/acceptance, material product changes, budgets,
legal/privacy/production-readiness decisions, launch, residual risk. ChatGPT: prepares milestone
packages, epics/issues, acceptance criteria, Codex/Claude prompts — doesn't implement or merge.
Codex: implements approved issues, writes tests, generates migrations/API artifacts, opens PRs,
resolves findings — never invents scope, never merges its own PR, never deploys directly. Claude
Code: reviews architecture/security/tests/migrations/API compatibility/AI safety, returns `approve` /
`approve_with_follow_up` / `request_changes` — never holds production credentials. GitHub Actions:
runs deterministic checks and deploys — never makes product decisions.

## 5. Milestone objectives and acceptance gates (condensed)

**F1 — Repository Foundation.** See [DOC-13](../operations/13-f1-repository-foundation-execution-package.md) for the preserved F1-specific objective, gate, and execution-package direction.

**F2 — Application Foundation.** Objective: the smallest complete technical foundation (workspace,
Next.js scaffold, Go API scaffold, config/logging/health endpoints, PostgreSQL+Ent+Atlas, Huma/
OpenAPI + generated TypeScript types, test harnesses). **Gate:** a contributor can clone, install,
start local PostgreSQL, apply migrations, run both apps, generate API artifacts, and run all
foundational tests using only documented commands.

**F3 — Staging Foundation.** Objective: repeatable, secure staging deployment before product
features are built on top of it (staging resources, `develop`→staging deploy workflow, automated
migrations, smoke tests, observability baseline, rollback/redeploy workflow, rehearsed failure).
**Gate:** the application foundation can be merged into `develop`, deployed to staging automatically,
verified automatically, observed, and rolled back through documented procedure.

**A1 — Authentication and User Foundation.** Objective: secure learner identity and sessions
underneath every personalized capability (user/identity/session persistence, magic-link + Google
OAuth, secure session lifecycle, authenticated shell, route/API authorization, abuse protection).
Every A1 PR requires Claude review; identity/session/authorization findings are release-blocking.
**Gate:** supported auth methods work in staging, sessions survive normal navigation, unauthorized
requests are rejected, cross-user access is impossible, logout invalidates the session, all critical
security tests pass.

**P1 — Discover and Save Words.** Objective: discovery, word detail, save/unsave, with vocabulary
content foundation and quality/analytics. **Gate:** an authenticated learner can discover a word,
open its detail, save it, see it saved consistently across the app, and remove it.

**P2 — Review Saved Words.** Objective: the specified spaced-repetition system end to end
(scheduling domain, due-queue, session, response submission, completion). **Gate:** saved words
enter the schedule, due words can be reviewed, responses update the schedule exactly once, and
learners get an accurate completion state.

**P3 — Sentence Practice and AI Feedback.** Objective: original-sentence practice with focused,
accurate, encouraging AI feedback (domain/persistence, validation/orchestration, prompt + production
provider, safety/moderation, API+frontend integration, evaluation/observability). **Mandatory
six-PR order**: (1) AI domain and persistence, (2) validation and orchestration foundation,
(3) prompt and production provider, (4) safety and moderation, (5) API and frontend integration,
(6) evaluation and observability — the production-provider PR cannot be accepted until provider
candidates and privacy settings are evaluated and recorded (see [09](../engineering/09-ai-features.md) §18, §21–22 for
the substance). Every P3 PR requires Claude review; safety/privacy/injection/cross-user/cost
failures block release. **Gate:** matches [09](../engineering/09-ai-features.md) §3–5 completion criteria plus:
mock-provider CI is complete, staging provider evaluation passes, AI can be disabled without
disabling non-AI learning.

**P4 — Daily Habit and Progress.** Objective: daily missions, streaks, progress turn isolated
actions into a habit (mission domain, streak rules, progress aggregates, Home dashboard, cross-
capability consistency). **Gate:** missions accurately reflect completed behavior, progress is
understandable, duplicate/failed/unauthorized actions can't create false progress.

**P5 — Integrated Core Loop.** Objective: combine everything into one coherent, reliable,
mobile-first journey (cross-feature integration, reliability/recovery, accessibility/performance,
final UX consistency). **Gate:** the full loop works coherently in staging across supported
layouts with no critical product/security/data/accessibility/reliability defect.

**R1 — Staging Readiness.** Objective: validate the release candidate under production-like staging
conditions; no new product scope except fixes for release-blocking defects. **Gate:** stable in
staging, no unresolved critical/high blocker, all required tests pass, migration + rollback
rehearsed, AI evaluation thresholds pass, founder completes staging acceptance, scope is frozen.

**R2 — Production Readiness.** Objective: production infrastructure, security/privacy/legal
readiness, release operations, go/no-go. **Gate:** production resources ready, credentials
protected, launch controls work, legal/privacy prerequisites complete, release PR passes all
checks, Claude returns `approve` or an explicitly accepted follow-up, founder records go/no-go.

**L1 — Controlled Launch.** Objective: release to a limited audience, monitor, expand only with
evidence. Rollout order: deploy with risky features disabled where appropriate → smoke tests →
founder/internal allowlist → validate non-AI core loop → enable AI for the allowlisted cohort →
monitored limited cohort → gradual expansion only after thresholds pass → pause/rollback immediately
on a trigger (cross-user exposure, auth failure, unsafe AI feedback, injection exposing protected
info, migration-caused inconsistency, unreliable mission/progress state, unacceptable
error-rate/latency, material quality-regression reports, incorrect provider privacy config, AI cost
overrun, insufficient monitoring). **Gate:** governed release running in production, controlled
audience completes the core loop, monitoring functions, no launch-blocking incident remains,
rollback controls are proven, founder records hold/expand decision. General public availability is
a separate, later expansion decision.

## 6. Dependency rules

F1 blocks all repository implementation; F2 blocks all product implementation; F3 blocks acceptance
of product features (every feature must be staging-deployable); A1 blocks all learner-owned-data
capabilities; P1→P2→P3→P4→P5 is a strict acceptance chain (though work may be *prototyped* against
mocks ahead of a dependency, it can't be *accepted* until the real dependency passes); R1 depends on
scope-complete P5; R2 depends on successful R1; L1 depends on recorded production authorization.

## 7. Definition of Ready (issue level)

Milestone, epic, problem/outcome, scope, explicit exclusions, dependencies, testable acceptance
criteria, applicable UI/UX and API/DTO references, database impact, security/privacy considerations,
observability requirements, test requirements, rollout/rollback considerations, documentation
impact, Claude-review requirement, and a prepared Codex implementation prompt. No credentials in the
issue. An issue failing this is never handed to Codex.

## 8. Definition of Done (issue level)

Implementation matches approved scope; acceptance criteria pass; applicable unit/integration/
contract/migration/end-to-end tests pass; error paths covered; security/privacy/accessibility
requirements pass; API artifacts regenerated and consistent; documentation updated; no prohibited
data in logs; no committed credentials; CI passes; required Claude review resolved; PR evidence
complete; merged to the correct branch; staging deployment succeeds and is verified where
applicable; issue closed or follow-up linked. A milestone is done only when *all* its issues are
done *and* its acceptance gate (§5) passes — a successful merge alone never means "done."

## 9. Testing strategy (cross-milestone)

Static checks (format/lint/typecheck/generated-consistency/dependency/secret checks) → unit tests →
component tests → integration tests (PostgreSQL, transactions, migrations, auth, handlers) →
contract tests (OpenAPI, DTO validation, generated-type compatibility, stable error codes) →
end-to-end (auth, discovery, save/unsave, review, sentence practice, mission completion, progress,
recovery) → deployment tests (build reproducibility, environment validation, migration execution,
health checks, smoke tests, rollback) → AI evaluation (deterministic fixtures in CI, mock-provider
failure coverage, protected live-provider evaluation outside CI with explicit cost limits). A test
is blocking whenever failure could affect learner data, auth, authorization, learning-state
correctness, database integrity, API compatibility, safety, privacy, or launch reliability — never
bypassed just to hit a milestone deadline.

## 10. MVP exclusions (roadmap-level — product-level list is in [DOC-01](01-mvp-prd.md) §4)

Native React Native/Expo app, open-ended AI chat/general tutor, pronunciation/speech features,
essay correction, complete grammar curriculum, teacher dashboards, social/leaderboard features,
subscriptions/monetization (unless separately approved), automatic multi-provider AI routing, model
fine-tuning, semantic result-sharing, complex microservices, unproven queues, premature enterprise
infrastructure — anything not required to prove the defined core loop.

## 11. Change-control rule

If implementation reveals a conflict with an approved document: Codex stops the conflicting portion
→ conflict is documented → ChatGPT analyzes product/architectural impact → Claude Code may add
technical risk analysis → founder approves or rejects → the authoritative document is updated →
affected issues/acceptance criteria are revised → implementation resumes only after the decision is
recorded. Implementation convenience never overrides an approved product decision.
