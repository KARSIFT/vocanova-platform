---
id: DOC-12
title: VocaNova MVP Implementation Plan
version: 1.4
document_type: implementation-plan
status: approved
owner: founder
canonical_path: docs/product/12-mvp-implementation-plan.md
approved_at: 2026-07-21
last_reviewed_at: 2026-08-24
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
related_decisions:
  - ADR-0003
  - ADR-0004
adoption_change: VOC-008
source_files:
  - path: 11-implementation-roadmap.md
    sha256: e4745ab74e3951004d20e6fd580c56ee7939a316bb427adbc2a9b09ae54b05a3
---

# 12 — VocaNova MVP Implementation Plan

## Active VOC-080 implementation amendment

The learner outcome and feature dependency order remain unchanged. The active
technical program is [VOC-080](../../specs/changes/VOC-080-cloudflare-native-ruflo/README.md):
first reconcile decisions and CI/CD, then establish external Ruflo coordination,
adapt the web to OpenNext/workerd, port the API and domains to Hono/D1 with Go parity,
rehearse synthetic data conversion, add held Cloudflare delivery controls, and only
then retire server assets. [ADR-0003](../decisions/ADR-0003-cloudflare-native-runtime-and-data.md)
governs runtime/data; [ADR-0004](../decisions/ADR-0004-external-ruflo-orchestration.md)
governs orchestration. T02's
[external runbook](../operations/ruflo-external-orchestration.md) records the exact
locked installation and synthetic planner/task-orchestrator/builder/reviewer handoff;
it adds no product, repository, or live-system authority.

Every provider name in the preserved v1.0 role examples maps to a role, not permanent
authority: planner, builder, specialist, independent reviewer, or accountable external-
action owner. Humans and AI agents may fill capable roles, but builder and reviewer
must be different participants. GitHub Actions never deploys or makes product decisions
until a separately reviewed VOC-080 task installs the specific held capability.

## Active VOC-081 F2 acceptance amendment

VOC-081 supplies the missing contributor-level F2 gate: explicit persistent local D1
initialization, fixed loopback origins, supervised fast and two-Worker loops, real
service-binding proof, disposable restart/persistence evidence, and a required hosted
local-stack job. PR #108 integrated the complete VOC-081 stack and final evidence
revision into `develop`, and the required post-merge checks passed. Repository/local
F2 is therefore complete and effective. Before that merge, the work remained an
integration-pending candidate; that candidate-era state remains historical evidence,
and a draft PR or task branch still cannot change milestone state. The current
[VOC-105 evidence record](../operations/voc-105-f3-evidence.md) validates every F3
gate item and reports the F3 staging foundation complete-effective. A1/P1+ product
acceptance remains unresolved and is a separate future outcome. Production readiness
and traffic, learner-data access, and public launch remain unresolved or held;
`VOC-080-HOLD-01` and `HOLD-02` remain held.
VOC-094 Phase 1 has separately created and rollback-proved the bounded synthetic
staging resources, and Phase 2 external Ruflo verification is complete. VOC-100
retains that tuple but prospectively replaces the custom binder with a standard
protected-environment staging path. VOC-100 PR2 records that the separately authorized
settings action created `cloudflare-staging` with exactly the two environment secret
names, no matching repository or organization Actions secret names, and an explicitly
accepted shared-identity residual. That settings action performed no dispatch or
deployment. The later exact successful delivery event is recorded separately by
VOC-105 and is only one input to its F3 gate decision.
`VOC-080-HOLD-01` and `HOLD-02` remain fully unresolved and unchanged.

## 1. Product outcome

The MVP proves one loop: discover useful words → save → review with spaced repetition → write an
original sentence → receive focused AI feedback → complete daily missions → build a habit — on a
responsive mobile-first web app. See [DOC-01](01-mvp-prd.md) §3 for the exact completion
criteria; this document is about _sequencing_ the build, not restating what "done" means.

