# VOC-016 — Impact Analysis

## Security and privacy

None. The change emits static presentational values (hex colours, `px`/`rem`
sizes, `ms` durations, `cubic-bezier`/keyword easings, box-shadow strings) into
CSS custom properties. No secrets, credentials, personal data, user input,
network calls, or filesystem access exist at runtime. The generator and drift
test run only at dev/CI time and read only in-repo, non-secret values. Adding an
`exports` map to `packages/design-tokens` narrows, not widens, the package's
public surface (it exposes only the already-public `dist/index.js`).

## Data and migrations

None. No database, storage, or persisted state is touched. Purely additive at the
app layer: new CSS custom properties plus a package entry point and a workspace
dependency edge. There are no runtime consumers today, so nothing breaks; the
first breaking risk is cosmetic only (see `VOC-016-R00`). Rollback is a plain
`git revert` of the merge commit with no data implications.

## Analytics and accessibility

No analytics event is added. Accessibility: this package renders **no new UI**, so
it introduces no new contrast, focus, or keyboard obligations by itself. It does
make the `brand`/`neutral` colours consumable — but WCAG 2.2 AA contrast
(1.4.3 text, 1.4.11 non-text) becomes a live constraint only when a **consuming**
change pairs a token colour with a background on a rendered surface. That
obligation belongs to the consuming change, per DOC-08's accessibility targets,
and is called out here so it is not lost. One concrete forward note: overriding
`--text-*` changes the pixel size of `text-sm`/`text-base`/etc. utilities to the
token scale, and font-size tokens carry no paired line-height — consumers should
set `leading-*` deliberately where vertical rhythm matters.

## Risks, dependencies, and evidence

- `VOC-016-R00`: Low, cosmetic. Overriding `--color-neutral-*`, `--text-*`,
  `--radius-*`, `--shadow-*`, `--ease-*` changes the values of the corresponding
  Tailwind default utilities (`VOC-016-D02`, merge semantics). `apps/web` today
  uses only `grid min-h-screen place-items-center p-6`, none of which those
  overrides affect, so there is no current regression; the risk is future visual
  surprise, mitigated by the explicit mapping table and the drift check.
- `VOC-016-R01`: Tailwind v4 namespace behaviour for **named `--spacing-*`
  utilities** and **`@theme` inside an `@import`ed partial** should be verified
  against the installed `tailwindcss@4.3.3` at implementation, since node_modules
  was not installed at planning time. The design degrades safely: every value is
  emitted as a custom property regardless, so `p-[var(--spacing-md)]` and
  `var(--…)` always work even if a named utility does not generate. Acceptance
  criteria are written against custom-property emission, not against specific
  utility classes, so a namespace surprise does not invalidate the package.
- `VOC-016-R02`: Build-order dependency. The drift test imports
  `@vocanova/design-tokens` → `dist/index.js`, so `dist` must exist when it runs.
  In CI, `typecheck` (`tsc -b`) emits `dist` before `test`; locally a developer
  runs `pnpm run typecheck` or `pnpm run build` first. Documented in the test
  header (`VOC-016-D03`). If this proves fragile, the fallback is to have the test
  import the token source through the same build the workspace already produces
  rather than adding a transpiler dependency.
- `VOC-016-R03`: Protected-surface risk. Enforcing the drift check by editing
  `.github/workflows/*` would raise the classifier floor to R3 and change the
  approval surface. The design forbids this and routes enforcement through the
  existing root `test` glob instead (`VOC-016-D03`); the reviewer must confirm no
  workflow file was touched.
- `VOC-016-DEP-01`: Requirement must reach a founder-approved,
  implementation-ready state at adoption. DOC-08 is approved but an approved
  document is not itself implementation authority (`AGENTS.md`); this draft is not
  authority on its own.
- `VOC-016-DEP-02`: `base_sha` to be pinned to the then-current `develop` head at
  adoption.
- `VOC-016-DEP-03`: Depends on the VOC-010→VOC-015 scales (`spacing`, `neutral`,
  `brand`, `fontSize`, `radius`, `duration`, `easing`, `elevation`) already
  present on `develop`. All eight are exported from
  `packages/design-tokens/src/index.ts` at this draft's authoring.
- `VOC-016-DEP-04`: The open design decisions — generate vs hand-author
  (`D00`), colour naming and any flagged mapping rows (`D01`), merge vs reset
  (`D02`) — pending founder confirmation at adoption. The task and test structure
  is stable across every alternative.
- `VOC-016-DEP-05`: No `feedback` scale exists in `packages/design-tokens`; the
  request's "feedback if adopted" is therefore out of scope. If a `feedback`
  scale is later added, wiring it is a follow-up package, not this one.
- `VOC-016-EV-00`..`VOC-016-EV-04`: CI output (format/lint/typecheck/test/build,
  including the drift check) plus the independent reviewer's exact-SHA verdict —
  produced at implementation time, not now.
