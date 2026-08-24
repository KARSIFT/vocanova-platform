# Governance

This directory contains the current controls for Vocanova's autonomous development
workflow. Read these documents together with
[DOC-15](../operations/15-ai-native-product-and-engineering-operating-model.md).

DOC-16 is a single, self-contained, current statement of governance authority - it
used to work alongside three separate amendments (A-002, A-003, A-004), each
scoped to "supersedes only this clause." DOC-16 v2.0 folded all three amendments'
operative rules directly into itself; the amendment files are retired and removed.
DOC-16 v3.0 added VOC-079's approval-neutral R4 transition. DOC-16 v3.1 records
VOC-080's Cloudflare-native target and external Ruflo permission boundary; v3.2
records the VOC-082 distinct-actor clarification, and v3.3 records VOC-085's public
settings truth and held activation boundary. Historical approval evidence remains
preserved and non-reusable in DOC-16's "Amendment history" section.

## Current documents

| Document                                                              | Purpose                                                                                                                                                                                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [DOC-16](16-autonomous-development-operating-model.md)                | Approved canonical autonomous-development operating model (v3.3), including former A-002/A-003/A-004 rules, VOC-079, VOC-080 boundaries, VOC-082 role separation, VOC-085 settings truth, and historical evidence |
| [A-003 transition state](a003-transition-state.yaml)                  | Machine-readable approval, adoption, activation, and operational truth                                                                                                                                            |
| [Technical-steward appointment](technical-steward-appointment.md)     | Permanent historical evidence; retired as routine R3 approval authority                                                                                                                                           |
| [Change risk classification](change-risk-classification.md)           | R0-R4 classification and verification requirements                                                                                                                                                                |
| [Protected areas](protected-areas.md)                                 | Sensitive paths and change types                                                                                                                                                                                  |
| [Approval matrix](approval-matrix.md)                                 | Required decision, technical, verification, and release authorities                                                                                                                                               |
| [Repository settings](repository-settings.md)                         | Required GitHub and external configuration                                                                                                                                                                        |
| [Post-merge activation checklist](post-merge-activation-checklist.md) | Tracked steps required before protected or autonomous releases                                                                                                                                                    |

[ADR-0005](../decisions/ADR-0005-provider-neutral-distinct-agent-role-separation.md)
is the companion decision record for the role/actor, exact-revision, and provenance
contract. A reviewer verdict never replaces separately assigned action authority.

Governance changes are protected changes. An author or implementation agent cannot
be the independent reviewer or merger of its own revision. Risk class alone creates no
founder-approval requirement; complete R4 evidence and action-specific authority still
apply where relevant.
