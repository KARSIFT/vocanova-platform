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

Atomic unique-ref creation selects a topology value; same-target callers coalesce.
Durability depends on a separately authorized exact no-bypass ruleset readback, not
policy prose. Complete PR/timeline/ref reconstruction, timestamp-free stable digests,
state-idempotent canonical ref requests, a one-shot protected submit award, and
cardinality cleanup prevent duplicates and
false genesis under authorized actions. Unauthorized ruleset mutation is outside the
guarantee and stops on readback. VOC-115 itself accesses no credential, setting,
personal/production data, Cloudflare resource, or live system.

## Risks and mitigations

- `R00` same-SHA retry dead-end: closed PR number advances to a fresh claim frontier.
- `R01` concurrent actives: atomic fixed-name create-ref selects one target; identical
  claim/attempt requests coalesce and one protected submit marker awards one PR call.
- `R02` impossible duplicates: close every open/unmerged match, prove closure, and
  advance to the canonical conflict-digest frontier; none is active meanwhile.
- `R03` deletion recreates genesis: execution is held until an active no-bypass ruleset
  denies claim/attempt/submit update and deletion; every action freshly reads it.
- `R04` stale topology: mandatory post-claim protected readback and explicit
  irrecoverable terminal; no false usable-winner promise.
- `R05` crash duplicates: fresh stable state decides canonical ref recovery. Only the
  submit-ref `201` invocation sends one PR request with retries/redirects disabled;
  crash/unknown-zero is a durable irrecoverable hold, never successor eligibility.
- `R06` incomplete discovery: exact page schemas, full-boundary two-pass equality,
  timelines, dual ref enumeration, stable digest, counts, and high-watermarks.
- `R07` merged duplicate survives: multiplicity cleanup/readback precedes success.
- `R08` actor/ref takeover: exact actor mapping, create/read only, and ruleset.
- `R09` policy drift: one 27-path correction and executable semantic validator.
- `R10` correction mistaken for release: scoped ordinary PR-head update only and an
  explicit no-ref/settings/live-action audit.
- `R11` deleted-head misattribution: a reserved-looking null repository invalidates the
  allocation view; label/timeline evidence never substitutes for repository identity.

## Coherent unit and dependencies

VOC-114 is adopted with blocked draft PR #215. VOC-106 is adopted but cannot run
safely before this correction. The seven living paths, 18 adopted-package paths, and
validator/test share one safety and rollback boundary. Splitting would publish
contradictory or unenforced policy and add coordination, elapsed-time, context,
repeated-check, exact-review, and bookkeeping overhead without a safe partial state.

## Rollback and contingency

Before merge, PR #215 remains draft/closable for zero protected effect. After merge, a
different builder prepares a separately reviewed complete revert of the actual 27-path
merge to its first parent. Never partially restore any failed candidate, reset,
force, delete a bound branch, change settings, or use a live action. Any PR/ref/
timeline/receipt/owner/topology ambiguity stops VOC-106 and preserves durable evidence.
