# VOC-094 — F3 staging activation

Status: adopted planning package. Exact candidate
`873f8957fb2f6d182662e4312f5c05e2d559ac88` received Cloudflare,
security/settings, and independent R4 PASS verdicts and an accountable ADOPT decision.
GitHub issue [#158](https://github.com/KARSIFT/vocanova-platform/issues/158) remains
planning intake, not external-action authority. Repository implementation is
authorized but not yet effective: this adoption-bookkeeping revision still requires
fresh exact review, hosted checks, genuine pre-merge `eligible: true` with `reasons: []`,
normal non-author PR #159 merge, and applicable post-merge checks. No live identifier,
credential, deployment result, environment, secret, or activation is claimed here;
`ACT-00` through `ACT-05` remain separately held, and `VOC-080-HOLD-01` and
`VOC-080-HOLD-02` remain unchanged.

The proposed coherent outcome is one package, one minimum-sufficient task, and two
future implementation pull requests into `develop`. It would activate only the named
synthetic Cloudflare staging boundary:

- web Custom Domain `stag.vocanova.site` on `vocanova-web-staging`;
- API Custom Domain `api-stag.vocanova.site` on `vocanova-api-staging`;
- web service binding `API` to `vocanova-api-staging`;
- D1 database `vocanova-staging`, created with location hint `eeur` and no
  jurisdiction restriction; and
- GitHub environment `cloudflare-staging`, with only
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as secret names.

`vocanova.site` must read back Active in the selected account and zone. Exact
non-secret account ID, zone ID, D1 UUID, Custom Domain identifiers, and immutable API
and web version UUIDs are runtime evidence values: they must be read from Cloudflare,
bound to attributable action records, and inserted where the adopted implementation
contract requires them. No placeholder may pass an activation gate.

The Workers Free plan and an all-in paid-spend ceiling of exactly USD 0 are hard
constraints. Any Paid activation, add-on, overage, billing change, or feature that
cannot remain within Free limits stops the outcome. Staging is synthetic-only:
signup, OAuth, magic-link/email delivery, AI generation/provider calls, production
learner data, and learner-content logging remain disabled.

Cloudflare's Workers Scripts and D1 token permissions are scoped to a selected
account, not to the two Worker names or one D1 database. Activation therefore fails
closed until a read-only inventory proves the selected account has no production
Workers or D1 databases, or the operator records an explicit, time-bounded acceptance
of that residual account-wide permission boundary.

The external sequence is fixed:

1. **Phase 1:** after plan adoption, exact action authority, and review of a clean exact
   repository SHA with successful applicable hosted and local validation/dry-run
   evidence, use a distinct local/interactive read-only credential/session with
   no write permission for inventory and the residual-scope decision, then revoke it.
   Only after that gate passes, issue a separate short-lived Phase 1 write token for
   D1, API-first/web-second baseline, service binding, Custom Domains, readbacks, and a
   valid Worker-only rollback rehearsal. Separately hashed/reviewed route-free and
   route-bearing disposable Wrangler overlays carry only reviewed non-secret real
   bindings/vars and pass credential-free local/schema/dry-run checks and exact review;
   secure auth is outside them. Preserve repository sentinels until
   readbacks exist, capture evidence, remove the overlays, and revoke/expire the Phase
   1 write token.
2. **Phase 2:** reverify and use Ruflo 3.38.16 only in a disposable external sanitized
   workspace, then remove its state.
3. **Phase 3:** a different builder binds the real Phase 1 IDs/routes/evidence into the
   repository manifest, Wrangler config, policy, tests, and living docs in main
   implementation PR1. Through PR1 merge, those docs truthfully record
   `cloudflare-staging` as absent, held, and planned. Obtain exact-SHA reviews and a
   non-author merge into `develop`.
4. **Phase 4:** only after PR1 merges, ACT-03 creates/reconciles
   `cloudflare-staging` and securely adds its two secrets using a third distinct
   short-lived GitHub-environment token. Immediately open documentation-only PR2 from
   current `develop` under this same package/task to record the exact sanitized
   settings pre-state, payload, rollback, post-state readback, and secret names only.
   After fresh checks, different-actor exact review, non-author merge, source-head
   readback, and independent verification of PR2's merged `develop` SHA, dispatch that
   exact SHA once, soak, and clean up.

Two PRs are necessary because PR1 may not preclaim an external settings post-state and
ACT-03 may not precede PR1. The boundary creates an extra branch/PR, local and hosted
checks, exact reviews, merge/source-head evidence, elapsed time, coordination, context,
and bookkeeping. It keeps partial states and rollback explicit: after PR1 delivery is
repository-ready but ineligible; after ACT-03 settings exist but dispatch remains held;
only PR2 reconciles living truth and supplies the dispatch SHA. A repository revert
never silently reverses settings.

No credential value is printed or placed in an overlay, repository, evidence, Ruflo
memory, or command argument. The ACT-00 read-only credential/session, Phase 1 write
token, and Phase 4 environment token are three different credentials with separately
recorded permissions and expiry; none is issued twice or reused across boundaries.

The first ordinary delivery requires the Phase 1 reviewed bootstrap. Locked Wrangler
4.125.0 rejects `versions upload` for a nonexistent Worker, so the exact first-creation
exception uses route-free `wrangler deploy` to create/deploy API first and resolve its
baseline UUID, then create/deploy web with its service binding to the existing API and
resolve its UUID. Only after both scripts exist does locked `wrangler triggers deploy`
apply the separately reviewed route-bearing overlay and attach the two Custom Domains;
no public route exists earlier. A live rollback rehearsal is valid only after
`versions upload`/exact `versions deploy` promotes a newer reviewed probe/candidate or
equivalent version and traffic is then rolled back to the baseline UUIDs. Ordinary
delivery remains versions upload plus exact deploy. Worker rollback changes traffic
only; it never reverses D1.

This package may complete only `VOC-080-HOLD-00` for its exact staging resources,
actions, revision, and expiry window. `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain
held and unchanged. `prod.vocanova.site` and `api-prod.vocanova.site` are reserved
names only; every production Worker, D1, route/domain, environment, secret, traffic,
migration, datum, and setting is untouched.

The Phase 4 GitHub environment/two-secret mutation is separately held by
`VOC-085-HOLD-00` until its exact operator, authority, pre-state, payload, rollback,
post-state, expiry, and immediate PR2 documentation reconciliation record is complete.
ACT-03 discharges only after PR2 is reviewed, merged, and read back; every other
repository or environment settings action remains held by `VOC-085-HOLD-00`. If the
ACT-03/ACT-04 authority or Phase 4 token expires while PR2 is open, stop. Any
replacement requires a fresh exact authority/settings record; never silently reissue
the token.

Ruflo 3.38.16 may be reverified and used only from a disposable external workspace
with sanitized context. It receives no GitHub write/approve/merge/close/dispatch,
Cloudflare, DNS, secret, spend, deployment, production-data, or launch authority, and
its disposable state is removed after evidence handoff.

The live repository setting `delete_branch_on_merge: true` may automatically delete
only merged short-lived plan, PR1, and PR2 source heads. Before each merge,
record the exact branch and tip SHA; after merge, read the branch back and record the
exact recreation command. Do not manually delete a branch, permanent ref, worktree,
or recovery ref. Preserve every existing worktree and recovery ref while any PR is
open, including `/tmp/vocanova-voc090-t00` and
`backup/pre-voc091-refresh-8ce72e9`.

`automatic_merge_allowed: true` was explicitly examined. It is read-only package
policy metadata, never an automatic merge, implementation authority, or substitute
for exact-SHA review and the separate action records.
