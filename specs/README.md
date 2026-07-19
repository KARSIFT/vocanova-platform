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
  — proposed R4 package sourced from founder-approved issue #29 and comment
  `5017746234`. Package preparation does not approve the documents or authorize their
  adoption, application implementation, deployment, automatic merge, or production
  release; exact-revision independent verification, founder approval, and authorized
  human merge remain pending.

This index makes no claim that Documents 00–14 have been migrated.
