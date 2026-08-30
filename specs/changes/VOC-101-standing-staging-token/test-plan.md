# VOC-101 — Test Plan

## Deterministic validation

- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `git diff --check`

## Positive cases

- Every inventoried living surface expresses the standing, valid-until-revoked
  credential contract.
- Mandatory triggers revoke first and keep staging disabled unless and until
  replacement passes; only voluntary replacement with no trigger may retain the prior
  credential.
- A failed voluntary replacement restores and verifies the prior credential, then
  revokes the failed replacement. A failed trigger-driven replacement is revoked and
  removed while staging remains disabled.
- Existing exact account, permissions, secret placement, review, cost, resource,
  D1/Worker, rollback, and production-hold tests pass.

## Negative cases

- Any contradictory staging-token lifecycle claim in any inventoried living file
  fails, while unrelated application and session credential terms remain untouched.
- Removing a revocation trigger fails.
- Retaining a credential after any mandatory revocation trigger fails.
- Keeping a failed replacement or leaving staging enabled after trigger-driven
  replacement failure fails.
- Broadening account, permission, secret scope, dispatch authority, production,
  DNS, billing, data, or launch access fails.
- Omitting an inventoried living surface fails.
- Editing VOC-100 or VOC-094 through VOC-099 fails path review.

## External evidence

No live settings, secret, Cloudflare, or deployment check is run by plan or
implementation. Hosted checks and exact-SHA reviewer reports are repository evidence
only.
