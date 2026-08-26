# VOC-094 — Release and Rollback Plan

## Repository merge and external action authority

Plan adoption authorizes no implementation or external action by itself. Main PR1 and
immediate post-ACT-03 documentation-only PR2 both target `develop` and are merged
normally by non-authors after exact-SHA checks/reviews and repository eligibility pass.
Neither merge deploys.

AM-01 repository bookkeeping is complete: final revision
`aad884a6d53c5e0f13b94f8042774b14a07015af` passed exact review and literal hosted
eligibility, PR #160 merged normally as
`75e5c9909fe105a9af3e6e8a3600fec27fcbd593`, and applicable post-merge checks passed.
This makes repository implementation authority effective but grants no external action.
Issue #161 preserves the pre-correction ACT-01 creation of only empty D1
`vocanova-staging` UUID `22ae386f-e3f5-4d98-a3ad-18b39d3b8556`; ACT-02 remains held.

Separate attributable `VOC-094-ACT-00` through `ACT-05` records govern account/token
selection/inventory, Cloudflare resources, external baseline/rollback evidence,
post-merge GitHub environment/secrets, ordinary dispatch, and cleanup. Each record
binds actor, exact SHA, account/zone/resources, payload/commands, evidence, rollback,
expiry, and drift conditions. A review verdict, Ruflo receipt, issue, package metadata,
or successful merge cannot substitute for one.

## Phase-specific preconditions

Further Phase 1 work may begin only after fresh effective ACT-02 action authority, a
clean exact reviewed corrected repository SHA, current Cloudflare/Wrangler/price/permission
verification, successful applicable hosted CI/Governance/Quality/Security and local
validation/credential-free dry-run evidence bound to that SHA, strict zero-cent
evidence, preserved production/worktree/ref inventory, and a distinct securely held
local/interactive read-only credential/session with exact
scope/expiry and no write permission. ACT-00 inventory and the residual decision must
pass, and that credential was revoked/expired before the separate Phase 1 write token
was issued. The completed ACT-00/ACT-01 evidence does not authorize ACT-02. Phase 1
does not require a GitHub environment, repository real-ID binding, implementation
merge, or post-merge review.

ACT-02 requires the completed exact account/Active Free Website zone/collision
inventory, a fresh separately attributable unexpired residual-scope/action record,
Workers Free and D1 Free, and a USD 0 **incremental VocaNova staging** estimate. The
unrelated existing USD 5/month Basic Load Balancing subscription is preserved unchanged,
not expanded, and not attributed to VocaNova. A hashed/reviewed route-free overlay tied to the clean SHA
and resource manifest must pass credential-free local/schema/dry-run checks and exact
review before writes. It uses locked `wrangler deploy` as the narrow first-creation
exception for API then web,
because `versions upload` rejects nonexistent scripts. After both baseline UUIDs exist,
a separately hashed/reviewed route-bearing overlay uses locked Wrangler command
`wrangler triggers deploy` for the two domains; no public route exists earlier. Only after scripts exist
may `versions upload`/exact deploy create a newer rollback probe. Phase 1 ends by
retaining sanitized evidence, deleting both overlays, and revoking/expiring the write
token. The token's existence or remaining TTL never substitutes for the fresh action
record.

Any SHA, manifest, overlay-hash, dependency/lock/workflow, or hosted/local check-result
drift expires Phase 1 authority. Unchecked, failed, or stale evidence requires token
revocation with no live D1/Worker/domain write and a preserved failure record.

Phase 2 requires completed Phase 1 cleanup/evidence and the exact external Ruflo
pin/hash/audit/permission contract. It receives no Cloudflare or GitHub credential.

Phase 3 requires the real Phase 1 binders and sanitized Phase 2 receipt. A different
builder produces main PR1, all credential-free checks and exact-SHA reviews pass, and a
non-author merges. No GitHub environment or secret is a Phase 3 precondition or side
effect. Through PR1 merge, every living settings record says `cloudflare-staging` is
absent, held, and planned; PR1 must not preclaim external post-state.

