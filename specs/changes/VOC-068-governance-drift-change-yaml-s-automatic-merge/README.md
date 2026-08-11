# VOC-068 — Align `automatic_merge_allowed` Drafting Guidance With Active-A-003

**Status: draft, not adopted.** Nothing in this package is implementation-authorized.
It is a draft response to
[issue #488](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/488),
prepared for founder/steward review at adoption time.

## Identity and lifecycle

- Package ID: VOC-068
- Title: Align change.yaml `automatic_merge_allowed` Drafting Guidance With
  Active-A-003 Risk Policy
- Canonical path:
  `specs/changes/VOC-068-governance-drift-change-yaml-s-automatic-merge`
- Lifecycle state: `draft` (not adopted, not authorized for implementation)
- Proposed risk: `R3` (draft proposal only — see `change.yaml`'s
  `planned_implementation_risk_floor`, not a determination; may become R4 if
  DOC-15 is in scope — open question 1)
- Owner: unassigned (see `change.yaml`'s `owners` block)
- Approval evidence: none yet — `approval_status: not-approved`,
  `implementation_authorized: false`
- Target branch: `develop`
- Linked GitHub issue:
  [#488](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/488)

## Why this exists

Active-A-003 policy in `docs/governance/change-risk-classification.md` is
explicit: only R4 requires founder approval. R0–R3 do not require standing
founder or technical-steward approval solely because of their risk class.

`karsift-ai-infra`'s `merge-gate.yml` implements that correctly for risk class,
but also gates on a second, independent signal: each package's
`change.yaml` `automatic_merge_allowed` field. When that field is `false`, the
gate requires founder `approved` regardless of risk — confirmed live on
[PR #480](https://github.com/KARSIFT/vocanova-platform-sandbox/pull/480) and
[PR #481](https://github.com/KARSIFT/vocanova-platform-sandbox/pull/481)
("gates pass for R2 but this package's own change.yaml sets
automatic_merge_allowed: false - requires founder approval").

That second signal was designed as a deliberate per-package **opt-out** (see
`merge-gate.yml` comments and DOC-15 §17.3). In practice it has become a silent
**opt-in default**:

| Evidence | Observation |
|---|---|
| Template | `specs/templates/change-package/change.yaml` sets `automatic_merge_allowed: false` with no risk-linked comment |
| Recent packages | VOC-051 (R3), VOC-052 (R3), VOC-053 (R3), VOC-063 (R2), VOC-014 (R1) all left `false` |
| Exception | VOC-012 (R1) deliberately set `true` "to prove the mechanism works" — cited in `merge-gate.yml`; not repeated as standing practice |
| Planner instructions | `AGENTS.md` has no rule connecting declared risk class to this field |

Net effect: the founder is asked to approve essentially every task PR, including
routine R1/R2 work, which contradicts active-A-003 and defeats risk-based
approval.

## What this package does

1. **Add planner guidance to `AGENTS.md`** (`VOC-068-T00`): connect declared
   package risk to a default `automatic_merge_allowed` value, and require a
   one-line justification in `change.yaml` (or adjacent comment) whenever a
   package deliberately sets `false` despite qualifying for R0–R2.
2. **Update the change-package template** (`VOC-068-T01`): replace the silent
   unconditional `false` with an explicit drafting instruction that forces an
   active, risk-linked choice rather than silent inheritance.
3. **Reconcile any other doc that would become false** (`VOC-068-T00` /
   conditional DOC-15 work per open question 1), per AGENTS.md's rule that a
   governance-field behavior change must update every doc that describes it.

## What this package deliberately does NOT do

- Not changing `merge-gate.yml`, `pipeline.yml`, `release.yml`, or any other
  workflow. The gate already implements the correct semantics; the drift is in
  how packages are drafted.
- Not weakening R4's hard founder block, EHR, independent verification, or
  CI requirements.
- Not authorizing production deployment, RL1/RL2 activation, or any new
  autonomy switch.
- Not silently backfilling already-adopted packages (open question 3).
- Does not adopt itself. `change.yaml` leaves every adoption/authorization
  field at its template default — including this package's own
  `automatic_merge_allowed: false` (ironic but correct for an unadopted draft).

## Open questions for the reviewing human

See `specification.md`. The most important:

1. **DOC-15 reconciliation / possible R4 raise** (`VOC-068-DEP-00`).
2. **Exact R3 drafting default** (`VOC-068-DEP-01`).
3. **Backfill of already-adopted packages** (`VOC-068-DEP-02`).

## Verification, approvals, release, and closure

See `test-plan.md`, `release-plan.md`, and `implementation-plan.md`. This package
carries no standing approval; adoption, implementation authorization, independent
verification, and any required human approval remain to be recorded against the
exact implemented revision, per AGENTS.md and CLAUDE.md.
