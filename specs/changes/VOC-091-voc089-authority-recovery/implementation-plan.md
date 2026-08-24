# VOC-091 - Implementation Plan

Exact candidate `c0b116fa26e87556695386e372542910cb4fa234` received independent PASS
and the accountable adoption decision. This bookkeeping revision records
`status: adopted` and `implementation_authorized: true`. Do not implement yet: this
authorization becomes effective only after this bookkeeping SHA receives its own
different-actor exact review, populated binder, genuine pre-merge `eligible: true` /
`reasons: []`, normal PR #149 merge, and applicable post-merge checks. This plan
authorizes one future recovery implementation PR and one task, not a retroactive repair
of PR #141.

## Exact recovery allowlist and edit intent

The future recovery PR changes only these current VOC-089 records:

1. `change.yaml` — preserve VOC-089's identity, approved candidate/adoption decision,
   `implementation_authorized: true`, D00-D05 contract, R3 risk, one-task/eight-file
   scope, non-goals, rollback, and issue #140 boundary. Add a structured
   invalid-premerge-eligibility incident record, explicit `authority_effective: false`,
   recovery-pending status, exact post-merge anchors, and prospective recovery gates.
2. `README.md` — retain the VOC-089 objective and later implementation summary; add an
   incident/recovery overlay with blocked JSON, no-retroactivity, post-merge anchors,
   and PR #147 resumption boundary.
3. `specification.md` — retain D00-D05 and add, rather than replace, exact recovery
   requirements/incident anchors/closure limits. The eight-file VOC-087 outcome stays
   the inactive contract.
4. `acceptance-criteria.md` — retain AC00-AC04 and their mappings/results; add
   recovery criteria proving authority distinction and contract preservation.
5. `impact-analysis.md` — retain the original closure-record analysis and append the
   authority-invalidity impact, exact post-merge distinction, and mitigations.
6. `implementation-plan.md` — retain the exact eight-file VOC-087 edit sequence and
   append the recovery precondition and prospective activation sequence; do not replace
   the later implementation instructions.
7. `tasks.md` — retain `VOC-089-T00`, its requirements, eight-file scope, and one-PR
   contract, but mark it authorized-yet-ineffective pending VOC-091 recovery.
8. `test-plan.md` — retain TEST00-TEST04 and append incident/binder/adapter,
   post-merge, scope, rollback, contract-preservation, and resumption-boundary tests.
9. `release-plan.md` — retain the later VOC-089 implementation and issue #140 closure
   boundary; add the recovery boundary that must precede PR #147 resumption.

The correction must not edit VOC-087 or PR #147. It must not delete historical evidence
or state that the correction makes the 2026-08-24 merge normal.

## One-PR recovery sequence

1. Start from current `develop`; re-read the nine VOC-089 files, issue #148, PR #141's
   body/timeline/run log, its audit, and PR #147 hold. Confirm no new drift requires a
   separate issue.
2. Make the nine-file records mutually consistent with `VOC-091-D00` through `D07`.
   Preserve historical links and use unambiguous active-state values such as
   `implementation_authorized: true` (valid adopted authorization) and
   `authority_effective: false` (ineffective through invalid PR #141) until recovery
   completion. Do not invent a recovery SHA, review, eligibility result, merge, or
   post-merge outcome, and do not delete or alter the inactive VOC-089 implementation
   contract except to add the incident/recovery overlay.
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
