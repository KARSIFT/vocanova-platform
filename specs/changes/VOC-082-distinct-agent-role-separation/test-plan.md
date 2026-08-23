# VOC-082 Test Plan

## VOC-082-TEST-00 — Active-document inventory and consistency

- Covers: AC-00
- Procedure: inventory active governance, contributor, reviewer, template, decision,
  and runbook surfaces; compare terminology, links, metadata versions, protected paths,
  and amendment history; explicitly classify historical/exception-only files.
- Expected: active policy has one compatible actor/role/provenance contract; historical
  evidence remains unchanged and no affected active surface is omitted.
- Evidence: EV-00.

## VOC-082-TEST-01 — Valid and invalid role examples

- Covers: AC-00, AC-01, AC-02, AC-03
- Procedure: inspect canonical worked examples and synthesize (a) separate AI planner,
  builder, reviewer, and non-author merge actor; (b) same-actor role relabeling; (c) a
  reviewer material edit followed by self-verdict; and (d) human-only or vendor-only
  review wording.
- Expected: (a) is allowed when all ordinary evidence/permission gates pass; (b)-(d)
  are rejected or corrected, and explicit applicable cross-model controls remain.
- Evidence: EV-01.

## VOC-082-TEST-02 — Evidence and authority template audit

- Covers: AC-02, AC-04
- Procedure: fill the PR, change-specification, verification-report, and package
  templates with synthetic non-sensitive actor identities; verify exact SHA, role,
  authorship independence, verdict, blocking findings, optional runtime provenance,
  and action-authority fields cannot be conflated.
- Expected: an AI reviewer is valid; model/provider metadata supplies no authority; a
  passing review cannot clear an unsatisfied external-effect hold.
- Evidence: EV-02.

## VOC-082-TEST-03 — Governance invariant and negative fixtures

- Covers: AC-03, AC-05, AC-06
- Procedure: run the governance Python suite and shell validator, then mutate copied
  fixtures to remove distinct-actor/exact-SHA/self-merge/action-authority markers or add
  human-only/vendor-authority/same-actor wording.
- Expected: canonical state passes and every unsafe mutation fails with a concrete
  reason. Synthetic eligible/blocked R4 decisions and reason codes remain unchanged.
- Evidence: EV-03.

## VOC-082-TEST-04 — Excluded-surface and workflow proof

- Covers: AC-05, AC-07
- Procedure: compare the implementation with its adopted base and verify no diff in
  `evaluator.py`, `github_adapter.py`, `schema-v1.json`, `.github/workflows/`, action
  permissions, package schemas, or application/runtime paths. Run risk classification,
  YAML/JSON parsing, exact four-workflow inventory, and hosted path-applicable checks.
- Expected: only approved docs/templates/foundation-policy/fixture-label paths change;
  four deterministic workflows remain and no write/deploy job runs.
- Evidence: EV-04.

## VOC-082-TEST-05 — Exact-SHA review and rollback

- Covers: AC-07
- Procedure: run `bash scripts/governance/validate-governance.sh`,
  `bash scripts/governance/classify-change-risk.sh`, the governance Python tests,
  `git diff --check`, independent cross-model exact-SHA review, and reverse T01/T00 in
  a disposable worktree with proportional validation after each revert.
- Expected: all applicable checks pass, R4 is not underdeclared, every blocking finding
  is resolved, predecessor trees are exact, and no external/live mutation occurs.
- Evidence: EV-05.

Reviewers receive completed command and hosted evidence. They are explicitly prohibited
from duplicating long-running suites or starting background processes unless a specific
finding requires focused reproduction.
