# VOC-005 Implementation Plan

## Preconditions and stop conditions

Implementation must not begin until this exact package candidate has passed local and
hosted validation, received exact-SHA Claude verification with no blocking finding,
satisfied applicable R3 controls, and merged into canonical `develop`. Re-verify live
`develop`, issue #14, applicable instructions, package lifecycle, and all target paths
before editing.

Stop and request new authority if implementation would require a product feature,
framework selection/change without canonical evidence, task runner, production
integration, executable migration, schema, auth, deployment, governance weakening,
or any scope not traceable to VOC-005.

## File reconciliation and sequence

1. Inventory the current tree and preserve compatible work.
2. Create `apps/web`, `apps/api`, and only the four approved shared package roots.
3. Establish the minimal tracked Go modular-monolith directories under `apps/api`.
4. Add root pnpm workspace/package configuration without including the Go backend.
5. Select and record supported stable exact Node.js, pnpm, Go, and dependency versions;
   generate and commit the frozen lockfile.
6. Add minimal workspace manifests/configuration and real web/API compile/test
   scaffolding with no product behavior.
7. Wire simple root development, validate, lint, type-check, test, build, format-check,
   format, and audit commands, omitting capabilities that do not yet exist.
8. Add only necessary ignore/editor/local configuration and concise contributor docs.
9. Add deterministic F2 validation and negative failure-propagation coverage without
   weakening existing governance validation.
10. Run every applicable check from a clean state, inspect the full diff, classify the
    actual paths and semantics, and open a separate draft implementation PR.

## Validation and independent verification

The implementation PR must record exact versions and execute the commands defined by
its committed root manifests, plus all tests in `test-plan.md`. Claude Code reviews
the actual repository diff, issue #14, this package, command output, dependency and
security impact, and exact candidate SHA independently. Any valid blocking correction
requires full affected validation and a new exact-SHA review.

## Deployment and rollback

No deployment or release exists. Codex must not merge or enable auto-merge. Before
merge, abandon by closing the implementation PR. After an authorized merge, revert
the implementation squash commit through a governed PR and rerun the prior governance
baseline. No database, user-data, secret, environment, or production rollback applies.
