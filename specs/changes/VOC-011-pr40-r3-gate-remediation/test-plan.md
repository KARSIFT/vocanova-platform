# VOC-011 Test Plan

Tests use no secrets, learner data, production configuration, or deployment service.

## VOC-011-TEST-01 — Package completeness and stage ordering

Assert exactly nine artifacts, stable traceability, no placeholders, one index entry,
and no remediation changes. Expected: revert remains blocked pending package sync.

## VOC-011-TEST-02 — PR #40 failure evidence

Reproduce GitHub/Git base, candidate, merge, timestamp, tree, checks, comment count,
review count, parent, and tree identity. Expected: exact values and absent canonical
independent evidence before merge.

## VOC-011-TEST-03 — Retroactive-evidence exclusion

Inspect all records/comments used by remediation. Expected: the external report is not
posted or used as PR #40 or fresh-candidate evidence.

## VOC-011-TEST-04 — Revert inventory identity

Compare PR #40's exact name-status set with the governed revert set. Expected: the same
ten paths with mechanically reversed statuses/content and no others.

## VOC-011-TEST-05 — Pre-PR-40 restoration

Compare reverted paths with `a22affd5732a00ba41361c4dc84c8685272e5a6e`.
Expected: byte-identical state while VOC-011 history remains present.

## VOC-011-TEST-06 — Fresh adoption completeness

Compare fresh VOC-010 paths with the approved package content and required index entry.
Expected: complete atomic adoption only; new candidate identity is distinct.

## VOC-011-TEST-07 — Verification-before-merge ordering

Compare fresh report comment timestamp and exact SHA to merge time/SHA.
Expected: attributable exact-SHA report precedes authorized human merge.

## VOC-011-TEST-08 — Final lifecycle consistency

Parse VOC-010/VOC-011 YAML, READMEs, release plans, and index. Expected: PR #40 remains
invalid, remediation is complete, fresh adoption is valid, and only correction is next.

## VOC-011-TEST-09 — Protected-path exclusion

Assert zero diff for application, dependency, governance-authority, workflow,
deployment, infrastructure, production, secret, and activation-state paths.

## VOC-011-TEST-10 — Activation invariants

Verify transition-state byte identity and all six false/disabled values.

## VOC-011-TEST-11 — Deterministic checks

Run for every candidate:

```bash
python3 -B -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v
python3 -B tooling/governance/validate_repository_foundation.py --repository-root .
bash -n scripts/governance/validate-governance.sh
bash -n scripts/governance/classify-change-risk.sh
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base BASE_SHA --head HEAD_SHA
git diff --check BASE_SHA...HEAD_SHA
```

Also validate YAML/frontmatter, local links, exact inventory, evidence, and secrets.

## VOC-011-TEST-12 — Reverse apply/tree proof

Reverse each exact diff in a scratch checkout and compare with its exact base tree.
Expected: clean application and identical tree without external recovery.

## VOC-011-TEST-13 — Exact independent verification

Verify each exact base/head/diff/evidence/risk/check/rollback independently. Expected:
no blocking finding; material changes require a new report.

## VOC-011-TEST-14 — PR/issue/later-work state

Expected: draft/unmerged until human action, no Codex approval, issue #39 open, no
VOC-006 correction/F2-I04/deployment.

## Failure rules

Any retroactive evidence, extra path, incomplete revert/adoption, report-after-merge,
under-classification, activation change, failed check, blocking finding, self-merge,
premature correction, or issue closure blocks the stage.
