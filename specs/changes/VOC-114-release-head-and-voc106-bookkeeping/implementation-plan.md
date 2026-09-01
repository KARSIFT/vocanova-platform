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
4. Specify immutable attempt heads. Drift invalidates the attempt, closes its draft PR,
   and abandons its ref without deletion or mutation. A new SHA-derived name/PR may be
   created only after proving no collision; an existing name fails closed unless it is
   the untouched head of the same attempt. Never rewrite, adopt, or delete another
   actor/PR head. Before successful merge record head name, SHA, tree, compare, and
   recreation command; automatic deletion may affect only successfully merged
   short-lived heads.
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
