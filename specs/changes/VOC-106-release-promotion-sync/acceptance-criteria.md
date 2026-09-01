# VOC-106 — Acceptance Criteria

## VOC-106-AC-00 — Fresh, reviewable release promotion

- Requirement source: `VOC-106-D00`–`D03`
- Tasks: `VOC-106-T00`
- Tests: `VOC-106-TEST-00`, `VOC-106-TEST-01`
- Evidence: `VOC-106-EV-00`, `VOC-106-EV-01`
- Result: pending

The `main`-targeted PR from the claim/full-SHA-attempt/submit identity names this package and uses an
identifiable merge commit. Fresh evidence proves the head is an exact SHA/tree alias
of frozen develop, frozen main is the merge base with zero main-only commits, compare
has no extra content, and prospective/actual merge trees equal frozen develop/head.
Applicable checks, complete R4 evidence, different-actor exact review, resolved
blockers, and separate non-author merger pass. Only verified submit `201` authorizes
one POST; marker-plus-zero is `submit-outcome-unknown`; post-claim drift is irrecoverable;
cardinality resolves first; protected refs remain immutable.

## VOC-106-AC-01 — Required post-promotion synchronization

- Requirement source: `VOC-106-D04`
- Tasks: `VOC-106-T01`
- Tests: `VOC-106-TEST-02`, `VOC-106-TEST-03`
- Evidence: `VOC-106-EV-02`, `VOC-106-EV-03`
- Result: pending

The synchronization PR uses a short-lived current-`develop` head—not permanent
`main`—merges current `main` ancestry into it, receives fresh exact review, and
merge-commits into `develop`.

## VOC-106-AC-02 — Final history and safety proof

- Requirement source: `VOC-106-D05`–`D06`
- Tasks: `VOC-106-T00`, `VOC-106-T01`
- Tests: `VOC-106-TEST-04`, `VOC-106-TEST-05`
- Evidence: `VOC-106-EV-04`, `VOC-106-EV-05`
- Result: pending

Readback proves the actual release tree equals the frozen develop/head tree, both
permanent branches remain, `main` is an ancestor of `develop`, and `develop` is zero
commits behind `main`; evidence records names, exact SHAs, trees, and nonexecuted
recovery commands for both successfully merged short-lived heads and proves no
settings query/mutation, manual deletion, or live-system action occurred.

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
