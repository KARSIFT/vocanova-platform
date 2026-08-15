# Archive

Retired and historical records: documents no longer live/authoritative, preserved
as permanent evidence rather than deleted. Nothing here is an authoritative
implementation input - see [`docs/README.md`](../README.md)'s canonical index for
what's currently live, and each file's own frontmatter `status` for why it's here.

| Document | Why it's archived |
|---|---|
| [DOC-13 — F1 Repository Foundation Execution Package](13-f1-repository-foundation-execution-package.md) | `historical` - F1 is complete; this is the execution record, not a live directive |
| [DOC-17 — Autonomous Development Architecture](17-autonomous-development-architecture.md) | `superseded` - the "Control Plane" system it specifies was adopted (VOC-004) but never built; the live orchestrator system in [ADR-0001](../decisions/ADR-0001-agent-orchestration-architecture.md) is what actually runs |
| [DOC-18 — Autonomous Development Implementation Roadmap](18-autonomous-development-implementation-roadmap.md) | `superseded` - the 18-phase build plan for DOC-17's Control Plane; never executed |
| [DOC-19 — Governance Reconciliation Notes](19-governance-reconciliation-notes.md) | `historical` - its plain-language orientation role is now done directly by DOC-16 v2.0 |
| [Adoption notes](README-adoption-notes.md) | Non-authoritative record of VOC-008 semantic corrections made before DOC-00-12 adoption |
| [Migration notes](README-migration-notes.md) | Non-authoritative record of the VOC-007 documentation migration and reconciliation |
| [Document graph](document-graph.yaml) | Generated (VOC-008), derived-impact-aid-only index of DOC-00...19 |
| [Migration manifest](migration-manifest.yaml) | VOC-007 migration record - source hashes, adopted-document list, per-document checksums |

DOC-17 and DOC-18's frozen substantive-body checksums are unchanged from their
original adoption - only their frontmatter `status`/`canonical_path` and file
location moved here on 2026-08-14. Nothing about their approved, adopted history
is altered or erased.
