---
name: clean-branches
description: Remove merged or remote-deleted short-lived branches and their disposable worktrees. Use after a pull request is confirmed merged.
---

# Clean branches

1. Run `git fetch --prune` and confirm the pull request is merged.
2. Inspect `git branch -vv` and `git worktree list`.
3. Switch the primary worktree to `main` and fast-forward it.
4. Remove only the explicit disposable worktree for the merged branch, then delete that local branch.
5. Confirm `git status`, remaining branches, and worktrees.

Never delete `main`, an unmerged branch, an unidentified worktree, or a directory that contains uncommitted user work.
