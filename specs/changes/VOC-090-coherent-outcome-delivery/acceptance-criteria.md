# VOC-090 — Acceptance Criteria

## VOC-090-AC-00 — Largest safe coherent default delivery unit

Given the reconciled active governance and development guidance
When a planner defines one coherent user or business outcome
Then the planner must select the largest safe coherent unit across backend, frontend,
contracts, tests, documentation, rollback, and evidence sharing the outcome and control
boundary
And the documented default is one approved change package, one implementation pull
request, and one minimum-sufficient task
And the guidance allows a justified split only through the adopted boundary criteria.

## VOC-090-AC-01 — Minimum-sufficient task semantics

Given a package with requirements, acceptance criteria, tests, dependencies, and
evidence
When its task breakdown is prepared
Then it uses the minimum sufficient stable task IDs for traceability and evidence
And no active template or guidance implies that each task ID requires its own branch,
worktree, pull request, merge, or release.

## VOC-090-AC-02 — Outcome-driven split decision and rationale

Given a planner proposes multiple implementation pull requests
When the plan and templates are completed
Then the proposal is treated as exceptional
And a non-placeholder written rationale names an independently releasable/rollback-
safe outcome, material risk or action-authority boundary, hard dependency,
incompatible reviewer/owner need, or demonstrated cognitive/reviewability limit
And it explains partial-state coherence, integration order, and rollback
And it compares the benefit with coordination, elapsed-time, token/context, repeated
validation, hosted-check, exact-review, merge, and bookkeeping overhead.

## VOC-090-AC-03 — No size-driven mandate and preserved scope discipline

Given the final active guidance and templates
When they are searched for delivery-size rules
Then no fixed preferred line-count range or over-N-lines split mandate remains
And component count, test layers, documentation, or generated artifacts alone are not
split triggers
And implementation convenience alone is not a split trigger
And one coherent objective, reviewability, no unrelated cleanup, and separate handling
of unrelated improvements remain explicit.

## VOC-090-AC-04 — Controls and authority remain intact

Given the exact implementation diff
When it is compared with the adopted base and current governance
Then risk classification, protected-path floors, deterministic checks, different-actor
exact-revision review, blocking-finding resolution, rollback, complete R4 evidence,
EHR, and action-specific authority are not weakened
And no workflow, merge evaluator, repository setting, external service, secret,
production data, deployment, `main`, or live system is changed or exercised.

## VOC-090-AC-05 — Deterministic regression evidence

Given the network-free governance validator and its unit fixtures
When run on the reconciled repository
Then the positive tree passes
And isolated mutations that restore fixed line thresholds, remove explicit largest-
safe-coherent-unit or one-package/one-PR default wording, imply task-ID-per-PR
semantics, preserve an
active mandatory/recommended PR sequence without D03–D05 rationale, make DOC-12/DOC-09
disagree, or omit multi-PR rationale fail with concrete messages
And explicitly historical examples remain permitted.

## VOC-090-AC-06 — One-PR implementation and reversible completion

Given an adopted VOC-090 package
When `VOC-090-T00` is implemented
Then all declared living-document, template, static-guard, test, validation, rollback,
different-actor exact-SHA review, hosted-check, merge, and post-merge evidence is
completed in one implementation pull request
And a disposable repository-only revert restores every authorized path to the exact
pre-implementation tree
And issue #143 remains open until merge and applicable post-merge checks pass.

## VOC-090-AC-07 — Future P3/AI sequence is coherent

Given approved current DOC-12 and DOC-09 describe the same unresolved future six-item
P3/AI sequence
When the later implementation reconciles them
Then both documents describe those items as ordered implementation components inside
the default one coherent P3/AI pull request rather than mandatory or recommended PRs
And either document permits multiple PRs only through a future adopted exception that
records the D03 boundary, D04 partial-state/integration/rollback rationale, and D05
coordination/time/token/repeated-check/exact-review overhead comparison
And the two documents remain semantically aligned.
