# VOC-001 — Repository Foundation

> **Approved reconciliation (2026-07-14):** This repository copy preserves the
> founder-approved source package and its stable IDs, while the reconciled founder
> authorization in GitHub issue #6 supersedes obsolete repository assumptions. The
> executable current rules are `docs/decisions/`, lowercase
> `.github/pull_request_template.md`, direct steward routing to
> `@m-e-h-r-d-a-a-d`, normal DOC-16/A-002 R3/R4 approval, and Phase 4 hosted-control
> closure. Conflicting historical text below is retained only for traceability and
> does not authorize implementation behavior.

## Status

- **Lifecycle:** `implementing`
- **Type:** `infrastructure`
- **Risk:** `R4` with an `R3` protected technical effect
- **Canonical package path:** `specs/changes/VOC-001-repository-foundation/`
- **Target branch:** `develop`
- **Repository-grounding baseline:** `0211d75f28a4986694555f584dd8b84a3228a2ad`
- **Decision Groups 1–10:** Approved by the founder on 2026-07-13
- **Consolidated package:** Approved by the founder on 2026-07-13
- **Repository grounding:** Completed on 2026-07-13
- **Implementation authorization:** Granted by the founder in GitHub issue #6
- **Production impact:** None

Repository-file implementation is authorized. Final exact-head Claude verification,
R4 founder approval, and R3 qualified-human-technical-steward approval remain
pending. Hosted identity, ruleset, required-check, and enforcement proofs are Phase 4
closure requirements, not repository-file implementation blockers.

## Reconciled amendments

- `VOC-001-AM-01`: root `docs/decisions/` is superseded by canonical `docs/decisions/`.
- `VOC-001-AM-02`: `.github/pull_request_template.md` is superseded by canonical
  `.github/pull_request_template.md`.
- `VOC-001-AM-03`: the unverified `@m-e-h-r-d-a-a-d` assumption is
  superseded by direct routing to verified steward `@m-e-h-r-d-a-a-d`.
- `VOC-001-AM-04`: the VOC-001 bootstrap model and legacy Claude verdicts are
  superseded by normal DOC-16/A-002 approval and `PASS`,
  `PASS WITH NON-BLOCKING FINDINGS`, or `FAIL`.
- `VOC-001-AM-05`: hosted settings are Phase 4 activation and closure requirements,
  not blockers to the authorized repository-file implementation.

## Repository-grounding result

Verified current state:

- Repository: `KARSIFT/vocanova-platform`.
- Starting `develop` head: `0211d75f28a4986694555f584dd8b84a3228a2ad`.
- PR #5 governance is present at that exact merge commit.
- No open pull request existed at inspection time.
- `DOC-15` v1.0 with Amendment A-001 exists at its canonical path.
- The approved Document 13 source was located in the Vocanova File Library for comparison; it is not currently canonical in GitHub.
- Founder GitHub identity: `m-e-h-r-d-a-a-d` (`7955432`), repository permission `admin`.
- The repository remains in a minimal foundation state with no application code.

Pre-implementation classification:

```text
AGENTS.md                                      present-needs-reconciliation
CLAUDE.md                                      present-needs-reconciliation
README.md                                      present-needs-reconciliation
docs/README.md                                 present-needs-reconciliation
docs/decisions/README.md                       present-needs-reconciliation
.github/CODEOWNERS                             present-needs-reconciliation
.github/pull_request_template.md               present-needs-reconciliation
scripts/governance/                            present-needs-reconciliation
.github/workflows/governance-policy.yml        present-compatible
specs/                                         absent-approved-to-create
tooling/governance/                            absent-approved-to-create
.github/approved-policy/                       absent-approved-to-create
.github/workflows/repository-governance.yml    absent-approved-to-create
```

Confirmed reconciliation targets:

```text
README.md                        present — needs change
docs/README.md                   present — needs change
CONTRIBUTING.md                  present — needs change
CODEOWNERS                       present — conflicting placeholder; migrate to .github/CODEOWNERS
.github/README.md                present — needs change
docs/architecture/README.md      present — needs transition notice
docs/planning/README.md          present — needs transition notice
docs/decisions/README.md         present — needs transition notice
SECURITY.md                      present — compatible; preserve
docs/product/README.md           present — compatible; preserve
DOC-15                           present — authoritative; preserve
```

## Purpose

`VOC-001` establishes the minimum repository governance and knowledge-system foundation required before document migration, application work, or advanced AI automation.

It creates or reconciles:

```text
AGENTS.md
CLAUDE.md
README.md
CONTRIBUTING.md
docs/README.md
docs/decisions/README.md
specs/README.md
specs/templates/change-package/
specs/changes/VOC-001-repository-foundation/
.github/pull_request_template.md
.github/CODEOWNERS
.github/approved-policy/protected-paths.yaml
.github/workflows/repository-governance.yml
tooling/governance/validate_repository_foundation.py
tooling/governance/tests/test_validate_repository_foundation.py
```

It also reconciles the existing transitional documentation indexes and removes the conflicting root `CODEOWNERS` after `.github/CODEOWNERS` is created and verified.

