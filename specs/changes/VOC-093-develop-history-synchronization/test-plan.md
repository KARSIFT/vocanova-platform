# VOC-093 — Test Plan

## VOC-093-TEST-00 — Package shape and R4 evidence contract

- Covers: `VOC-093-AC-00`
- Procedure: validate one-task/one-implementation-PR metadata, exact-SHA review
  binding, merge-commit requirement, no false automatic-merge claim, and no
  unauthorized split rationale.
- Expected: package remains one coherent unit with complete review/evidence
  requirements and no merge executor claim.
- Evidence: `VOC-093-EV-00`

## VOC-093-TEST-01 — Current main ancestry is preserved back into develop

- Covers: `VOC-093-AC-01`
- Procedure: record exact pre-merge SHAs, branch creation point, and the merge of
  current `main` into the sync branch; inspect the PR head graph; verify the final PR
  merges with a merge commit; re-run merge-base, left/right-count, and compare checks
  after merge.
- Expected: `main` is an ancestor of `develop`, `develop` is behind `main` by `0`,
  `main` is unchanged, and the PR head was not `main`.
- Evidence: `VOC-093-EV-01`

## VOC-093-TEST-02 — Living docs and deterministic guard fail closed together

- Covers: `VOC-093-AC-02`, `VOC-093-AC-03`
- Procedure: inspect the four declared living surfaces and the new policy/test. Run
  governance validation, changed-path classification, the new guard/test, and the
  applicable foundation suite. Negative fixtures must fail for: missing sync-boundary
  language, a claim that release promotion alone finalizes branches, a claim that the
  sync step mutates settings, and a claim that it deploys or touches Cloudflare.
- Expected: current living guidance requires the post-promotion sync loop, and the
  deterministic guard/test fails on omission or live-action conflation.
- Evidence: `VOC-093-EV-02`

## VOC-093-TEST-03 — Existing recovery state remains untouched

- Covers: `VOC-093-AC-04`
- Procedure: record the dirty VOC-090 worktree/branch and other known retained
  recovery exceptions before and after implementation. Confirm no branch deletion,
  worktree removal, or settings mutation occurred.
- Expected: all retained recovery state still exists after merge, and this package
  performs only the adopted `develop` history/doc/guard changes.
- Evidence: `VOC-093-EV-03`

## VOC-093-TEST-04 — Final validation, hosted checks, and rollback proof

- Covers: `VOC-093-AC-00` through `VOC-093-AC-04`
- Procedure: run local governance/diff/applicable foundation checks, inspect hosted
  Governance/Security/path-applicable CI results, attach exact rollback steps, and
  confirm issue closure occurs only after post-merge evidence is attached.
- Expected: checks pass, blockers are zero, rollback is explicit, and the final record
  proves repository-only scope.
- Evidence: `VOC-093-EV-04`
