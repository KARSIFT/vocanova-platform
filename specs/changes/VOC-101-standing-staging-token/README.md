# VOC-101 — Operator-revoked standing Cloudflare staging token

VOC-101 is the narrow replacement package for issue #176. It changes only the
credential lifecycle introduced by VOC-100: the staging token is standing and valid
until revoked. Exact account, two permissions, environment-only placement, review
gates, staging safety, and production prohibitions remain unchanged.

VOC-101-ADOPT-01 authorizes the declared repository-only implementation once this
adopted package is on `develop`. It grants no external-action authority.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
