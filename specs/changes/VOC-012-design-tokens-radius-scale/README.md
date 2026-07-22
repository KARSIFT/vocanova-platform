# VOC-012 — Design Tokens: Border Radius Scale

`implementation-ready`; repository-file work only; issue #6.

## Identity and lifecycle

- Package ID: `VOC-012`
- Canonical path: `specs/changes/VOC-012-design-tokens-radius-scale/`
- Risk: R1 (path-detected floor per `scripts/governance/classify-change-risk.sh`
  — `packages/design-tokens/src/*` matches no R2/R3/R4 pattern)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Authority issue: [#6](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/6)
- Target branch: `develop`

## Objective and requirement source

Continues the design-tokens foundation started in VOC-010 (spacing, neutral
color) and VOC-011 (typography). This package adds a typed border-radius
scale as the fourth primitive.

Requirement source: issue #6, founder-approved.

## Scope, non-goals, risk, and protected areas

In scope: a single typed `radius` scale object, exported from
`packages/design-tokens/src/index.ts` alongside the existing `spacing`,
`neutral`, and `fontSize` exports. Non-goals: no component-level usage, no
Tailwind/CSS generation, no consumption changes in `apps/web`.

No protected areas touched. No production impact.

## Verification, approvals, release, and closure

Deterministic evidence: `pnpm run lint:packages`, `typecheck:packages`,
`build:packages`. Independent verification is exact-SHA per `CLAUDE.md`.

This package is deliberately routine and low-risk: it exists to exercise
the merge-gate's `auto_merge_enabled` path for the first time on a real,
unattended PR. No manual "approved" comment is expected to be needed if
CI is green and the reviewer's verdict is PASS or PASS WITH NON-BLOCKING
FINDINGS.
