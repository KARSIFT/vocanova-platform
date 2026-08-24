# VOC-090 — Coherent Outcome Delivery: Specification

## Objective and requirement source

Resolve the delivery-shape ambiguity recorded by GitHub issue #143. Planning must
optimize for a coherent outcome, risk isolation, rollback safety, and reviewability
while accounting for the real coordination and evidence cost of each additional branch
or pull request. The policy must preserve all current security, governance, exact-SHA
review, risk, rollback, scope, EHR, and action-specific authority controls.

Issue #143 grants planning authority only. Exact candidate
`55a4a88012f47bf4b1263bb0bc5f6b80ec42a315` received fresh different-actor general/R4
and governance/delivery-workflow specialist PASS verdicts and the accountable adoption
decision. The adopted package records implementation authorization, but it remains
ineffective until this bookkeeping revision receives its own exact-SHA review and final
hosted evidence, PR #144 normally merges, and applicable post-merge checks pass. No
authority extends outside the adopted repository-only scope.

## Problem

At the drafting base:

- DOC-15 section 10.10 says tasks are small and illustrates one outcome as seven
  component/test/docs/evidence tasks;
- DOC-10 section 4 requires an `L` issue to be split and section 6 prefers 100–500
  meaningful changed lines, under 200 for fixes, and normally splits over 800;
- approved, current DOC-12 section 5 imposes a mandatory six-PR order for unresolved
  future P3 delivery, while approved, current DOC-09 section 24 recommends the same
  six-item PR sequence for future AI implementation, without a D03–D05 boundary or
  overhead rationale;
- DOC-15 section 16.4 and DG5-05 require a coherent pull request without unrelated
  cleanup, while section 24.20 prohibits artificial splitting;
- the active specification/package templates require task tables but do not say task
  IDs are minimum-sufficient evidence groupings inside the delivery unit; and
- agent, contributor, review, PR, and external-coordination guidance does not require a
  written justification when a plan multiplies implementation pull requests.

These clauses can turn one atomic outcome into component-shaped tasks, branches, and
exact-review cycles merely because the diff is broad or crosses test/documentation
layers. That can increase elapsed time, token usage, orchestration, repeated validation,
hosted checks, merge bookkeeping, and reviewer context-switching without producing an
independently releasable or rollback-safe boundary.

## Decisions and requirements

- `VOC-090-D00` — A planner must select the largest safe coherent delivery unit that
  consolidates every backend, frontend, contract, test, documentation, rollback, and
  evidence layer sharing one approved user or business outcome and control boundary.
  That unit defaults to one approved `VOC-###` package, one implementation pull request
  into `develop`, and one minimum-sufficient task. The rule is a consolidation duty,
  not a ban on justified multi-PR delivery.
- `VOC-090-D01` — A package must use the minimum sufficient number of stable task IDs
  needed to group requirements, acceptance criteria, tests, dependencies, ownership,
  sequence, and evidence. A task ID must not itself imply a branch, worktree, pull
  request, merge, release, or independent outcome.
- `VOC-090-D02` — Component boundaries, frontend/backend/database layers, contracts,
  test layers, documentation updates, generated artifacts, line counts, and
  implementation convenience must not by themselves require separate tasks or
  implementation pull requests. When they share D00's outcome and control boundary,
  they must be consolidated unless a D03–D05 exception is proven.
- `VOC-090-D03` — Splitting is exceptional and requires evidence that it creates
  independently releasable and rollback-safe outcomes, isolates a material risk or
  action-authority boundary, respects a hard dependency, separates genuinely
  incompatible reviewers/owners, or addresses a demonstrated cognitive/reviewability
  limit that clearer in-PR organization cannot solve.
- `VOC-090-D04` — A plan proposing more than one implementation pull request must
  include a non-placeholder written rationale identifying the applicable `D03`
  condition, why one PR would be unsafe or genuinely unreviewable, the dependency and
  integration shape, and how each partial state remains coherent and rollback-safe.
- `VOC-090-D05` — The multiple-PR rationale must compare the split's risk/review benefit
  with coordination, elapsed delivery time, token/context use, repeated local and
  hosted checks, repeated exact-SHA review, merge/bookkeeping cycles, and integration
  overhead. Diff size remains a review signal, not a success metric or fixed mandate.
