# VOC-017 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package is adopted and implementation is authorized: a
human sets `status`, `approval_status`, and `implementation.authorized` in
`change.yaml` (all at unadopted defaults in this draft), records a
founder-approved implementation-ready state (`VOC-017-DEP-01`), resolves the
Journey route name (`VOC-017-DEP-04`), and acknowledges the web-test-infra
follow-up (`VOC-017-DEP-05`). Depends on the existing Next.js web foundation on
`develop` (`VOC-017-DEP-03`, present at drafting). No protected areas are
touched — every target is under `apps/web/src/**`.

## File reconciliation and implementation sequence

Existing state (do not disturb):
- `apps/web/src/app/layout.tsx` — root layout (`<html>`/`<body>`, metadata). Left
  unchanged; the `(app)` shell layout nests inside it.
- `apps/web/src/app/page.tsx` — root `/` foundation page. Left unchanged
  (`VOC-017-D06`); no redirect added.
- `apps/web/src/app/globals.css` — Tailwind entry (`@import "tailwindcss"`).
  Reused as-is; no new global styles required beyond utility classes.

New files (all created fresh under `apps/web/src/app/(app)/`):
1. `(app)/_components/bottom-nav.tsx` — the `BottomNav` **client component**
   (`"use client"`). Defines the three nav items as a small local array
   (`{ href, label }` for Home→`/home`, Journey→`/journey`, Progress→`/progress`),
   reads `usePathname()`, and renders a semantic `<nav aria-label="Primary">`
   containing three Next `<Link>`s. Each link:
   - renders its visible text label;
   - sets `aria-current="page"` when its `href` matches the active path;
   - applies a **non-color** active cue (e.g. `font-semibold` and/or an
     underline/indicator element) in addition to any color change;
   - is a ≥44×44px target (e.g. `min-h-11 min-w-11` with padding), full-height,
     sharing the bar width evenly (`flex-1`);
   - shows a visible focus ring (`focus-visible:outline`/ring utilities), never
     `outline-none` without a replacement.
   The `<nav>` itself is fixed to the bottom, full width
   (`fixed inset-x-0 bottom-0`), above content.
2. `(app)/layout.tsx` — the shell **server component**. Renders
   `<main>{children}</main>` with bottom padding equal to the nav height (so
   content is not occluded), followed by `<BottomNav />`.
3. `(app)/home/page.tsx` — placeholder: `<h1>Home</h1>` + one descriptive line.
4. `(app)/journey/page.tsx` — placeholder: `<h1>Journey</h1>` + one descriptive
   line. (Rename the folder to `discover` if the adopter substitutes `/discover`
   per `VOC-017-D01`; update the matching `BottomNav` href.)
5. `(app)/progress/page.tsx` — placeholder: `<h1>Progress</h1>` + one descriptive
   line.

Ordered steps (single task, `VOC-017-T00`): create file 1 (the nav component),
then file 2 (the shell layout that renders it), then files 3–5 (the placeholder
pages the layout wraps). Keep everything within `apps/web/src/**`; introduce no
dependency and no `package.json`/lockfile change.

## Validation and independent verification

Deterministic commands (run from repo root):

```bash
pnpm run lint:web
pnpm run typecheck:web
pnpm run build:web
pnpm run format:check
```

(`build:web` proves all three routes compile and resolve; `typecheck:web` covers
the `next typegen && tsc --noEmit`; `format:check` includes `apps/web` in its
prettier target set.)

Independent verification (exact-SHA, per `CLAUDE.md`): the reviewer confirms the
three routes resolve under `(app)`; the shell layout renders `BottomNav` + a
`<main>` on every tab; `BottomNav` has exactly three correctly-targeted links in
order; and each item of the `VOC-017-AC-02` accessibility checklist holds
(semantic named `<nav>`, text labels, `aria-current` + non-color active cue,
visible focus, ≥44px targets) and `VOC-017-AC-03` mobile-first layout holds. The
verifier explicitly notes the automated-a11y limitation (`VOC-017-D08`), confirms
the root `/` page and root layout are unchanged, confirms no dependency/lockfile
change, binds the verdict to the exact reviewed commit SHA, and confirms the
implementer did not self-approve or self-merge.

## Deployment and rollback

`release.deployment: prohibited`. Merging the implementation to `develop` is the
entire scope; a merged package does not authorize any production deployment.
Rollback is a plain `git revert` of the merge commit — the shell adds only
front-end files and nothing depends on it yet. Last-known-good reference is
`develop` at this package's (adoption-time re-pinned) `base_sha`.
