# VOC-115 — Impact Analysis

## Affected areas

- **Release governance and protected history — affected.** The attempt name,
  allocation, collision, ownership, invalidation, and recovery contract changes.
- **Living documents — affected.** Seven current release surfaces must agree.
- **Adopted change packages — affected.** All nine VOC-106 and all nine VOC-114
  artifacts require prospective reconciliation while preserving adoption evidence.
- **Application, API, database, UI, accessibility, analytics, runtime, workflows,
  deployment, and migrations — not affected.** No executable product/runtime path
  changes and no live action is authorized.
- **Unknowns — none.** The path and semantic inventories are explicit; review may
  raise the risk or block but cannot silently expand scope.

## Security, privacy, and privilege impact

The change removes a recovery dead-end without adding force, deletion, settings, or
deployment authority. Atomic create-ref is specified for the later separately
authorized VOC-106 release action, not executed by this correction. No credentials,
personal/learner/production data, Cloudflare resources, or settings are read. The
autonomous privilege boundary is unchanged: exact evidence and a separate authorized
actor remain necessary for each repository mutation.

## Risks and mitigations

- `VOC-115-R00`: a retry derives the same name and dead-ends. Mitigation: full SHA
  plus globally monotonic recorded sequence and same-develop N/N+1 fixture.
- `VOC-115-R01`: an ordinal is reused after automatic deletion hid the ref.
  Mitigation: scan all PR states and recorded attempt evidence, not live refs alone.
- `VOC-115-R02`: concurrent or foreign creation steals a selected name. Mitigation:
  atomic create-if-absent, reserve every collision, refresh, allocate higher, never
  adopt/update/delete.
- `VOC-115-R03`: a matching ref is misrepresented as the same attempt. Mitigation:
  complete immutable ownership tuple and recorded handoff; SHA equality alone is
  insufficient.
- `VOC-115-R04`: abandoned evidence is destroyed. Mitigation: abandoned refs are
  immutable and never deletion-eligible; unexpected absence/movement stops.
- `VOC-115-R05`: name progress weakens release topology. Mitigation: retain every
  merge-base, divergence, compare, tree, review, merge-method, sync, and final-readback
  proof.
- `VOC-115-R06`: current surfaces disagree. Mitigation: one exact 25-path correction,
  current-surface semantic audit, and exact reviews.
- `VOC-115-R07`: repository correction is mistaken for release or deployment.
  Mitigation: explicit no-ref/no-release/no-live-action boundary and action audit.
- `VOC-115-R08`: recreation becomes covert name reuse. Mitigation: recreation syntax
  is recorded but not executed and applies only to recovery of a successfully merged
  auto-deleted head under separate authority.

## Dependencies and coherent unit

VOC-114 is adopted; its draft implementation PR #215 is blocked. VOC-106 is adopted
but cannot execute until this correction is adopted, merged, implemented, and passes
postmerge gates. One PR is the largest safe coherent implementation because the 25
paths state one invariant and reverse to one parent. Splitting would expose conflicting
current policy and add coordination, elapsed-time, token/context, repeated-check,
exact-review, and bookkeeping cost without an independently safe release state.

## Rollback and contingency

Before merge, keep or close PR #215 for zero protected-branch effect. After merge, a
different builder prepares a separately reviewed revert of the complete actual PR
#215 merge to its first parent; do not partially restore the retry-dead-end language.
Never reset, force, force-with-lease, mutate settings, manually delete a branch, or use
a live-system action for rollback. Any identity, ownership, collision, ref, or tree
ambiguity stops VOC-106 and preserves evidence for governed correction or revert.
