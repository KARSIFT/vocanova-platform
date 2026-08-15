# Governance

This directory contains the current controls for Vocanova's autonomous development
workflow. Read these documents together with
[DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md).

DOC-16 is a single, self-contained, current statement of governance authority - it
used to work alongside three separate amendments (A-002, A-003, A-004), each
scoped to "supersedes only this clause." As of 2026-08-14, DOC-16 v2.0 folds all
three amendments' operative rules directly into itself; the amendment files are
retired and removed, with their approval evidence preserved in DOC-16's own
"Amendment history" section.

## Current documents

| Document | Purpose |
|---|---|
| [DOC-16](16-autonomous-development-operating-model.md) | Approved canonical autonomous-development operating model - the single current source, including former A-002/A-003/A-004 rules and their approval evidence |
| [A-003 transition state](a003-transition-state.yaml) | Machine-readable approval, adoption, activation, and operational truth |
| [Technical-steward appointment](technical-steward-appointment.md) | Permanent historical evidence; retired as routine R3 approval authority |
| [Change risk classification](change-risk-classification.md) | R0-R4 classification and verification requirements |
| [Protected areas](protected-areas.md) | Sensitive paths and change types |
| [Approval matrix](approval-matrix.md) | Required decision, technical, verification, and release authorities |
| [Repository settings](repository-settings.md) | Required GitHub and external configuration |
| [Post-merge activation checklist](post-merge-activation-checklist.md) | Tracked steps required before protected or autonomous releases |

Governance changes are protected changes. An author or implementation agent cannot
be the sole approver of a governance change.
