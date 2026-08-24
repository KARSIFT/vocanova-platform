# VOC-090 — Impact Analysis

## Summary

This is a repository-only governance/process reconciliation. It changes how future
work is maximally consolidated into the largest safe coherent delivery unit, not
product behavior or merge/release authority. Its semantic effect would otherwise be
R3, but the unchanged DOC-15 protected-path floor makes the effective implementation
R4.

| Area                                                  | Status                      | Evidence or required work                                                                                                                                                       |
| ----------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product scope and user experience                     | Not affected                | No learner behavior, promise, UI, or product decision changes.                                                                                                                  |
| Living governance and workflow documents              | Affected                    | Reconcile DOC-15, DOC-16, DOC-10, risk guidance, and the Ruflo runbook atomically.                                                                                              |
| Product/engineering implementation guidance           | Affected                    | Reconcile DOC-12's mandatory future P3 six-PR order and DOC-09's matching recommended sequence into aligned ordered components, with only a D03–D05-compliant future exception. |
| Agent/reviewer/contributor guidance                   | Affected                    | Align AGENTS.md, CLAUDE.md, CONTRIBUTING.md, and the PR template with the delivery-shape contract.                                                                              |
| Change-package guidance/templates                     | Affected                    | Align specs index, documentation template, and active package README/change/plan/task templates.                                                                                |
| Governance validation                                 | Affected                    | Add narrow network-free positive markers and negative fixtures in the existing foundation validator/test.                                                                       |
| Risk classification/protected paths                   | Preserved                   | Wording may clarify that size is not risk; classifier/path floors do not change.                                                                                                |
| Merge/review/approval authority                       | Preserved                   | No evaluator, adapter, workflow, permission, review-independence, EHR, or action-authority behavior changes.                                                                    |
| Frontend, backend, API, database, migrations          | Not affected                | No application/runtime/data path is authorized.                                                                                                                                 |
| Authentication, privacy, personal data, secrets       | Not affected                | No access, disclosure, collection, or logging change.                                                                                                                           |
| Accessibility, performance, analytics, AI             | Not affected                | No product surface or runtime behavior changes.                                                                                                                                 |
| Infrastructure, deployment, Cloudflare, DNS, settings | Not affected and prohibited | Repository-only documentation/template/validator implementation.                                                                                                                |
| Testing                                               | Affected                    | Focused static governance regression tests plus existing validation.                                                                                                            |
| Support and operations                                | Affected                    | Future planning/review coordination uses the clarified default and split rationale.                                                                                             |

## Existing-file reconciliation

- `AGENTS.md`, `CONTRIBUTING.md`, and `CLAUDE.md` are present-compatible but incomplete:
  preserve all authority and evidence rules while adding the default delivery and
  reviewer split-rationale checks.
- `.github/pull_request_template.md` is present-needs-reconciliation: retain every
  existing evidence field and add delivery shape/task mapping/multi-PR rationale.
- DOC-10 sections 4 and 6 are present-needs-reconciliation: remove `L`-must-split and
  fixed line-count mandates; replace them with observable reviewability signals and
  overhead-aware rationale.
- `docs/product/12-mvp-implementation-plan.md` section 5 is present-needs-
  reconciliation: P3 remains unresolved and its mandatory six-PR order is active,
  forward-looking guidance. Preserve the P3 objective, dependency/order, provider-
  evaluation/privacy gate, specialist review, blockers, and milestone acceptance gate;
  relabel the six items as ordered components inside the default coherent PR unless a
  future adopted package supplies the complete D03–D05 multi-PR exception.
- `docs/engineering/09-ai-features.md` section 24 is present-needs-reconciliation:
  preserve all AI builder/reviewer, safety, privacy, provider, evaluation, and rollout
  controls while replacing its recommended six-PR sequence with the same ordered non-
  PR component sequence and future D03–D05 exception contract as DOC-12.
- DOC-15 sections 10.10, 16.4, 24.10, 24.20, DG5-05, and applicable task/PR lifecycle
  wording are present-needs-reconciliation. Preserve historical/corrected sections and
  all authority boundaries.
