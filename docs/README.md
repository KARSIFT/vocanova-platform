# Documentation

`docs/` contains approved and proposed living documentation. Only documents whose frontmatter
status is `approved` are authoritative implementation inputs. Executable work authority lives in
adopted packages under [`specs/`](../specs/README.md); decision rationale lives in
[`docs/decisions/`](decisions/README.md).

## Categories

- [Product](product/README.md)
- [Research](research/README.md)
- [Design](design/README.md)
- [Engineering](engineering/README.md)
- [Architecture](architecture/README.md)
- [Planning](planning/README.md)
- [Operations](operations/README.md)
- [Governance](governance/README.md)
- [Decisions](decisions/README.md)
- [Templates](templates/README.md)
- [Archive](archive/README.md)

## Canonical document index

| ID | Title | Status | Owner | Canonical path | Related artifacts |
|---|---|---|---|---|---|
| DOC-00 | [VocaNova Product Bible](product/00-product-bible.md) | approved | founder | `docs/product/00-product-bible.md` | DOC-01, DOC-02, DOC-03, DOC-05, DOC-09, DOC-12 |
| DOC-01 | [VocaNova MVP PRD](product/01-mvp-prd.md) | approved | founder | `docs/product/01-mvp-prd.md` | DOC-00, DOC-03, DOC-08, DOC-09, DOC-12 |
| DOC-02 | [VocaNova Market Research](research/02-market-research.md) | approved | founder | `docs/research/02-market-research.md` | DOC-00, DOC-01 |
| DOC-03 | [VocaNova UI/UX Design](design/03-ui-ux-design.md) | approved | founder | `docs/design/03-ui-ux-design.md` | DOC-00, DOC-01, DOC-08, DOC-09 |
| DOC-04 | [VocaNova Technical Architecture](engineering/04-technical-architecture.md) | approved | founder | `docs/engineering/04-technical-architecture.md` | DOC-05, DOC-06, DOC-07, DOC-08, DOC-09, DOC-10, DOC-11, DOC-17 |
| DOC-05 | [VocaNova Database Design](engineering/05-database-design.md) | approved | founder | `docs/engineering/05-database-design.md` | DOC-04, DOC-06, DOC-07, DOC-09 |
| DOC-06 | [VocaNova Backend Design](engineering/06-backend-design.md) | approved | founder | `docs/engineering/06-backend-design.md` | DOC-04, DOC-05, DOC-07, DOC-09, DOC-10 |
| DOC-07 | [VocaNova API Contract and DTO Design](engineering/07-api-contract-and-dto-design.md) | approved | founder | `docs/engineering/07-api-contract-and-dto-design.md` | DOC-04, DOC-05, DOC-06, DOC-08, DOC-09 |
| DOC-08 | [VocaNova Web Application Design](design/08-web-app-design.md) | approved | founder | `docs/design/08-web-app-design.md` | DOC-03, DOC-04, DOC-07, DOC-09 |
| DOC-09 | [VocaNova AI Features](engineering/09-ai-features.md) | approved | founder | `docs/engineering/09-ai-features.md` | DOC-00, DOC-01, DOC-04, DOC-05, DOC-06, DOC-07 |
| DOC-10 | [VocaNova Development Workflow](operations/10-development-workflow.md) | approved | founder | `docs/operations/10-development-workflow.md` | DOC-11, DOC-15, DOC-16, DOC-19 |
| DOC-11 | [VocaNova DevOps and CI/CD Plan](operations/11-devops-and-ci-cd.md) | approved | founder | `docs/operations/11-devops-and-ci-cd.md` | DOC-10, DOC-16, DOC-19 |
| DOC-12 | [VocaNova MVP Implementation Plan](product/12-mvp-implementation-plan.md) | approved | founder | `docs/product/12-mvp-implementation-plan.md` | DOC-00, DOC-01, DOC-03, DOC-04, DOC-10, DOC-11, DOC-13, DOC-18 |
| DOC-13 | [VocaNova F1 Repository Foundation Execution Package](archive/13-f1-repository-foundation-execution-package.md) | historical (F1 complete) | founder | `docs/archive/13-f1-repository-foundation-execution-package.md` | DOC-10, DOC-12, DOC-15, DOC-16 |
| DOC-14 | Historical KARSIFT AI Development Automation Architecture | not adopted | founder | Preserved as research; see DOC-19 | DOC-19 |
| DOC-15 | [AI-Native Product and Engineering Operating Model](operations/15-ai-native-product-and-engineering-operating-model.md) | approved | founder | `docs/operations/15-ai-native-product-and-engineering-operating-model.md` | DOC-16, DOC-19 |
| DOC-16 | [Autonomous Development Operating Model](governance/16-autonomous-development-operating-model.md) | approved | founder | `docs/governance/16-autonomous-development-operating-model.md` | DOC-15, DOC-17, DOC-19 |
| DOC-17 | [Autonomous Development Architecture](archive/17-autonomous-development-architecture.md) | superseded (never built) | founder | `docs/archive/17-autonomous-development-architecture.md` | DOC-16, DOC-18, DOC-19 |
| DOC-18 | [Autonomous Development Implementation Roadmap](archive/18-autonomous-development-implementation-roadmap.md) | superseded (never built) | founder | `docs/archive/18-autonomous-development-implementation-roadmap.md` | DOC-17, DOC-19 |
| DOC-19 | [Governance Reconciliation Notes](archive/19-governance-reconciliation-notes.md) | historical | founder | `docs/archive/19-governance-reconciliation-notes.md` | DOC-10, DOC-11, DOC-15, DOC-16, DOC-17, DOC-18 |

## Migration and relationships

- [Migration manifest](archive/migration-manifest.yaml) records source hashes, coverage, status, and disposition.
- [Document graph](archive/document-graph.yaml) is a derived impact aid and does not override authority.
- [Migration notes](archive/README-migration-notes.md) preserve the reconciliation evidence trail.
- [Adoption notes](archive/README-adoption-notes.md) record VOC-008 semantic corrections.

DOC-17 and DOC-18 were adopted together per VOC-004 (canonical adoption), but describe a system
that was never built and is not the project's actual direction (noted 2026-07-24; retired to
`docs/archive/` 2026-08-14 - both are marked `superseded` in their own frontmatter, not deleted,
and their frozen substantive-body checksums are unchanged, only their location and status
changed). They specify a standalone Control Plane service (a durable PostgreSQL work queue, an AI
Budget Governor, an Execution Lease Manager, an MCP founder interface, etc.) and an 18-phase
roadmap to build it. The later local orchestrator/subagent experiment recorded in
[ADR-0001](decisions/ADR-0001-agent-orchestration-architecture.md) was architecturally
unrelated: no Postgres queue, no Budget Governor, no MCP interface, no Change Contract Registry.
VOC-078 superseded both automation directions: T01 retired the external workflow state
machine and T02 removed the local orchestrator assets. Neither experiment activated
RL1/RL2. Current operational state is recorded in
`docs/governance/a003-transition-state.yaml`.
