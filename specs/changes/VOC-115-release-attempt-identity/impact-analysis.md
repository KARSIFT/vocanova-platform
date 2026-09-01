# VOC-115 — Impact Analysis

## Impact inventory

- **Release governance/protected history — affected:** frontier identity, atomic claim-
  ref arbitration, exhaustive reconciliation, ownership, crash recovery, collision,
  abandonment, and recreation.
- **Living documents — affected:** seven current release surfaces.
- **Adopted packages — affected:** all nine VOC-106 and all nine VOC-114 artifacts;
  adoption evidence remains intact.
- **Foundation validation — affected:** one new network-free validator and test,
  auto-discovered by the existing test glob; no package-script change.
- **Application/API/data/UI/runtime/workflows/deployment/migrations — unaffected.**
- **Unknowns — none:** exact 27-path inventory. A newly found current surface stops
  for scope review rather than silently expanding the package.

## Security, privacy, and privilege

The immutable one-use claim ref/commit and atomic unique-ref creation replace editable
comments and client scans as authority. Exhaustive PR/timeline/claim/ref reconciliation,
non-self-referential receipts, immutable ref rules, and no-POST-retry after uncertainty
prevent duplicate attempts and false genesis. The exact `/root` to authenticated login
mapping prevents inferred takeover. The later VOC-106 operator needs already-bounded
ref/PR authority; VOC-115 executes none and accesses no credential, personal/learner/
production data, Cloudflare resource, setting, or live system.

## Risks and mitigations

- `R00` same-SHA retry dead-end: closed PR number advances to a fresh claim frontier.
- `R01` concurrent actives: one fixed claim name and GitHub atomic create-ref selects
  one immutable winner; consumed claim refs are never reused.
- `R02` impossible duplicates: close every open/unmerged match, prove closure, and
  advance to the canonical conflict-digest frontier; none is active meanwhile.
- `R03` deletion recreates genesis: permanent one-use claim refs plus complete durable
  PR/timeline objects, not comments, are frontier authority.
- `R04` crash creates duplicates: unknown claim/attempt-ref absence and PR POST are
  never retried; stopped states remain stopped.
- `R05` incomplete discovery: all-state PR/timeline/claim pagination plus two equal full
  ref enumerations, canonical receipts, counts, high-watermarks, and bindings.
- `R06` actor takeover: exact GitHub login/id/node-id mapping; no current handoff.
- `R07` collision/ref mutation: create/read only; no adopt, update, force, or deletion.
- `R08` policy drift: one 27-path correction and executable semantic validator.
- `R09` correction mistaken for release: scoped ordinary PR-head update only and an
  explicit no-ref/settings/live-action audit.

## Coherent unit and dependencies

VOC-114 is adopted with blocked draft PR #215. VOC-106 is adopted but cannot run
safely before this correction. The seven living paths, 18 adopted-package paths, and
validator/test share one safety and rollback boundary. Splitting would publish
contradictory or unenforced policy and add coordination, elapsed-time, context,
repeated-check, exact-review, and bookkeeping overhead without a safe partial state.

## Rollback and contingency

Before merge, PR #215 remains draft/closable for zero protected effect. After merge, a
different builder prepares a separately reviewed complete revert of the actual 27-path
merge to its first parent. Never partially restore either failed candidate, reset,
force, delete a bound branch, change settings, or use a live action. Any PR/ref/
timeline/receipt/owner/topology ambiguity stops VOC-106 and preserves durable evidence.
