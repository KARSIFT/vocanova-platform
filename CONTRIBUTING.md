# Contributing

## Automated orchestrator PRs

Some pull requests in this repository are opened, and sometimes merged, automatically
by an orchestrator rather than by a human contributor. These are triggered from a
GitHub issue labeled `agent:ready`; the orchestrator implements and independently
reviews the change following the roles defined in `.claude/agents/implementer.md`
and `.claude/agents/reviewer.md`. Depending on which orchestrator path is running -
the interim `orchestrator/run.mjs` script, which currently sends its own inline
prompts to the `claude` CLI rather than loading those files as native Claude Code
subagents, or an interactive Claude Code orchestrator session, which sometimes can
dispatch them as real subagents and sometimes (recorded live on PR #60) follows
their instructions directly as a prompt when that mechanism isn't available in the
current context - the exact dispatch mechanism varies, but the role split and its
guarantee do not: whichever way it runs, the reviewer role never has write access
to the change it reviews.

If you see a PR like this and aren't expecting it, that's normal, not a mistake. For
the full architecture, see
[ADR-0001](docs/decisions/ADR-0001-agent-orchestration-architecture.md) (currently
`status: proposed`, not yet accepted). The merge-authority rules that let a
qualifying orchestrator-originated PR merge without the standard
`karsift-ai-infra` pipeline ceremony are defined in
[DOC-16](docs/governance/16-autonomous-development-operating-model.md)'s "Branch
and merge behavior" section (folded in from the former "A-004" amendment; see
DOC-16's "Amendment history" for the original approval evidence). This authority
only applies when its conditions are met on every occurrence - it does not change
founder authority over
R4 changes, protected-area review, or any other governance requirement described
elsewhere in this document.

Vocanova uses two permanent branches:

- `main` contains production-ready history.
- `develop` is the base branch for ongoing development.

Create working branches from the appropriate protected branch using these prefixes:

- `feature/` for new capabilities
- `fix/` for corrections
- `docs/` for documentation changes
- `refactor/` for behavior-preserving code changes
- `infra/` for infrastructure changes
- `security/` for security changes
- `hotfix/` for an approved emergency path

Use a stable `VOC-###` identifier in the branch name when one exists. Work in an
isolated branch or worktree and target `develop`; release pull requests promote
`develop` to `main`. Working branches are normally squash-merged. Release promotions
use an identifiable merge commit.

Meaningful changes require a linked approved requirement or decision, risk
classification, applicable tests, independent verification, and a pull request.
Follow the [autonomous development model](docs/governance/16-autonomous-development-operating-model.md)
and [risk classification](docs/governance/change-risk-classification.md).

The pull-request template provides two paths:

- `Standard` for behavioral, protected, or otherwise meaningful changes.
- `Lightweight R0` for non-behavioral, non-policy documentation and small maintenance
  changes. It still records objective, scope, risk, relevant checks, and verifier
  evidence, but irrelevant sections may be marked `N/A` with a reason.

Run every installed validation relevant to the change. After the frozen installation
described in the [local development guide](docs/development.md), application-
foundation changes run the applicable root commands, normally beginning with:

```bash
pnpm validate
pnpm audit
```

Governance validation remains independently required where applicable - see
AGENTS.md's ["Current validation"](AGENTS.md#current-validation) section for the
exact current commands, kept in one place rather than duplicated here so the two
files can't drift apart.

Use the exact checked-in tool versions and scripts with a frozen lockfile. Do not claim
an unavailable tool or external deployment passed.

Repository protections apply to contributors and automation actors alike; never
bypass failed checks, required review, branch protection, or production gates. See
AGENTS.md's "Safety" section and DOC-16 for the current R3/R4/EHR authority model -
kept there as the single source rather than restated here.

The one-time initial DOC-16/A-002 bootstrap may merge with founder approval,
independent Claude Code verification, and passing repository validation. It does not
mark steward approval satisfied or authorize production. The exception expires on
merge; R3 production remains blocked until a qualified human steward is appointed and
enforcement is active.

VOC-002 was not a bootstrap exception. It was the completed one-time A-003 migration
governed by pre-A-003 R4 founder and R3 technical-steward approval bound to its exact
revision. That approval is exhausted and cannot be reused - VOC-002 itself grants no
standing automatic-merge or autonomous-production-release authority. This does not mean
those capabilities are disabled system-wide: automatic merge into `develop` is a
separately implemented and proven gate (DOC-16's "Branch and merge behavior"
section, live via karsift-ai-infra's merge-gate.yml) with its own authority, not
derived from VOC-002. See AGENTS.md's
"Change workflow" section for the current, accurate state of that gate and of
autonomous production release.
