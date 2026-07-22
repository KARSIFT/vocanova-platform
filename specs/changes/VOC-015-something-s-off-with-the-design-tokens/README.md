# VOC-015 — Design Tokens: Brand Color Scale (primary / secondary)

**Draft package — not adopted, not approved, not implementation authority.**
Prepared by the planner role from GitHub issue #15 (after one clarifying
round-trip). A human must review and adopt it (and record an approved
requirement source) before any implementation.

## Identity and lifecycle

- Package ID: `VOC-015`
- Canonical path:
  `specs/changes/VOC-015-something-s-off-with-the-design-tokens/`
- Lifecycle state: `draft` (unadopted; see `change.yaml`)
- Proposed risk: R1 (draft proposal only — the authoritative floor is whatever
  `scripts/governance/classify-change-risk.sh` computes at implementation time;
  `packages/design-tokens/src/*` matches no R2/R3/R4 pattern today, so R1 is the
  expected path-detected floor, but a human's judgment governs the final class)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Authority issue: #15 (the originating report). The founder's comment on it
  (`2026-07-22T22:21:30Z`) specifies the change, but a founder-approved
  implementation-ready state must still be recorded at adoption — an issue alone
  is not implementation authority (`AGENTS.md`).
- Target branch: `develop`

## Objective and requirement source

Issue #15 was opened as a vague "something's off with the design tokens" report.
The planner's investigation (posted as a comment) found every existing token
value byte-for-byte matches its approved acceptance criteria, and that nothing
consumes the tokens yet — so the report could not be a token-*value* defect. The
founder clarified (comment, `2026-07-22T22:21:30Z`): the gap is a **missing**
scale — there are no semantic/brand color tokens beyond the `neutral` ramp.

This package therefore adds a typed **`brand`** color scale — `primary` and
`secondary`, each a 50→900 ramp mirroring the exact shape of the existing
`neutral` scale (VOC-010) — exported and re-exported the same way as its sibling
token files. It continues the design-tokens foundation from VOC-010 (spacing,
neutral color), VOC-011 (typography), VOC-012 (radius), VOC-013 (motion), and
VOC-014 (elevation).

Requirement source: GitHub issue #15, including the founder's clarifying comment.
This draft is **not** implementation authority on its own; a founder-approved,
implementation-ready state must be recorded before implementation.

## Scope, non-goals, risk, and protected areas

In scope: a single typed `brand` scale object in a new
`packages/design-tokens/src/brand.ts`, containing two sub-ramps (`primary`,
`secondary`), each with the same ten keys as `neutral`
(`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`), re-exported from
`packages/design-tokens/src/index.ts` alongside the existing `spacing`,
`neutral`, `fontSize`, `radius`, `duration`, `easing`, and `elevation` exports.

Non-goals: no component-level usage, no CSS-variable / Tailwind generation, no
dark-mode / semantic-alias tokens (e.g. `text`, `surface`, `danger`), no change
to the existing `neutral` ramp, no consumption changes in `apps/web`. This is a
value + export addition only, exactly as the founder requested ("No UI wiring
needed yet").

No protected areas touched. No production impact.

## Verification, approvals, release, and closure

Deterministic evidence (at implementation time): `pnpm run lint:packages`,
`pnpm run typecheck:packages`, `pnpm run build:packages`. Independent
verification is exact-SHA per `CLAUDE.md`, checking each of the twenty brand
values byte-for-byte and confirming the seven pre-existing exports are intact.
Because this is a draft, no approval, merge, or release authority is claimed
here; those gates remain closed in `change.yaml` and are a human's decision at
adoption.
