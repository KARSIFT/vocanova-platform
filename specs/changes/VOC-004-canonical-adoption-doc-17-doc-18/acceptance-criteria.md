# VOC-004 Acceptance Criteria

## VOC-004-AC-01 — Exact atomic canonical placement

DOC-17 and DOC-18 both exist at their required canonical destinations; neither is
adopted alone.

Evidence: file list, indexes, deterministic required-file and atomic-state checks.

## VOC-004-AC-02 — Frozen source provenance

The package records the exact source paths and SHA-256 values
`8c9fd7b714e84d39f4b5e9d5c8a4cf8f00a3231b269e2d6dadf6e0ff7707693a`
and `717c33649f49cedca64cc4744d8121f4b6f5a371c9760076bfa8134c050a8664`.

Evidence: package review and source `sha256sum` output.

## VOC-004-AC-03 — Substantive bodies preserved

Lifecycle integration changes frontmatter only. DOC-17 body SHA-256 is
`b3a157557210f0afecbb5ed4ff53cd2738f50c451c39ef0d012363a6d8df7a40`; DOC-18
body SHA-256 is `3d578186804cc2b3b500eec72809b26c03d9f236a4a22d3534daa1e2ba34c451`.

Evidence: validator constants, positive validation, and body-mutation regression tests.

## VOC-004-AC-04 — Adoption is not activation

Both repository-adoption flags are true. Control Plane implementation, RL1, RL2,
automatic merge, autonomous merge, production deployment, and autonomous production
release remain false or disabled, and both canonical documents say technical
activation is inactive.

Evidence: state and policy diff plus negative regression tests for false activation.

## VOC-004-AC-05 — Historical authority preserved

A-003 exact lifecycle evidence, exhausted and non-reusable VOC-002 migration approval,
and permanent historical technical-steward evidence are unchanged and still enforced.

Evidence: existing and updated validator tests.

## VOC-004-AC-06 — Discoverability and taxonomy

The root documentation, architecture, planning, and specification indexes link the
new canonical baseline without creating a new taxonomy.

Evidence: index diff and link/path inspection.

## VOC-004-AC-07 — R4 controls

The path classifier reports R4, identifies the establishing protected paths, and
accepts a declared `Risk classification: R4`.

Evidence: required classifier command against the candidate and PR body.

## VOC-004-AC-08 — Deterministic validation

All required unit, repository-foundation, shell syntax, governance, classifier, and
diff checks pass on the complete candidate.

Evidence: commands and results recorded in the draft PR.

## VOC-004-AC-09 — Product priority retained

The canonical roadmap and package state that automation supports rather than postpones
the VocaNova MVP and does not create an immediate roadmap execution commitment.

Evidence: planning index, package README, and impact analysis.

## VOC-004-AC-10 — Future approval gates remain pending

The draft PR identifies independent exact-SHA Claude Code verification and exact-SHA
founder R4 approval as pending. EHR is not triggered, standing technical-steward
approval is not applicable, and no merge or deployment authority is claimed.

Evidence: draft PR metadata and package lifecycle documents.
