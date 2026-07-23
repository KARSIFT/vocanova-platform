# VOC-016 — Tasks

## VOC-016-T00 — Build the three-tab bottom-navigation shell

- Requirement source: `VOC-016-D00`, `VOC-016-D01`, `VOC-016-D02`, `VOC-016-D03`,
  `VOC-016-D04`
- Acceptance criteria: `VOC-016-AC-00`, `VOC-016-AC-01`, `VOC-016-AC-02`,
  `VOC-016-AC-03`, `VOC-016-AC-04`
- Tests: `VOC-016-TEST-00`, `VOC-016-TEST-01`, `VOC-016-TEST-02`,
  `VOC-016-TEST-03`
- Evidence: `VOC-016-EV-00`, `VOC-016-EV-01`, `VOC-016-EV-02`, `VOC-016-EV-03`
- Status: pending

Single task (per `VOC-016-D07` and the VOC-010→VOC-015 precedent: the route
group, shell layout, `BottomNav`, and three placeholder pages are one
tightly-coupled minimal shell — a nav without routes, or routes without the shell
layout, is a non-functional half-state, and each PR is reviewed against the whole
package's acceptance criteria). It is a small, single-PR change (~5 files, all
under `apps/web/src/**`).

Steps:

1. Create `apps/web/src/app/(app)/_components/bottom-nav.tsx` — a `"use client"`
   `BottomNav` that renders a semantic, accessibly-named `<nav>` fixed to the
   bottom, containing three `<Link>`s (Home→`/home`, Journey→`/journey`,
   Progress→`/progress`, in order). Each link: visible text label;
   `aria-current="page"` when active (via `usePathname()`); a non-color active
   cue in addition to any color; ≥44×44px target (`min-h-11 min-w-11` + padding,
   `flex-1`); visible focus indicator. Satisfies `VOC-016-AC-02`.
2. Create `apps/web/src/app/(app)/layout.tsx` — a server component rendering
   `<main>{children}</main>` (with bottom padding equal to the nav height so
   content isn't occluded) followed by `<BottomNav />`. Satisfies `VOC-016-AC-01`
   and the layout half of `VOC-016-AC-03`.
3. Create the three placeholder pages `(app)/home/page.tsx`,
   `(app)/journey/page.tsx`, `(app)/progress/page.tsx` — each an `<h1>` naming
   the tab plus one short descriptive line, no backend. Satisfies
   `VOC-016-AC-00`.
4. Verify `pnpm run lint:web`, `pnpm run typecheck:web`, `pnpm run build:web`,
   and `pnpm run format:check` all pass. Satisfies `VOC-016-AC-04`.

Scope guards: introduce no runtime dependency and no change to
`apps/web/package.json` or the lockfile; do not touch the root `/` page or root
layout; do not add data fetching, real content, auth, or any additional route.

> If the adopter substitutes `/discover` for the Journey tab
> (`VOC-016-DEP-04`), rename the `(app)/journey` folder to `(app)/discover` in
> step 3 and update the corresponding `BottomNav` href in step 1; nothing else in
> this task changes. Rollback for the whole task is a plain `git revert`.
