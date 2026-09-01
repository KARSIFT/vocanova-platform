# VOC-115 — Implementation Plan

## Preconditions and protected areas

PR #215 remains draft. Do not edit it until this replacement plan candidate receives
exact release-history specialist and independent cross-model R4 PASS reviews,
accountable adoption is recorded, the bookkeeping revision receives fresh review, and
the plan PR normally merges. A different builder then uses PR #215's isolated
worktree. DOC-15, DOC-16, AGENTS, permanent history, release refs/events, settings
truth, and adopted evidence are protected.

## One coherent 27-path implementation

1. Bring PR #215's scoped implementation branch to then-current `origin/develop`
   using ordinary non-force history updates. Keep its seven living and nine VOC-106
   changes, add all nine VOC-114 artifacts, and add the validator/test. No other path.
2. Reconcile all current prose/metadata to the exact full-SHA/server-comment-id name,
   issue-#191-only v1 schema, full-pagination proof, global one-active derivation,
   winner/loser disposition, crash recovery, ownership/handoff, invalidation,
   immutable abandonment, collision, deletion, and recreation contracts.
3. Implement `scripts/foundation/voc106-release-attempt-policy.mjs` as a network-free
   CLI and pure exported functions. It parses/canonicalizes raw event envelopes,
   validates full page fixtures, derives lineages/state/effective owner/frontier,
   arbitrates reservations with lossless BigInt, validates names/ref limits and crash
   transitions, and audits all 25 document/package surfaces.
4. Implement the adjacent test with complete positive and one-mutation negatives for
   event types/fields/serialization, envelope tamper, pages, concurrency, races,
   crash boundaries, hostile ids/names, actor/handoff, collision, same-D retry,
   one-active state, immutable refs, topology, and recovery. Confirm existing
   `node --test scripts/foundation/*.test.mjs` auto-discovers it; do not edit
   `package.json` unless that precondition is disproved, which stops for scope review.
5. Preserve VOC-106 main-as-merge-base, zero-main-only, SHA/tree/compare, prospective/
   actual merge-tree, two reviewed merge-commit PRs, synchronization, actor separation,
   final permanent refs/ancestry/zero-behind, rollback, and external-action controls.
   Preserve exact VOC-106/VOC-114 adoption evidence and historical packages.
6. Search every non-archived current surface for stale SHA-only/client-sequence names,
   ambiguous same-attempt adoption, unsafe push/update/delete, incomplete event/crash
   state, or another living release instruction. A new current path stops for impact
   review; historical occurrences remain classified and unchanged.
7. Run focused/full/hosted checks and exact 27-path/OID diff. Rehearse reversing the
   actual complete PR #215 diff in a disposable worktree to its true first parent.
   Update body/binder and obtain fresh exact specialist and independent cross-model R4
   PASS reviews; any edit repeats checks/reviews.

## Validator acceptance interface

At minimum export pure functions equivalent to:

- `parseEventEnvelope(rawBytes)` and `canonicalizeEventBody(object)`;
- `validatePagination(pages)` and `validateEventSet(events)`;
- `deriveAttemptState(events, currentRefsAndPrFixtures)`;
- `selectReservationWinner(state, frozenDevelopSha)`;
- `validateHeadName(head, sha, reservationId)`;
- `classifyRecoveryBoundary(state, receiptsAndReadback)`; and
- `validateCurrentPolicySurfaces(root)`.

Names may refine internally, but the observable capabilities and tests cannot be
removed. Runtime must not access network, credentials, environment secrets, GitHub,
Cloudflare, or live refs. Fixtures are inert local objects/disposable repositories.

## Crash, rollback, and monitoring

Implement every crash row in specification.md literally. No receipt/ownership proof
means stop, not orphan adoption. Before correction merge, closing draft PR #215 has
zero protected effect. After merge, rollback is a separately reviewed complete revert
to the actual first parent; no partial policy revert, reset, force, deletion, setting,
or live action.

DOC-15 §24.18 monitoring starts at correction merge and continues through exact
postmerge checks/readback plus first corrected VOC-106 promotion/sync. Synthetic
concurrency/crash/same-D retry remains mandatory; a real retry also proves old ref
immutability and distinct server id. Failure stops release/closure.
