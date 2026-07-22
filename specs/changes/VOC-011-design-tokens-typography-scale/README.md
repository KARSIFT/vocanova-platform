# VOC-011 — Design Tokens: Typography Scale

`implementation-ready`; repository-file work only; issue #4.

## Identity and lifecycle

- Package ID: `VOC-011`
- Canonical path: `specs/changes/VOC-011-design-tokens-typography-scale/`
- Risk: R1 (path-detected floor per `scripts/governance/classify-change-risk.sh`
  — `packages/design-tokens/src/*` matches no R2/R3/R4 pattern)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Authority issue: [#4](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/4)
- Target branch: `develop`

## Objective and requirement source

Continues the design-tokens foundation started in VOC-010 (spacing scale,
neutral color palette). This package adds a typed typography size scale —
a geometric progression with a fixed ratio — as the third primitive.

Requirement source: issue #4, founder-approved.

## Scope, non-goals, risk, and protected areas

In scope: a single typed `fontSize` scale object, exported from
`packages/design-tokens/src/index.ts` alongside the existing `spacing` and
`neutral` exports. Non-goals: no line-height, font-weight, or font-family
tokens; no consumption changes in `apps/web`.

No protected areas touched. No production impact.

## Verification, approvals, release, and closure

Deterministic evidence: `pnpm run lint:packages`, `typecheck:packages`,
`build:packages`. Independent verification is exact-SHA per `CLAUDE.md`.
Human "approved" comment still required to merge (`automatic_merge_allowed:
false`), matching VOC-010.
