# VOC-094 — Test Plan

Tests use no credential value or production data. Live readbacks/actions occur only
under their adopted exact action records.

AM-01 bookkeeping is complete and repository implementation authority is effective.
The F3 execution tests remain pending. Issue #161 and `change.yaml` preserve the only
completed write so far: empty, unmigrated D1 `vocanova-staging` UUID
`22ae386f-e3f5-4d98-a3ad-18b39d3b8556`. ACT-02 requires fresh corrected-SHA review,
current resource/overlay and Free/$0 evidence, and exact time-bounded authority.

## VOC-094-TEST-00 — Package shape, lifecycle, roles, and ref preservation

- Covers: `VOC-094-AC-00`
- Procedure: validate one task/two implementation PRs, the hard truth/settings split
  rationale, PR1-main/PR2-docs task mapping, draft/adoption/implementation gates, R4
  evidence, role/actor separation, action record separation, merge metadata, worktree/
  recovery inventories, exact pre-merge plan/PR1/PR2 tips, post-merge source-head
  readbacks, recreation commands, and mandatory Phase 1 → Phase 2 → Phase 3 PR1 →
  Phase 4 ACT-03 → PR2 → ACT-04 ordering. Negative fixtures reject GitHub environment/
  secrets before PR1 merge, PR1 claims that the absent/held/planned environment already
  exists, dispatch before reviewed/merged/read-back PR2, missing immediate PR2, or
  tracked sentinel replacement before Phase 1 readbacks.
- Expected: no implementation/external action begins early; no actor self-reviews or
  merges authored work; no automatic merge is claimed; only GitHub may auto-delete a
  merged short-lived head and no worktree/recovery/permanent ref is removed.
- Evidence: `VOC-094-EV-00`

## VOC-094-TEST-01 — Phase 1 account scope, local credential, and zero spend

- Covers: `VOC-094-AC-01`
- Procedure: preserve the completed exact account/zone/Active/Free/billing inventory,
  its inventory-time Worker/D1/Custom-Domain facts, ACT-01's empty staging-D1 readback,
  and the protected-Worker list. Before ACT-02, re-read current D1/Worker/domain state,
  inspect permission groups/token resource selectors and expiry,
  and prove the distinct ACT-00 secure local/interactive credential/session has no
  write permission, is used only for read-only inventory, stays out of files,
  overlays, arguments, logs, and evidence, and is revoked before a separate Phase 1
  write token is used.
  Negative fixtures cover missing/stale inventory; account/zone mismatch; the three
  known unrelated Workers absent from the acceptance record; any mutation allowance for
  them; missing/exact-expiry failure of residual acceptance; broad account/zone/DNS/
  billing permission; incremental VocaNova cost above 0; paid Workers/D1, add-on,
  upgrade, overage, billing change, or payment prompt; treating an unrelated existing
  subscription as VocaNova cost or modifying/expanding it; credential value disclosure; premature write; GitHub
  environment/secret creation; read-only credential with write permission; write token
  before ACT-00 decision/revocation; unchecked, failed, or stale applicable hosted/local
  checks; SHA/dependency/lock/workflow/check-result drift; credential reissue/reuse; and
  production mutation.
- Expected: exact selected scope, the inventory facts, empty ACT-01 D1, and unrelated
  subscription remain preserved; no unauthorized account-wide residual; zero
  incremental VocaNova staging spend; no use of the separate Phase 1 token without a
  fresh ACT-02 record; no GitHub environment yet; and no production change.
- Evidence: `VOC-094-EV-01`

## VOC-094-TEST-02 — Resource, config, domain, D1, privacy, and production isolation

- Covers: `VOC-094-AC-02`
- Procedure: validate locked Wrangler schema/config and dry runs; read back exact Worker
  names, service binding, D1 name/UUID/placement/schema, Custom Domain hostnames/Worker
  ownership/certificates, public DNS/HTTPS, feature-disable vars, privacy-safe logs,
  and Free usage. Negative fixtures cover `.invalid`/placeholder/duplicate UUID,
  conventional/wildcard/wrong-zone route, absent `custom_domain: true`, public web-to-
  API fetch replacing binding, jurisdiction set, omission/misstatement of the requested
  `eeur` hint, false claim that the hint guarantees actual region/residency, external
  feature enabled, personal data/log field, paid Workers/D1/add-on/upgrade/overage or
  unrelated-subscription mutation/attribution, and any production
  sentinel drift. An actual Cloudflare placement different from `eeur` is recorded and
  accepted when it reflects documented nearest viable placement.
- Expected: exact staging resources work with synthetic data and production remains
  untouched and held.
- Evidence: `VOC-094-EV-02`

## VOC-094-TEST-03 — Baseline, migrations, bindings, domains, and rollback

