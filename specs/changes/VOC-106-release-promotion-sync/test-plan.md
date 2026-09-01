# VOC-106 — Test Plan

## VOC-106-TEST-00 — Release fresh-freeze and invalidation

- Covers: `VOC-106-AC-00`
- Procedure: fetch both protected refs; record SHA/tree/merge-base/divergence/compare;
  require frozen main as merge base and zero main-only commits; derive the exact
  SHA-named release head; prove name absence/same-attempt ownership, head/develop
  SHA/tree identity, no extra head commit or compare tree, and deliberately compare
  every recorded value after each review/check boundary.
- Expected result: the collision-free immutable alias is exact, or the attempt is
  closed and abandoned without ref mutation/deletion and freshly recreated under a
  new freeze, name, PR, checks, and reviews.
- Evidence: `VOC-106-EV-01`

## VOC-106-TEST-01 — Reviewed release merge method and boundary

- Covers: `VOC-106-AC-00`
- Procedure: synthesize the prospective merge without moving refs; inspect exact PR
  metadata, required checks/reviews, merge method and resulting commit; compare both
  prospective and actual merge trees with frozen develop/head; inspect the PR event's
  workflow outcomes and permanent-ref readback.
- Expected result: merge commit only and all three trees equal; R4 evidence complete;
  no deployment/dispatch, settings query/mutation, manual deletion, or foreign/ref
  rewrite; permanent `develop` and `main` remain present.
- Evidence: `VOC-106-EV-01`

## VOC-106-TEST-02 — Short-lived synchronization construction

- Covers: `VOC-106-AC-01`
- Procedure: after release, fetch current refs and prove the synchronization branch
  began at current `develop`, merged current `main`, and is the PR head.
- Expected result: permanent `main` is never the PR head; a new exact freeze exists.
- Evidence: `VOC-106-EV-02`

## VOC-106-TEST-03 — Reviewed synchronization merge method

- Covers: `VOC-106-AC-01`
- Procedure: inspect exact sync PR checks, different-actor review, blocker status,
  merger identity, and merge method.
- Expected result: a separately reviewed merge commit reaches `develop`.
- Evidence: `VOC-106-EV-03`

## VOC-106-TEST-04 — Final ancestry and zero-behind proof

- Covers: `VOC-106-AC-02`
- Procedure: after synchronization, run `git merge-base --is-ancestor origin/main
origin/develop` and `git rev-list --right-only --count origin/develop...origin/main`.
- Expected result: first command exits 0 and second returns `0`.
- Evidence: `VOC-106-EV-04`

## VOC-106-TEST-05 — Scope and recoverability negative checks

- Covers: `VOC-106-AC-02`
- Procedure: read back action audit and branch list; verify no settings query/mutation,
  dispatch, deployment, Cloudflare/DNS, secret/data, spend, force update, or manual
  deletion occurred; require permanent refs present. For the merged synchronization
  head, record name/SHA/tree and validate its nonexecuted
  recreate syntax. Negative fixtures cover permanent/wrong heads, stale or diverged
  refs, non-main merge base, nonzero main-only, wrong SHA/tree, extra commits/trees,
  prospective/actual tree mismatch, name collision, moved PR/check/review evidence,
  reuse/force-update after invalidation, and missing recovery evidence.
- Expected result: only permitted repository history changes occur; protected release
  refs remain immutable and only the merged synchronization head is deletion eligible.
- Evidence: `VOC-106-EV-05`

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
