# VOC-089 - Acceptance Criteria

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
