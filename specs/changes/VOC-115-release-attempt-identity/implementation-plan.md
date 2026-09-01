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
2. Replace every comment/client/caller allocation statement with deterministic claim
   frontiers, same-target logical coalescence, atomic create-ref target selection,
   exact SHA-bound attempt identity, mandatory post-claim protected readback,
   irrecoverable stale topology, a protected one-shot submit award, cardinality-first
   cleanup, null-provenance stop, one canonical branch/full-ref boundary, and same-D retry.
3. Specify the separately authorized held ruleset prerequisite and its exact readback;
   implementation does not query/change it. Implement exhaustive all-state PR/timeline/
   ruleset-history pagination, numeric-max version-state comparison, dual-source ref
   equality, lossless page/object/command/scan/pass captures, timestamp-free stable
   state, exact two-pass equality, actor mapping, and every crash.
4. Implement `scripts/foundation/voc106-release-attempt-policy.mjs` as a pure,
   network-free validator. It validates claim/attempt/submit grammar/domain/ref form,
   ruleset/history fixtures, exact JSON projection/page/object/command/scan/pass/state
   schemas and complete ordered pass preimages, JCS separation,
   page completeness/stable equality, state/frontier/cardinality derivation, claim
   coalescence/stale outcome, one-shot submit awards, actor/crash recovery, and all 25
   textual surfaces.
5. Implement its adjacent test with positive and one-mutation negative fixtures for
   same/different-target concurrency and replay coalescence, stale terminal, merged-
   duplicate cleanup, submit-ref 201/422/unknown and PR one-shot crashes, capture-vs-
   state time variation, hostile inputs, null/foreign head provenance, all-PR/timeline/
   ruleset-history pagination/filter/high-watermark/max-version mutations, pass-member
   omissions/reorders, branch/full-ref swaps, ruleset drift, handoff, same-D retry,
   topology, and immutable recovery.
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

- `validateFrontierName(name)`, `validateAttemptName(name, sha)`,
  `validateSubmitName(name, allocationDigest)`, and
  `deriveFrontier(prs, timelines, refs)`;
- `validatePagination(pages)` and `projectAllStatePulls(pages)`;
- `projectRulesetHistory(pages)` and `selectLatestRulesetVersion(history)`;
- `projectTimeline(pages)` and `reconcileRefs(lsRemote, matchingRefsPages)`;
- `validatePageCapture(capture)`, `deriveStableState(passes)`, and
  `validatePassCapture(capture, expectedMembers)`, and
  `validateReceipt(receipt, projection)`;
- `deriveAttemptState(prs, timelines, refs)`;
- `classifyClaimRefRecovery(state, frozenTopology)`,
  `classifySubmitAward(state, responseClass)`, and
  `classifyOneShotPrOutcome(state, award, responseClass)`;
- `validateRulesetFixture(ruleset)` and `classifyMultiplicity(prs, timelines)`;
- `validateActorMapping(actor, githubIdentity)`;
- `toFullRef(branch)`, `validateBranchField(name)`, and `validateFullRefField(name)`; and
- `validateCurrentPolicySurfaces(root)`.

Names may refine internally, but capabilities and tests cannot be removed. Runtime
must not access network, credentials, environment secrets, GitHub, Cloudflare, or real
refs. Fixtures are inert local objects/disposable repositories.

## Rollback and monitoring

No authoritative view/ruleset means stop, not comment adoption or another PR POST.
Submit-marker-present/zero-PR after award loss, crash, or unknown response is held
irrecoverably; readback never grants a second submit award.
Before correction merge, closing draft PR #215 has zero protected effect. After merge,
rollback is a separately reviewed complete revert to the actual first parent; no
partial policy revert, reset, force, deletion, setting, or live action.

DOC-15 §24.18 monitoring starts at correction merge and continues through postmerge
checks/readback plus first corrected VOC-106 promotion/sync. Synthetic coalescence,
different-target/stale state, uncertain responses, ruleset drift, multiplicity cleanup,
and same-D retry remain mandatory; a real retry also
proves the prior ref immutable and the new durable PR identity. Failure stops release
and issue closure.
