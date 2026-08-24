# VOC-091 - Recover VOC-089 implementation authority prospectively

Status: adopted in bookkeeping. Exact candidate
`c0b116fa26e87556695386e372542910cb4fa234` received independent PASS and the
accountable adoption decision on PR #149. Implementation authorization is recorded but
becomes effective only after this adoption-bookkeeping revision receives its own
exact-SHA review, a populated binder, a genuine pre-merge `eligible: true` /
`reasons: []` result, normal PR #149 merge, and applicable post-merge checks. Issue
[#148](https://github.com/KARSIFT/vocanova-platform/issues/148) granted planning
authority only and does not itself authorize implementation, PR #147 resumption, merge,
issue closure, or external action.

PR [#141](https://github.com/KARSIFT/vocanova-platform/pull/141) merged as
`925faf774ded5128c8aef2a298a8d6f506164ee0`, but its normal eligibility boundary was
not met. At `2026-08-24T11:33:44Z`, Governance run
[`32722390643`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722390643)
reported `decision: "blocked"`, `eligible: false`, and five reasons:
`review.identity_missing`, `review.stale`, `review.not_passing`,
`review.blocking_findings`, and `review.evidence_missing`. The later exact
adoption-bookkeeping review did not refresh the PR body's sole evidence binder or
produce a new pre-merge `eligible: true` / `reasons: []` decision. The later
merge-readiness statement claiming that run included passing eligibility is inaccurate.

The [independent incident audit](https://github.com/KARSIFT/vocanova-platform/pull/141#issuecomment-5394825877)
therefore concludes that the merge is historical fact but did not activate VOC-089
implementation authority. Post-merge passes do not retroactively supply that missing
pre-merge evidence. This is materially different from the preserved PR #137 precedent,
which had genuine pre-merge `eligible: true` / `reasons: []` evidence before its
separate disclosed sequencing incident.

One future VOC-091 implementation PR will correct all active VOC-089 package records
needed to state that truth and install no new workflow, evaluator, or authority path.
It will re-establish VOC-089 authority only prospectively, after its own exact review,
complete binder, genuine pre-merge eligibility result, normal merge, and applicable
post-merge checks. PR #147 remains open as a draft and blocked; it may later rebase and
refresh rather than close/reopen only after that recovery boundary completes.

The recovery is preservation-first. It retains VOC-089's adopted objective, D00-D05,
AC00-AC04, one-task/eight-file VOC-087 implementation contract, tests, evidence
mappings, R3 risk, non-goals, rollback, and issue #140 closure boundary as an inactive
future contract for PR #147. It changes only the false active normal-merge/effectiveness
claims and adds incident/recovery evidence. The semantic-candidate PASS and adoption
decision remain valid authorization evidence; `implementation_authorized: true` remains
distinct from `authority_effective: false` until the recovery completes.

PR #141's exact applicable post-merge evidence is CI
[`32722900390`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900390),
Governance
[`32722900352`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900352),
and Security
[`32722900426`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32722900426),
all passing on merge `925faf774ded5128c8aef2a298a8d6f506164ee0`. They remain preserved
post-merge facts, not a retroactive eligibility cure.

## Plan review history

Initial candidate `90b8f91f5c593e94a89e6c3841998d2078ddccad` received an independent
**FAIL** at [comment 5394970138](https://github.com/KARSIFT/vocanova-platform/pull/149#issuecomment-5394970138).
It remains immutable history: its recovery edit intent would have replaced the still-
needed VOC-089 implementation contract, and it omitted exact post-merge run anchors.
This amendment resolves those findings by making the later recovery additive and
preservation-first and recording the three runs. It needs a fresh exact-SHA independent
review; the prior FAIL is not approval.

Amended candidate `c0b116fa26e87556695386e372542910cb4fa234` received independent
**PASS** with zero blockers at
[comment 5395062917](https://github.com/KARSIFT/vocanova-platform/pull/149#issuecomment-5395062917),
resolving the initial FAIL without erasing it. The accountable adoption decision is at
[comment 5395082423](https://github.com/KARSIFT/vocanova-platform/pull/149#issuecomment-5395082423).
Candidate CI
[`32725952661`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32725952661)
and Security
[`32725952666`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32725952666)
passed. Governance [`32725979472`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32725979472)
passed structure/risk but its intentionally blank draft binder produced blocked
eligibility; it is not final merge evidence. Quality is not applicable to plan-only
paths. This later bookkeeping SHA needs fresh review and a newly populated binder.

No product behavior, test behavior, workflow/evaluator/validator, settings,
deployment, Cloudflare/live system, `main`, secret, or production-data change is in
scope.
