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
  — `implementing`; R4 atomic canonical-document adoption with all technical autonomy
  remaining inactive.

This index makes no claim that Documents 00–14 have been migrated.
