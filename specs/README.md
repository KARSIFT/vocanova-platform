# Executable Change Packages

`specs/` contains bounded, approved, executable change packages. It is distinct from
`docs/`, which describes the approved current state, and `docs/decisions/`, which
preserves the rationale for material decisions.

Each non-trivial change uses a stable `VOC-###` identifier and a complete nine-file
package under `specs/changes/VOC-###-short-slug/`. Lifecycle state is recorded only
in `change.yaml`; prose files provide requirements, traceability, evidence, and
rollback detail. Stable decision, acceptance, task, test, risk, dependency, and
evidence identifiers must never be silently renumbered or reused.

Reusable, deliberately non-approved placeholders live in
[`templates/change-package/`](templates/change-package/README.md). A copied template
is not approved implementation authority until its placeholders are replaced and the
required human authority approves it through canonical GitHub evidence.

Current packages:

- [`VOC-001 — Repository Foundation`](changes/VOC-001-repository-foundation/README.md)
  — `implementing`; repository-file work only; issue #6.
- [`VOC-002 — A-003 Governance Transition`](changes/VOC-002-a003-governance-transition/README.md)
  — historical R4/R3 transition package; adopted and effectively activated with its
  one-time migration approval exhausted and non-reusable.
- [`VOC-003 — A-003 Lifecycle State Synchronization`](changes/VOC-003-a003-lifecycle-sync/README.md)
  — `implementing`; R4 post-activation canonical synchronization.
- [`VOC-004 — Canonical Adoption of DOC-17 and DOC-18`](changes/VOC-004-canonical-adoption-doc-17-doc-18/README.md)
  — `completed`; R4 atomic canonical-document adoption with all technical autonomy
  remaining inactive, adopted through PR #11 at canonical `develop` commit
  `2b5ecb19b532a9b23250e1255ff1e7fb9a78ef77`.
- [`VOC-005 — F2 Workspace, Tooling, and Local Command Foundation`](changes/VOC-005-f2-workspace-tooling-local-command-foundation/README.md)
  — `completed`; package adopted through PR #15 at canonical `develop` commit
  `84e096c35bc811c276ce29dc2ecc7dd967983e4b`, then bounded F2-I01/F2-I02
  implementation completed through PR #17 at canonical `develop` commit
  `d7ad6066dcb3b6467b8ad8fdbce5410ffb3542f0` after exact-revision independent
  verification returned `PASS`; issue #14 closed after lifecycle synchronization
  merged through PR #18.
- [`VOC-006 — F2 Next.js Application Foundation`](changes/VOC-006-f2-nextjs-application-foundation/README.md)
  — adopted `implementation-ready` package for F2-I03 only, sourced from founder-
  approved issue #19; adopted through PR #20 at canonical `develop` commit
  `b02327e995c7d0e754ea1a2a0a9ad331cb67145f` after exact-revision independent
  verification returned `PASS`. Issue #19 remains the active implementation issue;
  no Next.js implementation completion is claimed.
- [`VOC-007 — Canonical Product and Technical Documentation Migration`](changes/VOC-007-canonical-product-technical-documentation-migration/README.md)
  — adopted `implementation-ready` preservation-first migration package sourced
  from founder-approved issue #25; adopted through PR #26 at canonical `develop`
  commit `87bd1bc916891cc4644b24201ab991529d7d9194` after exact-revision
  independent verification and founder R4 approval. Issue #25 remains open for the
  separate migration; no Documents 00–14 implementation completion is claimed.
- [`VOC-008 — DOC-00 through DOC-12 Canonical Adoption`](changes/VOC-008-doc-00-doc-12-canonical-adoption/README.md)
  — adopted `implementation-ready` R4 package sourced from founder-approved issue #29
  and comment `5017746234`; adopted through PR #30 at canonical `develop` commit
  `f7bc58461aaafa4c8504ea3534a96f522fd8bb07` after exact-revision independent
  verification and founder R4 approval. PR #32 later merged its document-adoption
  candidate before the required independent verification and founder R4 approval.
  VOC-009 then validly reverted that merge through PR #36 and freshly re-adopted the
  reviewed reconciliation through PR #37; DOC-00 through DOC-12 become authoritative
  only when the final VOC-009 lifecycle synchronization is validly merged.
- [`VOC-009 — PR #32 R4 Gate Remediation`](changes/VOC-009-pr32-r4-gate-remediation/README.md)
  — `completed` R4 remediation package sourced from issue #29 comment
  `5031045639`; exact package candidate `3a9da8ded7e79711fc5ea0b8dbc83155b23dff41`
  passed independent verification and founder R4 approval before PR #33 merged at
  canonical `develop` commit `f28b670c0ea41577a91379e7d29618db38dd8a0a`.
  The separately gated revert merged through PR #36 at `8b88ea42de83f741f46555c3771eb26163f90a3d`,
  and the separately gated fresh adoption merged through PR #37 at
  `95408cc6e7dada087ec44d9d3a22bb3728820a06`, each after new exact-revision
  independent verification and founder R4 approval. Issue #29 closes only after this
  final lifecycle synchronization is validly merged.

- [`VOC-010 — VOC-006 Implementation Lifecycle Reconciliation`](changes/VOC-010-voc-006-lifecycle-reconciliation/README.md)
  — `proposed` R3 package sourced from corrected issue #39 and founder scope-approval
  comment `5045859897`; it authorizes no correction until valid package adoption. Its
  later separately gated scope is limited to reconciling stale VOC-006 lifecycle
  records with the valid F2-I03 implementation merged through PR #22, while preserving
  PR #24 as closed-unmerged history and granting no F2-I04, application, deployment,
  production, or autonomous-operation authority.

- [`VOC-011 — PR #40 R3 Gate Remediation`](changes/VOC-011-pr40-r3-gate-remediation/README.md)
  — `proposed` R3 remediation package sourced from issue #39 founder direction comment
  `5047420157`. PR #40 merged VOC-010 without canonical pre-merge exact-SHA independent
  verification evidence; no retroactive validation is permitted. VOC-011 requires a
  governed revert, fresh independently verified VOC-010 adoption, and final lifecycle
  synchronization before any VOC-006 correction may begin.

- [`VOC-012 — PR #41 R3 Gate Remediation`](changes/VOC-012-pr41-r3-gate-remediation/README.md)
  — adopted `implementation-ready` R3 remediation package sourced from issue #39
  founder direction comment `5052251828`. Exact package candidate
  `2e6a838f49bd6f02c0e43d33b1aee51e5ba9fec3` received independent
  `PASS WITH NON-BLOCKING FINDINGS` in comment `5063970647` before PR #42 merged as
  canonical `develop` commit `0212350114e6e68dce9c334c73713d5749166a0d`.
  After this lifecycle synchronization merges, authority is limited to preparing the
  separately gated PR #41 revert. PR #41 remains permanently procedurally invalid;
  fresh VOC-011 adoption and final synchronization remain required before PR #40
  remediation may resume.

This final synchronization records DOC-00 through DOC-12 as validly re-adopted and
authoritative upon its canonical merge; it grants no application, deployment,
production, release, or autonomous-operation authority.
