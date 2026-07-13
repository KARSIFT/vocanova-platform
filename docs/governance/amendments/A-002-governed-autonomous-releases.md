---
id: A-002
title: Governed Autonomous Releases
version: 1.0
status: proposed
owner: founder
canonical_path: docs/governance/amendments/A-002-governed-autonomous-releases.md
approved_at: null
approval_evidence: pending-github-pull-request
last_reviewed_at: 2026-07-13
review_cycle: quarterly
supersedes:
  - DOC-15 production authority clauses
  - A-001 founder-only release clauses
related_documents:
  - DOC-15
  - DOC-16
related_decisions: []
---

# Amendment A-002 — Governed Autonomous Releases

This text records the approved founder direction supplied for implementation, but the
repository amendment remains `proposed` until the founder approves the reviewed
GitHub revision and it is merged. That repository approval is the evidence required
to mark the amendment `approved` and activate it as canonical policy.

## Initial adoption exception

The initial pull request adopting DOC-16 and A-002 may merge without
technical-steward approval because no qualified human steward has yet been appointed.
This one-time exception requires founder approval, independent Claude Code
verification, and passing repository validation. It must be recorded as a bootstrap
exception; technical-steward approval must not be marked as received or satisfied.

The exception authorizes only adoption of the governance text. It does not authorize
production deployment, autonomous production releases, R3 protected technical
changes, or any future bypass of steward approval. Claude Code remains an independent
verifier and does not become the accountable human technical steward.

The technical-steward requirement becomes effective immediately after this framework
is merged. Until a qualified human steward is appointed and enforcement is activated,
R3 changes remain blocked from production and autonomous production release remains
disabled. R4 decisions continue to require founder approval. This exception expires
when the initial governance pull request merges and cannot be reused.

## Decision

The previous rule requiring founder approval for every production merge and
publication is superseded.

1. Low-risk, reversible R0-R1 production releases may merge to `main` and publish
   automatically after all applicable deterministic checks, staging verification,
   independent verification, release gates, and rollback-readiness checks pass.
2. Moderate R2 releases may also be automated without founder approval only when the
   change is reversible, its stronger risk-specific checks pass, and an approved
   release policy explicitly permits that change type.
3. Protected technical R3 changes require approval from a qualified, accountable
   human technical steward before merge to the protected destination and before
   production release.
4. Consequential R4 business, financial, legal, strategic, product-direction,
   privacy, user-trust, or difficult-to-reverse decisions require founder approval.
5. The initial public launch and every major launch decision require founder approval
   even when the underlying implementation would otherwise classify lower.
6. A release containing changes of different classes inherits the highest class and
   every applicable approval requirement.
7. Independent AI verification does not satisfy a human technical-steward or founder
   approval requirement.

## Unchanged controls

- Production deploys only from `main`.
- `develop` and `main` remain protected from direct and unverified pushes.
- Codex cannot approve its own implementation or deploy directly to production.
- Claude Code remains the independent verifier and may block a merge or release, but
  is not the legally accountable technical steward.
- Required checks cannot be waived by the builder or by an automation agent.
- Failed releases preserve evidence and follow an approved rollback or incident path.
- Product strategy is unchanged by this amendment.

## Superseded statements

This amendment overrides only conflicting statements in DOC-15, A-001, or related
summaries that say:

- every `develop` to `main` merge requires founder approval;
- every publication of `main` to production requires founder approval;
- autonomous production is prohibited regardless of risk and reversibility; or
- founder approval is the only valid approval for protected technical changes; or
- an R3 protected technical change may merge into `develop` with CI and Claude Code
  approval but without qualified human technical-steward approval.

All other DOC-15 and A-001 controls remain in force.

## Effective enforcement

Autonomous release authority is not active merely because this amendment is merged.
It becomes active only when the repository rulesets, required status checks,
independent-verifier identity, protected environments, Cloudflare projects,
monitoring, and tested rollback controls listed in
[repository-settings.md](../repository-settings.md) are configured and evidenced.
Before then, production release remains manually controlled.
