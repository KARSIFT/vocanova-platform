---
id: ADR-0005
title: Provider-neutral distinct-agent role separation
status: accepted
date: 2026-08-23
decision_owner: accountable repository-governance decision role under pre-VOC-082 rules
risk: R4
supersedes: null
related_changes: [VOC-082, PR-110]
---

# ADR-0005 — Provider-neutral distinct-agent role separation

## Context

Current governance already permits human and AI participants and prohibits self-review,
but provider-named examples caused an operational ambiguity: a different role could be
mistaken for a different human, or a provider/model choice could be mistaken for
authority. This decision makes the existing separation and authority boundaries
explicit without changing evaluator semantics, repository permissions, or any
external-effect hold.

## Decision

For a task and exact revision:

- A **role** is a bounded responsibility.
- An **actor** is the attributable human or separately instantiated AI participant
  assigned to perform that role.
- An **identity record** binds the actor, role, exact revision, assignment, and result
  in GitHub evidence. It is declared provenance, not cryptographic proof of an
  external person, model, provider, or session.
- **Runtime provenance** is optional model/provider/tool metadata for audit or defense
  in depth. It never supplies repository, approval, merge, or external-action authority.

Independence requires a different actor that did not author the reviewed exact
revision. A plan author cannot review or adopt that plan; an implementation builder
cannot review, approve, or merge that revision. A reviewer who materially changes it
becomes a builder of the resulting SHA; checks and an independent review must then be
repeated for that new SHA. A merge actor is a non-author who audits the complete
exact-SHA evidence; the role is not required to be human.

Different models or providers may be used as defense in depth. The base rule does not
require them, and they do not create authority. Where an applicable package or
pre-change governance expressly requires cross-model evidence, that remains a scoped
evidence control. Technical review and merge eligibility never satisfy a separately
defined authority for contracts, spending, secret or personal-data disclosure,
production access, irreversible external mutation, or an initial public or predefined
major launch.

## Worked examples

**Valid AI-only sequence.** `planner-ai-17` prepares an adopted package;
`builder-ai-42`, in its own assigned worktree, produces SHA `abc123`; `reviewer-ai-08`
has not authored that SHA, records an exact-SHA PASS and resolved findings; and
`merge-audit-ai-03`, also a non-author, verifies the eligibility result and the
authorized merge action. All ordinary evidence, permissions, and any action-specific
hold must still pass. No human is required solely because these actors are AI agents.

**Invalid relabeling.** `builder-ai-42` finishes SHA `abc123` and then calls itself
`reviewer-ai-42`, changes its prompt, or starts a new session before issuing a verdict.
It remains the same actor and cannot independently review, approve, or merge that
revision. Calling a provider/model different does not repair missing actor separation.

## Consequences

Active governance, contributor guidance, templates, and operational examples use this
role/actor contract. Product-owner decisions remain with the accountable product
decision owner; delivery-role wording does not change product behavior or material
product decisions. Historical bootstrap, EHR, vendor, and tool records remain
historical evidence or scoped boundaries, not current role assignments.

No executor, hosted identity guarantee, vendor hierarchy, deployment capability, or
new action authority is created. GitHub remains the canonical repository record.
