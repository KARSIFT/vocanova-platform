# VOC-115 — Test Plan

## VOC-115-TEST-00 — Intake, authority, and impact inventory

- Covers: `VOC-115-AC-00`
- Procedure: inspect issue #216, the exact PR #215 specialist FAIL, adopted VOC-106
  and VOC-114, DOC-15/DOC-16, all current release surfaces, historical exclusions,
  and plan lifecycle fields.
- Expected: dead-end reproduces; PR #215 remains draft; exactly seven living plus
  nine VOC-106 plus nine VOC-114 implementation paths are required; no intake record
  is treated as authority.
- Evidence: `VOC-115-EV-00`

## VOC-115-TEST-01 — Identity grammar and deterministic allocation

- Covers: `VOC-115-AC-01`
- Procedure: in a temporary, network-free data fixture, supply full frozen SHAs and
  sequences from current remote-ref, all-state PR-head, and recorded-binder lists.
  Parse only exact canonical grammar and choose one plus the numeric union maximum.
- Positive cases: empty inventory -> 1; each individual source supplies maximum;
  duplicate sequence across sources; deleted-head PR retained; changed develop with
  global next sequence; large numeric sequence without lexical-sort error.
- Negative cases: short/mixed-case/wrong SHA; zero, negative, signed, decimal-point,
  leading-zero, empty, or nonnumeric sequence; stale/partial source inventory; lexical
  instead of numeric maximum; overflow/unsafe integer; name/SHA/tree mismatch.
- Expected: only one exact, unambiguous, collision-free next identity passes.
- Evidence: `VOC-115-EV-01`

## VOC-115-TEST-02 — Atomic creation and collision matrix

- Covers: `VOC-115-AC-01`, `VOC-115-AC-02`
- Procedure: simulate create-if-absent responses without contacting GitHub or moving
  refs. Exercise absent success/readback and current, stale, historical-PR, foreign,
  same-SHA, and concurrent-create collisions.
- Expected: successful atomic creation/readback starts an attempt. Every collision
  reserves the name, performs no adoption/update/delete, refreshes all inputs, and
  selects a higher sequence. Update-ref, ordinary ambiguous push, force, force-with-
  lease, deletion, or treating failed allocation as an attempt is rejected.
- Evidence: `VOC-115-EV-02`

## VOC-115-TEST-03 — Ownership, invalidation, same-develop retry, and recovery

- Covers: `VOC-115-AC-02`, `VOC-115-AC-03`
- Procedure: build attempt N at frozen develop D with a complete tuple; invalidate one
  binder input; close the simulated draft PR and retain N unchanged; freeze unchanged
  D and allocate/create N+1 with all-new evidence. Separately test exact interrupted
  continuation and actor handoff.
- Positive cases: exact same-attempt resume without ref creation/update; recorded
  handoff with tuple equality; same-D N -> N+1 retry; changed-D next attempt; recorded
  nonexecuted recreation request after simulated successful auto-deletion.
- Negative cases: missing/conflicting tuple field, actor change without handoff,
  changed SHA/tree/PR base/head/check/review, reuse/adoption of N, mutation/deletion of
  active or abandoned ref, auto-delete eligibility before successful merge,
  unexpected absence/movement, or recreation represented as a new attempt.
- Expected: retry always progresses without changing the earlier attempt; ambiguity
  stops and preserves evidence.
- Evidence: `VOC-115-EV-03`

## VOC-115-TEST-04 — Protected-history topology regression

- Covers: `VOC-115-AC-03`
- Procedure: in a disposable local repository with no remote mutation, prove frozen
  main is merge base, main-only count is zero, attempt/develop SHA and tree match, no
  extra head/compare content exists, and prospective/actual release merge tree equals
  frozen develop. Trace separate review/merge actors, synchronization, permanent refs,
  main ancestry, zero-behind, and recreation evidence.
- Negative cases: permanent/wrong head, stale/diverged refs, non-main merge base,
  nonzero main-only, extra commit/tree, prospective/actual tree mismatch, moved PR or
  evidence, missing review/authority, permanent-head deletion exposure, incomplete
  sync, missing ancestry/behind, and prohibited action.
- Expected: existing topology remains exact; one changed invariant fails closed.
- Evidence: `VOC-115-EV-04`

## VOC-115-TEST-05 — Exact 25-path and current-surface consistency

- Covers: `VOC-115-AC-00`, `VOC-115-AC-04`
- Procedure: compare expected and actual changed paths/OIDs; search non-archived
  current text for SHA-only attempt names, same-attempt collision exceptions, unsafe
  reuse/update/delete, incomplete ownership/allocation, or another living release
  surface. Confirm all 18 adopted-package artifacts preserve their approval evidence.
- Expected: exactly 25 paths; all current surfaces use one contract; historical
  evidence is classified and unchanged; no application/workflow/settings/ref action.
- Evidence: `VOC-115-EV-05`

## VOC-115-TEST-06 — Validation, exact review, and rollback

- Covers: `VOC-115-AC-04`
- Procedure: run governance, changed-path risk, diff, repository-owned format/link/
  reference, focused semantic/topology, and hosted required checks. Bind a release-
  governance/git-history specialist and a different independent cross-model R4 review
  to the final exact SHA. In a disposable worktree reverse the complete 25-path diff
  against PR #215's actual first parent and rerun applicable checks.
- Expected: all checks and both reviews PASS with zero blockers; a separate non-author
  merge actor is recorded; rollback restores the exact parent tree without residue.
- Evidence: `VOC-115-EV-06`

## VOC-115-TEST-07 — DOC-15 section 24.18 monitoring

- Covers: `VOC-115-AC-05`
- Procedure: the adoption-recorded owner observes exact correction merge-SHA hosted
  checks and fresh develop readback, then first corrected VOC-106 promotion/sync.
  Always retain the same-develop synthetic retry result. If a real same-develop
  invalidation occurs, record old N ref immutability, new N+1 identity, fresh checks/
  reviews, successful merge tree, permanent refs, final ancestry, and zero-behind.
- Expected: no recurrence, collision reuse, mutation, disappearance, or ambiguity;
  every required signal passes before issues #216/#213/#191 close. Failure stops and
  routes governed remediation or reviewed integrated revert.
- Evidence: `VOC-115-EV-07`

## Commands

- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- `git diff --name-only <implementation-base>...HEAD`
- `git rev-parse`, `git merge-base`, `git rev-list`, `git merge-tree`, and tree/OID
  equality in disposable fixtures
- `rg` current-surface and historical-classification audit
- repository-owned format/link/reference commands discovered from committed scripts

No test calls the GitHub ref or settings APIs, pushes, updates, force-updates, or
deletes a ref; dispatches, deploys, invokes Wrangler, reads a secret, accesses data,
migrates, changes traffic/DNS, spends, or launches.

## Evidence definitions

- `VOC-115-EV-00`: issue/review reproduction, authority state, and exact impact audit.
- `VOC-115-EV-01`: identity grammar and three-source numeric allocation matrix.
- `VOC-115-EV-02`: atomic create/collision simulation and prohibited-operation audit.
- `VOC-115-EV-03`: ownership/handoff, invalidation, same-D retry, and recovery matrix.
- `VOC-115-EV-04`: positive/negative release topology and actor/authority evidence.
- `VOC-115-EV-05`: exact 25-path/OID/current-surface/adoption-preservation audit.
- `VOC-115-EV-06`: local/hosted checks, exact reviews, rollback, and merge evidence.
- `VOC-115-EV-07`: bounded postmerge/first-use monitoring and issue disposition.
