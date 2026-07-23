# VOC-016 — Acceptance Criteria

Criteria are observable and bidirectionally traceable to decisions
`VOC-016-D00`..`D04`, tasks `VOC-016-T00`..`T02`, tests `VOC-016-TEST-00`..`04`,
and evidence `VOC-016-EV-00`..`04`. "Emitted custom property" means the property
appears in the CSS Tailwind compiles for `apps/web` (i.e. resolvable as
`var(--…)` on `:root` in the built output).

## VOC-016-AC-00 — `@vocanova/design-tokens` is importable and depended on

- Requirement source: `VOC-016-D00`
- Tasks: `VOC-016-T00`
- Tests: `VOC-016-TEST-00`
- Evidence: `VOC-016-EV-00`
- Result: pending

`packages/design-tokens/package.json` declares an entry point (`main` +
`types`, and an `exports` map) resolving `@vocanova/design-tokens` to the built
`dist/index.js` / `dist/index.d.ts`. `apps/web/package.json` declares
`@vocanova/design-tokens` (a `workspace:*` dependency). A bare-specifier import
`import { spacing } from "@vocanova/design-tokens";` type-checks and resolves at
build/test time. No token *value* under `packages/design-tokens/src/*` is changed.

## VOC-016-AC-01 — All eight scales are emitted as Tailwind v4 @theme custom properties

- Requirement source: `VOC-016-D01`
- Tasks: `VOC-016-T01`
- Tests: `VOC-016-TEST-01`, `VOC-016-TEST-02`
- Evidence: `VOC-016-EV-01`
- Result: pending

`apps/web/src/app/globals.css` (directly or via an `@import`ed partial it pulls
in) causes Tailwind to emit a custom property for **every key of every scale**,
mapped per `VOC-016-D01`:

- `spacing` → `--spacing-{none,xs,sm,md,lg,xl,2xl}`
- `neutral` → `--color-neutral-{50,100,200,300,400,500,600,700,800,900}`
- `brand.primary` → `--color-primary-{50…900}` (ten keys)
- `brand.secondary` → `--color-secondary-{50…900}` (ten keys)
- `fontSize` → `--text-{xs,sm,base,lg,xl,2xl,3xl}`
- `radius` → `--radius-{none,sm,base,md,lg,full}`
- `elevation` → `--shadow-{none,sm,md,lg,xl}`
- `easing` → `--ease-{linear,in,out,in-out}`
- `duration` → `--duration-{instant,fast,base,slow,slower}`

Every emitted property's value equals the corresponding TS token value
byte-for-byte (hex lowercased exactly as in source; `px`/`rem`/`ms`/`cubic-bezier`
strings verbatim). Count is exact: 7 + 10 + 10 + 10 + 7 + 6 + 5 + 4 + 5 = **64**
custom properties, no more and no fewer for the token layer.

## VOC-016-AC-02 — Tokens are consumable by components

- Requirement source: `VOC-016-D01`, `VOC-016-D04`
- Tasks: `VOC-016-T01`
- Tests: `VOC-016-TEST-02`
- Evidence: `VOC-016-EV-01`
- Result: pending

After the wiring, a component can consume a token in at least one of the two
guaranteed ways, demonstrated in the test build (not by adding a UI screen):
utility classes for the namespaced scales (e.g. `bg-primary-500`, `p-md`,
`text-lg`, `rounded-md`, `shadow-lg`, `ease-in-out`) resolve to the token values,
and every emitted custom property is consumable via `var(--…)` (e.g.
`var(--duration-base)` for the non-namespaced `duration` scale). The `duration`
scale is verified **only** as custom properties + `var()`/arbitrary-value
consumption; no `duration-<name>` utility class is asserted (`VOC-016-D01`).

## VOC-016-AC-03 — Drift check binds the CSS to the TS tokens and is enforced by CI

- Requirement source: `VOC-016-D00`, `VOC-016-D03`
- Tasks: `VOC-016-T02`
- Tests: `VOC-016-TEST-03`
- Evidence: `VOC-016-EV-03`
- Result: pending

A deterministic check (`scripts/foundation/tokens-css.test.mjs`, run by the root
`test` script and therefore by CI) fails when any token value in
`@vocanova/design-tokens` is absent from, or mismatched against, the emitted CSS
(and, for the generation design of `VOC-016-D00`, when the committed CSS differs
from freshly regenerated output). No `.github/workflows/*` file is modified, and
no new root `package.json` script is required to make CI run it. Introducing a
deliberate mismatch (test-local, not committed) makes the check fail; the
unmodified tree passes.

## VOC-016-AC-04 — Deterministic checks pass and no UI surface is added

- Requirement source: `VOC-016-D00`
- Tasks: `VOC-016-T00`, `VOC-016-T01`, `VOC-016-T02`
- Tests: `VOC-016-TEST-04`
- Evidence: `VOC-016-EV-04`
- Result: pending

`pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`,
and `pnpm run build` all exit zero, with no new findings elsewhere in the
workspace. `apps/web/src/app/page.tsx` and `apps/web/src/app/layout.tsx` are
unchanged (no new route, screen, or component is introduced); the only runtime
artifact is the token CSS layer.
