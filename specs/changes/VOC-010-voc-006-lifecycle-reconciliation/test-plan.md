# VOC-010 Test Plan

Tests use no secrets, production configuration, learner data, or deployment service.

## VOC-010-TEST-01 — Package completeness and ordering

Verify exactly nine artifacts, no placeholders, stable traceability, one index entry,
and byte-unchanged VOC-006 files. Expected: correction remains blocked pending merge.

## VOC-010-TEST-02 — Immutable evidence

Reproduce every recorded state, SHA, timestamp, verdict, comment, URL, parent, and
merge via GitHub and Git. Expected: exact matches; PR #24 is closed unmerged.

## VOC-010-TEST-03 — Event separation

Assert distinct package adoption, package sync, implementation, abandoned sync,
issue closure, and VOC-010 stages. Expected: no gate conflation.

## VOC-010-TEST-04 — Completion and authority

After correction, assert VOC-006 completed only for F2-I03, implementation not
required, authority exercised/exhausted, and no later authority.

## VOC-010-TEST-05 — Abandoned-candidate exclusion

Inspect every PR #24/candidate reference. Expected: closed-unmerged provenance only.

## VOC-010-TEST-06 — Application preservation

Compare exact base/head outside authorized specs paths. Expected: zero changes.

## VOC-010-TEST-07 — Stale-claim search

Search VOC-006/index records for active issue #19, pending implementation, null PR,
required implementation, or active authority. Expected: no current stale claim after
correction; historical statements remain time-bounded.

## VOC-010-TEST-08 — Path and protected exclusion

Compare changed files with each stage allowlist and assert zero diff for governance
authority, DOC-15/16/17/18, amendments, workflows, apps, packages, infrastructure,
deployment, secrets, manifests, lockfiles, and activation state.

## VOC-010-TEST-09 — Activation invariants

Verify transition-state byte identity and RL1/RL2 activation false,
automatic/autonomous merge false, production deployment disabled, and autonomous
production release disabled.

## VOC-010-TEST-10 — Deterministic checks

Run:

```bash
python3 -B -m unittest discover -s tooling/governance/tests -p 'test_*.py' -v
python3 -B tooling/governance/validate_repository_foundation.py --repository-root .
bash -n scripts/governance/validate-governance.sh
bash -n scripts/governance/classify-change-risk.sh
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh --base BASE_SHA --head HEAD_SHA
git diff --check BASE_SHA...HEAD_SHA
```

Parse YAML/frontmatter and validate local Markdown links. Expected: all applicable
checks pass, classifier floor is R3, and no inapplicable application pass is claimed.

## VOC-010-TEST-11 — Reverse application

Reverse the exact diff in a scratch checkout and compare its tree to the exact base.
Expected: clean reverse application and identical base tree.

## VOC-010-TEST-12 — Exact-SHA verification

Independently verify identity, diff, evidence, risk, hosted checks, separation, and
rollback. Expected: no blocking finding; material changes require a new report.

## VOC-010-TEST-13 — PR and closure state

Verify candidates remain unmerged until human action, Codex has not approved, issue
#39 stays open through final sync, and no deployment occurs.

## Failure rules

Any evidence mismatch, event conflation, PR #24 adoption claim, excluded-path change,
later-F2 authority, activation change, under-classification, failed applicable check,
blocking finding, or premature closure blocks the stage.
