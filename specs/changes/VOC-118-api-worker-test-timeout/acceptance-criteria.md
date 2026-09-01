# VOC-118 — Acceptance Criteria

## VOC-118-AC-00 — Intake, allocator, risk, and authority are exact

- Requirements: `VOC-118-D00`, `D01`, `D09`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-00`
- Evidence: `VOC-118-EV-00`

The draft binds issue #223, the exact hosted run/job/head/result, local and planning
measurements, exact base, VOC-118 allocation, R3 semantic risk, one task/PR,
`automatic_merge_allowed: true`, draft status, and no implementation/external authority.

## VOC-118-AC-01 — Baseline measurement gates the correction

- Requirements: `VOC-118-D02`, `D03`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-01`
- Evidence: `VOC-118-EV-01`

At least three unmodified complete-file and three complete-worker runs on the exact
implementation base record named/aggregate/wall timing and all pass. Any semantic,
lock, D1, deterministic-phase, or unrelated failure stops timeout implementation.

## VOC-118-AC-02 — Timeout headroom is exact and test-local

- Requirements: `VOC-118-D04`, `D06`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-02`
- Evidence: `VOC-118-EV-02`

Exactly the named stale-reconciliation test receives one literal 10,000-ms timeout.
No other test, describe block, file, Vitest config, hook, worker, or global timeout
changes, and no retry or environment-dependent timeout exists.

## VOC-118-AC-03 — Conversion and reconciliation semantics are unchanged

- Requirements: `VOC-118-D05`, `D06`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-03`
- Evidence: `VOC-118-EV-03`

The test still proves complete conversion/import, initial pass, lock release,
post-checkpoint mutation, restarted pending state, final fail, and final lock release.
All other assertions, tests, fixtures, helper bounds, and production source are unchanged.

## VOC-118-AC-04 — Exact scope and preservation surfaces hold

- Requirements: `VOC-118-D07`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-04`
- Evidence: `VOC-118-EV-04`

The implementation diff contains exactly one path. Vitest config, setup, package/lock,
data-conversion source/fixtures, migrations, workflows, and documentation are unchanged.

## VOC-118-AC-05 — Focused, aggregate, and hosted checks pass

- Requirements: `VOC-118-D08`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-05`
- Evidence: `VOC-118-EV-05`

Repeated named tests, complete file, complete worker suite, `ci:worker-api`, workspace,
governance/risk/format/diff, and hosted required checks pass on the exact SHA with no
retry, timeout, cancellation, skip, or semantic failure.

## VOC-118-AC-06 — Rollback and monitoring remain fail closed

- Requirements: `VOC-118-D08`, `D09`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-06`
- Evidence: `VOC-118-EV-06`

A disposable reverse/reapply restores the exact implementation parent and candidate.
After merge, exact merge-SHA worker/aggregate results are monitored; recurrence,
semantic drift, timeout, lock/resource leak, or scope drift blocks issue closure.

## VOC-118-AC-07 — Independent review and external holds remain intact

- Requirements: `VOC-118-D09`, `D10`
- Task: `VOC-118-T00`
- Tests: `VOC-118-TEST-07`
- Evidence: `VOC-118-EV-07`

Distinct non-author exact-SHA cross-model R3 review and separate merge are required.
No settings, dispatch, deploy, remote D1, production/data, DNS, spending, release,
main, launch, or issue-closure authority is created.