- `VOC-090-D06` — Reviewability must be assessed through cohesion, cognitive load,
  requirement/acceptance mapping, file ownership, generated-versus-authored content,
  test evidence, risk concentration, dependency order, and rollback clarity. A large
  coherent diff may remain one PR; a smaller incoherent diff may require separation.
- `VOC-090-D07` — The policy must continue to require one coherent objective, exclude
  unrelated cleanup, route unrelated improvements to separate issues/packages, and
  prevent splitting from lowering the combined risk classification or bypassing any
  control.
- `VOC-090-D08` — Different-actor exact-revision review, deterministic checks,
  protected-path floors, complete R4 evidence, blocking-finding resolution, rollback,
  EHR, and separately defined action-specific authority must remain mandatory where
  applicable. No delivery shape or R0–R4 label grants approval, merge, settings,
  deployment, production, or external-effect authority.
- `VOC-090-D09` — The later implementation must reconcile the complete active surface
  inventory in `change.yaml` atomically in one pull request. Compatible historical
  records and completed packages must not be rewritten merely to match the new default.
- `VOC-090-D10` — The active package templates must explicitly capture planned
  implementation pull-request count and require a written multi-PR rationale when that
  count exceeds one. The one-PR default must not require placeholder rationale.
- `VOC-090-D11` — The pull-request template and reviewer guidance must expose the
  adopted delivery shape, task-to-PR mapping, and split rationale or explicit
  one-PR-default result without weakening any existing evidence field.
- `VOC-090-D12` — A deterministic, network-free governance regression guard and
  negative fixtures must reject reintroduction of mandatory size thresholds,
  task-ID-equals-PR semantics, omission of the one-package/one-PR default, or a
  multi-PR template or active mandatory/recommended PR sequence without required
  rationale. The guard must allow explicitly labelled historical examples and must not
  attempt semantic risk or authority decisions.
- `VOC-090-D13` — The implementation itself must use one package, one implementation
  pull request, and one task `VOC-090-T00`; all documentation, template, validator,
  test, exact-review, rollback, hosted, merge, and post-merge evidence belongs to that
  same pull request.
- `VOC-090-D14` — DOC-12's future P3 six items and DOC-09's matching AI six items must
  be reconciled as an ordered component/implementation sequence inside the default one
  coherent P3/AI implementation pull request, not as six pre-authorized PRs. A future
  adopted P3/AI package may instead require multiple PRs only when it records a
  concrete D03 boundary plus the D04 partial-state/integration/rollback explanation and
  D05 overhead comparison. The two documents must remain semantically aligned.

## Scope

In scope:

- Reconcile DOC-15, DOC-16, DOC-10, risk guidance, agent/reviewer/contributor guidance,
  DOC-12's active P3 roadmap, DOC-09's active AI implementation guidance, the external-
  coordination runbook, the PR template, and active change-package guidance/templates
  listed in `change.yaml`.
- Replace size-driven splitting mandates with the outcome/risk/rollback/reviewability
  contract above.
- Add the smallest deterministic static guard and negative tests needed to prevent the
  specific regression.

Out of scope:

- Product behavior, application/runtime code, APIs, databases, migrations, dependency
  changes, generated product artifacts, CI workflow behavior, merge evaluator logic,
  protected-path classification, repository settings, Cloudflare, DNS, secrets,
  deployment, production data, live-system inspection, spending, or launch.
- Retroactively restructuring, renumbering, or rewriting completed packages, tasks,
  branches, pull requests, releases, or historical evidence.
- Declaring that every coherent outcome must fit one PR regardless of real risk,
  rollback, dependency, authority, reviewer, or reviewability boundaries.

## Compatibility and authority

The policy is forward-looking for new plans and implementation delivery decisions.
Existing stable identifiers and historical evidence remain valid. The change does not
alter merge eligibility, role separation, required checks, risk floors, branch
protection, release eligibility, EHR, or action-specific authority.

The semantic effect would otherwise be R3, but DOC-15's current path floor makes the
effective implementation R4. This package does not modify the classifier or protected
path policy. R4 requires the strongest evidence but no founder or standing technical-
steward approval solely because of the class.

## Assumptions and open questions

No material open question remains in the proposed contract. Exact wording and marker
placement may be refined during implementation only within these decisions and the
declared file inventory. Any need to change an excluded executable policy, path floor,
workflow, external setting, or live system stops implementation and returns to
planning.
