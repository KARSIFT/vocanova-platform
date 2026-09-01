# VOC-118 — Impact Analysis

## Classification and root cause

The implementation path has an R1 automated floor. Semantic risk is R3 because this
required migration/reconciliation verifier protects stale-checkpoint detection and D1
correctness; a permissive timeout or assertion change could conceal a real defect.
There is no product/runtime/external effect and no R4 decision.

The precise hosted slow operation is uninstrumented. Evidence supports contention:
one hosted full-suite invocation hit exactly the 5,000-ms default while all assertions
passed in focused/file runs, and three fresh full-file plus three full-worker planning
runs remained green with the named test between 558 and 842 ms. The correction is
therefore a conditional, test-local 10,000-ms bound, not a claimed performance fix.

## Impact matrix

| Area                                   | Status       | Analysis                                                                          |
| -------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| Data conversion/reconciliation runtime | Preserved    | Converter, importer, schema, D1 behavior, locks, and checkpoints do not change.   |
| Required worker verification           | Affected     | One integration-heavy test may receive finite local headroom after measurement.   |
| Other tests and timeouts               | Preserved    | Default 5,000 ms remains; no retry/global/file-wide timeout.                      |
| Product/API/UI/data                    | Not affected | No runtime, API, client, UI, schema, migration, or real data change.              |
| Workflow/toolchain                     | Preserved    | Vitest config, setup, package/lock, CI workflow, and dependencies do not change.  |
| Security/privacy                       | Preserved    | Synthetic fixture only; no credential, network, production, or learner data.      |
| Operations/deployment                  | Prohibited   | No settings, dispatch, Cloudflare, deployment, D1 remote, DNS, or traffic action. |
| Rollback                               | One-file     | Complete revert restores the exact parent test behavior.                          |

## Exact inventory

Future implementation changes exactly:

1. `apps/api-worker/test/data-conversion.test.ts`

Preservation surfaces include `apps/api-worker/vitest.config.ts`,
`apps/api-worker/test/setup.ts`, `apps/api-worker/package.json`, root `package.json`,
`pnpm-lock.yaml`, `.github/workflows/ci.yml`, all `src/data-conversion/**`, the
synthetic export fixture, migrations, and `docs/development.md`.

## Failure modes and controls

- Real reconciliation bug masked: pre-edit repeated measurement and unchanged causal assertions.
- Global headroom masks other hangs: literal timeout only on one named test.
- Retry hides nondeterminism: exact source/diff audit rejects retry/repeat/catch-ignore.
- Fixture reduction weakens coverage: body, helpers, fixture, chunks, statuses, and locks preserved.
- Ten seconds still fails: final SHA is blocked; no automatic increase.
- Lock/workerd leak: repeated complete suite plus hosted aggregate must terminate cleanly.
- Scope expansion: exact one-path audit stops implementation.
- Reviewer coupling: different builder/reviewer/merge actors and fresh exact-SHA evidence.

## Delivery shape and authority

One task and one implementation PR are the largest safe coherent unit because the
measurement gate, timeout, preservation proof, validation, and rollback form one
verifier boundary. The package is repository-only and grants no external authority.
