# VOC-018 — Test Plan

Tests are deterministic, use no secrets or production data, and trace to
`VOC-018-AC-00`..`AC-04`. No migration or authorization test applies (no data,
auth, or protected surface is touched); no accessibility test applies until a
consuming surface renders (see `impact-analysis.md`).

## VOC-018-TEST-00 — Package is importable and depended on

- Covers: `VOC-018-AC-00`
- Preconditions: `VOC-018-T00` complete; `pnpm install` run.
- Procedure:
  1. Inspect `packages/design-tokens/package.json`: confirm `main`, `types`, and
     an `exports` map resolving to `dist/index.js` / `dist/index.d.ts`, and that
     `name`/`version`/`private`/`type`/`scripts` and all `src/*` files are
     unchanged.
  2. Inspect `apps/web/package.json`: confirm a `@vocanova/design-tokens`
     `workspace:*` dependency, and `pnpm-lock.yaml` reflects it.
  3. Run `pnpm run build:packages` then `pnpm run typecheck`; confirm a
     bare-specifier `import { spacing } from "@vocanova/design-tokens";` resolves
     and type-checks.
- Expected result: all confirmations hold; zero typecheck errors; no token value
  changed.
- Evidence: `VOC-018-EV-00`

## VOC-018-TEST-01 — Every scale key is emitted with the exact token value

- Covers: `VOC-018-AC-01`
- Preconditions: `VOC-018-T01` complete.
- Procedure: with the token CSS present, verify against the `VOC-018-D01` table,
  key by key:
  1. `spacing`→`--spacing-*` (7), `neutral`→`--color-neutral-*` (10),
     `brand.primary`→`--color-primary-*` (10),
     `brand.secondary`→`--color-secondary-*` (10), `fontSize`→`--text-*` (7),
     `radius`→`--radius-*` (6), `elevation`→`--shadow-*` (5),
     `easing`→`--ease-{linear,in,out,in-out}` (4),
     `duration`→`--duration-*` (5) — **64** properties total.
  2. Each property's value equals the source token byte-for-byte (hex lowercase,
     `px`/`rem`/`ms`/`cubic-bezier` strings verbatim).
  3. No extra token-layer property and no missing key; no `--text-*--line-height`
     invented.
- Expected result: all 64 present and exact; count matches; no stray keys.
- Evidence: `VOC-018-EV-01`

## VOC-018-TEST-02 — Tokens compile and are consumable

- Covers: `VOC-018-AC-01`, `VOC-018-AC-02`
- Preconditions: `VOC-018-T01` complete.
- Procedure:
  1. Run `pnpm --filter @vocanova/web build`; confirm it exits zero and the
     compiled CSS contains the token custom properties on `:root`.
  2. Confirm a namespaced utility resolves to a token value (e.g. a probe element
     with `bg-primary-500` yields `--color-primary-500`'s value; `p-md` yields
     `--spacing-md`), and that `var(--duration-base)` resolves — the
     `duration` scale is checked only as a custom property + `var()`, with **no**
     `duration-<name>` utility asserted (`VOC-018-D01`/`D04`).
- Expected result: build passes; namespaced utilities resolve to token values;
  every custom property is consumable via `var(--…)`.
- Evidence: `VOC-018-EV-01`

## VOC-018-TEST-03 — Drift check fails on divergence, passes clean, and is CI-enforced

- Covers: `VOC-018-AC-03`
- Preconditions: `VOC-018-T02` complete; `dist` built (run `typecheck`/`build`
  first).
- Procedure:
  1. Run `pnpm run test`; confirm `scripts/foundation/tokens-css.test.mjs`
     executes (proving the root glob picks it up with no root-script or workflow
     edit) and passes on the clean tree.
  2. Introduce a deliberate, uncommitted mismatch (change one emitted value, or a
     token value locally); re-run; confirm the check fails and names the offending
     key. Revert.
- Expected result: passes clean; fails on the seeded mismatch; no
  `.github/workflows/*` file and no root `package.json` script was modified.
- Evidence: `VOC-018-EV-03`

## VOC-018-TEST-04 — Full deterministic suite passes; no UI surface added

- Covers: `VOC-018-AC-04`
- Preconditions: all tasks complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run format:check
  pnpm run lint
  pnpm run typecheck
  pnpm run test
  pnpm run build
  ```
  Then confirm `apps/web/src/app/page.tsx` and `apps/web/src/app/layout.tsx` are
  byte-for-byte unchanged and no new route/page/component file was added.
- Expected result: all five commands exit zero with no new findings elsewhere;
  `page.tsx`/`layout.tsx` unchanged; the only new runtime artifact is the token
  CSS layer.
- Evidence: `VOC-018-EV-04`
