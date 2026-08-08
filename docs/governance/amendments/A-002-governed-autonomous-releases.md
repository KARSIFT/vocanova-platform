---
id: A-002
title: Governed Autonomous Releases
version: 1.0
status: approved
owner: founder
canonical_path: docs/governance/amendments/A-002-governed-autonomous-releases.md
approved_at: 2026-07-13
approval_evidence: PR-3-founder-approval-comment-4961029533-reviewed-commit-09f97341ff093fd20a70683d88b772e154979330
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

> **A-003 active-authority notice:** A-003 has been effectively active since
> `2026-07-17T16:44:34Z` and partially supersedes only A-002's standing
> technical-steward requirements for routine R3 merges and releases. A-002's adoption
> history and all non-conflicting controls remain authoritative audit evidence.

Founder approval was recorded on PR #3 against reviewed commit
`09f97341ff093fd20a70683d88b772e154979330` in issue comment `4961029533`. PR #3 was
merged into `develop` on 2026-07-13. Amendment A-002 is approved canonical governance.

## Initial adoption exception

PR #3 adopted DOC-16 and A-002 without technical-steward approval because no
qualified human steward had yet been appointed. The one-time exception required
founder approval, independent Claude Code verification, and passing repository
validation. It was recorded as a bootstrap exception; technical-steward approval was
not marked as received or satisfied.

The exception authorized only adoption of the governance text. It did not authorize
production deployment, autonomous production releases, R3 protected technical
changes, or any future bypass of steward approval. Claude Code remains an independent
verifier and did not become the accountable human technical steward.

The technical-steward requirement became effective immediately when PR #3 merged and
remained effective until A-003 activation. The historical qualified human steward is
recorded in
[technical-steward-appointment.md](../technical-steward-appointment.md), while hosted
enforcement remains a separate activation requirement. Under active A-003, routine R3
does not require standing steward or founder approval solely because it is R3; R4
decisions continue to require founder approval, and autonomous production release
remains disabled. The exception expired when PR #3 merged and cannot be reused.

**Updated 2026-08-08**: "autonomous production release remains disabled" above
describes the state as of this amendment - it does not remain true afterward. The
founder later separately, explicitly authorized automatic production release for
vocanova-platform-sandbox (see `AGENTS.md`'s "Release and deployment authority"),
through a distinct decision unrelated to and not derived from this amendment's own
exception (which, as stated above, expired and cannot be reused for exactly this
kind of authorization). R4 decisions in general still require founder approval;
this is one specific R4 decision the founder already made, not a standing bypass.

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
   production release. Active A-003 supersedes this standing-approval clause for
   routine R3 work while preserving all non-conflicting controls.
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
