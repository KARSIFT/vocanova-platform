---
id: A-004
title: Orchestrator Independent-Verification Merge Authority
version: 1.0
status: approved
owner: founder
canonical_path: docs/governance/amendments/A-004-orchestrator-independent-verification-merge-authority.md
approved_at: 2026-08-14T15:19:41Z
approval_evidence: PR-54-founder-approval-comment-5295002955-reviewed-commit-94f4d2196156c55b3264f955c4d03746ab2cd37a
repository_adoption: adopted (merged to develop via PR #54, commit 70b73382a7af2e607a0a29d32b91af7aae9b802e)
last_reviewed_at: 2026-08-14
review_cycle: quarterly
supersedes:
  - id: karsift-ai-infra pipeline.yml
    scope: the plan/adopt/implement/review/remediate/merge-gate/release job relay and its risk-classification-in-PR-body requirement, for orchestrator-originated PRs only
related_documents:
  - DOC-15
  - DOC-16
  - A-002
  - A-003
  - docs/decisions/ADR-0001-agent-orchestration-architecture.md
related_decisions:
  - A-003
---

# Amendment A-004 — Orchestrator Independent-Verification Merge Authority

> **Status: approved and adopted.** Founder approval recorded on PR #54, issue comment
> [5295002955](https://github.com/KARSIFT/vocanova-platform/pull/54#issuecomment-5295002955),
> bound to reviewed commit `94f4d2196156c55b3264f955c4d03746ab2cd37a`. PR #54 merged
> into `develop` as commit `70b73382a7af2e607a0a29d32b91af7aae9b802e`. This document
> was drafted by Claude Code, which per `docs/governance/README.md` could not be its
> sole approver — the founder's own comment above is the approval evidence, the same
> pattern A-002 and A-003 used.

## 1. Purpose

`karsift-ai-infra`'s `pipeline.yml` relay (`plan → adopt → implement → ci → review →
remediate → merge-gate → release`) was built for a system with no persistent context
between steps and a constantly-rotating roster of AI vendors filling each role (see
`karsift-ai-infra/config/roles.yml`'s own history — 15+ vendor changes in under three
weeks). Most of that machinery exists to compensate for that lack of continuity and
vendor churn: PR-body risk-classification parsing, a separate merge-gate approval
ceremony, an `agent/`-branch-prefix requirement just to trigger review.

ADR-0001 (`docs/decisions/ADR-0001-agent-orchestration-architecture.md`) replaces that
system, for this repository's own automated work, with one live orchestrator session
that holds context throughout and dispatches its own implementer and reviewer
subagents (`.claude/agents/implementer.md`, `.claude/agents/reviewer.md`) — separated
at the tool-access level, not just by convention, and each optionally backed by a
genuinely different vendor for real independence.

This amendment updates merge authority to match: an orchestrator-originated PR that
has already satisfied real, substantive independent verification should not also need
to satisfy a second, separate ceremony designed for a system this repository no
longer runs. It does not weaken independent verification — it changes which
mechanism counts as satisfying it, and only for the narrow case this section defines.

## 2. What this changes

For a pull request that is **orchestrator-originated** (§3 defines this precisely),
and only for such a PR:

- The `karsift-ai-infra` `pipeline.yml` relay — `plan`, `adopt`, `implement`,
  `review`, `remediate`, `merge-gate`, `release`, `auto-advance` — is not required to
  run or pass.
- A `Risk classification: R#` line in the PR body is not required.
- The PR may be merged directly by the orchestrator once the conditions in §3 are
  met, without a separate `approved` comment from the founder.

## 3. Conditions — all of these, every time, no exceptions

1. **The PR is orchestrator-originated**: implemented by the `implementer` subagent
   and independently reviewed by the `reviewer` subagent (or an equivalent
   3rd-party tool filling that role per ADR-0001 §4), both dispatched from the same
   live orchestrator session — not a human contributor, not a different automated
   system.
2. **This repository's own deterministic checks pass** — the real
   lint/typecheck/test/build commands, actually run, not asserted.
3. **The reviewer returns `VERDICT: PASS` or `VERDICT: PASS WITH NON-BLOCKING
   FINDINGS`**, bound to the exact reviewed commit, from a subagent that never had
   write access to the change it's reviewing.
4. **The change is not R4** and does not touch secrets, production data, or an
   irreversible action. Any change matching that description always falls back to
   the full existing process in `docs/governance/` — path-based risk classification,
   protected-areas review, and founder approval where DOC-16/A-002/A-003 already
   require it — regardless of how confident the orchestrator's own verification is.
   This condition cannot be satisfied by the orchestrator's own judgment; it is
   checked the same deterministic, path-based way `scripts/governance/
   classify-change-risk.sh` already checks it for every other PR.

If any condition is not met, the PR follows the existing process in full — this
amendment grants no authority to work around a failed condition.

## 4. What does not change

Everything in `docs/governance/` continues to apply in full to every PR that is not
orchestrator-originated per §3, and to every orchestrator-originated PR that fails
any condition in §3. Specifically unchanged, matching A-003 §3's own list:

- founder authority over consequential decisions;
- R0–R4 risk classification as a concept and its deterministic path-based floor;
- protected areas and required human approvals proportionate to risk;
- prohibition of implementation self-approval — the reviewer subagent must remain
  genuinely independent (no write access, and per ADR-0001, ideally a different
  vendor than the implementer) for §3.3 to be satisfiable at all;
- controlled production deployment, rollback requirements, and emergency controls;
- R4 founder authority and Exceptional Human Review, both exactly as defined
  elsewhere in `docs/governance/`.

This amendment does not authorize the orchestrator to approve its own substantial
correction, expand its own authority, or waive §3's conditions for a given PR because
a prior PR satisfied them.

## 5. Adoption

Same lifecycle as A-002 and A-003: formal founder approval requires evidence
attributable to the configured founder identity, bound to the exact final revision of
this document, recorded before this amendment governs any merge. Until that evidence
exists, `status: proposed` stands and no PR may cite this document as merge authority.
