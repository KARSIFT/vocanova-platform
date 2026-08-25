# VOC-094 — Release and Rollback Plan

## Repository merge and external action authority

Plan adoption authorizes no implementation or external action by itself. The future
implementation PR targets `develop` only and is merged normally by a non-author after
exact-SHA checks/reviews and repository eligibility pass. Merging does not deploy.

Separate attributable `VOC-094-ACT-00` through `ACT-05` records govern account/token
selection/inventory, Cloudflare resources, external baseline/rollback evidence,
post-merge GitHub environment/secrets, ordinary dispatch, and cleanup. Each record
binds actor, exact SHA, account/zone/resources, payload/commands, evidence, rollback,
expiry, and drift conditions. A review verdict, Ruflo receipt, issue, package metadata,
or successful merge cannot substitute for one.

## Phase-specific preconditions

Phase 1 may begin only after package adoption, effective Phase 1 action authority, a
clean exact reviewed repository SHA, current Cloudflare/Wrangler/price/permission
verification, strict zero-cent evidence, preserved production/worktree/ref inventory,
and one securely held local/interactive credential with exact scope and expiry. The
first credential operation is read-only ACT-00 inventory. Provisioning is blocked
until account-wide residual scope is cleared or explicitly accepted. Phase 1 does not
require a GitHub environment, repository real-ID binding, implementation merge, or
post-merge review.

ACT-01/ACT-02 then require exact account/Active zone/Free/collision evidence and a
hashed sanitized disposable external overlay tied to the clean SHA. They establish the
real D1/resource/version/domain baseline, service binding, smoke, and valid Worker-only
rollback evidence without changing tracked sentinels. Phase 1 ends by retaining
sanitized evidence, deleting the overlay, and revoking/expiring its credential.

Phase 2 requires completed Phase 1 cleanup/evidence and the exact external Ruflo
pin/hash/audit/permission contract. It receives no Cloudflare or GitHub credential.

Phase 3 requires the real Phase 1 binders and sanitized Phase 2 receipt. A different
builder produces one implementation PR, all credential-free checks and exact-SHA
reviews pass, and a non-author merges. No GitHub environment or secret is a Phase 3
precondition or side effect.

Phase 4 requires the exact merged `develop` SHA and post-merge checks. ACT-03 creates
only `cloudflare-staging`, issues a new distinct short-lived token, and adds exactly
the two named secrets. Independent review of the merged SHA plus current baseline,
resource, authority, environment, zero-cost, privacy, and no-production readbacks is
required before ACT-04 dispatch.

## Rollout and monitoring

The Phase 1 external bootstrap applies compatible migrations and establishes API
first, then web and the two Custom Domains from the clean reviewed SHA and disposable
overlay. Ordinary Phase 4 delivery runs once through manual
`workflow_dispatch` on the exact reviewed `develop` SHA with cost `0` and real rollback
UUIDs. Observe bounded health/config/contract/web smoke and soak; exact version and
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
- Free-limit/cost risk: stop requests/dispatch and do not upgrade. A paid plan requires
  a new explicit spend decision and package/action authority.
- Repository regression: normal reviewed revert PR to `develop`; never reset or force
  push permanent branches. External staging/settings removal requires a new exact
  action record because a Git revert does not undo live resources.

On successful completion, staging resources remain for F3 testing. The Phase 1 local
credential/overlay, Phase 2 Ruflo state, and distinct Phase 4 token are each removed,
revoked, or expired in their own evidence window; no credential is reissued or reused.
Any later teardown is a separately authorized exact-ID action.

## Source-branch lifecycle and closure

With `delete_branch_on_merge: true`, GitHub may automatically delete only the merged
short-lived plan or implementation source head. Capture exact branch/tip before each
merge, post-merge readback, and an exact recreation command such as
`git branch <branch> <sha>` plus the reviewed remote restoration procedure if needed.
Never manually delete `develop`, `main`, another permanent/recovery branch, or a
worktree. Preserve all existing worktrees/recovery refs while either PR is open.

Issue #158 closes only after AC-00 through AC-06 pass, the exact implementation merge
and source lifecycle are recorded, one staging dispatch/soak succeeds, Phase 1
credential/overlay, Phase 2 Ruflo, and Phase 4 token cleanup completes, and final
Cloudflare/GitHub/DNS/Free/privacy/no-production readbacks are attached. `HOLD-01` and
`HOLD-02` remain held at closure.
