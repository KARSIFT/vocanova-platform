# VOC-116 — Restore foundation CI timeout headroom

Issue [#218](https://github.com/KARSIFT/vocanova-platform/issues/218) records an
otherwise passing 204-test foundation suite crossing the foundation job's 15-minute
GitHub Actions timeout. The reviewed PR run completed the job in 14m33s, while the
same tree's post-merge push validation was canceled after the job reached the declared
cap; every other required subsystem passed and the aggregate correctly failed closed.

This draft R3 repository-only package raises only the `foundation` job timeout from
15 to exactly 20 minutes. The five-minute increase is bounded and measured: it adds
33.3% to the old budget and 5m27s over the longest completed 14m33s job. A focused
workflow validator and negative fixtures freeze that exact value, preserve complete
`pnpm run ci:foundation` execution and prove that cancellation or any other
non-success result still blocks `CI / ci required`. Three living CI/development
documents record the same contract.

The package does not remove, skip, shard, parallelize, reorder, retry, or weaken any
foundation command or test. It authorizes no implementation until exact-revision
independent review, adoption bookkeeping, and normal plan merge. It grants no GitHub
settings, deployment, Cloudflare, secret, data, production, spending, release, or live
authority.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
