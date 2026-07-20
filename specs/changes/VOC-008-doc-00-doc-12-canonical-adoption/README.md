# VOC-008 — DOC-00 through DOC-12 Canonical Adoption

## Identity and lifecycle

- Change ID: `VOC-008`
- Status: `proposed`
- Package-adoption risk: `R4`
- Planned implementation risk: `R4`, subject to the exact adoption diff
- Requirement source: founder-approved GitHub issue #29
- Scope-approval evidence: issue comment `5017746234`
- Base branch: `develop`
- Exact grounded base: `d04e3d1a95b069612414667a8f74a01af7ef271f`
- Canonical path: `specs/changes/VOC-008-doc-00-doc-12-canonical-adoption`

## Objective

Prepare implementation authority for a later, separate R4 review and canonical
adoption of proposed DOC-00 through DOC-12. The later adoption establishes the
product, research, UX, architecture, data, backend, API, web, AI, workflow, DevOps,
and MVP-roadmap baseline from which bounded application packages may be derived.

This package proposal does not approve any document and does not authorize the later
adoption until this exact package is independently verified, receives exact-revision
founder R4 approval, and is validly merged into canonical `develop`.

## Boundaries

The later adoption may reconcile only adoption-blocking contradictions, broken
references, stale lifecycle notices, and metadata/index state within DOC-00 through
DOC-12 and their derived migration/index artifacts. Every substantive correction must
be recorded and independently reviewed; higher-authority governance always wins.

DOC-13 and DOC-19 remain proposed and outside the adopted set. Existing governance,
DOC-15 through DOC-18, amendments, application code, dependencies, workflows,
infrastructure, deployment, production state, and technical-autonomy flags are
read-only or excluded.

## Risk, verification, and next gate

The package touches `specs/README.md`, producing at least the repository's protected
specification-path floor. Effective risk is R4 because the planned adoption settles
material product direction, learner-data behavior, AI user-trust posture, technical
architecture, infrastructure direction, and implementation sequencing.

EHR is not triggered by package preparation. Active A-003 adds no standing steward
approval; founder R4 approval remains required. Automatic/autonomous merge, RL1/RL2,
production deployment, and autonomous production release remain technically disabled.
Codex must stop at a draft PR and cannot verify, approve, or merge its own package.
