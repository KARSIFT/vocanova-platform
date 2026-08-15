---
id: ADR-0001
title: Agent orchestration architecture for autonomous development
status: proposed
date: 2026-08-14
decision_owner: m-e-h-r-d-a-a-d
risk: R2
supersedes: null
related_changes: [PR-50, PR-51]
---

# ADR-0001 — Agent orchestration architecture for autonomous development

## Context

Vocanova already owns real infrastructure: a GitHub repo, GitHub Actions, Docker Compose,
staging and production servers, Cloudflare, and a database. Development has been driven by
`karsift-ai-infra`'s `pipeline.yml` — a relay of stateless GitHub Actions jobs
(`plan → adopt → implement → ci → review → remediate → merge-gate → release`), each cold-started
and re-deriving context from PR/issue comment text, with the `implementer`/`reviewer`/`planner`
roles filled by a constantly-swapped roster of AI vendors (`karsift-ai-infra/config/roles.yml`,
15+ vendor changes in under three weeks — mostly chasing quota, not quality).

In practice this made development slow and fragile: VOC-072-T00, a single "record this secret
name" task, took 5 full implement/review rounds over 2 days because the task itself required a
human-only action no AI role could ever complete; a merge-gate bug meant a founder's `approved`
comment silently failed to override a FAIL verdict; `merge-gate` evaluated `checks_ok` before
`lighthouse` had finished on two separate PRs (#50, #51) tonight and declined to auto-merge for
no real reason. None of this was a one-off — it was the direct cost of stateless steps and vendor
churn instead of one process holding context.

## Decision

1. **Keep existing infrastructure.** No migration to an all-in-one platform (Lovable/Replit-style
   hosted builders). Vocanova already solved "get a working app hosted" before this ADR existed;
   what was missing is automation around infrastructure Vocanova already owns.
2. **GitHub Actions stays scoped to deterministic work only**: CI checks (lint/typecheck/test/build)
   and the existing push-triggered `deploy-staging.yml` / `deploy-production.yml`. Nothing about
   those workflows' own trigger semantics changes.
3. **A Routine — an event-triggered Claude Code cloud session, not a persistent daemon** — fires
   per task (e.g. on a GitHub issue labeled `agent:ready`). Claude Code cloud sessions are not
   designed to sit and poll 24/7; the Routine model (fire → run one task → stop) is the correct
   fit, not a workaround.
4. **Inside that session, an Implementer role and a Reviewer role do the actual work.** Each role
   is a slot, not a fixed vendor: it can be filled by a native Claude subagent
   (`.claude/agents/*.md`, tool- and model-restricted at the config level) or by shelling out to a
   3rd-party CLI (e.g. Cursor) for a genuinely independent second opinion. The Reviewer role is
   where a different vendor matters most — a same-vendor reviewer with a fresh context window can
   still share the implementer's blind spots; a different company's model structurally can't.
5. **`CLAUDE.md` imports `AGENTS.md`** (`@AGENTS.md`) rather than duplicating instructions, so the
   portable, cross-tool base stays usable if a second AI tool is ever added deliberately.
6. **Oversight does not stop at merge.** A REACT step watches for failures anywhere downstream —
   post-merge CI, a staging deploy, a production deploy — not just inside the implement/review
   loop.
7. **Retrying is a judgment call, not a fixed count, and escalation is triaged, not automatic.**
   There is no hardcoded retry limit on the Implementer/Reviewer loop — the orchestrator decides
   after every single failed review whether trying again is worth it, the same live judgment it
   applies to a REACT-caught failure downstream. Deciding to stop trying does not itself mean
   paging the founder: the orchestrator classifies the cause and autonomously
   retries with a stronger/different model, re-scopes an under-specified task, retries a flaky
   step cleanly, or deprioritizes low-value work — all without a human. Only two categories
   escalate: genuine product ambiguity where guessing wrong is expensive (with options and a
   recommendation already worked out, not a raw dump), and anything touching secrets, production
   data, or an irreversible action, which escalates on every occurrence regardless of retry count.
   Everything else stays with the orchestrator.
8. **`orchestrator/run.mjs`** (the interim script built and merged in PR #50/#51, which shells out
   to separate `claude -p` processes) **is not deleted by this ADR.** It keeps running as the
   proven fallback until the Routine + subagent design above is built and verified against real
   issues.

## Consequences

- The founder should see escalations rarely — by design. That also means trusting the
  orchestrator's autonomous triage calls (retry vs. re-scope vs. deprioritize) without a
  per-decision human check. This needs active monitoring during the initial trust-building period,
  not a one-time review.
- Losing "a different vendor every week" is not a regression. `roles.yml`'s churn was chasing free
  quota, not quality, and was the direct cause of most pipeline failures this repo has seen — a
  stable default with one deliberate cross-vendor hop (Reviewer → Cursor) captures the actual
  benefit without the instability.
- The karsift-ai-infra-backed `implement`/`adopt` (in `change-package.yml`) and `review`/
  `merge-gate` (in `pipeline.yml`) jobs are not retired by this ADR — they keep running in
  parallel. Retiring them is a deliberate future decision, made only after the design above is
  proven, not a side effect of accepting this record.

## Alternatives considered

- **Persistent 24/7 cloud daemon.** Rejected — not what Claude Code cloud sessions are for; a
  session expires on inactivity rather than running indefinitely.
- **Plain script shelling out to `claude -p` for every step** (what PR #50/#51 actually built).
  Kept as the interim fallback, rejected as the long-term design — it has no judgment, can't
  adapt task scope, and re-implements plumbing (subprocess management, stdout parsing, a hardcoded
  retry counter) that a live agent gets for free.
- **All-in-one platform (Lovable/Replit/Site44-style).** Rejected — would discard infrastructure
  Vocanova already owns to re-solve a problem that isn't open.
- **Escalate to the founder on every exhausted retry** (the original design, before this ADR).
  Rejected in favor of triaged escalation (§7) — the founder's time is the scarce resource this
  whole system exists to protect.

## Security, privacy, data, and operational impact

This ADR touches no secrets, production data, or migrations directly. §7's hard rule — secrets,
production data, and irreversible actions escalate on every occurrence, never gated by a retry
count — is the operational control that keeps triaged autonomy from silently expanding into
unsafe territory as trust in the system grows.

## Migration and rollback

Additive only. `pipeline.yml`/`change-package.yml`/`package-release.yml` and `karsift-ai-infra`
keep running exactly as they do today (behavior-preserving split across those three files, VOC
CI-cleanup); nothing here requires touching them further. Rollback is simply not building the
Routine/subagent flow described in §3–§7 — there is nothing to revert on the existing pipeline
since it was never changed.

## Affected documents and system areas

- `.github/workflows/pipeline.yml` (`review`/`merge-gate`) and `change-package.yml`
  (`implement`/`adopt`) — eventual retirement of these jobs is a deliberate future decision, out
  of scope for this ADR.
- `orchestrator/run.mjs`, `orchestrator/RUNBOOK.md` — interim implementation (PR #50, PR #51),
  stays in place per §8.
- `CLAUDE.md` — needs the `@AGENTS.md` import (§5), not yet made.
- New: `AGENTS.md`, `.claude/agents/implementer.md`, `.claude/agents/reviewer.md` — not yet
  created.

## Verification and approvals

Status: **proposed**. Nothing in §3–§7 has been built or run against a real task yet —
verification is pending the actual Routine and subagent implementation, plus at least one
supervised end-to-end run. Per this repo's `CLAUDE.md`, Claude Code acts as independent verifier
only and cannot grant founder or steward approval; this record needs the founder's explicit
acceptance (updating `status` to `accepted`) before it governs anything.