- DOC-16's lifecycle and branch/merge sections are present-compatible but incomplete:
  add the canonical default without altering eligibility or authority.
- `docs/governance/change-risk-classification.md` is present-compatible: retain
  consequence-based classification and the rule that splitting cannot lower combined
  risk; clarify that size or task count is not a split/risk substitute.
- `docs/operations/ruflo-external-orchestration.md` is present-needs-reconciliation:
  worktree ownership remains one writer per worktree, but a task ID no longer implies a
  separate branch/PR.
- `docs/templates/change-specification.md`, `specs/README.md`, and the five declared
  active package-template files are present-needs-reconciliation for the one-PR default,
  minimum-sufficient task semantics, and written multi-PR rationale.
- `tooling/governance/validate_repository_foundation.py` and its unit test are
  present-compatible extension points for a narrow static regression contract.
- Completed `specs/changes/**`, archived documents, historical records, product code,
  workflows, merge-eligibility tooling, and the path classifier are inspect-and-
  preserve or explicitly excluded.

## Risks and mitigations

- `VOC-090-R00` — The new default is misread as an absolute one-PR rule. Mitigation:
  enumerate outcome/risk/rollback/dependency/reviewer/reviewability split conditions
  and test that multi-PR delivery remains possible with rationale.
- `VOC-090-R01` — Large but unsafe diffs are kept together to save time. Mitigation:
  reviewability is only one factor; risk, rollback, authority, dependency, and ownership
  boundaries remain controlling.
- `VOC-090-R02` — Unrelated scope is bundled under a broad outcome label. Mitigation:
  retain the one-coherent-objective and unrelated-work separation rules and cover them
  in exact review/static markers.
- `VOC-090-R03` — Task traceability becomes too coarse. Mitigation: task IDs remain
  stable and minimum-sufficient for requirement/test/evidence mapping; one `T00` is
  used here because the entire change has one owner, rollback, review, and PR boundary.
- `VOC-090-R04` — Templates drift from canonical guidance. Mitigation: reconcile all
  declared active surfaces in one PR and add positive/negative static checks.
- `VOC-090-R05` — The change weakens security, exact review, or authority. Mitigation:
  explicit invariants, excluded executable surfaces, R4 specialist review, hashes/diff
  checks for excluded controls, and no external credentials or effects.
- `VOC-090-R06` — Multiple-PR rationale becomes empty ceremony. Mitigation: require the
  concrete boundary, partial-state/rollback/integration explanation, and quantified or
  qualitative overhead comparison; reject placeholders in templates/fixtures.
- `VOC-090-R07` — Active milestone/AI guidance silently preserves a mandatory or
  recommended PR sequence. Mitigation: include DOC-12/DOC-09 in the atomic file
  inventory, require aligned non-PR component wording, and add negative fixtures for
  active unrationalized PR sequences while allowing labelled history.
- `VOC-090-R08` — Planners treat one PR as merely permitted instead of actively
  consolidating all layers that share one outcome and control boundary. Mitigation:
  require the largest safe coherent delivery unit explicitly and reject active policy
  that omits that maximization rule.

## Privilege and authority analysis

The package grants no new role, permission, merge, settings, deployment, production,
data, secret, spending, DNS, or launch capability. `automatic_merge_allowed: true`
remains read-only eligibility policy metadata. No action-specific authority is needed
for the repository-only plan or later implementation. If implementation discovers an
external or executable-policy effect, it must stop and return to planning.

R4 is driven by the existing DOC-15 path floor, not by a material autonomous-authority
expansion. Complete R4 evidence still applies. EHR is not triggered at drafting time;
any qualifying unresolved security/governance conflict must stop the work under the
existing rules.

## Rollback impact

Rollback is a normal repository revert of the one implementation pull request. It
restores the prior ambiguous guidance and templates but changes no data, external
setting, workflow run authority, or live environment. Rehearsal must prove every
authorized path matches the pre-implementation base in a disposable worktree.
