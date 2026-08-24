# VOC-090 — Tasks

## VOC-090-T00 — Reconcile and prove coherent outcome delivery

- Requirements: `VOC-090-D00` through `VOC-090-D14`
- Acceptance criteria: `VOC-090-AC-00` through `VOC-090-AC-07`
- Tests: `VOC-090-TEST-00` through `VOC-090-TEST-05`
- Evidence: `VOC-090-EV-00` through `VOC-090-EV-04`
- Risk: R4 (otherwise-R3 semantic effect elevated by unchanged DOC-15 path floor)
- Status: adopted-authorized; effective only after bookkeeping exact-SHA review and hosted evidence, PR #144 normal merge, and applicable post-merge checks

In one implementation pull request, reconcile every active governance, workflow,
agent/reviewer/contributor, coordination, PR, and change-package template surface
listed in `change.yaml`. Establish one approved package plus one implementation PR as
the default largest safe coherent unit for one outcome and shared control boundary;
define task IDs as minimum-sufficient traceability/evidence groupings; replace fixed
line-count splitting mandates with outcome/risk/rollback/dependency/reviewer/
reviewability signals; and require an overhead-aware written rationale for every
exceptional multi-PR plan. Consolidate backend, frontend, contracts, tests,
documentation, rollback, and evidence layers when they share the approved outcome;
component count, line count, test layers, or convenience alone never justify a split.

The same atomic reconciliation converts DOC-12's mandatory future P3 six-PR order and
DOC-09's matching recommended AI PR sequence into aligned ordered implementation
components inside the default coherent P3/AI PR. It preserves their dependency,
provider/privacy, specialist, safety, cost, and acceptance controls and permits any
future multi-PR exception only through an adopted D03–D05-compliant rationale.

The same pull request adds and proves the narrow deterministic regression guard, runs
all applicable validation, rehearses repository-only rollback, receives different-
actor exact-SHA and governance/delivery-workflow specialist review, records hosted and
post-merge evidence, and supplies issue-closure evidence. `VOC-090-T00` is intentionally
one task because the change has one objective, one owner/integration boundary, one
rollback, one reviewable policy diff, and one implementation PR. Separate task IDs
would add no independently releasable, rollback-safe, authority, dependency, owner, or
review boundary.

Stop and return to planning if any work requires an undeclared path or an executable
workflow/evaluator/classifier change, external setting, Cloudflare/DNS/deployment/live
action, secret, production data, spending, or launch. Unrelated improvements become a
separate issue/package and do not enter this pull request.
