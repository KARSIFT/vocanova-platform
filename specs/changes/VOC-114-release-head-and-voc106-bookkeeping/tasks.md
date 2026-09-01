# VOC-114 — Tasks

## VOC-114-T00 — Correct the release head and VOC-106 operational state

- Requirement source: `VOC-114-D00` through `VOC-114-D10`
- Acceptance criteria: `VOC-114-AC-00` through `VOC-114-AC-04`
- Tests: `VOC-114-TEST-00` through `VOC-114-TEST-06`
- Evidence: `VOC-114-EV-00` through `VOC-114-EV-06`
- Implementation pull-request mapping: one repository-only correction PR into develop
- Risk: R4
- Status: adopted; prospectively corrected by adopted VOC-115; exact 27-path
  repository implementation in progress pending checks and different-actor review

The builder reconciles exactly VOC-115's 27 paths, including `.github/README.md`, all
VOC-106/VOC-114 artifacts, and validator/test; encodes durable protected attempts,
main-as-merge-base/zero-main-only and release-tree equality; runs the full matrix;
obtains distinct exact specialist and R4 review; rehearses rollback; and hands the
exact revision to a separate merge actor. The task performs no release, settings,
deletion, dispatch, deployment, or other external action.

One task is minimum-sufficient because release-head policy and VOC-106 operational
bookkeeping are one safety invariant and one rollback boundary. A split would publish
contradictory instructions and add branch, coordination, elapsed-time, context,
repeated-check, exact-review, and bookkeeping overhead without a safe partial outcome.

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
