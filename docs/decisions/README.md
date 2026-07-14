# Architecture Decision Records

This established directory is the canonical location for Vocanova material decision
rationale, including Architecture Decision Records (ADRs). It is not a legacy or
transitional path, and no duplicate root-level `decisions/` directory is permitted.
ADRs preserve why a significant technical choice was made;
accepted records are superseded by a new ADR rather than silently rewritten.

## Naming and lifecycle

Use `ADR-####-short-title.md` and one of: `proposed`, `accepted`, `deprecated`, or
`superseded`. Link the approved change specification and every affected living
document. Architecture decisions that create R3 protected changes require a human
technical steward; consequential R4 decisions also require the founder.

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
