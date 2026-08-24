# VOC-093 — Test Plan

## VOC-093-TEST-00 — Package shape and R4 evidence contract

- Covers: `VOC-093-AC-00`
- Procedure: validate one-task/one-implementation-PR metadata, exact-SHA review
  binding, merge-commit requirement, no false automatic-merge claim, and no
  unauthorized split rationale.
- Expected: package remains one coherent unit with complete review/evidence
  requirements, truthfully models the current automatic short-lived-source-head
  deletion consequence, and makes no merge executor claim.
- Evidence: `VOC-093-EV-00`

## VOC-093-TEST-01 — Current main ancestry is preserved back into develop

- Covers: `VOC-093-AC-01`
- Procedure: record exact pre-merge SHAs, branch creation point, and the merge of
  current `main` into the sync branch; inspect the PR head graph; verify the final PR
  merges with a merge commit; record the exact source-branch name/tip before merge;
  re-run merge-base, left/right-count, compare checks, and source-branch readback
  after merge.
- Expected: `main` is an ancestor of `develop`, `develop` is behind `main` by `0`,
  `main` is unchanged, the PR head was not `main`, and only the merged short-lived
  source head may be auto-deleted.
- Evidence: `VOC-093-EV-01`

## VOC-093-TEST-02 — Living docs and deterministic guard fail closed together

- Covers: `VOC-093-AC-02`, `VOC-093-AC-03`
- Procedure: inspect the declared living surfaces (`AGENTS.md`, `CONTRIBUTING.md`,
  `.github/README.md`, DOC-16, repository settings, DOC-10 development workflow, and
  current DOC-15 §17.2) plus the new policy/test. Run governance validation,
  changed-path classification, the new guard/test, and the applicable foundation
  suite. Negative fixtures must fail for: missing sync-boundary language, a claim that
  release promotion alone finalizes branches, a claim that the sync step mutates
  settings, a claim that it deploys or touches Cloudflare, and a claim that manual or
  permanent-branch deletion is part of the package.
- Expected: current living guidance requires the post-promotion sync loop, and the
  deterministic guard/test fails on omission or live-action conflation.
- Evidence: `VOC-093-EV-02`

## VOC-093-TEST-03 — Existing recovery state remains untouched

- Covers: `VOC-093-AC-04`
- Procedure: record the dirty VOC-090 worktree/branch and other known retained
  recovery exceptions before and after implementation. Confirm no manual branch
  deletion, no worktree removal, and no settings mutation occurred. If GitHub
  automatically deletes the merged short-lived source head, verify the exact pre-merge
  SHA, readback, and recreate command.
- Expected: all retained recovery state still exists after merge, and this package
  performs only the adopted `develop` history/doc/guard changes; only the merged
  short-lived plan or implementation source head may disappear automatically.
- Evidence: `VOC-093-EV-03`

## VOC-093-TEST-04 — Final validation, hosted checks, and rollback proof

- Covers: `VOC-093-AC-00` through `VOC-093-AC-04`
- Procedure: run local governance/diff/applicable foundation checks, inspect hosted
  Governance/Security/path-applicable CI results, attach exact rollback steps, and
  confirm issue closure occurs only after post-merge evidence is attached.
- Expected: checks pass, blockers are zero, rollback is explicit, and the final record
  proves repository-only scope.
- Evidence: `VOC-093-EV-04`