## 2. Delivery hierarchy

`Milestone → Epic (<MILESTONE>-E<n>) → GitHub Issue (<MILESTONE>-I<n>) → Pull Request
(PR-<MILESTONE>-<n>)`. One PR = one coherent architectural/product change; unrelated issues are never
combined just to reduce PR count.

The default delivery unit for one accepted outcome is one approved change package,
one implementation pull request, and one minimum-sufficient task. Task IDs are
traceability/evidence groupings, not pre-assigned PRs. A future plan may use
multiple implementation PRs only when it records a concrete outcome/risk/authority/
dependency/reviewability boundary plus the partial-state, rollback, and overhead
comparison required by the active governance model.

## 3. Milestone roadmap

|   # | Milestone                                 | Outcome                                                | Depends on                     |
| --: | ----------------------------------------- | ------------------------------------------------------ | ------------------------------ |
|   1 | **F1** Repository Foundation              | Governed, documented, protected, automation-ready repo | Adopted documentation baseline |
|   2 | **F2** Application Foundation             | Runnable web/API/data/contract foundation              | F1                             |
|   3 | **F3** Staging Foundation                 | Repeatable staging delivery + rollback                 | F2                             |
|   4 | **A1** Authentication and User Foundation | Secure authenticated learner identity                  | F3                             |
|   5 | **P1** Discover and Save Words            | Discover, inspect, save, unsave vocabulary             | A1                             |
|   6 | **P2** Review Saved Words                 | Spaced-repetition review sessions                      | P1                             |
|   7 | **P3** Sentence Practice and AI Feedback  | Original-sentence practice + focused feedback          | P2                             |
|   8 | **P4** Daily Habit and Progress           | Daily missions + progress support habit formation      | P3                             |
|   9 | **P5** Integrated Core Loop               | Full learner journey works as one coherent product     | P4                             |
|  10 | **R1** Staging Readiness                  | Release candidate validated under staging conditions   | P5                             |
|  11 | **R2** Production Readiness               | Production, legal, security, ops readiness             | R1                             |
|  12 | **L1** Controlled Launch                  | Gradual, reversible, monitored MVP release             | R2                             |

Within this plan, the order is intentional; work may be prepared early, but a milestone
can't be _accepted_ before its
dependency passes. A milestone is never "done" merely because its code merged — its acceptance gate
must pass (see §5).

F1 is complete. Repository/local F2 is complete and effective because PR #108
integrated VOC-081's complete stacked task chain and final evidence revision, followed
by passing post-merge revalidation. The earlier integration-pending candidate state is
preserved in the
[VOC-081 F2 evidence record](../operations/voc-081-f2-evidence.md). Completion is bound
to that exact evidence, not inferred from code presence or chat direction. VOC-105's
separate gate evaluation reports F3 staging foundation complete-effective; the
successful delivery run alone did not establish that result. A1/P1+ acceptance remains
unresolved. Production readiness and traffic, learner-data access, and public launch
remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.

## 4. Roles (summary — authority comes from the [approval matrix](../governance/approval-matrix.md)

and its linked canonical governance; [DOC-19](../archive/19-governance-reconciliation-notes.md)
is orientation only)

The accountable decision owner handles specifically assigned product, budget, legal/privacy,
production, launch, or residual-risk decisions. A planner prepares packages and acceptance criteria.
A builder implements adopted tasks and resolves findings but cannot approve or merge its own work.
A different independent reviewer assesses the exact revision. GitHub Actions runs deterministic
checks and read-only eligibility reporting; it makes no product decision and currently performs no
deployment. Ruflo may coordinate those roles externally but grants none of their authority.

## 5. Milestone objectives and acceptance gates (condensed)

**F1 — Repository Foundation.** See [DOC-13](../archive/13-f1-repository-foundation-execution-package.md) for the preserved F1-specific objective, gate, and execution-package direction.

