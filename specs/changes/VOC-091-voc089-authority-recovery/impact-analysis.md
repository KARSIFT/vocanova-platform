# VOC-091 - Impact Analysis

## Repository and governance impact

This is a record-and-boundary correction for an invalid activation, not a modification
to the controls that detected it. The existing eligibility adapter correctly reported
blocked evidence; the incident was a merge actor reading job success instead of the
normalized JSON after an exact review arrived later. The recovery therefore changes no
workflow, evaluator, validator, settings, branch protection, or role policy.

The adopted plan remains inactive for implementation until its adoption-bookkeeping
revision has its own exact review, populated binder, genuine pre-merge eligibility,
normal merge, and post-merge evidence. This avoids treating candidate review or the
adoption decision as transferable evidence for a later SHA.

The future implementation must reconcile every active VOC-089 record that now implies
normal merge/effective authorization: `change.yaml`, README, specification, acceptance
criteria, impact analysis, implementation plan, tasks, test plan, and release plan.
Leaving any of those records unchanged would retain a contradictory authority claim.
The correction is additive and preservation-first: the existing approved VOC-089
objective, requirements, acceptance criteria, exact VOC-087 scope, test/evidence
mappings, one-task delivery, risk, non-goals, rollback, and issue #140 boundary remain
the inactive contract PR #147 must revalidate against after recovery.

## Product, runtime, data, and external effects

No product, API, schema, test fixture, runtime, deployment, Cloudflare, server, DNS,
secret, personal data, production data, analytics, or accessibility behavior changes.
The scope is repository documents only. PR #147 is not edited by this recovery; it is
already explicitly held and remains so.

## Historical evidence impact

The recovery must preserve, not remove or soften, the whole incident chain: the blocked
JSON, later exact review, unrefreshed blank binder, inaccurate readiness statement,
merge, post-merge checks, and independent audit. It must also preserve the PR #137
sequencing precedent but state the material difference in its pre-merge eligibility.

## Risk and mitigation

- A false reactivation could permit PR #147 without valid authority. Mitigation: make
  authority false/inactive until the recovery's own fresh pre-merge evidence and
  post-merge boundary complete.
- A passing workflow conclusion could again be mistaken for eligibility. Mitigation:
  require the exact normalized adapter JSON and its `eligible: true`, `reasons: []`
  values in the future PR evidence and exact review.
- A historical rewrite could destroy auditability. Mitigation: append/correct active
  claims while preserving immutable links, SHA, timestamps, and verdicts.
- An unnecessary close/reopen could add bookkeeping without safety benefit. Mitigation:
  retain PR #147 as an open draft, but require rebase/refresh and entirely fresh
  evidence; close it only if rebase/scope review proves it unsafe.
- A recovery could erase the later implementation contract. Mitigation: exact-diff
  review proves VOC-089 D00-D05, AC00-AC04, TEST00-TEST04, the eight-file allowlist,
  and `VOC-089-T00` remain intact; only incident/effectiveness overlay text is added.

## Rollback impact

Rollback is a normal repository revert PR for the future recovery implementation. It
restores the previous, inaccurate record and is therefore not a preferred remedy, but
it is fully reversible and has no live-system effect. A discovered defect in the
recovery record or scope must return through a separately governed correction.
