# Governance

This directory contains the current controls for Vocanova's autonomous development
workflow. Read these documents together with
[DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md).
While A-003 is inactive, DOC-16 and A-002 remain effective. After valid A-003
activation, A-003 takes precedence only for the standing technical-steward clauses it
expressly supersedes.

## Current documents

| Document | Purpose |
|---|---|
| [DOC-16](16-autonomous-development-operating-model.md) | Approved canonical autonomous-development operating model |
| [Amendment A-002](amendments/A-002-governed-autonomous-releases.md) | Approved canonical release-authority amendment |
| [Amendment A-003](amendments/A-003-governed-autonomous-engineering-authority.md) | Frozen proposed amendment; not effectively active |
| [A-003 transition state](a003-transition-state.yaml) | Machine-readable approval, adoption, activation, and operational truth |
| [Technical-steward appointment](technical-steward-appointment.md) | Current pre-A-003 authority and permanent historical evidence after activation |
| [Change risk classification](change-risk-classification.md) | R0-R4 classification and verification requirements |
| [Protected areas](protected-areas.md) | Sensitive paths and change types |
| [Approval matrix](approval-matrix.md) | Required decision, technical, verification, and release authorities |
| [Repository settings](repository-settings.md) | Required GitHub and external configuration |
| [Post-merge activation checklist](post-merge-activation-checklist.md) | Tracked steps required before protected or autonomous releases |

Governance changes are protected changes. An author or implementation agent cannot
be the sole approver of a governance change.
