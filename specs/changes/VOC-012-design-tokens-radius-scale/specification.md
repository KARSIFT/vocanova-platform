# VOC-012 — Design Tokens: Border Radius Scale: Specification

## Objective and requirement source

Authorized by founder-approved issue #6. Adds a typed border-radius scale to
`packages/design-tokens`, continuing VOC-010/VOC-011's foundation.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/radius.ts` — a typed `radius` scale as a
  readonly object, exact keys and values specified in
  `acceptance-criteria.md` (`VOC-012-AC-00`).
- `packages/design-tokens/src/index.ts` — add a re-export of `radius`
  alongside the existing `spacing`, `neutral`, and `fontSize` exports (do
  not remove or alter those).

Explicitly excluded: component-level consumption, CSS custom property or
Tailwind config generation, any change in `apps/web`.

## Risk and protected areas

Risk: R1, same reasoning as VOC-010/VOC-011 (`packages/design-tokens/src/*`
falls to the classifier's R1 default). No protected areas touched.

## Decisions, contradictions, security, and privacy

`VOC-012-D00`: The scale is six fixed, literal pixel values (not computed
from a ratio) — a `0px` step and five deliberately non-uniform steps chosen
by design rather than a formula. Each value is a string literal ending in
`px`, taken verbatim from the table in `acceptance-criteria.md`
(`VOC-012-AC-00`) — there is no rounding or computation step, so there is no
ambiguity about the expected values.

No security, secrets, or personal-data impact.

## Data, migrations, analytics, and accessibility

None. No data storage, no migration, no analytics event, no rendered UI is
introduced by this package.
