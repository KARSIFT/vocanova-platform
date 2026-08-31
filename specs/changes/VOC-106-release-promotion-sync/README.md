# VOC-106 — Promote the current develop release and synchronize branch history

## Objective and scope

Issue [#191](https://github.com/KARSIFT/vocanova-platform/issues/191) requests one
repository-only release-finalization outcome: promote the current verified integrated
`develop` state to `main`, then return that exact `main` ancestry to `develop` through
the required separately reviewed short-lived synchronization PR.

This package is deliberately distinct from historical VOC-092/PR #154. Closed PR
[#190](https://github.com/KARSIFT/vocanova-platform/pull/190) supplied useful current
source validation but failed closed because it had no truthful canonical package path.
It is evidence, not authorization.

## Initial observation and fresh-freeze rule

At plan preparation, `origin/main` was
`718ea9d9d5ff3476de9db9439414c2a6e07a6f4a` and `origin/develop` was
`03528a84988ebe664207c6a439e133070627c92a`; `main` was their merge base and
`develop` was 84 commits ahead. This is not the release freeze: adoption itself and
ordinary repository work can move `develop`.

The release PR must freshly fetch and record its exact base/source SHAs, trees,
merge-base, divergence, aggregate compare, hosted checks, and reviews. Any movement
invalidates that complete evidence set. The synchronization PR repeats this process
after the release because its correct main ancestry cannot be known beforehand.

## Boundaries

The two mandatory PRs form one coherent outcome because branch finalization cannot
finish after promotion alone. They require separate reviews because their protected
targets and exact source states differ. No setting change, manual deletion, workflow
dispatch, deployment, Cloudflare or DNS action, secret/data access, migration,
traffic change, spend, or launch is in scope.

`automatic_merge_allowed: true` records the required default package policy only; it
does not perform a merge or relax R4 evidence, actor separation, or action authority.
