# VOC-010 — Design Tokens Foundation: Specification

## Objective and requirement source

Authorized by founder-approved issue #1. `packages/design-tokens/src/index.ts`
currently exports nothing (`export {};`). This package defines a first, minimal
set of design tokens: a spacing scale and a neutral (grayscale) color palette,
as typed TypeScript values, exported from that package's public entry point.

## Scope and non-goals

In scope:
- `packages/design-tokens/src/spacing.ts` — a typed spacing scale as a readonly
  object, base unit 4px, keys `none` through `2xl` (see acceptance criteria for
  exact steps).
- `packages/design-tokens/src/colors.ts` — a typed neutral (grayscale) color
  palette as a readonly object, 10 steps (`50` through `900`), hex values.
- `packages/design-tokens/src/index.ts` — export both modules.

Explicitly excluded:
- No brand or product-specific color palette (this is neutral/grayscale only).
- No consumption changes anywhere in `apps/web` or elsewhere — this package only
  adds exports; nothing imports them yet.
- No CSS custom properties, Tailwind config, or build-time token transformation.
- No new test-runner wiring into the root `package.json` `test` script — this
  repo currently has no per-`packages/*` test harness, and adding one is out of
  scope for a tokens-only change.

## Risk and protected areas

Risk: R1, per `scripts/governance/classify-change-risk.sh`'s path classification
(source files under `packages/design-tokens/src/*` match no R2/R3/R4 pattern and
fall to the R1 default). No protected areas (`.github/workflows/`,
`docs/governance/`, `AGENTS.md`, `CLAUDE.md`, CODEOWNERS) are touched.

## Decisions, contradictions, security, and privacy

`VOC-010-D00`: Define the initial token set as plain, readonly, dependency-free
TypeScript objects (no runtime library, no CSS-in-JS dependency) — the simplest
form that satisfies "typed and exported" without introducing a new dependency
for a foundational package other code will build on.

No security, secrets, or personal-data impact — these are static, public,
non-sensitive numeric/hex values.

## Data, migrations, analytics, and accessibility

None. No data storage, no migration, no analytics event, no user-facing surface
is introduced or changed by this package.
