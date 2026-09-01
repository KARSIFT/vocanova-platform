# VOC-117 — Implementation Plan

Implementation is prohibited until this exact plan candidate receives independent
specialist and cross-model R3 review, adoption bookkeeping, and normal non-author
plan-branch merge. The future implementation needs fresh exact-SHA checks and review;
plan evidence never transfers.

## Preconditions and protected areas

1. Fetch and freeze `origin/develop` at the exact base recorded in `change.yaml`.
2. Confirm a clean isolated implementation branch after adoption and verify the
   one-file path inventory.
3. Inventory the parent supervisor source, signal tests, `ci:foundation` package
   script, wildcard test discovery, and current test count before editing.
4. Treat foundation lifecycle evidence, signal outcome assertions, and cleanup
   semantics as protected. Any source/workflow/package/docs/dependency drift stops
   implementation and returns to planning.

## Technical approach

1. In the single test file, define one exact ready marker and a finite positive
   timeout (at most 5,000 ms). Keep the marker test-local and do not change the
   supervisor's production interface.
2. Add a test-only `waitForChildReady` helper that observes the supervised child's
   stdout stream, checks already-buffered `record.output`, joins split chunks, and
   handles exact marker, child error/early exit, and timeout outcomes. Dispose all
   listeners and timers exactly once on every path.
3. Update the existing parameterized SIGINT/SIGTERM fixtures so each registers its
   requested handler before writing the marker. Replace only `await delay(75)` with
   `await waitForChildReady(child)`, retaining `stopAll(signal)`, `forced === false`,
   `await child.exit`, and expected 23/24 assertions.
4. Add bounded missing-marker, wrong-marker, early-exit, split-chunk, and buffered-
   marker coverage. Keep `finally { await children.stopAll(); }` or equivalent
   cleanup for every spawned negative fixture.
5. Add deterministic source/order and disposable mutation checks. A marker-before-
   handler mutation, missing/renamed marker, fixed-delay replacement, or changed
   expected code must fail its named control; discard all mutation copies.

## Components and preservation

| Surface                                                    | Action                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| `scripts/foundation/local-development-supervisor.test.mjs` | Exact sole implementation path.                             |
| `scripts/foundation/local-development-supervisor.mjs`      | Read and diff-audit; do not edit.                           |
| `package.json` / `pnpm-lock.yaml`                          | Prove command/toolchain unchanged; do not edit.             |
| `.github/workflows/ci.yml`                                 | Prove foundation command/discovery unchanged; do not edit.  |
| `docs/development.md`                                      | Prove public supervisor semantics remain true; do not edit. |

## Testing and evidence sequence

1. Run the focused parameterized signal, bounded-negative, and escalation tests.
2. Run the complete `pnpm run ci:foundation`; capture the final TAP count and all
   failure/cancellation/skipped/todo fields.
3. Run workspace, format, lint, typecheck, test, and build validation as documented;
   no unavailable command may be reported as passing.
4. Run governance, changed-path risk, diff, and exact format checks. Audit parent/head/
   tree, one-path manifest, unchanged supervisor source/docs/package/workflow bytes,
   unchanged package script and wildcard discovery, and zero mutation residue.
5. Rehearse reverse/reapply in a disposable worktree, then push one implementation
   branch and open one PR only after adoption. Obtain hosted CI/Governance/Security,
   local-process specialist, and independent cross-model R3 exact-SHA evidence.
6. Any edit creates a new SHA and invalidates all prior exact review/check evidence.

## Rollback and deployment

There is no deployment, migration, feature flag, environment, Cloudflare, or live
activation. Before merge, discard the implementation branch/PR for zero repository
effect. After merge, revert the complete one-file change through a normal reviewed PR,
verify exact equality with the actual first parent, and rerun focused, foundation,
governance, risk, format, and diff checks. Do not partially retain the waiter or
remove assertions during rollback.

## Known technical risks

The child may emit the marker before a test-side stream listener is attached; checking
the supervised record's already-buffered output closes that race. Chunks may split the
marker; incremental accumulation must handle it. A waiter that forgets cleanup can
keep Node alive; listener/timer disposal and bounded negative tests make that visible.
A marker emitted before handler registration would preserve the original race; static
ordering and disposable mutation checks must fail it. A changed production source or
workflow would expand scope and risk and is a hard planning stop.

## Action boundary

Issue #221, this draft, and any future adoption authorize only the declared
repository-only implementation after the governed lifecycle. They do not authorize
settings, secrets, dispatch, deployment, production/data, DNS/traffic, spending,
release, main promotion, launch, or issue closure.
