# VOC-116 — Acceptance Criteria

## VOC-116-AC-00 — Intake, risk, shape, and authority are exact

- Requirements: `VOC-116-D00`, `VOC-116-D06`, `VOC-116-D10`
- Tests: `VOC-116-TEST-00`
- Evidence: `VOC-116-EV-00`

The R3 draft binds issue #218 and base `b22a735...`, declares one task, one future
implementation PR, exactly six implementation paths, `automatic_merge_allowed: true`,
pending exact review/adoption, and no external or implementation authority.

## VOC-116-AC-01 — Foundation has exact bounded headroom

- Requirements: `VOC-116-D01`
- Tests: `VOC-116-TEST-01`
- Evidence: `VOC-116-EV-01`

The uniquely named foundation job has exactly one unquoted integer
`timeout-minutes: 20`. The prior value was 15; every other job timeout is byte-for-byte
unchanged. Evidence records the 5-minute/33.3% increase, 14m33s completed baseline,
15m16s canceled lifecycle, and resulting 5m27s/4m44s margins.

## VOC-116-AC-02 — Full foundation behavior is unchanged

- Requirements: `VOC-116-D02`
- Tests: `VOC-116-TEST-02`
- Evidence: `VOC-116-EV-02`

The exact `pnpm run ci:foundation` workflow command and package-script bytes remain
unchanged, all current 204 tests run and pass, and no test or command is skipped,
filtered, sharded, parallelized, retried, reordered, relaxed, or removed.

## VOC-116-AC-03 — The exact cap fails closed under drift

- Requirements: `VOC-116-D03`
- Tests: `VOC-116-TEST-03`
- Evidence: `VOC-116-EV-03`

Canonical CI passes the workflow policy. One-at-a-time fixtures for 15, 19, 21, 30,
quoted/expression/decimal values, absent/duplicate timeout, duplicate foundation job,
and 20 only on another job each fail with the intended foundation-timeout diagnostic.

## VOC-116-AC-04 — Required aggregation remains fail closed

- Requirements: `VOC-116-D04`
- Tests: `VOC-116-TEST-04`
- Evidence: `VOC-116-EV-04`

The aggregate retains `if: always()`, the complete current dependency/result mapping,
and its exact script. Synthetic foundation `success` may pass when all peers pass;
`failure`, `cancelled`, `skipped`, absent, or unknown independently returns nonzero.

## VOC-116-AC-05 — Living documentation and exact scope agree

- Requirements: `VOC-116-D05`, `VOC-116-D06`
- Tests: `VOC-116-TEST-05`
- Evidence: `VOC-116-EV-05`

Exactly the six declared implementation paths change. All three living documents state
the 20-minute measured cap, unchanged complete suite and fail-closed aggregate, and
bounded response to recurrence. No historical package or unrelated surface changes.

## VOC-116-AC-06 — Deterministic, hosted, and independent evidence passes

- Requirements: `VOC-116-D07`
- Tests: `VOC-116-TEST-06`
- Evidence: `VOC-116-EV-06`

Focused workflow tests, full 204-test foundation, `pnpm validate`, governance/risk/
diff/format checks, hosted CI/Governance/Security, exact SHA/tree/path audit, and a
different non-author exact-revision R3 review all pass with zero blockers before a
separate non-author merge.

## VOC-116-AC-07 — Rollback and monitoring remain bounded

- Requirements: `VOC-116-D08`, `VOC-116-D09`
- Tests: `VOC-116-TEST-07`
- Evidence: `VOC-116-EV-07`

A disposable reverse/reapply rehearsal proves the coherent six-path rollback. After
merge, the adoption-recorded owner records exact merge SHA, hosted links, duration,
204-test count, and results. Any cancellation, incomplete suite, non-success aggregate,
scope drift, or duration at/over 20 minutes stops closure and routes governed follow-up.
