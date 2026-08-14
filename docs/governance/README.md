# Governance

This directory contains the current controls for Vocanova's autonomous development
workflow. Read these documents together with
[DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md).
A-003 has been effectively active since `2026-07-17T16:44:34Z` and takes precedence
only for the standing technical-steward clauses it expressly supersedes in DOC-16 and
A-002. All non-conflicting controls remain effective.

## Current documents

| Document | Purpose |
|---|---|
| [DOC-16](16-autonomous-development-operating-model.md) | Approved canonical autonomous-development operating model |
| [Amendment A-002](amendments/A-002-governed-autonomous-releases.md) | Approved canonical release-authority amendment |
| [Amendment A-003](amendments/A-003-governed-autonomous-engineering-authority.md) | Approved and effectively active governance amendment; substantive body remains frozen |
| [A-003 transition state](a003-transition-state.yaml) | Machine-readable approval, adoption, activation, and operational truth |
| [Amendment A-004](amendments/A-004-orchestrator-independent-verification-merge-authority.md) | Approved and adopted; orchestrator-originated PR merge authority in place of karsift-ai-infra's pipeline.yml ceremony, scoped narrowly per ADR-0001 |
| [Technical-steward appointment](technical-steward-appointment.md) | Permanent historical evidence; retired as routine R3 approval authority |
| [Change risk classification](change-risk-classification.md) | R0-R4 classification and verification requirements |
| [Protected areas](protected-areas.md) | Sensitive paths and change types |
| [Approval matrix](approval-matrix.md) | Required decision, technical, verification, and release authorities |
| [Repository settings](repository-settings.md) | Required GitHub and external configuration |
| [Post-merge activation checklist](post-merge-activation-checklist.md) | Tracked steps required before protected or autonomous releases |

Governance changes are protected changes. An author or implementation agent cannot
be the sole approver of a governance change.
