---
id: ADR-0002
title: Risk class determines evidence, not personal approval
status: accepted
date: 2026-08-19
decision_owner: accountable-governance-role
risk: R4
supersedes: null
related_changes: [VOC-079]
---

# ADR-0002 — Risk class determines evidence, not personal approval

## Context

Vocanova classifies changes from R0 through R4 by consequence, reversibility, blast
radius, data sensitivity, and authority impact. The earlier model also made R4 a
standing founder-approval and automatic-merge prohibition. That coupled evidence
strength to one permanent identity, treated agents and humans inconsistently, and
could not support a future provider-neutral orchestrator even when complete evidence
already existed.

The transition itself could not use its proposed rule. The exact VOC-079 package
candidate `25a3e246b8f66dd4b92ea9726eb5367c16363018` therefore received independent
review and the former required founder approval on PR #75 before adoption.

## Decision

R0-R4 remain consequence classes. No class, including R4, requires founder or standing
technical-steward approval merely because of its label.

Every meaningful plan and implementation is produced by a builder role and reviewed
by a different role. A human or AI agent may fill either role. A valid verdict names
the exact revision, reports PASS, PASS WITH NON-BLOCKING FINDINGS, or FAIL, and cannot
leave a blocking finding unresolved. The builder cannot verify, approve, or merge its
own work.

R4 remains the highest class and requires the strongest evidence: an explicit decision
record, impact analysis, rollback or contingency plan, applicable specialist and
deterministic results, exact-revision independent verification, and resolution of all
blocking findings. Unknown or unparseable risk fails closed.

Risk evidence does not replace authority for an external action. Contracts, spending,
secrets or personal-data disclosure, production access, irreversible external
mutations, and initial public or predefined major launches remain blocked until the
authority and technical controls explicitly assigned to that action are satisfied.
Each hold names the action, accountable role, evidence, and completion or expiry
condition. EHR remains an exceptional stop condition, never a routine R4 layer.

GitHub is the canonical evidence record. Deterministic GitHub Actions may evaluate the
evidence but do not make business decisions. A future external orchestrator may
coordinate planner, implementer, reviewer, and task-orchestrator roles only through the
same universal contract; vendor identity grants no special authority.

## Consequences

- Complete R4 work may be merge-eligible without a founder review caused solely by
  class, while incomplete R4 work remains fail-closed.
- Builder/reviewer separation and exact-revision review apply equally to plans and
  implementations produced by humans or agents.
- CODEOWNERS continues to route attention but does not prove approval, role separation,
  R4 evidence, or action-specific authority.
- Historical founder and steward approvals remain accurate for their reviewed
  revisions and permanently non-reusable.
- New R0–R4 packages default `automatic_merge_allowed` to `true`; a deliberate `false`
  requires a non-placeholder package-local `automatic_merge_hold_reason`. VOC-079's
  adopted pre-transition value is the sole transition exception.
- The repository currently has no automatic merge or deployment executor; this
  decision grants none and causes no live-system mutation.

## Alternatives considered

1. Keep blanket founder approval for R4. Rejected because class already determines
   evidence strength and a permanent personal gate does not measure evidence quality.
2. Downgrade consequential work to R3. Rejected because R4 remains useful as the
   highest consequence and contingency class.
3. Let each orchestrator define its own policy. Rejected because GitHub must retain one
   provider-neutral, deterministic evidence contract.

## Security, privacy, data, and operational impact

The main risk is excessive autonomous authority. Separation of duties, stronger R4
evidence, fail-closed parsing, exact-revision verdicts, explicit external-effect holds,
and exceptional EHR are mandatory compensating controls. This decision changes no
application data, credentials, deployment, hosting, or repository setting.

## Migration and rollback

VOC-079 reconciles canonical policy first, then adds a read-only local eligibility
evaluator and aligns package drafting. Roll back the complete transition if R4 can pass
without required evidence, self-review becomes possible, or an explicit external-
effect hold can be bypassed. Reverting this decision restores the former rule; no data
or runtime rollback is needed.

## Affected documents and system areas

- DOC-15 and DOC-16
- governance approval, risk, protected-area, and repository-settings guidance
- contributor and pull-request guidance
- future merge-eligibility policy and change-package drafting

## Verification and approvals

- Adopted change package: `specs/changes/VOC-079-r4-approval-neutral`
- Pre-transition independent package review: PR #75 comment `5340623965`
- Pre-transition founder package approval: PR #75 comment `5341799779`
- Those records authorize only the adopted transition package and cannot approve the
  implementation revision or later R4 work.
- Exact implementation review and hosted-check evidence belong on the task pull
  requests so later material changes cannot inherit a stale verdict.
