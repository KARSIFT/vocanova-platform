# VOC-115 — Impact Analysis

## Impact inventory

- **Release governance/protected history — affected:** identity, event lifecycle,
  arbitration, ownership, crash recovery, collision, invalidation, and recreation.
- **Living documents — affected:** seven current release surfaces.
- **Adopted packages — affected:** all nine VOC-106 and all nine VOC-114 artifacts,
  with adoption evidence preserved.
- **Foundation validation — affected:** one new pure network-free validator and test,
  auto-discovered by the existing test glob; no package-script change.
- **Application/API/data/UI/accessibility/analytics/runtime/workflows/deployment/
  migrations — not affected.** No executable product/runtime or live action.
- **Unknowns — none:** exact 27-path inventory; any newly found current surface stops
  for scope review instead of silent expansion.

## Security, privacy, and privilege

Server ids remove client allocation races but do not make comments immutable.
Tamper/missing/conflict checks, exact lineage, single-active derivation, atomic ref
POST, and no-orphan-adoption protect evidence and refs. The later VOC-106 preparer
needs issue-comment/ref/PR action authority already bounded by that package; VOC-115's
correction executes none. No setting, credential, personal/learner/production data,
Cloudflare resource, or live system is read.

## Risks and mitigations

- `R00` same-SHA retry dead-ends: fresh globally unique server reservation id.
- `R01` concurrent active attempts: provisional reservations, deterministic lowest-id
  arbitration, dispositions, stable scans, and global one-active validator.
- `R02` comment edit/delete masquerades as history: exact envelope/body digest,
  timestamps, predecessor closure, and fail-closed tamper treatment; never reuse ids.
- `R03` crash creates adoptable orphan: boundary-specific receipt/readback rules;
  matching SHA/ref/PR alone is insufficient.
- `R04` hostile numeric/ref input: canonical bounded decimal string, BigInt, explicit
  exhaustion, byte lengths, safe ASCII, and check-ref-format.
- `R05` actor takeover: exact effective-owner chain and attributable handoff evidence.
- `R06` collision/ref mutation: POST-create only; collision disposition; no PATCH,
  push, force, force-with-lease, manual deletion, or foreign adoption.
- `R07` policy drift: one 27-path correction and repository-owned semantic validator.
- `R08` recovery becomes name reuse: only successfully merged heads have recorded
  nonexecuted recovery requests; active/abandoned refs remain immutable.
- `R09` correction mistaken for release: exact scoped-head-only update and no-live-
  action audit.

## Coherent unit and dependencies

VOC-114 is adopted with blocked draft implementation PR #215. VOC-106 is adopted but
cannot run before this correction. The seven living paths, 18 adopted-package paths,
and validator/test are one safety/review/rollback unit. Splitting would leave policy
contradictory or unenforced and add coordination, elapsed-time, context, repeated
checks, exact reviews, and bookkeeping without a safe partial release state.

## Rollback and contingency

Before merge, PR #215 remains draft/closable for zero protected effect. After merge,
a different builder prepares a separately reviewed complete revert of the actual
27-path merge to its first parent. Never partially restore the failed SHA-only/client-
sequence model, reset, force, delete a branch, change settings, or use a live action.
Any event/ref/ownership/topology ambiguity stops VOC-106 and preserves evidence.
