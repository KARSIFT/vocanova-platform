# VOC-009 Specification

## Objective and authority boundary

Founder issue comment `5031045639` authorizes preparation of this package only. It
acknowledges that PR #32 merged before required R4 gates, rejects retroactive
validation, directs a governed revert followed by a fresh adoption, and excludes
application, deployment, production, automation, and protected-governance changes.
No revert or re-adoption implementation is authorized until this package is validly
adopted.

## Stable requirements

- **VOC-009-R01:** Re-verify issue #29 comment `5031045639`, PR #32, its candidate and
  merge commits, independent review comment `5028020844`, live `develop`, repository
  instructions, active governance, approval matrix, and technical activation state.
- **VOC-009-R02:** Preserve this exact incident ledger: PR #32 base
  `0ce8fd8824ea5351f8bc65648640bb40c002ed16`, candidate
  `c2154042ebe8cad2452717a10ab0958455bf5fa3`, merge
  `b591ee7d4034d62fa4da6edeb85fb8cf68bcbddc`, retrospective independent `FAIL`
  comment `5028020844`, and founder remediation direction `5031045639`.
- **VOC-009-R03:** Do not claim that later verification or approval retroactively made
  PR #32 compliant. Record that its content passed substantive review while its R4
  adoption sequence failed.
- **VOC-009-R04:** Treat DOC-00 through DOC-12 as non-authoritative pending completed
  remediation. Do not derive or implement application work from their currently
  merged `approved` metadata.
- **VOC-009-R05:** After valid package adoption, prepare a separate R4 revert candidate
  that reverses the complete PR #32 tree change, restoring the exact pre-PR-32
  DOC-00–DOC-12 content/lifecycle and derived metadata state.
- **VOC-009-R06:** The revert candidate must change exactly the 22 PR #32 paths and
  make their resulting trees byte-identical to base
  `0ce8fd8824ea5351f8bc65648640bb40c002ed16`; no audit record or Git history may be
  erased, rewritten, force-pushed away, or misrepresented.
- **VOC-009-R07:** Publish the revert as a fresh draft PR to `develop`. Before merge it
  must pass installed checks, exact-revision independent verification with no
  blocking finding, and exact-revision founder R4 approval. Codex cannot approve or
  merge it.
- **VOC-009-R08:** After the valid revert merge, confirm DOC-00 through DOC-12 are
  consistently `proposed`, DOC-13/DOC-19 remain `proposed`, DOC-14 remains
  `not-adopted`, VOC-007 provenance remains intact, and issue #29 remains open.
- **VOC-009-R09:** Only after the revert is canonically adopted may a fresh adoption
  candidate reapply the substantively reviewed PR #32 reconciliation. Any difference
  from candidate `c2154042ebe8cad2452717a10ab0958455bf5fa3` must be explicitly
  listed, justified, and re-reviewed.
- **VOC-009-R10:** Publish fresh adoption as another draft R4 PR. Before merge it must
  pass full semantic/document validation, exact-revision independent verification
  with no blocking finding, and exact-revision founder R4 approval. No PR #32 review,
  package approval, or revert approval is reusable.
- **VOC-009-R11:** The retrospective PR #32 review may be used as substantive research
  and incident evidence only; it cannot substitute for pre-merge verification of the
  revert or fresh adoption revisions.
- **VOC-009-R12:** Preserve atomic lifecycle truth throughout: the revert restores all
  13 documents and derived metadata together; fresh adoption promotes all and only
  DOC-00 through DOC-12 together after its own evidence.
- **VOC-009-R13:** Preserve the complete chain in GitHub and repository evidence:
  VOC-008, PR #32, the retrospective `FAIL`, founder remediation direction, VOC-009,
  revert PR, fresh adoption PR, and final lifecycle sync.
- **VOC-009-R14:** After both remediation merges, use a separately reviewed lifecycle
  synchronization change to record exact candidates, reviews, approvals, merge SHAs,
  and final status before issue #29 closes.
- **VOC-009-R15:** Do not close issue #29 or resume downstream application planning
  until remediation and lifecycle synchronization are complete.
- **VOC-009-R16:** Do not edit protected governance, amendments, DOC-15 through
  DOC-18, application code, dependencies, schemas, workflows, infrastructure, secrets,
  learner/production data, deployment, release, or activation state.
- **VOC-009-R17:** Run every installed applicable governance, package, document,
  link/section, YAML, metadata, scope, risk, and whitespace check on every exact
  candidate; disclose unavailable checks rather than inventing a pass.
- **VOC-009-R18:** Use R4 for package adoption, revert, fresh adoption, and any
  substantive remediation change. EHR remains `not-triggered` unless an actual
  exceptional trigger appears.
- **VOC-009-R19:** Automatic/autonomous merge, RL1/RL2 technical activation,
  production deployment, and autonomous production release remain false/disabled.
  Every merge is an authorized human action after all recorded gates.
- **VOC-009-R20:** Package rollback is a governed revert of the package/index change.
  Remediation rollback must restore the immediately preceding consistent repository
  state without external, data, infrastructure, or production recovery.

## Exact PR #32 path set

The revert and fresh adoption revisions are bounded to these 22 paths:

```text
docs/README.md
docs/design/03-ui-ux-design.md
docs/design/08-web-app-design.md
docs/design/README.md
docs/document-graph.yaml
docs/engineering/04-technical-architecture.md
docs/engineering/05-database-design.md
docs/engineering/06-backend-design.md
docs/engineering/07-api-contract-and-dto-design.md
docs/engineering/09-ai-features.md
docs/engineering/README.md
docs/migration-manifest.yaml
docs/operations/10-development-workflow.md
docs/operations/11-devops-and-ci-cd.md
docs/operations/README.md
docs/product/00-product-bible.md
docs/product/01-mvp-prd.md
docs/product/12-mvp-implementation-plan.md
docs/product/README-adoption-notes.md
docs/product/README.md
docs/research/02-market-research.md
docs/research/README.md
```

## Explicit exclusions

This package does not itself change document lifecycle, revert PR #32, approve its
content, re-adopt any document, authorize application implementation, change
governance, create a precedent for retrospective approval, provision a vendor or
environment, spend funds, handle learner data, deploy, release, or activate autonomy.
