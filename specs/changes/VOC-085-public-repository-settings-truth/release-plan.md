# VOC-085 — Release Plan

## Release and deployment authorization

There is no product release, deployment, settings activation, or external mutation.
Merging this package changes repository documentation and deterministic evidence only.
It grants no Cloudflare, Sentry, DNS, server, secret, production-data, spending,
launch, environment, or `main` promotion authority.

## Preconditions and outcome

Before each task merge, require local validation, different-role exact-SHA PASS,
resolved blockers, applicable hosted checks, and a separate non-author merge actor.
The final outcome is truthful current-public settings guidance plus preserved VOC-080
history and a fail-closed static guard, with all future protections still held.

## Issue closure

Issue #119 must remain open through plan review, adoption, implementation PR review,
hosted proof, and merge. Only after the final implementation merges into `develop` and
applicable post-merge checks pass may an accountable operator close it with links to
the current-state record and reconciled guidance. Closure must state that no settings
or live system was changed. VOC-080-HOLD-00/01/02 remain held.

## Rollback and final evidence

If a current-state field, historical boundary, active claim, or scope assertion is
wrong, revert the repository commits in reverse order and re-run the relevant checks.
Do not repair a documentation defect by changing hosted settings. Preserve exact
review FAIL history and corrected PASS evidence. Final evidence must include the exact
candidate SHA, review, hosted runs, rollback tree equality, post-merge checks, and
the issue closure record if closure is then authorized.
