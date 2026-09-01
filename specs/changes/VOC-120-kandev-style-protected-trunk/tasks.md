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
preserving old controls. Complete the initial transition promotion/synchronization.

## VOC-120-T02 — Activate, reconcile, clean, and finalize

- Requirements: `VOC-120-D00` through `VOC-120-D14`
- Acceptance criteria: `VOC-120-AC-01` through `VOC-120-AC-10`
- Tests: `VOC-120-TEST-01` through `VOC-120-TEST-06`
- Evidence: `VOC-120-EV-04`, `VOC-120-EV-05`, `VOC-120-EV-06`
- Implementation PRs: `VOC-120-PR2`, `VOC-120-PR3`, `VOC-120-PR4`, `VOC-120-PR5`,
  `VOC-120-PR6`
- Status: blocked-on-t01-and-held-settings-actions

Perform additive settings activation and immediate PR2 truth; PR3 non-EHR cleanup
under old authority; final settings cutover and immediate PR4 truth; then, after both
human EHR dispositions, PR5 transition-bridge cleanup and branch finalization. Every
candidate remains bound to the frozen pre-change transition contract; PR6 records
the final branch/settings truth immediately after retirement.
