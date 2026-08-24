# VOC-092 — Release and Rollback Plan

## Release and external-action authorization

Plan adoption authorizes repository implementation only after its bookkeeping revision
also passes exact review, genuine eligibility, normal merge, and post-merge checks.
The adoption decision must additionally and explicitly bind the operator direction and
three action holds for the one-field settings mutation, exact remote-ref cleanup, and
exact safe local cleanup. `VOC-085-HOLD-00` remains a hard blocker until its named
operator, exact authority/expiry, pre-state, payload, rollback owner, immediate docs
follow-up, and post-state evidence are complete. Review evidence alone does not satisfy
those holds.

`automatic_merge_allowed: true` is examined package policy metadata. No workflow
performs a merge. A non-author actor merges the implementation and promotion PRs only
after their exact evidence is complete.

## Promotion boundary

The release is a separately reviewed pull request from the frozen `develop` head to
`main`, merged with an identifiable merge commit. It changes repository history only.
Cloudflare, DNS, deployment, environments, secrets, production data, migrations,
traffic, spending, and public launch remain prohibited. The held delivery state
machine must remain blocked before credentials and environment jobs.

## Cleanup and outcome monitoring

Cleanup starts only after promotion and applicable post-merge checks. Canonical GitHub
evidence receives the exact recovery manifest before destructive actions. Monitoring
is read-back of the GitHub setting, refs, PR/issue state, local worktrees/branches,
tree equality, and hosted checks; there is no live-service monitoring.

## Rollback and contingency

- Setting: PATCH only `delete_branch_on_merge` back to `false`, read it back, and
  immediately reconcile living docs through a governed PR.
- Remote/local ref: recreate the exact name from the recorded SHA. Do not invent or
  approximate a missing SHA.
- Implementation content: normal reviewed revert PR to `develop`, then a separately
  reviewed promotion if `main` also requires correction.
- Promotion: normal reviewed revert of the identifiable merge commit; never reset or
  force-push `main`.

Retain any dirty, unique, ambiguous, or unrecoverable artifact and record it as a
safety exception. Trigger EHR only when a required destructive action cannot be made
demonstrably recoverable or critical evidence remains materially conflicting.

## Closure

Issue #151 closes only after setting/documentation implementation, promotion, safe
cleanup, final read-backs, applicable hosted checks, exact retained-exception list,
recovery instructions, and no-deployment evidence are attached. Plan merge or
implementation merge alone is not closure.
