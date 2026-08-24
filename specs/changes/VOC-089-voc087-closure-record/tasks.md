# VOC-089 - Tasks

## VOC-089-T00 - Reconcile VOC-087 active closure state

- Requirements: `VOC-089-D00` through `VOC-089-D05`
- Acceptance criteria: `VOC-089-AC-00` through `VOC-089-AC-04`
- Tests: `VOC-089-TEST-00` through `VOC-089-TEST-04`
- Evidence: `VOC-089-EV-00` through `VOC-089-EV-04`
- Risk: R3
- Status: adopted-authorized but ineffective; PR #141 did not satisfy pre-merge
  eligibility, and PR #147 remains blocked until VOC-091 recovery completes

In one implementation PR after this package is adopted, update only the active stale
VOC-087 package-record wording identified by `implementation-plan.md`. Record exact
completed PR #137, PR #138, post-merge, and issue #132 closure evidence. Preserve the
historical failed/pass review sequence and the PR #137 merge-sequencing incident.

The task stops and returns to planning if any product code, workflow, validator,
evaluator, repository settings, Cloudflare, deployment, live-system, production-data,
`main`, branch deletion, or additional package scope appears necessary.

## VOC-091 authority-recovery overlay

PR #141 merged as `925faf774ded5128c8aef2a298a8d6f506164ee0`, but its final pre-merge
Governance adapter run
[`32722390643`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722390643)
reported at `2026-08-24T11:33:44Z`: `decision: "blocked"`, `eligible: false`, with
`review.identity_missing`, `review.stale`, `review.not_passing`,
`review.blocking_findings`, and `review.evidence_missing`. The later exact bookkeeping
review
[5394643309](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394643309)
did not update the sole binder or produce a later pre-merge `eligible: true` /
`reasons: []`, so the merge-readiness claim
[5394657645](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394657645)
was inaccurate.

Post-merge CI
[`32722900390`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900390),
Governance
[`32722900352`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900352),
and Security
[`32722900426`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900426)
passed on that merge SHA, but independent audit
[5394825877](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394825877)
records that they are not a retroactive eligibility cure. The PR #137 audit
[5390981903](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903)
is distinct because PR #137 had genuine pre-merge `eligible: true` / `reasons: []`
evidence.

`VOC-089-T00` remains the single future implementation task for the exact eight-file
VOC-087 record correction, but it cannot resume through PR #147 until the VOC-091
recovery implementation has exact different-actor review, one populated binder, literal
pre-merge `eligible: true` / `reasons: []`, normal merge, and applicable post-merge
checks. PR #147 remains draft/blocked under
[5394841275](https://github.com/KARSIFT/vocanova-platform/pull/147#issuecomment-5394841275).
Issue #148 closes only after recovery; issue #140 closes only after later PR #147
completion.
