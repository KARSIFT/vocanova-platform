---
name: pr
description: Prepare and follow a focused VocaNova pull request through checks and merge. Use after implementation and relevant local verification are complete.
---

# Pull request

1. Review `git status`, the complete diff from `main`, and recent commits.
2. Run `verify` for the affected areas and resolve failures before publishing.
3. Commit without bypassing hooks. Use a Conventional Commit title under 100 characters.
4. Push the short-lived branch and open a PR that links the issue when one exists, summarizes behavior, and lists exact validation.
5. Inspect checks and review threads with `gh pr checks` and `gh pr view`; fix root causes and push the updated revision.
6. Squash-merge only when required checks pass and actionable threads are resolved. Confirm the merge, then follow `clean-branches`.

Never force-push shared work or merge a failing revision.
