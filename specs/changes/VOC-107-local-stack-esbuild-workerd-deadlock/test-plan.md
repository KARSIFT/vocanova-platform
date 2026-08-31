# VOC-107 — Test Plan

## Evidence matrix

| ID              | Check                                                                                             | Required result                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `VOC-107-EV-00` | Exact hosted symptom plus bounded clean-worktree diagnosis record                                 | Cause is either evidenced or explicitly remains unknown; data is redacted and no state/output is committed.            |
| `VOC-107-EV-01` | Focused unit tests for the changed lifecycle/collector/tool boundary                              | Proven trigger fails before and passes after the remediation; fatal diagnostic stays terminal.                         |
| `VOC-107-EV-02` | `node --test scripts/foundation/local-stack-smoke.test.mjs` and relevant supervisor/workerd tests | Existing topology, cleanup, tree, and fail-closed negative cases pass.                                                 |
| `VOC-107-EV-03` | `pnpm run ci:local-stack` under declared bounded repeat protocol                                  | Each attempt exits 0 and leaves no child, disposable state, or repository-tree drift. Any deadlock fails the evidence. |
| `VOC-107-EV-04` | `pnpm validate`, governance validation, risk classification, `git diff --check`, and hosted CI    | Exact SHA passes required local stack and aggregate CI; reviews see the same revision.                                 |

## Diagnosis protocol

The implementation PR must state the finite number of real smoke attempts before it
runs them, with no background process and no retry after an observed fatal diagnostic.
Each attempt uses a clean worktree, the committed Node/pnpm/toolchain, credential-free
environment, and disposable state. Record only attempt number, revision, command,
versions, phase/cycle, elapsed time, exit/signal, and redacted bounded classification.

If an attempt reproduces the failure, preserve enough stack category and lifecycle
ordering to make a falsifiable hypothesis, then stop the repeated protocol and run
the focused diagnosis. If none reproduce, the result is absence of reproduction, not
proof of correctness or an upstream cause.

## Regression rules

A successful HTTP probe cannot override an unexpected workerd/esbuild fatal line.
The regression must assert that the observed deadlock signature remains fatal in the
same post-child-settlement path. Any retry regression must remain limited to the
existing exact loopback bind-collision classifier; a deadlock must never satisfy it.

For a dependency remedy, record the before/after resolved version and run all local
compatibility commands that exercise the changed package, in addition to the matrix.
