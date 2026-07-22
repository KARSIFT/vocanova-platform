# VOC-015 — Design Tokens: Brand Color Scale (primary / secondary): Specification

## Objective and requirement source

Adds a typed `brand` color scale — `primary` and `secondary` sub-ramps, each a
50→900 ramp mirroring the existing `neutral` scale — to
`packages/design-tokens`, continuing the VOC-010→VOC-014 foundation. The
requirement source is GitHub issue #15 and the founder's clarifying comment on it
(`2026-07-22T22:21:30Z`), which scoped the vague original report down to a
specific, concrete request: "add a `brand` color scale (primary/secondary, each
with the same 50→900 shape as `neutral`)… exported from `index.ts`… No UI wiring
needed yet, just the token values and export, same pattern as the prior approved
scales." A founder-approved, implementation-ready state must be recorded before
implementation (`AGENTS.md`). This document is a draft, not an approved
specification.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/brand.ts` — a typed `brand` scale as a readonly
  object with two keys, `primary` and `secondary`, each itself a readonly object
  of the exact ten keys used by `neutral`
  (`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`) → hex string
  values, with the exact values specified in `acceptance-criteria.md`
  (`VOC-015-AC-00`).
- `packages/design-tokens/src/index.ts` — add a re-export of `brand` alongside
  the existing `spacing`, `neutral`, `fontSize`, `radius`, `duration`, `easing`,
  and `elevation` exports (do not remove, rename, or alter those).

Explicitly excluded: component-level consumption, CSS custom property / Tailwind
config generation, dark-mode variants, semantic alias tokens (e.g. `text`,
`surface`, `success`, `danger`), any modification to the existing `neutral`
ramp, any change in `apps/web`.

## Risk and protected areas

Proposed risk: R1, same reasoning as VOC-010→VOC-014
(`packages/design-tokens/src/*` falls to the classifier's R1 default). This is a
draft proposal — `scripts/governance/classify-change-risk.sh` and a human's
judgment govern the actual class at implementation time. No protected areas
touched.

## Decisions, contradictions, security, and privacy

`VOC-015-D00`: Structure. `brand` is a nested readonly object:
`Readonly<Record<string, Readonly<Record<string, string>>>>`, with top-level
keys `primary` and `secondary`, each mapping to a ten-key 50→900 hex ramp with
the **identical key set and ordering** as `neutral` (`colors.ts`). This is the
literal reading of "the same 50→900 shape as `neutral`": one grouped `brand`
export containing two `neutral`-shaped ramps, not two separate top-level
exports. Each ramp is monotonic light→dark from `50` to `900`, matching the
monotonicity constraint VOC-010 placed on `neutral`.

`VOC-015-D01`: Proposed hue values (OPEN DECISION FOR THE HUMAN ADOPTER). Brand
hues are a genuine design decision the planner cannot settle authoritatively.
This package proposes concrete, self-consistent, monotonic ramps so the request
is actionable, but the **exact hex values are a proposal to confirm or replace
at adoption**, analogous to VOC-014's `elevation`-vs-`shadow` naming flag. The
proposal reuses two well-known, professionally balanced ten-step families so the
values are unambiguous and byte-for-byte testable:
- `primary` → a blue family (`#eff6ff` … `#1e3a8a`).
- `secondary` → a violet family (`#f5f3ff` … `#4c1d95`).
The exact twenty values are fixed in `acceptance-criteria.md` (`VOC-015-AC-00`).
If the founder substitutes different hues at adoption, only the values in that
table change; the structure, keys, export wiring, tasks, and tests are
unaffected. `VOC-015-DEP-04` tracks this open confirmation.

`VOC-015-D02`: Naming. The scale is named `brand` (file `brand.ts`, export
`brand`) per the founder's exact wording. Sibling token files each own one
primitive (`spacing`, `neutral`, `fontSize`, `radius`, `duration`, `easing`,
`elevation`); `brand` follows that one-file-one-scale shape, and its sub-ramps
`primary`/`secondary` are semantic roles rather than additional primitives.

`VOC-015-D03`: Single task, per the VOC-010/011/012/014 precedent — the new
`brand.ts` file and its `index.ts` wiring are one tightly-coupled change reviewed
against the whole package's acceptance criteria, so they must not be split across
separate per-task PRs.

No security, secrets, or personal-data impact.

## Data, migrations, analytics, and accessibility

None. No data storage, no migration, no analytics event, and no rendered UI is
introduced by this package. Brand color values affect visual presentation only
once consumed; nothing consumes them here. (Note for future consumers, not this
package: once brand colors are applied to text/background pairs, WCAG contrast
becomes a real accessibility constraint — but that is out of scope until the
tokens are actually consumed, and is called out in `impact-analysis.md`.)
