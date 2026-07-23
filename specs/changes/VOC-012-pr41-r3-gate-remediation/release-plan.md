# VOC-012 Release Plan

## Package adoption and synchronization

PR #42 adopted exact package candidate
`2e6a838f49bd6f02c0e43d33b1aee51e5ba9fec3` from base
`f1596ba9f0adb896e93368ec9cf9f111934c57c1`. Deterministic and hosted checks passed,
and exact-revision independent verification returned
`PASS WITH NON-BLOCKING FINDINGS` in comment `5063970647`, posted at
`2026-07-23T22:01:47Z`. The authorized human merge followed at
`2026-07-23T23:02:33Z`, creating canonical `develop` commit
`0212350114e6e68dce9c334c73713d5749166a0d`.

The candidate and merge trees are byte-identical at
`e0164ca01aca59512d71afee3aae4889ec701897`. Tree identity is content evidence only;
the preceding canonical report satisfied the procedural gate. Codex did not approve
or merge. PR #41's external report was not posted or reused, and PR #41 remains
permanently procedurally invalid.

After this separate synchronization validly merges, package authority extends only to
preparing the governed PR #41 revert candidate. It does not authorize that candidate's
merge or any later stage.

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
