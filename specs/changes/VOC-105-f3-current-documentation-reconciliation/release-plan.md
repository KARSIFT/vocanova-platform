# VOC-105 — Release and Rollback Plan

## Repository delivery

This package has no deployment release. After plan adoption and normal plan merge, a
different builder prepares one implementation PR into `develop`. The exact candidate
must pass deterministic checks, specialist documentation/milestone review, independent
R4 verification, and read-only merge eligibility before a separate non-author merges it.
The implementation merge changes repository history only.

## Current staging outcome

The package records the already completed environment-reviewed delivery at exact merge
SHA `03528a84988ebe664207c6a439e133070627c92a`, CI run
`33386240492`, attempt 1. Its successful migration, immutable upload, exact
promotion, and bounded smoke are evidence; the package does not dispatch or rerun it.
The prior resource/observability/baseline/rollback and settings evidence remains linked
without recording secrets or Worker version UUIDs. Production stayed skipped and
HOLD-01/HOLD-02 remain active.

## Rollback and drift

If the implementation PR is unmerged, close it. After merge, a separately reviewed
repository revert restores the exact pre-VOC-105 tree. If the current evidence becomes
stale or contradictory, the validator fails closed and an accountable owner must
reconcile it through a new governed package. Neither repository revert nor evidence
correction authorizes Cloudflare, settings, secret, dispatch, D1, traffic, DNS,
production, or launch action.

## Closure and independent verification

Record the plan candidate SHA, exact specialist and independent R4 verdicts, hosted
checks, implementation SHA, final reviews, normal merge, post-merge validation, and
active-record readback. That evidence may close VOC-105 only. Issue #189 remains open
for its separately governed A1 planning outcome; this F3 reconciliation neither
satisfies nor closes that outcome.
