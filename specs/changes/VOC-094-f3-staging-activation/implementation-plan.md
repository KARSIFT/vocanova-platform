# VOC-094 — Implementation Plan

## VOC-096 operative transition

### VOC-097 validator closure

Adopted VOC-097 corrects only the repository validator/scope gap: PR1 has a 29-path
core plus nine VOC-096 reconciliation paths, 38 authorized paths total. The legacy
held snapshot remains valid; prepared staging passes only through the complete
VOC-096 delivery validator. Production, HOLD-01/HOLD-02, ACT-03/04/05, and every
external-action boundary remain unchanged.

Steps 2–4 below are preserved execution history, but Phase 1 is now complete at exact
activation revision `0d5ccc1231edb0e652d5c883cb214b85bcc9635e` and Phase 2 is
independently closed. The operative remaining sequence is exact 27-file PR1 with the
reviewed tuple and `prepared`/dispatch-ineligible runtime binder; independent exact-SHA
reviews and non-author merge; ACT-03; exact five-file documentation-only PR2 and its
independent merged-SHA verification; then ACT-04 using five closed canonical records,
four supplied raw-body digests plus the ACT-03-bound settings record, live PR/push/check
evidence, a one-use nonce, maximum 30-minute validity, and two credential-free live
evaluations. Static equality to future timestamps or a future PR2 SHA is retired.

## Preconditions and delivery shape

The package is adopted and AM-01 reviewed bookkeeping now records both
`implementation.authorized: true` and `implementation.authority_effective: true`.
This permits repository implementation only; every external action remains separately
held. Use one task and two isolated short-lived
implementation branches/worktrees from then-current `origin/develop`: main PR1 and the
immediate post-ACT-03 documentation-only PR2. Record all worktrees/recovery refs before
work and preserve them while any plan or implementation PR remains open.

The two-PR exception is required by a hard external-settings/truth boundary. PR1 cannot
truthfully claim an ACT-03 post-state that does not yet exist, while ACT-03 cannot
precede PR1. Partial states are explicit: PR1 makes repository delivery ready but
ineligible; ACT-03 creates only the environment/two secrets while dispatch remains
held; PR2 reconciles living documentation and supplies the dispatch SHA. Repository
rollback never silently undoes external settings; an ACT-03 rollback requires truthful
PR2/corrective documentation. The cost is an extra branch/PR, hosted/local checks,
exact reviews, merge/source-head evidence, elapsed time, coordination, context, and
bookkeeping, justified by this non-combinable truth boundary.

## Ordered implementation and action sequence

1. **Prepare without external action.** Freeze the adopted package, a clean exact
   repository SHA, production sentinels, worktrees/recovery refs, affected-surface
   inventory, and current living-document claims. Obtain the exact Phase 1 action
   authority and exact-SHA Cloudflare/security/independent reviews required for the
   external overlay/resource manifest. Bind the clean SHA to successful applicable
   hosted CI, Governance, Quality, and Security and local validation/credential-free
   dry runs. Reverify official Cloudflare docs, locked Wrangler `4.125.0`, config
   schema, and exact command help. Failed, unchecked, stale, or drifted evidence stops
   before credential use or writes. No tracked sentinel, GitHub environment, or secret
   changes occur.
2. **Phase 1 / ACT-00 — completed inventory closure and residual-scope decision.** The completed
   no-write readback binds account `0a9eda28b96d77c24dcde74f3e074d47`, Active Free
   Website zone `vocanova.site` (`63286d93b5f32925ac7366b4e97908be`), three existing
   Workers, inventory-time absence of D1/Custom Domains/routes/selected DNS records,
   and no staging collision;
   its credential is revoked. It also found an unrelated existing USD 5/month Basic
   Load Balancing subscription. The separate attributable residual-scope record named
   and protected the three Workers, allowed only the exact D1 action, confirmed Workers
   Free/D1 Free and zero incremental cost, and did not modify or attribute the unrelated
   subscription. That authority is historical and cannot authorize ACT-02.
3. **Phase 1 / ACT-01 — completed D1 creation with incident preserved.** ACT-01 used its
   separate time-bounded record to create only D1 `vocanova-staging` UUID
   `22ae386f-e3f5-4d98-a3ad-18b39d3b8556` with requested `eeur` hint and no
   jurisdiction. It read back in EEUR with zero tables, no user data, no migrations,
   and zero incremental cost. Issue #161 records that this occurred before the stale
   AM-01 canonical state was discovered. The D1 remains preserved and unusable under
   this bookkeeping correction.
