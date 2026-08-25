# VOC-094 — Implementation Plan

## Preconditions and delivery shape

Do not begin until the package is adopted and `implementation.authorized: true` is
recorded through reviewed bookkeeping. Use one isolated short-lived implementation
branch/worktree from then-current `origin/develop`, one builder actor, one task, and
one PR. Record all worktrees/recovery refs before work and preserve them while plan and
implementation PRs remain open.

The implementation PR stays one coherent unit because code/config, policy, tests,
living docs, external settings/resource binders, baseline, dispatch, and closure all
control whether the same staging state is safe and reversible. External actions are
ordered holds inside the unit, not separate implementation PRs.

## Ordered implementation and action sequence

1. **Prepare without implementation.** Freeze the adopted package, a clean exact
   repository SHA, production sentinels, worktrees/recovery refs, affected-surface
   inventory, and current living-document claims. Obtain the exact Phase 1 action
   authority and exact-SHA Cloudflare/security/independent reviews required for the
   external overlay/resource manifest. Bind the clean SHA to successful applicable
   hosted CI, Governance, Quality, and Security and local validation/credential-free
   dry runs. Reverify official Cloudflare docs, locked Wrangler `4.125.0`, config
   schema, and exact command help. Failed, unchecked, stale, or drifted evidence stops
   before credentials or writes. No tracked sentinel, GitHub environment, or secret
   changes occur.
2. **Phase 1 / ACT-00 — read-only authentication and inventory.** Issue a distinct
   secure local/interactive short-lived credential/session with read permissions only
   and no write permission. Keep its value out of files, arguments, output, and
   evidence. Bind account ID, Active `vocanova.site` zone ID/name, Workers Free/billing
   posture, every Worker/D1/Custom Domain, hostname collision state, and permission
   groups. Stop if production Workers/D1 exist without explicit residual account-wide
   acceptance. Record the decision, then revoke/expire this read-only credential before
   issuing any write token.
3. **Phase 1 / ACT-01 — provision D1.** From the same clean exact reviewed repository
   SHA and still-unmodified tracked tree, issue a separate short-lived Phase 1 write
   token with the adopted scope, then create D1 exactly once requesting `--location
eeur` and no jurisdiction. Record the real UUID, requested hint, actual placement/
   served-region readback, schema-independent pre-state, Free-plan state, and exact
   two-Worker/two-domain resource authorization. Stop on collision, duplicate, Paid
   prompt, unplanned permission, or production drift.
4. **Phase 1 / ACT-02 — bootstrap outside tracked config.** Create an untracked
   disposable external route-free Wrangler overlay containing only reviewed non-secret
   real D1/Worker bindings, synthetic-only vars, `workers_dev: false`, preview URLs
   false, and web `API` service binding. Secure auth stays outside it. Hash and review
   the sanitized overlay and resource manifest, and pass their credential-free local/
   schema/dry-run checks before any live command. Apply ordered migrations, then use locked Wrangler 4.125.0
   `wrangler deploy` as the narrow first-creation exception to create/deploy route-free
   API, resolve/tag/read back its baseline UUID, and only then create/deploy route-free
   web bound to the existing API and resolve its UUID. Locked `versions upload` must
   fail closed for a nonexistent script and is not used for either first creation.
   Next hash/review a separate route-bearing overlay and use locked `wrangler triggers
deploy` to attach exactly the two Custom Domains; read back ownership, certificates,
   and DNS, then smoke. No public route exists before this trigger step. To claim live
   rollback, use `versions upload` only now that scripts exist, exact `versions deploy`
   for a newer reviewed probe/candidate, verify it, then roll both Workers to baseline
   UUIDs and prove 100% traffic/health plus unchanged D1. Capture evidence, delete only
   the overlays, and revoke/expire the Phase 1 write token. Do not issue it again.
5. **Phase 2 — external Ruflo only.** Reverify exact Ruflo version, hashes, patched
   frozen graph, audit, role contract, and no background process in a disposable
   external workspace. Use only sanitized Phase 1 evidence for bounded coordination;
   provide no credential or privileged tool. Capture sanitized receipts and remove
   disposable Ruflo state.
6. **Phase 3 — one repository implementation PR.** A different builder starts one
   isolated short-lived implementation branch/worktree from then-current
   `origin/develop`. Bind the real Phase 1 account/zone/D1/version/domain/action
   readbacks into the manifest, both Wrangler configs, `ci.yml`, delivery policy/tests,
   and every declared living document. Add `custom_domain: true`, baseline equality,
   separate action/expiry fields, synthetic/privacy/zero-cost guards, and production
   negatives. Historical evidence stays immutable and production sentinels stay
   unchanged. No GitHub environment or secret exists yet because of this package.
7. Run all credential-free validation/negative fixtures on the final Phase 3 head.
   Obtain fresh different-actor exact-SHA Cloudflare and security/settings specialist
   PASS plus independent R4 PASS; any material fix requires fresh applicable checks and
   reviews. Let a non-author actor merge normally into `develop`. Record the exact
   implementation head, merge SHA, hosted/post-merge checks, source-head readback and
   recreation command, and no manual deletion.
8. **Phase 4 / ACT-03 — environment and distinct token after merge.** Only now create
   or reconcile `cloudflare-staging` under an exact scoped `VOC-085-HOLD-00` action
   record, issue the third distinct short-lived Phase 4 token once, and securely set
   exactly `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Record the authorized
   settings operator/authority, pre-state, exact payload, rollback, immediate merged
   documentation reconciliation, secret names only, token scope/expiry, post-state,
   and no production drift. This discharges only that exact settings action;
   `VOC-085-HOLD-00` remains held for all others. Never reuse or reissue either earlier
   credential.
9. Independently verify the exact merged `develop` SHA, hosted checks, real manifest
   binders, environment/secret-name readback, current resources/baseline, action
   authority, and zero-cent estimate. Under `VOC-094-ACT-04`, dispatch staging once
   with that exact SHA, authority URL, `0`, baseline UUIDs, and confirmation. Preserve
   migration, unique immutable UUID, 100% promotion, API/config/contract/web smoke,
   binding/domain/resource, bounded soak, Free usage, privacy-log, and no-production
   evidence.
10. Under `VOC-094-ACT-05`, revoke/expire the distinct Phase 4 token, preserve
    successful staging resources, and clean failed partial resources only when the
    exact record permits them. Confirm ACT-00 read-only credential, Phase 1 write-token/
    overlay, and Phase 2 Ruflo cleanup evidence, then attach final GitHub/Cloudflare/
    DNS/ref/worktree/no-production readbacks plus the exact Phase 1 local/hosted check
    binders. If a pre-write check fails or drifts, revoke the credential without a live
    mutation and preserve the failure. Close issue #158 only after AC-00 through AC-06
    pass.

## File reconciliation contract

The affected-area list in `change.yaml` is mandatory, not illustrative. Before final
review, search all living docs and executable guards for claims that staging is held,
no environment exists, routes are `.invalid`, or all VOC-080 holds remain current.
Update current-state surfaces atomically, while leaving adopted/completed packages,
transition records, and other historical evidence unchanged. If another living surface
describes the changed behavior, add it to the PR and package inventory before review.

## Validation and review

Run the commands in `test-plan.md`. Attach focused negative fixtures, schema/help
readbacks, complete diffs, production sentinel hashes, and disposable rollback proof.
Reviewers inspect completed evidence and do not receive secrets or repeat long-running
suites without a specific finding. Every external action record names actor, exact
revision/resources, commands/payload, evidence, rollback/cleanup, and expiry.
