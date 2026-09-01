# VOC-115 — Acceptance Criteria

## VOC-115-AC-00 — Failed evidence and authority remain truthful

- Requirements: `VOC-115-D00`, `VOC-115-D15`
- Tests: `VOC-115-TEST-00`
- Evidence: `VOC-115-EV-00`
- Result: pending

Issue #216 and all three exact FAIL reviews remain intake. Candidate `f7abcc8` is
superseded with no review transfer, PR #215 remains draft, and only ordinary non-force
updates to its scoped implementation head are allowed after adoption. No other ref,
settings, release, merge, deployment, or external authority is inferred.

## VOC-115-AC-01 — Server identity and event bytes are exact

- Requirements: `VOC-115-D01`–`D03`, `VOC-115-D05`
- Tests: `VOC-115-TEST-01`, `VOC-115-TEST-02`
- Evidence: `VOC-115-EV-01`, `VOC-115-EV-02`
- Result: pending

The full-SHA/server-comment-id name, bounded lossless BigInt domain, ref lengths, exact
v1 framing/key sets/enums/linkage/envelope, canonical serialization, full pagination,
and transition graph pass positive fixtures. Malformed, unsafe, truncated, edited,
deleted, minimized, duplicate, conflicting, or missing evidence fails and never frees
an id/name.

## VOC-115-AC-02 — Exactly one active attempt survives concurrency

- Requirements: `VOC-115-D04`, `VOC-115-D08`
- Tests: `VOC-115-TEST-03`
- Evidence: `VOC-115-EV-03`
- Result: pending

Same/different-SHA concurrent reservations remain provisional. Stable full scans,
current-SHA filtering, lowest lossless numeric id, dispositions, activation, and
post-activation stable scans derive zero or one global active chain. Late/competing
reservations cannot activate. Handoff changes only the effective preparation owner.

## VOC-115-AC-03 — Crashes, collisions, and same-SHA retry are unambiguous

- Requirements: `VOC-115-D06`–`D09`
- Tests: `VOC-115-TEST-04`, `VOC-115-TEST-05`
- Evidence: `VOC-115-EV-04`, `VOC-115-EV-05`
- Result: pending

Every request/response boundary has one exact idempotent continuation or a permanent
stop/abandonment route. Ref creation requires atomic POST, 201 receipt and readback;
matching or collided orphans are never adopted. Drift reaches terminal abandonment
before a fresh distinct server reservation. Same-develop retry preserves the earlier
ref and requires no adjacent/global ordinal.

## VOC-115-AC-04 — Release topology and recovery remain exact

- Requirements: `VOC-115-D09`, `VOC-115-D10`
- Tests: `VOC-115-TEST-06`
- Evidence: `VOC-115-EV-06`
- Result: pending

All merge-base, divergence, SHA/tree/compare, prospective/actual merge-tree, two-PR,
review/merge actor, sync, permanent-ref, ancestry/zero-behind, deletion eligibility,
and nonexecuted recreation controls pass; every one-invariant mutation stops.

## VOC-115-AC-05 — Exact 27-path implementation is executable and reviewed

- Requirements: `VOC-115-D11`–`D13`
- Tests: `VOC-115-TEST-07`, `VOC-115-TEST-08`
- Evidence: `VOC-115-EV-07`, `VOC-115-EV-08`
- Result: pending

Exactly 27 paths change. The two foundation files enforce the complete state machine
and hostile matrix and are auto-discovered by foundation tests. All current surfaces
agree, adopted evidence/history is preserved, checks and rollback pass, exact
specialist and different cross-model R4 reviews have zero blockers, and a separate
non-author merges.

## VOC-115-AC-06 — Bounded monitoring proves effectiveness

- Requirements: `VOC-115-D14`
- Tests: `VOC-115-TEST-09`
- Evidence: `VOC-115-EV-09`
- Result: pending

DOC-15 §24.18 evidence includes reason, benefit, risk, evaluation, rollback, owner,
and monitoring. Exact correction postmerge and first VOC-106 finalization pass. The
synthetic same-develop retry always passes; a real retry additionally proves a fresh
distinct id and immutable old ref before issues close.
