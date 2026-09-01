# VOC-115 — Implementation Plan

## Preconditions and protected areas

PR #215 remains draft. Do not edit it until this plan candidate receives exact
release-history specialist and independent cross-model R4 PASS reviews, accountable
adoption is recorded, the bookkeeping revision receives fresh review, and the plan PR
normally merges. A different builder then uses PR #215's isolated worktree. DOC-15,
DOC-16, AGENTS, permanent history, release refs/PRs, settings truth, and adopted
evidence are protected.

## One coherent 27-path implementation

1. Bring PR #215's implementation head to then-current `origin/develop` with ordinary
   non-force commits. Reconcile its seven living and nine VOC-106 paths, all nine
   VOC-114 artifacts, and the validator/test; change no other path.
2. Replace every comment-ledger/client-allocation statement with deterministic one-use
   claim frontiers, canonical same-tree claim commits, server-enforced atomic create-
   ref arbitration, immutable claim identity, exact attempt SHA/tree binding, conflict
   closure, terminal precedence, and same-D retry.
3. Implement exhaustive all-state PR pagination, all reserved PR timelines and claim
   commits, dual-source complete ref equality, canonical projections/receipts/high-
   watermarks, durable frontier reconstruction, exact actor mapping, and every crash.
4. Implement `scripts/foundation/voc106-release-attempt-policy.mjs` as a pure,
   network-free validator. It validates frontier/attempt grammar/domain/ref format,
   canonical claim commits; JCS PR/timeline/ref/claim/reconciliation receipts;
   pagination completeness; state/frontier derivation; atomic claim outcomes; actor
   mapping; collision/crash recovery; and
   all 25 textual current surfaces.
5. Implement its adjacent test with positive and one-mutation negative fixtures for
   same/different-SHA concurrency, impossible duplicates/conflict closure, uncertain
   PR POST, all ref/PR/body/timeline crash states, edits/deletions, hostile inputs,
   incomplete enumeration, handoff, same-D retry, topology, and immutable recovery.
   Confirm `node --test scripts/foundation/*.test.mjs` auto-discovers it. If not, stop
   for scope review rather than changing `package.json` implicitly.
6. Preserve VOC-106 merge-base, zero-main-only, exact SHA/tree/compare, prospective/
   actual merge tree, separately reviewed promotion/sync merge commits, actor
   separation, permanent refs, ancestry/zero-behind, rollback, and external-action
   controls. Preserve VOC-106/VOC-114 adoption history.
7. Search every non-archived current surface for stale SHA-only, sequence, reservation-
   comment, unsafe update/delete, incomplete frontier/reconciliation, or conflicting
   release instructions. A new path stops for impact review; historical occurrences
   remain classified and unchanged.
8. Run focused/full/hosted checks, exact 27-path/OID audit, and disposable complete-
   diff rollback. Update the binder and obtain fresh exact specialist and different
   cross-model R4 PASS reviews; any edit repeats checks/reviews.

## Validator acceptance interface

At minimum expose pure functions equivalent to:

- `validateFrontierName(name)`, `validateClaimCommit(commit)`, and
  `deriveFrontier(prs, timelines, claims)`;
- `validatePagination(pages)` and `projectAllStatePulls(pages)`;
- `projectTimeline(pages)`, `projectClaims(objects)`, and
  `reconcileRefs(lsRemote, matchingRefsPages)`;
- `canonicalizeReceipt(projection)` and `validateReceipt(receipt, projection)`;
- `deriveAttemptState(prs, timelines, refs)`;
- `classifyClaimRefRecovery(state, candidate)` and
  `classifyPrPostRecovery(state, responseClass)`;
- `validateActorMapping(actor, githubIdentity)`; and
- `validateCurrentPolicySurfaces(root)`.

Names may refine internally, but capabilities and tests cannot be removed. Runtime
must not access network, credentials, environment secrets, GitHub, Cloudflare, or real
refs. Fixtures are inert local objects/disposable repositories.

## Rollback and monitoring

No authoritative view means stop, not timeout, comment adoption, or another PR POST.
Before correction merge, closing draft PR #215 has zero protected effect. After merge,
rollback is a separately reviewed complete revert to the actual first parent; no
partial policy revert, reset, force, deletion, setting, or live action.

DOC-15 §24.18 monitoring starts at correction merge and continues through postmerge
checks/readback plus first corrected VOC-106 promotion/sync. Synthetic races, uncertain
responses, deletion, conflicts, and same-D retry remain mandatory; a real retry also
proves the prior ref immutable and the new durable PR identity. Failure stops release
and issue closure.
