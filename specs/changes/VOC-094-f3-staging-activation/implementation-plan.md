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
   external overlay/resource manifest. Reverify official Cloudflare docs, locked
   Wrangler `4.125.0`, config schema, and exact command help. No tracked sentinel,
   GitHub environment, or secret changes occur.
2. **Phase 1 / ACT-00 — authenticate locally and inventory first.** Issue one secure
   local/interactive short-lived Cloudflare credential with the reviewed selected-
   account/zone permissions and expiry. Keep its value out of files, arguments,
   output, and evidence. Its first use is read-only: bind account ID, Active
   `vocanova.site` zone ID/name, Workers Free/billing posture, every Worker/D1/Custom
   Domain, hostname collision state, and permission groups. Stop before writes if
   production Workers/D1 exist without explicit residual account-wide acceptance.
3. **Phase 1 / ACT-01 — provision D1.** From the same clean exact reviewed repository
   SHA and still-unmodified tracked tree, create D1 exactly once requesting
   `--location eeur` and no jurisdiction. Record the real UUID, requested hint, actual
   placement/served-region readback, schema-independent pre-state, Free-plan state, and
   exact two-Worker/two-domain resource authorization. Stop on collision, duplicate,
   Paid prompt, unplanned permission, or production drift.
4. **Phase 1 / ACT-02 — bootstrap outside tracked config.** Create an untracked
   disposable external Wrangler config/overlay containing only reviewed non-secret
   real D1/Worker/domain bindings, synthetic-only vars, and web `API` service binding.
   Secure auth stays local and outside the overlay. Hash and independently review the
   sanitized overlay. Using the exact application and migrations from the clean SHA,
   apply ordered migrations, upload/deploy/smoke API first, then upload/deploy/smoke
   web, attach/read back only the two Custom Domains, and record real baseline UUIDs.
   To claim a live rollback rehearsal, next upload and promote a newer reviewed
   probe/candidate or equivalent valid traffic transition, verify it, roll both
   Workers back to their baseline UUIDs, and prove 100% traffic/health plus unchanged
   D1 state. Capture evidence, then delete only the overlay and revoke/expire the
   single Phase 1 credential. Do not issue it again.
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
   or reconcile `cloudflare-staging`, issue a new distinct short-lived Phase 4 token
   once, and securely set exactly `CLOUDFLARE_ACCOUNT_ID` and
   `CLOUDFLARE_API_TOKEN`. Record environment/settings pre-state, payload, rollback,
   secret names only, token scope/expiry, post-state, and no production drift. Never
   reuse or reissue the Phase 1 credential.
9. Independently verify the exact merged `develop` SHA, hosted checks, real manifest
   binders, environment/secret-name readback, current resources/baseline, action
   authority, and zero-cent estimate. Under `VOC-094-ACT-04`, dispatch staging once
   with that exact SHA, authority URL, `0`, baseline UUIDs, and confirmation. Preserve
   migration, unique immutable UUID, 100% promotion, API/config/contract/web smoke,
   binding/domain/resource, bounded soak, Free usage, privacy-log, and no-production
   evidence.
10. Under `VOC-094-ACT-05`, revoke/expire the distinct Phase 4 token, preserve
    successful staging resources, and clean failed partial resources only when the
    exact record permits them. Confirm Phase 1 overlay/credential and Phase 2 Ruflo
    cleanup evidence, then attach final GitHub/Cloudflare/DNS/ref/worktree/no-production
    readbacks. Close issue #158 only after AC-00 through AC-06 pass.

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