**F2 — Application Foundation.** Objective: the smallest complete technical foundation (workspace,
Next.js/OpenNext web, Hono Worker API, config/logging/health endpoints, D1 migrations, OpenAPI and
generated TypeScript artifacts, workerd/local-D1 test harnesses). T11 retired the
former Go/PostgreSQL scaffold after parity. **Gate:** a contributor can clone, install, create local D1 state,
apply migrations, run both Workers under workerd, generate API artifacts, and run all foundational
and parity tests using documented commands. The accepted local endpoints are web
`http://127.0.0.1:3000` and API `http://127.0.0.1:8080`; the verified process contract
is Linux/Unix (Windows contributors use WSL2 or another Linux environment).

**F3 — Staging Foundation.** Objective: repeatable, secure staging deployment before product
features are built on top of it (separate Cloudflare staging resources, exact-version delivery,
compatible D1 migrations, smoke/parity tests, observability baseline, rollback, rehearsed failure).
**Gate:** the application foundation is workerd-proven and may be deployed to isolated staging only
after `VOC-080-HOLD-00`; staging is verified, observed, and reversible through the documented path.

**A1 — Authentication and User Foundation.** Objective: secure learner identity and sessions
underneath every personalized capability (user/identity/session persistence, magic-link + Google
OAuth, secure session lifecycle, authenticated shell, route/API authorization, abuse protection).
Every A1 PR requires different-participant independent security review;
identity/session/authorization findings are release-blocking.
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
provider, safety/moderation, API+frontend integration, evaluation/observability). **Ordered
implementation-component sequence inside the default coherent P3/AI pull request**:
(1) AI domain and persistence, (2) validation and orchestration foundation,
(3) prompt and production provider, (4) safety and moderation,
(5) API and frontend integration, (6) evaluation and observability — the
production-provider component cannot be accepted until provider candidates and privacy
settings are evaluated and recorded (see [09](../engineering/09-ai-features.md) §18,
§21–22 for the substance). A future adopted package may use multiple P3 PRs only
when it records a concrete D03 boundary plus the required partial-state,
integration/rollback, and overhead rationale. Every P3 PR requires independent specialist review;
safety/privacy/injection/cross-user/cost
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
checks, the independent reviewer returns a passing verdict or an explicitly accepted follow-up,
and the accountable launch owner records go/no-go.

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
capabilities; P1→P2→P3→P4→P5 is a strict acceptance chain (though work may be _prototyped_ against
mocks ahead of a dependency, it can't be _accepted_ until the real dependency passes); R1 depends on
scope-complete P5; R2 depends on successful R1; L1 depends on recorded production authorization.

## 7. Definition of Ready (issue level)

Milestone, epic, problem/outcome, scope, explicit exclusions, dependencies, testable acceptance
criteria, applicable UI/UX and API/DTO references, database impact, security/privacy considerations,
observability requirements, test requirements, rollout/rollback considerations, documentation
impact, independent-review requirement, and a prepared provider-neutral builder handoff. No
credentials in the issue. An issue failing this is never handed to a builder.

## 8. Definition of Done (issue level)

Implementation matches approved scope; acceptance criteria pass; applicable unit/integration/
contract/migration/end-to-end tests pass; error paths covered; security/privacy/accessibility
requirements pass; API artifacts regenerated and consistent; documentation updated; no prohibited
data in logs; no committed credentials; CI passes; required independent review resolved; PR evidence
complete; merged to the correct branch; staging deployment succeeds and is verified where
applicable; issue closed or follow-up linked. A milestone is done only when _all_ its issues are
done _and_ its acceptance gate (§5) passes — a successful merge alone never means "done."

## 9. Testing strategy (cross-milestone)

Static checks (format/lint/typecheck/generated-consistency/dependency/secret checks) → unit tests →
component tests → integration tests (D1 atomicity/consistency/migrations, retired-source
conversion snapshots, auth, handlers) →
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
