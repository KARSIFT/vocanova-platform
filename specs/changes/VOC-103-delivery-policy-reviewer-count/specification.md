# VOC-103 — Specification

## Objective and evidence

Correct the credential-free delivery gate so the sole-required-reviewer contract is
enforced against reviewer rules, not the total number of GitHub environment
protection rules.

Run [`33342926874`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33342926874)
attempt 1 executed at exact `develop` SHA
`eeb744cb4f2c17c5c3b7764d6e7d13f5bba23609`. All prerequisite jobs and
`ci required` passed. The delivery gate then failed before protected environment
execution with `delivery blocked: environment must have exactly one
required-reviewer rule`; staging and production were skipped.

Sanitized live readback shows one valid `required_reviewers` rule and one unrelated
`branch_policy` rule in `protection_rules`, while the independent custom deployment
branch-policy response contains the sole `develop` policy required by current
policy. No environment secret or Cloudflare credential was accessed.

The root cause is local to `validateEnvironmentProtection()`: it currently requires
`protection_rules.length === 1` and then assumes element zero is the reviewer rule.
GitHub includes other rule types in that array, so the total length is not the
reviewer-rule count. The response-decoding defect addressed by VOC-102 is not in
scope and must remain unchanged.

## Requirements

### VOC-103-D00 — Adoption precedes implementation

Issue #183 and the failing run are intake and evidence, not implementation authority.
The exact package must receive independent review, accountable adoption, and merge to
`develop` before a different builder implements it. Adoption may authorize only the
declared two-file repository change; it grants no external action.

### VOC-103-D01 — Count reviewer rules by type

`validateEnvironmentProtection()` must reject a missing or non-array
`protection_rules` value. For an array, it must select entries whose `type` is exactly
`required_reviewers` and require exactly one selection. A valid sole reviewer rule
must remain acceptable when unrelated GitHub rule types are also present.

### VOC-103-D02 — Preserve the reviewer contract and fail closed

Zero or multiple `required_reviewers` entries must produce the existing
`environment must have exactly one required-reviewer rule` error. When exactly one is
present, its `prevent_self_review` value and sole exact User reviewer identity remain
subject to the current checks. Unrelated rules cannot satisfy, replace, or weaken the
reviewer rule.

### VOC-103-D03 — Keep branch-policy validation independent

The environment's deployment-branch-policy mode and the separately fetched
branch-policies response remain validated by the existing independent conditions.
This correction must not infer branch validity from a `branch_policy` protection-rule
entry, alter accepted branch-policy fields, or remove any branch-policy failure.

### VOC-103-D04 — Focused evaluator regression tests

The focused test file must prove that one exact reviewer rule plus the live-shape
`branch_policy` rule passes; unrelated rule types are tolerated; zero and multiple
reviewer rules fail; invalid reviewer fields still fail; and invalid independent
branch-policy mode, count, or `develop` identity still fails. Tests must call the
exported evaluator rather than reproduce its filtering logic.

### VOC-103-D05 — Preserve every other delivery control

The fix changes reviewer-rule selection only. Existing response decoding, event,
actor, ref, exact SHA, confirmation, same-run check, environment identity, reviewer,
branch-policy, cost, secret-isolation, staging, and production controls remain
unchanged. No workflow, manifest, runbook, settings record, application code, or
historical package changes.

### VOC-103-D06 — Coherent verified delivery

One minimum-sufficient task maps to one implementation PR. The exact plan and
implementation revisions each require deterministic validation,
Cloudflare/CI-security specialist review, independent R3 verification by distinct
non-author actors, resolution of all blocking findings, and normal merge by a
separate non-author actor.

## Risk and protected areas

The plan and implementation paths each have an automated R1 path floor. The semantic
implementation risk is R3 because the code is fail-closed CI/CD delivery and
environment-protection enforcement. There is no R4 strategy, pricing, privacy,
public-promise, major-launch, or difficult-to-reverse decision. R3 creates no
standing personal approval requirement; EHR is not triggered.

## Exclusions

No GitHub workflow or setting change, secret read/write, Cloudflare read/write,
workflow dispatch, deployment, Worker upload or promotion, D1 migration, traffic or
DNS change, spend, learner-data or production access, launch, response-decoding
change, branch-policy redesign, or historical-package rewrite is included.

## Data, analytics, accessibility, and migrations

None. The implementation changes a credential-free validator over already-requested
GitHub protection metadata and changes no product data, schema, analytics, user
interface, or accessibility surface.
