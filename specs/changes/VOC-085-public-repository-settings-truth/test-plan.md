# VOC-085 — Test Plan

## VOC-085-TEST-00 — Current-state record contract

- Covers: `VOC-085-AC-00`
- Preconditions: adopted package and read-only issue evidence
- Procedure: parse the current-state record; require repository identity, observation
  date/source, all specified fields, exact booleans/enums, and the no-mutation boundary;
  compare it with issue #119 and confirm VOC-080 historical files are unchanged.
- Expected result: exact current public snapshot passes; secrets, placeholders,
  omissions, history rewrites, and live-state claims fail.
- Evidence: `VOC-085-EV-00`

## VOC-085-TEST-01 — Active guidance reconciliation

- Covers: `VOC-085-AC-01`, `VOC-085-AC-02`
- Preconditions: T00 record
- Procedure: inventory active references to private plan, branch protection, rulesets,
  Dependabot, and secret scanning; inspect each affected document for current,
  historical, and prospective markers and links.
- Expected result: no stale private-current claim remains; configured, absent/disabled,
  historical, and held states are distinguishable.
- Evidence: `VOC-085-EV-01`, `VOC-085-EV-02`

## VOC-085-TEST-02 — Future-control boundary

- Covers: `VOC-085-AC-02`
- Preconditions: reconciled active documents
- Procedure: semantic scan for claims that this package enabled rulesets, protected
  branches, security settings, environment approvals, deployment, or release gates.
- Expected result: only prospective/held descriptions remain for unconfigured controls.
- Evidence: `VOC-085-EV-02`

## VOC-085-TEST-03 — Positive static guard

- Covers: `VOC-085-AC-03`
- Preconditions: T00/T01 tree
- Procedure: run the validator directly and through the foundation aggregate without
  network, credentials, GitHub CLI, or background processes.
- Expected result: the reconciled tree passes deterministically.
- Evidence: `VOC-085-EV-03`

## VOC-085-TEST-04 — Negative static fixtures

- Covers: `VOC-085-AC-03`
- Preconditions: isolated temporary fixture copies
- Procedure: remove current fields, reintroduce a private-current claim, mark a held
  control active, conflate historical VOC-080 state with current state, and add a
  settings-mutation/live-action claim.
- Expected result: each fixture fails with a concrete reason; explicitly labelled
  historical/prospective text remains accepted.
- Evidence: `VOC-085-EV-03`

## VOC-085-TEST-05 — Governance and prohibited-scope scan

- Covers: `VOC-085-AC-04`
- Preconditions: exact final candidate
- Procedure: run governance validation, risk classification, relevant foundation and
  unit checks, `pnpm validate` as applicable, audit as applicable, and `git diff --check`;
  inspect changed paths and repository settings API activity.
- Expected result: R4 floor is declared, docs are internally consistent, and no
  settings, environment, live, secret, deployment, `main`, or branch deletion action
  exists.
- Evidence: `VOC-085-EV-04`

## VOC-085-TEST-06 — Exact review, hosted proof, rollback, and closure gate

- Covers: `VOC-085-AC-04`
- Preconditions: completed builder evidence
- Procedure: reverse-revert tasks in a disposable worktree, verify exact predecessor
  trees, obtain different-actor exact-SHA review without redundant long suites, monitor
  applicable hosted checks, then verify post-merge checks before any issue closure.
- Expected result: rollback and tree equality pass; reviewer PASS has zero blockers;
  hosted checks pass; no deployment runs; #119 remains open until post-merge proof.
- Evidence: `VOC-085-EV-04`
