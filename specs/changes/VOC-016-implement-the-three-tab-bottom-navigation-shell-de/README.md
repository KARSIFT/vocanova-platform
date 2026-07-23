# VOC-016 — Three-Tab Bottom Navigation Shell (Home / Journey / Progress)

**Draft package — not adopted, not approved, not implementation authority.**
Prepared by the planner role from a free-text request grounded in the approved
design documents DOC-03 (`docs/design/03-ui-ux-design.md`) and DOC-08
(`docs/design/08-web-app-design.md`). A human must review, resolve the open
decisions below, and adopt this package (recording a founder-approved,
implementation-ready state) before any implementation.

## Identity and lifecycle

- Package ID: `VOC-016`
- Canonical path:
  `specs/changes/VOC-016-implement-the-three-tab-bottom-navigation-shell-de/`
- Lifecycle state: `draft` (unadopted; see `change.yaml` — every
  adoption/authorization gate is left at its unadopted default)
- Proposed risk: R1 (draft proposal only — the authoritative floor is whatever
  `scripts/governance/classify-change-risk.sh` computes at implementation time.
  All target files live under `apps/web/src/**`, which matches no
  R2/R3/R4 path pattern, so R1 is the expected path-detected floor. Accessibility
  compliance is a real *semantic* review dimension the independent verifier must
  check per `CLAUDE.md`, even though it does not raise the path floor.)
- Owner (decision): founder
- Requirement source: the free-text planner request, grounded in DOC-03 §2
  (three-tab IA), §10 (accessibility, WCAG 2.2 AA), and DOC-08 (Routing;
  Quality standards — mobile-first 360–430px, 44px touch targets). There is no
  originating GitHub issue for this request; a founder-approved,
  implementation-ready state must still be recorded at adoption — an approved
  design document describes the target UX but is not, by itself, implementation
  authority for a specific change package (`AGENTS.md`).
- Target branch: `develop`

## Objective and requirement source

Build the **navigation shell only** for the VocaNova web app: the persistent
three-tab bottom navigation (Home / Journey / Progress) described in DOC-03 §2,
implemented as a top-level `apps/web` App Router shell layout with route
scaffolding and placeholder content per tab. Mobile-first per DOC-08 Quality
standards and DOC-03 §10/§12 (360–430px viewport target, 44px minimum touch
targets, visible focus states, keyboard operability, WCAG 2.2 AA intent, no
information by color alone).

Explicitly **not** in this package: any backend integration, real tab content,
authentication/onboarding gating, the reusable sentence-practice component, or
the deeper routes DOC-08 lists (`/discover`, `/words`, `/words/[userWordId]`,
`/review`, `/review/session`, `/settings`, …). This is the shell the later
feature packages hang their content on.

## Scope, non-goals, risk, and protected areas

In scope (all under `apps/web/src/`):
- A Next.js App Router route group `(app)` with a shared shell layout that renders
  a persistent bottom navigation plus a `<main>` content region.
- Three placeholder tab routes: Home, Journey, Progress.
- One accessible `BottomNav` component (client component — needs the active
  pathname).

Non-goals: no backend/API calls, no data fetching, no real tab content, no
sentence-practice component, no auth/onboarding, no additional routes, no new
runtime dependency, no `package.json`/lockfile change, no design-token or shadcn
scaffolding beyond the Tailwind already present, no change to the root `/`
foundation page.

No protected areas touched (no `auth`, `payments`, `migrations`, governance, or
CI-workflow paths). No production impact (merge-to-`develop` only; deployment
remains prohibited).

## Open decisions for the human adopter (see `specification.md`)

1. **Journey tab route name.** DOC-03 §2 names the second tab **Journey**; DOC-08's
   routing table instead lists `/discover` and `/words` (Journey decomposed into
   two deeper routes). This draft proposes a single `/journey` route for the shell
   tab now, reconciled with DOC-08's `/discover`+`/words` when real Journey content
   lands. A human should confirm `/journey` or pick `/discover`.
2. **Root `/` behaviour.** This draft leaves the existing `/` foundation page
   (from the Next.js foundation work) untouched and does not redirect it to
   `/home`. A human may prefer a `/` → `/home` redirect; flagged as optional.
3. **Web test infrastructure.** `apps/web` has no test runner yet
   (no Vitest/RTL/Playwright). This draft verifies accessibility by structured code
   inspection plus `build`/`typecheck`/`lint`, and flags automated a11y testing
   (axe-core via Playwright, per DOC-08) as a required follow-up package rather
   than expanding this shell's scope.

## Verification, approvals, release, and closure

Deterministic evidence (at implementation time): `pnpm run lint:web`,
`pnpm run typecheck:web`, `pnpm run build:web`, and `pnpm run format:check`.
Independent verification is exact-SHA per `CLAUDE.md`, covering route resolution,
the persistent-nav contract, and the accessibility checklist in
`acceptance-criteria.md`. Because this is a draft, no approval, merge, or release
authority is claimed here; those gates stay closed in `change.yaml` and are a
human's decision at adoption.
