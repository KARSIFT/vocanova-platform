# VOC-016 — Tasks

Three ordered tasks, each independently implementable and reviewable in one pull
request. `T00` is a clean prerequisite (package importability); `T01` is the CSS
wiring; `T02` is the enforcement that keeps them in sync. `T01` and `T02` depend
on `T00`; `T02` depends on `T01`. Each task preserves scope, separation of
duties, and plain-revert rollback safety.

## VOC-016-T00 — Make `@vocanova/design-tokens` importable and depend on it from apps/web

- Requirement source: `VOC-016-D00`
- Acceptance criteria: `VOC-016-AC-00`
- Tests: `VOC-016-TEST-00`, `VOC-016-TEST-04`
- Evidence: `VOC-016-EV-00`
- Status: pending

1. Add to `packages/design-tokens/package.json` (without changing `name`,
   `version`, `private`, `type`, or `scripts`): a `main` of `./dist/index.js`, a
   `types` of `./dist/index.d.ts`, and an `exports` map
   (`"." : { "types": "./dist/index.d.ts", "default": "./dist/index.js" }`) so the
   package resolves as a bare specifier. Do **not** change any file under
   `packages/design-tokens/src/*` — no token value moves.
2. Add `@vocanova/design-tokens` as a `workspace:*` dependency of `apps/web`
   (`apps/web/package.json`) and update `pnpm-lock.yaml` via `pnpm install`. Use a
   `devDependency` unless a runtime (browser-bundled) import is actually
   introduced — the token layer is CSS/tooling, not shipped JS (see
   `impact-analysis.md`).
3. Confirm `import { spacing } from "@vocanova/design-tokens";` type-checks after
   `pnpm run build:packages` (which runs `tsc -b`, emitting `dist`).

Scoped to introduce no CSS, no generator, and no protected-path change. Rollback
is a plain revert.

## VOC-016-T01 — Emit the eight scales as Tailwind v4 @theme custom properties in apps/web

- Requirement source: `VOC-016-D01`, `VOC-016-D02`, `VOC-016-D04`
- Acceptance criteria: `VOC-016-AC-01`, `VOC-016-AC-02`
- Tests: `VOC-016-TEST-01`, `VOC-016-TEST-02`
- Evidence: `VOC-016-EV-01`
- Status: pending

Recommended (generation, `VOC-016-D00`):

1. Add `apps/web/scripts/generate-tokens-css.mjs`: import the eight scales from
   `@vocanova/design-tokens` and write `apps/web/src/app/tokens.generated.css`
   with a "generated file — do not edit; run `pnpm --filter @vocanova/web
   generate:tokens`" header, containing an `@theme { … }` block that maps every
   key per the `VOC-016-D01` table (colors incl. `neutral`/`primary`/`secondary`,
   `--spacing-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--ease-*`, and the
   `--duration-*` custom properties). Emit exactly the 64 properties in
   `VOC-016-AC-01`; do not invent keys or line-heights.
2. Add a `generate:tokens` script to `apps/web/package.json`
   (`node scripts/generate-tokens-css.mjs`) and run it to produce the committed
   file.
3. Import the generated layer from `apps/web/src/app/globals.css`
   (`@import "tailwindcss"; @import "./tokens.generated.css";`), preserving the
   existing `:root { color-scheme }` and `body` rules. Confirm Tailwind resolves
   and processes the `@theme` from the imported partial (v4's `@import` handling
   inlines it); if 4.3.3 does not process `@theme` from an imported file, inline
   the `@theme` block directly into `globals.css` and have the generator write
   that block instead — the mapping and emitted properties are identical.

Alternative (hand-authored, if the founder selects it in `VOC-016-D00`): write
the same `@theme` mapping by hand into `apps/web/src/app/tokens.css` (no generator
script, no `generate:tokens` script); everything else — the mapping, the
`globals.css` import, `T02`'s drift check — is unchanged, and `T02` verifies value
*presence* rather than byte-equality to regenerated output.

Decisions to honor exactly: colour naming (`primary`/`secondary` vs
`brand-primary`/`brand-secondary`), easing kebab remap, and merge-vs-reset of
Tailwind defaults are `VOC-016-D01`/`D02` and may be amended at adoption
(`VOC-016-DEP-04`); implement the confirmed choice. Do **not** add any route,
page, or component; `page.tsx`/`layout.tsx` stay unchanged.

## VOC-016-T02 — Add the token↔CSS drift check, enforced by CI without a workflow edit

- Requirement source: `VOC-016-D00`, `VOC-016-D03`
- Acceptance criteria: `VOC-016-AC-03`, `VOC-016-AC-04`
- Tests: `VOC-016-TEST-03`, `VOC-016-TEST-04`
- Evidence: `VOC-016-EV-03`
- Status: pending

1. Add `scripts/foundation/tokens-css.test.mjs` (a `node:test` file, matching the
   existing `scripts/foundation/*.test.mjs` convention). It imports the eight
   scales from `@vocanova/design-tokens`, reads the emitted token CSS
   (`apps/web/src/app/tokens.generated.css`, or `tokens.css` for the hand-authored
   variant), and asserts every one of the 64 token values is present and correct
   per the `VOC-016-D01` mapping. For the generation design, it additionally
   re-runs the generator (or its pure function) and asserts byte-equality with the
   committed file.
2. Because the root `test` script is
   `node --test scripts/foundation/*.test.mjs && …`, the new file is picked up
   automatically — **do not** add a root script and **do not** edit any
   `.github/workflows/*` file (either would change the protected surface /
   `VOC-016-D03`). Document the ordering dependency (`dist` is emitted by the
   `typecheck` step's `tsc -b` before `test` runs in CI; locally run `typecheck`
   or `build` first) in a comment at the top of the test.
3. Verify the check fails on a deliberate (uncommitted) mismatch and passes on the
   clean tree.

Rollback is a plain revert; nothing runtime depends on the check.
