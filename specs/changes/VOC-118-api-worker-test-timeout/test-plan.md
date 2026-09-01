# VOC-118 — Test Plan

All tests use the committed synthetic export and local workerd/D1. No test contacts a
provider, GitHub settings, Cloudflare, remote D1, or any live system.

## VOC-118-TEST-00 — Governance and exact intake

- Covers: `VOC-118-AC-00`
- Procedure: Validate issue/run/job/head/result, local/planning measurements, allocator,
  base, draft authority, R3 risk, one task/PR/path, automatic merge policy, and holds.
- Expected: Complete nine-file draft with no implementation/external authority.
- Evidence: `VOC-118-EV-00`

## VOC-118-TEST-01 — Repeated pre-edit measurement

- Covers: `VOC-118-AC-01`
- Procedure: On the exact implementation parent, sequentially run at least three
  verbose complete-file and three verbose complete-worker Vitest runs; capture named,
  aggregate, Vitest, and wall timing plus all failures/skips/timeouts.
- Expected: All semantics pass and evidence supports contention. Otherwise implementation stops.
- Evidence: `VOC-118-EV-01`

## VOC-118-TEST-02 — Exact timeout locality

- Covers: `VOC-118-AC-02`
- Procedure: Inspect parent/head source and diff. Count one literal 10,000-ms timeout
  attached only to the exact named test. Search all changed content for global/file/
  describe timeout, `testTimeout`, `hookTimeout`, retry/repeat, environment timeout,
  fake clock, skip, or serialization changes.
- Expected: One test-local finite bound and no other timing/execution relaxation.
- Evidence: `VOC-118-EV-02`

## VOC-118-TEST-03 — Semantic preservation

- Covers: `VOC-118-AC-03`
- Procedure: Prove the named callback body and helpers preserve full conversion/import,
  first pass and lock release, exact D1 mutation, restarted pending, final fail, and
  final release. Compare all other tests/fixtures/source byte-for-byte.
- Expected: Only timeout metadata changes; every correctness assertion remains.
- Evidence: `VOC-118-EV-03`

## VOC-118-TEST-04 — Exact path and preserved configuration

- Covers: `VOC-118-AC-04`
- Procedure: Audit parent/head paths and byte identities for Vitest config/setup,
  package/lock/workflow/docs, data-conversion source/fixture, and migrations.
- Expected: Exactly one implementation path; preservation surfaces unchanged.
- Evidence: `VOC-118-EV-04`

## VOC-118-TEST-05 — Focused, complete, and hosted validation

- Covers: `VOC-118-AC-05`
- Procedure: Run the named case at least five times, complete file, complete worker,
  `pnpm run ci:worker-api`, applicable workspace validation, governance/risk/format/
  lint/type/diff checks, and hosted required checks.
- Expected: Existing 20/20 file and 99/99 worker baselines or higher, no removed/skipped/
  retried/timed-out test, and all exact-SHA checks green.
- Evidence: `VOC-118-EV-05`

## VOC-118-TEST-06 — Rollback and monitoring

- Covers: `VOC-118-AC-06`
- Procedure: Reverse/reapply in a disposable worktree and verify exact tree equality.
  After merge, monitor exact merge-SHA worker and required aggregate results.
- Expected: Exact reversible one-file change; recurrence or drift blocks closure.
- Evidence: `VOC-118-EV-06`

## VOC-118-TEST-07 — Independent review and holds

- Covers: `VOC-118-AC-07`
- Procedure: Bind distinct non-author cross-model R3 review and separate merge to the
  exact SHA; verify no external action or authority expansion.
- Expected: Zero blockers and all external/live actions remain prohibited.
- Evidence: `VOC-118-EV-07`

## Commands

- `pnpm --filter @vocanova/api-worker exec vitest run test/data-conversion.test.ts --reporter=verbose`
- `pnpm --filter @vocanova/api-worker exec vitest run --reporter=verbose`
- `pnpm --filter @vocanova/api-worker exec vitest run test/data-conversion.test.ts -t "reruns a completed reconciliation instead of returning a stale pass"`
- `pnpm run ci:worker-api`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `pnpm exec prettier --check apps/api-worker/test/data-conversion.test.ts`
- `git diff --check`
- exact path/preservation/rollback audits

No unavailable or live command may be reported as passing.

## Evidence definitions

- `VOC-118-EV-00`: allocator/intake/base/risk/authority package evidence.
- `VOC-118-EV-01`: repeated unmodified file/worker measurements and decision.
- `VOC-118-EV-02`: exact timeout-locality/no-retry audit.
- `VOC-118-EV-03`: conversion/reconciliation/lock semantic preservation.
- `VOC-118-EV-04`: one-path and preservation-surface audit.
- `VOC-118-EV-05`: focused/complete/hosted exact-SHA results.
- `VOC-118-EV-06`: rollback/reapply and post-merge monitoring.
- `VOC-118-EV-07`: independent review, merge separation, and holds.
