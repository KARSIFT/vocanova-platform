# VOC-068 — Acceptance Criteria

## VOC-068-AC-00 — AGENTS.md states a risk-linked `automatic_merge_allowed` drafting rule

- Requirement source: issue #488; `specification.md` scope item 1; `VOC-068-D00`
- Tasks: `VOC-068-T00`
- Tests: `VOC-068-TEST-00`
- Evidence: `VOC-068-EV-00`
- Result: pending

`AGENTS.md` contains an explicit, reviewable rule that:

1. Tells the planner (and any human drafting a package) how to set
   `automatic_merge_allowed` relative to the package's declared risk class,
   matching the decision recorded at adoption for `VOC-068-DEP-01`.
2. Requires a stated reason when an R0–R2 package sets
   `automatic_merge_allowed: false`.
3. States that R4 packages set `false`, and that the field is an opt-out from
   already-authorized auto-merge — not a replacement for risk classification,
   CI, or independent verification.
4. Does not weaken active-A-003, R4 founder authority, EHR, or merge-gate's
   R4 hard block.

## VOC-068-AC-01 — Doc reconciliation for the field is satisfied

- Requirement source: AGENTS.md doc-reconciliation rule; `VOC-068-DEP-00`
- Tasks: `VOC-068-T00`
- Tests: `VOC-068-TEST-01`
- Evidence: `VOC-068-EV-00`
- Result: pending

Either:

- DOC-15 is updated in the same PR with a minimal planner-drafting note that
  matches the new AGENTS.md rule (adoption chose option b), **or**
- T00 evidence records why DOC-15 already accurately describes the opt-out
  semantics and needs no edit (adoption chose option a), with a cite to the
  specific DOC-15 §17.2/§17.3 paragraphs.

No doc that still claims the opposite of the new drafting rule may remain.

## VOC-068-AC-02 — Change-package template forces an active justified choice

- Requirement source: issue #488; `specification.md` scope item 2;
  open question 4
- Tasks: `VOC-068-T01`
- Tests: `VOC-068-TEST-02`
- Evidence: `VOC-068-EV-01`
- Result: pending

`specs/templates/change-package/change.yaml` no longer presents
`automatic_merge_allowed: false` as a silent, unexamined default. It matches
the template shape chosen at adoption (open question 4): either literal
`false` with a mandatory REPLACE/risk-rule comment, or literal `true` with a
mandatory opt-out comment. The template `README.md` briefly points at the
AGENTS.md rule. A new planner reading only the template cannot miss that the
value must be chosen against risk class.

## VOC-068-AC-03 — Guidance does not alter merge-gate or autonomy switches

- Requirement source: `specification.md` non-goals
- Tasks: `VOC-068-T00`, `VOC-068-T01`
- Tests: `VOC-068-TEST-03`
- Evidence: `VOC-068-EV-00`, `VOC-068-EV-01`
- Result: pending

The implementation PR(s) do not modify `.github/workflows/`,
`karsift-ai-infra/` workflow copies, `pipeline.yml`'s `auto_merge_enabled`,
`docs/governance/a003-transition-state.yaml`, or
`.github/approved-policy/protected-paths.yaml` merge/release fields. Merge
behavior change for future packages comes only from correctly drafted
`change.yaml` values under the existing gate.
