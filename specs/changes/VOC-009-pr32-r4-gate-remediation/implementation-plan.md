# VOC-009 Implementation Plan

## Preconditions and stop conditions

No remediation implementation begins until this package candidate passes deterministic
and hosted checks, receives exact-revision independent verification with no blocking
finding, receives exact-revision founder R4 approval, and is merged by an authorized
human into canonical `develop`.

Stop for missing or changed founder direction, a non-canonical base, disputed PR #32
identity/tree evidence, any proposal to treat later evidence as retroactive approval,
an unreviewed content difference, a protected-governance edit, application/runtime or
external action, failed check, missing exact gate, or automatic merge attempt.

## Phase 1 — Package adoption

1. Verify live GitHub/repository evidence and create the complete proposed VOC-009
   package plus specs index entry.
2. Validate traceability, risk, scope, YAML, stable IDs, and repository controls.
3. Publish a draft R4 package PR, obtain exact-revision independent verification and
   founder approval, and stop for authorized human merge.
4. Synchronize package lifecycle evidence before any revert implementation begins.

## Phase 2 — Governed revert

1. Create a fresh branch from then-current `origin/develop`.
2. Revert the complete PR #32 change without editing unrelated paths or rewriting
   history.
3. Prove the exact 22 resulting paths equal PR #32 base `0ce8fd8`, validate all derived
   lifecycle/index/manifest/graph representations, and confirm protected exclusions.
4. Publish a draft R4 revert PR. Obtain exact-revision independent verification and
   founder R4 approval before an authorized human merge.
5. Verify the canonical merge and keep issue #29 open.

## Phase 3 — Fresh adoption

1. Create a new branch from the post-revert canonical `develop`.
2. Reapply the reviewed reconciliation as a fresh candidate; list and justify any
   difference from PR #32 candidate `c2154042`.
3. Re-run the full VOC-008 semantic, link, section, lifecycle, metadata, governance,
   scope, and deterministic validation suite.
4. Publish a separate draft R4 adoption PR. Obtain new exact-revision independent
   verification and founder R4 approval before an authorized human merge.

## Phase 4 — Evidence synchronization and closure

Record package, revert, and fresh-adoption candidates, reviews, approvals, merges,
final lifecycle, validation, and the original failure in a separately reviewed sync.
Close issue #29 only after that sync is canonically merged and verified.

## Rollback

Before any phase merges, close its draft and delete its branch when authorized. After
a merge, use a separately governed revert restoring the immediately previous consistent
repository state. No deployment, schema, learner-data, secret, vendor, environment, or
production recovery applies.
