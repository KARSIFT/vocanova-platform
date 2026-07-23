# VOC-016 — Design Tokens: Semantic Feedback Color Scale (success / warning / error)

**Draft package — not adopted, not approved, not implementation authority.**
Prepared by the planner role from the approved design document
`docs/design/03-ui-ux-design.md` (DOC-03). A human must review and adopt it (and
record a founder-approved, implementation-ready requirement state) before any
implementation.

## Identity and lifecycle

- Package ID: `VOC-016`
- Canonical path:
  `specs/changes/VOC-016-add-semantic-feedback-color-tokens-success-warning/`
- Lifecycle state: `draft` (unadopted; every approval/authorization field in
  `change.yaml` is at its unadopted default — see `change.yaml`)
- Proposed risk: R1 (draft proposal only — the authoritative floor is whatever
  `scripts/governance/classify-change-risk.sh` computes at implementation time;
  `packages/design-tokens/src/*` matches no R2/R3/R4 path pattern, so R1 is the
  expected path-detected floor, but a human's judgment governs the final class)
- Owner (decision): founder
- Requirement source: `docs/design/03-ui-ux-design.md` (DOC-03, `status:
  approved`), specifically §10 (Accessibility) and §11 (Visual design direction).
  DOC-03 is an approved design document, but it is not by itself a
  founder-approved, implementation-ready change authority — that state must be
  recorded at adoption (`AGENTS.md`).
- Target branch: `develop`

## Objective and requirement source

`docs/design/03-ui-ux-design.md` calls for feedback surfaces (review
correctness, sentence-practice AI results, mission/status messaging) that are
accessible and supportively framed. Two clauses drive this package:

- §10 (Accessibility): "sufficient color contrast, and no information conveyed by
  color alone (e.g. correct/incorrect review feedback must also use an icon or
  text label, not just a color change)." Target: **WCAG 2.2 AA**.
- §11 (Visual design direction): "Avoid visual patterns that read as 'grading'
  (red X marks, harsh error colors) in favor of supportive framing."

Today `packages/design-tokens` has only a `neutral` ramp (VOC-010) and a `brand`
scale (`primary`/`secondary`, VOC-015). There is **no semantic feedback color
scale** for success / warning / error states, so any consuming component would
have to hard-code feedback hues — with no shared, contrast-vetted, tone-aligned
source of truth.

This package adds a typed **`feedback`** color scale — `success`, `warning`, and
`error`, each a 50→900 ramp mirroring the exact shape of the existing `neutral`
and `brand` scales — exported and re-exported the same way as its sibling token
files. The proposed hues are chosen to satisfy §11's "avoid harsh error red"
guidance (a softer rose family for `error`, not a fire-engine red) while still
offering steps dark enough to meet §10's WCAG 2.2 AA text-contrast requirement
on a light background. It continues the design-tokens foundation from VOC-010
(spacing, neutral), VOC-011 (typography), VOC-012 (radius), VOC-013 (motion),
VOC-014 (elevation), and VOC-015 (brand).

This draft is **not** implementation authority on its own; a founder-approved,
implementation-ready state must be recorded before implementation.

## Scope, non-goals, risk, and protected areas

In scope: a single typed `feedback` scale object in a new
`packages/design-tokens/src/feedback.ts`, containing three sub-ramps (`success`,
`warning`, `error`), each with the same ten keys as `neutral`
(`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`), re-exported from
`packages/design-tokens/src/index.ts` alongside the existing `spacing`,
`neutral`, `brand`, `fontSize`, `radius`, `duration`, `easing`, and `elevation`
exports.

Non-goals: no component-level usage, no CSS-variable / Tailwind generation, no
dark-mode variants, no icon/text-label components (the §10 "not by color alone"
obligation lives in the *consuming* component, which a token file cannot
enforce — see `impact-analysis.md`), no change to the existing `neutral`, `brand`,
or any other ramp, and no consumption changes in `apps/web`. This is a value +
export addition only.

No protected areas touched. No production impact.

## Verification, approvals, release, and closure

Deterministic evidence (at implementation time): `pnpm run lint:packages`,
`pnpm run typecheck:packages`, `pnpm run build:packages`, plus a deterministic
WCAG-contrast check over the proposed values (see `test-plan.md`,
`VOC-016-TEST-01`). Independent verification is exact-SHA per `CLAUDE.md`,
checking each of the thirty feedback values byte-for-byte, confirming the
declared contrast property holds, and confirming the eight pre-existing exports
are intact. Because this is a draft, no approval, merge, or release authority is
claimed here; those gates remain closed in `change.yaml` and are a human's
decision at adoption.
