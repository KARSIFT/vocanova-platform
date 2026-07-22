# VOC-012 Release Plan

## Package adoption and synchronization

The first PR adds only this proposed package and its index entry. It requires R3
classification, deterministic/hosted checks, exact-SHA independent verification
posted to the PR, and authorized human merge. A separate sync must record that
adoption before remediation.

## Governed PR #41 revert

The revert is a separate PR derived mechanically from PR #41's ten paths. It preserves
VOC-012 and unrelated later history, receives its own checks/review, and requires human
merge. It performs no fresh adoption or PR #40 remediation.

## Fresh VOC-011 adoption

Fresh VOC-011 is a separate post-revert candidate. A new independent report naming its
exact SHA must be recorded on GitHub before human merge. PR #41 checks, chat report,
tree equivalence, and historical evidence cannot satisfy that gate.

## Final sync and nested remediation

A separate sync records exact package, revert, and fresh-adoption evidence. Only after
it merges may PR #40 remediation resume under VOC-011. Issue #39 remains open through
the later VOC-010/VOC-006 lifecycle sequence.

## Deployment and rollback

No preview, staging, production, release, feature flag, or operational rollout applies.
All automation/activation values remain disabled.

Before merge, close the draft/delete the branch. After merge, use a governed revert or
forward correction preserving the failure record. Re-run all specification/governance
checks and prove reverse tree identity. No runtime/data/secret/deployment rollback
exists.

## Authority

Comment `5052251828` authorizes package preparation only. Routine R3 requires no
standing founder/steward approval merely for R3, but every candidate needs independent
verification and authorized human merge. Codex cannot approve or merge its work.