Phase 4 initially requires the exact PR1 merged `develop` SHA and post-merge checks. ACT-03 creates
only `cloudflare-staging` under exact scoped `VOC-085-HOLD-00` authority, issues the
third distinct short-lived token, and adds exactly the two named secrets. Its record
must name operator/authority, pre-state, payload, rollback, post-state, and expiry.
Dispatch remains held. Immediately after ACT-03, PR2 starts from current `develop`
under this same adopted package/task and records the exact sanitized settings pre-state,
payload, rollback, post-state readback, and secret names only. PR2 changes documentation
only, passes exact local/hosted checks and different-actor review, and is non-author
merged with post-merge/source-head readback. ACT-03 completes only then, discharges only
that action, and leaves every other setting held. Independent review of the exact PR2
merged `develop` SHA plus current baseline, resource, authority, environment, zero-cost,
privacy, and no-production readbacks is required before ACT-04 dispatch.

If ACT-03/ACT-04 authority or the Phase 4 token expires while PR2 is open, stop. A
replacement token or resumed settings/dispatch action requires a fresh exact authority/
settings record; no silent reissue is allowed.

## Rollout and monitoring

The Phase 1 external bootstrap applies compatible migrations, route-free first-
creation deploys API then web, and only afterward attaches the two Custom Domains from
the clean reviewed SHA and separately reviewed disposable overlays. Ordinary Phase 4
delivery runs once through manual `workflow_dispatch` on the exact independently
reviewed PR2 merged `develop` SHA with cost `0` and real rollback UUIDs. Observe bounded
health/config/contract/web smoke and soak; exact version and
domain/resource readbacks; Worker requests, CPU-limit errors, exception rate; D1 rows
read/written, storage, query errors; and privacy-safe structured logs. Stop on any
Paid prompt, limit pressure, unexpected resource, permission, collision, config drift,
secret exposure, learner data, external feature call, or production effect.

The staging Custom Domains are operational test endpoints, not a public launch or
production promise. `prod.vocanova.site` and `api-prod.vocanova.site` remain reserved
and unconfigured by this package.

## Failure and rollback

- Before promotion: preserve evidence; traffic remains on the baseline. Clean only
  exact partial resources pre-authorized by `ACT-05`.
- After one or both Phase 4 promotions: roll both Workers to the recorded baseline
  UUIDs, read back 100% traffic/domains, and repeat smoke. Do not roll back D1.
- A Phase 1 live rollback rehearsal is claimed only if a newer reviewed probe/candidate
  or equivalent valid traffic transition was promoted after baseline establishment and
  then rolled back to the baseline UUIDs. Baseline deployment alone is not rehearsal
  evidence. In every case compare D1 state and prove Worker rollback did not change it.
- Migration failure or incompatibility: stop promotion; use a separately reviewed
  forward correction. Time Travel restore/deletion is not authorized here.
- Secret exposure: stop, revoke token, remove/replace the environment secret securely,
  preserve sanitized evidence, and follow incident governance.
- Free-limit/cost risk: stop requests/dispatch and do not upgrade. Any Paid Workers or
  D1 capability, add-on, upgrade, overage, billing change, paid provider, or action that
  could modify/expand the unrelated Basic Load Balancing subscription requires a new
  explicit spend decision and package/action authority.
- Repository regression: normal reviewed revert PR to `develop`; never reset or force
  push permanent branches. External staging/settings removal requires a new exact
  action record because a Git revert does not undo live resources.

On successful completion, staging resources remain for F3 testing. The ACT-00
read-only credential, Phase 1 write token/overlays, Phase 2 Ruflo state, and third
distinct Phase 4 token are each removed, revoked, or expired in their own evidence
window; no credential is reissued or reused.
Any later teardown is a separately authorized exact-ID action.

## Source-branch lifecycle and closure

With `delete_branch_on_merge: true`, GitHub may automatically delete only the merged
short-lived plan, PR1, or PR2 source head. Capture exact branch/tip before each
merge, post-merge readback, and an exact recreation command such as
`git branch <branch> <sha>` plus the reviewed remote restoration procedure if needed.
Never manually delete `develop`, `main`, another permanent/recovery branch, or a
worktree. Preserve all existing worktrees/recovery refs while any PR is open.

Issue #158 closes only after AC-00 through AC-06 pass, both exact implementation merges
and source lifecycles are recorded, PR2's merged `develop` SHA is independently
reviewed, one staging dispatch/soak succeeds, ACT-00
read-only credential, Phase 1 write-token/overlays, Phase 2 Ruflo, and Phase 4 token cleanup completes, and final
Cloudflare/GitHub/DNS/Free/privacy/no-production readbacks are attached. `HOLD-01` and
`HOLD-02` remain held at closure.
