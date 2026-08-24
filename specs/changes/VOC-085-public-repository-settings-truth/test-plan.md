# VOC-085 — Test Plan

## VOC-085-TEST-00 — Current-as-observed-at-2026-08-24 record contract

- Covers: `VOC-085-AC-00`
- Preconditions: adopted package and read-only issue evidence
- Procedure: parse the current-as-observed-at-2026-08-24 record; require repository identity, exact
  `observed_at`/`as_of` date, the read-only REST endpoints and security-settings
  schema surface, source/API endpoint interpretation, dependency/vulnerability-alert
  status separate from Dependabot security-update status, all specified fields,
  point-in-time freshness/staleness semantics, and the no-mutation boundary; compare
  it with issue #119 plus any fresh read-only dependency-alert evidence and confirm
  VOC-080 historical files are unchanged.
- Expected result: the public snapshot passes as current as observed at 2026-08-24;
  secrets, placeholders, omissions, history rewrites, unqualified live-current
  claims, and missing staleness semantics fail. The validator's result explicitly
  states that internal consistency is proven, not live freshness.
- Evidence: `VOC-085-EV-00`

## VOC-085-TEST-01 — Active guidance reconciliation

- Covers: `VOC-085-AC-01`, `VOC-085-AC-02`
- Preconditions: T00 record
- Procedure: inventory active references to private plan, branch protection, rulesets,
  dependency/vulnerability alerts, Dependabot security updates, and secret scanning;
  inspect each affected document for “current as observed at 2026-08-24”, historical,
  prospective, and hold markers and links.
- Expected result: no stale private-current claim remains; configured, absent/disabled,
  historical, and held states are distinguishable. Enabled dependency/vulnerability
  alerts are not described as merely future or held. A future mutation requires an
  immediate governed doc-only follow-up.
- Evidence: `VOC-085-EV-01`, `VOC-085-EV-02`

## VOC-085-TEST-02 — Future-control boundary

- Covers: `VOC-085-AC-02`
- Preconditions: reconciled active documents
- Procedure: semantic scan for claims that this package enabled rulesets, protected
  branches, Dependabot security updates, secret scanning, environment approvals,
  deployment, or release gates; verify it does not group enabled dependency/
  vulnerability alerts with held disabled controls; verify VOC-085-HOLD-00's action,
  accountable operator, separate authority, evidence, completion, expiry, and
  non-blocking repository-merge semantics.
- Expected result: only prospective/held descriptions remain for unconfigured controls;
  the settings hold is formal and distinct from VOC-080 Cloudflare holds.
- Evidence: `VOC-085-EV-02`

## VOC-085-TEST-03 — Positive static guard

- Covers: `VOC-085-AC-03`
- Preconditions: T00/T01 tree
- Procedure: run the validator directly and through the foundation aggregate without
  network, credentials, GitHub CLI, or background processes.
- Expected result: the reconciled tree passes deterministically; evidence says the
  guard proves internal consistency only and cannot prove live freshness.
- Evidence: `VOC-085-EV-03`

## VOC-085-TEST-04 — Negative static fixtures

- Covers: `VOC-085-AC-03`
- Preconditions: isolated temporary fixture copies
- Procedure: remove current/as-of/freshness fields, reintroduce a private-current
  claim, mark a held control active, mark enabled dependency/vulnerability alerts as
  merely prospective, conflate historical VOC-080 state with current state, and add a
  settings-mutation/live-action claim.
- Expected result: each fixture fails with a concrete reason; explicitly labelled
  historical/prospective text remains accepted; no fixture treats the guard as a live
  freshness check.
- Evidence: `VOC-085-EV-03`

## VOC-085-TEST-05 — Governance and prohibited-scope scan

- Covers: `VOC-085-AC-04`
- Preconditions: exact T03 candidate based on merged T02 `8dd45f50b3a8be120aee29485349bdedd5a6d3ca`
- Procedure: run governance validation, risk classification, relevant foundation and
  unit checks, `pnpm validate` as applicable, audit as applicable, and `git diff --check`;
  inspect changed paths and repository settings API activity.
- Expected result: R4 floor is declared, specialist evidence is required but remains
  pending until exact review, dependency/vulnerability alerts are separated from
  Dependabot security updates and secret scanning, docs are internally consistent, and
  no settings, environment, live, secret, deployment, branch-protection/ruleset, `main`,
  or branch deletion action exists. Normal isolated branches and governed PR merges
  remain permitted.
- Evidence: `VOC-085-EV-04` (`t03-evidence.yaml`)

## VOC-085-TEST-06 — Exact review, hosted proof, rollback, and closure gate

- Covers: `VOC-085-AC-04`
- Preconditions: completed T00–T02 evidence and T03 builder evidence
- Procedure: reverse-revert tasks in a disposable worktree, verify exact predecessor
  trees, obtain different-actor exact-SHA general review and distinct settings-
  specialist review without redundant long suites, monitor applicable hosted checks,
  then verify post-merge checks before any issue closure.
- Expected result: reverse rollback and tree equality pass; T03 then receives both
  exact-SHA reviews with zero blockers and applicable hosted proof. No deployment runs;
  #119 remains open until merge plus post-merge proof; VOC-085-HOLD-00 remains held.
- Evidence: `VOC-085-EV-04` (`t03-evidence.yaml`)
