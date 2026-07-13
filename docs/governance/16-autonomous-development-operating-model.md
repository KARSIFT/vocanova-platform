---
id: DOC-16
title: Vocanova Autonomous Development Operating Model
version: 1.0
status: proposed
owner: founder
canonical_path: docs/governance/16-autonomous-development-operating-model.md
approved_at: null
approval_evidence: pending-github-pull-request
last_reviewed_at: 2026-07-13
review_cycle: quarterly
supersedes: null
related_documents:
  - DOC-15
related_decisions:
  - A-001
  - A-002
---

# 16 — Vocanova Autonomous Development Operating Model

## Status and precedence

This document implements the approved autonomous-development decisions without
restating or changing Vocanova's product strategy. DOC-15 remains authoritative for
the artifact lifecycle, agent boundaries, traceability, security, and engineering
principles. Amendment A-002 supersedes DOC-15 and A-001 only where they require
founder approval for every `develop` to `main` merge or every production publication.
DOC-16 and A-002 also supersede conflicting DOC-15/A-001 language that permits an R3
protected technical change to merge into `develop` with CI and Claude Code approval
alone. After the one-time bootstrap, R3 approval by a qualified human technical
steward is required before merge into a protected destination and before production.

The governing documents are:

1. [DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md)
   for the baseline operating model.
2. [Amendment A-002](amendments/A-002-governed-autonomous-releases.md) for release
   authority.
3. [Change risk classification](change-risk-classification.md),
   [protected areas](protected-areas.md), and [approval matrix](approval-matrix.md)
   for operational enforcement.

The operating direction was supplied as approved founder intent, but this repository
artifact remains `proposed` until founder approval is attributable to the reviewed
GitHub revision and the pull request is merged. Its metadata must be changed to
`approved` only through that recorded review flow.

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
| Codex | Implementation of approved, implementation-ready changes and applicable tests and documentation | Cannot approve its own work, expand scope, or deploy directly to production |
| Claude Code | Independent specification, code, architecture, security, and CI/CD verification | Is not a human technical steward and cannot assume legal or organizational accountability |
| Technical steward | Qualified, accountable human approval for protected technical changes | Cannot substitute for the founder on R4 decisions unless formally delegated in writing |
| GitHub Actions | Deterministic checks, traceability, gates, and deployment orchestration | Cannot make product or business decisions |
| Cloudflare | Isolated preview, staging, production deployment, monitoring, and rollback infrastructure | Must not decide whether a release is authorized |

No builder, agent, reviewer, or workflow may self-approve a change that modifies its
own permissions, review rules, release gates, protected paths, or credentials.

## Initial governance bootstrap adoption

The first pull request that adopts DOC-16 and Amendment A-002 is a one-time bootstrap
exception because Vocanova has not yet appointed a qualified human technical
steward. That pull request may be approved and merged into `develop` only through:

1. founder approval bound to the reviewed GitHub revision;
2. independent Claude Code verification with no unresolved Critical or High finding;
   and
3. passing repository validation.

The bootstrap pull request remains R4 because it establishes consequential
governance. Founder approval and independent verification are required. The absence
of steward approval for this one pull request must be recorded as this bootstrap
exception—not as satisfied technical-steward approval.

This exception applies only to the initial adoption of DOC-16 and A-002. It does not
authorize production deployment, autonomous production releases, any R3 protected
technical change, or bypass of future technical-steward approval. It grants no
technical-steward status or authority to Claude Code or another AI agent.

The technical-steward requirement becomes effective immediately when the governance
framework is merged. Until a qualified human steward is appointed and GitHub
enforcement is configured:

- R3 changes remain blocked from production;
- protected technical approvals remain unsatisfied;
- AI agents must not impersonate or substitute for the steward; and
- autonomous production release remains disabled.

R4 decisions continue to require founder approval. The bootstrap exception expires
on merge and cannot be reused for later governance, workflow, application, or release
changes.

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

## Branch and merge behavior

- `develop` and `main` are the only permanent branches.
- Feature and change work occurs on short-lived isolated branches or worktrees.
- Pull requests into `develop` require applicable deterministic checks and an
  independent-verifier result. Protected changes also require the designated human
  approval.
