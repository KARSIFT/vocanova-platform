# VOC-068 — Implementation Plan

## Preconditions and protected areas

Do not begin any task until this package is adopted and implementation is
authorized. Adoption must record decisions for `VOC-068-DEP-00`,
`VOC-068-DEP-01`, and open question 4 (template shape) so implementers are not
guessing. `VOC-068-DEP-02` defaults to forward-only unless adoption explicitly
adds backfill.

Protected areas in scope:

- `AGENTS.md` — R3 path floor (`VOC-068-T00`).
- `specs/templates/change-package/` — R3 path floor (`VOC-068-T01`).
- Conditionally `docs/operations/15-ai-native-product-and-engineering-operating-model.md`
  — R4 path floor if `VOC-068-DEP-00` option b is chosen.
- Conditionally `docs/governance/change-risk-classification.md` — R3 path floor
  for an optional one-sentence cross-reference.

Explicitly out of scope: `.github/workflows/`, `karsift-ai-infra/` (beyond
read-only reference), `pipeline.yml`, `apps/`, `packages/`, migrations,
production configuration, autonomy/authorization markers in
`a003-transition-state.yaml` / `protected-paths.yaml`.

## File reconciliation and implementation sequence

1. **Confirm adoption decisions** recorded in `requirement_approval_status` /
   `blocking_reasons` (or the adoption PR description): DEP-00, DEP-01,
   template shape, backfill yes/no.
2. **`VOC-068-T00`** — Write the AGENTS.md drafting rule; apply DOC-15 option
   if required; optional change-risk-classification cross-reference.
3. **`VOC-068-T01`** — Update template `change.yaml` + template `README.md` to
   match the chosen shape and point at the AGENTS.md rule.
4. Prefer one PR containing T00+T01 when both remain docs/template-only.
5. Run governance validation commands below before claiming complete.

Preserve compatible existing wording in AGENTS.md's "Safety" / automatic-merge
paragraphs; extend them rather than rewriting the 2026-08-08 release-authority
delegation record.

## Validation and independent verification

Deterministic commands before claiming any task complete:

```bash
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

Confirm `classify-change-risk.sh`'s detected floor is not higher than the
package's declared class (or raise the declaration if DOC-15 inclusion makes
it R4).

Independent verification (per `CLAUDE.md`) must confirm against the exact
implemented revision:

- AGENTS.md rule matches adoption decisions and does not weaken R4/EHR/CI/
  independent verification.
- Template forces an active justified choice; silent unconditional `false` is
  gone.
- Doc reconciliation (`VOC-068-AC-01`) is satisfied with evidence.
- No workflow or autonomy-switch file changed.
- No unrelated change introduced.

## Deployment and rollback

No application deployment effect. Rollback is a documentation revert.

Rollback trigger: guidance is found to instruct planners to auto-merge R4, to
skip verification, or to contradict DOC-15 / active-A-003.

Rollback mechanism: revert the AGENTS.md and template commits (and DOC-15 if
touched). Last-known-good: revisions immediately preceding this package's
implementation merge(s).

Owner: implementer of the affected task.
