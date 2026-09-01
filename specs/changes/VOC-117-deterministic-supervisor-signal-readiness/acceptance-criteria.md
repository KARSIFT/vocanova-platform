# VOC-117 — Acceptance Criteria

## VOC-117-AC-00 — Intake, lifecycle, risk, and authority are exact

- Requirements: `VOC-117-D00`, `VOC-117-D01`, `VOC-117-D07`, `VOC-117-D11`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-00`
- Evidence: `VOC-117-EV-00`

The draft binds issue #221, failed run/job, candidate and base SHAs, exact one-file
implementation inventory, R3 semantic risk, one task/one future implementation PR,
`automatic_merge_allowed: true`, pending review/adoption, and
`implementation_authorized: false`. It grants no external authority.

## VOC-117-AC-01 — Both signal fixtures establish readiness deterministically

- Requirements: `VOC-117-D02`, `VOC-117-D04`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-01`
- Evidence: `VOC-117-EV-01`

SIGINT and SIGTERM fixtures each register the exact handler before emitting one exact
sentinel. The parent awaits that sentinel, sends the parameterized signal once,
`stopAll` returns `false`, and the settled outcome code is respectively 23 and 24.
No fixed 75-ms precondition remains.

## VOC-117-AC-02 — The waiter is bounded and stream-correct

- Requirements: `VOC-117-D03`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-02`
- Evidence: `VOC-117-EV-02`

The test-only waiter has a declared finite timeout no greater than 5,000 ms, sees an
already-buffered sentinel, joins split stdout chunks, resolves exactly once, and
cleans listeners/timer on every outcome.

## VOC-117-AC-03 — Negative readiness cases cannot hang or leak

- Requirements: `VOC-117-D05`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-03`
- Evidence: `VOC-117-EV-03`

Missing-sentinel, wrong-sentinel, and early-exit fixtures reject with bounded,
fixture-specific diagnostics. Each test settles its child in `finally`; no test leaves
an active timer, listener, process, or port, and no internal retry masks the failure.

## VOC-117-AC-04 — Mutation controls fail closed

- Requirements: `VOC-117-D06`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-04`
- Evidence: `VOC-117-EV-04`

In a disposable copy, removing/renaming the marker, splitting it incorrectly,
emitting it before handler installation, restoring the former fixed delay, or changing
either expected exit code fails the corresponding readiness/order/no-fixed-delay/
outcome control. The canonical candidate passes after the copy is discarded.

## VOC-117-AC-05 — Runtime and foundation semantics are preserved

- Requirements: `VOC-117-D01`, `VOC-117-D04`, `VOC-117-D07`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-05`
- Evidence: `VOC-117-EV-05`

Only `scripts/foundation/local-development-supervisor.test.mjs` changes in the future
implementation. The runtime supervisor, signal forwarding, sibling shutdown,
escalation, close/diagnostic collection, docs, package scripts, workflow, dependencies,
and test discovery remain byte-for-byte or behaviorally unchanged as applicable.

## VOC-117-AC-06 — Required deterministic and exact-revision evidence passes

- Requirements: `VOC-117-D08`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-06`
- Evidence: `VOC-117-EV-06`

Focused tests, complete foundation validation, workspace/governance/risk/format/diff
checks, hosted required checks, exact path/SHA/tree audit, a distinct lifecycle
specialist review, and an independent cross-model R3 PASS by a different non-author
actor all pass on the exact candidate. Plan and implementation evidence do not
transfer across revisions; a separate non-author actor merges only after eligibility.

## VOC-117-AC-07 — Rollback and monitoring are complete

- Requirements: `VOC-117-D09`, `VOC-117-D11`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-07`
- Evidence: `VOC-117-EV-07`

A disposable reverse/reapply rehearsal restores the true parent and reapplies the
one-file candidate without residue. Post-merge monitoring records exact merge SHA,
foundation/full-suite result, aggregate result, and child-settlement evidence; any
recurrence, leak, timeout, forced-kill drift, or scope drift blocks closure and routes
governed follow-up.

## VOC-117-AC-08 — Self-modification boundary remains closed

- Requirements: `VOC-117-D08`, `VOC-117-D10`
- Tasks: `VOC-117-T00`
- Tests: `VOC-117-TEST-08`
- Evidence: `VOC-117-EV-08`

The exact diff proves zero change to governance, validators, permissions, review
rules, merge conditions, deployment authority, agent authority, runtime supervisor,
credentials, or external systems. Cross-model review is recorded as scoped R3
defense in depth and never as authority; any protected-surface expansion stops for a
new package.
