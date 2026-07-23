# VOC-017 — Acceptance Criteria

All criteria are observable and bidirectionally traceable to decisions
`VOC-017-D00`..`D08`, task `VOC-017-T00`, tests `VOC-017-TEST-00`..`TEST-03`, and
evidence `VOC-017-EV-00`..`EV-03`.

## VOC-017-AC-00 — Three tab routes resolve with placeholder content

- Requirement source: `VOC-017-D00`, `VOC-017-D01`, `VOC-017-D04`
- Tasks: `VOC-017-T00`
- Tests: `VOC-017-TEST-00`
- Evidence: `VOC-017-EV-00`
- Result: pending

Under a Next.js App Router route group `apps/web/src/app/(app)/`, the routes
`/home`, `/journey`, and `/progress` each resolve to a distinct page that renders
a single `<h1>` naming the tab (Home / Journey / Progress) and a short line of
descriptive placeholder text. No route depends on any backend call, and the
project builds with all three routes present.

> Route-name note: `/journey` is the planner's proposal for the Journey tab
> (`VOC-017-D01`, `VOC-017-DEP-04`). If the adopter substitutes `/discover` (per
> DOC-08's routing table), that route folder and the corresponding `BottomNav`
> href change accordingly; the rest of this criterion is unchanged.

## VOC-017-AC-01 — Persistent bottom navigation on every tab route

- Requirement source: `VOC-017-D00`, `VOC-017-D02`
- Tasks: `VOC-017-T00`
- Tests: `VOC-017-TEST-01`
- Evidence: `VOC-017-EV-01`
- Result: pending

The `(app)` shell layout (`apps/web/src/app/(app)/layout.tsx`) renders the
`BottomNav` component together with a `<main>` content region wrapping
`children`, so the same bottom navigation is present on `/home`, `/journey`, and
`/progress`. `BottomNav` renders exactly three links whose destinations are the
three tab routes (Home→`/home`, Journey→`/journey`, Progress→`/progress`), in
that order. The bottom nav does not occlude page content (the content region
reserves space for the fixed bar).

## VOC-017-AC-02 — Accessibility: keyboard, focus, active state, touch targets

- Requirement source: `VOC-017-D03`
- Tasks: `VOC-017-T00`
- Tests: `VOC-017-TEST-02`
- Evidence: `VOC-017-EV-02`
- Result: pending

The navigation meets, verifiable by inspection of the rendered markup and styles:

1. **Semantic + named:** the nav is a `<nav>` element with an accessible name
   (e.g. `aria-label`).
2. **Text labels:** each tab exposes a visible text label (Home / Journey /
   Progress); no tab is icon-only / label-less.
3. **Active state, not color alone:** the tab matching the current route carries
   `aria-current="page"` **and** a non-color visual cue (font weight and/or an
   underline/indicator element). Removing color must still leave the active tab
   distinguishable.
4. **Keyboard + visible focus:** every tab link is reachable and activatable by
   keyboard, with a visible focus indicator that is not suppressed
   (`outline`/`focus-visible` ring present).
5. **44px touch targets:** each interactive tab target is at least 44×44px
   (e.g. `min-h-11 min-w-11` plus padding).

These realize DOC-03 §7/§10/§12 and DOC-08 Quality standards (WCAG 2.2 AA
intent). Automated axe/Playwright verification is a flagged follow-up
(`VOC-017-D08`); this criterion is verified here by construction and structured
inspection.

## VOC-017-AC-03 — Mobile-first layout

- Requirement source: `VOC-017-D03`, `VOC-017-D04`
- Tasks: `VOC-017-T00`
- Tests: `VOC-017-TEST-02`
- Evidence: `VOC-017-EV-02`
- Result: pending

The shell is designed mobile-first for the 360–430px viewport range (DOC-08):
the bottom nav is fixed to the bottom of the viewport (thumb-reachable per DOC-03
§12), spans the full width, and the three tabs share the width evenly; the
`<main>` region reserves bottom padding equal to the nav height so no placeholder
content is hidden behind the bar. No horizontal scrolling is introduced at 360px
width.

## VOC-017-AC-04 — Deterministic checks pass

- Requirement source: `VOC-017-D00`..`D07`
- Tasks: `VOC-017-T00`
- Tests: `VOC-017-TEST-03`
- Evidence: `VOC-017-EV-03`
- Result: pending

`pnpm run lint:web`, `pnpm run typecheck:web`, and `pnpm run build:web` all exit
zero, and `pnpm run format:check` reports the `apps/web` changes clean, with no
new lint/type/format errors introduced elsewhere in the workspace. No new runtime
dependency, and no change to `apps/web/package.json` or the lockfile.
