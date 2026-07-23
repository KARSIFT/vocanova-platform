# VOC-016 — Wire design-token scales into apps/web (Tailwind v4 @theme): Specification

## Objective and requirement source

Wire the eight existing `@vocanova/design-tokens` scales into `apps/web` as real
Tailwind v4 `@theme` CSS custom properties so components can consume them, keeping
the TS token package the single source of truth. Today `apps/web` uses only raw
Tailwind utilities (`apps/web/src/app/globals.css` is `@import "tailwindcss";`
plus a `body`/`:root` reset) and imports nothing from `@vocanova/design-tokens`.

Requirement source: DOC-08 (`docs/design/08-web-app-design.md`, approved), which
mandates "Tailwind + shadcn/ui-style components" and a mobile-first, accessible
`apps/web` on the Go API — a design system needs its tokens wired into the styling
layer before components can use them. The free-text request scopes this to "just
the token-to-CSS wiring layer … No new UI screens." This document is a draft, not
an approved specification; a founder-approved implementation-ready state must be
recorded before implementation (`AGENTS.md`).

## Scope and non-goals

In scope:
1. **Importability** — add `main`, `types`, and `exports` to
   `packages/design-tokens/package.json` pointing at the built
   `dist/index.js` / `dist/index.d.ts`, so `@vocanova/design-tokens` resolves as a
   bare specifier; and add it as a (dev) dependency of `apps/web`.
2. **Token → CSS emission** — represent all eight scales as Tailwind v4 `@theme`
   custom properties consumed by `apps/web/src/app/globals.css`, per the mapping
   table in `VOC-016-D01`.
3. **Drift enforcement** — a deterministic check that fails when the emitted CSS
   and the TS token objects diverge, wired into an existing root pnpm script CI
   already runs (`VOC-016-D03`), with **no `.github/workflows/*` edit**.

Explicitly excluded: any new route, screen, page, or component; any change to a
token *value* in `packages/design-tokens/src/*`; semantic alias tokens (`text`,
`surface`, `success`, `danger`); dark-mode / light-dark token pairs; a `feedback`
scale (none exists — `VOC-016-DEP-05`); Tailwind plugin authoring; shadcn/ui
component installation; any deployment. `apps/web/src/app/page.tsx` and
`layout.tsx` remain unchanged (the wiring is proven by compiled CSS and the drift
check, not by a demo screen).

## Risk and protected areas

Proposed risk: **R2**. The recommended file set is:

| Path (recommended design) | Classifier floor |
|---|---|
| `packages/design-tokens/package.json` | R2 (`package.json`) |
| `apps/web/package.json` | R2 (`package.json`) |
| `pnpm-lock.yaml` | R2 (`pnpm-lock.yaml`) |
| `apps/web/src/app/globals.css` | R1 (`*` default) |
| `apps/web/src/app/tokens.generated.css` (new) | R1 |
| `apps/web/scripts/generate-tokens-css.mjs` (new) | R1 |
| `scripts/foundation/tokens-css.test.mjs` (new) | R1 |

Highest floor: **R2**. This is a draft proposal —
`scripts/governance/classify-change-risk.sh` and a human's judgment govern the
actual class at implementation time. **Critical protected-area note:** the drift
check MUST be enforced through an existing root pnpm script (CI runs
`format:check`, `lint`, `typecheck`, `test`, `build` — see the reusable
`ci.yml`), **not** by editing a workflow file. Editing `.github/workflows/*`
would raise the floor to **R3** and change the approval surface; the recommended
design deliberately avoids it (`VOC-016-D03`). No R3/R4 protected path is touched
by the recommended design.

## Decisions, contradictions, security, and privacy

> All decisions below are the planner's proposal. Several are genuine design
> forks the planner should not settle unilaterally; those are flagged as OPEN and
> tracked by `VOC-016-DEP-04`. Confirm or amend them at adoption — the task,
> test, and file structure are stable across the alternatives.

### `VOC-016-D00` — Single source of truth: generate, don't hand-copy (OPEN)

The TS objects in `packages/design-tokens` are the source of truth. Crossing from
TS to CSS can be **generated** (a script reads the objects and writes the CSS,
which is committed) or **hand-authored** (a human writes the `@theme` values by
hand). **Recommended: generation**, because hand-copying re-introduces exactly
the silent-drift class the token package exists to prevent (and that VOC-015 was
opened over), and because the request explicitly names the "imports nothing from
`@vocanova/design-tokens`" gap — generation establishes a real dependency edge.

Either way a **drift check** (`VOC-016-D03`) binds the CSS to the objects. If the
founder prefers minimal tooling, the hand-authored variant is acceptable: the
generator task (`VOC-016-T01`) then produces a hand-written
`apps/web/src/app/tokens.css` instead of a generated one, and the drift check
asserts every token value is *present* rather than that the file is *byte-equal to
regenerated output*. Only `VOC-016-T01`'s mechanism changes; `VOC-016-T00`,
`VOC-016-T02`, the mapping table, and all acceptance criteria are unaffected.

### `VOC-016-D01` — Namespace mapping (OPEN on the flagged rows)

Each scale maps to a Tailwind v4 `@theme` namespace. Where a v4 namespace exists,
the custom property both (a) becomes a `:root` CSS variable and (b) generates
utility classes. Where none exists, the value is emitted as a plain custom
property, still consumable via `var(--…)` or an arbitrary-value utility.