- Working branches are normally squash-merged into `develop`.
- `develop` is the integrated staging state; successful merges deploy to staging
  only after staging automation exists and is validated.
- Release pull requests promote `develop` to `main` with an identifiable release
  merge commit.
- `main` is production-ready and is the only production deployment source.
- Low-risk, reversible R0-R1 production releases may proceed automatically after
  every applicable release gate passes. An R2 release may also proceed automatically
  only when it is reversible, its stronger checks pass, and the approved release
  policy explicitly permits that change type. Automation is permission, not an
  obligation; a gate may always hold a release for investigation.
- After the initial governance bootstrap described above, R3 requires
  technical-steward approval. R4 requires founder approval. A change that
  is both R3 and R4 requires both unless the founder is also the recorded qualified
  technical steward.
- The initial public launch and major launch decisions always require founder
  approval.
- Direct pushes to `develop` and `main`, unverified merges, and local production
  deployments are prohibited.

## Risk and approval

The repository uses R0-R4, defined in
[change-risk-classification.md](change-risk-classification.md). The declared class is
the maximum of:

1. the builder's assessment;
2. the path-based risk floor reported by CI;
3. the independent verifier's semantic assessment; and
4. the decision authority's escalation.

Risk may be raised at any time. It may be lowered below a detected floor only through
a documented correction to a false-positive classification rule, independently
reviewed in the same pull request. Labels or builder-selected checkboxes are never
the sole enforcement mechanism.

## Verification model

All installed, relevant checks must pass. The expected verification stack is enabled
only as the corresponding code and tooling are added:

| Capability | Current repository state | Activation rule |
|---|---|---|
| Governance structure and protected-path classification | Implemented by dependency-free repository scripts and the policy workflow | Required now |
| pnpm frozen installation, formatting, lint, type checking, unit tests, integration tests, and build | No `package.json`, lockfile, workspace, application code, or scripts exist | Add required checks when the approved application foundation introduces real scripts |
| Accessibility automation | No user interface or accessibility tool exists | Add when the web application and chosen test tool exist |
| Database migration validation | No schema, migration system, or database tool exists | Add before the first migration can merge |
| Dependency audit | No dependency manifest exists | Enable pnpm audit and repository dependency controls with the first manifest |
| Secret scanning | No repository workflow is installed | Enable GitHub secret scanning and push protection in repository settings; add a reviewed scanner only if platform coverage is insufficient |
| Preview status | No Cloudflare project or deploy workflow is committed | Make required for deployable web changes after preview configuration is validated |
| Independent Claude Code verification | No authenticated verifier integration is present | Configure a distinct identity and required status check before autonomous merges |
| Staging, production, health checks, and rollback | No Cloudflare configuration, credentials, environments, or application exist | Implement only after projects, scoped credentials, commands, and rollback mechanism are approved |

Absence of a tool is never represented by a passing placeholder check. Until a
required external gate exists, the corresponding merge or release remains manual or
blocked according to [repository-settings.md](repository-settings.md).

## Release gate

A production release is eligible only when all applicable evidence is attached to a
[release record](../templates/release-record.md):

- exact commit and included change identifiers;
- risk classification and detected protected areas;
- acceptance-criteria, CI, and independent-verification results;
- successful preview or staging evidence where applicable;
- security, privacy, accessibility, analytics, migration, and documentation impact;
- rollback mechanism, trigger, owner, and last known-good reference;
- all R3 technical-steward and R4 founder approvals;
- protected production environment approval rules satisfied; and
- post-deployment health checks and outcome-observation owner defined.

Failed health checks stop the release. Automated rollback is permitted when it uses
a pre-approved, tested mechanism and is safer than waiting. A rollback does not erase
the failed-release evidence and must produce a rollback report.

## Emergency changes

Emergency work may shorten planning but not eliminate traceability, applicable
testing, independent verification, risk classification, protected approvals, or
reconciliation back to `develop`. An immediate protective rollback may execute under
a pre-approved runbook. Any new irreversible action or product decision follows the
normal R3/R4 authority rules.

## Review cadence and kill switches

Review this model after the first five implementation pull requests, after the first
production release, after a serious incident, and at least quarterly. Authorized
maintainers must be able to disable independently: agent dispatch, autonomous merge,
preview/staging deployment, production deployment, and automated rollback.
