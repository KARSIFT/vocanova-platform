# VOC-085 — Release Plan

## Release and deployment authorization

There is no product release, deployment, settings activation, or external mutation.
Merging this package changes repository documentation and deterministic evidence only.
It grants no Cloudflare, Sentry, DNS, server, secret, production-data, spending,
launch, environment, or `main` promotion authority.

## Preconditions and outcome

Before each task merge, require local validation, different-role exact-SHA PASS,
resolved blockers, applicable hosted checks, and a separate non-author merge actor.
The plan merged through PR #126 as `b3834b7cbf67679811666b00db7ec6525b69c39a`.
T00, T01, and T02 merged through PRs #127–#129 as
`c2a351158026b2b6b3a352cb7e4b58c9d9a061ba`,
`d223002d0e232eff7bc13f35e5d66e625d751afb`, and
`8dd45f50b3a8be120aee29485349bdedd5a6d3ca`, respectively. Their exact review,
hosted, post-merge, and preserved FAIL records are in `t03-evidence.yaml`.
The final outcome is truthful settings guidance current as observed at 2026-08-24 plus
preserved VOC-080 history and a fail-closed static guard. Observed dependency/
vulnerability alerts are recorded separately from disabled Dependabot security updates
and secret-scanning controls, with all future protections held by VOC-085-HOLD-00 or
the distinct VOC-080 holds. The guard proves internal consistency only, not live
freshness.

## Issue closure

Issue #119 must remain open through plan review, adoption, implementation PR review,
hosted proof, and merge. Only after the final implementation merges into `develop` and
applicable post-merge checks pass may an accountable operator close it with links to
the current-as-observed-at-2026-08-24 record and reconciled guidance. Closure must state
that no settings or live system was changed. VOC-085-HOLD-00 and VOC-080-HOLD-00/01/02
remain held and distinct. The settings hold does not block repository-only merge.

## Rollback and final evidence

If a current-as-observed-at-2026-08-24 field, historical boundary, active claim, or
scope assertion is
wrong, revert the repository commits in reverse order and re-run the relevant checks.
Do not repair a documentation defect by changing hosted settings. Preserve exact
review FAIL history and corrected PASS evidence. Final evidence is recorded in
`t03-evidence.yaml`; this candidate records the base, completed task chain, rollback
tree expectations, and closure gate, while exact T03 review, hosted proof, merge,
post-merge checks, and any issue closure remain pending.
