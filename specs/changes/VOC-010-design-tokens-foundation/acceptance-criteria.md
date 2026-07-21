# VOC-010 — Acceptance Criteria

## VOC-010-AC-00 — Spacing scale is exported and typed

- Requirement source: `VOC-010-D00`
- Tasks: `VOC-010-T00`
- Tests: `VOC-010-TEST-00`
- Evidence: `VOC-010-EV-00`
- Result: pending

`packages/design-tokens/src/spacing.ts` exports a `const spacing` object, typed
as `Readonly<Record<string, string>>` (or a narrower literal-keyed equivalent),
with exactly these keys and values (4px base unit):
`none: "0px"`, `xs: "4px"`, `sm: "8px"`, `md: "16px"`, `lg: "24px"`,
`xl: "32px"`, `2xl: "48px"`.

## VOC-010-AC-01 — Neutral color palette is exported and typed

- Requirement source: `VOC-010-D00`
- Tasks: `VOC-010-T01`
- Tests: `VOC-010-TEST-01`
- Evidence: `VOC-010-EV-01`
- Result: pending

`packages/design-tokens/src/colors.ts` exports a `const neutral` object, typed
as `Readonly<Record<string, string>>`, with exactly 10 steps (`50`, `100`,
`200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`), each a valid 6-digit
hex string, monotonically decreasing in lightness from `50` to `900`.

## VOC-010-AC-02 — Both are re-exported from the package entry point

- Requirement source: `VOC-010-D00`
- Tasks: `VOC-010-T02`
- Tests: `VOC-010-TEST-02`
- Evidence: `VOC-010-EV-02`
- Result: pending

`packages/design-tokens/src/index.ts` exports `spacing` and `neutral` (named
exports) so a consumer can `import { spacing, neutral } from "@vocanova/design-tokens"`.

## VOC-010-AC-03 — Deterministic checks pass

- Requirement source: `VOC-010-D00`
- Tasks: `VOC-010-T00`, `VOC-010-T01`, `VOC-010-T02`
- Tests: `VOC-010-TEST-03`
- Evidence: `VOC-010-EV-03`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero against the changed tree, with no new
lint or type errors introduced anywhere else in the workspace.
