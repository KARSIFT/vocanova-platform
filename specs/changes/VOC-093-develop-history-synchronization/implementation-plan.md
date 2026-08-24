# VOC-093 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package revision passes independent plan review and
is adopted. The largest safe coherent unit is one implementation PR into `develop`
because the ancestry merge, the living release/governance documentation updates, and
the deterministic guard/test together define one rollback-safe finalization boundary.
Splitting them would add exact-review, coordination, and bookkeeping overhead without
creating an independently releasable or safer partial state.

## One-task execution sequence

1. Re-fetch `origin/main` and `origin/develop`. Record their exact SHAs, divergence,
   tree objects, and compare output. If the live situation no longer matches a
   repository-history-only synchronization problem, stop and return to planning.
2. Create an isolated short-lived synchronization branch from the then-current
   `origin/develop`. Preserve every existing worktree and recovery exception. Do not
   delete or repurpose the dirty VOC-090 worktree/branch.
3. Merge the then-current `origin/main` into the synchronization branch with a merge
   commit. Resolve conflicts only within package-authorized prevention surfaces. Never
   check out `main` as the PR head and never rewrite `main` or `develop`.
4. Update the living release/governance surfaces:
   `AGENTS.md`,
   `CONTRIBUTING.md`,
   `.github/README.md`,
   `docs/governance/16-autonomous-development-operating-model.md`,
   `docs/governance/repository-settings.md`, and
   `docs/operations/10-development-workflow.md`, plus the current DOC-15 authority
   matrix section in `docs/operations/15-ai-native-product-and-engineering-operating-model.md`.
   Require the post-promotion sync loop before branch finalization is complete, keep
   the no-settings/no-deployment boundary explicit, and describe the existing
   `delete_branch_on_merge=true` consequence truthfully as automatic deletion of only
   the merged short-lived source head.
   `README.md`, `docs/operations/11-devops-and-ci-cd.md`, and
   `docs/governance/post-merge-activation-checklist.md` were reviewed during planning
   and are excluded unless implementation broadens into repository overview,
   environment/deployment architecture, or prospective hosted-enforcement procedure.
5. Add the minimum deterministic guard/test for that boundary, expected as a new
   policy file plus a matching Node test under `scripts/foundation/`.
6. Run at minimum:

   ```bash
   bash scripts/governance/validate-governance.sh
   bash scripts/governance/classify-change-risk.sh --base <current-origin-develop> --head HEAD
   git diff --check <current-origin-develop> HEAD
   pnpm run ci:foundation
   ```

   If the changed-path classifier or actual diff makes a broader check set applicable,
   run that broader set instead of claiming narrower checks suffice.
7. Open one PR from the synchronization branch to `develop`. Record the exact branch
   freeze, merge-base evidence, declared changed paths, exact source-branch name and
   tip SHA, why merge-commit merging is required for this PR, and how to recreate the
   source head if GitHub auto-deletes it after merge.
8. Obtain a different-actor exact-SHA general/R4 review and a different-actor
   release/governance specialist review. Resolve every blocker on a new SHA and repeat
   review as needed.
9. A non-author merge actor merges the PR into `develop` with a merge commit. Do not
   squash or rebase the final PR.
10. After merge, re-fetch `origin/main` and `origin/develop` and record:
    - `git merge-base --is-ancestor origin/main origin/develop`
    - `git rev-list --left-right --count origin/main...origin/develop`
    - GitHub compare evidence showing `develop` behind `main` by `0`
    - unchanged `main` SHA
    - post-merge readback showing whether GitHub automatically deleted the merged
      short-lived source head under `delete_branch_on_merge=true`
    - file differences limited to the adopted prevention surfaces
    - continued presence of the dirty VOC-090 worktree/branch and other retained
      recovery exceptions
11. Close issue #155 only after those exact read-backs and applicable hosted checks
    are attached.

## Validation and independent verification

This package affects governance/release docs and foundation scripts, so exact-SHA
independent review plus deterministic policy/test evidence are mandatory. Hosted
Governance, Security, and path-applicable CI/Quality checks remain part of the merge
record. Reviewers verify that the PR head contains current `main` ancestry and that
the final merge strategy preserves it in `develop`, while the only allowed deletion
effect is GitHub's automatic removal of the merged short-lived source head.

## Rollback

Rollback is a normal reviewed revert PR to `develop`. Never force-push or reset
permanent branches. If post-merge evidence finds that the ancestry loop was not
preserved, revert the PR and re-open planning or implementation with fresh evidence.
