# VOC-118 — Specification

## Problem and exact evidence

Issue #223 records a required API-worker test that intermittently exceeds Vitest's
default 5,000-ms per-test timeout only in a complete hosted worker run. The exact
failure was PR #215 head `ad9edd7c9caa912d36d3885acd62d90e80bd2a84`, run
`33513868763`, job `99876022617`: 82 passed, one failed, and the named test at
`apps/api-worker/test/data-conversion.test.ts:390` timed out at exactly 5,000 ms.
The test file was unchanged by that PR.

The named test is intentionally integration-heavy. It converts a complete synthetic
PostgreSQL export, imports every D1 chunk, completes and consumes a passing
reconciliation, mutates one canonical-word row after that checkpoint, restarts
reconciliation, proves the restarted state is `pending`, and consumes the final
`fail` report while releasing the reconciliation write lock. Every step is a required
stale-evidence control; none may be removed or mocked away.

Issue evidence on the same candidate was locally green: focused 1.01 s (2.96-s
command), and complete file 20/20 with the named case at 552 ms (5.74-s file tests;
7.39-s command). Planning measurements on base
`1f535aacc48e199b222ce8f91e1f82c597666c5f` repeated the unmodified baseline:

| Run class                          | Repetitions | Result     | Named test         |
| ---------------------------------- | ----------: | ---------- | ------------------ |
| Complete `data-conversion.test.ts` |           3 | 20/20 each | 558 / 747 / 842 ms |
| Complete API-worker Vitest suite   |           3 | 99/99 each | 749 / 839 / 813 ms |

The API-worker config already sets `fileParallelism: false`; the complete suite is
not racing multiple workerd files. The observations support transient hosted
CPU/workerd scheduling contention rather than deterministic incorrect behavior, but
they do not identify a precise slow internal operation. The correction therefore
stays test-local and fail-closed.

## Requirements

1. Treat issue #223 and all run/timing data as defect intake and measurement evidence,
   not implementation or external authority.
2. Before editing, repeat at least three complete-file and three complete-worker
   Vitest runs on the exact implementation base with verbose named-test, total-test,
   Vitest-duration, test-duration, and wall-duration capture. Inspect the current
   `vitest.config.ts`, setup hooks, file serialization, and named test phases.
3. If any repeated run produces a reconciliation assertion failure, persistent D1
   error, lock leak, deterministic phase stall, or unrelated suite failure, stop. Do
   not mask it with timeout headroom; record the evidence and return to planning if a
   source/config/setup path is needed.
4. Only when the repeated baseline remains semantically green and supports contention,
   add the literal `10_000` timeout to exactly the single
   `reruns a completed reconciliation instead of returning a stale pass` test. Keep
   the default 5,000-ms timeout for every other test. Do not add a file-wide or global
   timeout, change `vitest.config.ts`, or use an environment-dependent value.
5. Preserve the test body and all causal assertions: full conversion/import, first
   passing reconciliation and lock release, post-checkpoint D1 mutation, restarted
   `pending`, final `fail`, and final lock release. Preserve all other 19 file tests,
   helper bounds, fixtures, importer/converter/reconciliation code, migration ledger,
   and public/runtime behavior.
6. Add no retry, repeat-on-failure, catch-and-ignore, fake clock, skipped/conditional
   assertion, reduced fixture, fewer chunks/pages, changed expected status, relaxed
   lock cleanup, extra serialization, or global worker/test timeout.
7. Change exactly `apps/api-worker/test/data-conversion.test.ts` in one future
   implementation PR and one task. Preserve `apps/api-worker/vitest.config.ts`,
   package scripts/lock, setup, data-conversion source/fixtures, workflows, and docs.
8. Prove the exact scoped timeout by source/diff audit, rerun the named test repeatedly,
   the complete file, complete worker suite, `ci:worker-api`, workspace validation,
   and hosted required checks. A hosted timeout or semantic failure on the final SHA
   is a blocker, never a reason for another automatic increase.
9. Require exact-SHA R3 review by a distinct non-author model/actor, complete rollback
   rehearsal, and separate non-author merge. Any edit invalidates prior review.
10. Keep the work repository-only, synthetic, credential-free, network-free, and
    deployment-free. No settings, dispatch, Cloudflare, production/learner data,
    D1 remote mutation, DNS/traffic, spending, release, main promotion, launch, or
    issue closure is authorized.

## Scope and non-goals

The sole implementation path is
`apps/api-worker/test/data-conversion.test.ts`. This package does not authorize a
global/file timeout, test retry, Vitest/workerd configuration change, setup change,
runtime performance optimization, importer or reconciliation edit, migration, public
contract change, workflow change, or dependency update. If measurement shows that
one of those is necessary, implementation stops for a new governed package.

## Risk and compatibility

The automated path floor is R1, but the test is required evidence for migration and
stale-reconciliation correctness. An overbroad timeout or weakened assertion could
hide a D1/reconciliation defect, so semantic risk is R3. The literal 10,000-ms bound
is twice Vitest's default, remains finite and test-local, and is more than eleven times
the largest planning measurement. It provides hosted scheduling headroom without
turning a hang into an unbounded wait.

## Open questions

None for the scoped correction. A future implementation that does not satisfy the
measurement gate must stop rather than choose another option.
