# VOC-104 — Complete Wrangler version JSON before resolving uploads

VOC-104 is the minimum-sufficient defect-remediation plan for issue #186. The first
authorized staging deployment completed ordered D1 migrations and uploaded immutable
API and web Worker versions, then failed while a direct shell pipe handed each
`wrangler versions list --json` stream to the exact-tag resolver. The sanitized log
reported `EAGAIN` and `EPIPE`; no parser diagnostic appeared.

Observed evidence is GitHub Actions run
[`33372680216`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33372680216),
job
[`99427604608`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33372680216/job/99427604608),
attempt 1 at exact `develop` SHA
`53be9f7aa7aada15faedd0588686b26a4c652ecb`. Promotion and smoke never ran,
promotion rollback correctly remained skipped because promotion never began,
production remained skipped, and staging traffic stayed on its prior deployment.
The unpromoted version IDs exist only in protected workflow evidence and are
deliberately absent from this package.

The implementation will make each locked version-list command finish into a distinct
runner-local temporary file before starting the separate resolver. Focused policy
tests will forbid the direct pipe and prove complete-JSON, exact-tag, fail-before-
promotion behavior. The current runbook already states that pre-promotion failures
leave traffic unchanged and that D1 recovery is forward correction, so it is
present-compatible and needs no edit.

This draft grants no implementation or live-action authority. After adoption, the
authorized repository change remains one three-file implementation PR; any later
staging dispatch remains a separate action under the existing delivery controls.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
