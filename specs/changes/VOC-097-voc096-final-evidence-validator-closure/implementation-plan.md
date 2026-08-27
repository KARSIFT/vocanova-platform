# VOC-097 — Implementation Plan

## Preconditions

1. Independently review and adopt this exact plan; complete adoption bookkeeping,
   genuine eligibility, normal non-author merge, and applicable post-merge checks.
2. Fetch current `main`/`develop`, inspect open PRs/issues and all worktrees/refs, and
   confirm the preserved VOC-096 PR1 worktree remains at its expected base with only
   the reviewed existing scope modified.
3. Re-read adopted VOC-094/VOC-095/VOC-096 and issue #166. Make no Cloudflare,
   settings, credential, or dispatch request.

## Ordered repository work

1. Integrate the adopted VOC-097 plan ancestry into the preserved VOC-096 PR1 branch
   without discarding its uncommitted work. Stop on overlap or unexpected drift.
2. Add exactly the two omitted core paths:
   `scripts/foundation/voc080-final-evidence-policy.mjs` and its paired `.test.mjs`.
   Keep the existing 27-path authorization intact, producing the exact 29-path core.
3. Change the final-evidence validator from unconditional held-only checking to a
   closed state transition: legacy held/held remains valid; prepared/prepared is valid
   only when the full current Cloudflare delivery repository validator passes;
   production remains held; every other combination fails.
4. Add the complete positive/negative matrix from `VOC-097-D07`. Tests must exercise
   composition with the authoritative delivery validator and prove that generic URLs,
   self-asserted authority/envelope metadata, binder/tuple/schema/digest drift,
   committed authorization, production activation, and hold weakening cannot pass.
5. Reconcile all nine VOC-096 package files to state the exact 29-path core and the
   nine-path package-record reconciliation, total 38. Reconcile all nine VOC-094
   operative amendment surfaces already in the core. Preserve prior candidates,
   FAIL/PASS reviews, adoption, Phase-1/2 evidence, and action holds as immutable
   history.
6. Run the complete validation in the test plan. Inspect exact changed/authorized
   path inventories, production sentinel hashes, secret placement, and no-external-
   action evidence.
7. Commit and open the single existing VOC-096 PR1 against `develop`. Obtain separate
   exact-SHA Cloudflare, security/settings, and independent R4 reviews. Any material
   reviewer edit creates a new builder revision and requires fresh checks/reviews.
8. A distinct non-author actor audits genuine merge eligibility and merges normally.
   Record exact source head, merge SHA, hosted/post-merge checks, source-head readback,
   recreation command, and preserved worktree/ref inventory.

## Stop conditions

Stop on a 39th required path, inability to compose with the complete validator,
production/hold drift, secret-like content, lost builder work, failed mandatory check,
or any need for a live-system action. Do not create a local exception, weaken a gate,
or restart Cloudflare provisioning.

## VOC-098 completed PR #167 lifecycle reconciliation

The operative VOC-097 plan lifecycle is complete: reviewed bookkeeping head
`814c31deb893c5c72b80f3075c0905fc8ba8c9c5`, exact review comment `5443475414`,
Governance run `33103467324` with literal `eligible: true` and `reasons: []`, normal
non-author merge `45590a0673937f4a9464b57393e026871678b3d4`, successful post-merge CI
`33103648900`, Security `33103648876`, Governance `33103648935`, and lifecycle
readback comment `5443938338`. Repository implementation authority is effective only
for the declared PR #168 correction. Rejected SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a`
and its three FAIL reviews remain immutable and non-transferable. ACT-03/04/05,
VOC-085-HOLD-00, VOC-080-HOLD-01, VOC-080-HOLD-02, and every external action remain
held; fresh exact-SHA checks/reviews and non-author merge remain required for PR #168.
