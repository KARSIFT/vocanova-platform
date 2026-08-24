---
id: VOC-###
title: Replace with change title
status: draft
type: feature
risk: R1
owner: replace-with-owner
approved_requirement: replace-with-document-or-decision-id
dependencies: []
---

# VOC-### — Change title

## Business or product objective

State the outcome and why it matters. Link the approved Vocanova requirement or
decision; a chat transcript alone is not approval evidence.

## Problem and desired outcome

Describe the current problem and the observable end state.

## Users affected

Identify affected users, operators, systems, or stakeholders.

## Scope

### In scope

- Required outcome.

### Out of scope

- Explicit exclusion.

## Requirements

Use **must**, **must not**, **should**, and **may** precisely.

### Functional and user-experience requirements

- REQ-01: Requirement.

### Business rules

- Rule.

### Data and API requirements

- Data lifecycle, contracts, compatibility, retention, and migration expectations.

### Security and privacy requirements

- Authentication, authorization, minimization, logging, secrets, and threat controls.

### Accessibility and performance requirements

- Observable standard or threshold.

### Error and edge-case behavior

- Failure behavior and recovery.

## Acceptance criteria

Use stable identifiers and the format in
[acceptance-criteria.md](acceptance-criteria.md).

### AC-01 — Observable outcome

Given a defined starting state
When an action or event occurs
Then an observable result occurs
And required side effects or protections hold

## Impact analysis

Mark each `Affected`, `Not affected`, or `Unknown — blocks readiness`, and explain
every affected or unknown entry.

| Area                                    | Status | Evidence or required work |
| --------------------------------------- | ------ | ------------------------- |
| Product scope and UX                    |        |                           |
| Living documents and decisions          |        |                           |
| Frontend and accessibility              |        |                           |
| Backend and API contracts               |        |                           |
| Database and migrations                 |        |                           |
| Authentication and authorization        |        |                           |
| Privacy, personal data, audio, or voice |        |                           |
| Security and secrets                    |        |                           |
| Analytics                               |        |                           |
| AI behavior/providers                   |        |                           |
| Infrastructure and deployment           |        |                           |
| Testing                                 |        |                           |
| Support and operations                  |        |                           |

## Implementation plan and tasks

- Planned implementation pull-request count: `1` by default
- Task-to-PR mapping:
- Multi-PR rationale or `N/A — one coherent PR default`:

Task IDs are minimum-sufficient traceability/evidence groupings. They do not imply
separate branches or pull requests. Use one task when it preserves clear mapping;
use more only when a real dependency, owner, evidence, or rollback boundary exists.

| Task ID     | Description                               | Acceptance criteria | Dependencies | Owner         |
| ----------- | ----------------------------------------- | ------------------- | ------------ | ------------- |
| VOC-###-T00 | Minimum-sufficient coherent delivery task | AC-01               | None         | builder actor |

Record the technical approach, largest safe coherent delivery unit, component
sequence, compatibility, known risks, and any justified multi-PR boundary/overhead
rationale.

## Test plan

| Acceptance criterion/risk | Test level or review            | Command/evidence |
| ------------------------- | ------------------------------- | ---------------- |
| AC-01                     | Unit/integration/journey/manual | To be completed  |

Include relevant formatting, lint, types, unit, integration, build, security,
accessibility, migration, preview, staging, and rollback validation. Do not list a
tool as required unless it exists or the implementation task includes installing it.

## Release and rollback plan

- Release class and rationale:
- Preview/staging validation:
- Migration order:
- Rollout and monitoring:
- Rollback trigger:
- Rollback mechanism and owner:
- Last known-good reference:
- User/support communication:
- Production outcome and observation window:

## Risk and approvals

- Declared risk: R#
- Path-detected floor: pending CI
- Protected areas:
- Active governance model: VOC-079 approval-neutral / separately governed rollback reference
- Independent verifier required: Yes
- Builder/reviewer actor identities, roles, authorship independence, exact reviewed revision, and optional runtime provenance:
- EHR triggered: Yes/No and evidence
- Action-specific authority required: Yes/No; name action and accountable role
- Authority evidence or N/A:

Under VOC-079, no R0-R4 class requires founder or standing technical-steward approval
merely because of its label. Record proportionate deterministic evidence and exact-
revision independent review. For R4, also record decision, impact, contingency, and
applicable specialist evidence. Explicit action-specific authority and any triggered
EHR remain independently applicable.

A role is a responsibility; an actor is an attributable human or separately
instantiated AI participant. The reviewer must be a different non-author actor for the
exact SHA. A relabel, new session, model, or provider is not separation. Model/provider
metadata may harden evidence but never supplies approval, merge, or action authority.

## Assumptions and open questions

Material open questions must be resolved before `implementation-ready`.

## Traceability

- Objective:
- Approved requirement/decision:
- Issue/specification:
- Branch/tasks:
- Pull request/commit:
- Tests and verification:
- Preview/release:
- Observed production outcome:
