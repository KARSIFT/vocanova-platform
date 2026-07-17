# Contributing

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

Run every installed validation relevant to the change. This repository currently has
no package manifest or application scripts; governance changes run:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

When pnpm and application scripts are introduced through an approved foundation
change, use the exact checked-in scripts with a frozen lockfile. Do not claim an
unavailable tool or external deployment passed.

Under active A-003, routine R3 requires strengthened applicable controls and
independent verification, not standing technical-steward or founder approval merely
because it is R3. R4 founder authority remains unchanged and EHR remains exceptional,
not a routine approval layer. Claude Code is an independent verifier, never human
authority. Repository protections apply to contributors and automation actors alike;
never bypass failed checks, required review, branch protection, or production gates.

The one-time initial DOC-16/A-002 bootstrap may merge with founder approval,
independent Claude Code verification, and passing repository validation. It does not
mark steward approval satisfied or authorize production. The exception expires on
merge; R3 production remains blocked until a qualified human steward is appointed and
enforcement is active.

VOC-002 was not a bootstrap exception. It was the completed one-time A-003 migration
governed by pre-A-003 R4 founder and R3 technical-steward approval bound to its exact
revision. That approval is exhausted and cannot be reused. Automatic merge and
autonomous production release remain disabled.
