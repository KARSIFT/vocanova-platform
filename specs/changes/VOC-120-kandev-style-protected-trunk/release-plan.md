# VOC-120 — Release and Activation Plan

## Repository-only transition

VOC-120 does not deploy the application. PR1 may prepare `develop`, but the current
issue #191 stop record forbids promotion until PR #215 and issue #231 receive permanent
qualified-human resolutions and required corrections pass. Every candidate through
PR5 remains evaluated by frozen pre-change authority: PR1/PR2 use legacy gates plus
the exact tracked verifier digest, and PR3-PR5 use its protected immutable ref. PR6 is
the first future-policy merge-queue rehearsal.
VOC-120 is scoped only for qualified confirmation that PR #215 is abandoned unmerged
and issue #231 needs the aggregate-dispatch proof; a different outcome requires plan
revision and fresh review before adoption.

## Adoption and action authority

The founder-repository-owner `@m-e-h-r-d-a-a-d` owns the adoption decision after exact
independent PASS evidence. Separately, that owner must authorize each settings,
transition/rollback-ref, and branch mutation. No secret value is read, and no action
grants deployment, production, learner-data, DNS, spending, contract, or launch
authority.

## Ordered activation

1. While draft, obtain qualified-human confirmation of both selected outcomes; revise
   and re-review the plan if either differs.
2. Record adoption, complete bookkeeping review/merge, then implement and review PR1
   on `develop` only.
3. Close PR #215 unmerged under `HOLD-05`; implement/review the exact one-file PR2 test.
4. Authorize additive action A: protect refs, security/tags/main, merge-compatible old
   plus transition gates, and dual/bounded staging policy.
5. Merge immediate doc-only PR3 settings truth to `develop`.
6. Implement and review PR4 cleanup under the immutable verifier.
7. Perform the final old-model merge-commit promotion and synchronization while
   committed state remains preparation.
8. Authorize action B: squash/linear main, future gates/reviews, sole-main staging,
   ordered `develop` retirement, and a repository-variable lock admitting only PR5;
   keep the merge queue disabled.
9. Merge immediate doc-only PR5 after its old-verifier/future-gate checks; PR5 alone
   changes committed state to active.
10. Authorize action C to clear the lock and enable the merge queue; immediately merge
    PR6 under the future Protected lane through that queue and record final truth.

## Monitoring

Observe a Standard PR, Protected PR, and merge-queue candidate. Confirm path selection,
aggregate conclusions, stale-review dismissal, approval floors, thread resolution,
squash history, and absence of external actions. Any false skip, missing gate, queue
deadlock, review bypass, environment mismatch, or stale settings claim triggers
rollback.

## Rollback

Restore the applicable ruleset/settings/environment snapshot, protected verifier and
rollback refs, and `develop` from its exact recreation SHA. Before PR5 acceptance,
restore merge-compatible phase-A rules if old-process reversal is required. Preserve
Git and EHR evidence; do not touch D1, Cloudflare Workers, traffic, learner data, DNS,
or secret values.

## Closure

VOC-120 closes only after six exact-reviewed PRs, both qualified-human EHR outcomes,
the exact correction, all three settings readbacks, final branch/PR inventory,
rollback proof, PR5 old-authority acceptance, and PR6 merge-queue rehearsal. A missing
qualification statement keeps the draft unadopted and prevents PR1.
