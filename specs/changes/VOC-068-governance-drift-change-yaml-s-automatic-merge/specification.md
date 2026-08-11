# VOC-068 — Align `automatic_merge_allowed` Drafting Guidance With Active-A-003: Specification

## Objective and requirement source

Restore the intended relationship between package risk class and
`change.yaml`'s `automatic_merge_allowed` field so that routine R0–R3 task PRs
stop requiring a founder `approved` comment solely because the planner silently
inherited the template's `false` default.

Requirement source:
[GitHub issue #488](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/488).

Canonical policy already in force:

- `docs/governance/change-risk-classification.md` (active-A-003): only R4
  requires founder approval; R0–R3 do not require standing founder or
  technical-steward approval solely because of risk class.
- DOC-15 §17.2/§17.3: R0–R3 may auto-merge into `develop` when CI is green,
  independent review passed, the project switch is on, and the package has not
  set `automatic_merge_allowed: false` (described as a deliberate opt-out).
- `karsift-ai-infra` `merge-gate.yml`: R4 (or unparseable risk) always requires
  founder approval; separately, `automatic_merge_allowed: false` also requires
  founder approval even when risk would otherwise allow auto-merge. When the
  field is absent, the gate defaults to allowing merge (`true`).

This package does not invent a new merge policy. It closes the drafting drift
that makes every package look opted-out.

## Confirmed findings (from issue #488, re-checked during drafting)

- Template `specs/templates/change-package/change.yaml` line
  `automatic_merge_allowed: false` is unconditional — no comment tying it to
  risk class or requiring justification.
- Live merge-gate messages on PR #480 / #481 match the workflow's
  `automatic_merge_allowed: false` branch text exactly.
- Recent packages leave the field `false` across R1–R3 (VOC-014, VOC-051,
  VOC-052, VOC-053, VOC-063). Older packages often set `true` (VOC-012 proof
  case; VOC-033 through VOC-046 series commonly `true`).
- `AGENTS.md` mentions automatic merge into `develop` as implemented and proven
  (VOC-012 / merge-gate) but never instructs the planner how to set the
  per-package field relative to risk.
- `plan.yml` forces only `status: draft` and nested
  `implementation.authorized: false` after the planner runs — it does **not**
  force `automatic_merge_allowed: false`. A planner may therefore set the field
  to the risk-appropriate value at draft time without fighting the plan
  workflow. The planner role prompt's "leave adoption fields at template
  default" rule is what currently freezes it at `false` for every new draft,
  compounding the template's silent default.

## Scope and non-goals

In scope:

- `VOC-068-T00`: Add an explicit `AGENTS.md` subsection (under Change workflow
  or a clearly adjacent heading) that states the drafting rule for
  `automatic_merge_allowed`, including:
  - R0–R2 → draft with `automatic_merge_allowed: true` unless the package
    records a specific, package-local reason to require founder eyes.
  - R3 → decided case-by-case per `VOC-068-DEP-01` (adoption settles the exact
    default preference); either way, the choice must be stated with reasoning
    in `change.yaml` (comment or adjacent prose field), same spirit as
    `planned_implementation_risk_floor`.
  - R4 → `automatic_merge_allowed: false` (redundant with the gate's R4 hard
    block; still set explicitly so the package record is self-describing).
  - Deliberate `false` on an R0–R2 package must state why in the field's
    comment or a one-line adjacent note.
  - Remind that this field is an opt-out from already-authorized auto-merge,
    not a substitute for risk classification, independent verification, or
    CI.
  - If adoption settles `VOC-068-DEP-00` as "yes, update DOC-15", include the
    minimal DOC-15 wording change in the same PR (raises path floor to R4).
- `VOC-068-T01`: Update `specs/templates/change-package/change.yaml` (and a
  short note in that template's `README.md`) so the template no longer silently
  trains planners to leave an unconditional `false`. Concrete template shape
  (adoption settles the literal default value):
  - Keep a literal `automatic_merge_allowed: false` **only if** accompanied by
    a mandatory comment block that says: "REPLACE per AGENTS.md risk-class
    rule before the plan PR is reviewed — do not leave this as an unexamined
    default." **or**
  - Change the literal default to `true` with a comment that R4 packages and
    deliberate opt-outs must set `false` with stated reason.
  - Either shape is acceptable if it forces an active justified choice; the
    adopting human picks one via open question 4.
- Optional, same tasks if low-cost: a one-sentence cross-reference in
  `docs/governance/change-risk-classification.md` clarifying that
  `automatic_merge_allowed` is independent of the R0–R4 table (path floor R3,
  already in the proposed class).

Non-goals / explicitly excluded:

- Not editing `karsift-ai-infra` workflows (`merge-gate.yml`, `plan.yml`,
  `implement.yml`, etc.). Gate semantics are already correct.
- Not changing this repository's `pipeline.yml` `auto_merge_enabled` switch.
- Not changing R4 founder authority, EHR, independent verification, or
  required CI.
- Not changing release/deploy autonomy (already separately authorized
  2026-08-08).
- Not rewriting historical package `change.yaml` files unless adoption
  explicitly includes backfill (`VOC-068-DEP-02`).
- Not inventing a second schema field or renaming `automatic_merge_allowed`.

## Risk and protected areas

Builder assessment / proposed class: **R3**.

Path floors (from `.github/approved-policy/protected-paths.yaml`):

| Path | Floor |
|---|---|
| `AGENTS.md` | R3 |
| `specs/templates/` | R3 |
| `docs/governance/` (optional cross-ref) | R3 |
| `docs/operations/15-ai-native-product-and-engineering-operating-model.md` | R4 (only if `VOC-068-DEP-00` includes it) |

No application code, migrations, secrets, or production infrastructure are
touched. EHR is not triggered. Under active A-003, routine R3 does not by
itself require standing technical-steward or founder approval; the independent
verifier must still confirm the guidance does not weaken merge-gate behavior
or invent a self-serving approval shortcut.

If DOC-15 is included, the package's effective class becomes **R4** and founder
approval is required for that consequence — see open question 1.

## Decisions, contradictions, security, and privacy

`VOC-068-D00` (recorded for traceability; formal decision numbering applies
after adoption): The template's unconditional `automatic_merge_allowed: false`,
combined with absent planner guidance, is governance drift — not intentional
policy. Practice must be restored to DOC-15 §17.3's opt-out model and
active-A-003's R0–R3 posture: planners set `true` for routine R0–R2 (and for
R3 when the package does not specifically warrant founder eyes), and set
`false` only with a stated reason or for R4.

No contradiction with merge-gate semantics: the gate already treats the field
as an opt-out. No contradiction with DOC-15's description of the field. The
only contradiction is between those documents' intent and current drafting
practice (template + AGENTS.md silence).

Open questions for the reviewing human:

1. **`VOC-068-DEP-00` — DOC-15 reconciliation.** AGENTS.md requires that a
   change to governance-field behavior update every doc that describes that
   behavior. DOC-15 already describes the *correct* opt-out semantics and does
   not claim the template default is `false`. Options:
   - (a) Do **not** edit DOC-15; AGENTS.md + template are sufficient because
     DOC-15 is already accurate — record that finding in T00 evidence.
   - (b) Add a short planner-drafting note to DOC-15 §17.3 in the same PR
     (raises this package to R4).
   Adoption must pick (a) or (b).
2. **`VOC-068-DEP-01` — R3 default preference.** Issue #488 suggests
   case-by-case. Prefer:
   - (a) R3 defaults to `true` under active A-003 (routine R3 needs no standing
     founder approval), with justified `false` when the package specifically
     warrants founder eyes (auth, secrets, production infra, etc.).
   - (b) R3 has no preferred default; planner must always write an explicit
     justified true/false with no implied lean.
3. **`VOC-068-DEP-02` — Backfill.** Include a task to flip
   `automatic_merge_allowed` on named already-adopted R0–R3 packages still at
   `false`, or leave historical packages unchanged and apply the rule only
   going forward? This draft assumes **forward-only** unless adoption adds
   backfill.
4. **Template literal default.** Keep literal `false` + mandatory "REPLACE"
   comment, or change literal to `true` + mandatory opt-out comment? Either
   forces an active choice; pick one at adoption so T01 is unambiguous.

No new secret, credential, or personal-data handling.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** None.
- **Analytics:** None.
- **Accessibility:** None. Documentation/template-only change.
