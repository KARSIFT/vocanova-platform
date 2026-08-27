# VOC-100 — Implementation Plan

## Preconditions and protected areas

Do not implement until the exact package is independently reviewed, explicitly
adopted, merged to `develop`, and records `implementation.authorized: true`. Package
adoption authorizes repository implementation only. Preserve all existing worktrees,
branches, evidence, and historical packages.

Settings/secret entry and the standing staging-dispatch delegation require separate
exact action records. The proposed standing delegation names `m-e-h-r-d-a-a-d` as
dispatcher and `NegarJafari` as different per-run environment reviewer, expires with
the token within 90 days, and is revoked on actor/scope/protection drift. Production
remains prohibited.

## One coherent implementation sequence

1. Create one isolated implementation worktree from then-current `origin/develop`.
2. Inventory all non-historical references to the five-record binder and classify
   each as remove, replace with a retained invariant, or preserve as history.
3. Simplify `.github/workflows/ci.yml` inputs and run name. Require manual staging by
   `m-e-h-r-d-a-a-d` on `develop`, same-run required jobs, SHA-bound confirmation,
   credential-free live environment-protection readback, and the protected
   `cloudflare-staging` environment. Keep production held before any environment job.
4. Simplify `cloudflare-delivery-policy.mjs` to deterministic local/event/settings
   validation. Remove comment fetch, JCS/digest/nonce/replay/expiry logic and helpers.
   Add static job-graph tests proving PR/push/reusable/build/test/smoke/summary paths
   cannot evaluate either Cloudflare secret or enter a secret-bearing job.
5. Add pre-write current-deployment readback for exact API/web rollback IDs, exact
   account check, and failure unless each Worker has one UUID at 100% traffic. Add a
   no-write, environment-reviewed credential-check operation for rotation. Keep
   credentials off build, validation, smoke, and summary steps when not required.
6. Update delivery manifest/policy tests and VOC-080 final-evidence validation so
   staging may be standard-ready while production remains held.
7. Remove unsupported experimental provisioning flags from D1 migration apply. In
   `cloudflare-delivery-policy.test.mjs`, add a no-help locked-Wrangler child-process
   parser harness with empty credentials/OAuth state, isolated temporary config,
   `CI=1`, hard timeout, and a temporary Node preload that throws on fetch, net/TLS
   connect, and HTTP(S) request attempts. Exact valid staging migration,
   deployments-status, version-promotion, and rollback argv must reach only the
   expected missing-auth guard; the same fixtures with a deliberate unknown option
   must fail at parsing. `--help` is explicitly insufficient and prohibited as proof.
8. Update every inventoried living operations, CI, architecture, governance, and
   planned-settings surface, including `AGENTS.md`. Do not edit historical records.
9. Run all deterministic checks without secrets. Open PR1, obtain fresh exact-SHA
   Cloudflare/security/R4 reviews, and have a different actor merge normally. Staging
   remains blocked because live environment protection readback fails while absent.
10. Prepare the documentation-only PR2 worktree/branch. Under separate exact authority,
    the account owner creates and dashboard-verifies the finite exact-scope token. The
    settings operator proves the same names absent at repository/organization scope,
    creates `cloudflare-staging`, configures required reviewer `NegarJafari`, self-
    review prevention, no admin bypass, and one custom `develop` policy, then enters
    exactly the two environment secrets. At each failure, remove incomplete settings,
    revoke the new token, and restore the documented pre-state.
11. Immediately record sanitized settings/token-policy readback in PR2. Obtain
    applicable exact-SHA reviews/checks and a different non-author merge. Record both
    PR lifecycles. Do not dispatch as part of either PR.
12. Under the separately approved standing delegation, run the no-write credential
    check; on rotation revoke the prior token only after success. Then dispatch one
    SHA-bound staging delivery, obtain `NegarJafari` approval, inspect migration/
    promotion/smoke/rollback evidence, and perform a bounded soak.

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
node --test scripts/foundation/cloudflare-delivery-policy.test.mjs
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Hosted CI, Security, Governance, secret scanning, and exact-revision specialist/R4
reviews are mandatory. Reviewers compare removed binder assertions with retained
invariants, not merely test pass/fail.

## Deployment and rollback

Repository rollback reverts PR1/PR2 through reviewed rollback PRs;
if the old binder is restored, staging dispatch stays disabled unless its complete
old authority contract is independently satisfied. Settings rollback deletes the two
environment secrets/environment or restores its prior policy, then records the new
truth. If PR2 cannot open/pass, restore the documented settings pre-state. Credential
rollback retains/reinstalls the valid old token until the new credential check passes
and revokes the failed/affected token. Worker rollback uses
the exact pre-promotion API/web versions captured by the workflow. D1 uses forward
correction only.
