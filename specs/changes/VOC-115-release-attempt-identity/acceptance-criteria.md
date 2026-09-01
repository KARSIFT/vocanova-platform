# VOC-115 — Acceptance Criteria

## VOC-115-AC-00 — Failed evidence and authority remain truthful

- Requirements: `VOC-115-D00`, `VOC-115-D15`
- Tests: `VOC-115-TEST-00`
- Evidence: `VOC-115-EV-00`
- Result: pending

Both superseded candidate SHAs/trees and all four exact FAIL reviews remain recorded
with no transfer. PR #215 remains draft, and no adoption, review, ref, settings,
release, merge, deployment, or external authority is inferred.

## VOC-115-AC-01 — Durable atomic attempt identity is exact

- Requirements: `VOC-115-D01`–`VOC-115-D04`
- Tests: `VOC-115-TEST-01`, `VOC-115-TEST-02`
- Evidence: `VOC-115-EV-01`, `VOC-115-EV-02`
- Result: pending

The deterministic genesis/PR/conflict claim grammar, lossless numeric/digest domain,
canonical same-tree claim commit, server-enforced create-ref arbiter, immutable accepted
claim identity, attempt SHA/tree binding, state precedence, and globally at-most-one
active attempt pass. Same/different-SHA races have one winner; duplicate PR activation
has terminal conflict recovery.

## VOC-115-AC-02 — History and receipts are exhaustive and reconstructible

- Requirements: `VOC-115-D05`, `VOC-115-D06`
- Tests: `VOC-115-TEST-03`
- Evidence: `VOC-115-EV-03`
- Result: pending

Full all-state PR pagination, every reserved PR timeline, claim commit, and equal
complete ref sets reconstruct genesis/frontier/state. Exact JCS PR/timeline/ref/claim/
reconciliation receipts,
projections, high-watermarks, bindings, and non-self-referential digests reproduce from
GET data. Body/comment edit or deletion fails evidence but cannot erase durable state.

## VOC-115-AC-03 — Every race, crash, collision, and retry is representable

- Requirements: `VOC-115-D07`–`VOC-115-D09`
- Tests: `VOC-115-TEST-04`, `VOC-115-TEST-05`
- Evidence: `VOC-115-EV-04`, `VOC-115-EV-05`
- Result: pending

Every boundary has one exact resume or fail-closed state. Unknown claim/attempt-ref POST
absence and uncertain PR POST are never retried; an accepted claim is one-use forever.
Closed-unmerged PRs durably advance same-develop retry without moving/deleting earlier
refs. Collisions, hostile inputs, or unmatched objects never adopt.

## VOC-115-AC-04 — Actor and release topology controls remain exact

- Requirements: `VOC-115-D10`, `VOC-115-D11`
- Tests: `VOC-115-TEST-06`
- Evidence: `VOC-115-EV-06`
- Result: pending

The `/root` to GitHub login/id/node-id mapping is enforced; current handoff is
unavailable and a future handoff needs adopted mapping plus a durable assignment event.
All merge-base, SHA/tree/compare, prospective/actual merge-tree, two-PR, reviewer/
merger separation, sync, permanent-ref, ancestry, zero-behind, and recovery controls
pass; one mutation stops.

## VOC-115-AC-05 — Exact 27-path implementation is executable and reviewed

- Requirements: `VOC-115-D12`–`VOC-115-D14`
- Tests: `VOC-115-TEST-07`, `VOC-115-TEST-08`
- Evidence: `VOC-115-EV-07`, `VOC-115-EV-08`
- Result: pending

Exactly 27 paths change. The two auto-discovered foundation files enforce the complete
state/reconciliation/receipt/crash matrix. All current surfaces agree, adopted history
is preserved, checks and rollback pass, exact release-history specialist and different
cross-model R4 reviews have zero blockers, and a separate non-author merges.

## VOC-115-AC-06 — Bounded monitoring proves effectiveness

- Requirements: `VOC-115-D15`
- Tests: `VOC-115-TEST-09`
- Evidence: `VOC-115-EV-09`
- Result: pending

DOC-15 §24.18 evidence covers correction postmerge and first VOC-106 finalization.
Synthetic concurrency, unknown-response, deletion, conflict, and same-develop retry
remain passing; a real retry additionally proves the prior ref unchanged and the new
durable PR identity before related issues close.
