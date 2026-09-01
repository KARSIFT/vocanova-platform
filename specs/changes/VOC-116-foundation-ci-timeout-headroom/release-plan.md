# VOC-116 — Release Plan

## Repository delivery only

This correction has no deployment or product release. After reviewed adoption, one R3
implementation PR targets `develop`; merge changes repository CI behavior only. No
workflow dispatch, environment, Cloudflare, secret, migration, production, data,
traffic/DNS, spending, `main` promotion, or launch action is authorized.

## Pre-merge gates

- Exact six-path diff and unchanged command/test discovery proof.
- Focused timeout and aggregate positive/negative matrices.
- Complete 204-test foundation result and full `pnpm validate`.
- Governance, R3 risk floor, formatting, and diff checks.
- Disposable six-path rollback/reapply rehearsal.
- Hosted CI/Governance/Security PASS on the exact final SHA.
- Different non-author/distinct-model exact-revision R3 PASS with recorded actor/model
  provenance and zero blockers; plan review and implementation review are separate.
- Parent workflow-policy protection inventory, unchanged-effect regression replay, and
  additive exact-20 proof pass before eligibility, with no weakened intermediate state.
- Exact privilege diff shows only +5 minutes of foundation runner execution/feedback
  delay and no permission, trigger, secret, write, action, deploy, or other authority.
- Truthful PR evidence and separate non-author merge.

## Activation and monitoring

Activation is the ordinary reviewed merge into `develop`. Under DOC-15 §24.18, the
adoption-recorded owner monitors from that merge until CI, Governance, and Security
finish on the exact merge SHA and fresh `origin/develop` readback confirms the six-path
contract. Record on issue #218:

- exact merge SHA/tree and hosted run/job URLs;
- foundation job and validation start/end/durations;
- timeout value 20 and full 204-test pass count;
- `foundation` and `ci required` conclusions;
- exact path set and unchanged command/discovery proof.

Success requires all signals passing, lifecycle below 20 minutes, no cancellation, and
no recurrence. A duration at/over 20 minutes, incomplete suite, cancellation,
nonsuccess aggregate, or scope/command drift stops issue closure and routes a linked
bug/separately governed correction. The cap must not be increased again without fresh
measurements and a new approved scope.

## Rollback triggers and procedure

Rollback triggers are false validator acceptance/rejection, omitted tests, aggregate
weakening, unexpected workflow behavior, documentation contradiction, or material CI
cost/latency regression not justified by the measured contract.

Before merge, close the PR. After merge, revert the complete implementation through a
normal reviewed PR, restoring all six paths to the actual first parent and the
15-minute cap. Run focused policy, foundation, governance, risk, and diff checks. The
known timeout recurrence remains visible; rollback must never skip/weaken tests. If
continued 20-minute headroom is safer than rollback, keep the repository stable and
route a separately governed correction rather than partially reverting.

## Communication and holds

The PR and issue record are sufficient; no user communication is needed. Production
and learner-data holds remain active and unchanged. `automatic_merge_allowed: true`
records package policy only and does not merge, bypass R3 evidence, or grant authority.
