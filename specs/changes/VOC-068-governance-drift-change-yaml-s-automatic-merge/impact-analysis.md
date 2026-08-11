# VOC-068 — Impact Analysis

## Security and privacy

No new secret, credential, authentication, authorization, or personal-data
handling is introduced. The change is documentation and template guidance
about an already-existing merge-gate opt-out field.

Residual security consideration: incorrect guidance that told planners to set
`automatic_merge_allowed: true` for R4, or to skip independent verification,
would weaken controls. Mitigation: acceptance criteria and tests explicitly
forbid weakening R4, EHR, CI, or independent verification; independent review
must read the AGENTS.md diff for that failure mode.

## Data and migrations

None. No schema, seed, or production data change.

## Analytics and accessibility

None. No user-facing behavior, analytics, or UI change. Explicit
non-applicability: documentation/template-only package.

## Risks, dependencies, and evidence

- `VOC-068-R00`: **Over-correction — auto-merge where founder eyes were
  intentionally wanted.** Restoring `true` as the common default may cause
  some future packages that a human would have preferred to watch (despite
  R0–R2) to auto-merge unless the planner opts out with justification.
  Mitigation: keep the deliberate opt-out path; require stated reasoning for
  R0–R2 `false`; R3 remains case-by-case per `VOC-068-DEP-01`; founder
  `approved` comment remains valid at any risk class as an override.
- `VOC-068-R01`: **Doc drift / incomplete reconciliation.** Updating AGENTS.md
  without DOC-15 (or vice versa) could leave two docs describing different
  drafting expectations. Mitigation: `VOC-068-AC-01` / `VOC-068-DEP-00` force
  an explicit adoption choice and evidence.
- `VOC-068-R02`: **Template still silently wrong.** A weak comment that
  planners ignore would recreate the same drift. Mitigation: `VOC-068-AC-02`
  requires the template shape to force an active choice; independent review
  must judge whether a new planner could still miss it.
- `VOC-068-R03`: **Scope creep into workflow changes.** An implementer might
  "helpfully" edit merge-gate defaults. Mitigation: `VOC-068-AC-03` and
  non-goals forbid workflow/autonomy edits; diff review is the control.
- `VOC-068-DEP-00`: Unresolved — DOC-15 reconciliation / possible R4 raise.
- `VOC-068-DEP-01`: Unresolved — exact R3 drafting default preference.
- `VOC-068-DEP-02`: Unresolved — backfill of already-adopted packages
  (default: forward-only).
- `VOC-068-EV-00`: AGENTS.md (and conditional DOC-15 / change-risk-classification)
  diff plus reconciliation evidence for `VOC-068-DEP-00`.
- `VOC-068-EV-01`: Template `change.yaml` / `README.md` diff showing the
  active-choice shape.
