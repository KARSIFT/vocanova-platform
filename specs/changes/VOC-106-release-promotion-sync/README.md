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
main-only commits. After exact held-ruleset/history and stable-state verification, the
preparer derives `release/voc-106-claim-*`, atomically coalesces its exact target, and
creates the full-SHA attempt plus allocation-bound submit marker at frozen develop.
The PR uses that alias as head, targets `main`, and records a prospective merge tree
equal to frozen develop/head. The actual release merge must preserve that tree.

Claim/attempt/submit and draft PR are one immutable identity. Only verified submit
`201` authorizes one no-retry/no-redirect POST; zero after marker is
`submit-outcome-unknown`. Any protected-ref, head/base,
merge-base, tree, compare, PR metadata, check, policy evidence, or reviewed-revision
drift after claim is irrecoverable. Cardinality cleanup comes first. Protected release
refs are never updated, forced, deleted, or automatic-deletion eligible. Same-develop
retry needs the deterministic advanced frontier and a fresh distinct identity. The synchronization PR repeats the freeze after release because its correct
main ancestry cannot be known beforehand.

## Boundaries

The two mandatory PRs form one coherent outcome because branch finalization cannot
finish after promotion alone. They require separate reviews because their protected
targets and exact source states differ. No settings query/change, manual deletion,
workflow dispatch, deployment, Cloudflare or DNS action, secret/data access, migration,
traffic change, spend, or launch is in scope.

Before each successful merge, record the short-lived head name, exact SHA, tree, and
nonexecuted recreation command. Existing automatic deletion may remove only the
successfully merged synchronization head, never protected release refs or permanent branches.

`automatic_merge_allowed: true` records the required default package policy only; it
does not perform a merge or relax R4 evidence, actor separation, or action authority.

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
