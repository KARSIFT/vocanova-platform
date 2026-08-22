# Architecture Decision Records

This established directory is the canonical location for Vocanova material decision
rationale, including Architecture Decision Records (ADRs). It is not a legacy or
transitional path, and no duplicate root-level `decisions/` directory is permitted.
ADRs preserve why a significant technical choice was made;
accepted records are superseded by a new ADR rather than silently rewritten.

## Naming and lifecycle

Use `ADR-####-short-title.md` and one of: `proposed`, `accepted`, `deprecated`, or
`superseded`. Link the approved change specification and every affected living
document. Architecture decisions that create R3 protected changes require strengthened
applicable controls and independent verification. A-003 historically removed standing
approval for routine R3; VOC-079 applies the approval-neutral principle across R0-R4.
R4 requires
stronger decision, impact, contingency, specialist, deterministic, and exact-revision
independent-review evidence, not founder approval caused solely by the label. Explicit
action-specific authority and genuinely triggered EHR remain separate gates.

## Index

| Record                                                        | Status                | Decision                                                                                                             |
| ------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [ADR-0001](ADR-0001-agent-orchestration-architecture.md)      | Superseded by VOC-078 | Retired repository-local agent orchestration architecture                                                            |
| [ADR-0002](ADR-0002-risk-class-approval-neutral-authority.md) | Accepted              | Risk class determines evidence, not personal approval                                                                |
| [ADR-0003](ADR-0003-cloudflare-native-runtime-and-data.md)    | Accepted              | Cloudflare Workers, OpenNext, Hono, and D1 replace the owned-server target through a parity-gated migration          |
| [ADR-0004](ADR-0004-external-ruflo-orchestration.md)          | Accepted              | Ruflo coordinates external provider-neutral roles while GitHub remains canonical and authority stays deny-by-default |

## Template

```markdown
---
id: ADR-####
title: Decision title
status: proposed
date: YYYY-MM-DD
decision_owner: replace-with-owner
risk: R#
supersedes: null
related_changes: []
---

# ADR-#### — Decision title

## Context

## Decision

## Consequences

## Alternatives considered

## Security, privacy, data, and operational impact

## Migration and rollback

## Affected documents and system areas

## Verification and approvals
```

The decision section records the approved outcome. Implementation detail belongs in
the linked change specification unless it is itself architecturally significant.
