# VOC-016 — Three-Tab Bottom Navigation Shell (Home / Journey / Progress): Specification

## Objective and requirement source

Implement the persistent three-tab bottom navigation described in DOC-03 §2 —
**Home / Journey / Progress** — as the top-level `apps/web` App Router shell:
route scaffolding plus the persistent bottom-navigation component, with
placeholder content per tab. Mobile-first per DOC-08 (Quality standards) and
DOC-03 §10/§12: 360–430px viewport target, 44px minimum touch targets, visible
focus states, keyboard operability, screen-reader-friendly labels, WCAG 2.2 AA
intent, and no information conveyed by color alone.

Requirement source: the free-text planner request, grounded in the approved
design documents DOC-03 (`docs/design/03-ui-ux-design.md`, §2 information
architecture and §10 accessibility) and DOC-08 (`docs/design/08-web-app-design.md`,
Routing and Quality standards). No originating GitHub issue exists for this
request. Per `AGENTS.md`, an approved design document describes target UX but is
not itself implementation authority for a specific change; a founder-approved,
implementation-ready state must be recorded at adoption. This document is a
draft, not an approved specification.

## Scope and non-goals

In scope (all files under `apps/web/src/`):
- A Next.js App Router **route group `(app)`** containing a shared shell layout
  and the three tab routes, consistent with DOC-08's route-group model
  (`(public)`, `(onboarding)`, `(app)`).
- A **shell layout** (`(app)/layout.tsx`) that renders a `<main>` content region
  and the persistent `BottomNav`, present on every tab route.
- Three **placeholder tab routes**: Home (`/home`), Journey (`/journey`),
  Progress (`/progress`), each rendering a heading and short descriptive
  placeholder text — no real content.
- One accessible **`BottomNav`** component with three links (Home / Journey /
  Progress) meeting the accessibility and touch-target requirements.

Explicitly excluded: any backend/API integration or data fetching; real tab
content; the reusable sentence-practice component (DOC-03 §2 — deliberately a
component, not a tab); authentication or onboarding gating; the deeper routes
DOC-08 lists (`/discover`, `/words`, `/words/[userWordId]`, `/review`,
`/review/session`, `/settings`, `/settings/account`); any new runtime dependency
or `package.json`/lockfile change; shadcn/ui scaffolding beyond the Tailwind
already present; any change to the existing root `/` foundation page; and any
sentence-history route (DOC-03 §2 / DOC-08 explicitly forbid one).

## Risk and protected areas

Proposed risk: **R1**. Every target path is under `apps/web/src/**`, which the
path classifier maps to its `*` default (R1); no target matches an R2/R3/R4
pattern (no `package.json`, no `*/auth/*`, no `*/migrations/*`, no governance or
CI-workflow path). This is a draft proposal — `classify-change-risk.sh` and a
human's judgment govern the actual class at implementation time.

Semantic note (does **not** change the path floor, but the independent verifier
must review it per `CLAUDE.md`): this is the first genuinely user-facing UI
surface, and accessibility (WCAG 2.2 AA) is a stated requirement of DOC-03 §10.
The verifier should treat the accessibility acceptance criteria as a real review
dimension, not a formality. No protected areas are touched.

## Decisions, contradictions, security, and privacy

`VOC-016-D00` — **Route-group structure.** The shell is a Next.js App Router
route group `apps/web/src/app/(app)/` containing `layout.tsx` (the shared shell)
and one folder per tab. This matches DOC-08's declared route groups
(`(public)`, `(onboarding)`, `(app)`) and keeps the shell layout scoped to the
authenticated app tabs, leaving the root layout and the `/` foundation page
untouched. The route-group segment `(app)` is not part of the URL path.

`VOC-016-D01` — **Tab routes = `/home`, `/journey`, `/progress`** (OPEN DECISION,
`VOC-016-DEP-04`). The three tab names come verbatim from DOC-03 §2. `/home` and
`/progress` match DOC-08's routing table directly. The **Journey** tab is the
contradiction to record, not silently resolve: DOC-03 §2 names the tab
"Journey" (situation-based discovery **and** saved-word management), while DOC-08's
routing table decomposes that same area into two deeper routes, `/discover` and
`/words`. For a *shell* with placeholder content, this draft proposes a single
`/journey` route matching the DOC-03 tab name, to be reconciled with DOC-08's
`/discover`+`/words` when the real Journey content package lands (that package can
route the Journey tab at `/discover` or nest `/words` under it). A human should
confirm `/journey` or substitute `/discover` at adoption; if substituted, only the
route folder name and the `BottomNav` href for that one tab change — the shell
structure, layout, accessibility, and tests are unaffected.

