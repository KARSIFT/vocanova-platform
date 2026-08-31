# VOC-107 — Tasks

## VOC-107-T00 — Diagnose, regress, and remediate the required local-stack deadlock

One task covers the whole safe delivery unit: bounded evidence collection, causal
inventory, deterministic regression, minimum correction, validation, rollback
evidence, specialist verification, and independent R3 verification.

Splitting a diagnosis-only PR from the repair would make no releasable change while
leaving the intermittent required-control failure unresolved. It would also require
another branch, review cycle, exact-SHA handoff, repeated local-stack/hosted checks,
and bookkeeping without a distinct action-authority or rollback boundary.

Completion requires every acceptance criterion, the approved candidate-path subset,
no unresolved blocker, and one separately merged implementation PR. It does not
authorize any external action or closure of issue #194 before the merged SHA's hosted
evidence is available.
