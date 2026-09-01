# VOC-114 — Release Plan

## Repository correction only

VOC-114 itself has no release or deployment. After exact plan review, recorded
adoption, normal plan merge, and a different builder's exact implementation checks
and reviews, a separate authorized non-author may merge the correction into
`develop`. This merge changes repository policy/history only and grants no authority
to execute VOC-106, alter settings, or use a live system.

## Preconditions, monitoring, and closure

Record the implementation base/head/tree, exact 16-path diff, deterministic and hosted
checks, specialist and R4 verdicts, merge actor/SHA, and protected-branch readback.
The adoption owner monitors from that merge through first corrected VOC-106 promotion
and synchronization. Issue #213 closes only after the disposable release head is
proven immutable and collision-free, frozen main ancestry/zero-main-only and actual
release-tree equality pass, both permanent branches remain, final ancestry/behind
proofs pass, protected release refs remain immutable, and only the merged synchronization head is auto-delete eligible.

## Rollback and failure

Before correction merge, close its PR. After merge, use a new independently reviewed
revert PR against the actual merge first parent and rerun applicable checks. If the
first-use topology, ancestry, tree, or deletion readback fails, stop irrecoverably
after claim without deleting or rewriting protected refs,
preserve evidence, and route governed remediation or reviewed correction revert.
Never reset, force-push any release/permanent/foreign branch, change a setting,
manually delete a branch, or perform a live-system action as rollback.

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
