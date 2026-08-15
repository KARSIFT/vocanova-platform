---
id: DOC-16
title: Vocanova Autonomous Development Operating Model
version: 2.0
status: approved
owner: founder
canonical_path: docs/governance/16-autonomous-development-operating-model.md
approved_at: 2026-07-13
approval_evidence: PR-3-founder-approval-comment-4961029533-reviewed-commit-09f97341ff093fd20a70683d88b772e154979330
last_reviewed_at: 2026-08-14
review_cycle: quarterly
supersedes: null
folds_in:
  - A-002 (Governed Autonomous Releases; approved 2026-07-13, PR #3)
  - A-003 (Governed Autonomous Engineering Authority; effective 2026-07-17T16:44:34Z, PR #8)
  - A-004 (Orchestrator Independent-Verification Merge Authority; approved 2026-08-14, PR #54)
revision_note: >
  This v2.0 revision folds A-002, A-003, and A-004's operative rules directly into
  this document and removes those three amendment files, so current governance
  reads as one document instead of a base plus three overlays. No underlying rule
  changes in the folding itself - every rule below already had independent
  founder-approval evidence in its original amendment (preserved in the Amendment
  history section). This revision touches an R4-protected path
  (.github/approved-policy/protected-paths.yaml) and needs its own founder approval
  on the pull request that introduces it, per this repository's own rule that an
  author or implementation agent cannot be the sole approver of a governance
  change - see that pull request for the approval comment once recorded.
related_documents:
  - DOC-15
related_decisions:
  - A-001
---

# 16 — Vocanova Autonomous Development Operating Model

## Status and precedence

This document is the single, current, authoritative statement of Vocanova's
autonomous-development governance. Earlier revisions worked together with three
separate amendments (A-002, A-003, A-004), each layered on top with its own
"supersedes only this clause" scope. As of 2026-08-14, this revision folds every one
of those amendments' operative rules directly into the sections below, so reading
this document alone tells the full current story. The three amendment documents are
retired and removed; their approval evidence is preserved in "Amendment history" at
the end of this document, not deleted.

[DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md)
remains authoritative for the artifact lifecycle, agent boundaries, traceability,
security, and engineering principles this document doesn't restate. Where DOC-15's
older text conflicts with what's written here, this document governs autonomous-
development authority specifically - DOC-15 already flags several of its own
sections as not individually reconciled since 2026-07-24.

Founder approval for this operating model was originally recorded on PR #3 against
commit `09f97341ff093fd20a70683d88b772e154979330`, merged into `develop` 2026-07-13.
That approval, and every approval described in "Amendment history" below, remains
valid, permanent evidence. Folding each amendment's text into this document does not
revisit or reopen any of those decisions - it only removes the need to read four
documents to find the current rule.

## Repository conventions

The repository predates DOC-15's recommended example tree and already uses
`docs/decisions/`, `docs/architecture/`, and `docs/planning/`. Those established
locations are retained to avoid duplicate sources of truth. In particular,
`docs/decisions/` is the canonical ADR location rather than adding `docs/adr/` or a
second top-level `decisions/` tree. This is a path mapping, not a change to DOC-15's
artifact categories or authority hierarchy.

## Roles and separation of duties

| Role | Responsibility | Prohibited authority |
|---|---|---|
| Founder | Consequential strategic, financial, legal, product-direction, public-launch, user-trust, and difficult-to-reverse decisions | Routine implementation approval is not required |
| ChatGPT | Product analysis, specifications, architecture proposals, governance drafting, and decision routing | Cannot approve founder-controlled decisions or implementation |
| Implementer role | Implementation of approved, implementation-ready changes and applicable tests and documentation | Cannot approve its own work, expand scope, or deploy directly to production |
| Independent reviewer role | Independent specification, code, architecture, security, and CI/CD verification | Is not a human technical steward and cannot assume legal or organizational accountability |
| GitHub Actions | Deterministic checks, traceability, gates, and deployment orchestration | Cannot make product or business decisions |
| Cloudflare | Isolated preview, staging, production deployment, monitoring, and rollback infrastructure | Must not decide whether a release is authorized |

Which model or vendor occupies the implementer and independent-reviewer roles is
configurable and has changed more than once - `karsift-ai-infra`'s `config/roles.yml`
is the current source of truth for the actual occupant, not this table.

A permanent qualified-human technical-steward role existed early in this
repository's history and is now retired as a routine approval authority (see
"Retirement of the standing technical-steward role" below). It is preserved as
historical evidence in
[technical-steward-appointment.md](technical-steward-appointment.md), not deleted.

No builder, agent, reviewer, or workflow may self-approve a change that modifies its
own permissions, review rules, release gates, protected paths, or credentials.

## Governance bootstrap history

PR #3 was the first pull request adopting this operating model. At the time,
Vocanova had not yet appointed a qualified human technical steward, so a one-time
bootstrap exception applied: founder approval bound to the reviewed revision,
independent Claude Code verification with no unresolved Critical or High finding,
and passing repository validation. That exception applied only to the initial
adoption pull request. It expired when PR #3 merged, granted no technical-steward
status to any AI agent, and cannot be reused for any later change - including this
consolidation.

## Required lifecycle and traceability

Every meaningful change must preserve this chain:

```text
Business or product objective
  -> approved Vocanova requirement or decision
  -> change specification and acceptance criteria
  -> implementation task
  -> code or document change
  -> test and verification evidence
  -> preview, staging, or production release
  -> observed production outcome
```

Stable identifiers, normally `VOC-###` and `AC-##`, must connect repository
artifacts, issues, branches, pull requests, tests, releases, and outcome records.
Trivial R0 corrections may use a linked issue or a concise pull-request description
instead of a full change package, but they must still identify objective, scope,
evidence, and risk.

## Risk classification

Vocanova uses R0-R4 change-risk classification and RL1-RL3 release classes - two
independent axes, defined in full in
[change-risk-classification.md](change-risk-classification.md). In short:

- **R0-R2** routine work needs proportionate deterministic and independent
  verification. No founder or technical-steward approval.
- **R3** protected technical work (authentication, secrets, production
  infrastructure, data handling, migrations, CI/CD, governance itself, and similar)
  needs strengthened, risk-specific controls and independent verification. It does
  **not** need founder or technical-steward approval merely for being R3.
- **R4** consequential decisions (strategy, pricing, legal, material privacy/user-
  trust, launches, difficult-to-reverse actions, or a material expansion of
  autonomous-system authority) always need explicit founder approval.
- A release inherits the highest class of everything it contains.
- Risk may be raised at any time by the builder, the path-based CI floor, the
  independent verifier, or the founder. It may only be lowered below a detected
  floor through a documented correction to the classifier itself, independently
  reviewed in the same pull request.

**Exceptional Human Review (EHR)** is a stop-and-escalate condition, not a routine
approval layer. It applies only when autonomous systems and independent
verification genuinely cannot establish enough confidence to continue safely - an
unresolved Critical/High security finding, a destructive irreversible action without
demonstrated recovery, materially conflicting technical conclusions on a critical
change, or a comparable trigger. When EHR fires: the affected operation stops,
reversible protective measures may continue, the escalation reason is recorded,
suitable qualified human expertise is obtained, and the resulting review becomes
permanent evidence. EHR must never harden into a standing approval requirement.

## Branch and merge behavior

- `develop` and `main` are the only permanent branches.
- Feature and change work occurs on short-lived isolated branches or worktrees.
- Direct pushes to `develop` and `main`, unverified merges, and local production
  deployments are prohibited.
- Working branches are normally squash-merged into `develop`. Release pull requests
  promote `develop` to `main` with an identifiable merge commit. `main` is the only
  production deployment source.

**A pull request may merge automatically into `develop`** when: required
deterministic checks pass; required independent verification passes; no blocking
finding remains; no active EHR condition exists; any required founder decision has
already been validly recorded; and repository policy authorizes automatic merge for
that change. This applies at every risk class through R3 - R3 needs the
strengthened controls above, but not a standing steward or founder sign-off just
because it's R3. R4 changes always need founder approval before merge, regardless
of automation state.

**An orchestrator-originated pull request** - implemented and independently
reviewed by dedicated subagents (or an equivalent independent tool) dispatched from
the same live orchestrator session, per
[ADR-0001](../decisions/ADR-0001-agent-orchestration-architecture.md) - may merge
directly once, every time, without exception:

1. it is genuinely orchestrator-originated as just defined - not a human
   contributor, not a different automated system;
2. this repository's real deterministic checks (lint/typecheck/test/build) actually
   ran and passed;
3. the independent reviewer subagent - which never had write access to the change -
   returned `VERDICT: PASS` or `VERDICT: PASS WITH NON-BLOCKING FINDINGS`, bound to
   the exact reviewed commit; and
4. the change is not R4, and does not touch secrets, production data, or an
   irreversible action.

If any condition fails, the change falls back to the full process above - this path
grants no authority to work around a failed condition, and does not let the
orchestrator approve its own substantial correction or expand its own authority.

`develop` is the integrated staging state; successful merges deploy to staging - see
[repository-settings.md](repository-settings.md) for current staging automation
status.

## Release classes and production release authority

Release class is independent of change risk - a small R1 change can still ship
inside a large RL2 release.

- **RL1 - Routine release** (minor fixes, copy changes, accessibility fixes, safe
  dependency updates): may publish automatically once all applicable gates pass.
- **RL2 - Significant release** (normal features, meaningful product changes): may
  publish automatically once its stronger verification, staged-rollout, monitoring,
  and rollback requirements pass.
- **RL3 - Protected or major release** (initial public launch, predefined major
  launches, consequential business changes, unusually hard-to-reverse releases):
  RL3 status alone doesn't imply founder approval, but founder approval is required
  whenever the release contains an unresolved R4 decision, is a predefined founder-
  controlled RL3 event, or another explicit protected condition applies. An R3
  technical change does not automatically make its release RL3 - the two are
  evaluated independently.

Automated release authority can never override a failed mandatory check, an
unresolved blocking finding, active EHR, a missing required R4 founder approval, a
missing founder approval for a predefined founder-controlled RL3 event, or a
missing rollback capability. Automation is permission, not an obligation - any gate
may hold a release for investigation.

RL1/RL2 *technical* activation (as opposed to the governance permission described
above) remains a separate, currently disabled gate - see
[repository-settings.md](repository-settings.md) and
[a003-transition-state.yaml](a003-transition-state.yaml) for the live, current
state of what's actually turned on.

## Release gate

A production release is eligible only when all applicable evidence is attached to a
[release record](../templates/release-record.md):

- exact commit and included change identifiers;
- risk classification and detected protected areas;
- acceptance-criteria, CI, and independent-verification results;
- successful preview or staging evidence where applicable;
- security, privacy, accessibility, analytics, migration, and documentation impact;
- rollback mechanism, trigger, owner, and last known-good reference;
- all independently applicable approvals, including R4 founder approval and any
  actually triggered exceptional human review;
- protected production environment approval rules satisfied; and
- post-deployment health checks and outcome-observation owner defined.

Failed health checks stop the release. Automated rollback is permitted when it uses
a pre-approved, tested mechanism and is safer than waiting. A rollback does not
erase the failed-release evidence and must produce a rollback report.

## Self-modification and governance safety

Changes affecting the autonomous-development system itself get stronger scrutiny.
Protected governance areas include: approval policies, risk-classification logic,
release policies, protected paths, GitHub rulesets, CI requirements, deployment
authority, agent permissions, credential scopes, rollback systems, and kill
switches. A change in these areas requires: separation between implementation and
verification; independent cross-model verification; deterministic policy
validation where technically possible; explicit privilege-expansion analysis; and
preservation of existing protections until replacement protections are proven. A
system must never weaken its own protections and then use the weakened protections
to authorize the same transition.

A change that materially expands autonomous authority is always R4 - granting new
production write authority, enabling a materially broader autonomous production
capability, removing mandatory independent verification, materially increasing
autonomous spending authority, materially expanding access to sensitive data, or
weakening a founder-controlled decision boundary all count.

Governance replacements - including this document's own future revisions - are
evaluated under the governance rules effective before the proposed replacement; a
document cannot authorize its own adoption.

## Emergency, incident, and break-glass authority

Emergency work may shorten planning but never removes traceability, applicable
testing, independent verification, risk classification, protected approvals, or
eventual reconciliation back to `develop`.

The autonomous system may take immediate, pre-approved, reversible protective
actions when delaying would create greater risk - rolling back to a known-good
release, pausing or stopping deployment, reducing rollout exposure, disabling a
feature flag, temporarily disabling a malfunctioning integration, isolating a
compromised credential under an approved runbook, or pausing agent execution.
These don't need routine founder approval when they stay within approved emergency
policy. After stabilization, the normal lifecycle resumes in full: detect ->
contain -> record incident -> investigate -> update the change specification ->
implement -> verify (deterministic and independent) -> release per policy ->
monitor -> close incident.

Emergency status never authorizes an otherwise-prohibited irreversible action -
destructive production-data modification, permanent deletion without proven
recovery, a consequential privacy decision, an extraordinary financial commitment,
or a major user-trust decision. Where an incident seems to call for one of these,
use reversible containment first; any remaining consequential action still follows
normal R4 or EHR rules.

Any future break-glass mechanism must be narrowly scoped, time-limited where
practical, fully auditable, automatically tied to an incident record, reviewed
after use, and never available as an ordinary development credential. It must
never silently become permanent agent authority.

## Spending authority

Routine autonomous spending may occur only within explicitly approved budgets and
limits, recorded in version-controlled operational policy rather than this
document. Approaching a warning threshold triggers a founder notification; a new
material recurring commitment or a hard approval threshold always requires a
founder decision. Agents may not independently increase their own financial
authority.

## Verification model

| Capability | Current state |
|---|---|
| Governance structure and protected-path classification | Live - enforced by `scripts/governance/` and the policy workflow on every PR |
| pnpm frozen installation, formatting, lint, type checking, unit tests, integration tests, build | Live - real `apps/web`/`apps/api` applications, real CI on every PR |
| Accessibility automation | Live - Lighthouse CI budgets (Performance 85+/Accessibility 95+/Best Practices 90+) |
| Database migration validation | Live - Atlas-based migration tooling |
| Dependency audit | Live - pnpm audit and Dependabot |
| Secret scanning | Live - GitHub secret scanning and push protection |
| Preview status | Not built - per-PR Cloudflare previews remain genuinely unbuilt |
| Independent Claude Code verification | Live - required for merge |
| Staging deployment, health checks | Live - `deploy-staging.yml`, real staging server |
| Production deployment, health checks | Live - `deploy-production.yml`, real production server, restricted to `main` |
| Rollback | Manual, proven procedure (redeploy previous immutable image digest) - not one-click automation |

Absence of a tool is never represented by a passing placeholder check. See
[repository-settings.md](repository-settings.md) for the fuller, continuously
maintained record of what's built versus what's still pending.

## Review cadence and kill switches

This model has already passed its first five implementation pull requests and its
first production release; it should continue to be reviewed after any serious
incident and at least quarterly. Authorized maintainers must be able to disable
independently: agent dispatch, autonomous merge, preview/staging deployment,
production deployment, and automated rollback.

## Retirement of the standing technical-steward role

A permanent qualified-human technical-steward role existed early in this
repository's history, appointed to satisfy the initial DOC-16/A-002 bootstrap's
steward requirement. That role is retired as a routine approval authority,
effective 2026-07-17T16:44:34Z. Ordinary R3 technical work no longer requires
standing human technical approval. The historic appointment remains preserved
solely as governance and audit history in
[technical-steward-appointment.md](technical-steward-appointment.md) - it is not
deleted or rewritten as though it never existed. The one-time transitional
approval used to migrate to this model (the "VOC-002" migration) is exhausted and
must never be reused as justification for requiring routine founder or technical-
steward approval of a later R3 change. EHR remains available as an exceptional
escalation mechanism; it must never evolve into a replacement standing approval
layer.

## Amendment history

This document previously worked alongside three separate amendments. Each
amendment's operative rules are now folded directly into the sections above; this
section preserves the permanent approval evidence for each, so nothing is lost by
retiring the separate files.

| Date | Change (former amendment) | What it did | Evidence |
|---|---|---|---|
| 2026-07-13 | Governed Autonomous Releases (formerly "A-002") | Ended the rule that every `develop`->`main` merge and every production publication needed founder approval; introduced risk-proportionate automatic release authority | PR #3, founder approval comment [4961029533](https://github.com/KARSIFT/vocanova-platform/pull/3#issuecomment-4961029533), reviewed commit `09f97341ff093fd20a70683d88b772e154979330` |
| 2026-07-17T16:44:34Z | Governed Autonomous Engineering Authority (formerly "A-003") | Retired the standing qualified-human technical-steward approval requirement for routine R3 protected technical work; introduced EHR as an exceptional-only escalation mechanism | PR #8, approved PR head SHA `c858ebff3d97da88fea830bc32a74f69f59a9ad2`, adopted `develop` SHA `9d5b4bc1d4a72e313b013047601265ee837c34f2`: formal approval [5005389067](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067), independent verification [5005293621](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005293621), repository adoption [5005429197](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005429197), effective activation [5005456622](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622) |
| 2026-08-14 | Orchestrator Independent-Verification Merge Authority (formerly "A-004") | Let an orchestrator-originated pull request that already satisfies real independent verification merge directly, without also repeating the separate `karsift-ai-infra` pipeline ceremony built for a different, less continuous system | PR #54, founder approval comment [5295002955](https://github.com/KARSIFT/vocanova-platform/pull/54#issuecomment-5295002955), reviewed commit `94f4d2196156c55b3264f955c4d03746ab2cd37a` |
| 2026-08-14 | This consolidation (v2.0 of this document) | Folded the three amendments above directly into this document and removed the separate amendment files, so current governance reads as one document instead of a base plus three overlays; no underlying rule changed in the folding itself | See this revision's pull-request approval comment once recorded |

The one-time VOC-002 migration approval recorded above is exhausted and must never
be reused to justify a later change. Automatic production-release authority
(2026-08-08, a separate founder decision - see AGENTS.md's "Release and deployment
authority") is recorded there, not here, since it did not go through this
amendment pattern.
