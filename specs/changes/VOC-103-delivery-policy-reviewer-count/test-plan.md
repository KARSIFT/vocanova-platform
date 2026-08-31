# VOC-103 — Test Plan

## VOC-103-TEST-00 — Governance, scope, and delivery shape

- Covers: `VOC-103-AC-00`
- Procedure: run governance validation and risk classification; inspect package
  lifecycle, exact path inventory, one-task/one-PR mapping, authority exclusions, and
  the implementation diff.
- Expected: approved candidate
  `e66d7a8f02fce685da5d9336d2076b2fcf0b2f2c` has exact-candidate reviews and
  VOC-103-ADOPT-01; the adopted bookkeeping revision still requires fresh exact-SHA
  review and normal merge. Plan and implementation automated path floor is R1 and
  semantic implementation risk is R3; exactly two implementation paths are allowed;
  no external action is authorized.
- Evidence: `VOC-103-EV-00`

## VOC-103-TEST-01 — Mixed protection rules succeed

- Covers: `VOC-103-AC-01`
- Procedure: call `validateEnvironmentProtection()` with the exact valid environment
  and branch-policy projection, adding the live-shape `branch_policy` entry beside the
  sole exact `required_reviewers` rule. Repeat with another unrelated rule type.
- Expected: the result is an empty error array; total protection-rule length is not
  used as reviewer-rule cardinality.
- Evidence: `VOC-103-EV-01`

## VOC-103-TEST-02 — Reviewer cardinality and fields fail closed

- Covers: `VOC-103-AC-02`
- Procedure: separately provide a missing collection, non-array value, only unrelated
  rules, zero reviewer rules, and two reviewer rules. With one reviewer rule, mutate
  self-review, reviewer count, reviewer type, login, and numeric identity.
- Expected: missing/non-array/zero/multiple cases contain exactly the existing
  sole-reviewer-rule diagnostic; one invalid reviewer rule reaches the existing
  self-review or exact-identity diagnostics. No unrelated rule can satisfy the check.
- Evidence: `VOC-103-EV-02`

## VOC-103-TEST-03 — Branch-policy checks remain independent

- Covers: `VOC-103-AC-03`
- Procedure: keep exactly one valid reviewer rule while separately mutating the
  environment's protected/custom branch-policy mode, the separate response total,
  response array length, and sole `develop` name under the existing contract.
- Expected: each mutation remains ineligible with the existing branch-policy
  diagnostic even when a `branch_policy` entry is present in `protection_rules`.
- Evidence: `VOC-103-EV-03`

## VOC-103-TEST-04 — Regression, invariants, and exact revision

- Covers: `VOC-103-AC-04`
- Procedure: run the focused test file, delivery validation, complete foundation and
  workspace checks, governance validation, risk classification, and
  `git diff --check`. Inspect the exact implementation diff and obtain specialist and
  independent R3 review of that SHA.
- Expected: all applicable commands pass; every pre-existing negative delivery test
  and production hold remains intact; only two approved files differ; historical
  packages have zero diff; distinct non-author exact-SHA reviews have zero unresolved
  blocking findings.
- Evidence: `VOC-103-EV-04`

## Sanitized baseline reproduction

At exact base SHA `eeb744cb4f2c17c5c3b7764d6e7d13f5bba23609`, run this
credential-free local diagnostic. It uses synthetic identifiers and makes no network
request:

```bash
node --input-type=module <<'NODE'
import { validateEnvironmentProtection } from "./scripts/foundation/cloudflare-delivery-policy.mjs";

const protection = {
  environment: {
    id: 987654,
    name: "cloudflare-staging",
    can_admins_bypass: false,
    protection_rules: [
      {
        type: "required_reviewers",
        prevent_self_review: false,
        reviewers: [{
          type: "User",
          reviewer: { login: "m-e-h-r-d-a-a-d", id: 7955432 },
        }],
      },
      { type: "branch_policy" },
    ],
    deployment_branch_policy: {
      protected_branches: false,
      custom_branch_policies: true,
    },
  },
  branchPolicies: {
    total_count: 1,
    branch_policies: [{ name: "develop", type: "branch" }],
  },
};

console.log(validateEnvironmentProtection(protection));
NODE
```

Recorded result:

```text
[ 'environment must have exactly one required-reviewer rule' ]
```

The matching hosted evidence is run
[`33342926874`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33342926874),
attempt 1, job `cloudflare delivery gate`, exact event SHA
`eeb744cb4f2c17c5c3b7764d6e7d13f5bba23609`. All prerequisites and
`ci required` passed; the gate emitted that same failure before environment execution,
and staging and production were skipped.

## Commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

## Evidence definitions

- `VOC-103-EV-00`: exact plan review/adoption record, package validation, path/risk
  evidence, hosted plan checks, and normal different-actor plan merge.
- `VOC-103-EV-01`: focused mixed-rule success tests at the exact implementation SHA.
- `VOC-103-EV-02`: focused missing/non-array/zero/multiple reviewer-rule failures and
  retained exact-reviewer-field failures.
- `VOC-103-EV-03`: focused independent branch-policy negative cases under the
  existing policy contract.
- `VOC-103-EV-04`: complete local/hosted checks, exact two-file diff, historical
  package zero-diff proof, exact-SHA specialist/independent R3 verdicts, and normal
  different-actor merge evidence.

No test may use a real secret, production data, live GitHub mutation, Cloudflare API,
workflow dispatch, or deployment.
