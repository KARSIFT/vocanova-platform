# VOC-011 — Design Tokens: Typography Scale: Specification

## Objective and requirement source

Authorized by founder-approved issue #4. Adds a typed typography size scale
to `packages/design-tokens`, continuing VOC-010's foundation.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/typography.ts` — a typed `fontSize` scale as a
  readonly object, exact keys and values specified in
  `acceptance-criteria.md` (`VOC-011-AC-00`).
- `packages/design-tokens/src/index.ts` — add a re-export of `fontSize`
  alongside the existing `spacing` and `neutral` exports (do not remove or
  alter those).

Explicitly excluded: line-height tokens, font-weight tokens, font-family
tokens, any consumption change in `apps/web`, any CSS/Tailwind generation.

## Risk and protected areas

Risk: R1, same reasoning as VOC-010 (`packages/design-tokens/src/*` falls to
the classifier's R1 default). No protected areas touched.

## Decisions, contradictions, security, and privacy

`VOC-011-D00`: The scale is a geometric progression, ratio `1.25` (a "major
third" modular scale), base value `1.000rem` at the `base` step. Values are
computed as `base × ratio^n` where `n` is the step's signed distance from
`base` in the ordered key list, then rounded to exactly 3 decimal places
using **round-half-up** (not banker's/round-half-to-even — the two disagree
exactly at the `xl` step, since `1.25^2 = 1.5625` sits precisely on a
rounding boundary; round-half-up is authoritative for this package and is
the only convention `acceptance-criteria.md`'s values were computed with).

No security, secrets, or personal-data impact.

## Data, migrations, analytics, and accessibility

None. No data storage, no migration, no analytics event, no rendered UI is
introduced by this package.
