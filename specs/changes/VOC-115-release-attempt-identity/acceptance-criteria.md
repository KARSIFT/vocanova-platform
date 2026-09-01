# VOC-115 — Acceptance Criteria

## VOC-115-AC-00 — Failed evidence and authority remain truthful

- Requirements: `VOC-115-D00`, `VOC-115-D15`
- Tests: `VOC-115-TEST-00`
- Evidence: `VOC-115-EV-00`
- Result: pending

All five superseded candidate SHAs/trees and all ten exact PR #217 FAIL reviews remain recorded
with no transfer. PR #215 remains draft, and no adoption, review, ref, settings,
release, merge, deployment, or external authority is inferred.

## VOC-115-AC-01 — Durable atomic attempt identity is exact

- Requirements: `VOC-115-D01`–`VOC-115-D04`
- Tests: `VOC-115-TEST-01`, `VOC-115-TEST-02`
- Evidence: `VOC-115-EV-01`, `VOC-115-EV-02`
- Result: pending

The deterministic claim/attempt/submit grammar and exact per-form byte lengths, lossless
domains, verified no-bypass ruleset,
server create-ref arbitration, same-target logical coalescence, attempt SHA/tree
binding, protected one-shot submit award, and globally at-most-one active attempt pass.
A different-target race either
selects still-current topology or reaches the specified irrecoverable stale terminal;
it does not promise a usable caller winner. PR multiplicity cleans up before success.

## VOC-115-AC-02 — History and receipts are exhaustive and reconstructible

- Requirements: `VOC-115-D05`, `VOC-115-D06`
- Tests: `VOC-115-TEST-03`
- Evidence: `VOC-115-EV-03`
- Result: pending

Full all-state PR pagination, every reserved timeline, equal complete ref sets, ruleset,
and protected refs reconstruct state. Exact own-key/type/null/id/event/page schemas and
lossless raw-to-projection rules pass. Capture timestamps/ETags/raw digests may change;
the timestamp-free JCS stable-state digest reproduces when authoritative state is equal.
A reserved-looking null head repository stops as ambiguous and is never inferred from
label or timeline events.

## VOC-115-AC-03 — Every race, crash, collision, and retry is representable

- Requirements: `VOC-115-D07`–`VOC-115-D09`
- Tests: `VOC-115-TEST-04`, `VOC-115-TEST-05`
- Evidence: `VOC-115-EV-04`, `VOC-115-EV-05`
- Result: pending

Every boundary has an exact state-idempotent resume or fail-closed state. Fresh stable
server state decides canonical claim/attempt ref eligibility without a local retry
counter. Only the exact submit-ref `201` recipient may issue one no-retry/no-redirect PR
POST. Crash, award loss, or unknown-zero is a durable irrecoverable hold and never
authorizes another POST or successor; an observed PR consumes the only award, excluding
an authorized delayed duplicate. Closed PRs advance same-D retry. Stale accepted
topology is irrecoverable. Authorized deletion/update is denied by prerequisite
readback; unauthorized settings mutation is explicitly out of scope.

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
Synthetic same/different-target concurrency, coalescence, stale terminal, unknown
responses, ruleset drift, multiplicity cleanup, and same-D retry remain passing. A real
retry additionally proves prior refs unchanged and the new identity before issue close.
