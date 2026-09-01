# VOC-118 — Implementation Plan

Implementation is prohibited until exact plan review, adoption bookkeeping, and a
normal non-author plan merge. Future implementation requires fresh evidence.

## Preconditions

1. Create an isolated branch from then-current `origin/develop` and record SHA/tree.
2. Confirm VOC-118 is adopted and the implementation inventory is exactly one path.
3. Record byte identities for every preservation surface and inspect current Vitest
   defaults, `fileParallelism: false`, setup hooks, and named-test body.

## Measurement decision gate

1. Before editing, run the complete `data-conversion.test.ts` at least three times
   with verbose reporting and record named-test, tests, Vitest, and wall durations.
2. Run the complete API-worker Vitest suite at least three times the same way. Do not
   run these measurements concurrently with each other.
3. Inspect results for assertion/D1/lock/setup errors and compare focused, file, and
   suite timing. If behavior is not consistently correct or evidence points to a
   deterministic defect, stop without a timeout edit and report the required expanded
   source/config scope for new planning.
4. If all repeated baselines pass and remain consistent with transient contention,
   proceed with the exact scoped correction below.

## Exact correction

1. In `apps/api-worker/test/data-conversion.test.ts`, define or use the literal
   `10_000` only as the timeout argument for
   `reruns a completed reconciliation instead of returning a stale pass`.
2. Do not change the callback body or any helper/fixture/assertion. The causal sequence
   remains conversion, full import, pass reconciliation/consume/release, D1 mutation,
   restarted pending, fail reconciliation/consume/release.
3. Do not touch another test or path. Reject global/file/describe timeout, config,
   retry, serialization, setup, fixture-size, chunk/page, fake-clock, skip, or source
   behavior changes.

## Validation and evidence

1. Diff-audit the named test body against its parent aside from the exact timeout token.
2. Repeat the named test at least five times, then run the complete file and complete
   worker suite. Require the existing 20/20 and 99/99 baselines or higher with no
   removal, skip, retry, timeout, cancellation, or semantic failure.
3. Run `pnpm run ci:worker-api`, applicable workspace validation, governance, R3 risk,
   format, lint, typecheck, and diff checks.
4. Audit exact one-path scope and byte equality of every preservation surface. Prove
   no `testTimeout`, `hookTimeout`, retry, or file/global timeout/config change.
5. Reverse and reapply the complete one-file diff in a disposable worktree.
6. Push one implementation PR, obtain all hosted required checks and a distinct
   cross-model R3 exact-SHA review, and resolve blockers on a new SHA.

## Rollback and stop conditions

Before merge, close the implementation PR for zero effect. After merge, use a normal
reviewed complete revert restoring the actual first parent; do not partially retain
headroom or remove assertions. Any final-SHA timeout, assertion/D1/lock failure,
resource leak, count decrease, scope drift, or need for more than 10,000 ms stops
merge and returns to planning.

## External boundary

No settings, secret, dispatch, deployment, Cloudflare, remote D1, production/learner
data, DNS/traffic, spending, release, main promotion, launch, or issue closure occurs.
