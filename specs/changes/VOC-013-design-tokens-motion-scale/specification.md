# VOC-013 — Design Tokens: Motion Scale: Specification

## Objective and requirement source

Authorized by founder-approved issue #7. Adds typed `duration` and `easing`
motion tokens to `packages/design-tokens`, continuing the VOC-010/011/012
foundation.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/duration.ts` — a typed `duration` scale as a
  readonly object, exact keys and values specified in
  `acceptance-criteria.md` (`VOC-013-AC-00`).
- `packages/design-tokens/src/easing.ts` — a typed `easing` scale as a
  readonly object, exact keys and values specified in
  `acceptance-criteria.md` (`VOC-013-AC-01`).
- `packages/design-tokens/src/index.ts` — add re-exports of both `duration`
  and `easing` alongside the existing `spacing`, `neutral`, `fontSize`, and
  `radius` exports (do not remove or alter those).

Explicitly excluded: animation implementation, component consumption, any
change in `apps/web`.

## Risk and protected areas

Risk: R1, same reasoning as VOC-010/011/012 (`packages/design-tokens/src/*`
falls to the classifier's R1 default). No protected areas touched.

## Decisions, contradictions, security, and privacy

`VOC-013-D00`: Both scales are fixed literal values (not computed), taken
verbatim from the tables in `acceptance-criteria.md` — there is no
rounding or computation step.

`VOC-013-D01`: This package's task list (`tasks.md`) is intentionally split
into two tasks rather than one, unlike VOC-011/VOC-012 — see this
package's `README.md` "Process note" for why. This is a deliberate
authoring decision for this package specifically, not a general pattern to
repeat; VOC-010's precedent (consolidate tightly-coupled multi-file changes
into one task) remains the default going forward for every other package.

No security, secrets, or personal-data impact.

## Data, migrations, analytics, and accessibility

None. No data storage, no migration, no analytics event, no rendered UI is
introduced by this package.
