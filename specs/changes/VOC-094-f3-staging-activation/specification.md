# VOC-094 — F3 staging activation: Specification

## Objective and authority boundary

Deliver the F3 synthetic staging outcome described by issue #158: provision and
verify the exact Cloudflare staging resources, reconcile the repository and GitHub
staging environment, create a real reviewed rollback baseline, and run the existing
manual staging delivery state machine on an exact reviewed `develop` revision.

The issue and operator decisions authorize this draft only. Implementation begins
only after adoption and external actions begin only after their separate exact action
records. Completing this package may release `VOC-080-HOLD-00` only for the named
staging outcome. `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.

## Decisions and requirements

- `VOC-094-D00` — Use one package, one minimum-sufficient task, and one
  implementation PR into `develop`. Repository config, policy, tests, documentation,
  settings evidence, provisioning, baseline, dispatch, soak, rollback, and closure
  share one staging outcome and control boundary; ordered external holds are not a
  multi-PR rationale. Preserve the mandatory order: Phase 1 Cloudflare inventory,
  resources, baseline, domains, and rollback evidence; Phase 2 external Ruflo; Phase 3
  repository implementation/review/non-author merge; Phase 4 GitHub environment,
  secrets, merged-SHA verification, dispatch, soak, and cleanup.
- `VOC-094-D01` — Bind only `vocanova-api-staging`, `vocanova-web-staging`, D1
  `vocanova-staging`, API Custom Domain `api-stag.vocanova.site`, and web Custom
  Domain `stag.vocanova.site`. Wrangler uses route objects with
  `custom_domain: true`; `workers_dev` and preview URLs remain false. The web Worker
  retains service binding `API` to `vocanova-api-staging`.
- `VOC-094-D02` — The selected zone is exactly `vocanova.site` and must read back
  Active. The selected account ID and zone ID are non-secret evidence values, but
  must come from read-only Cloudflare readback, not chat or placeholders, and bind
  every action record, manifest, token resource selector, and post-action readback.
- `VOC-094-D03` — In Phase 1, request D1 `vocanova-staging` with location hint `eeur`
  and no jurisdiction. Record the requested hint, real UUID, and Cloudflare's actual
  placement/served-region readback plus name, migration table, applied migration
  order, schema integrity, and synthetic-only contents. The hint asks Cloudflare for
  the nearest viable placement and may not equal the actual placement; a different
  documented actual region is not failure. Neither hint nor readback is a legal
  residency promise.
- `VOC-094-D04` — Workers Free and `cost_ceiling_cents: 0` are absolute. Read back
  the plan and billing posture before action. Do not activate Paid, add-ons, overage,
  Queues, Workers AI, R2, paid observability, or another billable capability. Stop if
  the exact build, usage envelope, or required feature cannot run on Free; monitor
  Worker requests/CPU/errors and D1 rows read/written/storage against Free limits and
  stop before any paid-plan change.
- `VOC-094-D05` — Phase 1 and Phase 4 use two distinct credentials. Issue the Phase 1
  secure local/interactive short-lived Cloudflare credential once, scope it only to
  the selected account and, if the adopted Custom Domain mechanism requires it, the
  selected `vocanova.site` zone, and use it first for read-only inventory. Only after
  `ACT-00` passes may the same Phase 1 credential perform its authorized writes. Its
  current permission-group readback grants only Workers Scripts write/read, D1
  write/read, and the minimum Custom Domain/Workers Routes permission actually
  required. Revoke/expire it at the end of Phase 1. After the Phase 3 merge, issue a
  new distinct short-lived token once for the Phase 4 GitHub environment. Deny DNS
  write, billing, user/org, production, KV, R2, AI, Access, and unrelated products.
  Neither value is printed, committed, placed in the disposable overlay/evidence, or
  reused/reissued across phases.
- `VOC-094-D06` — Workers Scripts and D1 permissions are account-wide within the
  selected account; Cloudflare cannot restrict them to the two scripts and one D1
  database. Before any write token exists, inventory all Workers, D1 databases, and
  Custom Domains in that account. If any production Worker or D1 is present, fail
  closed unless the operator explicitly accepts the residual account-wide boundary
  in a time-bounded exact action record naming the discovered resources, risks,
  operator, permitted commands, and expiry. Absence of an inventory or acceptance is
  a blocker, not a warning.
- `VOC-094-D07` — Only in Phase 4, after the implementation PR normally merges and the
  exact resulting `develop` SHA is known, create/reconcile GitHub environment exactly
  `cloudflare-staging`. At the action readback it has exactly two secret names,
  `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`, no values in GitHub output,
  repository files, PR comments, logs, artifacts, or Ruflo memory, and no variables
  or production changes. Record settings pre-state, payload, rollback, post-state,
  Phase 4 token expiry, and immediate living-document reconciliation already present
  in the merged Phase 3 implementation. Pull requests, builders, Ruflo, and
  credential-free jobs never receive the secrets. No GitHub environment or secret is
  created during Phase 1, Phase 2, or Phase 3.
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

  Apply ordered compatible D1 migrations; upload/promote/smoke the API target first;
  then upload/promote/smoke the web Worker with its API service binding; apply and
  read back both Custom Domains; record real immutable API and web UUIDs as the
  last-known-good baseline. Ordinary dispatch is prohibited until both baseline
  UUIDs, migrations, bindings, domains, and smoke results are proven. Phase 3 alone
  replaces staging sentinels with those readbacks; Phase 1 must not edit tracked
  manifest/Wrangler/policy/docs files.

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
  probe/candidate version (or an equivalent valid traffic transition) after the real
  baseline exists, verify that transition, then explicitly roll both Workers back to
  the recorded baseline UUIDs and verify 100% traffic, domains, and health. Merely
  deploying the baseline does not prove rollback. Record D1 state before/after to prove
  it was not restored or changed by Worker rollback. Migrations remain forward-only
  and expand-compatible with probe/new and baseline code; recovery is a reviewed
  forward correction. Time Travel restore and D1 deletion are separate destructive
  actions and not authorized by ordinary rollback.
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
  preserve the named staging resources and evidence. Revoke/expire the Phase 1 local
  credential after Phase 1 and the distinct Phase 4 environment token after dispatch;
  delete the Phase 1 overlay and Phase 2 Ruflo state only after sanitized evidence is
  captured. On partial failure, cleanup may affect only exact resources created by
  that action and only if its pre-authorized cleanup record names IDs, order, evidence
  retention, and readback; D1 deletion requires explicit confirmation that it contains
  synthetic data only. Never infer broad cleanup authority from failure.
- `VOC-094-D15` — Because `delete_branch_on_merge` is currently true, GitHub may
  automatically delete only merged short-lived plan and implementation source heads.
  Capture their exact names/tip SHAs before merge, read back after merge, and record
  recreation commands. Do not manually delete any branch, permanent ref, worktree, or
  recovery ref, and preserve all existing worktrees/recovery refs while either PR is
  open.
- `VOC-094-D16` — Every final repository revision receives full applicable checks,
  different-actor exact-SHA Cloudflare and security/settings specialist review,
  different-actor independent R4 review, resolved blockers, and non-author merge.
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
paid-provider use, real learner account, production data, broad DNS editing, preview
environment, repository-local Ruflo integration, or permanent resource cleanup is in
scope.
