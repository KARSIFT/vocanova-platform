# VOC-093 — Specification

## Objective and requirement source

Synchronize `develop` history after the verified 2026-08-24 UTC VOC-092 promotion so
`develop` records current `main` ancestry again, GitHub no longer reports `develop`
behind `main`, and the living release/governance documentation plus deterministic
guards require that post-promotion synchronization boundary for future repository
finalization. The requirement source is issue #155.

## Baseline and problem

At drafting time on Monday, 2026-08-24 UTC:

- `origin/develop` = `0dd1c935354961f2d3ff9900efa128dd418fa61e`
- `origin/main` = `718ea9d9d5ff3476de9db9439414c2a6e07a6f4a`
- `git rev-list --left-right --count origin/develop...origin/main` = `0 23`
- `git rev-parse 'origin/develop^{tree}' 'origin/main^{tree}'` returns the same tree
  object `c0cb3f6ec029898d7d12321a8723a4457164173b`
- `git merge-base --is-ancestor origin/develop origin/main` succeeds
- `gh api repos/KARSIFT/vocanova-platform/compare/develop...main` reports `ahead_by:
  23`, `behind_by: 0`, `status: ahead`

This is ancestry drift, not content loss. The current release/finalization guidance
requires a separately reviewed `develop` → `main` promotion, but it does not yet
require the safe history loop back into `develop` after that merge-commit promotion.

## Decisions and requirements

- `VOC-093-D00` — Keep the default coherent unit: one approved package, one
  minimum-sufficient task, and one implementation PR. Do not split documentation,
  guard/tests, and ancestry synchronization into separate tasks or PRs because they
  share one rollback boundary, one review surface, and one protected-branch outcome.
- `VOC-093-D01` — Implementation must start from an isolated short-lived branch or
  worktree created from the then-current `origin/develop`. `main` itself must never be
  used as a temporary or auto-deletable PR head.
- `VOC-093-D02` — The implementation branch must incorporate the then-current
  `origin/main` ancestry with a merge commit before the PR merges. If `main` or
  `develop` moves before implementation or review completes, refresh the live freeze
  and evidence; do not replay stale SHAs by assumption.
- `VOC-093-D03` — The implementation PR into `develop` must merge with a merge commit,
  not squash or rebase, so the synchronized `main` ancestry remains visible in
  `develop` history. `main` remains unchanged.
- `VOC-093-D04` — The only content changes allowed beyond the ancestry merge are the
  prevention surfaces required to keep current release/finalization guidance truthful:
  `AGENTS.md`,
  `CONTRIBUTING.md`,
  `.github/README.md`,
  `docs/governance/16-autonomous-development-operating-model.md`,
  `docs/governance/repository-settings.md`,
  `docs/operations/10-development-workflow.md`, and the current DOC-15 authority
  matrix section in
  `docs/operations/15-ai-native-product-and-engineering-operating-model.md`.
- `VOC-093-D05` — Those living surfaces must state that a reviewed `develop` → `main`
  release PR is not the full branch-finalization boundary on its own. Finalization is
  complete only after the post-promotion history loop returns current `main` ancestry
  to `develop` through a short-lived synchronization branch and merge commit, while
  keeping deployment/settings/live-action boundaries unchanged.
- `VOC-093-D06` — The drafting review also checked `README.md`,
  `docs/operations/11-devops-and-ci-cd.md`, and
  `docs/governance/post-merge-activation-checklist.md`. They are explicitly excluded
  from the required implementation diff because they are not current release/
  finalization procedure sources: `README.md` is repository overview, DOC-11 is
  environment/deployment architecture, and the post-merge activation checklist is a
  prospective hosted-enforcement checklist. If implementation changes their subject
  matter too, stop and return to planning rather than broadening silently.
- `VOC-093-D07` — Add the minimum deterministic guard/tests needed to fail closed when
  the living release/governance surfaces omit or contradict that synchronization
  requirement. The guard must validate only current living guidance, not historical
  evidence files.
- `VOC-093-D08` — Post-merge evidence must prove:
  - `git merge-base --is-ancestor origin/main origin/develop` succeeds;
  - `git rev-list --left-right --count origin/main...origin/develop` has left count
    `0`;
  - GitHub reports `develop` behind `main` by `0`;
  - `main` is unchanged;
  - permanent refs remain present; and
  - file-content differences from `main` are limited to the adopted documentation and
    deterministic-guard surfaces.
- `VOC-093-D09` — Preserve the dirty VOC-090 worktree/branch and all other current
  recovery exceptions. This package performs no manual branch deletion, no worktree
  removal, and no settings mutation. The only allowed ref-deletion consequence is the
  existing GitHub behavior that may automatically delete the merged short-lived plan or
  implementation source branch head because `delete_branch_on_merge` is already true.
  Record the exact source-branch name and tip SHA before merge, then read back the
  post-merge branch set and the exact recreate command from that SHA. `main`,
  `develop`, and any other permanent or manually targeted ref are excluded.
- `VOC-093-D10` — Run the applicable deterministic checks for governance/doc/script
  changes, obtain different-actor exact-SHA independent review plus a different-actor
  release/governance specialist review, resolve every blocker, and merge through a
  non-author actor only after genuine eligibility evidence.
- `VOC-093-D11` — No settings, Cloudflare, DNS, deployment, environment, secret,
  production-data, migration, traffic, spending, launch, or `main` promotion action is
  in scope. Repository history changes stop at `develop`.
- `VOC-093-D12` — `automatic_merge_allowed: true` is explicit read-only package policy
  metadata and must not be described as a merge executor.

## Data, security, privacy, analytics, and accessibility

No application behavior, user data, secrets, production systems, analytics, or UI
accessibility surfaces are changed. The package changes repository history plus
documentation and deterministic repository guards only.
