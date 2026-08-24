# VOC-090 — Test Plan

## VOC-090-TEST-00 — Active-surface inventory and semantic consistency

- Covers: `VOC-090-AC-00` through `VOC-090-AC-04`, `VOC-090-AC-07`
- Procedure: inventory all active occurrences of fixed line thresholds, task sizing,
  task branches, one coherent objective, artificial splitting, reviewability, PR
  count, mandatory/recommended PR sequences, largest-safe-coherent-unit wording, and
  multi-PR rationale across the declared files, including DOC-12 section 5 and DOC-09
  section 24. Classify each occurrence as reconcile-active, present-compatible, or
  explicitly historical-preserve. Compare the final wording against every
  `VOC-090-D00` through `D14` decision.
- Expected: all declared active surfaces express one compatible contract, historical
  evidence is not rewritten, DOC-12/DOC-09 express one aligned ordered-component
  contract, and no affected active surface is omitted.
- Evidence: `VOC-090-EV-00`

## VOC-090-TEST-01 — Delivery-shape decision fixtures

- Covers: `VOC-090-AC-00` through `VOC-090-AC-03`, `VOC-090-AC-07`
- Procedure: apply the guidance to synthetic plans for (a) one coherent cross-component
  feature with code/tests/docs, (b) two independently releasable rollback-safe outcomes,
  (c) a material action-authority boundary, (d) a hard dependency with an incoherent
  partial state, (e) incompatible specialist ownership, (f) a large but organized
  coherent diff, (g) a small diff containing unrelated cleanup, and (h) the same
  six-item P3/AI dependency sequence expressed as components versus pre-assigned PRs.
- Expected: (a), (d), and (f) default to one package/PR unless another documented
  boundary exists; (b), (c), and (e) may justify multiple PRs with complete rationale;
  (g) separates unrelated work regardless of size; and (h) remains one coherent PR
  unless a future adopted package proves D03–D05.
- Evidence: `VOC-090-EV-01`

## VOC-090-TEST-02 — Template and PR contract

- Covers: `VOC-090-AC-01`, `VOC-090-AC-02`, `VOC-090-AC-04`
- Procedure: fill the active package and PR templates for (a) one PR with one task,
  (b) one PR with several evidence-grouping tasks, and (c) multiple PRs. Inspect planned
  count, task mapping, concrete boundary, partial-state coherence, integration/rollback,
  overhead comparison, and all unchanged risk/review/authority fields.
- Expected: (a) and (b) are valid without placeholder split rationale; (c) fails until
  its non-placeholder rationale is complete; no shape bypasses existing controls.
- Evidence: `VOC-090-EV-02`

## VOC-090-TEST-03 — Positive guard and negative regressions

- Covers: `VOC-090-AC-00`, `VOC-090-AC-05`, `VOC-090-AC-07`
- Procedure: run the foundation validator directly and its unit tests, then mutate
  isolated temporary repository copies to: restore `100–500`/`over 800` mandates;
  remove the largest-safe-coherent-unit or one-package/one-PR default; state or imply
  that each task ID owns a PR; remove required multiple-PR rationale/overhead markers;
  restore an active `Mandatory six-PR order` or `Recommended PR sequence` without a
  complete D03–D05 rationale; make DOC-12/DOC-09 disagree; and retain an explicitly
  labelled historical task/stacked-PR example.
- Expected: canonical state and the historical example pass; every active-policy
  regression fails with a concrete deterministic reason. The guard uses no network,
  credential, GitHub API, background process, semantic risk decision, or external state.
- Evidence: `VOC-090-EV-03`

## VOC-090-TEST-04 — Local governance validation and excluded-surface proof

- Covers: `VOC-090-AC-04`, `VOC-090-AC-06`, `VOC-090-AC-07`
- Procedure: from the exact implementation branch and adopted base, run:

  ```bash
  python3 -m unittest discover -s tooling/governance/tests -p 'test_validate_repository_foundation.py'
  pnpm exec prettier --check AGENTS.md CLAUDE.md CONTRIBUTING.md .github/pull_request_template.md docs/governance/16-autonomous-development-operating-model.md docs/governance/change-risk-classification.md docs/operations/10-development-workflow.md docs/operations/15-ai-native-product-and-engineering-operating-model.md docs/operations/ruflo-external-orchestration.md docs/product/12-mvp-implementation-plan.md docs/engineering/09-ai-features.md docs/templates/change-specification.md specs/README.md specs/templates/change-package
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh --base <adopted-base> --head HEAD
  git diff --check <adopted-base> HEAD
  ```

  Inspect `git diff --name-only <adopted-base> HEAD` and hashes/diffs for
  `.github/workflows/`, `scripts/governance/classify-change-risk.sh`,
  `tooling/governance/merge-eligibility/`, application/runtime paths, and repository
  settings records.

- Expected: all applicable commands pass; classifier reports R4 and is not weakened;
  only declared paths change; executable workflows/evaluators/classifiers and external
  state remain untouched. Unavailable checks are reported, never represented as pass.
- Evidence: `VOC-090-EV-03`, `VOC-090-EV-04`

## VOC-090-TEST-05 — Exact review, rollback, hosted proof, and closure gate

- Covers: `VOC-090-AC-04`, `VOC-090-AC-06`, `VOC-090-AC-07`
- Procedure: in a disposable worktree, revert the exact implementation revision
  without committing and compare every authorized path with the adopted base. Remove
  only that disposable worktree. Obtain a different non-author exact-SHA independent
  review and a different non-author governance/delivery-workflow specialist verdict;
  monitor applicable hosted checks; after normal merge, wait for applicable post-merge
  checks before issue closure.
- Expected: rollback tree equality passes; complete R4 evidence has no unresolved
  blocker; hosted qualification and post-merge checks pass; issue #143 closes only
  afterward. No external/live/settings/deployment action occurs.
- Evidence: `VOC-090-EV-04`

## Test strategy rationale

The risk is policy drift, not runtime behavior. Extending the existing network-free
foundation validator gives deterministic coverage inside the current Governance path
without adding a workflow or dependency. Semantic fixtures and exact specialist review
cover judgments that static markers cannot safely decide. Full application validation
is not required because no application/package/runtime file is authorized; if the
implementation expands into such a path, it must return to planning and add the
applicable installed validation.
