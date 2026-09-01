# VOC-114 — Make the release head disposable and reconcile VOC-106 bookkeeping

Issue [#213](https://github.com/KARSIFT/vocanova-platform/issues/213) identifies a
fail-closed defect in adopted VOC-106. The repository has
`delete_branch_on_merge=true`, while VOC-106 still directs a release pull request to
use permanent `develop` as its head. GitHub may delete the merged source branch, so
the plan's instruction to prove permanent-branch safety without a settings change is
not an executable control.

VOC-115 prospectively replaces that blocked correction with the deterministic claim,
full-SHA protected attempt, and allocation-bound submit-marker identity whose tip/tree
are exactly the freshly frozen `develop` candidate. Frozen `main` must be the merge base and have zero
main-only commits. The pull request still targets `main`, uses a merge commit, and its
resulting merge tree must equal the frozen develop/release-head tree.

Only a verified submit `201` invocation may POST once; marker-plus-zero is
`submit-outcome-unknown`. Post-claim drift is irrecoverable and cardinality resolves
first. Claim/attempt/submit refs remain protected forever; automatic deletion may
remove only the successfully merged synchronization head.

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

## VOC-115 durable release-attempt contract

This is the operative prospective procedure; every conflicting SHA-only, generic
collision, blanket abandonment/retry, and release-attempt auto-deletion instruction
above is retained only as superseded history. Adopted VOC-115 uses deterministic
`release/voc-106-claim-*`, a full-SHA attempt ref, and allocation-bound
`release/voc-106-submit-*`. Exact same-target atomic requests coalesce; foreign,
malformed, or post-claim stale topology stops. Only the exact invocation verifying the
submit-marker `201` may send one canonical no-retry/no-redirect PR POST. Every other
observer/response and marker-plus-zero is `submit-outcome-unknown`, never retry.

The separately authorized held active no-bypass three-pattern ruleset plus exhaustive
numeric-max history equality is a prerequisite. Lossless exact page/object/command/
scan/pass schemas, dual-source refs, two stable passes, null-provenance stops, and
cardinality-first cleanup apply. Claim, attempt, and submit refs remain immutable and
never deletion eligible; same-`develop` retry requires a deterministic closed/conflict
frontier and fresh distinct identity. `VOC-080-HOLD-01` and every settings/ref/release/
deployment/live hold remains. Approved SHA/review/adoption evidence is unchanged.
