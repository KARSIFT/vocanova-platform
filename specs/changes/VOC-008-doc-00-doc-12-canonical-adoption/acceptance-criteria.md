# VOC-008 Acceptance Criteria

## VOC-008-AC-01 — Complete adopted package

A complete nine-file package and canonical specs index bind issue #29, the document
snapshot, stable requirements, reconciliation register, tests, risks, evidence, and
rollback before document adoption begins.

Traceability: `VOC-008-R01`, `VOC-008-R16`; `VOC-008-T01`, `VOC-008-T02`;
`VOC-008-TEST-01`; `VOC-008-EV-01`, `VOC-008-EV-02`.

## VOC-008-AC-02 — Exact baseline provenance

All 13 in-scope files, IDs, paths, and SHA-256 hashes match the grounded-base snapshot,
or a changed baseline blocks implementation until separately reconciled.

Traceability: `VOC-008-R02`, `VOC-008-R06`; `VOC-008-T03`;
`VOC-008-TEST-02`; `VOC-008-EV-03`.

## VOC-008-AC-03 — Coherent semantic baseline

The exact adoption candidate receives a full cross-document semantic review; every
known and newly discovered contradiction is resolved explicitly with recorded
rationale and no unresolved material product, security, privacy, data, AI-trust,
architecture, infrastructure, or sequencing choice.

Traceability: `VOC-008-R03`–`VOC-008-R05`; `VOC-008-T04`, `VOC-008-T05`;
`VOC-008-TEST-03`, `VOC-008-TEST-04`; `VOC-008-EV-04`, `VOC-008-EV-05`.

## VOC-008-AC-04 — Governance compatibility

All current authority claims defer to the live canonical governance chain, protected
authority files remain unchanged, and adoption introduces no competing merge,
approval, release, EHR, or activation rule.

Traceability: `VOC-008-R11`, `VOC-008-R12`; `VOC-008-T06`;
`VOC-008-TEST-05`, `VOC-008-TEST-06`; `VOC-008-EV-06`.

## VOC-008-AC-05 — Truthful atomic lifecycle adoption

DOC-00 through DOC-12 become approved together only after exact-revision evidence;
frontmatter, lifecycle notices, approval/review dates, and adoption-change metadata are
truthful and consistent. No partial or pre-evidence approval is possible.

Traceability: `VOC-008-R07`; `VOC-008-T07`; `VOC-008-TEST-07`;
`VOC-008-EV-07`.

## VOC-008-AC-06 — Excluded document lifecycle preserved

DOC-13 and DOC-19 remain proposed and DOC-14 remains not adopted in files, indexes,
manifest, graph, and prose.

Traceability: `VOC-008-R08`; `VOC-008-T07`; `VOC-008-TEST-08`;
`VOC-008-EV-08`.

## VOC-008-AC-07 — Derived metadata consistency

Root/category indexes, document graph, migration manifest, and in-scope frontmatter
agree on IDs, paths, statuses, owners, relationships, provenance, adoption evidence,
and completeness without rewriting VOC-007 history.

Traceability: `VOC-008-R09`, `VOC-008-R10`; `VOC-008-T08`;
`VOC-008-TEST-09`; `VOC-008-EV-09`.

## VOC-008-AC-08 — Deterministic validation

All installed applicable governance, package, document, link, section, YAML, metadata,
risk, and whitespace checks pass on the exact candidate without weakened controls or
invented success.

Traceability: `VOC-008-R15`; `VOC-008-T09`; `VOC-008-TEST-10`;
`VOC-008-EV-10`.

## VOC-008-AC-09 — Exact-revision independent verification and approval

Claude Code independently verifies each exact package/adoption revision with no
blocking finding, founder R4 approval is bound to that same revision, and material
changes invalidate earlier evidence.

Traceability: `VOC-008-R16`, `VOC-008-R17`; `VOC-008-T10`;
`VOC-008-TEST-11`; `VOC-008-EV-11`, `VOC-008-EV-12`.

## VOC-008-AC-10 — No runtime, vendor, release, or autonomy effect

No application code, dependency, schema, workflow, provisioned infrastructure,
credential, learner/production data, spend, deployment, merge automation, technical
activation, or production release is changed or authorized.

Traceability: `VOC-008-R13`, `VOC-008-R14`; `VOC-008-T11`;
`VOC-008-TEST-12`; `VOC-008-EV-13`.

## VOC-008-AC-11 — Governed handoff and closure

The adopted documents become inputs only for new bounded packages; issue #29 remains
open through package adoption and closes only after adoption/lifecycle evidence is
complete.

Traceability: `VOC-008-R14`, `VOC-008-R18`; `VOC-008-T10`;
`VOC-008-TEST-13`; `VOC-008-EV-14`.

## VOC-008-AC-12 — Reversible repository-only change

The exact adoption diff can be reverted as one governed repository change restoring
all prior content/status/metadata consistently, with no external or runtime recovery.

Traceability: `VOC-008-R19`; `VOC-008-T11`; `VOC-008-TEST-14`;
`VOC-008-EV-15`.
