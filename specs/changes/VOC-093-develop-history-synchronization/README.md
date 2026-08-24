# VOC-093 — Synchronize develop ancestry after main promotion

Status: draft. This package is not adopted and does not authorize implementation.

Issue [#155](https://github.com/KARSIFT/vocanova-platform/issues/155) records the
current repository-history drift observed on 2026-08-24 UTC after VOC-092's verified
`develop` → `main` promotion:

- `origin/develop` = `0dd1c935354961f2d3ff9900efa128dd418fa61e`
- `origin/main` = `718ea9d9d5ff3476de9db9439414c2a6e07a6f4a`
- `git rev-list --left-right --count origin/develop...origin/main` = `0 23`
- both trees = `c0cb3f6ec029898d7d12321a8723a4457164173b`
- `develop` is an ancestor of `main`

There is no product-content loss. The problem is commit-history drift: `main` contains
the release merge commit and older main-only history that `develop` does not yet
record, so GitHub reports `develop` as behind `main` even though the trees are equal.

This package keeps the delivery unit coherent:

- one approved package;
- one minimum-sufficient task; and
- one implementation pull request into `develop`.

That implementation PR must use a short-lived synchronization branch, merge the then-
current `main` ancestry into it, update the living release/governance surfaces that
describe promotion/finalization, add the minimum deterministic guard/tests for that
boundary, and merge back to `develop` with a merge commit so ancestry is preserved.
Using `main` itself as a temporary PR head is prohibited.

This package deliberately excludes:

- any `main` mutation;
- any GitHub settings mutation;
- any branch or worktree deletion;
- any Cloudflare, DNS, deployment, environment, secret, production-data, migration,
  traffic, spending, or launch action; and
- any interference with the dirty VOC-090 worktree/branch or other existing recovery
  exceptions.

`automatic_merge_allowed: true` is explicitly examined package metadata only. No
workflow performs a merge, and this package does not change that.
