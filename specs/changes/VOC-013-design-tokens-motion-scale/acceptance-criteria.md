# VOC-013 — Acceptance Criteria

## VOC-013-AC-00 — Duration scale is exported and typed with exact values

- Requirement source: `VOC-013-D00`
- Tasks: `VOC-013-T00`
- Tests: `VOC-013-TEST-00`
- Evidence: `VOC-013-EV-00`
- Result: pending

`packages/design-tokens/src/duration.ts` exports a `const duration` object,
typed as `Readonly<Record<string, string>>`, with exactly these five keys
and values:

| key       | value   |
|-----------|---------|
| `instant` | `"0ms"`   |
| `fast`    | `"150ms"` |
| `base`    | `"250ms"` |
| `slow`    | `"400ms"` |
| `slower`  | `"600ms"` |

## VOC-013-AC-01 — Easing scale is exported and typed with exact values

- Requirement source: `VOC-013-D00`
- Tasks: `VOC-013-T01`
- Tests: `VOC-013-TEST-01`
- Evidence: `VOC-013-EV-01`
- Result: pending

`packages/design-tokens/src/easing.ts` exports a `const easing` object,
typed as `Readonly<Record<string, string>>`, with exactly these four keys
and values:

| key         | value                              |
|-------------|-------------------------------------|
| `linear`    | `"linear"`                          |
| `easeIn`    | `"cubic-bezier(0.4, 0, 1, 1)"`      |
| `easeOut`   | `"cubic-bezier(0, 0, 0.2, 1)"`      |
| `easeInOut` | `"cubic-bezier(0.4, 0, 0.2, 1)"`    |

## VOC-013-AC-02 — Both scales are re-exported from the package entry point without disturbing existing exports

- Requirement source: `VOC-013-D00`
- Tasks: `VOC-013-T01`
- Tests: `VOC-013-TEST-02`
- Evidence: `VOC-013-EV-02`
- Result: pending

`packages/design-tokens/src/index.ts` exports both `duration` and `easing`
(named exports) in addition to the existing `spacing`, `neutral`,
`fontSize`, and `radius` exports — none of those four may be removed,
renamed, or have their values altered. Note: this criterion requires both
scales to be present and wired together; a revision containing only
`duration` (with no `easing` file and no entry-point wiring for either)
does not satisfy this criterion.

## VOC-013-AC-03 — Deterministic checks pass

- Requirement source: `VOC-013-D00`
- Tasks: `VOC-013-T01`
- Tests: `VOC-013-TEST-03`
- Evidence: `VOC-013-EV-03`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero, with no new lint or type errors
introduced anywhere else in the workspace.
