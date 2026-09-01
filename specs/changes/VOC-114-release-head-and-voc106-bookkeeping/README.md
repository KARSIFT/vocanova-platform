# VOC-114 — Make the release head disposable and reconcile VOC-106 bookkeeping

Issue [#213](https://github.com/KARSIFT/vocanova-platform/issues/213) identifies a
fail-closed defect in adopted VOC-106. The repository has
`delete_branch_on_merge=true`, while VOC-106 still directs a release pull request to
use permanent `develop` as its head. GitHub may delete the merged source branch, so
the plan's instruction to prove permanent-branch safety without a settings change is
not an executable control.

This R4 repository-only correction replaces that head with a short-lived
`release/voc-106-<frozen-develop-short-sha>` branch whose tip and tree are exactly the
freshly frozen `develop` candidate. Frozen `main` must be the merge base and have zero
main-only commits. The pull request still targets `main`, uses a merge commit, and its
resulting merge tree must equal the frozen develop/release-head tree.

Each release head is an immutable attempt. Protected-ref or candidate drift closes
and abandons that draft PR/ref without deleting or rewriting it, then starts a newly
named ref/PR after a fail-closed collision check. Existing automatic deletion may
remove only a successfully merged short-lived head after its SHA and recreation
command are recorded; permanent `develop` and `main` are never deletion targets.

The same implementation reconciles VOC-106's stale post-adoption fields and task
status, and updates all seven living repository surfaces—including `.github/README.md`
with the exact attempt, ancestry, tree, collision, and deletion boundary—that describe
the release head. Historical packages and archived snapshots remain evidence.
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
