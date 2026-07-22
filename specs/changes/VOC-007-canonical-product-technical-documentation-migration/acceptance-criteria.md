# VOC-007 Acceptance Criteria

## VOC-007-AC-01 — Complete adopted package

A complete nine-file package and canonical package index bind the approved source
snapshot, stable requirements, tasks, tests, risks, evidence, and rollback before
migration begins.

Traceability: `VOC-007-R01`; `VOC-007-T01`; `VOC-007-TEST-01`; `VOC-007-EV-01`.

## VOC-007-AC-02 — Stable-ID faithful migration

Sources 01–11 are preserved in convention-compliant canonical categories as DOC-00
through DOC-13, with combined sources split without silent semantic loss and without
ID/path collision.

Traceability: `VOC-007-R02`–`VOC-007-R05`; `VOC-007-T02`, `VOC-007-T03`;
`VOC-007-TEST-02`, `VOC-007-TEST-03`; `VOC-007-EV-03`, `VOC-007-EV-04`.

## VOC-007-AC-03 — Reconciliation evidence preserved

Source file 00 is preserved as non-authoritative migration evidence with its material
conflict decisions intact and a visible governance erratum.

Traceability: `VOC-007-R06`; `VOC-007-T04`; `VOC-007-TEST-04`; `VOC-007-EV-05`.

## VOC-007-AC-04 — Stale governance safely reconciled

Source file 12 is not imported as authority; historical DOC-14 is accounted for, and
proposed DOC-19 accurately cross-references live governance without competing with it.

Traceability: `VOC-007-R07`–`VOC-007-R11`; `VOC-007-T05`;
`VOC-007-TEST-05`; `VOC-007-EV-06`.

## VOC-007-AC-05 — Protected authority unchanged

The implementation changes no existing file under `docs/governance/`, DOC-15,
DOC-16, DOC-17, DOC-18, or any amendment.

Traceability: `VOC-007-R18`; `VOC-007-T09`; `VOC-007-TEST-06`; `VOC-007-EV-10`.

## VOC-007-AC-06 — Governance claims corrected

Every stale founder-approval, merge-authority, `develop → main`, steward, automatic
merge/deploy, DOC-15/A-001, and release claim in imported content is either corrected
to a live cross-reference or explicitly labeled historical.

Traceability: `VOC-007-R10`–`VOC-007-R12`; `VOC-007-T06`;
`VOC-007-TEST-07`; `VOC-007-EV-07`.

## VOC-007-AC-07 — Product reconciliation retained as proposed

The migration preserves the six named source reconciliation outcomes without
representing them as approved implementation authority before their lifecycle changes.

Traceability: `VOC-007-R13`; `VOC-007-T03`, `VOC-007-T04`;
`VOC-007-TEST-08`; `VOC-007-EV-05`.

## VOC-007-AC-08 — Manifest, graph, and indexes agree

The migration manifest, relationship graph, root index, and category indexes agree on
unique IDs, canonical paths, statuses, owners, sources, and relationships.

Traceability: `VOC-007-R14`–`VOC-007-R17`; `VOC-007-T07`;
`VOC-007-TEST-09`; `VOC-007-EV-08`.

## VOC-007-AC-09 — Truthful lifecycle metadata

New living documents are `proposed`; approval dates are pending/unknown unless
verified; no index, manifest, or prose calls them approved current authority.

Traceability: `VOC-007-R05`, `VOC-007-R16`; `VOC-007-T08`;
`VOC-007-TEST-10`; `VOC-007-EV-09`.

## VOC-007-AC-10 — Deterministic validation

Installed governance, risk, syntax, whitespace, source-hash, coverage, link, metadata,
and graph checks applicable at implementation time pass without weakened controls or
invented passing placeholders.

Traceability: `VOC-007-R01`, `VOC-007-R14`–`VOC-007-R17`;
`VOC-007-T08`; `VOC-007-TEST-11`; `VOC-007-EV-11`.

## VOC-007-AC-11 — Exact-revision independent verification

Claude Code independently reviews the exact final implementation revision, full diff,
authority, source coverage, semantic consistency, risk, and exclusions with no
blocking finding.

Traceability: `VOC-007-R20`; `VOC-007-T10`; `VOC-007-TEST-12`;
`VOC-007-EV-12`.

## VOC-007-AC-12 — Complete governed PR evidence

The implementation PR records objective, approved package, base/head, R4 risk,
protected areas, corrections, acceptance evidence, validation, independent review,
founder approval status, limitations, and rollback.

Traceability: `VOC-007-R20`; `VOC-007-T10`; `VOC-007-TEST-13`;
`VOC-007-EV-13`.

## VOC-007-AC-13 — No runtime or autonomy effect

No application behavior, dependency, schema, workflow, infrastructure, secret,
production-data, deployment, automatic merge, autonomous activation, or production
release capability is introduced or represented as active.

Traceability: `VOC-007-R19`; `VOC-007-T09`; `VOC-007-TEST-14`;
`VOC-007-EV-10`.

## VOC-007-AC-14 — Reversible repository-only change

Rollback is a separately governed repository revert; no schema, learner-data,
deployment, credential, environment, or production rollback exists.

Traceability: `VOC-007-R19`, `VOC-007-R20`; `VOC-007-T10`;
`VOC-007-TEST-15`; `VOC-007-EV-13`.