- Covers: `VOC-094-AC-03`
- Procedure: from a clean exact reviewed corrected repository SHA and fresh ACT-02
  authority, hash/review an untracked
  sanitized route-free disposable Wrangler overlay containing only approved non-secret
  real bindings/vars while the separate Phase 1 write token remains outside it. Apply
  exact review and credential-free local/schema/dry-run checks to the resource manifest
  and both overlay hashes. Apply migrations only after they pass, then use locked
  `wrangler deploy` as the narrow first-creation exception
  to create/deploy API route-free and resolve/tag/read back its baseline UUID, followed
  by web route-free with service binding to the existing API and its baseline UUID.
  Hash/review a separate route-bearing overlay, apply it only after both scripts exist
  with locked `wrangler triggers deploy`, read back exact domain ownership/certificates/
  DNS, then smoke. For live rollback, use `versions upload` only after scripts exist,
  exact `versions deploy` for a newer reviewed probe, verify it, roll both Workers to
  baseline, and compare D1 before/after. Capture evidence before deleting overlays and
  revoking the write token. Negative fixtures cover tracked sentinel edits, auth in an
  overlay, overlay/app SHA mismatch, `versions upload` against nonexistent Worker,
  unchecked/failed/stale overlay or resource-manifest checks, overlay-hash or
  dependency/lock/workflow/check-result drift,
  web before API, service binding to absent API, domain trigger before both scripts,
  public route before trigger attachment, wrong/missing route overlay hash, migration
  failure, fake/mismatched UUID, baseline-only false rollback, unhealthy probe/rollback,
  incompatible schema, and any D1 rollback attempt.
- Expected: real proven baseline exists before ordinary dispatch; Worker rollback is
  immediate and D1 state is unchanged/forward-correctable; no live write occurs from a
  reviewed-but-unchecked or drifted SHA/manifest/overlay.
- Evidence: `VOC-094-EV-03`

## VOC-094-TEST-04 — Ordinary dispatch, exact promotion, smoke, soak, and failure

- Covers: `VOC-094-AC-04`
- Procedure: exercise mocked delivery events for every gate, then dispatch once on the
  exact independently reviewed PR2 merged `develop` SHA, but only after PR1 truthfully
  records the environment absent/held/planned and merges, ACT-03 creates
  `cloudflare-staging` under exact scoped `VOC-085-HOLD-00` authority and stores exactly
  the account ID plus the third distinct Phase 4 token, and immediate docs-only PR2 from
  current `develop` records sanitized pre-state/payload/rollback/post-state and secret
  names only. Verify PR2 local/hosted checks, different-actor exact review, non-author
  merge, post-merge/source-head readback, ACT-03 completion only after that merge,
  operator/authority/expiry evidence, and migration/upload/
  promotion/smoke order, UUIDs, API `/healthz`, `/configz`, `/openapi.json`, service-
  binding-backed web HTML, release marker, resource/domain/deployment readbacks,
  bounded soak, usage/errors, and redaction. Negative cases include environment/secret
  before PR1 merge, PR1 post-state preclaim, missing/stale/unmerged/unreviewed PR2,
  ACT-03 marked complete before PR2 readback, missing/broad/reused `VOC-085-HOLD-00`
  authority, authority/token expiry during PR2 followed by silent reissue, failure to
  leave other settings held, reuse of either earlier credential, non-dispatch event, wrong
  ref/SHA/account/zone/route, expired/mismatched authority, nonzero estimate, fake
  baseline, extra/missing secret or variable, migration/upload/promotion/smoke failure,
  cancellation, retry without fresh review, limit pressure, and production selection.
- Expected: one authorized staging run succeeds; failures remain visible, invoke only
  Worker rollback where eligible, and never mutate D1 or production.
- Evidence: `VOC-094-EV-04`

## VOC-094-TEST-05 — Ruflo and cleanup boundaries

- Covers: `VOC-094-AC-05`
- Procedure: verify exact Ruflo version/integrity/hashes/frozen graph/audit externally;
  run a bounded sanitized coordination rehearsal and prove no background process or
  repository state remains. Verify ACT-00 read-only credential and Phase 1 write-token/
  overlays cleanup before Ruflo, third Phase 4 token expiry/revocation after dispatch,
  and action-scoped cleanup
  readbacks. Negative fixtures deny Ruflo GitHub/Cloudflare/DNS/secret/dispatch/deploy/
  spend/production access and reject wildcard cleanup, successful-resource deletion,
  D1 deletion without synthetic proof, worktree/ref deletion, and unrecorded commands.
- Expected: orchestration is provenance only and cleanup touches only exact authorized
  disposable/failed state.
- Evidence: `VOC-094-EV-05`

## VOC-094-TEST-06 — Full repository, hosted, review, and final truth validation

- Covers: `VOC-094-AC-00` through `VOC-094-AC-06`
- Procedure: run:

  ```bash
  pnpm validate
  pnpm run ci:foundation
  pnpm run ci:delivery
  pnpm run ci:local-stack
  pnpm --filter @vocanova/api-worker run dry-run:staging
  pnpm --filter @vocanova/api-worker run dry-run:production
  pnpm --filter @vocanova/web run cloudflare:dry-run:staging
  pnpm --filter @vocanova/web run cloudflare:dry-run:production
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

  Inspect the final declared path inventory and current-vs-historical doc treatment;
  run applicable hosted CI, Governance, Quality, and Security; obtain exact-SHA
  Cloudflare, security/settings, and independent R4 verdicts; record both normal merges,
  post-merge checks, both source-head lifecycles, external action records, exact PR2
  merged-SHA dispatch review, final readbacks,
  and issue closure. If a committed package script changes before implementation,
  use its then-current documented command and record the drift; do not invent a pass.

- Expected: all applicable checks and reviews pass with zero blockers; final living
  truth matches staging while production and preserved repository state remain intact.
- Evidence: `VOC-094-EV-06`
