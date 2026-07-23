# VOC-017 — Impact Analysis

## Security and privacy

None. The shell renders static placeholder markup and three navigation links. It
has no input fields, no network/API calls, no data fetching, no storage, no
cookies/tokens, no authentication or authorization surface, and no personal data.
The backend-authoritative rule (DOC-03 §1) is not engaged because nothing here
displays or invents progress/mission/scheduling state. No secrets are introduced.

## Data and migrations

None. No database, schema, migration, or persisted state of any kind. Purely
additive front-end files under `apps/web/src/**`. Rollback is a plain
`git revert` of the merge commit with no data implications.

## Analytics and accessibility

- **Analytics:** none — a placeholder navigation shell emits no analytics events.
- **Accessibility:** in scope and central. The package is specified to meet
  DOC-03 §7/§10/§12 and DOC-08 Quality standards (WCAG 2.2 AA intent): semantic
  `<nav>` with an accessible name, visible text labels (not icon-only), active
  tab conveyed by `aria-current="page"` plus a non-color cue (no color-alone),
  keyboard operability with a visible focus indicator, and 44×44px minimum touch
  targets — see `acceptance-criteria.md` `VOC-017-AC-02`/`AC-03`. Honest
  limitation: with no web test runner yet (`VOC-017-DEP-05`), AA conformance is
  verified here by construction plus the structured inspection checklist in
  `test-plan.md`, not by automated axe/Playwright assertions; adding that
  automated coverage is a flagged follow-up (`VOC-017-D08`), not a silently
  skipped requirement.

## Risks, dependencies, and evidence

- `VOC-017-R00` (Low): The nav is a persistent shell element rendered on every
  tab; a mistake (wrong href, missing `aria-current`, focus outline suppressed,
  sub-44px target) would affect all tabs at once. Mitigated by the explicit
  per-item accessibility checklist (`VOC-017-AC-02`) and reviewer inspection.
- `VOC-017-R01` (Medium, scoping): "navigation shell only" is easy to overrun
  into real content, data fetching, or auth. The spec draws hard non-goals
  (`specification.md` Scope and non-goals) and the single-task boundary keeps the
  PR to ~5 small files under `apps/web/src/**`; the verifier should reject any
  backend/API/content creep.
- `VOC-017-R02` (design decision, not correctness): the Journey tab route name is
  a genuine DOC-03-vs-DOC-08 reconciliation, recorded not silently resolved
  (`VOC-017-D01`). `/journey` is proposed; `/discover` is the DOC-08 alternative.
  Only one route folder + one nav href depend on the choice.
- `VOC-017-R03` (accessibility semantic risk): as the first user-facing UI, this
  is where WCAG regressions would first appear. The path floor is R1, but the
  independent verifier must review accessibility as a real dimension per
  `CLAUDE.md`, and the automated-a11y gap is acknowledged (`VOC-017-D08`).
- `VOC-017-DEP-01`: Requirement must reach a founder-approved,
  implementation-ready state at adoption. There is no originating issue; an
  approved design document is not by itself implementation authority
  (`AGENTS.md`). This draft is not implementation authority on its own.
- `VOC-017-DEP-02`: Base state (`base_sha`) is pinned to the drafting-time
  `develop` head (`f5b920f8b6aa31565b66b03972b73ed6f0360c7b`) and must be re-pinned
  to the then-current `develop` head at adoption.
- `VOC-017-DEP-03`: Depends on the existing Next.js web foundation on `develop`
  (App Router under `apps/web/src/app`, Tailwind via `globals.css`,
  `lint:web`/`typecheck:web`/`build:web` scripts) — all present at drafting time.
- `VOC-017-DEP-04`: Journey tab route name open for founder decision
  (`VOC-017-D01`).
- `VOC-017-DEP-05`: No `apps/web` test runner exists; automated a11y/component
  testing is a required follow-up, not part of this shell.
- `VOC-017-EV-00`..`VOC-017-EV-03`: CI run output (lint/typecheck/build/format)
  plus the independent reviewer's exact-SHA verdict, produced at implementation
  time, not now.
