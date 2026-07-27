---
id: DOC-13
title: VocaNova F1 Repository Foundation Execution Package
version: 1.0
document_type: execution-plan
status: historical
owner: founder
canonical_path: docs/operations/13-f1-repository-foundation-execution-package.md
approved_at: null
last_reviewed_at: 2026-07-24
review_cycle: quarterly
supersedes: null
status_note: >
  Corrected 2026-07-24 from stale `proposed` to `historical` - this document's own
  body already states F1 is complete ("F1 in the literal 'empty repository' sense is
  already substantially underway") and that it is "a planning artifact... not
  authority to redo completed repository-foundation work," so `proposed` never
  accurately described it. Preserved as the historical execution record, not a live
  directive.
related_documents:
  - DOC-10
  - DOC-12
  - DOC-15
  - DOC-16
related_decisions: []
adoption_change: VOC-007
source_files:
  - path: 11-implementation-roadmap.md
    sha256: e4745ab74e3951004d20e6fd580c56ee7939a316bb427adbc2a9b09ae54b05a3
---
# 13 — VocaNova F1 Repository Foundation Execution Package

> **Lifecycle notice:** This document is proposed and is not an authoritative implementation input until separately adopted. Words such as “approved” within the imported body describe the source snapshot, not this repository lifecycle.

## 1. Purpose

This focused document preserves the F1-specific content from the combined refined roadmap source.
It is a planning artifact, not the executable VOC-001 package and not authority to redo completed
repository-foundation work. Current repository evidence takes precedence over historical next-step
language.

## 2. Preserved F1 objective and gate

**F1 — Repository Foundation.** Objective: a governed, documented, protected repo before any
application code. Scope: repository charter/docs, GitHub governance (labels, templates, project
board), branch protection on `develop`/`main`, baseline CI, dependency/secret/generated-file
policies, verified agent access boundaries. Explicitly excludes all frontend/backend/database/
infrastructure/production-credential/AI-feature work. **Gate:** approved docs have an authoritative
location; both branches exist and are protected; PR/issue templates exist; required CI checks are
defined; repository permissions follow least privilege; no application code was started
prematurely; founder accepts the governance model.

## 3. Preserved source next action and current interpretation

## 12. Exact next action

Per the source roadmap: **prepare the F1 Repository Foundation execution package** — final F1
brief, epics, fully-written issues, PR sequence, repository naming/structure, exact branch-
protection settings, label/milestone definitions, template files, baseline CI requirements, founder
action checklist, Codex/Claude prompts, F1 acceptance evidence checklist. Given that
`KARSIFT/vocanova-platform` already exists with real content (this doc refinement work, prior
`vocanova-ai-infra` build, and PR #23), **F1 in the literal "empty repository" sense is already
substantially underway** — the practical next action is reconciling what's already been built
against this roadmap's F1/F2/F3 gates, not starting from zero. That reconciliation is exactly what
the "decide based on the new docs" conversation (referenced in this folder's README) is for.

The repository has since completed substantial F1 and F2 foundation work through governed VOC
packages. Future work must reconcile this historical plan with current canonical state and use a
new approved change package; this proposed document does not reopen completed packages.
