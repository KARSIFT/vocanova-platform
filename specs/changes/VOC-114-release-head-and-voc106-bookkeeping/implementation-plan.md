# VOC-114 — Implementation Plan

## Preconditions and protected areas

Do not edit current policy until this exact plan candidate receives a different-actor
R4 review, operator adoption is recorded in `change.yaml`, and the plan PR is normally
merged after fresh exact review. A different builder uses an isolated branch/worktree
from then-current `origin/develop`. DOC-15, DOC-16, AGENTS, protected-history rules,
hosted-settings truth, and adopted VOC-106 evidence are protected.

## One coherent implementation

1. Inventory the 16 exact `implementation_paths` and prove no other path changes.
2. Update the seven living policy/contribution files, including `.github/README.md`,
   so a release PR targets `main` from a short-lived ref created at the exact frozen
   `origin/develop` SHA and tree. Require frozen main as merge base, zero main-only
   commits, and prospective/actual release-merge tree equality with frozen develop.
3. Reconcile all nine VOC-106 artifact files, preserving adopted candidate/review/
   approval evidence while removing stale pre-adoption blockers and setting task state
   accurately. Preserve its two hard-sequenced protected-history PRs.
4. Prospectively use immutable claim/attempt/submit refs. Same-target creation
   coalesces; post-claim drift and submit-marker-plus-zero stop. Resolve cardinality
   first. Never rewrite or delete protected release refs; only the merged
   synchronization head is automatic-deletion eligible.
5. Search every non-archived current surface for contradictory direct-`develop` head
   instructions. Classify explicitly historical records rather than rewriting them.
6. Locally synthesize the prospective merge without moving refs and require its tree
   to equal frozen develop/head tree. After hosted merge, repeat against the actual
   release merge before synchronization proceeds.
7. Run deterministic and hosted checks. Obtain exact-SHA release-governance/history
   specialist and independent R4 PASS verdicts. Resolve all blockers; a separate
   non-author performs the merge.

## Validation and independent verification

Run the commands in `test-plan.md`, inspect exact path/OID/diff evidence, and test both
allowed and rejected topology fixtures without pushing refs. Reviews bind the final
implementation SHA and are repeated after any edit. A reviewer who edits becomes a
builder of a new SHA.

## Monitoring and rollback

The adoption-recorded owner observes exact correction-merge hosted/readback checks
and the first corrected VOC-106 promotion/sync sequence through permanent-ref,
auto-delete-target, ancestry, and behind-count readbacks. Any failure stops release or
closure. Revert via a separately reviewed PR against the actual correction merge
first parent; no reset, permanent-ref force-push, settings change, manual deletion, or
live-system action is allowed.

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
