# VOC-107 — Impact Analysis

## Operational impact

The observed behavior is correctly fail-closed but intermittently blocks the
repository's required Worker-integration validation. A careless change could instead
make CI pass after a real workerd/esbuild failure, which would weaken the protected
control. That is why the semantic class is R3 and why diagnostic preservation is an
acceptance criterion.

The likely affected boundary is narrow: the disposable two-Worker smoke and its
toolchain/lifecycle interfaces. The specific cause is unknown, so candidate paths are
an inventory boundary, not blanket edit authority. Source, package, and lock changes
must be reduced to a proven causal subset.

## Principal risks and controls

| Risk                                                          | Control                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A transient host/tool race is mistaken for application logic. | Record exact versions/stage/cycle; use controlled clean-worktree attempts and distinguish hypotheses from evidence. |
| A retry or output change masks a genuine runtime failure.     | Keep fatal diagnostics terminal; test the observed diagnostic independently of HTTP success.                        |
| A broad tool upgrade changes Worker behavior.                 | Permit a dependency/lock change only when causal and minimum; run compatibility, local-stack, and hosted CI checks. |
| A lifecycle edit leaks children, state, or generated files.   | Preserve bounded signals/stdio settlement, disposable roots, port checks, and repository-tree assertions.           |
| Investigation captures sensitive local output.                | Commit no raw logs/state; retain only bounded redacted evidence.                                                    |

## Privacy, data, accessibility, and delivery

The local stack is credential-free and loopback-only. This work changes no user
interface, accessibility behavior, schema, analytics, production or learner data.
It has no Cloudflare, GitHub settings, secret, DNS, traffic, migration, spending, or
deployment effect. Existing production holds remain unchanged.

## Rollback

An unmerged branch has no effect. After merge, use a separate reviewed revert PR that
restores only the proven implementation subset (and matching lockfile if present),
runs the same focused/local-stack/workspace checks, and confirms hosted required CI.
No remote artifact or data rollback exists or is needed.
