# VOC-103 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package is independently reviewed, adopted, and
present on `develop`. Use one isolated branch/worktree, one minimum-sufficient task,
and one coherent implementation PR into `develop`.

## Existing-file reconciliation

| Path                                                     | Classification               | Reconciliation                                                                                                                               |
| -------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/foundation/cloudflare-delivery-policy.mjs`      | present-needs-reconciliation | Change only required-reviewer-rule selection and cardinality in `validateEnvironmentProtection()`; preserve every other policy condition.    |
| `scripts/foundation/cloudflare-delivery-policy.test.mjs` | present-needs-reconciliation | Add focused mixed-rule, zero/multiple-reviewer, exact-reviewer, and independent branch-policy regression cases; preserve the existing suite. |

All workflows, manifests, runbooks, settings records, applications, response-decoding
logic, and historical packages are present-compatible and excluded from the
implementation diff.

## Ordered implementation

1. Update the focused exact-protection fixture or add a dedicated live-shape fixture
   with one exact `required_reviewers` rule plus one `branch_policy` rule.
2. Add a positive evaluator test proving that one reviewer rule remains valid with
   the live-shape branch-policy rule and other unrelated rule types.
3. Add negative evaluator tests for a missing or non-array collection and for zero
   and multiple `required_reviewers` entries. Preserve negative self-review and exact
   reviewer-identity cases.
4. Add or retain independent negative tests for deployment-branch-policy mode and
   the separate branch-policies response count and sole `develop` identity.
5. In `validateEnvironmentProtection()`, require an array, filter entries by exact
   `required_reviewers` type, require exactly one result, and apply the existing rule
   field checks to that sole result. Do not change response decoding or branch-policy
   criteria.
6. Run the focused delivery test, delivery validation, complete foundation and
   workspace checks, governance validation, risk classification, and whitespace
   validation.
7. Confirm the implementation diff is exactly the two approved files and every
   historical package has zero diff.
8. Obtain exact-SHA Cloudflare/CI-security specialist review and a separate
   independent R3 verdict. Resolve every blocking finding with fresh checks and fresh
   different-actor review of any changed SHA; use a separate non-author merge actor.

## Validation commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

Do not report an unavailable command as passing. Record prerequisites or an
environmental failure separately from a behavioral failure.

## Rollback

Before merge, close the implementation PR with no effect. After merge, use a
separately reviewed revert PR that restores both implementation files to the
last-known-good pre-implementation `develop` revision. The rollback owner is the
implementation change owner. No live-system rollback is part of this package because
implementation performs no external action.
