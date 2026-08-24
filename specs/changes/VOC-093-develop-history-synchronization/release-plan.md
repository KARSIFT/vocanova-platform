# VOC-093 — Release and Rollback Plan

## Release and merge authority

This package does not promote `develop` to `main` and does not deploy anything. Its
only implementation merge target is `develop`, and that merge must use a merge commit
to preserve current `main` ancestry inside `develop`. `automatic_merge_allowed: true`
remains package metadata only; a non-author actor merges only after exact-SHA review,
deterministic evidence, and genuine eligibility are complete.

Because the live repository setting `delete_branch_on_merge` is already `true`, a
normal merge of this plan PR and of the later short-lived implementation PR is
expected to let GitHub automatically delete only the merged source branch head after
merge. Exact source-branch name/SHA capture, post-merge readback, and a recreate
command are therefore required merge evidence. This package grants no manual branch
deletion authority and no permanent-branch deletion authority.

## Repository-history boundary

The package changes repository history only in `develop`. It must not:

- mutate `main`;
- patch GitHub settings;
- manually delete branches or worktrees;
- touch Cloudflare, DNS, environments, secrets, production data, or migrations; or
- trigger or claim deployment/publication activity.

The dirty VOC-090 worktree/branch and other retained recovery exceptions remain out of
scope and must stay preserved.

## Rollback and contingency

- If the PR merged incorrectly, revert it through a normal reviewed PR to `develop`.
- If GitHub automatically deletes the merged short-lived source head, recreate it from
  the recorded exact SHA with the recorded push or branch-create command if recovery is
  needed.
- If `main` or `develop` moved during implementation and the merge no longer proves
  the intended ancestry relationship, refresh evidence before merge rather than
  forcing a stale candidate through.
- Never reset or force-push `develop` or `main`.

## Closure

Issue #155 closes only after the implementation PR normally merges, applicable hosted
checks finish, post-merge ancestry evidence proves `develop` is behind `main` by `0`,
and the no-settings/no-deployment/no-manual-cleanup boundary is documented in the
final evidence record.
