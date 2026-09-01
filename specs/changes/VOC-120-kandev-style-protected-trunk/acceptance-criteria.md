# VOC-120 — Acceptance Criteria

## VOC-120-AC-01 — One understandable current truth

- Requirements: `VOC-120-D01`, `VOC-120-D07`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-01`
- Result: pending

A new contributor can determine branch, PR, review, risk, release, EHR, and
external-action rules from one concise normative document and linked engineering
guidance without resolving contradictory active documents.

## VOC-120-AC-02 — Routine work uses one PR

- Requirements: `VOC-120-D02`, `VOC-120-D03`
- Tasks: `VOC-120-T02`
- Tests: `VOC-120-TEST-01`
- Result: pending

Standard reversible work requires no nine-file package, adoption bookkeeping, or
separate plan PR. The concise issue/PR surfaces contain no mandatory irrelevant
fields or machine evidence binder.

## VOC-120-AC-03 — Protected and external controls remain strong

- Requirements: `VOC-120-D06`, `VOC-120-D08`, `VOC-120-D11`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-02`, `VOC-120-TEST-05`
- Result: pending

Auth, data, migration, AI safety, workflow, governance, release, and external-action
changes retain applicable deterministic, specialist, independent, rollback, and
human-authority controls.

## VOC-120-AC-04 — Path-aware checks always report

- Requirements: `VOC-120-D05`
- Tasks: `VOC-120-T01`
- Tests: `VOC-120-TEST-03`
- Result: pending

Every ruleset-required check produces a stable aggregate conclusion for relevant and
irrelevant changes. Applicable failures block. Unknown base/classifier failure runs
the broader suite. Merge-group behavior is covered.

## VOC-120-AC-05 — Native review replaces declared identity

- Requirements: `VOC-120-D02A`, `VOC-120-D06`, `VOC-120-D06A`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-02`
- Result: pending

No merge decision depends on builder/reviewer strings or evidence JSON in a PR body,
and no adapter polls sibling checks. Protected review is attributable through native
GitHub review/check/thread state.

The machine policy makes unknown effects Protected, dismisses stale review on push,
requires conversation resolution, and requires one non-author approving Review for
Protected paths. Standard behavior changes require an exact-head semantic review
check; docs-only Standard changes may use zero approvals.

## VOC-120-AC-06 — Protected main is truthful

- Requirements: `VOC-120-D04`, `VOC-120-D06A`, `VOC-120-D12`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-04`
- Result: pending

Live readback proves main protection, squash/linear history, required conversation
resolution, selected stable gates, merge queue configuration where enabled,
immutable version tags, protected-review enforcement, `cloudflare-staging`
reviewer/admin-bypass/policy-mode/custom-branch state, and native security settings.
The environment moves safely from `develop` through dual/bounded transition to sole
`main`; action C enables the queue only after PR6 activation; and PR3, PR5, and PR7
documentation agrees with each settings phase.

## VOC-120-AC-07 — Legacy control plane leaves the active path

- Requirements: `VOC-120-D01`, `VOC-120-D03`, `VOC-120-D04`
- Tasks: `VOC-120-T02`
- Tests: `VOC-120-TEST-01`, `VOC-120-TEST-06`
- Result: pending

Nine-file packages, non-EHR historical evidence replay, merge-eligibility polling,
duplicated governance authority, and reverse-sync machinery are absent from the final
active tree. EHR subjects remain until their human dispositions. Former revisions
remain recoverable from Git history and the recorded rollback ref.

## VOC-120-AC-08 — EHR is resolvable and scoped

- Requirements: `VOC-120-D09`, `VOC-120-D10`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-01`, `VOC-120-TEST-05`
- Result: pending

The EHR runbook has an accountable selector, qualification criteria, response target,
clear outcomes, and scope. It neither becomes routine review nor silently clears PR
#215 or issue #231. Adoption requires qualified confirmation of the selected finite
outcomes; any different outcome forces a revised, independently reviewed plan.
Confirmation occurs while the plan is draft and before adoption or PR1.

## VOC-120-AC-09 — Transition and rollback are proven

- Requirements: `VOC-120-D00`, `VOC-120-D04`, `VOC-120-D12`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-04`, `VOC-120-TEST-06`
- Result: pending

The draft EHR boundary precedes adoption and PR1. PR1 preparation, PR2 correction,
additive settings, immediate PR3 truth, PR4 cleanup and final old-model
promotion/synchronization, final settings/develop retirement, and immediate PR5 truth
plus separate PR6 activation, post-activation queue action C, and immediate PR7 truth
have exact preconditions and readbacks. Captured phase snapshots and no-bypass
immutable refs restore the last known good state without production or Cloudflare
deployment. Between action B and PR6 merge, the read-back repository lock admits only
the exact doc-only PR5 then one-file PR6 chain; PR6 alone activates committed future
state, and the queue is enabled only afterward.

## VOC-120-AC-10 — Repository and product validation remain green

- Requirements: `VOC-120-D08`, `VOC-120-D13`, `VOC-120-D14`
- Tasks: `VOC-120-T01`, `VOC-120-T02`
- Tests: `VOC-120-TEST-02`, `VOC-120-TEST-03`, `VOC-120-TEST-05`
- Result: pending

Applicable workspace, security, migration, integration, governance-transition,
formatting, and diff checks pass on each exact candidate. No learner-facing, schema,
Cloudflare, production, learner-data, secret-value, DNS, spending, or launch change
is present.
