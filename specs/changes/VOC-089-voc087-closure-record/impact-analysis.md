# VOC-089 - Impact Analysis

## Repository and governance impact

VOC-089 corrects stale active evidence in one completed package record:
`specs/changes/VOC-087-saved-vocabulary-preview`. It improves downstream planning
truthfulness by making the package agree with completed GitHub evidence.

The implementation does not change DOC-15, DOC-16, risk classification rules,
merge-eligibility logic, hosted workflow behavior, validators, repository settings, or
CODEOWNERS. It does not create a new authority path. The future PR #147 implementation
contract remains to record that VOC-087 authority became effective after the completed
PR #137 merge and post-merge evidence and that the bounded implementation then completed
through PR #138, but VOC-089 authority for that PR #147 work is inactive until the
VOC-091 recovery boundary completes.

## Product and runtime impact

No product behavior changes. The VOC-087 runtime fix is already on `develop` through
PR #138 at merge commit `ea357ce506f42fe74c7e88f670db9ce4f848d80e`. VOC-089 only
corrects repository record text that lagged behind that completed chain.

## Security, privacy, data, and external effects

No secrets, credentials, personal data, production data, Cloudflare resources, DNS,
Sentry, servers, deployments, repository settings, or live systems are read or changed
by implementation. No data migration, analytics, telemetry, dependency, or build
configuration is touched.

## Accessibility and quality impact

No UI or accessibility behavior changes. The package records existing VOC-087 evidence,
including PR #138 exact-head Quality PASS with Accessibility and Lighthouse and the
documented post-merge Quality non-applicability because `quality.yml` had no push
trigger for that path.

## Historical evidence impact

The correction must preserve historical evidence instead of simplifying it. In
particular, the package must keep the initial VOC-087 plan review FAIL, the amended
candidate PASS, the adoption decision, final bookkeeping PASS, expected Governance
refresh blocks, implementation PASS, and the PR #137 merge-sequencing incident audit.

## VOC-091 authority-recovery impact

PR #141 merged as `925faf774ded5128c8aef2a298a8d6f506164ee0`, but the active authority
impact is invalid activation, not completed VOC-089 authority. Its final pre-merge
Governance adapter output at `2026-08-24T11:33:44Z` in run
[`32722390643`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722390643)
was `decision: "blocked"` and `eligible: false` for `review.identity_missing`,
`review.stale`, `review.not_passing`, `review.blocking_findings`, and
`review.evidence_missing`.

The later exact bookkeeping review
[5394643309](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394643309)
was real review evidence, but the PR body binder was not refreshed and no later
pre-merge adapter result returned `eligible: true` / `reasons: []`. The merge-readiness
comment
[5394657645](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394657645)
therefore overstated run `32722390643`. Post-merge CI
[`32722900390`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900390),
Governance
[`32722900352`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900352),
and Security
[`32722900426`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900426)
passed on the merge SHA, but the independent audit
[5394825877](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394825877)
records that they cannot retroactively provide pre-merge eligibility.

The mitigation is prospective only: preserve `implementation_authorized: true` as the
valid adoption decision, keep `implementation.authority_effective: false`, and require
the VOC-091 recovery implementation to obtain its own exact review, populated binder,
literal pre-merge `eligible: true` / `reasons: []`, normal merge, and applicable
post-merge checks before PR #147 can refresh. PR #137 remains a distinct precedent
because its audit
[5390981903](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903)
records genuine pre-merge eligible evidence. PR #147 remains draft/blocked under
[5394841275](https://github.com/KARSIFT/vocanova-platform/pull/147#issuecomment-5394841275);
issue #148 closes only after recovery merge/post-merge evidence, while issue #140
remains open until the later PR #147 boundary.

## Rollback impact

Rollback is repository-only. Reverting the future VOC-089 implementation PR restores
the previous stale VOC-087 record text. No live rollback, migration rollback, data
restore, deployment rollback, or Cloudflare action is involved.

Reverting the VOC-091 recovery overlay would require a separately governed repository
revert PR and would not by itself reactivate VOC-089, alter PR #141 history, change PR
#147, close issue #148 or #140, or authorize any external action.
