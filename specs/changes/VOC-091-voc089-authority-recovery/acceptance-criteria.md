# VOC-091 - Acceptance Criteria

## VOC-091-AC-00 - Incident record is complete and not sanitized

- Requirements: `VOC-091-D00`, `D06`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-00`, `TEST-02`
- Evidence: `VOC-091-EV-00`
- Result: pending

All nine VOC-089 records preserve the exact blocked adapter decision, five reason
codes, later review, inaccurate readiness claim, PR #141 merge, post-merge CI
`32722900390`, Governance `32722900352`, Security `32722900426`, post-merge audit, and
the distinct PR #137 precedent. None describes PR #141 as normal or cured by later
review or post-merge passes.

## VOC-091-AC-01 - VOC-089 authority is explicitly inactive before recovery

- Requirements: `VOC-091-D01`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-01`
- Evidence: `VOC-091-EV-01`
- Result: pending

VOC-089 `change.yaml` and all active narrative/status records state that PR #141 did
not establish effective implementation authority and PR #147 remains blocked. They
preserve the valid semantic-candidate/adoption authorization and
`implementation_authorized: true`, while clearly recording
`implementation.authority_effective: false` pending VOC-091 recovery. The adoption
decision is not falsely treated as activation evidence.

## VOC-091-AC-02 - Prospective recovery has a fail-closed activation contract

- Requirements: `VOC-091-D02`, `D03`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-03`, `TEST-04`
- Evidence: `VOC-091-EV-02`
- Result: pending

The recovery contract requires the recovery implementation's final exact head to have
a different-actor PASS, one complete binder bound to that head, an actual pre-merge
adapter output `eligible: true` with `reasons: []`, normal merge, and applicable
post-merge results before VOC-089 authority is effective. A structural success job,
later comment, review, or post-merge result cannot substitute for the pre-merge JSON.

## VOC-091-AC-03 - PR #147 has a safe resumption boundary

- Requirements: `VOC-091-D04`, `D05`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-05`
- Evidence: `VOC-091-EV-03`
- Result: pending

PR #147 remains open as a draft unless it proves unsafe to rebase. It cannot merge or
reuse any current evidence. Only after recovery completion may it rebase/refresh and
then independently satisfy its own exact-review, binder, eligible-true, normal-merge,
and post-merge gates. Issue #148 closes after recovery; issue #140 does not close until
that later implementation completes.

## VOC-091-AC-04 - Recovery scope and rollback remain repository-only

- Requirements: `VOC-091-D02`, `D05`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-06`, `TEST-07`
- Evidence: `VOC-091-EV-04`
- Result: pending

The recovery implementation changes only the nine named VOC-089 package files, passes
the required governance/classifier/format/diff checks, receives exact independent
review, and is recoverable by a normal revert PR. It changes no product, workflow,
evaluator, validator, settings, deployment, Cloudflare/live system, `main`, secret, or
production-data path.

## VOC-091-AC-05 - The inactive VOC-089 implementation contract is preserved

- Requirements: `VOC-091-D07`
- Task: `VOC-091-T00`
- Tests: `VOC-091-TEST-08`
- Evidence: `VOC-091-EV-05`
- Result: pending

The recovery preserves VOC-089 D00-D05, AC00-AC04, task/test/evidence mappings, the
one-task/eight-file PR #147 contract, risk/non-goals/rollback, and issue #140 boundary.
It adds only the incident/recovery lifecycle overlay, so PR #147 has an exact inactive
contract to revalidate after authority becomes effective.
