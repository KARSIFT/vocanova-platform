# VOC-012 Test Plan

Tests use no secrets, learner data, production configuration, or deployment service.

## VOC-012-TEST-01 — Package completeness and ordering

Assert exactly nine artifacts, stable traceability, no placeholders, one index entry,
and no remediation changes. Expected: PR #41 revert remains blocked pending sync.

## VOC-012-TEST-02 — PR #41 failure evidence

Reproduce GitHub/Git base, candidate, merge, timestamp, parent, tree identity, checks,
comment count, and review count. Expected: exact facts and absent canonical pre-merge
independent evidence.

## VOC-012-TEST-03 — Retroactive-evidence exclusion

Inspect all remediation records/comments. Expected: the external report is not posted
or used as PR #41 or fresh-candidate evidence.

## VOC-012-TEST-04 — Revert inventory identity

Compare PR #41's exact name-status set with the governed revert set. Expected: the
same ten paths with mechanically reversed statuses/content and no others.

## VOC-012-TEST-05 — Pre-PR-41 restoration

Compare reverted paths with `8de351bd97818ea7488616ceaa0a4f3d853f415c`.
Expected: byte-identical state while VOC-012 history remains present.

## VOC-012-TEST-06 — Fresh adoption completeness

Compare fresh VOC-011 paths with the approved package and index entry. Expected:
complete atomic adoption only; new candidate identity and evidence are distinct.

## VOC-012-TEST-07 — Verification-before-merge ordering

Compare the fresh report's comment timestamp/exact SHA with merge time/SHA. Expected:
an attributable exact-SHA report precedes authorized human merge.

## VOC-012-TEST-08 — Final lifecycle consistency

Parse VOC-011/VOC-012 YAML, READMEs, release plans, and index. Expected: PR #41 remains
invalid, VOC-012 remediation is complete, VOC-011 is validly adopted, and PR #40
remediation is only then unblocked.

## VOC-012-TEST-09 — Protected-path exclusion

Assert zero diff for application, dependency, governance-authority, workflow,
deployment, infrastructure, production, secret, release, activation, VOC-010, and
VOC-006 paths in this package candidate.

## VOC-012-TEST-10 — Activation invariants

Verify transition-state byte identity and all six false/disabled values.

## VOC-012-TEST-11 — Deterministic checks

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

Also validate YAML/frontmatter, links, exact inventory, evidence, and secret exclusion.

## VOC-012-TEST-12 — Reverse apply/tree proof

Reverse each exact diff in a scratch checkout and compare with its exact base tree.
Expected: clean application and identical tree without external recovery.

## VOC-012-TEST-13 — Exact independent verification

Verify each exact base/head/diff/evidence/risk/check/rollback independently. Expected:
no blocking finding; material changes require a new report.

## VOC-012-TEST-14 — PR/issue/nested-work state

Expected: draft/unmerged until human action, no Codex approval, issue #39 open, and no
PR #40 remediation, VOC-006 correction, F2-I04, deployment, or release.

## Failure rules

Any retroactive evidence, extra path, incomplete revert/adoption, report-after-merge,
under-classification, activation change, failed check, blocking finding, self-merge,
premature nested work, or issue closure blocks the stage.
