# VOC-091 - Tasks

## VOC-091-T00 - Recover VOC-089 authority record and prospective activation boundary

- Requirements: `VOC-091-D00` through `VOC-091-D06`
- Acceptance criteria: `VOC-091-AC-00` through `VOC-091-AC-04`
- Tests: `VOC-091-TEST-00` through `VOC-091-TEST-07`
- Evidence: `VOC-091-EV-00` through `VOC-091-EV-04`
- Risk: R3
- Status: draft-not-authorized

In one future implementation PR, correct only the nine active VOC-089 package records
to preserve PR #141's invalid pre-merge eligibility and to define a prospective
authority-recovery boundary. The task is not a VOC-087 implementation and may not edit
PR #147. It completes only after its own exact review, complete binder, genuine
pre-merge `eligible: true` / `reasons: []`, normal merge, and applicable post-merge
evidence establish the recovery. Issue #148 may then close; issue #140 remains open.

PR #147 stays draft/blocked until that completion. It may later rebase/refresh only
under its own fresh governed evidence; its existing SHA, checks, reviews, and binder
never transfer. Stop and return to planning if any product, workflow/evaluator/
validator, setting, deployment, live-system, secret, production-data, `main`, branch,
or non-VOC-089 file becomes necessary.
