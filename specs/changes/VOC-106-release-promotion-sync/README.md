# VOC-106 — Promote the current develop release and synchronize branch history

## Objective and scope

Issue [#191](https://github.com/KARSIFT/vocanova-platform/issues/191) requests one
repository-only release-finalization outcome: promote the current verified integrated
`develop` state through an exact disposable release alias into `main`, then return
that exact `main` ancestry to `develop` through the required separately reviewed
short-lived synchronization PR.

This package is deliberately distinct from historical VOC-092/PR #154. Closed PR
[#190](https://github.com/KARSIFT/vocanova-platform/pull/190) supplied useful current
source validation but failed closed because it had no truthful canonical package path.
It is evidence, not authorization.

VOC-114, adopted through PR #214 from issue #213, corrects this package's former
permanent-`develop` head instruction and stale post-adoption bookkeeping. It preserves
VOC-106's approved candidate, review, adoption, two-PR boundary, and action authority;
the correction itself performs no release or external action.

## Initial observation and fresh-freeze rule

At plan preparation, `origin/main` was
`718ea9d9d5ff3476de9db9439414c2a6e07a6f4a` and `origin/develop` was
`03528a84988ebe664207c6a439e133070627c92a`; `main` was their merge base and
`develop` was 84 commits ahead. This is not the release freeze: adoption itself and
ordinary repository work can move `develop`.

The release PR must freshly fetch and freeze exact `origin/main` and
`origin/develop` SHAs and trees. Frozen `main` must be their merge base with zero
main-only commits. The preparer creates
`release/voc-106-<frozen-develop-short-sha>` as a ref-only exact SHA/tree alias of
frozen develop, and proves its aggregate compare contains no extra commit or tree.
The PR uses that alias as head, targets `main`, and records a prospective merge tree
equal to frozen develop/head. The actual release merge must preserve that tree.

The alias and draft PR are one immutable attempt. Any protected-ref, head/base,
merge-base, tree, compare, PR metadata, check, policy evidence, or reviewed-revision
drift invalidates the complete evidence set. Close and abandon it without deleting or
rewriting the ref; freeze again and use a fresh collision-free SHA-derived name and
evidence. An existing name fails closed unless proved the untouched head of that same
attempt; another PR or actor's ref is never adopted, overwritten, force-updated, or
deleted. The synchronization PR repeats the freeze after release because its correct
main ancestry cannot be known beforehand.

## Boundaries

The two mandatory PRs form one coherent outcome because branch finalization cannot
finish after promotion alone. They require separate reviews because their protected
targets and exact source states differ. No settings query/change, manual deletion,
workflow dispatch, deployment, Cloudflare or DNS action, secret/data access, migration,
traffic change, spend, or launch is in scope.

Before each successful merge, record the short-lived head name, exact SHA, tree, and
nonexecuted recreation command. Existing automatic deletion may remove only the
successfully merged release and synchronization heads, never permanent `develop` or
`main`.

`automatic_merge_allowed: true` records the required default package policy only; it
does not perform a merge or relax R4 evidence, actor separation, or action authority.
