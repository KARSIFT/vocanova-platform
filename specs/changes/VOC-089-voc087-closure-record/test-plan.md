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
  impact-analysis, implementation plan, release plan, and tasks diffs. Confirm
  historical FAIL/PASS and incident evidence remains visible and that active status
  text no longer contradicts completed GitHub evidence.
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

## VOC-089-TEST-05 - VOC-091 incident-source verification

- Covers: VOC-091 recovery overlay
- Procedure: inspect issue #148; PR #141 body, comments, merge commit, and Governance
  run `32722390643` log; exact post-merge CI `32722900390`, Governance `32722900352`,
  and Security `32722900426` runs on merge `925faf774ded5128c8aef2a298a8d6f506164ee0`;
  audit comment `5394825877`; PR #147 hold `5394841275`; and PR #137 audit comment
  `5390981903`.
- Expected: all nine VOC-089 files preserve the blocked `decision: "blocked"` /
  `eligible: false` result from `2026-08-24T11:33:44Z`, the five reason codes
  `review.identity_missing`, `review.stale`, `review.not_passing`,
  `review.blocking_findings`, and `review.evidence_missing`, the later review
  `5394643309`, inaccurate readiness claim `5394657645`, merge SHA, post-merge run
  anchors, non-retroactivity conclusion, and PR #137 distinction.
- Evidence: `VOC-089-EV-05`

## VOC-089-TEST-06 - Authority-state and binder-boundary review

- Covers: VOC-091 recovery overlay
- Procedure: inspect final VOC-089 `change.yaml` and narrative files for active
  authority claims and the prospective recovery conditions.
- Expected: `implementation_authorized: true` remains valid adoption evidence, while
  `implementation.authority_effective: false` and a recovery-pending state remain
  active until the VOC-091 recovery implementation has exact different-actor review, one
  populated `merge-eligibility-evidence-v1` binder, literal pre-merge `eligible: true` /
  `reasons: []`, normal merge, and applicable post-merge checks. A successful workflow
  conclusion, later review, or post-merge result alone is not accepted.
- Evidence: `VOC-089-EV-06`

## VOC-089-TEST-07 - Contract-preservation and PR #147 resumption review

- Covers: VOC-091 recovery overlay
- Procedure: compare the final VOC-089 diff against the recovery base and inspect PR
  #147 state.
- Expected: VOC-089 D00-D05, AC00-AC04, TEST00-TEST04, task/test/evidence mappings,
  `VOC-089-T00`, the exact eight-file VOC-087 allowlist, R3 risk, non-goals, rollback,
  and issue #140 boundary remain intact and inactive. PR #147 remains open/draft/blocked
  and receives no transferred SHA, review, check, or binder evidence.
- Evidence: `VOC-089-EV-07`

## VOC-089-TEST-08 - Recovery allowlist and rollback rehearsal

- Covers: VOC-091 recovery overlay
- Procedure: inspect `git diff --name-only` for the recovery implementation and rehearse
  a revert in a disposable worktree.
- Expected: only the nine VOC-089 package files change. A normal repository revert
  restores the previous VOC-089 record and requires no product, workflow/evaluator/
  validator, settings, deployment, Cloudflare/live-system, `main`, secret,
  production-data, branch-deletion, PR #147, or issue mutation.
- Evidence: `VOC-089-EV-08`

## Test strategy rationale

This correction is text/evidence only. Product validation would not increase confidence
unless the implementation diff leaves package-record scope. The meaningful checks are
exact evidence verification, active-state source review, governance validation, risk
classification, exact-SHA independent review, genuine binder-backed eligibility JSON,
normal merge, and post-merge hosted checks. VOC-089 authority remains inactive until
the VOC-091 recovery boundary completes.
