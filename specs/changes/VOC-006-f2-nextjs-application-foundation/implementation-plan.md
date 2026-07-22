# VOC-006 Implementation Plan

## Preconditions and stop conditions

Implementation must not begin until this exact package candidate passes deterministic
and hosted validation, receives exact-SHA Claude Code verification with no blocking
finding, satisfies applicable routine-R3 controls, and is validly merged into
canonical `develop`. Then re-verify live `develop`, issue #19, package lifecycle,
instructions, and target files.

Stop and request new authority if implementation requires F2-I04 or later work,
product/auth/API/data behavior, direct database access, a future-stack library,
frontend test harness, deployment adapter/environment, production integration,
governance weakening, unstable dependency, or any untraceable scope.

## Implementation sequence

1. Inventory the current web skeleton, root commands, shared configurations, toolchain,
   manifests, and lockfile; preserve compatible work.
2. Resolve supported stable exact framework versions from authoritative upstream
   sources and record compatibility/rationale without unrelated upgrades.
3. Replace only the bounded `apps/web` skeleton with the minimal App Router layout,
   technical page, global style entry, and approved Tailwind CSS foundation.
4. Add only required Next.js/TypeScript/lint/styling configuration and reuse shared
   configuration where coherent.
5. Wire real development, build, start, lint, and type-check behavior through existing
   workspace/root commands, ensuring failures propagate.
6. Update the manifest and lockfile reproducibly; inspect all dependency changes and
   install scripts.
7. Run clean frozen install, build, type, lint, root validation, and a bounded real
   development-server smoke test.
8. Run governance checks; inspect exact files/full diff/untracked files for scope,
   secrets, direct data access, deployment, generated clutter, and later-F2 work.
9. Classify the exact diff and publish a separate draft implementation PR without
   issue-closing syntax, merge, auto-merge, deployment, or self-approval.

## Validation and independent verification

The implementation PR records the exact commands in `test-plan.md`, actual dependency
versions and rationale, exact base/head, changed files, classifier output, hosted
checks, and rollback. Claude Code independently reviews the exact candidate, authority,
full diff, version/supply-chain effects, command honesty, exclusions, and evidence.
Any blocking correction requires affected validation and a fresh exact-SHA review.

## Deployment and rollback

There is no deployment or release. Before merge, rollback is closing the draft and
deleting its branch. After an authorized implementation squash merge, rollback is a
separately governed revert followed by frozen install and all prior application and
governance checks. No database, migration, learner-data, secret, or environment
rollback applies.
