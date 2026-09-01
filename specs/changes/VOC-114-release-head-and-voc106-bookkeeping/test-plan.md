# VOC-114 — Test Plan

## VOC-114-TEST-00 — Intake, adoption evidence, and stale-state inventory

- Covers: `VOC-114-AC-00`
- Procedure: inspect issue #213, the recorded auto-delete setting, all VOC-106 approval
  fields/blockers/task statuses, and the exact plan lifecycle fields.
- Expected: contradiction reproduces; adopted evidence is preserved; only stale
  pre-adoption/bookkeeping state is selected for correction.
- Evidence: `VOC-114-EV-00`

## VOC-114-TEST-01 — Exact disposable release-head positive proof

- Covers: `VOC-114-AC-01`
- Procedure: in a local ref-free fixture, select frozen develop/main SHAs and verify
  proposed head name prefix, head SHA = develop SHA, head tree = develop tree, PR base
  = main, merge base/divergence/compare, zero extra head commits, and recreation syntax.
- Expected: an exact short-lived alias of the frozen candidate passes without a push.
- Evidence: `VOC-114-EV-01`

## VOC-114-TEST-02 — Fail-closed topology and invalidation matrix

- Covers: `VOC-114-AC-01`, `VOC-114-AC-02`
- Procedure: independently substitute permanent develop/main as head; wrong base;
  stale develop/main; head SHA/tree mismatch; extra commit; wrong prefix; moved PR
  metadata; changed check/review; missing recovery record; and force update of a
  permanent ref. Audit the stated response to each mutation.
- Expected: every mutation invalidates/stops; only the disposable head may refresh
  with force-with-lease and then requires fresh complete evidence.
- Evidence: `VOC-114-EV-02`

## VOC-114-TEST-03 — Protected-history and actor-boundary regression

- Covers: `VOC-114-AC-02`
- Procedure: trace both VOC-106 PRs through source/base, merge-commit, exact checks,
  R4/specialist reviews, non-author merger, sync construction, branch recovery,
  main-ancestor-of-develop, and zero-behind requirements.
- Expected: no evidence, authority, invalidation, synchronization, or rollback control
  is weakened; no actor self-reviews/approves/merges.
- Evidence: `VOC-114-EV-03`

## VOC-114-TEST-04 — Exact paths and current-surface consistency

- Covers: `VOC-114-AC-03`
- Procedure: require exactly the 15 declared paths; search current non-archived docs
  and VOC-106 artifacts for direct permanent-develop release-head instructions;
  classify historical occurrences; run governance, risk, diff, format, link/reference,
  and hosted required checks.
- Expected: all current instructions agree, historical evidence remains intact, and
  every deterministic check passes.
- Evidence: `VOC-114-EV-04`

## VOC-114-TEST-05 — Exact review and rollback rehearsal

- Covers: `VOC-114-AC-04`
- Procedure: bind specialist and independent R4 reviews to the final exact SHA; verify
  zero blockers and non-author merger; in a disposable worktree reverse the exact diff
  against its true first parent and rerun governance/risk/diff checks.
- Expected: exact reviews PASS; reverse restores the parent tree with no residue;
  actual merge uses a separate actor.
- Evidence: `VOC-114-EV-05`

## VOC-114-TEST-06 — DOC-15 section 24.18 monitoring

- Covers: `VOC-114-AC-04`
- Procedure: monitor exact correction-merge hosted/readback results, then the first
  corrected VOC-106 promotion/sync binders and post-action refs/branch list.
- Expected: both permanent branches remain; only merged short-lived heads are deletion
  targets; final ancestry and zero-behind proofs pass; failure stops and is recorded.
- Evidence: `VOC-114-EV-06`

## Commands

- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- `git diff --name-only <implementation-base>...HEAD`
- `rg` current-surface consistency audit
- `git rev-parse`, `git merge-base`, `git rev-list`, and tree equality in local fixtures
- repository-owned format/link/reference commands discovered from committed scripts

No test pushes or deletes a ref, queries or changes settings, reads a secret, runs
Wrangler, dispatches, deploys, migrates, accesses live data, changes traffic/DNS,
spends, or launches.

## Evidence definitions

- `VOC-114-EV-00`: issue, setting-record, adopted-evidence, and stale-field inventory.
- `VOC-114-EV-01`: exact allowed disposable-head topology proof.
- `VOC-114-EV-02`: one-mutation-at-a-time invalidation matrix.
- `VOC-114-EV-03`: two-PR controls and actor/authority traceability audit.
- `VOC-114-EV-04`: exact paths, surface inventory, and deterministic/hosted results.
- `VOC-114-EV-05`: exact reviewer verdicts, merge actor, and rollback rehearsal.
- `VOC-114-EV-06`: bounded postmerge and first-use monitoring record.
