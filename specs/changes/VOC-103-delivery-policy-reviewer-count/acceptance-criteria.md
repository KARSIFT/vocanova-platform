# VOC-103 — Acceptance Criteria

## VOC-103-AC-00 — Reviewed scope and authority

- Requirements: `VOC-103-D00`, `VOC-103-D06`
- Task: `VOC-103-T00`
- Tests: `VOC-103-TEST-00`
- Evidence: `VOC-103-EV-00`

The exact plan candidate receives Cloudflare/CI-security specialist and independent
R3 PASS verdicts from distinct non-author actors before accountable adoption. No
implementation or external action occurs from issue intake or this draft.

## VOC-103-AC-01 — One reviewer rule is counted correctly

- Requirements: `VOC-103-D01`, `VOC-103-D04`
- Task: `VOC-103-T00`
- Tests: `VOC-103-TEST-01`
- Evidence: `VOC-103-EV-01`

An exact environment projection with one valid `required_reviewers` entry and one
`branch_policy` entry produces no protection-validation error. Additional unrelated
rule types do not change that result merely by increasing total array length.

## VOC-103-AC-02 — Zero and multiple reviewer rules fail closed

- Requirements: `VOC-103-D01`, `VOC-103-D02`, `VOC-103-D04`
- Task: `VOC-103-T00`
- Tests: `VOC-103-TEST-02`
- Evidence: `VOC-103-EV-02`

A missing or non-array rule collection and an array containing zero or multiple
`required_reviewers` rules each remain ineligible with the sole-reviewer-rule error.
With one matching rule, invalid self-review or reviewer identity fields continue to
produce their existing errors.

## VOC-103-AC-03 — Exact branch-policy validation stays independent

- Requirements: `VOC-103-D03`, `VOC-103-D04`, `VOC-103-D05`
- Task: `VOC-103-T00`
- Tests: `VOC-103-TEST-03`
- Evidence: `VOC-103-EV-03`

The presence of a `branch_policy` protection-rule entry does not substitute for the
existing deployment-branch-policy mode or branch-policies response. Invalid mode,
count, or sole `develop` identity continues to fail under the existing diagnostics,
independently of reviewer-rule success.

## VOC-103-AC-04 — Existing delivery controls remain invariant

- Requirements: `VOC-103-D05`, `VOC-103-D06`
- Task: `VOC-103-T00`
- Tests: `VOC-103-TEST-04`
- Evidence: `VOC-103-EV-04`

The focused and full foundation/workspace checks pass at the exact implementation
SHA; the diff contains only the two approved files; all existing negative delivery
cases and production holds remain effective; historical packages have zero diff; and
distinct non-author specialist and independent R3 reviews report no blocking finding.
