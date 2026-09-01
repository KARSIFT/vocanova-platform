# VOC-120 — Release and Activation Plan

## Repository-only transition

VOC-120 does not deploy the application. PR1 targets `develop` and receives an
initial pre-change promotion and synchronization. PR2 and PR4 are the mandatory immediate,
separately reviewed doc-only settings-truth records. PR3 performs non-EHR cleanup.
PR5 is blocked on both qualified-human EHR dispositions and finalizes the bridge.
PR6 immediately records final branch-retirement settings truth.

Every candidate, including PR6, is evaluated against frozen pre-change DOC-15/DOC-16
authority and the immutable transition verifier. The new model cannot approve its own
adoption, cleanup, settings mutation, or branch retirement.

## Adoption and settings authority

The founder-repository-owner `@m-e-h-r-d-a-a-d` is the accountable adoption decision
owner after exact independent PASS evidence. Separately, that owner must explicitly
authorize each exact GitHub settings/ref mutation. Required mutations/readbacks cover:

- security scanning and dependency update features;
- main ruleset, merge queue, stale-review dismissal, conversations, review floors,
  required gate names, and absence of permanent admin bypass;
- immutable version tags and rollback/transition refs;
- `cloudflare-staging` reviewers, admin bypass, policy mode, and custom branch policy
  migration from `develop` through safe dual/bounded transition to `main`;
- eventual `develop` retirement only after EHR, ancestry, rollback, and PR inventory.

No secret value is read. No settings action grants Cloudflare deployment, production,
learner-data, DNS, spending, contract, or launch authority.

## Activation sequence

1. PR1 merge, initial transition promotion/synchronization, rollback ref.
2. Additive settings action A and exact readback.
3. Immediate doc-only PR2.
4. Pre-change-governed PR3 non-EHR cleanup, promotion, and synchronization.
5. Final settings action B after credential-free main gate verification.
6. Immediate doc-only PR4 and its pre-change promotion/synchronization.
7. Qualified-human dispositions for PR #215 and issue #231.
8. Pre-change-evaluated PR5 final cleanup, promotion, and final synchronization.
9. Explicit activation decision and authorized `develop` retirement.
10. Immediate separately reviewed doc-only PR6 on `main`.

## Monitoring

Observe an ordinary Standard PR, a Protected PR, and a merge-queue candidate. Confirm
path selection, all aggregate conclusions, stale-review dismissal, approval floors,
thread resolution, squash history, and absence of external actions. Confirm a main
credential-free staging dispatch passes the policy gate before sole-main environment
policy is claimed. Any false skip, missing gate, queue deadlock, review bypass,
environment mismatch, or stale settings claim triggers rollback.

## Rollback

Restore the applicable settings snapshot, rules/gates, environment branch policy,
transition verifier, and `develop` ref from the recorded exact SHA. Revert through
the currently protected branch under pre-change review. Preserve Git history and all
EHR evidence. Do not touch D1, Cloudflare Workers, production traffic, learner data,
DNS, or secret values.

## Closure

VOC-120 closes only after all six PRs and immediate settings-truth follow-ups,
both EHR dispositions, exact live readback, final branch/PR inventory, rollback proof,
and independent exact review. An unresolved human EHR keeps the overlapping final
cleanup and branch retirement open; it does not block unrelated prepared migration.
