# VOC-005 — F2 Workspace, Tooling, and Local Command Foundation

## Identity and lifecycle

- Change ID: `VOC-005`
- Status: `completed`
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
controls and exact-revision Claude Code verification returned `PASS`. That valid
adoption authorized only the bounded implementation below through issue #14.

PR #17 then implemented F2-I01 and F2-I02. Claude Code independently reviewed exact
implementation candidate `2100c6c1dc0fd70df516e7564b9dd5b5667cd60b` and returned
`PASS`; the PR was manually squash-merged into `develop` on
`2026-07-18T10:03:36Z` as canonical implementation adoption
`d7ad6066dcb3b6467b8ad8fdbce5410ffb3542f0`. Implementation is complete. Issue #14
closes only when the final lifecycle synchronization PR is validly merged. None of
these events grants deployment, release, production, later F2, or autonomous-
development authority.

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

This package PR modified the protected R3 `specs/README.md` path, so its effective
risk was R3. The implementation also reached R3 because the approved `infra/` and
backend `migrations/` foundations are protected paths; its final risk was the highest
path, semantic, builder, verifier, security, or authority assessment of the actual
diff.

Package adoption completed through PR #15 and implementation completed through PR
#17 after their respective deterministic validation, applicable hosted R3 controls,
and exact-SHA Claude Code verification. Active A-003 did not require standing founder
or technical-steward approval merely because either change was routine R3; EHR was
not triggered. The completed F2-I01/F2-I02 implementation and its evidence grant no
automatic merge, deployment, release, later F2 work, or autonomous-development
activation.
