# VOC-089 - Acceptance Criteria

Current authority state: `VOC-089-AC-00` through `VOC-089-AC-04` remain the inactive
future contract for PR #147. They are not complete or merge-authorizing until VOC-091
recovery prospectively establishes VOC-089 implementation authority.

## VOC-089-AC-00 - Completed evidence is exact and traceable

- Requirements: `VOC-089-D00`, `D04`
- Task: `VOC-089-T00`
- Tests: `VOC-089-TEST-00`
- Evidence: `VOC-089-EV-00`
- Result: pending

The final VOC-089 implementation records exact PR #137, PR #138, and issue #132
evidence. Every cited SHA, PR number, run URL, and issue comment corresponds to the
live GitHub record. No future review, hosted result, merge, post-merge check,
deployment, or live-system fact is preclaimed.

## VOC-089-AC-01 - VOC-087 change.yaml no longer reports completed gates as pending

- Requirements: `VOC-089-D01`
- Task: `VOC-089-T00`
- Tests: `VOC-089-TEST-01`
- Evidence: `VOC-089-EV-01`
- Result: pending

`specs/changes/VOC-087-saved-vocabulary-preview/change.yaml` records that PR #137
merged and passed applicable post-merge checks, VOC-087 implementation authority became
effective for the bounded T00 implementation, PR #138 completed and merged, and issue
#132 closed after completion evidence. The stale blocking reasons are removed or
replaced with a truthful completed-state value. Existing R1 classification, automatic
merge policy, approved candidate SHA, historical review evidence, EHR state, and
external-effect prohibitions remain intact.

## VOC-089-AC-02 - VOC-087 narrative files match the completed state

- Requirements: `VOC-089-D02`, `D03`
- Task: `VOC-089-T00`
- Tests: `VOC-089-TEST-02`
- Evidence: `VOC-089-EV-02`
- Result: pending

The active lifecycle/status text in VOC-087 `README.md`, `specification.md`,
`acceptance-criteria.md`, `impact-analysis.md`, `implementation-plan.md`,
`release-plan.md`, and `tasks.md` no longer says the completed PR #137
adoption-effectiveness gate, PR #138 implementation, post-merge proof, or issue #132
closure is pending. `tasks.md` carries a completed `VOC-087-T00` entry with exact
evidence. Prospective test and requirement text remains only where it still accurately
describes the implemented contract.

## VOC-089-AC-03 - Historical failures and the sequencing incident remain preserved

- Requirements: `VOC-089-D04`
- Task: `VOC-089-T00`
- Tests: `VOC-089-TEST-02`
- Evidence: `VOC-089-EV-03`
- Result: pending

The initial VOC-087 plan FAIL, later PASS, adoption decision, final bookkeeping PASS,
expected Governance refresh blocks, exact implementation PASS, and PR #137
merge-sequencing incident remain visible as historical evidence. The correction does
not relabel any failed review or process incident as an unqualified pass.

## VOC-089-AC-04 - Scope, validation, review, and rollback are bounded

- Requirements: `VOC-089-D05`
- Task: `VOC-089-T00`
- Tests: `VOC-089-TEST-03`, `VOC-089-TEST-04`
- Evidence: `VOC-089-EV-04`
- Result: pending

The implementation diff touches only the listed VOC-087 package record files, receives
different-actor exact-SHA review, passes governance validation, risk classification,
and `git diff --check`, and can be reverted by a normal repository revert PR. It
contains no product, workflow, validator, evaluator, settings, deployment, Cloudflare,
live-system, production-data, `main`, or branch-deletion change.

## VOC-091 authority-recovery overlay

The PR #141 merge is preserved as historical fact, not as completed activation. At
`2026-08-24T11:33:44Z`, Governance run
[`32722390643`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722390643)
reported `decision: "blocked"`, `eligible: false`, with `review.identity_missing`,
`review.stale`, `review.not_passing`, `review.blocking_findings`, and
`review.evidence_missing`. The later exact bookkeeping review
[5394643309](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394643309)
did not populate the single binder or produce a later pre-merge `eligible: true` /
`reasons: []` result, so the merge-readiness claim
[5394657645](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394657645)
was inaccurate.

PR #141 merged as `925faf774ded5128c8aef2a298a8d6f506164ee0`. Its post-merge CI
[`32722900390`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900390),
Governance
[`32722900352`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900352),
and Security
[`32722900426`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900426)
passed on that merge SHA, but the independent audit
[5394825877](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394825877)
records that those post-merge facts do not retroactively satisfy the missing pre-merge
eligibility gate. This differs from PR #137, whose audit
[5390981903](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903)
preserves genuine pre-merge `eligible: true` / `reasons: []` evidence.

`implementation_authorized: true` remains valid adoption evidence, while
`implementation.authority_effective: false` remains the active state pending VOC-091
recovery. The recovery implementation must receive its own exact different-actor
review, one populated `merge-eligibility-evidence-v1` binder, literal pre-merge
`eligible: true` / `reasons: []`, normal merge, and applicable post-merge checks before
PR #147 may rebase or refresh. PR #147 remains draft/blocked under
[5394841275](https://github.com/KARSIFT/vocanova-platform/pull/147#issuecomment-5394841275);
issue #148 remains open until recovery merge/post-merge evidence, and issue #140 remains
open until the later PR #147 completion boundary.
