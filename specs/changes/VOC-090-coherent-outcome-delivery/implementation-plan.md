# VOC-090 — Implementation Plan

## Preconditions and protected areas

Do not implement from issue #143 or this draft. Before `VOC-090-T00` begins, a
different non-author actor must independently review the exact plan candidate, the
applicable different non-author governance/delivery-workflow specialist must review
that exact candidate, the accountable governance decision owner must adopt it,
adoption bookkeeping must record `status: adopted` and implementation authorization,
the bookkeeping revision must receive fresh exact-SHA review and hosted evidence, and
the plan PR must merge normally with applicable post-merge checks.

The implementation is one R4 pull request because DOC-15 has an unchanged R4 path
floor. It requires complete decision, impact, contingency, deterministic, governance-
workflow specialist, and different-actor exact-revision evidence. Risk class creates no
founder or standing technical-steward approval requirement. No external-action
authority applies to the repository-only scope.

Create one isolated short-lived branch/worktree from the adopted `develop` revision.
Re-read and classify every declared target before editing. Preserve concurrent
compatible work. Any need for an undeclared file, workflow/evaluator/classifier change,
repository setting, credential, Cloudflare/DNS/deployment action, production data,
live access, spending, or launch stops implementation and returns to planning.

## One-package, one-task, one-PR sequence

1. In DOC-16, add the canonical delivery-shape contract near lifecycle/branch guidance:
   one coherent outcome defaults to one approved package and one implementation PR;
   tasks are minimum-sufficient evidence groupings; justified splits use outcome,
   risk/authority, rollback, dependency, reviewer/owner, and reviewability boundaries;
   multiple PRs require written overhead-aware rationale. Preserve the universal
   evidence contract and all branch/merge/action-authority rules.
2. Reconcile DOC-15 sections 10.10, 16.4, 24.10, 24.20, and relevant decision-register
   wording. Replace the layer-by-layer task example and any implication that small
   tasks mean separate PRs. Preserve stable IDs, task traceability, one coherent
   objective, unrelated-scope separation, cost controls, anti-gaming, historical
   corrections, and current authority cross-references. Update document metadata only
   as required by the repository's versioning convention.
3. In DOC-10, remove the `L`-must-split statement and fixed 100–500/under-200/over-800
   thresholds. Define reviewability signals and the written multi-PR rationale,
   including coordination, elapsed time, token/context, repeated checks/reviews,
   bookkeeping, and integration cost. Keep branch, testing, security, and deployment
   guidance intact.
4. Reconcile `docs/governance/change-risk-classification.md` without changing any class
   or path floor: consequence and reversibility still govern, splitting cannot lower
   combined risk, and diff size/task count does not mandate or reduce risk.
5. Align AGENTS.md, CONTRIBUTING.md, CLAUDE.md, and the PR template. The author records
   planned delivery shape, task-to-PR mapping, and the multi-PR rationale or explicit
   one-PR default. The reviewer checks the rationale and continued cohesion. Preserve
   every existing scope, exact-SHA, builder/reviewer separation, check, R4, EHR,
   action-authority, and external-orchestrator restriction.
6. Reconcile the Ruflo runbook so one writer still owns each worktree, but the unit is
   an assigned implementation work unit/PR rather than automatically each task ID.
   Ruflo remains external, advisory, credential-free, and without GitHub/live authority.
7. Align `docs/templates/change-specification.md`, `specs/README.md`, and the declared
   active package-template README/change/implementation-plan/tasks files. Templates
   record planned PR count; one is the default; more than one requires a non-placeholder
   boundary/overhead rationale. A single task is valid when it preserves clear mapping.
8. Extend the existing network-free foundation validator and unit tests with the narrow
   `VOC-090-D12` invariants. Test positive canonical state and isolated mutations for
   fixed line thresholds, missing default, task-per-PR implication, missing multi-PR
   rationale, and preservation of explicitly historical examples. Do not add a new
   workflow, dependency, background process, network call, semantic risk engine, or
   authority evaluator.
9. Run focused unit tests, Prettier on all supported changed files, governance
   validation, changed-path classification against the adopted base, and the Git diff
   whitespace check. Inspect the exact diff for excluded surfaces and record honest
   results.
10. In a disposable worktree, revert the exact implementation revision without
    committing and prove all authorized paths equal the adopted base. Remove only that
    disposable worktree after recording the result.
11. Obtain a different non-author exact-SHA independent review and a different
    non-author governance/delivery-workflow specialist verdict covering the R4 evidence
    contract. Resolve every blocker with a new SHA and fresh applicable checks/reviews.
12. Record hosted CI/Governance/Security results, normal merge by a separate non-author
    actor, and applicable post-merge checks on the same PR. Only then may an accountable
    operator close issue #143. No second implementation or evidence-only PR is planned.

## Compatibility and rollback

The change is forward-looking process guidance. It does not invalidate completed task
IDs, stacked PR histories, or historical evidence. Existing packages that deliberately
used multiple PRs remain valid records; future multi-PR plans explain their boundaries
under the new rule.

Rollback is a normal revert PR for the exact implementation revision, with the exact
pre-implementation `develop` base as last known good. Never reset a protected branch or
perform an external/live rollback. A regression in scope separation, risk floor,
review independence, R4 evidence, or action-authority wording is an immediate merge or
rollback blocker.
