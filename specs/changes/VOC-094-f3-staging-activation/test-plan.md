# VOC-094 — Test Plan

Tests use no credential value or production data. Live readbacks/actions occur only
under their adopted exact action records.

## VOC-094-TEST-00 — Package shape, lifecycle, roles, and ref preservation

- Covers: `VOC-094-AC-00`
- Procedure: validate one task/one implementation PR, draft/adoption/implementation
  gates, R4 evidence, role/actor separation, action record separation, merge metadata,
  worktree/recovery inventories, exact pre-merge plan/implementation tips,
  post-merge source-head readbacks, recreation commands, and mandatory Phase 1 → Phase
  2 → Phase 3 → Phase 4 ordering. Negative fixtures reject GitHub environment/secrets
  before the Phase 3 merge or tracked sentinel replacement before Phase 1 readbacks.
- Expected: no implementation/external action begins early; no actor self-reviews or
  merges authored work; no automatic merge is claimed; only GitHub may auto-delete a
  merged short-lived head and no worktree/recovery/permanent ref is removed.
- Evidence: `VOC-094-EV-00`

## VOC-094-TEST-01 — Phase 1 account scope, local credential, and zero spend

- Covers: `VOC-094-AC-01`
- Procedure: read back exact account/zone/Active/Free/billing facts, list every Worker,
  D1, and Custom Domain, inspect permission groups/token resource selectors and expiry,
  and prove the single secure local/interactive credential is first used only for
  read-only inventory and kept out of files, overlay, arguments, logs, and evidence.
  Negative fixtures cover missing/stale inventory; account/zone mismatch; production
  resource without residual acceptance; broad account/zone/DNS/billing permission;
  Paid plan/cost above 0; credential value disclosure; premature write; GitHub
  environment/secret creation; credential reissue/reuse; and production mutation.
- Expected: exact selected scope, no unauthorized account-wide residual, zero paid
  spend, one undisclosed Phase 1 credential with exact expiry, no GitHub environment
  yet, and no production change.
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
  feature enabled, personal data/log field, paid capability, and any production
  sentinel drift. An actual Cloudflare placement different from `eeur` is recorded and
  accepted when it reflects documented nearest viable placement.
- Expected: exact staging resources work with synthetic data and production remains
  untouched and held.
- Evidence: `VOC-094-EV-02`

## VOC-094-TEST-03 — Baseline, migrations, bindings, domains, and rollback

- Covers: `VOC-094-AC-03`
- Procedure: from a clean exact reviewed repository SHA, hash/review an untracked
  sanitized disposable external Wrangler overlay containing only approved non-secret
  real bindings/vars while auth remains outside it. List/apply migrations in order,
  verify migration table/schema/integrity, upload/deploy/smoke API first, then web with
  service binding, attach/read back Custom Domains, resolve baseline UUIDs, and verify
  distinct action/baseline evidence. For a live rollback rehearsal, upload/promote a
  newer reviewed probe/candidate or equivalent valid transition, verify it, roll both
  Workers to baseline UUIDs, then compare D1 before/after and rehearse forward
  correction. Capture sanitized evidence before deleting the overlay and
  revoking/expiring the Phase 1 credential. Negative fixtures cover tracked sentinel
  edits in Phase 1, auth in overlay, overlay/app SHA mismatch, web-first creation,
  missing target, migration failure, tag ambiguity, fake/mismatched UUID, reused/
  expired action record, missing domain/binding, baseline-only false rollback claim,
  unhealthy probe/rollback smoke, incompatible schema, and any D1 rollback attempt.
- Expected: real proven baseline exists before ordinary dispatch; Worker rollback is
  immediate and D1 state is unchanged/forward-correctable.
- Evidence: `VOC-094-EV-03`

## VOC-094-TEST-04 — Ordinary dispatch, exact promotion, smoke, soak, and failure

- Covers: `VOC-094-AC-04`
- Procedure: exercise mocked delivery events for every gate, then dispatch once on the
  exact independently reviewed merged `develop` SHA, but only after ACT-03 creates
  `cloudflare-staging` and stores exactly the account ID plus new distinct Phase 4
  token. Verify settings pre/post evidence, secret names/no values, migration/upload/
  promotion/smoke order, UUIDs, API `/healthz`, `/configz`, `/openapi.json`, service-
  binding-backed web HTML, release marker, resource/domain/deployment readbacks,
  bounded soak, usage/errors, and redaction. Negative cases include environment/secret
  before merge, reuse of Phase 1 credential, non-dispatch event, wrong ref/SHA/account/
  zone/route, expired/mismatched authority, nonzero estimate, fake baseline, extra/
  missing secret or variable, migration/upload/promotion/smoke failure, cancellation,
  retry without fresh review, limit pressure, and production selection.
- Expected: one authorized staging run succeeds; failures remain visible, invoke only
  Worker rollback where eligible, and never mutate D1 or production.
- Evidence: `VOC-094-EV-04`

## VOC-094-TEST-05 — Ruflo and cleanup boundaries

- Covers: `VOC-094-AC-05`
- Procedure: verify exact Ruflo version/integrity/hashes/frozen graph/audit externally;
  run a bounded sanitized coordination rehearsal and prove no background process or
  repository state remains. Verify Phase 1 overlay/credential cleanup before Ruflo,
  distinct Phase 4 token expiry/revocation after dispatch, and action-scoped cleanup
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
  Cloudflare, security/settings, and independent R4 verdicts; record normal merge,
  post-merge checks, source-head lifecycle, external action records, final readbacks,
  and issue closure. If a committed package script changes before implementation,
  use its then-current documented command and record the drift; do not invent a pass.

- Expected: all applicable checks and reviews pass with zero blockers; final living
  truth matches staging while production and preserved repository state remain intact.
- Evidence: `VOC-094-EV-06`
