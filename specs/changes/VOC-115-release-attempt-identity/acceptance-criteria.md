# VOC-115 — Acceptance Criteria

## VOC-115-AC-00 — Intake, authority, and exact scope are truthful

- Requirements: `VOC-115-D00`, `VOC-115-D08`, `VOC-115-D12`
- Tests: `VOC-115-TEST-00`, `VOC-115-TEST-05`
- Evidence: `VOC-115-EV-00`, `VOC-115-EV-05`
- Result: pending

The package binds issue #216 and the exact PR #215 specialist FAIL without treating
them as authority. PR #215 remains draft. The implementation changes exactly the 25
declared current paths and no historical package, application, workflow, setting,
branch, release, or live-system state.

## VOC-115-AC-01 — Every attempt has an exact collision-free identity

- Requirements: `VOC-115-D01`–`D03`
- Tests: `VOC-115-TEST-01`, `VOC-115-TEST-02`
- Evidence: `VOC-115-EV-01`, `VOC-115-EV-02`
- Result: pending

Positive fixtures prove the full frozen develop SHA and canonical sequence grammar,
complete multi-source inventory, numeric next-sequence selection, atomic create-if-
absent behavior, exact SHA/tree readback, and safe progress after a collision.
Malformed or ambiguous names, stale inventories, non-atomic creation, and any
adoption/update/force/deletion path fail closed.

## VOC-115-AC-02 — Same-develop retry preserves every immutable ref

- Requirements: `VOC-115-D04`–`D06`
- Tests: `VOC-115-TEST-02`, `VOC-115-TEST-03`
- Evidence: `VOC-115-EV-02`, `VOC-115-EV-03`
- Result: pending

In the required synthetic topology, attempt N is invalidated and retained at frozen
develop D; a complete fresh attempt at unchanged D receives N+1, a distinct ref/PR/
binder, and no prior ref mutation. Exact same-attempt continuation passes only with
the complete tuple/handoff. Foreign, stale, partial, moved, missing, reused, or deleted
ownership/ref states fail.

## VOC-115-AC-03 — Release topology and recovery remain exact

- Requirements: `VOC-115-D06`, `VOC-115-D07`, `VOC-115-D09`
- Tests: `VOC-115-TEST-03`, `VOC-115-TEST-04`
- Evidence: `VOC-115-EV-03`, `VOC-115-EV-04`
- Result: pending

Positive evidence proves frozen topology, prospective/actual merge-tree equality,
two reviewed merge-commit PRs, synchronization, final ancestry/zero-behind, and
nonexecuted atomic recreation syntax for successfully merged auto-deleted heads.
Every one-mutation topology, tree, drift, deletion-eligibility, or recovery gap stops.

## VOC-115-AC-04 — All 25 current surfaces agree and exact reviews pass

- Requirements: `VOC-115-D08`–`D10`
- Tests: `VOC-115-TEST-05`, `VOC-115-TEST-06`
- Evidence: `VOC-115-EV-05`, `VOC-115-EV-06`
- Result: pending

All seven living guides, nine VOC-106 artifacts, and nine VOC-114 artifacts express
one exact contract. Governance, R4/path, diff, links/references, hosted checks,
rollback rehearsal, exact specialist review, and different independent cross-model
R4 review pass with zero blockers; a separate non-author merges.

## VOC-115-AC-05 — Workflow monitoring closes without recurrence

- Requirements: `VOC-115-D11`
- Tests: `VOC-115-TEST-07`
- Evidence: `VOC-115-EV-07`
- Result: pending

DOC-15 §24.18 evidence records reason, expected benefit, risks, evaluation, rollback,
owner, and bounded monitoring. Exact correction postmerge evidence and first corrected
VOC-106 finalization pass. Same-develop retry is always proven synthetically and, if
encountered live, by a greater-sequence immutable-ref readback before closure.
