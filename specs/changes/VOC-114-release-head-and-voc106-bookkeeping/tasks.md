# VOC-114 — Tasks

## VOC-114-T00 — Correct the release head and VOC-106 operational state

- Requirement source: `VOC-114-D00` through `VOC-114-D10`
- Acceptance criteria: `VOC-114-AC-00` through `VOC-114-AC-04`
- Tests: `VOC-114-TEST-00` through `VOC-114-TEST-06`
- Evidence: `VOC-114-EV-00` through `VOC-114-EV-06`
- Implementation pull-request mapping: one repository-only correction PR into develop
- Risk: R4
- Status: pending-plan-review-adoption-and-normal-plan-merge

After adoption, a different builder reconciles exactly the 16 declared existing files,
including `.github/README.md`; encodes immutable collision-checked release attempts,
main-as-merge-base/zero-main-only and release-tree equality; runs the full matrix;
obtains distinct exact specialist and R4 review; rehearses rollback; and hands the
exact revision to a separate merge actor. The task performs no release, settings,
deletion, dispatch, deployment, or other external action.

One task is minimum-sufficient because release-head policy and VOC-106 operational
bookkeeping are one safety invariant and one rollback boundary. A split would publish
contradictory instructions and add branch, coordination, elapsed-time, context,
repeated-check, exact-review, and bookkeeping overhead without a safe partial outcome.