`VOC-016-D02` — **Component split.** The shell `layout.tsx` is a **server
component** (no client state). `BottomNav` is a **client component**
(`"use client"`) because it reads the active route via `usePathname()` to mark
the current tab. `BottomNav` is colocated at
`apps/web/src/app/(app)/_components/bottom-nav.tsx` (Next.js `_`-prefixed private
folder, not routable). DOC-08's architecture reserves `src/shared/` for
components shared across features; since the shell nav is currently consumed only
by the `(app)` layout, colocation is appropriate now, and it can move to
`src/shared/` when a second consumer appears.

`VOC-016-D03` — **Accessibility implementation** (DOC-03 §7/§10/§12, DOC-08
Quality standards). The nav is a semantic `<nav>` with an accessible name (e.g.
`aria-label="Primary"`). Each tab is a Next `<Link>` rendering a **visible text
label** (not icon-only), so screen-reader and sighted users get the same label;
if a decorative icon is added later it must not become the sole label. The active
tab is marked with `aria-current="page"` **and** a non-color visual cue (e.g.
font weight and/or an underline/indicator bar) so state is never conveyed by
color alone. Every interactive target is at least **44×44px** (e.g. Tailwind
`min-h-11 min-w-11` with adequate padding). Focus is keyboard-operable with a
**visible focus indicator** (e.g. `focus-visible:` ring utilities), never
suppressed. The bottom nav is fixed to the bottom of the viewport for one-handed
thumb reach (DOC-03 §12), and the `<main>` region reserves bottom spacing so
content is never occluded by the fixed bar.

`VOC-016-D04` — **Placeholder content.** Each tab route renders a single `<h1>`
naming the tab and one short line describing what will appear there (in the
spirit of DOC-03 §9's "explain what will appear here" empty states, without
implying any real/loaded state). No backend, no data, no interactivity beyond the
nav links.

`VOC-016-D05` — **Styling.** Plain Tailwind (v4, already wired via
`apps/web/src/app/globals.css`'s `@import "tailwindcss"`). shadcn/ui is DOC-08's
eventual component system but is **not scaffolded yet**; this shell deliberately
does not introduce it, to keep the change to `apps/web/src/**` only with no
dependency change. Flagged so a human can decide whether to defer shadcn adoption
to a separate foundation package (recommended).

`VOC-016-D06` — **Root `/` untouched** (OPEN, optional). The existing
`apps/web/src/app/page.tsx` foundation page and root `layout.tsx` are left
unchanged; no `/` → `/home` redirect is added. The shell is reachable directly at
`/home`, `/journey`, `/progress`. A human may prefer a redirect; if desired it is
a one-line follow-up and does not change this package's structure.

`VOC-016-D07` — **Single task.** The route group, shell layout, three placeholder
pages, and `BottomNav` form one tightly-coupled, minimal shell — a nav with no
routes, or routes with no shell layout, is a non-functional half-state. Per the
VOC-010→VOC-015 precedent (each PR is reviewed against the whole package's
acceptance criteria), splitting this cohesive shell across multiple per-task PRs
would fail whole-package review; it is delivered as one task in one PR of ~5
small files.

`VOC-016-D08` — **Verification without a web test runner** (OPEN,
`VOC-016-DEP-05`). `apps/web` currently has no Vitest/RTL/Playwright setup (the
root `test` script runs only foundation and Go tests). Accessibility and
structure are therefore verified by `build`/`typecheck`/`lint`/`format` plus the
structured code-inspection checklist in `test-plan.md`. Automated a11y testing
(axe-core via Playwright, per DOC-08) is called out as a **required follow-up
package**, not folded into this shell — adding a test runner would pull in
`package.json`/lockfile changes (raising the path floor to R2) and exceed the
"shell only" scope.

No security, secrets, authorization, or personal-data impact: the shell renders
static placeholder markup with no input, network, storage, or auth surface.
Backend-authoritative rules (DOC-03 §1) are not engaged because nothing here
fetches or displays progress/state.

## Data, migrations, analytics, and accessibility

- **Data / migrations:** none. No storage, no schema, no migration. Rollback is a
  plain `git revert`.
- **Analytics:** none. No events are emitted by a navigation shell with
  placeholder content.
- **Accessibility:** in scope and central to this package — see `VOC-016-D03`,
  `acceptance-criteria.md` (`VOC-016-AC-02`), and the accessibility checklist in
  `test-plan.md`. Target is WCAG 2.2 AA per DOC-03 §10; the honest limitation is
  that AA is verified here by construction + inspection, with automated
  axe/Playwright coverage flagged as the required follow-up (`VOC-016-D08`).
