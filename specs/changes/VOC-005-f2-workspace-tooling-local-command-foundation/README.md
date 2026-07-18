# VOC-005 — F2 Workspace, Tooling, and Local Command Foundation

## Identity and lifecycle

- Change ID: `VOC-005`
- Status: `implementation-ready`
- Package-adoption risk: `R3`
- Expected implementation risk floor: `R3`, subject to the actual implementation diff
- Requirement source: founder-approved GitHub issue #14
- Base branch: `develop`
- Exact grounded base: `76d5ab47cd847a5634f3b8f429247726bd72a579`
- Canonical path:
  `specs/changes/VOC-005-f2-workspace-tooling-local-command-foundation`

PR #15 adopted the exact package candidate
`271c3e9fe0f202f468995c0af5a87c729186b746` into canonical `develop` at
`84e096c35bc811c276ce29dc2ecc7dd967983e4b` after strengthened applicable R3
controls and exact-revision Claude Code verification returned `PASS`. VOC-005 is now
implementation authority for only the bounded work below through active issue #14;
it grants no merge, deployment, release, production, or autonomous-development
authority.

## Objective

Authorize one bounded F2 implementation slice: create the approved monorepo/workspace
skeleton and root developer-command/tooling foundation for `F2-I01` and `F2-I02`.
The canonical application roots are `apps/web` and `apps/api`; shared JavaScript and
TypeScript packages live under `packages/`. The Go backend remains outside the pnpm
workspace model while coexisting in the same repository.

## Approved boundaries

The implementation establishes only workspace structure, explicit tool versions,
root commands, minimal buildable/testable skeletons, required local configuration,
documentation, dependency controls, and deterministic validation. It does not add
product behavior, authentication, database domain schema, business APIs, production
infrastructure, deployment, autonomous-development capability, or later F2 work.

No new frontend-framework decision is made here. The minimal web skeleton must not
select, replace, or upgrade a product framework beyond canonical approval. If a
framework-specific scaffold would be required without canonical evidence, the
implementation stops and requests a separate approved decision.

## Risk, verification, and adoption

This package PR modifies the protected R3 `specs/README.md` path, so its effective
risk is R3. The later implementation is expected to reach at least R3 because the
approved `infra/` and backend `migrations/` foundations are protected paths; its final
risk is the highest path, semantic, builder, verifier, security, or authority
assessment of the actual diff.

Package adoption completed through PR #15 after deterministic validation, applicable
hosted R3 controls, and exact-SHA Claude Code verification with no finding. Active
A-003 did not require standing founder or technical-steward approval merely because
this was routine R3; EHR was not triggered. The adoption and its evidence grant no
automatic merge, deployment, release, or autonomous-development activation.
