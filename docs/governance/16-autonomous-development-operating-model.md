---
id: DOC-16
title: Vocanova Autonomous Development Operating Model
version: 3.2
status: approved
owner: founder
canonical_path: docs/governance/16-autonomous-development-operating-model.md
approved_at: 2026-07-13
approval_evidence: PR-3-founder-approval-comment-4961029533-reviewed-commit-09f97341ff093fd20a70683d88b772e154979330
last_reviewed_at: 2026-08-23
review_cycle: quarterly
supersedes: null
folds_in:
  - A-002 (Governed Autonomous Releases; approved 2026-07-13, PR #3)
  - A-003 (Governed Autonomous Engineering Authority; effective 2026-07-17T16:44:34Z, PR #8)
  - A-004 (Orchestrator Independent-Verification Merge Authority; approved 2026-08-14, PR #54)
  - VOC-079 (R4 Approval-Neutral Governance; adopted 2026-08-19, PR #75)
  - VOC-080 (Cloudflare-native runtime and external Ruflo direction; adopted 2026-08-22, PR #86)
  - VOC-082 (Provider-neutral distinct-agent role separation; adopted 2026-08-23, PR #110)
revision_note: >
  This v3.2 revision clarifies provider-neutral distinct-actor role separation. Risk
  remains consequence-based, runtime provenance is not authority, external effects
  stay separately held, and neither a hosting platform nor an orchestrator becomes
  repository authority.
related_documents:
  - DOC-15
related_decisions:
  - A-001
  - ADR-0002
  - ADR-0003
  - ADR-0004
  - ADR-0005
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
valid, permanent historical evidence for its reviewed revision. None is standing or
reusable authority for a later change. VOC-079 was itself adopted under the former
R4 founder rule; the new model cannot retroactively authorize its own adoption.

## Repository conventions

The repository predates DOC-15's recommended example tree and already uses
`docs/decisions/`, `docs/architecture/`, and `docs/planning/`. Those established
locations are retained to avoid duplicate sources of truth. In particular,
`docs/decisions/` is the canonical ADR location rather than adding `docs/adr/` or a
second top-level `decisions/` tree. This is a path mapping, not a change to DOC-15's
artifact categories or authority hierarchy.

## Roles and separation of duties

| Role                        | Responsibility                                                                                                | Prohibited authority                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Accountable decision owner  | Owns a specifically assigned product, business, legal, financial, external-effect, or organizational decision | Risk class alone does not make the founder or any other person the owner                                                  |
| Planner role                | Product analysis, specifications, architecture proposals, governance drafting, and decision routing           | Cannot adopt or independently verify its own meaningful plan                                                              |
| Implementer role            | Implementation of approved, implementation-ready changes and applicable tests and documentation               | Cannot approve its own work, expand scope, or deploy directly to production                                               |
| Independent reviewer role   | Independent specification, code, architecture, security, and CI/CD verification of the exact revision         | Cannot be the builder of the reviewed revision or assume separately assigned legal or organizational accountability       |
| Non-author merge actor      | Audits the exact-SHA evidence and applicable eligibility result before an otherwise authorized merge          | Cannot merge its own authored revision or replace an action-specific authority hold                                       |
| GitHub Actions              | Deterministic repository checks and traceability                                                              | Cannot make product or business decisions, merge, deploy, or monitor servers                                              |
| Cloudflare                  | Selected managed runtime/data target under ADR-0003; live resources remain held                               | Cannot decide scope/release authority; credentials are unavailable to PRs and ordinary agents                             |
| External Ruflo orchestrator | Optional pinned coordination of isolated provider-neutral roles under ADR-0004                                | Cannot approve/merge/close/dispatch, deploy, access secrets or production data, spend, launch, or replace GitHub evidence |

Any human or separately instantiated AI participant may occupy the planner,
implementer, or independent-reviewer role when it has the necessary capability and
access. A role is a responsibility; an actor is the attributable participant assigned
to it. The builder and reviewer must be different actors, the reviewer must not have
authored the reviewed exact revision, and their identities, assignments, exact SHA,
verdict, and resolved blocking findings must be recorded. A model, provider, tool, or
new session is optional runtime provenance or defense in depth, never authority.

The author of a plan cannot independently review or adopt it. The builder cannot
independently review, approve, or merge its revision. If a reviewer materially edits a
revision, it is the builder of the new SHA; checks and a different reviewer are then
required. A non-author merge actor audits the exact evidence and applicable eligibility
result; no human is required solely because the participants are AI. An expressly
applicable cross-model rule remains a scoped evidence requirement, not a provider
assignment or approval source. See [ADR-0005](../decisions/ADR-0005-provider-neutral-distinct-agent-role-separation.md).

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
  verification.
- **R3** protected technical work (authentication, secrets, production
  infrastructure, data handling, migrations, CI/CD, governance itself, and similar)
  needs strengthened, risk-specific controls and independent verification. It does
  **not** need founder or technical-steward approval merely for being R3.
- **R4** consequential decisions (strategy, pricing, legal, material privacy/user-
  trust, launches, difficult-to-reverse actions, or a material expansion of
  autonomous-system authority) need the strongest evidence: an explicit decision
  record, impact analysis, rollback or contingency plan, applicable specialist and
  deterministic checks, exact-revision independent review, and resolution of every
  blocking finding. R4 does not require founder approval merely because it is R4.
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

Risk-class evidence is separate from action-specific authority. Signing a contract,
committing spend, disclosing secrets or personal data, accessing production, making
an irreversible external mutation, and performing an initial public or predefined
major launch remain blocked until the authority and technical controls explicitly
defined for that action are satisfied. Each such hold must name the action,
accountable role, required evidence, and completion or expiry condition; it must not
be a disguised hold on all R4 work.

## Branch and merge behavior

- `develop` and `main` are the only permanent branches.
- Feature and change work occurs on short-lived isolated branches or worktrees.
- Direct pushes to `develop` and `main`, unverified merges, and local production
  deployments are prohibited.
- Working branches are normally squash-merged into `develop`. Release pull requests
  promote `develop` to `main` with an identifiable merge commit. VOC-080-T10 installs
  a held Cloudflare publication state machine, but its committed manifest blocks
  before environment jobs and secrets; it creates no automatic branch-to-environment
  effect.

**A pull request is merge-eligible into `develop`** when: required deterministic
checks pass; a different reviewer role records a passing verdict bound to the exact
head revision; no blocking finding remains; risk-specific evidence is complete; no
active EHR exists; every applicable action-specific authority hold is satisfied; and
the package has not opted out. This universal evidence contract applies to R0-R4 and
to human-, agent-, and future orchestrator-originated work. Risk class alone never
creates a founder-approval gate. Unknown or unparseable risk fails closed.

VOC-078-T01 retired the workflow that previously executed this automatic-merge
permission. VOC-079-T01 adds a repository-owned pure eligibility evaluator and a
read-only Governance-workflow adapter. The adapter reads normalized package, check,
review, exact-revision, R4, EHR, and action-authority evidence and reports an
`eligible` or `blocked` decision with concrete reasons in the job summary. It cannot
approve, comment, merge, dispatch, or otherwise mutate GitHub. Until a separately
adopted repository-owned executor exists, an authorized actor performs the merge after
verifying the same gates and the exact-SHA result.

The former orchestrator-originated merge path remains retired. VOC-078-T02 superseded
[ADR-0001](../decisions/ADR-0001-agent-orchestration-architecture.md) and removed the
repository-local orchestrator and subagent assets, so no current pull request can
qualify as orchestrator-originated under that path. Human- and agent-authored changes
follow the general pull-request rule above. ADR-0004 permits pinned Ruflo as an
operator-side external coordinator, not as a repository-local executor or special
merge path. Its participants use the universal evidence contract above; no `not R4`
exception or parallel vendor-specific authority exists. Ruflo receipts and memory are
supporting provenance only, and the historical authority in the amendment record
cannot activate absent machinery.

`develop` is the integrated repository state. Merging to it does not deploy or poll
any environment. T10's manual state machine is present but fail-closed in repository
state; live staging remains held until `VOC-080-HOLD-00` is completed by a separate
reviewed activation. See [repository-settings.md](repository-settings.md) and the
[Cloudflare delivery runbook](../operations/cloudflare-delivery.md).

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
  RL3 or R4 status alone does not imply founder approval. An explicitly defined
  launch or external-effect authority may still require an accountable person's
  go/no-go before the action. An R3
  technical change does not automatically make its release RL3 - the two are
  evaluated independently.

Automated release authority can never override a failed mandatory check, an
unresolved blocking finding, active EHR, incomplete risk-specific evidence, an unmet
action-specific authority hold, or a missing rollback capability. Automation is
permission, not an obligation - any gate may hold a release for investigation.

VOC-078-T01 retired the workflow that previously promoted completed packages from
`develop` to `main`. This section continues to define release eligibility, but no
current GitHub workflow executes that promotion. Promotion uses a separately reviewed
`develop`-to-`main` pull request. VOC-080-T10 defines held Cloudflare publication, but
its manifest, placeholder resources, credential absence, and action holds prevent
repository promotion from becoming live deployment.

RL1/RL2 _technical_ activation (as opposed to the governance permission described
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
- every applicable action-specific authority record and any actually triggered
  exceptional human review;
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
weakening an explicit action-specific authority boundary all count.

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
the R4 evidence contract, action-specific authority, and EHR rules.

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

| Capability                                                                                      | Current state                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance structure and protected-path classification                                          | Live - enforced by `scripts/governance/` and the policy workflow on every PR                                                                                                                                                                                                                             |
| pnpm frozen installation, formatting, lint, type checking, unit tests, integration tests, build | Live - real `apps/web` and `apps/api-worker` applications, real CI on every PR                                                                                                                                                                                                                           |
| Accessibility automation                                                                        | Live - Lighthouse CI budgets (Performance 85+/Accessibility 95+/Best Practices 90+)                                                                                                                                                                                                                      |
| Database migration validation                                                                   | Live - forward D1 migrations, local workerd/D1 rehearsal, synthetic conversion, and reconciliation validation                                                                                                                                                                                            |
| Dependency audit                                                                                | Live - pnpm audit and Dependabot                                                                                                                                                                                                                                                                         |
| Secret scanning                                                                                 | Live in `security.yml` through pinned TruffleHog plus its synthetic rejection contract; GitHub-hosted secret scanning/push protection is not exposed as enabled on the current private Free plan                                                                                                         |
| OpenNext/Worker/D1 compatibility                                                                | Live in the active tree after the T03-T10 parity chain and T11 server-runtime retirement; local workerd/D1 and credential-free dry runs only                                                                                                                                                             |
| Preview status                                                                                  | Not built - per-PR Cloudflare previews remain genuinely unbuilt                                                                                                                                                                                                                                          |
| Independent exact-revision verification                                                         | Live as a repository requirement; performed outside Actions and attached to the PR                                                                                                                                                                                                                       |
| External Ruflo coordination                                                                     | Exact `3.38.16` operator-side installation and synthetic rehearsal recorded by VOC-080-T02; frozen patched graph, zero high/critical audit, advisory-permission limitation, and deny boundary are in the [runbook](../operations/ruflo-external-orchestration.md); never repository/production authority |
| Staging deployment, health checks                                                               | Held T10 state machine and mocked smoke exist; no environment/resource/secret is configured and VOC-080-HOLD-00 blocks activation                                                                                                                                                                        |
| Production deployment, health checks                                                            | Held T10 state machine and mocked smoke/rollback exist; no environment/resource/secret is configured and VOC-080-HOLD-01 blocks activation                                                                                                                                                               |
| Production data migration                                                                       | Unavailable and prohibited without VOC-080-HOLD-02                                                                                                                                                                                                                                                       |
| Rollback                                                                                        | Held exact prior-version rollback and forward-corrective D1 contract are installed and mocked; no live rehearsal or authority is claimed                                                                                                                                                                 |

Absence of a tool is never represented by a passing placeholder check. See
[repository-settings.md](repository-settings.md) for the fuller, continuously
maintained record of what's built versus what's still pending.

## Review cadence and kill switches

This model has already passed its first five implementation pull requests and its
first production release; it should continue to be reviewed after any serious
incident and at least quarterly. GitHub Actions agent dispatch, autonomous merge,
deployment, and scheduled server/error monitoring are disabled by removal under
VOC-078. ADR-0004 does not restore them. Future write automation must expose an
independent kill switch for every capability.

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

This document previously worked alongside three separate amendments. Each former
amendment's operative rules is folded directly into the sections above. The table also
records the later VOC-079 authority transition, VOC-080 runtime/orchestration boundary,
and VOC-082 role-separation clarification. It preserves permanent evidence for the
revision it governed without making any approval, transition, or boundary reusable.

| Date                 | Change (former amendment)                                                              | What it did                                                                                                                                                                                                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-13           | Governed Autonomous Releases (formerly "A-002")                                        | Ended the rule that every `develop`->`main` merge and every production publication needed founder approval; introduced risk-proportionate automatic release authority                                                                       | PR #3, founder approval comment [4961029533](https://github.com/KARSIFT/vocanova-platform/pull/3#issuecomment-4961029533), reviewed commit `09f97341ff093fd20a70683d88b772e154979330`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-07-17T16:44:34Z | Governed Autonomous Engineering Authority (formerly "A-003")                           | Retired the standing qualified-human technical-steward approval requirement for routine R3 protected technical work; introduced EHR as an exceptional-only escalation mechanism                                                             | PR #8, approved PR head SHA `c858ebff3d97da88fea830bc32a74f69f59a9ad2`, adopted `develop` SHA `9d5b4bc1d4a72e313b013047601265ee837c34f2`: formal approval [5005389067](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005389067), independent verification [5005293621](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005293621), repository adoption [5005429197](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005429197), effective activation [5005456622](https://github.com/KARSIFT/vocanova-platform/pull/8#issuecomment-5005456622) |
| 2026-08-14           | Orchestrator Independent-Verification Merge Authority (formerly "A-004")               | Let an orchestrator-originated pull request that already satisfies real independent verification merge directly, without also repeating the separate `karsift-ai-infra` pipeline ceremony built for a different, less continuous system     | PR #54, founder approval comment [5295002955](https://github.com/KARSIFT/vocanova-platform/pull/54#issuecomment-5295002955), reviewed commit `94f4d2196156c55b3264f955c4d03746ab2cd37a`                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-08-14           | This consolidation (v2.0 of this document)                                             | Folded the three amendments above directly into this document and removed the separate amendment files, so current governance reads as one document instead of a base plus three overlays; no underlying rule changed in the folding itself | See this revision's pull-request approval comment once recorded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-08-19           | R4 Approval-Neutral Governance (VOC-079; v3.0 of this document)                        | Retained R4 as the highest consequence class while replacing its class-wide founder gate with the universal evidence contract and explicit action-specific authority                                                                        | Adopted package candidate `25a3e246b8f66dd4b92ea9726eb5367c16363018`; PR #75 founder approval [5341799779](https://github.com/KARSIFT/vocanova-platform/pull/75#issuecomment-5341799779) and independent package review [5340623965](https://github.com/KARSIFT/vocanova-platform/pull/75#issuecomment-5340623965). This one-time pre-transition authority is exhausted by VOC-079 and cannot authorize later work; exact implementation evidence is recorded on the implementation pull requests.                                                                                                     |
| 2026-08-22           | Cloudflare-native runtime and external Ruflo boundary (VOC-080; v3.1 of this document) | Selected Workers/OpenNext/Hono/D1 as the parity-gated no-owned-server target and Ruflo as external coordination only; preserved the universal evidence contract and added no merge or live-system authority                                 | Adopted package candidate `6fb00a0b64e6f2d4adceb24a9caeffd9af98c779`; independent review [5379258747](https://github.com/KARSIFT/vocanova-platform/pull/86#issuecomment-5379258747); final-head review [5379295472](https://github.com/KARSIFT/vocanova-platform/pull/86#issuecomment-5379295472); adoption PR #86 merged as `399ccefa879545b43574c02fdc3babff223a1db0`. Live staging, production, and learner-data actions remain held.                                                                                                                                                               |
| 2026-08-23           | Provider-neutral distinct-agent role separation (VOC-082; v3.2)                        | Clarified that independent roles require distinct actors and non-authorship of the exact revision; model/provider provenance is optional hardening, while action-specific authority remains separate                                        | Adopted package VOC-082, PR #110; implementation evidence is recorded on its independently reviewed task pull requests. Historical provider and bootstrap evidence remains preserved.                                                                                                                                                                                                                                                                                                                                                                                                                  |

The one-time VOC-002 migration approval and VOC-079 pre-transition approval recorded
above are exhausted and must never be reused to justify a later change. Automatic
production-release authority
(2026-08-08, a separate founder decision - see AGENTS.md's "Release and deployment
authority") is recorded there, not here, since it did not go through this
amendment pattern.
