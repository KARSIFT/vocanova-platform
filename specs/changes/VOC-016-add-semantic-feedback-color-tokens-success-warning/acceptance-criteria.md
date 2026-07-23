# VOC-016 — Acceptance Criteria

## VOC-016-AC-00 — Feedback scale is exported and typed with exact values

- Requirement source: `VOC-016-D00`, `VOC-016-D01`
- Tasks: `VOC-016-T00`
- Tests: `VOC-016-TEST-00`
- Evidence: `VOC-016-EV-00`
- Result: pending

`packages/design-tokens/src/feedback.ts` exports a `const feedback` object, typed
as `Readonly<Record<string, Readonly<Record<string, string>>>>`, with exactly
three top-level keys — `success`, `warning`, and `error` — each a ten-key ramp
whose key set and ordering match `neutral` exactly
(`50`,`100`,`200`,`300`,`400`,`500`,`600`,`700`,`800`,`900`), with these exact
values:

`feedback.success` (calm green):

| key   | value       |
|-------|-------------|
| `50`  | `"#ecfdf5"` |
| `100` | `"#d1fae5"` |
| `200` | `"#a7f3d0"` |
| `300` | `"#6ee7b7"` |
| `400` | `"#34d399"` |
| `500` | `"#10b981"` |
| `600` | `"#059669"` |
| `700` | `"#047857"` |
| `800` | `"#065f46"` |
| `900` | `"#064e3b"` |

`feedback.warning` (amber):

| key   | value       |
|-------|-------------|
| `50`  | `"#fffbeb"` |
| `100` | `"#fef3c7"` |
| `200` | `"#fde68a"` |
| `300` | `"#fcd34d"` |
| `400` | `"#fbbf24"` |
| `500` | `"#f59e0b"` |
| `600` | `"#d97706"` |
| `700` | `"#b45309"` |
| `800` | `"#92400e"` |
| `900` | `"#78350f"` |

`feedback.error` (soft rose — deliberately not a harsh fire-engine red, per
DOC-03 §11):

| key   | value       |
|-------|-------------|
| `50`  | `"#fff1f2"` |
| `100` | `"#ffe4e6"` |
| `200` | `"#fecdd3"` |
| `300` | `"#fda4af"` |
| `400` | `"#fb7185"` |
| `500` | `"#f43f5e"` |
| `600` | `"#e11d48"` |
| `700` | `"#be123c"` |
| `800` | `"#9f1239"` |
| `900` | `"#881337"` |

Every value must match the tables exactly, byte-for-byte, including the leading
`#` and lowercase six-digit hex. All three ramps must be monotonic (lightness
decreasing as the key increases from `50` to `900`), matching the constraint
VOC-010 placed on `neutral`.

> Value note: the thirty hex values above are the planner's proposal
> (`VOC-016-D01`, `VOC-016-DEP-04`) and may be replaced with different hues at
> adoption. If replaced, the substituted values become the sole authority for this
> criterion, **provided they still satisfy `VOC-016-AC-01`**; the structure, keys,
> and monotonicity requirement do not change.

## VOC-016-AC-01 — Each ramp carries a WCAG 2.2 AA text-contrast-capable step

- Requirement source: `VOC-016-D01`, `VOC-016-D03`
- Tasks: `VOC-016-T00`
- Tests: `VOC-016-TEST-01`
- Evidence: `VOC-016-EV-01`
- Result: pending

For each of the three ramps (`success`, `warning`, `error`), both the `800` and
`900` steps achieve a WCAG 2.2 contrast ratio of **at least 4.5:1** against pure
white (`#ffffff`), computed by the standard WCAG 2.x relative-luminance formula
(sRGB channel linearization, `L = 0.2126·R + 0.7152·G + 0.0722·B`, ratio
`(L_light + 0.05) / (L_dark + 0.05)`). This guarantees every feedback state has a
token step usable for normal-size body text on a light background, satisfying the
*contrast-capability* half of DOC-03 §10 (WCAG 2.2 AA, 1.4.3 normal text).

This is the binding accessibility floor on the values. The planner-proposed values
in `VOC-016-AC-00` are chosen to satisfy it; if an adopter substitutes hues
(`VOC-016-DEP-04`), the substituted `800`/`900` steps must still pass, and
`VOC-016-TEST-01` re-verifies. (Non-text/UI-component contrast of 3:1 per WCAG
1.4.11 is recommended for mid-tone steps used as borders/fills but is **not**
made a hard pass/fail here, since which step a component picks is a consuming
decision.)

> This criterion does **not** claim full §10 compliance: the "no information by
> color alone" requirement is a property of the consuming component (it must add
> an icon or text label) and cannot be enforced by a token file. See
> `VOC-016-R04`.

## VOC-016-AC-02 — Re-exported from the package entry point without disturbing existing exports

- Requirement source: `VOC-016-D00`
- Tasks: `VOC-016-T00`
- Tests: `VOC-016-TEST-02`
- Evidence: `VOC-016-EV-02`
- Result: pending

`packages/design-tokens/src/index.ts` exports `feedback` (named export) in
addition to the existing `spacing`, `neutral`, `brand`, `fontSize`, `radius`,
`duration`, `easing`, and `elevation` exports — none of those eight may be
removed, renamed, or have their values altered. In particular, the existing
`neutral` ramp (`colors.ts`) and `brand` scale (`brand.ts`) are unchanged;
`feedback` is a new, separate file.

## VOC-016-AC-03 — Deterministic checks pass

- Requirement source: `VOC-016-D00`
- Tasks: `VOC-016-T00`
- Tests: `VOC-016-TEST-03`
- Evidence: `VOC-016-EV-03`
- Result: pending

`pnpm run lint:packages`, `pnpm run typecheck:packages`, and
`pnpm run build:packages` all exit zero, with no new lint or type errors
introduced anywhere else in the workspace.

Acceptance criteria are observable, stable, and bidirectionally traceable to
decisions `VOC-016-D00`/`D01`/`D03`, task `VOC-016-T00`, tests
`VOC-016-TEST-00..03`, and evidence `VOC-016-EV-00..03`.
