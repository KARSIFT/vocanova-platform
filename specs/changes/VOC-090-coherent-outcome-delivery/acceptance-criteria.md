# VOC-090 — Acceptance Criteria

## VOC-090-AC-00 — One coherent default delivery unit

Given the reconciled active governance and development guidance
When a planner defines one coherent user or business outcome
Then the documented default is one approved change package and one implementation
pull request
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
Then a non-placeholder written rationale names an independently releasable/rollback-
safe outcome, material risk or action-authority boundary, hard dependency,
incompatible reviewer/owner need, or genuinely unreviewable diff
And it explains partial-state coherence, integration order, and rollback
And it compares the benefit with coordination, elapsed-time, token/context, repeated
validation, hosted-check, exact-review, merge, and bookkeeping overhead.

## VOC-090-AC-03 — No size-driven mandate and preserved scope discipline

Given the final active guidance and templates
When they are searched for delivery-size rules
Then no fixed preferred line-count range or over-N-lines split mandate remains
And component count, test layers, documentation, or generated artifacts alone are not
split triggers
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
And isolated mutations that restore fixed line thresholds, remove the one-package/
one-PR default, imply task-ID-per-PR semantics, or omit multi-PR rationale fail with
concrete messages
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
