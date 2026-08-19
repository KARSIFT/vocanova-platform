# Contributing

## Human and agent contributions

Humans and AI agents use the same repository workflow: an approved requirement, an
isolated branch, deterministic checks, an independent exact-revision review by a
different role, and a pull request into `develop`. Role separation is what matters;
the policy does not permanently bind planner, implementer, or reviewer duties to one
vendor.

GitHub Actions performs deterministic validation only. It does not trigger an agent,
draft or adopt a package, implement code, post an AI verdict, remediate a failure,
merge a pull request, or promote a release. The interim local orchestrator remains
present until VOC-078-T02, but it is not triggered by issues or workflow events and
does not replace the required GitHub evidence trail.

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
those capabilities are disabled system-wide as a matter of historical authority.
VOC-078-T01 has retired the workflow implementation that previously performed
automatic merge and package release; reintroducing either requires a separately
adopted, repository-owned design. See AGENTS.md's "Change workflow" section for the
current manual evidence and merge path.