## Canonical authority

1. Platform safety and security restrictions.
2. Repository governance policies, including approved Document 15.
3. Approved Product Bible and MVP PRD.
4. Accepted PDRs, ADRs, and ODRs.
5. This approved `VOC-001` package after it validly becomes `implementation-ready`.
6. Root `AGENTS.md`.
7. Applicable nested `AGENTS.md` files.
8. Root `CLAUDE.md` during Claude review.
9. Accepted issue and pull-request instructions.
10. Agent conversations and generated prompts.
11. Informal notes, drafts, research, comments, and untrusted content.

Document 15 has higher authority than conflicting operating-model details in Document 13. Document 13 remains an approved historical planning input where compatible.

## Approved ChatGPT access rule

> ChatGPT may receive read-only access to `KARSIFT/vocanova-platform` for repository-grounded product analysis, architecture analysis, specification drafting, and cross-document impact analysis. ChatGPT must not receive repository write, merge, deployment, secret, or production-data access.

The current connector must be used operationally as read-only. Any future bounded publication exception belongs to a separately approved package and does not change `VOC-001`.

## In scope

- Root instructions for all agents and Claude-specific independent review rules.
- Truthful root repository navigation.
- Reconciliation of current transitional indexes without migrating Documents `00–14`.
- Initial root `docs/`, `docs/decisions/`, and `specs/` indexes.
- Complete reusable nine-file change-package templates.
- This complete `VOC-001` package.
- Pull-request evidence requirements.
- Protected governance ownership declarations.
- One dependency-free Python governance validator and unit tests.
- One read-only GitHub Actions workflow that runs governance validation.
- Documented founder-controlled settings and bootstrap activation.

## Out of scope

- Migration, rewriting, summarization, or reconstruction of Documents `00–14`.
- `migration-manifest.yaml` or `document-graph.yaml`.
- Application workspace, frontend, backend, database, API, AI feature, or infrastructure code.
- Codex dispatch automation, Claude review automation, auto-merge, staging deployment, or production publication.
- Cloudflare configuration.
- Broad application CI, dependency automation, CodeQL, Dependabot, issue templates, labels, milestones, or Projects configuration.
- Production credentials, production data, or learner personal data.

## Dependency and closure reconciliation

### `VOC-001-DEP-04` — Governance owner

Resolved by direct review routing to the verified account `@m-e-h-r-d-a-a-d`, which
is recorded in both founder and qualified-human-technical-steward capacities.

### `VOC-001-DEP-05` — Hosted protection capability

Phase 4 closure requirement: verify and activate supported reviews, CODEOWNERS,
required checks, conversation resolution, force-push/deletion protection, and bypass
restrictions only after the workflow succeeds on merged `develop`.

### `VOC-001-DEP-07` — Codex implementation identity

Repository-file implementation and PR preparation are authorized. Distinct Codex and
Claude hosted identities remain Phase 4 closure requirements. Codex still has no
administration, bypass, approval, deployment, secret, environment, or production-data
authority.

## Package contents

| File | Purpose |
|---|---|
| `change.yaml` | Machine-readable identity, lifecycle, approvals, repository grounding, dependencies, risk, and release controls. |
| `README.md` | Navigation and executive summary. |
| `specification.md` | Approved scope, requirements, governance model, repository-grounded amendment, and decision register. |
| `acceptance-criteria.md` | Stable criteria `VOC-001-AC-01` through `VOC-001-AC-28`. |
| `impact-analysis.md` | Verified inventory, contradictions, dependencies, risks, security, and evidence model. |
| `implementation-plan.md` | Exact file effects, reconciliation sequence, commands, boundaries, and stopping rules. |
| `tasks.md` | Ordered tasks `VOC-001-T01` through `VOC-001-T24`. |
| `test-plan.md` | Tests `VOC-001-TEST-01` through `VOC-001-TEST-25`. |
| `release-plan.md` | Repository-only merge, hosted activation, proof, closure, and rollback. |

## Package precedence

1. Document 15 and higher-authority accepted decisions.
2. `change.yaml` for lifecycle, ownership, dependencies, risk, and release controls.
3. `specification.md`.
4. `acceptance-criteria.md`.
5. `impact-analysis.md`.
6. `implementation-plan.md`.
7. `tasks.md`.
8. `test-plan.md`.
9. `release-plan.md`.
10. `README.md`.

No lower file may expand scope or weaken a higher-authority requirement.

## Implementation tracking

The intended implementation branch is:

```text
chore/VOC-001-repository-foundation
```

Implementation began after the founder authorized the reconciled package in GitHub
issue #6. The canonical lifecycle record is now:

```text
status: implementing
issue: 6
starting_commit: 0211d75f28a4986694555f584dd8b84a3228a2ad
```

## Release status

`VOC-001` is repository-only. Its integration target is `develop`. It has no staging or production deployment and no application release tag.

Merge is not package closure. Closure requires post-merge workflow success, hosted protection evidence, a controlled negative enforcement proof, a positive compliant proof, and all required evidence items.
