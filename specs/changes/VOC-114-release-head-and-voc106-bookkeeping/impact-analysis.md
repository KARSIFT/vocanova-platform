# VOC-114 — Impact Analysis

## Security and privacy

The correction removes a destructive permanent-ref hazard. It does not query or
change settings and uses no credentials, personal data, production data, or networked
runtime. Release attempt refs are immutable; no release, synchronization, `develop`,
`main`, or foreign PR head may be force-updated by this package.

## Data, migrations, analytics, and accessibility

None. No application, schema, migration, analytics, content, or interface behavior
changes.

## Risks, dependencies, and evidence

- `VOC-114-R00`: a permanent head is automatically deleted after release. Mitigation:
  exact short-lived release head plus pre/post branch readback and recovery evidence.
- `VOC-114-R01`: the short-lived head drifts from integrated `develop`. Mitigation:
  immutable attempts, SHA/tree/compare equality, complete invalidation, close/abandon,
  collision check, and a fresh ref/PR/review.
- `VOC-114-R02`: documents disagree and a later actor follows stale instructions.
  Mitigation: one 16-path reconciliation and exhaustive current-surface search,
  including `.github/README.md`.
- `VOC-114-R03`: correcting stale fields rewrites adoption evidence. Mitigation:
  retain the exact candidate/review/approval records and change only operational state.
- `VOC-114-R04`: repository promotion is mistaken for deployment. Mitigation: explicit
  no-live-action boundary and audit of workflows/actions.
- `VOC-114-R05`: diverged main or merge synthesis changes the promoted tree.
  Mitigation: main-is-merge-base, zero main-only, and prospective/actual merge-tree
  equality; any mismatch blocks rather than resolving divergence during release.
- `VOC-114-R06`: a stale or foreign name collision is overwritten. Mitigation:
  fail-closed ownership check; never force-update, adopt, or delete another attempt.
- `VOC-114-DEP-00`: exact reviewed/adopted VOC-114 and its normal plan merge precede
  implementation.
- `VOC-114-DEP-01`: exact implementation checks/reviews and non-author merge precede
  any corrected VOC-106 release work.
- `VOC-114-EV-00`–`EV-06`: lifecycle, semantic, deterministic, review, rollback, and
  monitoring evidence defined in the test plan.

## Coherent unit and rollback

One PR is the largest safe coherent unit: changing only VOC-106 leaves canonical
guides unsafe; changing only guides leaves the adopted executable package unsafe.
Splitting creates a contradictory partial state and adds coordination, elapsed-time,
context, repeated-check, exact-review, and bookkeeping overhead without a releasable
boundary. Before merge, close the PR. After merge, a separately reviewed revert PR
restores its exact first parent; never reset, force-push a permanent ref, mutate a
setting, or delete a branch as rollback.

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
