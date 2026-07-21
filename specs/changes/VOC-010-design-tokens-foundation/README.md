# VOC-010 — Design Tokens Foundation: Initial Spacing and Color Scale

`implementation-ready`; repository-file work only; issue #1.

## Identity and lifecycle

- Package ID: `VOC-010`
- Canonical path: `specs/changes/VOC-010-design-tokens-foundation/`
- Risk: R1 (path-detected floor per `scripts/governance/classify-change-risk.sh` —
  `packages/design-tokens/src/*` matches no R2/R3/R4 pattern and falls to the R1
  default)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Authority issue: [#1](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/1)
- Target branch: `develop`

## Objective and requirement source

`packages/design-tokens` was scaffolded in VOC-005 but deliberately left empty —
`src/index.ts` is `export {};` with a comment stating product visual tokens were
out of scope for that package. This package authorizes a first, minimal, additive
set of tokens (a spacing scale and a neutral color palette) so the package
actually exports something consumable, without making any product-specific design
decision.

Requirement source: issue #1, founder-approved.

## Scope, non-goals, risk, and protected areas

In scope: typed spacing scale, typed neutral color palette, both exported from
`packages/design-tokens/src/index.ts`.

Non-goals: no consumption changes in `apps/web`, no brand/product color palette,
no CSS custom property or Tailwind config generation. Those are separate,
not-yet-authorized packages.

No protected areas (per `AGENTS.md`/`CLAUDE.md`) are touched. No production impact —
this package is not deployed or activated by anything.

## Verification, approvals, release, and closure

Deterministic evidence: `pnpm run lint:packages`, `pnpm run typecheck:packages`,
`pnpm run build:packages` must all pass against the new files. Independent
verification is exact-SHA per `CLAUDE.md`. No R3/R4 founder approval is required
under active A-003 for routine R1 work; the karsift-ai-infra merge-gate still
requires a human "approved" comment to merge, regardless of declared risk, since
`automatic_merge_allowed` is false for this package.
