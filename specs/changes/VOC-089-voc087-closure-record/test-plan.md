# VOC-089 - Test Plan

## VOC-089-TEST-00 - Evidence-source verification

- Covers: `VOC-089-AC-00`
- Procedure: inspect live GitHub evidence for issue #140, PR #137, PR #138, and issue
  #132 before finalizing the implementation PR. Confirm the exact SHAs, issue state,
  comment URLs, and run applicability recorded in the diff.
- Expected: every completed fact is backed by an existing GitHub PR, comment, issue, or
  hosted run. No future or live-system fact is claimed.
- Evidence: `VOC-089-EV-00`

## VOC-089-TEST-01 - change.yaml active-state review

- Covers: `VOC-089-AC-01`
- Procedure: inspect the final VOC-087 `change.yaml` diff and search it for stale
  active pending claims tied to PR #137 merge, post-merge checks, implementation
  effectiveness, PR #138 completion, or issue #132 closure.
- Expected: active fields report completed evidence; historical pending text appears
  only inside clearly historical evidence context.
- Evidence: `VOC-089-EV-01`

## VOC-089-TEST-02 - Narrative active-state review

- Covers: `VOC-089-AC-02`, `AC-03`
- Procedure: inspect the VOC-087 README, specification, acceptance criteria,
  implementation plan, release plan, and tasks diffs. Confirm historical FAIL/PASS and
  incident evidence remains visible and that active status text no longer contradicts
  completed GitHub evidence.
- Expected: no active stale pending claim remains in the targeted narrative files; no
  historical failure or process incident is erased or relabelled.
- Evidence: `VOC-089-EV-02`, `VOC-089-EV-03`

## VOC-089-TEST-03 - Governance validation and risk floor

- Covers: `VOC-089-AC-04`
- Procedure: run:

  ```bash
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

- Expected: all commands pass. The classifier reports the path floor and the PR body
  declares R3 or higher for semantic lifecycle-evidence risk.
- Evidence: `VOC-089-EV-04`

## VOC-089-TEST-04 - Scope and rollback review

- Covers: `VOC-089-AC-04`
- Procedure: inspect `git diff --name-only` and, before merge, record that the diff is
  limited to the approved VOC-087 package record files. Confirm rollback is a normal
  repository revert PR.
- Expected: no product code, workflows, validators, evaluators, settings, deployment,
  Cloudflare, live-system, production-data, `main`, or branch-deletion path is changed.
- Evidence: `VOC-089-EV-04`

## Test strategy rationale

This correction is text/evidence only. Product validation would not increase
confidence unless the implementation diff leaves package-record scope. The meaningful
checks are exact evidence verification, active-state source review, governance
validation, risk classification, exact-SHA independent review, and post-merge hosted
checks.
