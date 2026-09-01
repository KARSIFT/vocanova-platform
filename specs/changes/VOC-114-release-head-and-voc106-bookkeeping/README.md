# VOC-114 — Make the release head disposable and reconcile VOC-106 bookkeeping

Issue [#213](https://github.com/KARSIFT/vocanova-platform/issues/213) identifies a
fail-closed defect in adopted VOC-106. The repository has
`delete_branch_on_merge=true`, while VOC-106 still directs a release pull request to
use permanent `develop` as its head. GitHub may delete the merged source branch, so
the plan's instruction to prove permanent-branch safety without a settings change is
not an executable control.

This R4 repository-only correction replaces that head with a short-lived
`release/voc-106-<frozen-develop-short-sha>` branch whose tip, tree, and compare are
exactly the freshly frozen `develop` candidate. The pull request still targets
`main`, uses a merge commit, invalidates on any protected-ref or candidate drift, and
records the disposable head's SHA and recreation command before merge. Existing
automatic deletion may remove that merged short-lived head; permanent `develop` and
`main` are never source-deletion targets.

The same implementation reconciles VOC-106's stale post-adoption fields and task
status, and updates every living repository surface that currently describes the
release head. Historical packages and archived snapshots remain historical evidence.
No settings mutation, manual branch deletion, deployment, Cloudflare, secret, data,
spending, launch, or production action is authorized.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
