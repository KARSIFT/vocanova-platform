# Executable Change Packages

`specs/` contains bounded, approved, executable change packages. It is distinct from
`docs/`, which describes the approved current state, and `docs/decisions/`, which
preserves the rationale for material decisions.

Each non-trivial change uses a stable `VOC-###` identifier and a complete nine-file
package under `specs/changes/VOC-###-short-slug/`. Lifecycle state is recorded only
in `change.yaml`; prose files provide requirements, traceability, evidence, and
rollback detail. Stable decision, acceptance, task, test, risk, dependency, and
evidence identifiers must never be silently renumbered or reused.

For one approved user or business outcome, the default delivery unit is one approved
package, one implementation pull request, and one minimum-sufficient task. Task IDs
group traceability and evidence; they are not separate branch or PR quotas. Multiple
implementation PRs are exceptional and must record the concrete boundary, rollback
coherence, integration order, and overhead rationale in the active templates.

Reusable, deliberately non-approved placeholders live in
[`templates/change-package/`](templates/change-package/README.md). A copied template
is not approved implementation authority until its placeholders are replaced and the
required human authority approves it through canonical GitHub evidence.

Current packages: this repository has 60+ packages under `changes/` as of
2026-08-14 (`VOC-001` through `VOC-077`, with some numbers retired or merged into
later work). Hand-maintaining a full list here goes stale as soon as the next
package is adopted - it already had, badly, before this correction. The
`changes/` directory itself, sorted by number, is the live, authoritative list;
each package's own `change.yaml` carries its current lifecycle `status`.

The earliest packages (`VOC-001` through `VOC-004`) are worth knowing by name
because later documents reference them directly:

- [`VOC-001 — Repository Foundation`](changes/VOC-001-repository-foundation/README.md)
- [`VOC-002 — A-003 Governance Transition`](changes/VOC-002-a003-governance-transition/README.md)
  — the completed A-003 governance transition; its one-time migration approval is
  exhausted and non-reusable.
- [`VOC-003 — A-003 Lifecycle State Synchronization`](changes/VOC-003-a003-lifecycle-sync/README.md)
- [`VOC-004 — Canonical Adoption of DOC-17 and DOC-18`](changes/VOC-004-canonical-adoption-doc-17-doc-18/README.md)
  — canonical adoption of DOC-17/DOC-18, with all technical autonomy those
  documents describe remaining inactive.

This index makes no other claim about which specific documents are currently
authoritative - see each package's own `change.yaml` and `docs/README.md`'s
canonical index for that.
