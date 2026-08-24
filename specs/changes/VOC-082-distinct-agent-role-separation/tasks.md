# VOC-082 Tasks

## VOC-082-T00 — Reconcile provider-neutral role-separation guidance

- Requirements: R00, R01, R02, R03, R04, R05, R08
- Acceptance: AC-00, AC-01, AC-02, AC-03, AC-04, AC-08
- Tests: TEST-00, TEST-01, TEST-02
- Evidence: EV-00, EV-01, EV-02
- Status: integrated-by-PR-112-at-merge-commit-26c16b7b07d55c1910c7fd9711dfb17662a75d8e

Create ADR-0005; reconcile DOC-00 §6 and its root/product indexes; and update DOC-15,
DOC-16, governance indexes/guidance, AGENTS.md, the post-merge activation checklist,
CONTRIBUTING.md, CLAUDE.md, `.github` guidance/template, DOC-10, the external Ruflo
runbook, ADR-0004 cross-reference, decisions index, and active evidence/change-package
templates. Replace DOC-00's permanent delivery-role mapping, the checklist's active
Codex/Claude identity requirement, and other active vendor-specific task examples with
distinct actor/role wording. Define role/actor/provenance, include valid separately
instantiated AI-agent and invalid same-actor examples, preserve product decision
authority and scoped cross-model evidence requirements, and keep action-specific
authority separate. Preserve classified historical/EHR/tool/access records, verify
DOC-12 and DOC-09 remain correctly bounded, inventory all DOC-15 occurrences, and make
no executable workflow/evaluator change.

## VOC-082-T01 — Add fail-closed clarification evidence and final verification

- Requirements: R05, R06, R07
- Acceptance: AC-03, AC-05, AC-06, AC-07
- Tests: TEST-03, TEST-04, TEST-05
- Evidence: EV-03, EV-04, EV-05
- Status: complete-final-exact-SHA-9b52963eba5b1dee30e0a63936de2c9ff0b82337-merged-through-PR-114-with-hosted-post-merge-and-rollback-evidence

Add narrow foundation policy markers and negative unit fixtures, update synthetic
eligible/blocked R4 participant labels to provider-neutral AI actors, and prove the
evaluator, adapter, schema, workflow, permissions, and reason codes remain unchanged.
Run proportional local and hosted checks, obtain a different-actor cross-model exact-
SHA review without duplicate long suites, resolve every blocking finding, and rehearse
reverse-order repository rollback. Do not approve or merge the builder's own work,
deploy, mutate settings, or release any inherited hold.

Exact implementation SHA `aa63cd6811c42b1ac02327fe64b6fdd44bce1235`
received a different-actor cross-model PASS with zero blockers, and that superseded
PASS remains preserved historical evidence. The exact PR #114 closure revision
`9b52963eba5b1dee30e0a63936de2c9ff0b82337` then preserved the exact-SHA FAIL on
comment `5385846754`, received the final different-actor cross-model PASS on comment
`5385850530`, passed CI/Governance/Security for the merged tree, and passed
post-merge CI/Governance/Security on `develop`. The repository-only reverse-order
rollback evidence remains recorded in `final-evidence.md`.
