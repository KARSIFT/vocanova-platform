# VOC-094 — F3 staging activation: Specification

## Objective and authority boundary

Deliver the F3 synthetic staging outcome described by issue #158: provision and
verify the exact Cloudflare staging resources, reconcile the repository and GitHub
staging environment, create a real reviewed rollback baseline, and run the existing
manual staging delivery state machine on an exact reviewed `develop` revision.

The adopted original package and effective AM-01 bookkeeping authorize repository
implementation only. External actions begin only under their separate exact action
records. Completing this package may release `VOC-080-HOLD-00` only for the named
staging outcome. `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.

AM-01 final bookkeeping revision
`aad884a6d53c5e0f13b94f8042774b14a07015af` received fresh exact independent and
specialist PASS reviews, Governance run `32913984893` reported `eligible: true` with
`reasons: []`, PR #160 merged normally as
`75e5c9909fe105a9af3e6e8a3600fec27fcbd593`, and post-merge CI, Security, and
Governance passed. Those facts remove the AM-01 repository-authority blocker but do
not satisfy any external-action hold.

## Preserved sequencing incident

Before the stale canonical AM-01 state was detected, ACT-01 created only D1
`vocanova-staging` UUID `22ae386f-e3f5-4d98-a3ad-18b39d3b8556`. It read back with
zero tables, no user data, no migrations, no jurisdiction, and zero incremental cost.
Issue #161 records the incident. ACT-02 stopped before Worker creation, D1 migration,
Custom Domain, DNS, traffic, deployment, rollback, production, billing, or launch
action. The D1 must remain preserved and unused until fresh corrected-SHA resource/
overlay review, current Free/$0 evidence, and exact time-bounded ACT-02 authority pass.

## Decisions and requirements

- `VOC-094-D00` — Use one package, one minimum-sufficient task, and two implementation
  PRs into `develop`. Main PR1 binds repository config, policy, tests, and the truthful
  pre-settings documentation state. The hard external-settings/truth boundary then
  requires ACT-03 before immediate documentation-only PR2 can record its observed
  sanitized post-state. This split explicitly contains partial state, integration, and
  rollback: PR1 is repository-ready but ineligible, ACT-03 creates only the environment/
  secrets while dispatch stays held, and PR2 reconciles living truth and supplies the
  dispatch SHA. A repository rollback never silently undoes settings. The justified
  overhead is an extra branch/PR, hosted/local checks, exact reviews, merge/source-head
  evidence, elapsed time, coordination, context, and bookkeeping; PR1 may not preclaim
  post-state and settings may not precede PR1. Preserve the mandatory order: Phase 1
  Cloudflare inventory/resources/baseline/domains/rollback evidence; Phase 2 external
  Ruflo; Phase 3 PR1 review/non-author merge; Phase 4 ACT-03, PR2 review/non-author
  merge, exact PR2-merge-SHA verification, dispatch, soak, and cleanup.
- `VOC-094-D01` — Bind only `vocanova-api-staging`, `vocanova-web-staging`, D1
  `vocanova-staging`, API Custom Domain `api-stag.vocanova.site`, and web Custom
  Domain `stag.vocanova.site`. Wrangler uses route objects with
  `custom_domain: true`; `workers_dev` and preview URLs remain false. The web Worker
  retains service binding `API` to `vocanova-api-staging`.
- `VOC-094-D02` — ACT-00 readback binds selected account
  `0a9eda28b96d77c24dcde74f3e074d47` and Active Free Website zone `vocanova.site`
  (`63286d93b5f32925ac7366b4e97908be`). These are non-secret evidence values and bind
  every later action record, manifest, token resource selector, and post-action
  readback; any account or zone drift stops the outcome.
- `VOC-094-D03` — ACT-01 requested D1 `vocanova-staging` with location hint `eeur`
  and no jurisdiction and created UUID `22ae386f-e3f5-4d98-a3ad-18b39d3b8556` without
  applying migrations. Preserve its readback; under fresh ACT-02 authority, record the
  requested hint, real UUID, and Cloudflare's actual
  placement/served-region readback plus name, migration table, applied migration
  order, schema integrity, and synthetic-only contents. The hint asks Cloudflare for
  the nearest viable placement and may not equal the actual placement; a different
  documented actual region is not failure. Neither hint nor readback is a legal
  residency promise.
- `VOC-094-D04` — Workers Free, D1 Free, and `cost_ceiling_cents: 0` are absolute for
  **every incremental VocaNova staging resource and action**, rather than a claim that
  the selected account's existing subscriptions total zero. ACT-00 found a pre-existing
  unrelated Basic Load Balancing subscription at USD 5/month; preserve it unchanged,
  do not expand it, and never attribute it to VocaNova. Do not activate Paid Workers or
  D1, add-ons, upgrades, overage, Queues, Workers AI, R2, paid observability, a paid
  provider, or another billable capability. Stop if the exact build, usage envelope, or
  required feature cannot run on Free, if any payment prompt/estimate is nonzero, or if
  an action could modify that unrelated subscription; monitor Worker
  requests/CPU/errors and D1 rows read/written/storage against Free limits and stop
  before any paid-plan change.
- `VOC-094-D05` — Use three distinct credentials. ACT-00 uses a secure local/
  interactive short-lived read-only credential/session with no write permissions;
  revoke/expire it after inventory and the residual-scope decision. Only then may
  ACT-01 issue a separate short-lived Phase 1 write token, scoped only to the selected
  account and, if the adopted Custom Domain mechanism requires it, the selected
  `vocanova.site` zone. Its permission-group readback grants only Workers Scripts
  write/read, D1 write/read, and the minimum Custom Domain/Workers Routes permission
  actually required; revoke/expire it after ACT-02. After the Phase 3 PR1 merge, ACT-03
  issues a third distinct short-lived token once for the Phase 4 GitHub environment.
  Deny DNS write, billing, user/org, production, KV, R2, AI, Access, and unrelated
  products. No value is printed, committed, placed in the disposable overlay/evidence,
  reused, or reissued across boundaries.
- `VOC-094-D06` — Workers Scripts and D1 permissions are account-wide within the
  selected account; Cloudflare cannot restrict them to the two scripts and one D1
  database. ACT-00 has inventoried exactly three existing Workers
  (`patient-poetry-73ce`, `telegram-mcp`, and `vergecloud-zoho-sprints-mcp`), and at
  inventory time found no D1, Workers Custom Domains/routes, selected DNS records, or
  staging collision; its read-only credential is revoked. Before ACT-01's write token
  existed, a separately attributable, time-bounded acceptance named those resources,
  confirmed the inventory-time no-D1 result, prohibited commands targeting or mutating
  the existing Workers, and allowlisted only the D1 creation action. That historical
  acceptance does not authorize ACT-02; absence or expiry of a fresh exact action
  record is a blocker, not a warning.
- `VOC-094-D07` — Main PR1 must truthfully record `cloudflare-staging` as absent, held,
  and planned through its merge; it must not claim settings post-state. Only in Phase 4,
  after PR1 normally merges and the exact resulting `develop` SHA is known,
  create/reconcile GitHub environment exactly
  `cloudflare-staging`. At the action readback it has exactly two secret names,
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, no values in GitHub output,
  repository files, PR comments, logs, artifacts, or Ruflo memory, and no variables
  or production changes. Record settings pre-state, payload, rollback, post-state, and
  Phase 4 token expiry. Then immediately open documentation-only PR2 under the same
  adopted package/task from current `develop`; it records the exact sanitized pre-state,
  payload, rollback, post-state readback, and secret names only. PR2 requires applicable
  local/hosted checks, different-actor exact-revision review, non-author merge, and
  post-merge/source-head readback. Pull requests, builders, Ruflo, and
  credential-free jobs never receive the secrets. No GitHub environment or secret is
  created during Phase 1, Phase 2, or Phase 3. This exact settings mutation remains
  held by `VOC-085-HOLD-00` until an action record names its authorized operator,
  authority, pre-state, exact payload, rollback, immediate PR2 documentation
  reconciliation, post-state readback, expiry, and drift conditions. Completion occurs
  only after PR2 merge/post-merge readback and discharges only this exact
  `cloudflare-staging` environment/two-secret action;
  `VOC-085-HOLD-00` remains held for every other repository or environment setting.
  ACT-04 may use only the independently reviewed PR2 merged `develop` SHA. If ACT-03 or
  ACT-04 authority or the Phase 4 token expires while PR2 is open, stop; replacement
  requires a fresh exact authority/settings record and no silent token reissue.
- `VOC-094-D08` — Phase 1 provisions and bootstraps before any repository sentinel is
  weakened. Use a clean exact independently reviewed repository SHA and an untracked
  disposable external Wrangler config/overlay. The overlay contains only the reviewed
  non-secret real account/resource bindings, Custom Domain patterns, synthetic-only
  vars, and service binding; it contains no auth value or product-code change. Record a
  sanitized hash and review evidence. Secure local/interactive auth remains outside
  the overlay. The exact application and migration files at that SHA are the same
  content Phase 3 later binds into repository config. Delete the overlay only after
  resource/version/domain/migration/smoke/rollback evidence is captured and sanitized.

  Provision and bootstrap under separate `ACT-01` and `ACT-02` records.
  Extend the staging manifest with an `action_records` map that binds distinct
  inventory/token, GitHub-settings/secrets, resource-provisioning, baseline, dispatch,
  and cleanup evidence URLs plus each record's exact expiry/drift fields; one generic
  URL cannot stand in for all actions. Extend its baseline record with the exact
  reviewed baseline SHA, API version UUID, web version UUID, migration evidence, and
  smoke/readback evidence. The delivery policy must validate these fields and reject
  missing, duplicated, expired, mismatched, or placeholder binders.

  Apply ordered compatible D1 migrations, then use locked Wrangler `4.125.0` from the
  separately hashed/reviewed **route-free** disposable overlay to run the narrowly
  reviewed first-creation exception: `wrangler deploy` creates and deploys the API
  Worker first with `workers_dev: false` and preview URLs false. Resolve/tag/read back
  its real baseline UUID. Next, only after the API script exists, use route-free
  `wrangler deploy` to create/deploy the web Worker with service binding `API` to the
  existing API Worker, then resolve/tag/read back its baseline UUID. Neither Worker
  has a public route at this point. Initial `wrangler deploy` is permitted only for
  this exact first-creation bootstrap because locked `versions upload` rejects a
  nonexistent Worker; it is not the ordinary delivery mechanism.

  Only after both scripts and baseline UUIDs exist may a second, separately hashed and
  reviewed route-bearing disposable overlay add exactly
  `api-stag.vocanova.site` and `stag.vocanova.site` with `custom_domain: true`.
  Apply it using locked `wrangler triggers deploy`, then read back exact Worker/domain
  ownership, certificates, and DNS before smoke. No public route exists before this
  trigger step. Ordinary delivery remains immutable `versions upload` followed by
  exact `versions deploy`. Phase 3 alone replaces staging sentinels with the resulting
  D1/version/domain readbacks; Phase 1 must not edit tracked manifest/Wrangler/policy/
  docs files.

- `VOC-094-D09` — Ordinary delivery remains manual `workflow_dispatch` on exact
  `refs/heads/develop`. Inputs bind the independently reviewed 40-character SHA,
  matching action-authority URL and unexpired manifest, zero-cent estimate, real
  previous UUIDs that equal the manifest baseline fields, and exact confirmation.
  Execution remains migration → immutable
  SHA-tagged API/web upload → unique UUID resolution → exact 100% promotions →
  bounded `/healthz`, `/configz`, `/openapi.json`, service-binding-backed web smoke →
  readback and bounded soak. Preserve any failed run; rerun only from a separately
  reviewed corrective revision or fresh action record as applicable.
- `VOC-094-D10` — Worker rollback changes Worker traffic only and never rolls back D1.
  A claimed live Phase 1 rehearsal must first create and promote a newer exact reviewed
  probe/candidate version with `versions upload` only after both Worker scripts exist,
  deploy that probe with exact `versions deploy` (or use an equivalent valid traffic
  transition), verify it, then explicitly roll both Workers back to the recorded
  baseline UUIDs and verify 100% traffic, domains, and health. Merely deploying the
  baseline does not prove rollback. Record D1 state before/after to prove it was not
  restored or changed by Worker rollback. Migrations remain forward-only and expand-
  compatible with probe/new and baseline code; recovery is a reviewed forward
  correction. Time Travel restore and D1 deletion are separate destructive actions
  and not authorized by ordinary rollback.
- `VOC-094-D11` — Staging contains only synthetic/non-personal data. Signup, new-user
  onboarding, OAuth, magic links/email, AI generation/provider calls, paid providers,
  and production import remain off. Logs/metrics/traces may contain release UUID,
  route, status, latency, aggregate counts, and platform error codes only; exclude
  learner text, identifiers, tokens, cookies, magic links, OAuth material, request
  bodies, prompts/responses, and secrets.
- `VOC-094-D12` — In Phase 2, after Phase 1 evidence and credential/overlay cleanup,
  reverify pinned Ruflo 3.38.16 manifest, lock, settings, role-overlay hashes, patched
  dependency graph, audit status, and absence of background process from a disposable
  external workspace. Only sanitized coordination receipts enter GitHub. Ruflo
  receives no GitHub write/approve/merge/close/dispatch, Cloudflare, DNS, secret,
  spend, deploy, production-data, or launch authority. Remove disposable state after
  handoff and before Phase 3 closure.
- `VOC-094-D13` — Preserve all production sentinels and configuration, including
  reserved-only `prod.vocanova.site` and `api-prod.vocanova.site`; do not create or
  change production Workers, D1, Custom Domains/routes, GitHub environments/secrets,
  traffic, migrations, data, DNS, or `main`. Deterministic negative tests must fail on
  any production drift or attempt to release `HOLD-01`/`HOLD-02`.
- `VOC-094-D14` — Cleanup is explicit and attributable. On successful activation,
  preserve the named staging resources and evidence. Revoke/expire the ACT-00
  read-only credential before Phase 1 write-token issuance, the ACT-01/02 Phase 1 write
  token after Phase 1, and the third distinct Phase 4 environment token after
  dispatch; delete the Phase 1 overlay and Phase 2 Ruflo state only after sanitized
  evidence is captured. On partial failure, cleanup may affect only exact resources
  created by that action and only if its pre-authorized cleanup record names IDs,
  order, evidence retention, and readback; D1 deletion requires explicit confirmation
  that it contains synthetic data only. Never infer broad cleanup authority from
  failure.
- `VOC-094-D15` — Because `delete_branch_on_merge` is currently true, GitHub may
  automatically delete only merged short-lived plan, PR1, and PR2 source heads.
  Capture their exact names/tip SHAs before merge, read back after merge, and record
  recreation commands. Do not manually delete any branch, permanent ref, worktree, or
  recovery ref, and preserve all existing worktrees/recovery refs while any PR is
  open.
- `VOC-094-D16` — Every final repository revision receives full applicable checks,
  different-actor exact-SHA Cloudflare and security/settings specialist review,
  different-actor independent R4 review, resolved blockers, and non-author merge.
  Before any new ACT-02 Cloudflare write, the clean corrected repository SHA must bind
  successful applicable hosted CI, Governance, Quality, and Security plus local
  validation and credential-free dry runs. The reviewed resource manifest and both
  overlay hashes bind successful credential-free local/schema/dry-run checks and exact
  review. A reviewed but unchecked, failed, stale, or drifted SHA/manifest/overlay may
  not write D1, Workers, or domains. Authority expires on SHA, manifest, overlay hash,
  dependency/lock/workflow, or local/hosted check-result drift.
  Both PR1 and PR2 require exact-revision review and different non-author merge; the
  exact independently reviewed PR2 merged `develop` SHA is the sole ACT-04 dispatch
  revision.
  `automatic_merge_allowed: true` is eligibility metadata only.

## Exact public platform references

Implementation must reverify current locked-Wrangler behavior against Cloudflare's
official Custom Domains, Wrangler configuration and commands, service bindings, D1
commands/data location, API-token permission groups, Workers/D1 pricing and limits,
and Worker version/rollback documentation. In particular, Custom Domains create DNS
and certificates for Worker origins; service-binding targets must exist before the
caller; version rollback changes Worker traffic/resources but not D1 state.

Primary official references are Cloudflare's
[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/),
[Worker commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/),
[service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/),
[D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/),
[D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/),
[API-token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/),
[Workers pricing/limits](https://developers.cloudflare.com/workers/platform/pricing/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), and
[Worker rollback constraints](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

## Scope exclusions

No product behavior, production release, `develop` → `main` promotion, public launch,
paid-provider use, any paid Workers/D1/add-on/upgrade/overage, modification or
expansion of the unrelated Basic Load Balancing subscription, real learner account,
production data, broad DNS editing, preview
environment, repository-local Ruflo integration, or permanent resource cleanup is in
scope.
