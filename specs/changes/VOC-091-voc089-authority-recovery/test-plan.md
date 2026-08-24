# VOC-091 - Test Plan

## VOC-091-TEST-00 - Immutable incident-source verification

- Covers: `VOC-091-AC-00`
- Procedure: inspect issue #148; PR #141 body, comments, merge commit, and run
  `32722390643` log; exact post-merge CI `32722900390`, Governance `32722900352`, and
  Security `32722900426` runs against merge `925faf774ded5128c8aef2a298a8d6f506164ee0`;
  audit comment `5394825877`; and PR #137 audit comment `5390981903`.
- Expected: the record names `blocked`, `eligible: false`, all five reason codes, later
  review timing, inaccurate readiness statement, merge SHA, the three passing
  post-merge anchors, and the distinct PR #137 pre-merge eligibility fact without
  invention or omission. The post-merge passes are never an eligibility substitute.
- Evidence: `VOC-091-EV-00`

## VOC-091-TEST-01 - Active VOC-089 authority-state review

- Covers: `VOC-091-AC-01`
- Procedure: inspect all nine final VOC-089 files and search for active assertions that
  PR #141 was a normal governed merge or made implementation authority effective.
- Expected: active text/fields report invalid activation and recovery pending; prior
  candidate/adoption evidence remains historical rather than deleted.
- Evidence: `VOC-091-EV-01`

## VOC-091-TEST-02 - No retroactive-normality review

- Covers: `VOC-091-AC-00`, `AC-01`
- Procedure: exact-diff review verifies that PR #141's blocked adapter JSON, blank
  binder context, later review, readiness claim, merge, post-merge audit, and PR #137
  distinction remain present and are not relabelled as a passing pre-merge eligibility.
- Expected: no later evidence is used as a substitute for the missing pre-merge JSON.
- Evidence: `VOC-091-EV-00`, `VOC-091-EV-01`

## VOC-091-TEST-03 - Exact-review and binder audit

- Covers: `VOC-091-AC-02`
- Procedure: before the final Governance run, inspect the sole evidence binder on the
  recovery PR and the reviewer report.
- Expected: exactly one binder has a non-empty reviewer identity and role, reviewed SHA
  equal to the final head, `pass` verdict, resolved blockers, evidence URL, complete
  risk fields, inactive EHR, and no unsatisfied action hold. The reviewer is a different
  actor who did not author that SHA.
- Evidence: `VOC-091-EV-02`

## VOC-091-TEST-04 - Genuine pre-merge eligibility audit

- Covers: `VOC-091-AC-02`
- Procedure: inspect the final recovery Governance adapter log after binder population,
  while final head and body are unchanged.
- Expected: literal normalized JSON has `"eligible": true` and `"reasons": []`.
  A successful job conclusion without those values fails this test. Any later revision
  triggers fresh review, binder verification, and run.
- Evidence: `VOC-091-EV-02`

## VOC-091-TEST-05 - PR #147 resumption boundary review

- Covers: `VOC-091-AC-03`
- Procedure: inspect PR #147's hold and confirm it remains draft through recovery.
  After recovery only, inspect the rebase/refresh, new final SHA, fresh checks/review/
  binder/eligibility evidence, and later post-merge evidence before issue #140 closure.
- Expected: no pre-recovery PR #147 result transfers; unsafe rebase/scope drift closes
  it and returns to planning.
- Evidence: `VOC-091-EV-03`

## VOC-091-TEST-06 - Deterministic validation and declared risk

- Covers: `VOC-091-AC-04`
- Procedure: run:

  ```bash
  pnpm exec prettier --check specs/changes/VOC-089-voc087-closure-record specs/changes/VOC-091-voc089-authority-recovery
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

- Expected: commands pass; the classifier's floor is reported honestly and the PR
  declares R3 or higher for the semantic authority-evidence change.
- Evidence: `VOC-091-EV-04`

## VOC-091-TEST-07 - Allowlist and rollback review

- Covers: `VOC-091-AC-04`
- Procedure: inspect `git diff --name-only`, confirm exactly the nine VOC-089 records
  are changed, and rehearse an uncommitted revert in a disposable worktree.
- Expected: no forbidden path changes; reverting restores the prior repository record
  without external action.
- Evidence: `VOC-091-EV-04`

## VOC-091-TEST-08 - VOC-089 contract-preservation review

- Covers: `VOC-091-AC-05`
- Procedure: compare the final VOC-089 records with the recovery base and inspect the
  recovery diff around its specification, acceptance criteria, implementation plan,
  tasks, test plan, and release plan.
- Expected: VOC-089 D00-D05, AC00-AC04, TEST00-TEST04, mappings, one `VOC-089-T00`,
  exact eight-file VOC-087 allowlist, R3/non-goals/rollback, and issue #140 boundary
  remain intact and inactive pending recovery. Only authority/incident/lifecycle and
  prospective recovery evidence is additive; no contract is deleted, broadened, or
  repurposed.
- Evidence: `VOC-091-EV-05`

## Test strategy rationale

This is a governance-record correction. Product suites would not establish authority
truth. Evidence-source, exact JSON, binder, role-separation, scope, deterministic
governance validation, normal merge, and post-merge checks are the material tests. The
adopted candidate review is not transferable to its later bookkeeping SHA, which needs
fresh exact review and a newly populated binder before final eligibility evaluation.