4. **Phase 1 / ACT-02 — bootstrap outside tracked config.** Create an untracked
   disposable external route-free Wrangler overlay containing only reviewed non-secret
   real D1/Worker bindings, synthetic-only vars, `workers_dev: false`, preview URLs
   false, and web `API` service binding. Secure auth stays outside it. Hash and review
   the sanitized overlay and resource manifest, and pass their credential-free local/
   schema/dry-run checks before any live command. Obtain a fresh exact corrected-SHA,
   overlay/resource, Free/$0, protected-Worker, and time-bounded ACT-02 authority record;
   the existing token's presence is never sufficient. Apply ordered migrations, then use
   locked Wrangler 4.125.0 `wrangler deploy` as the narrow first-creation exception to create/deploy route-free
   API, resolve/tag/read back its baseline UUID, and only then create/deploy route-free
   web bound to the existing API and resolve its UUID. Locked `versions upload` must
   fail closed for a nonexistent script and is not used for either first creation.
   Next hash/review a separate route-bearing overlay and use locked Wrangler command
   `wrangler triggers deploy` to attach exactly the two Custom Domains; read back ownership, certificates,
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
6. **Phase 3 — main repository implementation PR1.** A different builder starts one
   isolated short-lived implementation branch/worktree from then-current
   `origin/develop`. Bind the real Phase 1 account/zone/D1/version/domain/action
   readbacks into the manifest, both Wrangler configs, `ci.yml`, delivery policy/tests,
   and every declared living document. Add `custom_domain: true`, baseline equality,
   separate action/expiry fields, synthetic/privacy/zero-cost guards, and production
   negatives. Historical evidence stays immutable and production sentinels stay
   unchanged. Every living settings surface truthfully records `cloudflare-staging` as
   absent, held, and planned through PR1 merge; PR1 claims no ACT-03 post-state. Keep
   the incremental-only zero-cost gate and unrelated-subscription exclusion explicit in
   the manifest, policy, tests, and living documentation.
7. Run all credential-free validation/negative fixtures on the final PR1 head.
   Obtain fresh different-actor exact-SHA Cloudflare and security/settings specialist
   PASS plus independent R4 PASS; any material fix requires fresh applicable checks and
   reviews. Let a non-author actor merge normally into `develop`. Record the exact
   PR1 head, merge SHA, hosted/post-merge checks, source-head readback and
   recreation command, and no manual deletion.
8. **Phase 4 / ACT-03 — environment and distinct token after merge.** Only now create
   or reconcile `cloudflare-staging` under an exact scoped `VOC-085-HOLD-00` action
   record, issue the third distinct short-lived Phase 4 token once, and securely set
   exactly `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. Record the authorized
   settings operator/authority, pre-state, exact payload, rollback, secret names only,
   token scope/expiry, post-state, and no production drift. Dispatch remains held and
   ACT-03 is not complete until PR2 merges. `VOC-085-HOLD-00` remains held for all
   other settings. Never reuse or reissue either earlier credential.
9. **Phase 4 — immediate documentation-only PR2.** From current `develop`, create a
   second isolated short-lived implementation branch under the same adopted package and
   `VOC-094-T00`. Record the exact sanitized ACT-03 pre-state, payload, rollback,
   post-state readback, and exactly the two secret names without values. Change no
   product/workflow behavior and make no further setting mutation. Run all applicable
   local/hosted checks, obtain different-actor exact-revision review, and let a
   different non-author merge normally. Record the exact PR2 head, merge SHA,
   post-merge checks, source-head readback, and recreation command. ACT-03 completes
   only after that post-merge readback. If ACT-03/ACT-04 authority or the Phase 4 token
   expires while PR2 is open, stop; any replacement requires a fresh exact authority/
   settings record, never a silent token reissue.
10. Independently verify the exact PR2 merged `develop` SHA, hosted checks, real manifest
    binders, environment/secret-name readback, current resources/baseline, action
    authority, and zero-cent estimate. Under `VOC-094-ACT-04`, dispatch staging once
    with that exact SHA, authority URL, `0`, baseline UUIDs, and confirmation. Preserve
    migration, unique immutable UUID, 100% promotion, API/config/contract/web smoke,
    binding/domain/resource, bounded soak, Free usage, privacy-log, and no-production
    evidence.
11. Under `VOC-094-ACT-05`, revoke/expire the distinct Phase 4 token, preserve
    successful staging resources, and clean failed partial resources only when the
    exact record permits them. Confirm ACT-00 read-only credential, Phase 1 write-token/
    overlay, and Phase 2 Ruflo cleanup evidence, then attach final GitHub/Cloudflare/
    DNS/ref/worktree/no-production readbacks plus the exact Phase 1 local/hosted check
    binders. If a pre-write check fails or drifts, revoke the credential without a live
    mutation and preserve the failure. Close issue #158 only after AC-00 through AC-06
    pass.

## File reconciliation contract

The affected-area list in `change.yaml` is mandatory, not illustrative. Before each PR's
final review, search all living docs and executable guards for relevant state claims.
PR1 replaces resource sentinels but must retain the truthful environment absent/held/
planned state. PR2 changes only the settings documentation required to match ACT-03's
sanitized readback. Leave adopted/completed packages, transition records, and other
historical evidence unchanged. If another living surface describes the changed state,
add it to the applicable PR and package inventory before review.

## Validation and review

Run the commands in `test-plan.md`. Attach focused negative fixtures, schema/help
readbacks, complete diffs, production sentinel hashes, and disposable rollback proof.
Reviewers inspect completed evidence and do not receive secrets or repeat long-running
suites without a specific finding. Every external action record names actor, exact
revision/resources, commands/payload, evidence, rollback/cleanup, and expiry.
