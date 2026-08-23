---
id: ADR-0004
title: External Ruflo orchestration with GitHub-canonical evidence
status: accepted
date: 2026-08-22
decision_owner: m-e-h-r-d-a-a-d
risk: R4
supersedes: null
related_changes: [VOC-080, PR-86]
---

# ADR-0004 — External Ruflo orchestration with GitHub-canonical evidence

## Context

VOC-078 retired two unsuccessful repository-controlled agent systems: external
GitHub workflow dispatch and a repository-local planner/implementer/reviewer
orchestrator. Their authority, credentials, mutable state, and lifecycle behavior
were difficult to prove. The useful requirements remain: hierarchical task
coordination, isolated roles, continuity across a large program, and independent
exact-revision review.

Ruflo provides multi-agent coordination and Codex integration, but its initializer
can create `.agents/`, `.codex/`, hooks, plugins, MCP configuration, and project
instructions. Running `ruflo init --force` in this repository could overwrite or
compete with canonical governance and revive repository-local authority by accident.

## Decision

Ruflo is adopted as an **external development orchestrator**, never as repository or
production authority.

- The audited baseline is Ruflo `3.38.16`, upstream commit
  `5234333c3462640ab348363ba4a142945fd2bc47`, with npm integrity
  `sha512-a9wmeKchybcjmG1XKXDJneliDkMCLLtAJWjiRLhkgLf2W7pFvEimDH1ZkQHM393XaJEpBCxSfKZ0NQe3/DfybA==`.
  T02 re-verifies the registry metadata before external installation. Upgrades require
  a new review; no floating `latest` execution is accepted.
- Ruflo runs from an operator-controlled user/workspace MCP or plugin installation,
  outside the tracked repository. The project does not run `ruflo init --force`.
- Any tracked integration is minimal, hand-reconciled, reviewable documentation or
  guard configuration. No repository-local daemon, issue listener, launcher, mutable
  task database, or vendor-specific authority file is introduced.
- Ruflo may create hierarchical planner, researcher, architect, task-orchestrator,
  builder, tester, specialist, and independent-reviewer roles. Builders use isolated
  branches/worktrees; reviewers receive the exact revision and completed evidence.
- Planner, builder, and reviewer participation is provider-neutral. Builder and
  reviewer are different participants with no shared authorship of the reviewed
  revision. Reviewers are explicitly told not to duplicate completed long-running
  suites or start background processes.
- GitHub issues, adopted change packages, commits, pull requests, checks, review
  records, and comments remain canonical. Ruflo plans, memory, receipts, or consensus
  are supporting provenance only and cannot approve scope, adoption, eligibility, or
  release.
- Ruflo receives no GitHub approve/merge/close/dispatch authority, Cloudflare token,
  production secret or data, DNS authority, deployment permission, spending authority,
  or public-launch authority. It cannot convert issue/comment text into execution.
- Memory is limited to non-sensitive development patterns and sanitized task context.
  Tokens, personal data, learner content, secrets, production output, and private
  provider payloads are prohibited.

GitHub Actions stays deterministic and read-only except for its native check/summary
result. The Governance workflow's eligibility evaluator consumes evidence but never
merges. An accountable actor other than the author performs a merge after the same
gates pass. Ruflo never substitutes for an action-specific hold or EHR.

## Consequences

- The repository gains a defined hierarchical orchestration shape without restoring
  the retired local control plane.
- Ruflo setup is reproducible by exact version/integrity but intentionally remains an
  operator-side capability. A fresh clone does not silently start agents.
- Provider or model changes do not change governance authority; participant identity,
  role separation, exact SHA, evidence, and verdict are what matter.
- Ruflo downtime or removal cannot block deterministic CI or corrupt canonical state.
  Work continues through ordinary GitHub branches and pull requests.
- Any request for GitHub writes, Cloudflare access, production data, deployment, DNS,
  spending, or public launch is rejected or routed to the separately accountable role.

## Alternatives considered

- **Run Ruflo initialization with force in the repository:** rejected because upstream
  generated instructions, hooks, plugins, and MCP state could overwrite or bypass the
  repository's authority model.
- **Restore the old local orchestrator:** rejected by VOC-078 and its fail-closed
  repository guards.
- **Run agents from GitHub issue/comment workflows:** rejected because untrusted text
  must not dispatch agents and the four workflows are deterministic evidence only.
- **Give the orchestrator merge or Cloudflare credentials:** rejected because
  coordination is not approval or external-effect authority.
- **Bind roles permanently to Codex, Claude, or another vendor:** rejected because
  governance assigns roles to capable participants and requires independence, not a
  vendor hierarchy.

## Security, privacy, data, and operational impact

The main risks are supply-chain compromise, prompt injection, instruction overwrite,
secret leakage, shared builder/reviewer context, unbounded cost, and accidental GitHub
or Cloudflare mutation. Exact pinning, external installation, deny-by-default tools,
sanitized memory, worktree isolation, role receipts, budget limits, repository guards,
and exact-SHA review mitigate them. No live integration is enabled by this ADR alone.

## Migration and rollback

VOC-080-T02 audits and installs the pinned external integration, documents the
operator runbook and role/evidence envelope, extends negative guards, and rehearses a
synthetic repository-only task. Rollback removes the external MCP/plugin/user
configuration and non-sensitive Ruflo memory. GitHub evidence and repository history
remain unchanged.

## Affected documents and system areas

AGENTS.md, CONTRIBUTING.md, `.github` guidance, DOC-10, DOC-12, DOC-15, DOC-16,
repository authority guards, and operator-side Ruflo configuration. ADR-0001 remains
superseded historical evidence; this decision does not reactivate it.

## Verification and adoption

The adopted [VOC-080 package](../../specs/changes/VOC-080-cloudflare-native-ruflo/README.md)
defines the T02 boundary and negative tests. Its exact candidate
`6fb00a0b64e6f2d4adceb24a9caeffd9af98c779` received independent PASS review with no
blocking findings on PR #86; PR #86 merged into `develop` as
`399ccefa879545b43574c02fdc3babff223a1db0`.

Upstream references:

- [Ruflo repository](https://github.com/ruvnet/ruflo)
- [Ruflo 3.38.16 release](https://github.com/ruvnet/ruflo/releases/tag/v3.38.16)
