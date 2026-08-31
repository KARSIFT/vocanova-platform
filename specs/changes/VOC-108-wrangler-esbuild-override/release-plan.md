# VOC-108 — Release Plan

## Release and deployment authorization

This is a repository-only dependency-resolution correction into `develop`; it has no
release, staging, or production deployment. Merging a reviewed implementation PR
does not dispatch a workflow, call Cloudflare, migrate D1, or change traffic.

## Preconditions and outcome

Before merge, require the exact two-file diff, frozen-install and deterministic
resolution evidence, local-stack and workspace validation, governance checks, and
separate exact-SHA dependency/local-runtime specialist and independent R3 PASS
reviews. Issue #196 may close only after the exact implementation is merged and
hosted required validation provides the required evidence.

## Rollback

If resolution, local-stack validation, or hosted CI regresses, stop and use a
separately reviewed revert PR restoring `pnpm-workspace.yaml` and `pnpm-lock.yaml` to
the last known good revision. Rerun frozen-install, resolution, local-stack, and
governance checks. This rollback is repository-only and grants no external action.

## Independent verification and closure

Record the reviewers' distinct actor identities, exact SHA, verdicts, and resolved
findings. No risk class creates a personal approval gate; no reviewer or repository
merge satisfies a separately defined external-action authority. EHR remains
untriggered unless an unresolved critical or high finding requires escalation.
