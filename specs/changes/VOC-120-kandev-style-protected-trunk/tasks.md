# VOC-120 — Tasks

## VOC-120-T01 — Prepare dual-compatible repository controls

- Requirements: `VOC-120-D00` through `VOC-120-D14`
- Acceptance criteria: `VOC-120-AC-01`, `VOC-120-AC-03`, `VOC-120-AC-04`,
  `VOC-120-AC-05`, `VOC-120-AC-08`, `VOC-120-AC-10`
- Tests: `VOC-120-TEST-01` through `VOC-120-TEST-05`
- Evidence: `VOC-120-EV-02`, `VOC-120-EV-03`
- Implementation PR: `VOC-120-PR1`
- Status: blocked-on-adoption

Install the concise future model, machine lane/path policy, aggregate gates, review
contract, EHR runbook, transition inventory, and immutable pre-change verifier while
preserving old controls. Merge only to `develop`; do not cross the active release EHR.

## VOC-120-T02 — Activate, reconcile, clean, and finalize

- Requirements: `VOC-120-D00` through `VOC-120-D14`
- Acceptance criteria: `VOC-120-AC-01` through `VOC-120-AC-10`
- Tests: `VOC-120-TEST-01` through `VOC-120-TEST-06`
- Evidence: `VOC-120-EV-04`, `VOC-120-EV-05`, `VOC-120-EV-06`, `VOC-120-EV-07`,
  `VOC-120-EV-08`, `VOC-120-EV-09`
- Implementation PRs: `VOC-120-PR2`, `VOC-120-PR3`, `VOC-120-PR4`, `VOC-120-PR5`,
  `VOC-120-PR6`, `VOC-120-PR7`
- Status: blocked-on-t01-qualified-human-ehr-and-held-actions

After qualified confirmation, adoption, and PR1 merge, close PR #215 unmerged under
its hold and add only the exact issue #231 aggregate-dispatch test in PR2;
perform merge-compatible settings action A and immediate PR3 truth; complete PR4
cleanup plus the final old-model promotion/synchronization; then perform action B and
immediate doc-only PR5 truth; activate policy plus consolidated truth through exact
two-path PR6 under old authority.
Permanent `Policy / required` enforces PR1/PR2 by tracked digest and PR3-PR6 by
protected ref, then becomes the future aggregate. Action C enables the queue and
immediate PR7 records/exercises it.
