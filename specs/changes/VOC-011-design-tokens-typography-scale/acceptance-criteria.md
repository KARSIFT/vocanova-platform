# VOC-011 — Acceptance Criteria

## VOC-011-AC-00 — Typography scale is exported and typed with exact values

- Requirement source: `VOC-011-D00`
- Tasks: `VOC-011-T00`
- Tests: `VOC-011-TEST-00`
- Evidence: `VOC-011-EV-00`
- Result: pending

`packages/design-tokens/src/typography.ts` exports a `const fontSize` object,
typed as `Readonly<Record<string, string>>`, with exactly these seven keys
and values (ratio `1.25`, base `1.000rem`, round-half-up to 3 decimals —
see `specification.md` `VOC-011-D00` for the exact method):

| key    | value      |
|--------|------------|
| `xs`   | `"0.640rem"` |
| `sm`   | `"0.800rem"` |
| `base` | `"1.000rem"` |
| `lg`   | `"1.250rem"` |
| `xl`   | `"1.563rem"` |
| `2xl`  | `"1.953rem"` |
| `3xl`  | `"2.441rem"` |

Every value must include exactly 3 digits after the decimal point and the
`rem` suffix, matching the table exactly — this is a common place to
introduce a rounding or truncation error, and the reviewer checks each value
individually against a computed reference, not just spot-checks.

## VOC-011-AC-01 — Re-exported from the package entry point without disturbing existing exports

- Requirement source: `VOC-011-D00`
- Tasks: `VOC-011-T00`
- Tests: `VOC-011-TEST-01`
- Evidence: `VOC-011-EV-01`
- Result: pending

`packages/design-tokens/src/index.ts` exports `fontSize` (named export) in
addition to the existing `spacing` and `neutral` exports from VOC-010 —
neither of those may be removed, renamed, or have their values altered.

## VOC-011-AC-02 — Deterministic checks pass

- Requirement source: `VOC-011-D00`
- Tasks: `VOC-011-T00`
- Tests: `VOC-011-TEST-02`
- Evidence: `VOC-011-EV-02`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero, with no new lint or type errors
introduced anywhere else in the workspace.
