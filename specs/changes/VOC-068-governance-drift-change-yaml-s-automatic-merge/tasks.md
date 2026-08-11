# VOC-068 — Tasks

## VOC-068-T00 — Add risk-linked `automatic_merge_allowed` guidance to AGENTS.md

- Requirement source: issue #488; `VOC-068-D00`; `VOC-068-DEP-00`;
  `VOC-068-DEP-01`
- Acceptance criteria: `VOC-068-AC-00`, `VOC-068-AC-01`, `VOC-068-AC-03`
- Tests: `VOC-068-TEST-00`, `VOC-068-TEST-01`, `VOC-068-TEST-03`
- Evidence: `VOC-068-EV-00`
- Status: pending

Edit `AGENTS.md` only (plus DOC-15 **if and only if** adoption chose
`VOC-068-DEP-00` option b; plus an optional one-sentence cross-reference in
`docs/governance/change-risk-classification.md` if useful and still within R3).

Required content (wording may vary; meaning must not):

1. **Drafting rule by risk class**, using the R3 preference settled in
   `VOC-068-DEP-01` at adoption:
   - R0–R2: `automatic_merge_allowed: true` by default.
   - R3: per adoption decision (preferred-true with justified false, or
     always-explicit justified choice).
   - R4: `automatic_merge_allowed: false`.
2. **Justification requirement:** any deliberate `false` on an R0–R2 package
   (and, if adoption requires it, any R3 choice) must state why in a
   `change.yaml` comment or adjacent one-line note — same spirit as
   `planned_implementation_risk_floor`.
3. **Semantics reminder:** the field is a per-package opt-out from
   already-authorized auto-merge into `develop` (merge-gate +
   `auto_merge_enabled`); it does not replace risk classification,
   independent verification, CI, R4 founder authority, or EHR.
4. **Doc reconciliation:** apply `VOC-068-DEP-00`'s chosen option and record
   it in evidence.

Do not modify workflows, autonomy switches, or application code.
Do not mark any package adopted.

May proceed before or in the same PR as `VOC-068-T01` if the PR description
keeps task boundaries clear; prefer a single PR for T00+T01 when both are
docs/template-only, since they are tightly coupled.

## VOC-068-T01 — Update the change-package template so the field is an active choice

- Requirement source: issue #488; `specification.md` open question 4
- Acceptance criteria: `VOC-068-AC-02`, `VOC-068-AC-03`
- Tests: `VOC-068-TEST-02`, `VOC-068-TEST-03`
- Evidence: `VOC-068-EV-01`
- Status: pending — may land with or immediately after `VOC-068-T00`; must
  not contradict the AGENTS.md rule T00 lands

Edit:

- `specs/templates/change-package/change.yaml`
- `specs/templates/change-package/README.md` (short pointer to the AGENTS.md
  rule)

Apply the template shape chosen at adoption (open question 4). Remove the
silent unconditional `false` presentation. Ensure a new package drafted from
the template either:

- inherits a value that matches the common R0–R2 case **and** still carries a
  comment requiring risk-class review, **or**
- inherits `false` only as a "must replace" placeholder that the planner is
  instructed to overwrite per AGENTS.md before human review of the plan PR.

Do not change any existing `specs/changes/VOC-*/change.yaml` unless adoption
explicitly added backfill under `VOC-068-DEP-02` (out of this task's default
scope).

Do not modify workflows or autonomy switches.

## Task ordering notes

- T00 and T01 are independently reviewable but intentionally small and
  coupled; one combined PR is acceptable and preferred for doc consistency.
- Neither task may be dispatched before this package is adopted.
- If adoption raises the package to R4 via DOC-15 inclusion, both tasks still
  proceed under that class with founder approval recorded against the exact
  revision — do not split DOC-15 into a separate unauthorized package to dodge
  the floor.
