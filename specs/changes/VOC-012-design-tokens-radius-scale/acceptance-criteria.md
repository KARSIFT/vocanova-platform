# VOC-012 — Acceptance Criteria

## VOC-012-AC-00 — Radius scale is exported and typed with exact values

- Requirement source: `VOC-012-D00`
- Tasks: `VOC-012-T00`
- Tests: `VOC-012-TEST-00`
- Evidence: `VOC-012-EV-00`
- Result: pending

`packages/design-tokens/src/radius.ts` exports a `const radius` object,
typed as `Readonly<Record<string, string>>`, with exactly these six keys
and values:

| key    | value      |
|--------|------------|
| `none` | `"0px"`    |
| `sm`   | `"2px"`    |
| `base` | `"4px"`    |
| `md`   | `"8px"`    |
| `lg`   | `"16px"`   |
| `full` | `"9999px"` |

Every value must match the table exactly, byte-for-byte, including the
`px` suffix.

## VOC-012-AC-01 — Re-exported from the package entry point without disturbing existing exports

- Requirement source: `VOC-012-D00`
- Tasks: `VOC-012-T00`
- Tests: `VOC-012-TEST-01`
- Evidence: `VOC-012-EV-01`
- Result: pending

`packages/design-tokens/src/index.ts` exports `radius` (named export) in
addition to the existing `spacing`, `neutral`, and `fontSize` exports —
none of those three may be removed, renamed, or have their values altered.

## VOC-012-AC-02 — Deterministic checks pass

- Requirement source: `VOC-012-D00`
- Tasks: `VOC-012-T00`
- Tests: `VOC-012-TEST-02`
- Evidence: `VOC-012-EV-02`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero, with no new lint or type errors
introduced anywhere else in the workspace.
