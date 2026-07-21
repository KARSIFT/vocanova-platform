# VOC-013 — Design Tokens: Motion Scale (Duration + Easing)

`implementation-ready`; repository-file work only; issue #7.

## Identity and lifecycle

- Package ID: `VOC-013`
- Canonical path: `specs/changes/VOC-013-design-tokens-motion-scale/`
- Risk: R1 (path-detected floor per `scripts/governance/classify-change-risk.sh`
  — `packages/design-tokens/src/*` matches no R2/R3/R4 pattern)
- Owner (decision): founder (m-e-h-r-d-a-a-d)
- Authority issue: [#7](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/7)
- Target branch: `develop`

## Objective and requirement source

Continues the design-tokens foundation started in VOC-010/011/012. This
package adds typed motion tokens — a duration scale and an easing-curve
scale — as the fifth and sixth primitives.

Requirement source: issue #7, founder-approved.

## Scope, non-goals, risk, and protected areas

In scope: typed `duration` and `easing` scale objects, both exported from
`packages/design-tokens/src/index.ts` alongside the existing `spacing`,
`neutral`, `fontSize`, and `radius` exports. Non-goals: no animation
implementation, no component usage, no consumption changes in `apps/web`.

No protected areas touched. No production impact.

## Process note: this package is a deliberate two-task split

Unlike VOC-011/VOC-012, this package's `tasks.md` intentionally keeps two
tasks (`VOC-013-T00` for `duration` only, `VOC-013-T01` for `easing` plus
wiring both into the entry point) instead of consolidating them — the same
shape VOC-010 originally used before a real review FAIL led to
consolidating it into one task. Only `VOC-013-T00` is dispatched first, on
purpose: the acceptance criteria require both `duration` and `easing` to be
exported, so a `VOC-013-T00`-only PR is reviewed against the whole
package's acceptance criteria and is expected not to pass. This exercises
`remediate.yml`'s automatic retry-after-FAIL path, which has never fired on
a real run. If the retry (attempt 2 of `VOC-013-T00`) does the full
remaining work needed to satisfy `acceptance-criteria.md`, it should pass.

## Verification, approvals, release, and closure

Deterministic evidence: `pnpm run lint:packages`, `typecheck:packages`,
`build:packages`. Independent verification is exact-SHA per `CLAUDE.md`.
Human "approved" comment still required to merge
(`automatic_merge_allowed: false`).
