---
id: ADR-0001
title: Agent orchestration architecture for autonomous development
status: superseded
date: 2026-08-14
decision_owner: m-e-h-r-d-a-a-d
risk: R2
supersedes: null
superseded_by: VOC-078
related_changes: [PR-50, PR-51]
---

# ADR-0001 — Agent orchestration architecture for autonomous development

## Context

The repository experimented with two agent control planes: an external relay of
stateless GitHub Actions jobs and a local `orchestrator/run.mjs` process that polled
issues, launched separate implementer and reviewer prompts, merged pull requests, and
watched deployment. The design aimed to preserve context, separate implementation
from review, reduce routine founder interruptions, and react to downstream failures.

Neither path established reliable end-to-end evidence. The external relay accumulated
vendor, credential, and sequencing failures. The local process duplicated repository
and deployment authority in an unproven script, depended on machine-local credentials,
and never implemented the promised complete post-merge reaction model.

## Historical decision

The proposed design would have kept GitHub Actions deterministic, used an event-started
agent session as an orchestrator, delegated implementation and independent review to
separate roles, and retained the local script until the replacement proved itself.
Role separation and exact-revision independent review remain useful governance ideas;
the repository-specific agent executor described here does not.

## Superseding decision

VOC-078 supersedes this proposed ADR. T01 removed the external workflow relay. T02
removes `orchestrator/`, `.claude/agents/`, `.karsift/`, and the package launch scripts.
No issue, label, comment, workflow, or repository script now starts an agent, merges or
closes a pull request or issue, or deploys on an agent's judgment.

Humans and AI agents may still contribute through ordinary branches and pull requests.
They follow the same approved-requirement, deterministic-check, independent-review,
and merge-evidence rules. A future orchestrator requires a new accepted decision and
an adopted implementation package; this ADR grants it no authority.

## Consequences

- The experimental code and vendor-specific subagent configuration are absent from the
  active repository.
- Historical reasoning and approval links remain available in Git history and DOC-16's
  amendment history; active documentation does not describe the experiment as live.
- Agent triggering, autonomous merge/close, deployment, retry, and monitoring behavior
  are explicitly outside the current repository automation model.
- Reverting the T02 commit restores the removed experiment without a data migration or
  server mutation.

## Verification

Repository policy tests assert that the retired paths and package launch scripts stay
absent, issue/comment triggers cannot start agent work, and repository automation
cannot autonomously merge or close pull requests or issues.
