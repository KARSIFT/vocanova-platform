# VOC-086 — Release and Rollback Plan

There is no deployment or product release. Each task is a repository-only draft PR into
its predecessor; after exact review and hosted proof it may merge normally into
`develop` through a separate merge actor. `main` promotion is out of scope.

Before each merge, record the exact head, base, review verdict, specialist evidence,
deterministic checks, hosted runs, and rollback command. Roll back in reverse order with
normal revert commits after confirming the exact target. Rehearsals use disposable
worktrees and never delete broad or unresolved paths.

No issue closure occurs on plan adoption or an intermediate task. After T02 merges and
applicable post-merge checks pass, an accountable operator may close issue #131 with
repository-only evidence. VOC-080-HOLD-00/01/02 remain held before and after closure.
