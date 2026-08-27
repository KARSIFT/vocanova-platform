# VOC-100 — Implementation Plan

## Preconditions and protected areas

Do not implement until the exact package is independently reviewed, explicitly
adopted, merged to `develop`, and records `implementation.authorized: true`. Package
adoption authorizes repository implementation only. Preserve all existing worktrees,
branches, evidence, and historical packages.

Settings and secret entry require a separate exact action record. Staging dispatch
requires a later separate action record. Production remains prohibited.

## One coherent implementation sequence

1. Create one isolated implementation worktree from then-current `origin/develop`.
2. Inventory all non-historical references to the five-record binder and classify
   each as remove, replace with a retained invariant, or preserve as history.
3. Simplify `.github/workflows/ci.yml` inputs and run name. Require manual staging on
   `develop`, same-run required jobs, exact confirmation, and the
   `cloudflare-staging` environment. Keep production held and `main`-only.
4. Simplify `cloudflare-delivery-policy.mjs` to local deterministic validation only.
   Remove comment-network fetch, JCS/digest/nonce/replay/expiry logic and dead helpers.
5. Add pre-secret current-deployment readback for API/web rollback IDs, exact account
   check, and failure on mixed/ambiguous deployments. Keep credentials off build,
   validation, smoke, and summary steps when not required.
6. Update delivery manifest/policy tests and VOC-080 final-evidence validation so
   staging may be standard-ready while production remains held.
7. Update every living operations, CI, governance, and settings document in the
   authorized path inventory. Do not edit VOC-094 through VOC-099.
8. Run all deterministic checks without secrets. Open the single implementation PR.
9. After a separate exact settings/secret authority record, the authorized operator
   creates/reconciles `cloudflare-staging`, limits it to `develop`, and securely enters
   exactly the two environment secrets. Record only sanitized API readback in the
   same PR. Verify the names are absent from repository secrets.
10. Run full checks again and obtain fresh exact-SHA Cloudflare, security/settings,
    and R4 reviews. Resolve blockers in the same PR and repeat reviews on changes.
11. A different non-author merges normally after genuine eligibility. Record merge,
    postmerge checks, source-branch lifecycle, and settings readback. Do not dispatch.
12. Under separate staging-dispatch authority, run one manual staging delivery,
    inspect migration/promotion/smoke/rollback evidence, and perform a bounded soak.

## Validation and independent verification

Run the commands committed in `docs/development.md`, including:

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

Hosted CI, Security, Governance, secret scanning, and exact-revision specialist/R4
reviews are mandatory. Reviewers compare removed binder assertions with retained
invariants, not merely test pass/fail.

## Deployment and rollback

Repository rollback reverts the implementation PR through a reviewed rollback PR;
if the old binder is restored, staging dispatch stays disabled unless its complete
old authority contract is independently satisfied. Settings rollback deletes the two
environment secrets and environment or restores its prior branch policy, then records
the new truth. Credential rollback revokes the affected token. Worker rollback uses
the exact pre-promotion API/web versions captured by the workflow. D1 uses forward
correction only.
