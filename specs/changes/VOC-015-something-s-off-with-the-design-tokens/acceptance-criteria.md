# VOC-015 — Acceptance Criteria

## VOC-015-AC-00 — Brand scale is exported and typed with exact values

- Requirement source: `VOC-015-D00`, `VOC-015-D01`
- Tasks: `VOC-015-T00`
- Tests: `VOC-015-TEST-00`
- Evidence: `VOC-015-EV-00`
- Result: pending

`packages/design-tokens/src/brand.ts` exports a `const brand` object, typed as
`Readonly<Record<string, Readonly<Record<string, string>>>>`, with exactly two
top-level keys — `primary` and `secondary` — each a ten-key ramp whose key set
and ordering match `neutral` exactly
(`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`), with these exact
values:

`brand.primary`:

| key   | value       |
|-------|-------------|
| `50`  | `"#eff6ff"` |
| `100` | `"#dbeafe"` |
| `200` | `"#bfdbfe"` |
| `300` | `"#93c5fd"` |
| `400` | `"#60a5fa"` |
| `500` | `"#3b82f6"` |
| `600` | `"#2563eb"` |
| `700` | `"#1d4ed8"` |
| `800` | `"#1e40af"` |
| `900` | `"#1e3a8a"` |

`brand.secondary`:

| key   | value       |
|-------|-------------|
| `50`  | `"#f5f3ff"` |
| `100` | `"#ede9fe"` |
| `200` | `"#ddd6fe"` |
| `300` | `"#c4b5fd"` |
| `400` | `"#a78bfa"` |
| `500` | `"#8b5cf6"` |
| `600` | `"#7c3aed"` |
| `700` | `"#6d28d9"` |
| `800` | `"#5b21b6"` |
| `900` | `"#4c1d95"` |

Every value must match the tables exactly, byte-for-byte, including the leading
`#` and lowercase six-digit hex. Both ramps must be monotonic (lightness
decreasing as the key increases from `50` to `900`), matching the constraint
VOC-010 placed on `neutral`.

> Value note: the twenty hex values above are the planner's proposal
> (`VOC-015-D01`, `VOC-015-DEP-04`) and may be replaced with different hues at
> adoption. If replaced, the substituted values become the sole authority for
> this criterion; the structure, keys, and monotonicity requirement do not
> change.

## VOC-015-AC-01 — Re-exported from the package entry point without disturbing existing exports

- Requirement source: `VOC-015-D00`
- Tasks: `VOC-015-T00`
- Tests: `VOC-015-TEST-01`
- Evidence: `VOC-015-EV-01`
- Result: pending

`packages/design-tokens/src/index.ts` exports `brand` (named export) in addition
to the existing `spacing`, `neutral`, `fontSize`, `radius`, `duration`,
`easing`, and `elevation` exports — none of those seven may be removed, renamed,
or have their values altered. In particular, the existing `neutral` ramp
(`colors.ts`) is unchanged; `brand` is a new, separate file.

## VOC-015-AC-02 — Deterministic checks pass

- Requirement source: `VOC-015-D00`
- Tasks: `VOC-015-T00`
- Tests: `VOC-015-TEST-02`
- Evidence: `VOC-015-EV-02`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero, with no new lint or type errors
introduced anywhere else in the workspace.

Acceptance criteria are observable, stable, and bidirectionally traceable to
decisions `VOC-015-D00`/`D01`, task `VOC-015-T00`, tests `VOC-015-TEST-00..02`,
and evidence `VOC-015-EV-00..02`.
