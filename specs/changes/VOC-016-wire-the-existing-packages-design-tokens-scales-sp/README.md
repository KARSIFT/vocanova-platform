# VOC-016 — Wire design-token scales into apps/web (Tailwind v4 @theme)

**Draft package — not adopted, not approved, not implementation authority.**
Prepared by the planner role from the free-text request and the approved web
design document DOC-08 (`docs/design/08-web-app-design.md`). A human must review
and adopt it (and record a founder-approved, implementation-ready state) before
any implementation.

## Identity and lifecycle

- Package ID: `VOC-016`
- Canonical path:
  `specs/changes/VOC-016-wire-the-existing-packages-design-tokens-scales-sp/`
- Lifecycle state: `draft` (unadopted; see `change.yaml`)
- Proposed risk: **R2** (draft proposal only — the authoritative floor is
  whatever `scripts/governance/classify-change-risk.sh` computes at
  implementation time. The change edits `package.json` files and
  `pnpm-lock.yaml`, which the classifier maps to R2; the CSS/script files map to
  R1. No R3/R4 path is touched **as long as the implementation does not edit
  `.github/workflows/*`** — see the design note in `specification.md` about
  keeping the drift check inside existing pnpm scripts so CI picks it up without
  a workflow edit.)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Requirement source: DOC-08 (approved web-app design) plus the free-text scoping
  request. DOC-08 authorizes a Tailwind + design-token foundation for `apps/web`;
  this package is the specific, adoptable change that realizes the token→CSS
  wiring layer. An approved document is not itself implementation authority — a
  founder-approved implementation-ready state must still be recorded at adoption
  (`AGENTS.md`).
- Target branch: `develop`

## Objective and requirement source

`packages/design-tokens` today exports eight typed scales — `spacing`, `neutral`,
`brand` (`primary`/`secondary`), `fontSize`, `radius`, `duration`, `easing`, and
`elevation` (VOC-010 → VOC-015) — but `apps/web` consumes **none** of them: it
uses raw Tailwind utility classes only and imports nothing from
`@vocanova/design-tokens`. This package builds the missing **token-to-CSS wiring
layer** so components can actually consume the tokens through Tailwind v4
`@theme` custom properties, keeping `packages/design-tokens` the single source of
truth. It adds **no new UI screens, routes, or components** — only the wiring.

Note: the request mentioned a `feedback` scale "if adopted"; no such scale exists
in `packages/design-tokens`, so it is explicitly out of scope
(`VOC-016-DEP-05`).

## Scope, non-goals, risk, and protected areas

In scope:
- Make `@vocanova/design-tokens` importable by name (add `main`/`types`/`exports`
  to its `package.json`), and declare it as a dependency of `apps/web`.
- Emit the eight scales as Tailwind v4 `@theme` CSS custom properties consumed by
  `apps/web/src/app/globals.css`, per the namespace-mapping table in
  `specification.md`.
- A deterministic **drift check** binding the emitted CSS to the TS token
  objects, wired into an existing root pnpm script so CI enforces it **without
  editing any `.github/workflows/*` file**.

Non-goals: no new routes/screens/components; no semantic alias tokens (`text`,
`surface`, `success`, `danger`); no dark-mode variants; no change to any token
*value* in `packages/design-tokens/src/*`; no `feedback` scale; no deployment.

Protected areas: none touched by the recommended design. The change is
presentational wiring only — no auth, authorization, migrations, secrets, or
personal data.

## Verification, approvals, release, and closure

Deterministic evidence (at implementation time): `pnpm run lint`,
`pnpm run typecheck`, `pnpm run test` (which runs the new drift check),
`pnpm run build`, and `pnpm run format:check`. Independent verification is
exact-SHA per `CLAUDE.md`, checking every token value against its emitted custom
property byte-for-byte and confirming no token value in
`packages/design-tokens/src/*` was altered. Because this is a draft, no approval,
merge, or release authority is claimed here; those gates remain closed in
`change.yaml` and are a human's decision at adoption.
