# VOC-002 — Impact Analysis

## VOC-002-IMP-01 — Authority impact

The transition is R4 with an R3 protected effect. Pre-A-003 rules govern adoption.
After valid activation, standing steward approval retires for routine R3, while R4
founder authority and strengthened technical controls remain.

## VOC-002-IMP-02 — Historical evidence

The appointment record is preserved. Its role is current during this PR and becomes
historical/retired for routine authority only after evidence-backed activation.

## VOC-002-IMP-03 — Repository controls

Policy documents, contributor instructions, ownership commentary, protected-path
metadata, templates, validators, and tests require conditional reconciliation.
CODEOWNERS remains review routing and never proves governance approval.

## VOC-002-IMP-04 — Security and privacy

The change grants no credentials, production access, data access, or deployment
authority. Self-modification remains independently verified and fail-closed.

## VOC-002-IMP-05 — Release and operations

There is no production release. RL1/RL2 are governance permissions in frozen A-003,
not technically activated capabilities. Automatic merge and autonomous production
release remain disabled.

## VOC-002-IMP-06 — Dependencies

Exact-SHA Claude verification and dual-capacity human approval are required before
merge. Post-merge validation and adopted-SHA evidence are required before activation.
Hosted protections and future Control Plane work remain separate dependencies.

## VOC-002-IMP-07 — Rollback

Before dependent A-003-governed changes, revert the adoption commit and restore the
pre-A-003 authority state. After dependent work begins, rollback requires a new
governed impact analysis and must not erase audit evidence.

## VOC-002-IMP-08 — Documentation and compatibility

DOC-16 and A-002 remain historically accurate and authoritative until activation;
conditional notices document their partial future supersession. DOC-17 and DOC-18
are neither adopted nor implemented.

## Risks, dependencies, and evidence

Primary risks are premature activation, approval self-authorization, historical
rewriting, and implied operational automation. Deterministic negative tests and
exact-revision independent/human evidence mitigate them.
