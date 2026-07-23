# VOC-017 — Test Plan

Note on tooling: `apps/web` has no test runner yet (no Vitest/RTL/Playwright —
the root `test` script runs only foundation and Go tests). These tests therefore
combine the available deterministic build/type/lint/format checks with a
structured code-inspection checklist. Automated a11y/component testing (axe-core
via Playwright, per DOC-08) is a required follow-up (`VOC-017-D08`/`DEP-05`), not
part of this shell. No secrets or production data are used by any test.

## VOC-017-TEST-00 — Three tab routes resolve with placeholder content

- Covers: `VOC-017-AC-00`
- Preconditions: `VOC-017-T00` steps 1–3 complete.
- Procedure:
  1. Confirm the files `apps/web/src/app/(app)/home/page.tsx`,
     `(app)/journey/page.tsx`, and `(app)/progress/page.tsx` exist under the
     `(app)` route group.
  2. Run `pnpm run build:web`; confirm it compiles and lists `/home`, `/journey`,
     and `/progress` as built routes with no errors.
  3. Inspect each page: exactly one `<h1>` naming the tab plus one short
     descriptive line, and no import of any API client / data-fetching code.
- Expected result: build succeeds; the three routes exist and render static
  placeholder content only.
- Evidence: `VOC-017-EV-00`

## VOC-017-TEST-01 — Persistent bottom navigation on every tab route

- Covers: `VOC-017-AC-01`
- Preconditions: `VOC-017-T00` complete.
- Procedure:
  1. Inspect `apps/web/src/app/(app)/layout.tsx`: it renders both a `<main>`
     wrapping `children` and `<BottomNav />`, so the nav is inherited by all
     three tab routes.
  2. Inspect `BottomNav`: exactly three links, targeting `/home`, `/journey`,
     `/progress` in that order, labelled Home / Journey / Progress.
  3. Confirm the content region reserves bottom spacing equal to the nav height
     (fixed nav does not occlude content).
- Expected result: one shared, persistent bottom nav with three correctly-ordered,
  correctly-targeted links on every tab; content not occluded.
- Evidence: `VOC-017-EV-01`

## VOC-017-TEST-02 — Accessibility and mobile-first checklist

- Covers: `VOC-017-AC-02`, `VOC-017-AC-03`
- Preconditions: `VOC-017-T00` complete.
- Procedure: inspect the rendered `BottomNav` markup/styles and verify each item:
  1. Nav is a `<nav>` with an accessible name (e.g. `aria-label`).
  2. Every tab has a visible text label (none icon-only).
  3. The active tab has `aria-current="page"` **and** a non-color cue (weight
     and/or underline/indicator); disabling color still distinguishes it.
  4. Each tab link is keyboard-focusable with a visible focus indicator (no
     unreplaced `outline-none`); tab order follows visual order.
  5. Each interactive target is ≥44×44px (e.g. `min-h-11 min-w-11` + padding).
  6. Mobile-first: nav is bottom-fixed, full-width, tabs share width evenly; at a
     360px viewport width there is no horizontal scroll and content clears the
     bar.
- Expected result: all six checks hold (DOC-03 §7/§10/§12, DOC-08 Quality
  standards; WCAG 2.2 AA intent). Limitation recorded: verified by construction +
  inspection, not automated axe assertions (`VOC-017-D08`).
- Evidence: `VOC-017-EV-02`

## VOC-017-TEST-03 — Deterministic check suite passes

- Covers: `VOC-017-AC-04`
- Preconditions: all `VOC-017-T00` steps complete.
- Procedure: run, from repo root:
  ```bash
  pnpm run lint:web
  pnpm run typecheck:web
  pnpm run build:web
  pnpm run format:check
  ```
  Then confirm `git diff` shows no change to `apps/web/package.json` or the
  lockfile and no new runtime dependency.
- Expected result: all four commands exit zero with no new findings elsewhere in
  the workspace; no dependency/lockfile change.
- Evidence: `VOC-017-EV-03`

No migration or rollback test is applicable (purely additive front-end files,
zero consumers; rollback is a plain `git revert`). No authorization/security test
is applicable (no auth, input, network, or storage surface — see
`impact-analysis.md`).