| Source (TS export) | Keys | Emitted custom property | Utilities generated | Notes |
|---|---|---|---|---|
| `spacing` | `none,xs,sm,md,lg,xl,2xl` | `--spacing-<key>` | `p-md`, `gap-lg`, `w-xl`, … | Named spacing keys. Tailwind's numeric utilities (`p-6`) keep working off the base `--spacing` multiplier. **Verify** named-key utility generation in Tailwind 4.3.3 at implementation; regardless, `p-[var(--spacing-md)]` always works. |
| `neutral` | `50…900` | `--color-neutral-<key>` | `bg-neutral-100`, `text-neutral-900`, `border-neutral-200` | **Overrides** Tailwind's built-in `neutral-*` values with the token values (`VOC-016-D02`). |
| `brand.primary` | `50…900` | `--color-primary-<key>` | `bg-primary-500`, `text-primary-700` | Naming: `primary` (drop the `brand-` prefix) so utilities read `bg-primary-500`. **OPEN**: alternative `--color-brand-primary-<key>` → `bg-brand-primary-500`. |
| `brand.secondary` | `50…900` | `--color-secondary-<key>` | `bg-secondary-500` | Same naming decision as `brand.primary`. |
| `fontSize` | `xs,sm,base,lg,xl,2xl,3xl` | `--text-<key>` | `text-lg`, `text-2xl` | v4 font-size namespace is `--text-*`. **Overrides** default `text-*` sizes for these keys. Tokens carry no paired line-height, so `--text-*--line-height` is not set; components use `leading-*` as needed. |
| `radius` | `none,sm,base,md,lg,full` | `--radius-<key>` | `rounded-md`, `rounded-base`, `rounded-full` | The `base` key yields `rounded-base` (not bare `rounded`). |
| `elevation` | `none,sm,md,lg,xl` | `--shadow-<key>` | `shadow-sm`, `shadow-lg` | v4 box-shadow namespace is `--shadow-*`. **Overrides** default `shadow-*` for these keys. |
| `easing` | `linear,easeIn,easeOut,easeInOut` | `--ease-<key'>` | `ease-in`, `ease-out`, `ease-in-out`, `ease-linear` | camelCase → kebab remap: `easeIn`→`in`, `easeOut`→`out`, `easeInOut`→`in-out`, `linear`→`linear`. Values coincide with Tailwind defaults. |
| `duration` | `instant,fast,base,slow,slower` | `--duration-<key>` | **none** | **Tailwind v4 has no theme namespace for named durations.** These are emitted as plain custom properties only; components consume them via `var(--duration-base)` in CSS or `duration-[var(--duration-fast)]` arbitrary utilities (`VOC-016-D04`). Acceptance criteria must **not** claim `duration-<name>` utility classes. |

### `VOC-016-D02` — Override vs. reset the Tailwind default palette (OPEN)

Defining `--color-neutral-*`, `--text-*`, `--radius-*`, `--shadow-*`, and
`--ease-*` **overrides** Tailwind's built-in values for exactly those keys while
leaving all other default keys intact (merge semantics). **Recommended: merge**
(override only our keys), which is the least disruptive and cannot break existing
utilities (`apps/web` currently uses only `grid`, `min-h-screen`,
`place-items-center`, `p-6` — none of which our overrides change). **OPEN**: a
clean-slate palette (emit `--color-*: initial;` first to drop all Tailwind
defaults, exposing only token colors) is a defensible alternative the founder may
prefer for a stricter design system; it is riskier because it removes every
non-token default color utility. Do not choose reset without explicit founder
direction.

### `VOC-016-D03` — Where the drift check runs (no workflow edit)

The reusable CI (`karsift-ai-infra/.github/workflows/ci.yml`) runs the root
`format:check`, `lint`, `typecheck`, `test`, and `build` scripts if present, and
does **not** run `validate`. The root `test` script is
`node --test scripts/foundation/*.test.mjs && …`, whose glob auto-includes new
files. Therefore the drift check is added as
`scripts/foundation/tokens-css.test.mjs`, picked up by CI's `test` step with **no
`package.json` script change and no `.github/workflows/*` edit**. Ordering
dependency: the test imports `@vocanova/design-tokens`, which resolves to
`dist/index.js`; `dist` is emitted by `tsc -b` during the `typecheck` step, which
runs before `test` in CI — so `dist` exists when the test runs. Locally, the test
runs after `pnpm run typecheck` or `pnpm run build`. This ordering is documented
in `implementation-plan.md` and tracked as `VOC-016-R02`.

### `VOC-016-D04` — Duration consumption pattern

Because there is no `duration-<name>` utility (`VOC-016-D01`), the emitted
`--duration-*` custom properties are the contract. Components consume a named
duration through `transition-duration: var(--duration-base)` in CSS or the
arbitrary utility `duration-[var(--duration-fast)]`. The same holds for any scale
key whose named utility does not generate; the custom property is always the
guaranteed, testable surface.

### Contradictions

None between DOC-08 and the request. DOC-08 also lists shadcn/ui components and a
broader web build; this package is deliberately a strict subset (the token→CSS
layer only), consistent with the request's "just the wiring layer, no new UI
screens." That narrowing is a scope decision, not a contradiction.

### Security and privacy

None. The change emits static presentational values (colors, sizes, shadows,
timing) into CSS. No secrets, credentials, personal data, user input, network, or
filesystem access at runtime; the generator/test run only at dev/CI time over
in-repo values.

## Data, migrations, analytics, and accessibility

No data storage, migration, or analytics event is introduced. Accessibility: this
package wires tokens but renders no new UI, so it introduces no new
contrast/focus obligations by itself. It does, however, make the `brand` and
`neutral` colors consumable — the **consuming** change (not this one) must
contrast-check any text/background pairing against WCAG 2.2 AA (1.4.3 / 1.4.11),
as DOC-08 requires. This boundary is restated in `impact-analysis.md`.
