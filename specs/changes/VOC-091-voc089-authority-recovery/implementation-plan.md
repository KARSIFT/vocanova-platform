# VOC-091 - Implementation Plan

Do not implement until VOC-091 is independently reviewed, adopted, and its adoption
bookkeeping has itself satisfied the normal plan-PR boundary. This plan authorizes one
future recovery implementation PR and one task, not a retroactive repair of PR #141.

## Exact recovery allowlist and edit intent

The future recovery PR changes only these current VOC-089 records:

1. `change.yaml` — replace the false effective-authority/adoption activation claims
   with a structured invalid-premerge-eligibility incident record; preserve the
   semantic-candidate PASS/adoption decision as historical evidence; set no effective
   implementation authority; add the prospective recovery gates and PR #147 hold.
2. `README.md` — replace the adoption/activation summary with the incident truth,
   blocked JSON, no-retroactivity rule, and recovery/resumption boundary.
3. `specification.md` — replace requirements that assume normal PR #141 activation
   with the exact recovery requirements, incident anchors, and closure limits.
4. `acceptance-criteria.md` — replace completion assumptions with observable record,
   fail-closed recovery, and PR #147 resumption criteria.
5. `impact-analysis.md` — replace the claim that VOC-089 merely reconciles already
   completed evidence with the authority-invalidity impact and mitigations.
6. `implementation-plan.md` — replace the invalid future VOC-087 edit sequence with
   this recovery's nine-file scope and prospective activation sequence.
7. `tasks.md` — supersede the inactive `VOC-089-T00` execution instruction with an
   explicit blocked state and reference to VOC-091 as the sole recovery route.
8. `test-plan.md` — replace VOC-087 closure-record tests with incident/binder/adapter,
   exact-review, post-merge, scope, rollback, and resumption-boundary tests.
9. `release-plan.md` — replace the invalid PR #141 merge boundary and issue #140
   closure instruction with recovery and later PR #147 boundaries.

The correction must not edit VOC-087 or PR #147. It must not delete historical evidence
or state that the correction makes the 2026-08-24 merge normal.

## One-PR recovery sequence

1. Start from current `develop`; re-read the nine VOC-089 files, issue #148, PR #141's
   body/timeline/run log, its audit, and PR #147 hold. Confirm no new drift requires a
   separate issue.
2. Make the nine-file records mutually consistent with `VOC-091-D00` through `D06`.
   Preserve historical links and use unambiguous active-state values such as
   `implementation_authorized: false` and `authority_effective: false` until recovery
   completion; do not invent a recovery SHA, review, eligibility result, merge, or
   post-merge outcome.
3. Run the package-level validation in `test-plan.md`, inspect the exact diff against
   the allowlist, and create one implementation PR to `develop` with a truthful body.
4. A different non-author reviewer reviews the exact final head, including the literal
   adapter JSON requirement and the no-retroactivity evidence. Resolve every finding
   with a new SHA and a fresh reviewer.
5. Before the final Governance eligibility run, populate exactly one
   `merge-eligibility-evidence-v1` block for that final head: attributable reviewer
   identity/role, matching reviewed SHA, `pass` verdict, `blocking_findings_resolved:
true`, and review evidence URL. Confirm all risk fields remain truthful.
6. Trigger or wait for a Governance run after that body is current, inspect its
   normalized adapter JSON—not just the check conclusion—and require exactly
   `eligible: true` and `reasons: []` while the PR head/body remain unchanged. Record
   the exact run URL/JSON in the final PR evidence.
7. A separate non-author merge actor audits the final SHA, review, binder, JSON, hosted
   applicable checks, and no-active-EHR/action-hold status before a normal merge.
   After merge, record applicable CI/Governance/Security post-merge evidence.
8. Only then state VOC-089 authority effective for its previously bounded one-PR
   VOC-087 correction and close issue #148. Keep issue #140 open.
9. PR #147 may then remain open and rebase/refresh onto the recovery merge. Its final
   revision receives its own validation, exact independent review, populated binder,
   genuine `eligible: true` / `reasons: []`, normal merge, and post-merge evidence;
   only then may issue #140 close. If rebase or exact scope verification fails, close
   PR #147 and return to planning rather than repair it under this package.

## Rollback

Use a normal repository revert PR if the future recovery records an inaccurate fact or
exceeds the allowlist. Never reset a protected branch, delete a branch, mutate a
workflow/settings/live system, or treat a revert as permission to reactivate VOC-089.
