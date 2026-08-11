# VOC-068 — Test Plan

## VOC-068-TEST-00 — AGENTS.md drafting rule is complete and non-weakening

- Covers: `VOC-068-AC-00`
- Preconditions: `VOC-068-T00` diff available; adoption decisions for
  `VOC-068-DEP-01` recorded.
- Procedure: Read the new AGENTS.md section. Confirm it states risk-linked
  defaults for R0–R2, R3 (per adoption), and R4; requires justification for
  deliberate R0–R2 opt-outs; and explicitly preserves R4 founder authority,
  EHR, CI, and independent verification. Confirm it does not claim that
  setting `automatic_merge_allowed: true` bypasses those controls.
- Expected result: Rule is specific, risk-linked, and non-weakening.
- Evidence: `VOC-068-EV-00`

## VOC-068-TEST-01 — Doc reconciliation satisfied

- Covers: `VOC-068-AC-01`
- Preconditions: Adoption chose `VOC-068-DEP-00` option a or b.
- Procedure:
  - If option b: diff includes DOC-15 §17.x wording consistent with AGENTS.md;
    path risk declaration is at least R4.
  - If option a: evidence cites the existing DOC-15 §17.2/§17.3 paragraphs that
    already describe the opt-out model and explains why no edit was required.
  - Grep docs touched by the PR for any new sentence claiming founder approval
    is required for all risk classes via this field by default.
- Expected result: No remaining contradictory description of the field's
  drafting expectation in docs this package touched; reconciliation choice
  evidenced.
- Evidence: `VOC-068-EV-00`

## VOC-068-TEST-02 — Template forces an active justified choice

- Covers: `VOC-068-AC-02`
- Preconditions: `VOC-068-T01` diff available; adoption chose template shape
  (open question 4).
- Procedure: Read `specs/templates/change-package/change.yaml` and `README.md`.
  Confirm the silent unconditional `false` presentation is gone and the chosen
  shape is present (REPLACE comment with risk-rule pointer, or literal `true`
  with opt-out comment). Confirm README points at AGENTS.md.
- Expected result: A new planner cannot treat the template value as an
  unexamined safe default.
- Evidence: `VOC-068-EV-01`

## VOC-068-TEST-03 — No workflow or autonomy-switch drift in the PR

- Covers: `VOC-068-AC-03`
- Preconditions: Full PR diff available.
- Procedure: Inspect the PR file list. Assert absence of changes under
  `.github/workflows/`, `pipeline.yml` (if present at repo root as a caller
  config — do not change `auto_merge_enabled`), `docs/governance/a003-transition-state.yaml`
  merge/release fields, and `.github/approved-policy/protected-paths.yaml`
  merge/release fields. Run:

  ```bash
  bash scripts/governance/validate-governance.sh
  bash scripts/governance/classify-change-risk.sh
  git diff --check
  ```

- Expected result: Validation passes; declared risk meets or exceeds detected
  floor; no forbidden files modified.
- Evidence: `VOC-068-EV-00`, `VOC-068-EV-01`

## Rollback coverage

Rolling back means reverting the documentation/template commits. Validation:
re-run `validate-governance.sh` and `git diff --check` on the reverted tree;
confirm AGENTS.md and the template return to their pre-VOC-068 text.

No data rollback is required.

## Constraints

No test in this plan uses secrets or production data. No live merge-gate
experiment is required for closure of T00/T01; behavioral confirmation that
future packages stop forcing founder approval is an observational consequence
after subsequent packages are drafted under the new rule, not a gate inside
this package.
