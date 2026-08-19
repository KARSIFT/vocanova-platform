# VOC-079 — Test Plan

## VOC-079-TEST-00 — Active-policy semantic inventory

- Covers: `VOC-079-AC-00`, `VOC-079-AC-05`
- Procedure: search active policy, instructions, templates, scripts, and workflows for
  R4, founder approval, founder-controlled, automatic merge, approve, and EHR. Review
  every match rather than accepting a zero-match shortcut.
- Expected: no active rule requires founder approval or forbids automatic merge solely
  because risk is R4; history is clearly non-normative.
- Evidence: `VOC-079-EV-00`

## VOC-079-TEST-01 — Role-separation authorization fixtures

- Covers: `VOC-079-AC-01`, `VOC-079-AC-03`
- Positive: different builder and reviewer identities, exact reviewed SHA, passing
  verdict, and no blocking findings.
- Negative: same-role review, missing identity, stale SHA, missing verdict, FAIL, and
  unresolved blocking finding.
- Expected: only the positive fixture passes, regardless of human/agent vendor.
- Evidence: `VOC-079-EV-01`

## VOC-079-TEST-02 — Eligible R4 fixture

- Covers: `VOC-079-AC-02`
- Fixture: parseable `risk: R4`, `automatic_merge_allowed: true`, complete decision and
  impact records, required R4/specialist evidence, green deterministic checks, exact-SHA
  independent PASS, no EHR, and no external-effect hold.
- Expected: the local read-only evaluator reports eligible; no founder token, identity,
  review, or comment is required by the risk class. The test also proves the evaluator
  has no GitHub write or merge path. An adapter fixture and a representative pull
  request produce the same decision in the Governance job summary/check result.
- Evidence: `VOC-079-EV-02`

## VOC-079-TEST-03 — Fail-closed R4 matrix

- Covers: `VOC-079-AC-02`, `VOC-079-AC-03`
- Independently remove or fail each required condition: CI, risk evidence, decision
  record, contingency, independent review, exact SHA, blocking-findings resolution,
  EHR clearance, package merge permission, parseable risk, and an action-specific gate.
- Expected: every negative fixture is reported blocked for its concrete missing
  condition. A fixture differing from the positive case only by `risk: R4` does not
  block. The pure evaluator performs no external action in any case. Adapter tests
  reject untrusted-shell interpolation, stale/mismatched GitHub state, and any attempted
  API write; workflow-permission assertions allow only contents/checks/pull-request read.
- Evidence: `VOC-079-EV-03`

## VOC-079-TEST-04 — Package drafting matrix

- Covers: `VOC-079-AC-04`
- Test R0, R1, R2, R3, and R4 packages with `true`; each passes when otherwise valid.
  Test `false` with and without a package-local rationale; only the reasoned hold passes.
  Test VOC-079's explicit transition exception.
- Expected: guidance and executable validation agree across every class.
- Evidence: `VOC-079-EV-04`

## VOC-079-TEST-05 — Cross-document and called-workflow reconciliation

- Covers: `VOC-079-AC-00`, `VOC-079-AC-05`
- Procedure: compare canonical docs, AGENTS.md, CONTRIBUTING.md, templates, repository-
  settings guidance, validation scripts, and every active/called workflow. Confirm no
  external reusable workflow reintroduces the old hard block. Confirm DOC-16's amendment
  history and the dedicated decision record identify the transition revision. Confirm
  DOC-16's orchestrator-originated path contains no `not R4` exclusion and relies on the
  universal evidence contract.
- Expected: all active layers implement the same rule and governance validation passes.
- Evidence: `VOC-079-EV-05`

## VOC-079-TEST-06 — Repository-only rollback rehearsal

- Covers: `VOC-079-AC-06`
- Procedure: in a disposable worktree, revert the implementation commits in reverse
  order and rerun governance validation and diff checks. Inspect the diff for runtime,
  infrastructure, secret, deployment, and settings changes.
- Expected: old policy is restored consistently; no live-system mutation occurred.
- Evidence: `VOC-079-EV-06`

## Required commands

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
pnpm validate
git diff --check
```
