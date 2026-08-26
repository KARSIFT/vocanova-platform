# VOC-095 — Release and rollback plan

## Repository-only release boundary

VOC-095 has no deployment or external release. Its sole implementation PR updates
canonical VOC-094 bookkeeping after independent review. ACT-02 remains held pending
fresh corrected-SHA review and exact action authority; this correction does not
activate staging or discharge any VOC-080/VOC-085 hold.

The implementation PR must merge normally into `develop` through a non-author actor.
Before merge, record exact source branch/tip and all required evidence. After merge,
read back the merge SHA, `develop`, post-merge checks, source-head lifecycle,
worktrees, and recovery refs. Do not manually delete any branch, worktree, or ref.

## Rollback

If the repository correction is materially wrong, a separately reviewed revert of the
VOC-095 implementation PR restores the prior canonical text. The revert does not
delete, restore, query, migrate, or otherwise mutate the preserved D1 or any other
external system. A revert cannot authorize ACT-02 and does not alter VOC-080-HOLD-00,
VOC-080-HOLD-01, VOC-080-HOLD-02, or VOC-085-HOLD-00.

## Closure evidence

Closure requires the exact implementation candidate review, genuine eligibility,
normal non-author merge, successful applicable post-merge checks, source-head
recreation/lifecycle readback, and proof that no external action occurred. The
issue may be closed only after those repository-only facts are recorded; ACT-02
remains a separate held action.
