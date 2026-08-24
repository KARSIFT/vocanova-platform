# VOC-090 — Implementation Plan

## Preconditions and protected areas

Do not implement from issue #143 alone. Exact candidate
`55a4a88012f47bf4b1263bb0bc5f6b80ec42a315` received fresh different-actor general/R4
and governance/delivery-workflow specialist PASS verdicts and the accountable adoption
decision. `change.yaml` now records `status: adopted` and implementation authorization.
Do not implement yet: authority becomes effective only after this bookkeeping revision
receives its own different-actor exact-SHA review and final hosted evidence, PR #144
normally merges, and applicable post-merge checks pass. Candidate verdicts do not
transfer to this bookkeeping SHA.

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
   planners select the largest safe coherent unit across all layers sharing an outcome
   and control boundary; that unit defaults to one approved package, one implementation
   PR, and one minimum-sufficient task; justified exceptional splits use outcome,
   risk/authority, rollback, dependency, reviewer/owner, and demonstrated reviewability
   boundaries; multiple PRs require written overhead-aware rationale. Preserve the
   universal evidence contract and all branch/merge/action-authority rules.
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
4. In DOC-12 section 5 and DOC-09 section 24, preserve the future P3/AI six-item
   dependency order, substance, provider/privacy prerequisites, specialist review,
   safety/security/privacy/cost blockers, and acceptance gates, but replace the phrases
   “Mandatory six-PR order” and “Recommended PR sequence” with one aligned ordered
   implementation-component sequence inside the default coherent P3/AI PR. In both
   documents, state that a future adopted P3/AI package may use multiple PRs only with
   a concrete D03
   boundary, D04 partial-state/integration/rollback explanation, and D05 coordination,
   time, token/context, repeated-check, exact-review, merge, and bookkeeping overhead
   comparison. Do not decide that future exception inside VOC-090.
5. Reconcile `docs/governance/change-risk-classification.md` without changing any class
   or path floor: consequence and reversibility still govern, splitting cannot lower
   combined risk, and diff size/task count does not mandate or reduce risk.
6. Align AGENTS.md, CONTRIBUTING.md, CLAUDE.md, and the PR template. The author records
   planned delivery shape, task-to-PR mapping, and the multi-PR rationale or explicit
   one-PR default, and demonstrates that the plan selected the largest safe coherent
   unit across backend, frontend, contracts, tests, documentation, rollback, and
   evidence sharing the outcome. The reviewer checks maximization, exception rationale,
   and continued cohesion. Preserve every existing scope, exact-SHA, builder/reviewer
   separation, check, R4, EHR, action-authority, and orchestrator restriction.
7. Reconcile the Ruflo runbook so one writer still owns each worktree, but the unit is
   an assigned implementation work unit/PR rather than automatically each task ID.
   Ruflo remains external, advisory, credential-free, and without GitHub/live authority.
8. Align `docs/templates/change-specification.md`, `specs/README.md`, and the declared
   active package-template README/change/implementation-plan/tasks files. Templates
   record planned PR count; one is the default; more than one requires a non-placeholder
   boundary/overhead rationale. A single task is valid when it preserves clear mapping.
9. Extend the existing network-free foundation validator and unit tests with the narrow
   `VOC-090-D12` invariants. Test positive canonical state and isolated mutations for
   fixed line thresholds, missing largest-safe-coherent-unit/default wording, task-per-
   PR implication, missing multi-PR rationale, an active mandatory/recommended PR
   sequence without rationale, DOC-12/DOC-09 semantic drift, and preservation of
   explicitly labelled historical examples. Do not add a new workflow, dependency,
   background process, network call, semantic risk engine, or authority evaluator.
10. Run focused unit tests, Prettier on all supported changed files, governance
    validation, changed-path classification against the adopted base, and the Git diff
    whitespace check. Inspect the exact diff for excluded surfaces and record honest
    results.
11. In a disposable worktree, revert the exact implementation revision without
    committing and prove all authorized paths equal the adopted base. Remove only that
    disposable worktree after recording the result.
12. Obtain a different non-author exact-SHA independent review and a different
    non-author governance/delivery-workflow specialist verdict covering the R4 evidence
    contract. Resolve every blocker with a new SHA and fresh applicable checks/reviews.
13. Record hosted CI/Governance/Security results, normal merge by a separate non-author
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
