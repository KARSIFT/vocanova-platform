# VOC-108 — Pin Wrangler's esbuild edge to the upstream deadlock fix

This draft R3 package responds to [issue #196](https://github.com/KARSIFT/vocanova-platform/issues/196). It is the minimum repository-only scope correction required to complete the already adopted VOC-107 remediation: an exact pnpm workspace override for `wrangler>esbuild` at `0.28.2`, its lockfile reconciliation, and deterministic no-network evidence that the resolved edge is correct.

The reviewed `develop` baseline resolves Wrangler `4.125.0` and its esbuild edge to
`0.28.1`; issue #196's Wrangler `4.127.1` statement is stale intake narrative, not
repository state. The override's pnpm lock re-resolution also mechanically rewrites
Vite/Vitest peer-context keys, changing their effective esbuild toolchain resolution
to the same `0.28.2` instance without changing their declared or resolved package
versions.

It neither changes VOC-107 nor authorizes its implementation by inference. This package requires its own exact-revision review, adoption, and distinct-actor implementation review before any dependency metadata changes.

No workflow, GitHub setting or secret, Cloudflare action, dispatch, deployment, migration, traffic or DNS change, production or learner-data access, spending, or launch is authorized.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
